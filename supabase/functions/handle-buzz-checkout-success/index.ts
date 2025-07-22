// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Handle BUZZ Checkout Success - Process dopo pagamento Stripe confermato

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    
    console.log(`[BUZZ-CHECKOUT-SUCCESS] 🔥 Processing session: ${session_id}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Trova il pagamento associato a questa sessione
    const { data: payment, error: paymentError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('provider_transaction_id', session_id)
      .single();

    if (paymentError || !payment) {
      console.error('[BUZZ-CHECKOUT-SUCCESS] ❌ Payment not found:', paymentError);
      return new Response(
        JSON.stringify({ success: false, error: 'Payment not found' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[BUZZ-CHECKOUT-SUCCESS] 💳 Payment found for user: ${payment.user_id}`);

    // 2. Verifica che sia un pagamento BUZZ (non BUZZ MAP)
    if (payment.description?.includes('Buzz Map') || payment.description?.includes('BUZZ MAPPA')) {
      console.log('[BUZZ-CHECKOUT-SUCCESS] 🗺️ This is BUZZ MAP - delegating to handle-buzz-payment-success');
      // Delega al gestore delle BUZZ MAP
      return await supabase.functions.invoke('handle-buzz-payment-success', {
        body: { session_id }
      });
    }

    // 3. Aggiorna stato pagamento a succeeded se non già fatto
    if (payment.status !== 'succeeded') {
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({ status: 'succeeded' })
        .eq('provider_transaction_id', session_id);

      if (updateError) {
        console.error('[BUZZ-CHECKOUT-SUCCESS] ❌ Failed to update payment status:', updateError);
      } else {
        console.log('[BUZZ-CHECKOUT-SUCCESS] ✅ Payment status updated to succeeded');
      }
    }

    // 4. Genera l'indizio BUZZ tramite la handle-buzz-press
    console.log('[BUZZ-CHECKOUT-SUCCESS] 🧩 Generating BUZZ clue...');
    
    // Simulate auth header for the buzz press function
    const authHeader = `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`;
    
    const buzzResponse = await supabase.functions.invoke('handle-buzz-press', {
      body: {
        userId: payment.user_id,
        generateMap: false,
        sessionId: session_id
      },
      headers: {
        Authorization: authHeader
      }
    });

    if (buzzResponse.error) {
      console.error('[BUZZ-CHECKOUT-SUCCESS] ❌ BUZZ generation failed:', buzzResponse.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to generate BUZZ clue',
          details: buzzResponse.error 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('[BUZZ-CHECKOUT-SUCCESS] ✅ BUZZ clue generated successfully');

    // 5. Crea notifica per l'utente
    const { error: notificationError } = await supabase
      .from('user_notifications')
      .insert({
        user_id: payment.user_id,
        title: '🧩 Pagamento BUZZ completato!',
        message: `Il tuo indizio BUZZ è stato generato. Controlla la sezione notifiche per vederlo.`,
        type: 'payment_success',
        is_read: false
      });

    if (notificationError) {
      console.error('[BUZZ-CHECKOUT-SUCCESS] ⚠️ Failed to create notification:', notificationError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'BUZZ payment processed successfully',
        clue_generated: true
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[BUZZ-CHECKOUT-SUCCESS] ❌ Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});