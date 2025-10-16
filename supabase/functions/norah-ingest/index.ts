// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { preflight, json, errJSON } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  const origin = req.headers.get("Origin") || "*";

  try {
    if (req.method !== "POST") {
      return errJSON(405, "method-not-allowed", "Only POST allowed", origin);
    }

    const { documents = [], dryRun = false } = await req.json().catch(() => ({}));
    
    if (!Array.isArray(documents)) {
      return errJSON(400, "invalid-payload", "documents must be an array", origin);
    }

    if (documents.length === 0) {
      return json(200, { ok: true, inserted: 0, message: "No documents provided" }, origin);
    }

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!url || !key) {
      console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return errJSON(500, "missing-server-secrets", "Server configuration error", origin);
    }

    if (dryRun) {
      return json(200, { ok: true, inserted: 0, dryRun: true, wouldInsert: documents.length }, origin);
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    let inserted = 0;

    for (const doc of documents) {
      if (!doc.title || !doc.text) {
        console.warn("⚠️ Skipping doc without title or text:", doc);
        continue;
      }
      
      const { data, error } = await supabase.rpc("upsert_ai_doc", {
        p_title: doc.title,
        p_text: doc.text,
        p_tags: doc.tags || [],
        p_source: doc.source || "manual",
        p_url: doc.url || null,
      });

      if (error) {
        console.error("❌ upsert_ai_doc error:", error);
      } else if (data) {
        inserted++;
      }
    }

    return json(200, { ok: true, inserted }, origin);
  } catch (e: any) {
    console.error("❌ norah-ingest error:", e);
    return errJSON(500, "ingest-internal", String(e?.message || e), origin);
  }
});
