// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { preflight, json, error } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    if (req.method !== "POST") {
      return error(req, "Only POST allowed", 405);
    }

    const { documents = [], dryRun = false } = await req.json().catch(() => ({}));
    
    if (!Array.isArray(documents)) {
      return error(req, "documents must be an array", 400);
    }

    if (documents.length === 0) {
      return json(req, { ok: true, inserted: 0, message: "No documents provided" });
    }

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!url || !key) {
      console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return error(req, "Server configuration error", 500);
    }

    if (dryRun) {
      return json(req, { ok: true, inserted: 0, dryRun: true, wouldInsert: documents.length });
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

    return json(req, { ok: true, inserted });
  } catch (e: any) {
    console.error("❌ norah-ingest error:", e);
    return error(req, String(e?.message || e), 500);
  }
});
