// Minimal ai-kb-upsert -> Cloudflare embeddings (768 dims)

<<<<<<< HEAD
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { cfEmbedBatch } from '../_shared/cfEmbed.ts';
=======
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
>>>>>>> 03b9af89 (backup: edge functions BEFORE fixes (20251003_174019))

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

<<<<<<< HEAD
    console.log(`[ai-kb-upsert] Using Cloudflare Workers AI embeddings (768d)`);

    // 1. Upsert document in ai_docs
    console.log(`[ai-kb-upsert] traceId:${traceId} upserting doc: "${title}"`);
    
    const { data: existingDoc } = await supabase
      .from('ai_docs')
      .select('id')
      .eq('title', title)
      .single();

    let docId: string;

    if (existingDoc) {
      // Update existing
      const { data: updated, error: updateError } = await supabase
        .from('ai_docs')
        .update({
          body: body_md,
          tags,
          category,
          locale,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDoc.id)
        .select('id')
        .single();

      if (updateError) throw updateError;
      docId = updated.id;
      console.log(`[ai-kb-upsert] traceId:${traceId} updated existing doc: ${docId}`);
    } else {
      // Insert new
      const { data: inserted, error: insertError } = await supabase
        .from('ai_docs')
        .insert({
          title,
          body: body_md,
          tags,
          category,
          locale
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      docId = inserted.id;
      console.log(`[ai-kb-upsert] traceId:${traceId} inserted new doc: ${docId}`);
    }

    // 2. Chunking server-side (300-800 tokens ~ 450-1200 chars)
    const chunks = chunkText(body_md, 800);
    console.log(`[ai-kb-upsert] traceId:${traceId} created ${chunks.length} chunks`);

    // 3. Delete existing embeddings for this doc
    await supabase
      .from('ai_docs_embeddings')
      .delete()
      .eq('doc_id', docId);

    // 4. Generate embeddings using Cloudflare Workers AI (768d)
    let embeddings: number[][];
    try {
      embeddings = await cfEmbedBatch(chunks);
    } catch (embeddingError) {
      console.error(`[ai-kb-upsert] traceId:${traceId} embedding generation failed:`, embeddingError);
      throw new Error(`Embedding generation failed: ${embeddingError.message}`);
    }

    const embeddingInserts = chunks.map((chunk, idx) => ({
      doc_id: docId,
      chunk_idx: idx,
      chunk_text: chunk,
      embedding: embeddings[idx]
    }));

    // Batch insert embeddings
    if (embeddingInserts.length > 0) {
      const { error: embeddingError } = await supabase
        .from('ai_docs_embeddings')
        .insert(embeddingInserts);

      if (embeddingError) {
        console.error(`[ai-kb-upsert] traceId:${traceId} embedding insert error:`, embeddingError);
        throw embeddingError;
=======
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
>>>>>>> 03b9af89 (backup: edge functions BEFORE fixes (20251003_174019))
      }
      idx += 1;
    }

<<<<<<< HEAD
    console.log(`[ai-kb-upsert] traceId:${traceId} completed: ${embeddingInserts.length} embeddings`);

    return new Response(
      JSON.stringify({
        success: true,
        doc_id: docId,
        chunks: embeddingInserts.length,
        title,
        provider: 'cloudflare',
        model: '@cf/baai/bge-base-en-v1.5'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[ai-kb-upsert] traceId:${traceId} error:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
=======
    return new Response(JSON.stringify({ ok: true, doc_id, chunks: chunks.length }), {
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
>>>>>>> 03b9af89 (backup: edge functions BEFORE fixes (20251003_174019))
  }
});
