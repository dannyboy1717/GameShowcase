/**
 * igdb-search — proxies game searches to IGDB (Twitch's game database).
 *
 * This function exists so the IGDB client secret never reaches the app. An Expo
 * JS bundle ships inside the IPA/APK and unzips to near-plaintext, so anything
 * embedded there is extractable. IGDB also sends no CORS headers, so a direct
 * browser call would fail outright on web.
 *
 * Secrets are provided by the Supabase runtime, never committed:
 *   npx supabase secrets set IGDB_CLIENT_ID=... IGDB_CLIENT_SECRET=...
 *
 * verify_jwt is left at its default (on), so only signed-in users can search —
 * supabase.functions.invoke() attaches the caller's session JWT automatically.
 */

const IGDB_CLIENT_ID = Deno.env.get("IGDB_CLIENT_ID");
const IGDB_CLIENT_SECRET = Deno.env.get("IGDB_CLIENT_SECRET");

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_GAMES_URL = "https://api.igdb.com/v4/games";
const IGDB_IMAGE_BASE = "https://images.igdb.com/igdb/image/upload";

const RESULT_LIMIT = 15;
/** Re-mint slightly early so a token can't expire mid-flight. */
const TOKEN_EXPIRY_MARGIN_MS = 60_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Shape returned to the client. Mirrors IgdbGame in app/lib/igdb.ts. */
type IgdbGame = {
  id: number;
  name: string;
  releaseYear: number | null;
  developer: string | null;
  coverUrl: string | null;
  thumbUrl: string | null;
  platforms: string[];
};

type IgdbRawGame = {
  id: number;
  name?: string;
  first_release_date?: number;
  cover?: { image_id?: string };
  platforms?: { name?: string }[];
  involved_companies?: {
    developer?: boolean;
    publisher?: boolean;
    company?: { name?: string };
  }[];
};

/**
 * Cached across invocations on a warm instance. Twitch client-credentials
 * tokens last ~60 days, so cold starts are the only time we mint a new one.
 */
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - TOKEN_EXPIRY_MARGIN_MS) {
    return cachedToken.token;
  }

  const url = new URL(TWITCH_TOKEN_URL);
  url.searchParams.set("client_id", IGDB_CLIENT_ID!);
  url.searchParams.set("client_secret", IGDB_CLIENT_SECRET!);
  url.searchParams.set("grant_type", "client_credentials");

  const response = await fetch(url, { method: "POST" });

  if (!response.ok) {
    // Never echo the response body — it can contain the credentials we sent.
    throw new Error(`Twitch token request failed (${response.status})`);
  }

  const payload = await response.json();

  if (!payload.access_token) {
    throw new Error("Twitch token response contained no access_token");
  }

  cachedToken = {
    token: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 0) * 1000,
  };

  return cachedToken.token;
}

/**
 * APICalypse has no parameter binding, so the query is interpolated directly
 * into the request body. Strip the characters that could break out of the
 * quoted string and inject extra clauses.
 */
function escapeSearchTerm(term: string): string {
  return term.replace(/[\\"\n\r;]/g, " ").trim().slice(0, 100);
}

function pickDeveloper(game: IgdbRawGame): string | null {
  const companies = game.involved_companies ?? [];
  const developer = companies.find((entry) => entry.developer)?.company?.name;
  const publisher = companies.find((entry) => entry.publisher)?.company?.name;

  return developer ?? publisher ?? null;
}

function normalize(game: IgdbRawGame): IgdbGame {
  const imageId = game.cover?.image_id;

  return {
    id: game.id,
    name: game.name ?? "Unknown",
    releaseYear: game.first_release_date
      ? new Date(game.first_release_date * 1000).getUTCFullYear()
      : null,
    developer: pickDeveloper(game),
    coverUrl: imageId ? `${IGDB_IMAGE_BASE}/t_cover_big/${imageId}.jpg` : null,
    thumbUrl: imageId ? `${IGDB_IMAGE_BASE}/t_thumb/${imageId}.jpg` : null,
    platforms: (game.platforms ?? [])
      .map((platform) => platform.name)
      .filter((name): name is string => Boolean(name)),
  };
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) {
    console.error("IGDB_CLIENT_ID / IGDB_CLIENT_SECRET are not configured");
    return jsonResponse({ results: [], error: "IGDB is not configured." }, 500);
  }

  try {
    const { query } = await request.json();

    if (typeof query !== "string" || query.trim().length < 2) {
      return jsonResponse({ results: [] }, 200);
    }

    const searchTerm = escapeSearchTerm(query);

    if (!searchTerm) {
      return jsonResponse({ results: [] }, 200);
    }

    const token = await getAccessToken();

    // Note: `search` cannot be combined with `sort` in APICalypse — IGDB
    // returns results in its own relevance order.
    //
    // The where clause trims the noise that otherwise dominates results:
    //   version_parent = null  drops regional/re-release duplicates, which
    //                          often carry no developer or cover.
    //   game_type = (...)      keeps main games (0), standalone expansions (4),
    //                          remakes (8), remasters (9) and expanded games
    //                          (10), while dropping DLC, mods, packs and
    //                          updates. Remakes are kept deliberately: people
    //                          track e.g. RE4 (2005) and RE4 (2023) separately.
    const body = [
      `search "${searchTerm}";`,
      "fields name, cover.image_id, first_release_date, platforms.name,",
      "       involved_companies.company.name,",
      "       involved_companies.developer, involved_companies.publisher;",
      "where version_parent = null & game_type = (0,4,8,9,10);",
      `limit ${RESULT_LIMIT};`,
    ].join("\n");

    const response = await fetch(IGDB_GAMES_URL, {
      method: "POST",
      headers: {
        "Client-ID": IGDB_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body,
    });

    if (!response.ok) {
      // A 401 usually means the cached token was revoked server-side; drop it
      // so the next request mints a fresh one.
      if (response.status === 401) {
        cachedToken = null;
      }

      console.error(`IGDB search failed (${response.status})`);
      return jsonResponse({ results: [], error: "IGDB search failed." }, 502);
    }

    const games: IgdbRawGame[] = await response.json();

    return jsonResponse({ results: games.map(normalize) }, 200);
  } catch (err) {
    console.error("igdb-search error:", err instanceof Error ? err.message : err);
    return jsonResponse({ results: [], error: "IGDB search failed." }, 500);
  }
});
