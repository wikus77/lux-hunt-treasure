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
  if (e && typeof e === "object" && "data" in e) {
    const d: any = (e as any).data;
    e = Array.isArray(d) && Array.isArray(d[0]) ? d[0] : d;
  }
  if (e && (e as any).buffer && (e as any).BYTES_PER_ELEMENT) {
    e = Array.from(e as any);
  }
  if (Array.isArray(e) && Array.isArray(e[0])) e = e[0];
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
    if (!cfRes.ok) {
      result.cloudflare.ok = false;
      result.cloudflare.error = await cfRes.text();
    } else {
      const cfJson = await cfRes.json();
      embedding = __flattenEmbedding(cfJson);
      result.cloudflare.ok = Array.isArray(embedding) && embedding.length > 0;
      result.cloudflare.embedding_len = embedding.length;
      result.cloudflare.sample = embedding.slice(0, 5); // piccolo assaggio
    }
  } catch (e) {
    result.cloudflare.ok = false;
    result.cloudflare.error = String(e);
  }

  // Step 2: RPC ai_rag_search_vec (solo se abbiamo embedding)
  if (embedding.length > 0) {
    try {
      const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ai_rag_search_vec`, {
        method: "POST",
        headers: {
          "apikey": SERVICE_ROLE,
          "Authorization": `Bearer ${SERVICE_ROLE}`,
          "Content-Type": "application/json",
          "Prefer": "params=single-object",
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
