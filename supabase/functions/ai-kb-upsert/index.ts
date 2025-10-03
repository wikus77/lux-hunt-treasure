// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: ai-kb-upsert
// Idempotent upsert of documents into ai_docs + embedding generation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentInput {
  title: string;
  body_md: string;
  tags: string[];
  category?: string;
  locale?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const traceId = crypto.randomUUID();
  console.log(`[ai-kb-upsert] traceId:${traceId} start`);

  try {
    const { title, body_md, tags = [], category, locale = 'it' } = await req.json() as DocumentInput;

    if (!title || !body_md) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, body_md' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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

    // 4. Generate embeddings and insert
    const embeddingInserts = [];
    
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      
      // Generate embedding via Lovable AI Gateway
      const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: chunk
        })
      });

      if (!embeddingResponse.ok) {
        const errText = await embeddingResponse.text();
        console.error(`[ai-kb-upsert] traceId:${traceId} embedding error for chunk ${idx}:`, errText);
        continue; // Skip failed chunks but continue processing
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData?.data?.[0]?.embedding;

      if (!embedding || !Array.isArray(embedding) || embedding.length !== 1536) {
        console.error(`[ai-kb-upsert] traceId:${traceId} invalid embedding for chunk ${idx}`);
        continue;
      }

      embeddingInserts.push({
        doc_id: docId,
        chunk_idx: idx,
        chunk_text: chunk,
        embedding
      });
    }

    // Batch insert embeddings
    if (embeddingInserts.length > 0) {
      const { error: embeddingError } = await supabase
        .from('ai_docs_embeddings')
        .insert(embeddingInserts);

      if (embeddingError) {
        console.error(`[ai-kb-upsert] traceId:${traceId} embedding insert error:`, embeddingError);
        throw embeddingError;
      }
    }

    console.log(`[ai-kb-upsert] traceId:${traceId} completed: ${embeddingInserts.length} embeddings`);

    return new Response(
      JSON.stringify({
        success: true,
        doc_id: docId,
        chunks: embeddingInserts.length,
        title
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[ai-kb-upsert] traceId:${traceId} error:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Chunk text into ~800 char segments (preserving sentence boundaries)
function chunkText(text: string, maxChars: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/); // Split on sentence boundaries
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
