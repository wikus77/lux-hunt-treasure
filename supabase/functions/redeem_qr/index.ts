import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const { code } = await req.json();
    if (!code) return new Response('Missing code', { status: 400 });

    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const s = createClient(url, key);

    // load qr
    const { data:qr, error:qe } = await s.from('qr_codes')
      .select('code,is_active,reward_type,title')
      .eq('code', code).maybeSingle();
    if (qe) throw qe;
    if (!qr) return new Response('Not found', { status: 404 });

    // mark as used (idempotent)
    if (qr.is_active) {
      const { error:ue } = await s.from('qr_codes')
        .update({ is_active: false }).eq('code', code);
      if (ue) throw ue;
    }

    // optional notification entry
    await s.from('user_notifications').insert({
      title: 'QR riscattato',
      content: `Hai riscattato ${qr.title || code}`,
      type: 'general',
    });

    return new Response(JSON.stringify({ ok:true, code }), { headers: { 'content-type':'application/json' }});
  } catch (e) {
    return new Response(String(e?.message || e), { status: 500 });
  }
});
