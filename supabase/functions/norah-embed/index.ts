// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const URL = Deno.env.get('SUPABASE_URL')!;
const SRV = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MODEL = Deno.env.get('NORAH_EMBED_MODEL') || 'text-embedding-3-large';
const OPENAI = Deno.env.get('OPENAI_API_KEY')!;

async function embedText(t: string) {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: t, model: MODEL }),
  });
  const j = await r.json(); if (!r.ok) throw new Error(`openai ${r.status}: ${JSON.stringify(j)}`);
  return j.data[0].embedding as number[];
}

const chunk = (s: string, n = 1200) =>
  Array.from({ length: Math.ceil((s || '').length / n) }, (_, i) => s.slice(i * n, (i + 1) * n));

Deno.serve(async (req) => {
  const headers = corsHeaders(req.headers.get('Origin'));
  if (req.method === 'OPTIONS') return new Response(null, { headers });

  try {
    const { batch = 200 } = await req.json().catch(()=>({}));
    const admin = createClient(URL, SRV);

    const { data: docs, error } = await admin
      .from('ai_docs')
      .select('id, text, body, body_md')
      .limit(batch);
    if (error) throw error;

    let embedded = 0;
    for (const d of docs ?? []) {
      const full = d.text ?? d.body ?? d.body_md ?? '';
      if (!full.trim()) continue;

      let idx = 0;
      for (const c of chunk(full)) {
        const vec = await embedText(c);
        const { error: e2 } = await admin
          .from('ai_docs_embeddings')
          .upsert({ doc_id: d.id, chunk_index: idx, chunk_text: c, embedding: vec, model: MODEL });
        if (e2) throw e2;
        embedded++; idx++;
      }
    }

    return new Response(JSON.stringify({ ok: true, embedded }), { headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), { headers, status: 500 });
  }
});
