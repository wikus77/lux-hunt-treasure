// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { withCors, json, error } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CF_ACCOUNT = Deno.env.get("CLOUDFLARE_ACCOUNT_ID") || "";
const CF_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN") || "";
const CF_MODEL = Deno.env.get("CF_EMBEDDING_MODEL") || "@cf/baai/bge-base-en-v1.5";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_ORIGINS = [/\.m1ssion\.pages\.dev$/i, /^localhost$/i, /^127\.0\.0\.1$/i];

function normalizeUuid(raw: unknown): string {
  if (typeof raw !== 'string' || !raw) return '';
  // Strip nested quotes and whitespace
  let cleaned = raw.trim()
    .replace(/^"+|"+$/g, '')  // Remove double quotes
    .replace(/^'+|'+$/g, '')  // Remove single quotes
    .trim();
  return UUID_REGEX.test(cleaned) ? cleaned : '';
}

function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return ALLOWED_ORIGINS.some(r => r.test(host));
  } catch { return false; }
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
  const origin = req.headers.get('origin') ?? '';
  
  // Parse body first
  const bodyData = await req.json().catch(() => ({}));
  
  // CORS origin validation - return empty origin for disallowed domains
  const allowedOrigin = origin && isOriginAllowed(origin) ? origin : '';
  if (origin && !allowedOrigin) {
    console.warn(`⚠️ norah-embed: origin not allowlisted: ${origin}`);
  }
  
  try {
    if (req.method !== "POST") {
      return error(allowedOrigin, "Only POST allowed", 405);
    }

    const { reembed = false, batch = 100, source = 'all', client_id } = bodyData;

    // Sanitize + validate x-norah-cid (header or body fallback)
    const rawHeader = req.headers.get('x-norah-cid') || '';
    const rawBody = client_id || '';
    const candidate = rawHeader || rawBody;
    const cid = normalizeUuid(candidate);
    
    if (!cid) {
      console.warn(`⚠️ norah-embed: invalid x-norah-cid/client_id (raw="${String(candidate).slice(0, 50)}")`);
      return error(allowedOrigin, 'invalid x-norah-cid', 400);
    }
    
    console.log(`🧠 norah-embed START: cid=${cid.slice(0, 8)}, batch=${batch}, reembed=${reembed}, source=${source}`);
    
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    // Get docs that need embedding
    const { data: docs, error: docsError } = await supabase
      .from("ai_docs")
      .select("id, text")
      .limit(batch);

    if (docsError) throw docsError;
    if (!docs || docs.length === 0) {
      console.log(`✅ norah-embed: no docs to embed`);
      return json(allowedOrigin, { ok: true, embedded: 0, message: "No documents to embed" });
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
    
    return json(allowedOrigin, { ok: true, embedded });
  } catch (e: any) {
    const duration = Date.now() - (Date.now());
    console.error(`❌ norah-embed FATAL: ${e?.message || e} (stack: ${e?.stack}) (duration: ${duration}ms)`);
    return error(allowedOrigin, String(e?.message || e), 500);
  }
}));
