// © 2025 Joseph MULÉ – M1SSION™ – NORAH AI KB Upsert
// Chunking + server-side embedding + upsert to ai_docs/ai_docs_embeddings

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHUNK_SIZE = 600; // tokens (approx 300-800 chars per token)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const traceId = crypto.randomUUID();
  console.log(`[kb-upsert] traceId:${traceId} start`);

  try {
    const { documents } = await req.json();

    if (!Array.isArray(documents) || documents.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid "documents" array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    let totalProcessed = 0;
    const results: any[] = [];

    for (const doc of documents) {
      const { slug, title, body, tags = [] } = doc;

      if (!slug || !title || !body) {
        console.warn(`[kb-upsert] traceId:${traceId} skipping invalid doc:`, doc);
        continue;
      }

      console.log(`[kb-upsert] traceId:${traceId} processing: ${slug}`);

      // 1. Upsert document
      const { data: docData, error: docError } = await supabaseClient
        .from('ai_docs')
        .upsert({ slug, title, body, tags, updated_at: new Date().toISOString() }, { onConflict: 'slug' })
        .select('id')
        .single();

      if (docError) {
        console.error(`[kb-upsert] traceId:${traceId} doc upsert error:`, docError);
        continue;
      }

      const docId = docData.id;

      // 2. Chunking (simple split by chars)
      const chunks = chunkText(body, CHUNK_SIZE);
      console.log(`[kb-upsert] traceId:${traceId} ${slug}: ${chunks.length} chunks`);

      // 3. Generate embeddings for all chunks
      const chunkTexts = chunks.map(c => c.text);
      const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: chunkTexts
        })
      });

      if (!embeddingResponse.ok) {
        const errText = await embeddingResponse.text();
        console.error(`[kb-upsert] traceId:${traceId} embedding error:`, errText);
        continue;
      }

      const embeddingData = await embeddingResponse.json();
      const embeddings = embeddingData?.data || [];

      if (embeddings.length !== chunks.length) {
        console.error(`[kb-upsert] traceId:${traceId} embedding count mismatch`);
        continue;
      }

      // 4. Delete old embeddings
      await supabaseClient
        .from('ai_docs_embeddings')
        .delete()
        .eq('doc_id', docId);

      // 5. Insert new embeddings
      const embeddingRows = chunks.map((chunk, idx) => ({
        doc_id: docId,
        chunk_idx: idx,
        chunk_text: chunk.text,
        embedding: embeddings[idx].embedding
      }));

      const { error: embError } = await supabaseClient
        .from('ai_docs_embeddings')
        .insert(embeddingRows);

      if (embError) {
        console.error(`[kb-upsert] traceId:${traceId} embedding insert error:`, embError);
        continue;
      }

      totalProcessed++;
      results.push({ slug, chunks: chunks.length, status: 'ok' });
      console.log(`[kb-upsert] traceId:${traceId} ${slug}: completed`);
    }

    console.log(`[kb-upsert] traceId:${traceId} finished: ${totalProcessed}/${documents.length}`);

    return new Response(
      JSON.stringify({ 
        processed: totalProcessed,
        total: documents.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`[kb-upsert] traceId:${traceId} error:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function chunkText(text: string, maxTokens: number): Array<{ text: string }> {
  // Simple chunking by characters (approx 4 chars = 1 token)
  const maxChars = maxTokens * 4;
  const chunks: Array<{ text: string }> = [];
  
  for (let i = 0; i < text.length; i += maxChars) {
    chunks.push({ text: text.substring(i, i + maxChars) });
  }
  
  return chunks.length > 0 ? chunks : [{ text }];
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
