// Minimal ai-kb-upsert -> Cloudflare embeddings (768 dims)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CF_ACCOUNT = Deno.env.get("CLOUDFLARE_ACCOUNT_ID")!;
const CF_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN")!;
const CF_EMBED_MODEL = Deno.env.get("CF_EMBEDDING_MODEL") || "@cf/baai/bge-base-en-v1.5";

function flattenEmbedding(input: any): number[] {
  let e: any = input;
  if (e && typeof e === "object" && "result" in e) e = (e as any).result; // tollera {result:{...}}
  if (e && typeof e === "object" && "data" in e) {
    const d: any = (e as any).data;
    e = Array.isArray(d) && Array.isArray(d[0]) ? d[0] : d;
  }
  if (e && (e as any).buffer && (e as any).BYTES_PER_ELEMENT) e = Array.from(e as any);
  if (Array.isArray(e) && Array.isArray(e[0])) e = e[0];
  if (!Array.isArray(e)) return [];
  return e.map((n: any) => Number(n));
}

async function embedWithCF(text: string): Promise<number[]> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run/${CF_EMBED_MODEL}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${CF_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Cloudflare embeddings failed: ${res.status} ${t}`);
  }
  const json = await res.json();
  const emb = flattenEmbedding(json);
  if (!Array.isArray(emb) || emb.length !== 768) {
    throw new Error(`Unexpected embedding shape (got ${Array.isArray(emb)?emb.length:'?'}), expected 768`);
  }
  return emb;
}

function splitIntoChunks(s: string, size = 1000): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < s.length) { out.push(s.slice(i, i + size)); i += size; }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders() });

  try {
    const payload = await req.json().catch(() => ({}));
    const title = String(payload?.title || "").trim();
    const body_md = String(payload?.body_md || "").trim();
    const category = String(payload?.category || "misc").trim();
    const locale = String(payload?.locale || "it").trim();

    if (!title || !body_md) {
      return new Response(JSON.stringify({ error: "Missing required fields: title, body_md" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders() } });
    }

    // 1) crea doc
    const docRes = await fetch(`${SUPABASE_URL}/rest/v1/ai_docs`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_ROLE, "Authorization": `Bearer ${SERVICE_ROLE}`,
        "Content-Type": "application/json", "Prefer": "return=representation"
      },
      body: JSON.stringify([{ title, body_md, category, locale }]),
    });
    if (!docRes.ok) return new Response(await docRes.text(), { status: docRes.status, headers: corsHeaders() });
    const [doc] = await docRes.json();
    const doc_id = doc?.id;

    // 2) chunk + embeddings + insert
    const chunks = splitIntoChunks(body_md, 1000);
    let idx = 0;
    for (const chunk of chunks) {
      const emb = await embedWithCF(chunk);
      const row = [{ doc_id, chunk_idx: idx, chunk_text: chunk, embedding: emb }];
      const ins = await fetch(`${SUPABASE_URL}/rest/v1/ai_docs_embeddings`, {
        method: "POST",
        headers: {
          "apikey": SERVICE_ROLE, "Authorization": `Bearer ${SERVICE_ROLE}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(row),
      });
      if (!ins.ok) {
        const t = await ins.text();
        throw new Error(`insert ai_docs_embeddings failed: ${ins.status} ${t}`);
      }
      idx += 1;
    }

    return new Response(JSON.stringify({ ok: true, doc_id, chunks: chunks.length }), {
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
});
