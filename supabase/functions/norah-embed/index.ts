// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CF_ACCOUNT = Deno.env.get("CLOUDFLARE_ACCOUNT_ID") || "";
const CF_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN") || "";
const CF_MODEL = Deno.env.get("CF_EMBEDDING_MODEL") || "@cf/baai/bge-base-en-v1.5";
const CORS_ORIGIN = Deno.env.get("CORS_ALLOWED_ORIGIN") || "*";

const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin || CORS_ORIGIN,
  "Vary": "Origin",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
});

async function cfEmbed(text: string): Promise<number[]> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run/${CF_MODEL}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${CF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`CF embed failed: ${res.status} ${err}`);
  }

  const json = await res.json();
  let e: any = json?.result?.data ?? json?.data;
  if (Array.isArray(e) && Array.isArray(e[0])) e = e[0];
  return Array.isArray(e) ? e.map((n: any) => Number(n)) : [];
}

function chunkText(text: string, maxChars = 1000): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxChars;
    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf(".", end);
      if (sentenceEnd > start) end = sentenceEnd + 1;
    }
    chunks.push(text.slice(start, end).trim());
    start = end;
  }

  return chunks;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors(origin) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: cors(origin),
    });
  }

  try {
    const { reembed = false, batch = 100 } = await req.json().catch(() => ({}));
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Get docs that need embedding - use coalesce for text
    const { data: docs, error: docsError } = await supabase
      .from("ai_docs")
      .select("id, text, body, body_md")
      .limit(batch);

    if (docsError) throw docsError;
    if (!docs || docs.length === 0) {
      return new Response(JSON.stringify({ ok: true, embedded: 0, message: "No documents to embed" }), {
        headers: cors(origin),
      });
    }

    let embedded = 0;

    for (const doc of docs) {
      // Use coalesce logic: text > body > body_md
      const fullText = doc.text ?? doc.body ?? doc.body_md ?? "";
      if (!fullText.trim()) continue;

      // Check if already embedded
      if (!reembed) {
        const { count } = await supabase
          .from("ai_docs_embeddings")
          .select("*", { count: "exact", head: true })
          .eq("doc_id", doc.id);
        
        if (count && count > 0) continue;
      }

      const chunks = chunkText(fullText);

      for (let idx = 0; idx < chunks.length; idx++) {
        const embedding = await cfEmbed(chunks[idx]);

        const { error: insertError } = await supabase
          .from("ai_docs_embeddings")
          .insert({
            doc_id: doc.id,
            embedding: `[${embedding.join(",")}]`,
            model: CF_MODEL,
            chunk_idx: idx,
            chunk_text: chunks[idx],
          });

        if (!insertError) embedded++;
      }
    }

    return new Response(JSON.stringify({ ok: true, embedded }), {
      headers: cors(origin),
    });
  } catch (e: any) {
    console.error("Embed error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: cors(origin),
    });
  }
});
