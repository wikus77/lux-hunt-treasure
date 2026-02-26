/**
 * © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 * Self-service account deletion — Apple 5.1.1(v) compliant.
 * Authenticates via JWT; deletes user data then auth.users. Service Role only in Edge.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = Deno.env.get("SUPABASE_URL")?.trim() || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() || "";
  if (!url || !serviceKey) {
    return new Response(JSON.stringify({ success: false, error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization")?.trim() || "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ success: false, error: "Missing or invalid authorization" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const jwt = authHeader.slice(7);
  const admin = createClient(url, serviceKey);

  const { data: { user }, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !user?.id) {
    return new Response(JSON.stringify({ success: false, error: "Invalid or expired session" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const user_id = user.id;

  try {
    // 1) Storage: remove user's avatars (bucket avatars, folder = user_id)
    try {
      const { data: files } = await admin.storage.from("avatars").list(user_id, { limit: 500 });
      if (files?.length) {
        const paths = files.map((f) => `${user_id}/${f.name}`).filter(Boolean);
        if (paths.length) await admin.storage.from("avatars").remove(paths);
      }
    } catch (storageErr) {
      console.warn("delete-account: storage cleanup warning", (storageErr as Error)?.message);
      // Continue; bucket may not exist or be empty
    }

    // 2) Public data: delete in safe order (child refs first)
    const tablesByUser: { table: string; column: string }[] = [
      { table: "email_sends", column: "recipient_user_id" },
      { table: "user_clues", column: "user_id" },
      { table: "user_buzz_counter", column: "user_id" },
      { table: "user_notifications", column: "user_id" },
      { table: "subscriptions", column: "user_id" },
    ];
    for (const { table, column } of tablesByUser) {
      const { error: delErr } = await admin.from(table).delete().eq(column, user_id);
      if (delErr) {
        console.warn(`delete-account: ${table} delete warning`, delErr.message);
        // Continue; table may not exist or RLS
      }
    }

    // 3) Profile (may cascade elsewhere)
    const { error: profileErr } = await admin.from("profiles").delete().eq("id", user_id);
    if (profileErr) {
      console.warn("delete-account: profiles delete warning", profileErr.message);
    }

    // 4) Auth: remove user (must be last)
    const authResult = await admin.auth.admin.deleteUser(user_id);
    if (authResult.error) {
      const msg = authResult.error.message || "";
      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("does not exist")) {
        return new Response(JSON.stringify({ success: true, deleted_at: new Date().toISOString() }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw authResult.error;
    }

    return new Response(JSON.stringify({ success: true, deleted_at: new Date().toISOString() }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.warn("delete-account: error", message);
    return new Response(JSON.stringify({ success: false, error: "Deletion failed. Please try again or contact support." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
