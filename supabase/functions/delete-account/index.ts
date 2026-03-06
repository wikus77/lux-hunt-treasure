/**
 * © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 * Self-service account deletion — Apple 5.1.1(v) compliant.
 * Auth: JWT verified with anon client (or service role if anon not set).
 * Deletion: admin client only for auth.admin.deleteUser + app cleanup.
 * No SQL on auth.users; no logging of keys/tokens.
 */
const EDGE_DELETE_ACCOUNT_BUILD_ID = "20260301-authadmin-v1";

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-m1ssion-diagnostic",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = Deno.env.get("SUPABASE_URL")?.trim() || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim() || "";

  if (!url || !serviceKey) {
    console.warn("DELETE_ACCOUNT: config missing");
    return new Response(JSON.stringify({ ok: false, success: false, error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization")?.trim() || "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ ok: false, success: false, error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const jwt = authHeader.slice(7);
  const reqId = req.headers.get("x-request-id") ?? req.headers.get("sb_request_id") ?? "n/a";
  const ts = new Date().toISOString();

  // (A) Verify caller with anon client when available; else service role (no admin used for auth check)
  const authClient = anonKey ? createClient(url, anonKey) : createClient(url, serviceKey);
  const { data: { user }, error: userErr } = await authClient.auth.getUser(jwt);
  if (userErr || !user?.id) {
    console.warn("DELETE_ACCOUNT: AUTH_FAIL", { req_id: reqId, ts });
    return new Response(JSON.stringify({ ok: false, success: false, error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const user_id = user.id;
  console.warn("DELETE_ACCOUNT: AUTH_OK", { build_id: EDGE_DELETE_ACCOUNT_BUILD_ID, user_id, req_id: reqId, ts });

  const admin = createClient(url, serviceKey);

  try {
    console.warn("DELETE_ACCOUNT: ADMIN_DELETE_START", { user_id, req_id: reqId, ts });

    const authResult = await admin.auth.admin.deleteUser(user_id);
    if (authResult.error) {
      const err = authResult.error as { message?: string; name?: string; status?: number; code?: string };
      console.warn("DELETE_ACCOUNT: ADMIN_DELETE_FAIL", {
        user_id,
        req_id: reqId,
        ts,
        error_name: err.name,
        error_status: err.status,
      });
      // Treat "user not found" as success (idempotent)
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("not found") || msg.includes("does not exist")) {
        return new Response(JSON.stringify({ ok: true, success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: false, success: false, error: "internal_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.warn("DELETE_ACCOUNT: ADMIN_DELETE_OK", { user_id, req_id: reqId, ts });

    // (C) Cleanup public data only after auth user is removed
    try {
      const { data: files } = await admin.storage.from("avatars").list(user_id, { limit: 500 });
      if (files?.length) {
        const paths = files.map((f) => `${user_id}/${f.name}`).filter(Boolean);
        if (paths.length) await admin.storage.from("avatars").remove(paths);
      }
    } catch (_) {
      // non-fatal
    }

    const tablesByUser: { table: string; column: string }[] = [
      { table: "email_sends", column: "recipient_user_id" },
      { table: "user_clues", column: "user_id" },
      { table: "user_buzz_counter", column: "user_id" },
      { table: "user_notifications", column: "user_id" },
      { table: "subscriptions", column: "user_id" },
      { table: "user_roles", column: "user_id" },
      { table: "antifraud_log", column: "user_id" },
    ];
    for (const { table, column } of tablesByUser) {
      await admin.from(table).delete().eq(column, user_id);
    }
    await admin.from("profiles").delete().eq("id", user_id);

    return new Response(JSON.stringify({ ok: true, success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const err = e as { name?: string; status?: number };
    console.warn("DELETE_ACCOUNT: CATCH", {
      user_id,
      req_id: reqId,
      ts,
      error_name: err.name,
      error_status: err.status,
    });
    return new Response(JSON.stringify({ ok: false, success: false, error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
