// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { preflight, json, errJSON } from "../_shared/cors.ts";

// === Cloudflare Workers AI embeddings (768d) ===
const CF_ACCOUNT = Deno.env.get("CLOUDFLARE_ACCOUNT_ID") || "";
const CF_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN") || "";
const CF_EMBED_MODEL = Deno.env.get("CF_EMBEDDING_MODEL") || "@cf/baai/bge-base-en-v1.5";

async function cfEmbed(text: string): Promise<number[]> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run/${CF_EMBED_MODEL}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${CF_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudflare embeddings failed: ${res.status} ${err}`);
  }
  const result = await res.json();
  // Either { result: { data: [[...]] } } or { data: [[...]] }
  let e: any = (result?.result?.data ?? result?.data);
  if (Array.isArray(e) && Array.isArray(e[0])) e = e[0];
  return Array.isArray(e) ? e.map((n: any) => Number(n)) : [];
}

type Req = { q: string; top_k?: number; locale?: string };

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  const origin = req.headers.get("Origin") || "*";

  try {
    if (req.method !== "POST") {
      return errJSON(405, "method-not-allowed", "Only POST allowed", origin);
    }

    const { q, top_k = 3, locale = "it" } = (await req.json().catch(() => ({}))) as Req;
    
    if (!q || !q.trim()) {
      return errJSON(400, "empty-query", "Query parameter 'q' is required and must be non-empty", origin);
    }

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!url || !key) {
      console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return errJSON(500, "missing-server-secrets", "Server configuration error", origin);
    }

    const supabaseAdmin = createClient(url, key, { auth: { persistSession: false } });

    // 1) Generate embedding (768d)
    const embedding = await cfEmbed(q.trim());
    if (!Array.isArray(embedding) || embedding.length !== 768) {
      throw new Error(`Bad embedding length: ${embedding?.length ?? 'null'} (expected 768)`);
    }

    // 2) Vector search via RPC
    const { data, error } = await supabaseAdmin.rpc("ai_rag_search_vec", {
      query_embedding: embedding,
      match_count: top_k,
      in_locale: locale,
    });
    
    if (error) {
      console.error("❌ ai_rag_search_vec error:", error);
      throw new Error(`ai_rag_search_vec failed: ${error.message}`);
    }

    // 3) Log query (best-effort, don't fail on log errors)
    try {
      await supabaseAdmin.from("norah_events").insert([
        { event_type: "rag_query", payload: { q, locale, top_k, hits: data?.length || 0 } },
      ]);
    } catch (logErr) {
      console.warn("⚠️ Failed to log RAG query:", logErr);
    }

    return json(200, { ok: true, rag_used: true, results: data || [] }, origin);
  } catch (e: any) {
    console.error("❌ norah-rag-search error:", e);
    return errJSON(500, "rag-internal", String(e?.message || e), origin);
  }
});
