// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// === Env ===
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

// === Cloudflare Workers AI embeddings (768d) ===
const CF_ACCOUNT = Deno.env.get("CLOUDFLARE_ACCOUNT_ID") || "";
const CF_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN") || "";
const CF_EMBED_MODEL = Deno.env.get("CF_EMBEDDING_MODEL") || "@cf/baai/bge-base-en-v1.5";

const ALLOWED = (Deno.env.get("CORS_ALLOWED_ORIGIN") || "*")
  .split(",").map(s => s.trim());

function makeCors(origin: string | null) {
  const ok = origin && ALLOWED.some(a => a === "*" || origin.endsWith(a.replace(/^\*\./,"")));
  return {
    "Access-Control-Allow-Origin": ok ? origin! : "*",
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, X-Client-Info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  };
}

const okJSON  = (d:unknown,o:string|null,s=200)=>new Response(JSON.stringify(d),{status:s,headers:makeCors(o)});
const errJSON = (m:string,o:string|null,s=400)=>okJSON({ok:false,error:m},o,s);

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
  const json = await res.json();
  // Either { result: { data: [[...]] } } or { data: [[...]] }
  let e: any = (json?.result?.data ?? json?.data);
  if (Array.isArray(e) && Array.isArray(e[0])) e = e[0];
  return Array.isArray(e) ? e.map((n: any) => Number(n)) : [];
}

type Req = { query: string; top_k?: number; locale?: string };

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  
  try {
    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: makeCors(origin) });
    }

    if (req.method !== "POST") return errJSON("Method Not Allowed", origin, 405);

    const { query, top_k = 3, locale = "it" } = (await req.json()) as Req;
    if (!query) return errJSON("Missing query", origin, 400);

    // 1) Embedding (768d)
    const embedding = await cfEmbed(query);
    if (!Array.isArray(embedding) || embedding.length !== 768) {
      throw new Error(`Bad embedding length: ${embedding?.length ?? 'null'} (expected 768)`);
    }

    // 2) Vector search via RPC (function: public.ai_rag_search_vec(double precision[], integer, text))
    const { data, error } = await supabaseAdmin.rpc("ai_rag_search_vec", {
      query_embedding: embedding,
      match_count: top_k,
      in_locale: locale,
    });
    if (error) throw new Error(`ai_rag_search_vec failed: ${error.message}`);

    // 3) Log best-effort
    try {
      await supabaseAdmin.from("norah_events").insert([
        { event_type: "rag_query", payload: { q: query, locale, top_k, hits: data } },
      ]);
    } catch (_) { /* no-op */ }

    return okJSON({ rag_used: true, hits: data }, origin);
  } catch (e: any) {
    console.error("norah-rag-search error:", e);
    return errJSON(String(e?.message ?? e), origin, 500);
  }
});
