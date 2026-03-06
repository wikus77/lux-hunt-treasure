import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Safe body parse: empty body → {}; invalid JSON → null (caller returns 400). */
async function safeParseBody(req: Request): Promise<Record<string, unknown> | null> {
  const cl = req.headers.get("content-length");
  if (cl === null || cl === "" || cl === "0") return {};
  try {
    const parsed = await req.json();
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  const rid = crypto.randomUUID();

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { ok: false });
  }

  const body = await safeParseBody(req);
  if (body === null) {
    return json(400, { ok: false, error: "bad_json" });
  }

  const url = Deno.env.get("SUPABASE_URL")?.trim() ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim() ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ?? "";

  if (!url || !anonKey || !serviceKey) {
    console.error("[delete-account-v2]", { rid, step: "config_missing" });
    return json(500, { ok: false, error: "internal_error", rid });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return json(401, { ok: false });
  }

  const jwt = authHeader.replace("Bearer ", "").trim();
  const anonClient = createClient(url, anonKey);
  const { data, error } = await anonClient.auth.getUser(jwt);

  if (error || !data?.user?.id) {
    return json(401, { ok: false });
  }

  const userId = data.user.id;
  console.error("[delete-account-v2]", { rid, step: "auth_ok", user_id: userId });

  const admin = createClient(url, serviceKey);
  console.error("[delete-account-v2]", { rid, step: "delete_start", user_id: userId });

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);

  if (deleteError) {
    const safeDetails =
      deleteError.details != null && typeof deleteError.details === "string" && !deleteError.details.includes("@")
        ? deleteError.details
        : undefined;
    console.error("[delete-account-v2]", {
      rid,
      step: "delete_fail",
      user_id: userId,
      deleteError: {
        name: deleteError.name,
        message: deleteError.message,
        status: deleteError.status,
        code: deleteError.code,
        ...(safeDetails !== undefined && { details: safeDetails }),
      },
    });
    return json(500, { ok: false, error: "delete_failed", rid });
  }

  console.error("[delete-account-v2]", { rid, step: "delete_ok", user_id: userId });
  return json(200, { ok: true, rid });
});
