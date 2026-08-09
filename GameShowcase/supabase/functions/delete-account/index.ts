/**
 * delete-account — permanently deletes the calling user and all their data.
 *
 * Required by App Store Review Guideline 5.1.1(v): any app that lets users
 * create an account must let them delete it from inside the app.
 *
 * This has to be a function rather than a client call because deleting an auth
 * user requires the service-role key, which must never reach the app bundle.
 *
 * verify_jwt is left at its default (on), so an unauthenticated caller is
 * rejected before this code runs. The user id is taken from the verified token
 * rather than the request body — a client-supplied id would let anyone delete
 * anyone.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Injected by the Supabase Edge runtime.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse({ error: "Not authenticated." }, 401);
    }

    // Resolve the caller from their own token — never from the request body.
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Not authenticated." }, 401);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Delete owned rows first. If this fails we stop, so we never orphan a
    // user's games behind a deleted account.
    const { error: gamesError } = await admin.from("Games").delete().eq("user_id", user.id);

    if (gamesError) {
      console.error("Failed to delete games:", gamesError.message);
      return jsonResponse({ error: "Could not delete your games. Nothing was removed." }, 500);
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Failed to delete auth user:", deleteError.message);
      return jsonResponse({ error: "Could not delete your account." }, 500);
    }

    return jsonResponse({ success: true }, 200);
  } catch (err) {
    console.error("delete-account error:", err instanceof Error ? err.message : err);
    return jsonResponse({ error: "Could not delete your account." }, 500);
  }
});
