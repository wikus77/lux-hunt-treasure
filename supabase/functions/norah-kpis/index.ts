// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { preflight, json, error } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    if (req.method !== "GET") {
      return error(req, "Only GET allowed", 405);
    }

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!url || !key) {
      console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return error(req, "Server configuration error", 500);
    }

    const admin = createClient(url, key, { auth: { persistSession: false } });

    // Count documents
    const { count: docs } = await admin
      .from("ai_docs")
      .select("id", { count: "exact", head: true });

    // Count embeddings
    const { count: embs } = await admin
      .from("ai_docs_embeddings")
      .select("id", { count: "exact", head: true });

    // Last embed timestamp
    const { data: last } = await admin
      .from("ai_docs_embeddings")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const body = {
      ok: true,
      documents: docs ?? 0,
      embeddings: embs ?? 0,
      last_embed_at: last?.created_at ?? "1970-01-01T00:00:00Z",
    };

    return json(req, body);
  } catch (e: any) {
    console.error("❌ norah-kpis error:", e);
    return error(req, String(e?.message || e), 500);
  }
});
