// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const headers = corsHeaders(req.headers.get('Origin'));
  if (req.method === 'OPTIONS') return new Response(null, { headers });

  try {
    const { sources = 'content-ai', docs = [] } = await req.json().catch(()=>({}));
    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(url, key);

    let inserted = 0;
    for (const d of docs) {
      const title = d.title ?? 'Untitled';
      const text  = d.text ?? d.body ?? d.body_md ?? '';
      const tags  = Array.isArray(d.tags) ? d.tags : [];
      const { error } = await admin.from('ai_docs').insert({
        title, text, tags, source: d.source ?? sources, url: d.url ?? null
      });
      if (error) throw error;
      inserted++;
    }

    return new Response(JSON.stringify({ ok: true, inserted }), { headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), { headers, status: 500 });
  }
});
