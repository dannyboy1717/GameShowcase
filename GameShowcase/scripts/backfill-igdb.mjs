#!/usr/bin/env node
/**
 * Interactive IGDB backfill for games added before the IGDB integration.
 *
 * Walks every game that has no IgdbId yet, shows the top IGDB candidates, and
 * writes the one you pick. Nothing is written without an explicit choice.
 *
 * This talks to IGDB directly rather than through the igdb-search Edge
 * Function — the function exists to keep the secret out of the app bundle and
 * to work around browser CORS, neither of which applies to a local script. So
 * this works whether or not the function has been deployed.
 *
 * Prerequisite: the IgdbId / CoverUrl columns must exist. Run
 * supabase/migrations/20260809000000_add_igdb_columns.sql first.
 *
 * Usage:
 *   node scripts/backfill-igdb.mjs [--dry-run] [--limit N]
 *
 * Credentials, from the environment or supabase/.env:
 *   IGDB_CLIENT_ID, IGDB_CLIENT_SECRET
 * Supabase sign-in (prompted if unset), needed to satisfy row-level security:
 *   SUPABASE_EMAIL, SUPABASE_PASSWORD
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Same public values as app/lib/supabase.ts — the anon key is not a secret.
const SUPABASE_URL = "https://dkoreajsgmrlqvqayzsk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrb3JlYWpzZ21ybHF2cWF5enNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTQ4MTUsImV4cCI6MjA2NDM3MDgxNX0.wt0ntTsWmW3wDbTZVFxJ-v6Nfb9ueyliggY7stNEsMU";

const IGDB_IMAGE_BASE = "https://images.igdb.com/igdb/image/upload";
const CANDIDATE_LIMIT = 6;

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const limitIndex = args.indexOf("--limit");
const LIMIT = limitIndex !== -1 ? Number(args[limitIndex + 1]) : Infinity;

const rl = createInterface({ input: process.stdin, output: process.stdout });

/** Reads KEY=value pairs from supabase/.env, if it exists. */
function loadEnvFile() {
  try {
    const raw = readFileSync(resolve(PROJECT_ROOT, "supabase/.env"), "utf8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // No .env file — fall back to the ambient environment.
  }
}

/**
 * Prompts without echoing, so a password isn't left in the scrollback.
 *
 * Masks by intercepting the readline interface's own output rather than
 * reading process.stdin directly: a second reader on stdin destroys the
 * stream out from under `rl` when it finishes, which aborts the interface.
 */
async function promptHidden(question) {
  const writeToOutput = rl._writeToOutput?.bind(rl);

  // If the private hook ever goes away, fall back to a visible prompt rather
  // than crashing.
  if (!writeToOutput) {
    return rl.question(question);
  }

  let muted = false;
  rl._writeToOutput = (text) => {
    if (!muted) writeToOutput(text);
  };

  const answer = rl.question(question); // writes the prompt synchronously
  muted = true;

  try {
    return await answer;
  } finally {
    muted = false;
    rl._writeToOutput = writeToOutput;
    process.stdout.write("\n");
  }
}

async function getIgdbToken(clientId, clientSecret) {
  const url = new URL("https://id.twitch.tv/oauth2/token");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("client_secret", clientSecret);
  url.searchParams.set("grant_type", "client_credentials");

  const response = await fetch(url, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Twitch token request failed (${response.status})`);
  }

  const payload = await response.json();
  if (!payload.access_token) throw new Error("No access_token in Twitch response");
  return payload.access_token;
}

async function searchIgdb(name, clientId, token) {
  const term = name.replace(/[\\"\n\r;]/g, " ").trim().slice(0, 100);
  if (!term) return [];

  const body = [
    `search "${term}";`,
    "fields name, cover.image_id, first_release_date, platforms.name,",
    "       involved_companies.company.name,",
    "       involved_companies.developer, involved_companies.publisher;",
    "where version_parent = null & game_type = (0,4,8,9,10);",
    `limit ${CANDIDATE_LIMIT};`,
  ].join("\n");

  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body,
  });

  if (!response.ok) {
    console.error(`  ! IGDB search failed (${response.status})`);
    return [];
  }

  return (await response.json()).map((game) => {
    const companies = game.involved_companies ?? [];
    const developer =
      companies.find((c) => c.developer)?.company?.name ??
      companies.find((c) => c.publisher)?.company?.name ??
      null;
    const imageId = game.cover?.image_id;

    return {
      id: game.id,
      name: game.name ?? "Unknown",
      year: game.first_release_date
        ? new Date(game.first_release_date * 1000).getUTCFullYear()
        : null,
      developer,
      coverUrl: imageId ? `${IGDB_IMAGE_BASE}/t_cover_big/${imageId}.jpg` : null,
    };
  });
}

async function main() {
  loadEnvFile();

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing IGDB_CLIENT_ID / IGDB_CLIENT_SECRET.");
    console.error("Set them in the environment or in supabase/.env, then re-run.");
    process.exit(1);
  }

  const email = process.env.SUPABASE_EMAIL || (await rl.question("Supabase email: "));
  const password = process.env.SUPABASE_PASSWORD || (await promptHidden("Supabase password: "));

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({ email, password });

  if (authError) {
    console.error(`Sign-in failed: ${authError.message}`);
    process.exit(1);
  }

  console.log(`\nSigned in as ${auth.user.email}`);
  if (DRY_RUN) console.log("DRY RUN — no changes will be written.\n");

  const { data: games, error: gamesError } = await supabase
    .from("Games")
    .select("*")
    .is("IgdbId", null)
    .order("Name");

  if (gamesError) {
    console.error(`Failed to load games: ${gamesError.message}`);
    if (gamesError.message.includes("IgdbId")) {
      console.error("\nThe IgdbId column doesn't exist yet — apply");
      console.error("supabase/migrations/20260809000000_add_igdb_columns.sql first.");
    }
    process.exit(1);
  }

  const queue = games.slice(0, LIMIT);

  if (queue.length === 0) {
    console.log("Nothing to do — every game already has an IGDB match.");
    rl.close();
    return;
  }

  console.log(`${queue.length} game(s) without an IGDB match.\n`);

  const token = await getIgdbToken(clientId, clientSecret);
  let matched = 0;
  let skipped = 0;

  for (const [index, game] of queue.entries()) {
    const name = game.Name ?? "";
    console.log(`\n[${index + 1}/${queue.length}]  stored name: "${name}"`);

    const candidates = await searchIgdb(name, clientId, token);

    if (candidates.length === 0) {
      console.log("  no IGDB results — skipping");
      skipped += 1;
      continue;
    }

    candidates.forEach((candidate, i) => {
      const year = candidate.year ?? "----";
      const dev = candidate.developer ?? "unknown developer";
      const art = candidate.coverUrl ? "" : "  (no cover art)";
      console.log(`  ${i + 1}) ${candidate.name}  ${year}  ${dev}${art}`);
    });
    console.log("  s) skip    q) quit");

    const answer = (await rl.question("  choose > ")).trim().toLowerCase();

    if (answer === "q") {
      console.log("Stopping here.");
      break;
    }
    if (answer === "s" || answer === "") {
      skipped += 1;
      continue;
    }

    const choice = candidates[Number(answer) - 1];
    if (!choice) {
      console.log("  not a listed option — skipping");
      skipped += 1;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  would set IgdbId=${choice.id}, CoverUrl=${choice.coverUrl ?? "null"}`);
      matched += 1;
      continue;
    }

    const { error: updateError } = await supabase
      .from("Games")
      .update({ IgdbId: choice.id, CoverUrl: choice.coverUrl })
      .eq("id", game.id);

    if (updateError) {
      console.error(`  ! failed to update: ${updateError.message}`);
      continue;
    }

    console.log(`  ✓ matched to ${choice.name}`);
    matched += 1;
  }

  console.log(`\n${matched} matched · ${skipped} skipped${DRY_RUN ? " (dry run — nothing written)" : ""}`);
  rl.close();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  rl.close();
  process.exit(1);
});
