// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// supabase/functions/norah-diagnose/index.ts

// Minimal CORS
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CF_ACCOUNT = Deno.env.get("CLOUDFLARE_ACCOUNT_ID") || "";
const CF_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN") || "";
const CF_EMBED_MODEL = Deno.env.get("CF_EMBEDDING_MODEL") || "@cf/baai/bge-base-en-v1.5";

function __flattenEmbedding(input: any): number[] {
  let e: any = input;
  // Accept both {result:{data:[[...]]}} and {data:[[...]]}
  if (e && typeof e === "object") {
    if ("result" in e && (e as any).result && "data" in (e as any).result) {
      e = (e as any).result.data;
    } else if ("data" in e) {
      e = (e as any).data;
    }
  }
  if (Array.isArray(e) && Array.isArray(e[0])) e = e[0];
  if (e && (e as any).buffer && (e as any).BYTES_PER_ELEMENT) e = Array.from(e as any);
  if (!Array.isArray(e)) return [];
  return e.map((n: any) => Number(n));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  const result: any = {
    env: {
      SUPABASE_URL_present: !!SUPABASE_URL,
      SERVICE_ROLE_present: !!SERVICE_ROLE,
      CLOUDFLARE_ACCOUNT_ID_present: !!CF_ACCOUNT,
      CLOUDFLARE_API_TOKEN_present: !!CF_TOKEN,
      CF_EMBEDDING_MODEL: CF_EMBED_MODEL || null,
    },
    cloudflare: {},
    rpc: {},
  };

  // Step 1: CF embeddings
  let embedding: number[] = [];
  try {
    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run/${CF_EMBED_MODEL}`;
    const cfRes = await fetch(cfUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "hello world" }),
    });

    result.cloudflare.status = cfRes.status;
    const txt = await cfRes.text();
    let cfJson: any = null;
    try { cfJson = JSON.parse(txt); } catch { /* non-JSON */ }

    if (!cfRes.ok) {
      result.cloudflare.ok = false;
      result.cloudflare.error = txt;
    } else {
      embedding = __flattenEmbedding(cfJson ?? {});
      result.cloudflare.ok = Array.isArray(embedding) && embedding.length > 0;
      result.cloudflare.embedding_len = embedding.length;
      result.cloudflare.sample = (embedding || []).slice(0, 5);

      // In fallback show some keys to understand the structure
      if (!result.cloudflare.ok) {
        result.cloudflare.peek_keys = cfJson && typeof cfJson === "object" ? Object.keys(cfJson) : null;
        result.cloudflare.peek_result_keys = cfJson?.result && typeof cfJson.result === "object" ? Object.keys(cfJson.result) : null;
        result.cloudflare.peek_data_type = Array.isArray(cfJson?.data) ? "array" : typeof cfJson?.data;
        result.cloudflare.peek_result_data_type = Array.isArray(cfJson?.result?.data) ? "array" : typeof cfJson?.result?.data;
        // Small raw excerpt
        result.cloudflare.raw_excerpt = txt.slice(0, 400);
      }
    }
  } catch (e) {
    result.cloudflare.ok = false;
    result.cloudflare.error = String(e);
  }

  // Step 2: RPC ai_rag_search_vec (only if we have embedding)
  if (embedding.length > 0) {
    try {
      const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ai_rag_search_vec`, {
        method: "POST",
        headers: {
          "apikey": SERVICE_ROLE,
          "Authorization": `Bearer ${SERVICE_ROLE}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query_embedding: embedding,
          match_count: 1,
          in_locale: "it",
        }),
      });

      result.rpc.status = rpcRes.status;

      if (!rpcRes.ok) {
        result.rpc.ok = false;
        result.rpc.error = await rpcRes.text();
      } else {
        const rows = await rpcRes.json();
        result.rpc.ok = true;
        result.rpc.rows = Array.isArray(rows) ? rows.length : null;
        result.rpc.preview = Array.isArray(rows) ? rows.slice(0, 1) : rows;
      }
    } catch (e) {
      result.rpc.ok = false;
      result.rpc.error = String(e);
    }
  } else {
    result.rpc.skipped = true;
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
});
