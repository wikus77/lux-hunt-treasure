// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const URL = Deno.env.get('SUPABASE_URL')!;
const SRV = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MODEL = Deno.env.get('NORAH_EMBED_MODEL') || 'text-embedding-3-large';
const OPENAI = Deno.env.get('OPENAI_API_KEY')!;

async function embedQuery(q: string) {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: q, model: MODEL }),
  });
  const j = await r.json(); if (!r.ok) throw new Error(`openai ${r.status}: ${JSON.stringify(j)}`);
  return j.data[0].embedding as number[];
}

Deno.serve(async (req) => {
  const headers = corsHeaders(req.headers.get('Origin'));
  if (req.method === 'OPTIONS') return new Response(null, { headers });

  try {
    const { query = '', k = 8, minScore = 0.1 } = await req.json().catch(()=>({}));
    if (!query.trim()) return new Response(JSON.stringify({ ok: false, error: 'empty-query' }), { headers, status: 400 });

    const admin = createClient(URL, SRV);
    const v = await embedQuery(query);

    const { data, error } = await admin.rpc('ai_rag_search_vec_json', { qvec: v, k, minscore: minScore });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, results: data ?? [] }), { headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), { headers, status: 500 });
  }
});
