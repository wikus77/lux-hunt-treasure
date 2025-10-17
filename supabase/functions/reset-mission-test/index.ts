import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { user_id, test_only = true } = await req.json();
    
    if (!user_id) {
      throw new Error('user_id è obbligatorio');
    }

    console.log(`🧪 [RESET-MISSION] Avvio reset per user_id: ${user_id}, test_only: ${test_only}`);

    const resetResults = {
      user_map_areas: 0,
      payment_transactions: 0,
      user_clues: 0,
      user_buzz_counter: 0,
      user_notifications: 0,
      admin_logs: 0
    };

    // 1. Reset user_map_areas (solo dati recenti per test)
    const { error: mapError, count: mapCount } = await supabaseAdmin
      .from('user_map_areas')
      .delete({ count: 'exact' })
      .eq('user_id', user_id)
      .gte('created_at', '2025-07-01T00:00:00Z');

    if (mapError) console.error('Errore reset map areas:', mapError);
    resetResults.user_map_areas = mapCount || 0;

    // 2. Reset payment_transactions (solo mock/test)
    const { error: paymentError, count: paymentCount } = await supabaseAdmin
      .from('payment_transactions')
      .delete({ count: 'exact' })
      .eq('user_id', user_id)
      .ilike('description', '%buzz map%')
      .neq('status', 'succeeded');

    if (paymentError) console.error('Errore reset payments:', paymentError);
    resetResults.payment_transactions = paymentCount || 0;

    // 3. Reset user_clues
    const { error: cluesError, count: cluesCount } = await supabaseAdmin
      .from('user_clues')
      .delete({ count: 'exact' })
      .eq('user_id', user_id);

    if (cluesError) console.error('Errore reset clues:', cluesError);
    resetResults.user_clues = cluesCount || 0;

    // 4. Reset user_buzz_counter
    const { error: buzzError, count: buzzCount } = await supabaseAdmin
      .from('user_buzz_counter')
      .delete({ count: 'exact' })
      .eq('user_id', user_id);

    if (buzzError) console.error('Errore reset buzz counter:', buzzError);
    resetResults.user_buzz_counter = buzzCount || 0;

    // 5. Reset user_notifications
    const { error: notifError, count: notifCount } = await supabaseAdmin
      .from('user_notifications')
      .delete({ count: 'exact' })
      .eq('user_id', user_id);

    if (notifError) console.error('Errore reset notifications:', notifError);
    resetResults.user_notifications = notifCount || 0;

    // 6. Reset admin_logs (solo test)
    const { error: logsError, count: logsCount } = await supabaseAdmin
      .from('admin_logs')
      .delete({ count: 'exact' })
      .like('context', `%${user_id}%`)
      .ilike('event_type', '%test%');

    if (logsError) console.error('Errore reset admin logs:', logsError);
    resetResults.admin_logs = logsCount || 0;

    // 7. Log del reset completato
    const { error: logError } = await supabaseAdmin
      .from('admin_logs')
      .insert({
        event_type: 'mission_reset_manual',
        context: JSON.stringify({
          user_id,
          reason: 'manual test reset',
          results: resetResults,
          timestamp: new Date().toISOString()
        }),
        note: 'Reset manuale completato su richiesta Joseph MULÉ'
      });

    if (logError) console.error('Errore logging reset:', logError);

    console.log(`✅ [RESET-MISSION] Completato per ${user_id}:`, resetResults);

    return new Response(JSON.stringify({
      success: true,
      user_id,
      results: resetResults,
      message: `Reset completato per user ${user_id}. Dati rimossi: ${Object.values(resetResults).reduce((a, b) => a + b, 0)} record totali.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ [RESET-MISSION] Errore:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});