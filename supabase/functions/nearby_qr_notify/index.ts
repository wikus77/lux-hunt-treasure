import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

serve(async (req) => {
  try {
    const { code, distance } = await req.json();
    if (!code) return new Response('Missing code', { status: 400 });

    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const s = createClient(url, key);

    await s.from('user_notifications').insert({
      title: 'QR vicino',
      content: `Sei vicino al QR ${code} (${distance ?? '—'}m)`,
      type: 'general',
    });

    return new Response(JSON.stringify({ ok:true }), { headers: { 'content-type':'application/json' }});
  } catch (e) {
    return new Response(String(e?.message || e), { status: 500 });
  }
});
