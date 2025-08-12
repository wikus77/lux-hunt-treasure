import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    if (!code) return new Response(JSON.stringify({ error: 'missing code' }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1) prendi il QR
    const { data: qr, error: qrErr } = await supabase
      .from('qr_codes')
      .select('code,reward_type,message,is_active')
      .eq('code', code)
      .maybeSingle();
    if (qrErr) throw qrErr;
    if (!qr) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } });

    // 2) se già non attivo → ok idempotente
    if (qr.is_active === false) {
      return new Response(JSON.stringify({ ok: true, already: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // 3) marca come usato
    const { error: upErr } = await supabase
      .from('qr_codes')
      .update({ is_active: false })
      .eq('code', code);
    if (upErr) throw upErr;

    // 4) se reward_type === 'custom' → crea notifica generale
    if ((qr.reward_type || '').toLowerCase() === 'custom') {
      await supabase
        .from('notifications')
        .insert({
          title: 'Nuovo Messaggio M1SSION™',
          body: qr.message || 'Hai trovato un messaggio segreto.',
          type: 'general',
          is_read: false
        });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e:any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
