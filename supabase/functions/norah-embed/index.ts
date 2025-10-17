// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { withCors, json, error } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CF_ACCOUNT = Deno.env.get("CLOUDFLARE_ACCOUNT_ID") || "";
const CF_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN") || "";
const CF_MODEL = Deno.env.get("CF_EMBEDDING_MODEL") || "@cf/baai/bge-base-en-v1.5";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeUuid(raw: string | null): string {
  if (!raw) return '';
  let cleaned = raw.trim()
    .replace(/^"+|"+$/g, '')  // Strip double quotes
    .replace(/^'+|'+$/g, '')  // Strip single quotes
    .trim();
  return UUID_REGEX.test(cleaned) ? cleaned : '';
}

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

  const result = await res.json();
  let e: any = result?.result?.data ?? result?.data;
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

Deno.serve((req: Request) => withCors(req, async () => {
  const origin = req.headers.get('origin');
  
  try {
    if (req.method !== "POST") {
      return error(origin, "Only POST allowed", 405);
    }

    // Validate and sanitize x-norah-cid header
    const rawCid = req.headers.get('x-norah-cid');
    const cid = normalizeUuid(rawCid);
    
    console.log(`🧠 norah-embed START: cid=${cid || 'none'}, raw="${rawCid}"`);

    const { reembed = false, batch = 100, source = 'all' } = await req.json().catch(() => ({}));
    
    console.log(`🧠 norah-embed START: batch=${batch}, reembed=${reembed}, source=${source}`);
    
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    // Get docs that need embedding
    const { data: docs, error: docsError } = await supabase
      .from("ai_docs")
      .select("id, text")
      .limit(batch);

    if (docsError) throw docsError;
    if (!docs || docs.length === 0) {
      console.log(`✅ norah-embed: no docs to embed`);
      return json(origin, { ok: true, embedded: 0, message: "No documents to embed" });
    }

    let embedded = 0;
    const startTime = Date.now();

    for (const doc of docs) {
      // Validate doc.id is a clean UUID
      const cleanDocId = normalizeUuid(doc.id);
      if (!cleanDocId) {
        console.error(`❌ Invalid doc.id UUID: "${doc.id}" (skipping)`);
        continue;
      }

      // Check if already embedded
      if (!reembed) {
        const { count } = await supabase
          .from("ai_docs_embeddings")
          .select("*", { count: "exact", head: true })
          .eq("doc_id", cleanDocId);
        
        if (count && count > 0) continue;
      }

      const chunks = chunkText(doc.text);

      for (let idx = 0; idx < chunks.length; idx++) {
        const embedding = await cfEmbed(chunks[idx]);

        const { error: insertError } = await supabase
          .from("ai_docs_embeddings")
          .insert({
            doc_id: cleanDocId,
            embedding: `[${embedding.join(",")}]`,
            chunk_idx: idx,
            chunk_text: chunks[idx],
          });

        if (insertError) {
          console.error(`❌ Failed to insert embedding for doc ${cleanDocId} chunk ${idx}:`, insertError);
        } else {
          embedded++;
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ norah-embed COMPLETE: ${embedded} embeddings in ${duration}ms`);
    
    return json(origin, { ok: true, embedded });
  } catch (e: any) {
    const duration = Date.now() - (Date.now());
    console.error(`❌ norah-embed FATAL: ${e?.message || e} (stack: ${e?.stack}) (duration: ${duration}ms)`);
    return error(origin, String(e?.message || e), 500);
  }
}));
