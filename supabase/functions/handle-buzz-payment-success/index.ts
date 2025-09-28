// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Handle BUZZ Payment Success - RESET COMPLETO 22/07/2025

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[HANDLE-BUZZ-PAYMENT-SUCCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('🎯 M1SSION™ BUZZ Payment Success Handler Started - RESET COMPLETO 22/07/2025');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) {
      throw new Error('User not authenticated');
    }
    logStep('✅ User authenticated', { userId: user.id });

    // Parse request body
    const { payment_intent_id, user_id, amount, is_buzz_map, metadata } = await req.json();
    
    logStep('📦 Processing BUZZ payment success', { 
      payment_intent_id, 
      user_id, 
      amount, 
      is_buzz_map 
    });

    // Update payment intent record
    const { error: updateError } = await supabaseClient
      .from('payment_intents')
      .update({ 
        status: 'succeeded',
        updated_at: new Date().toISOString()
      })
      .eq('payment_intent_id', payment_intent_id);

    if (updateError) {
      logStep('⚠️ Payment intent update warning', updateError);
    } else {
      logStep('✅ Payment intent updated to succeeded');
    }

    // Record successful transaction
    const { error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .upsert({
        user_id: user_id,
        amount: amount / 100, // Convert back to euros for storage
        currency: 'EUR',
        provider: 'stripe',
        provider_transaction_id: payment_intent_id,
        status: 'succeeded',
        description: is_buzz_map ? 'BUZZ MAPPA - Area geolocalizzata' : 'BUZZ - Indizio premium'
      }, { onConflict: 'provider_transaction_id' });

    if (transactionError) {
      logStep('⚠️ Transaction record warning', transactionError);
    } else {
      logStep('✅ Transaction recorded successfully');
    }

    // Log BUZZ action completion
    const { error: buzzLogError } = await supabaseClient
      .from('buzz_logs')
      .insert({
        user_id: user_id,
        step: 'payment_completed',
        action: is_buzz_map ? 'buzz_map_purchased' : 'buzz_purchased',
        details: {
          payment_intent_id,
          amount,
          is_buzz_map,
          mission: 'M1SSION',
          reset_date: '2025-07-22',
          timestamp: new Date().toISOString(),
          metadata
        }
      });

    if (buzzLogError) {
      logStep('⚠️ BUZZ log error', buzzLogError);
    } else {
      logStep('✅ BUZZ action logged successfully');
    }

    // Generate clue text for standard BUZZ or handle BUZZ MAP area creation
    let clue_text = '';
    
    if (is_buzz_map) {
      logStep('🗺️ BUZZ MAP: Processing area generation after payment');
      
      // Here you would trigger map area creation logic
      // This replaces the immediate area creation that was in process-buzz-purchase
      
      const { error: mapError } = await supabaseClient
        .from('user_map_areas')
        .insert({
          user_id: user_id,
          payment_intent_id: payment_intent_id,
          status: 'generation_pending',
          amount_paid: amount,
          created_at: new Date().toISOString()
        });

      if (mapError) {
        logStep('⚠️ Map area creation error', mapError);
      } else {
        logStep('✅ BUZZ MAP area generation queued');
      }
    } else {
      // Handle standard BUZZ clue generation
      logStep('🔍 BUZZ STANDARD: Generating clue after payment');
      
      // Get current week to determine which clue to give
      const getCurrentWeek = () => {
        const gameStartDate = new Date('2025-07-17T00:00:00.000Z');
        const now = new Date();
        const diffTime = now.getTime() - gameStartDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(1, Math.min(Math.ceil(diffDays / 7), 4));
      };
      
      const currentWeek = getCurrentWeek();
      logStep('📅 Current week calculated', { currentWeek });
      
      // Get clue from prize_clues table for current week
      const { data: clues, error: clueError } = await supabaseClient
        .from('prize_clues')
        .select('title_it, description_it, week')
        .eq('clue_type', 'regular')
        .eq('week', currentWeek)
        .limit(1);
      
      if (clueError) {
        logStep('⚠️ Error fetching clue', clueError);
        clue_text = `Cerca dove l'innovazione italiana splende (${new Date().toLocaleTimeString('it-IT')}) - BUZZ ${Date.now()}`;
      } else if (clues && clues.length > 0) {
        const clue = clues[0];
        clue_text = `${clue.title_it}: ${clue.description_it}`;
        logStep('✅ Clue generated from database', { clue_text });
      } else {
        // Fallback clue if no clue found for current week
        clue_text = `Cerca dove l'innovazione italiana splende (${new Date().toLocaleTimeString('it-IT')}) - BUZZ ${Date.now()}`;
        logStep('⚠️ No clue found, using fallback', { clue_text });
      }
      
      // Save clue notification to user_notifications  
      const { error: notificationError } = await supabaseClient
        .from('user_notifications')
        .insert({
          user_id: user_id,
          type: 'buzz',
          title: '🎯 Nuovo Indizio BUZZ!',
          message: clue_text,
          metadata: {
            source: 'buzz_purchase',
            payment_intent_id,
            amount,
            week: currentWeek,
            clue_text: clue_text, // 🔥 FIXED: Add clue_text to metadata for frontend toast compatibility
            timestamp: new Date().toISOString()
          }
        });
        
      if (notificationError) {
        logStep('⚠️ Error saving notification', notificationError);
      } else {
        logStep('✅ Buzz notification saved successfully');
      }
    }

    logStep('🎉 M1SSION™ BUZZ Payment Success Processing Complete');

    return new Response(JSON.stringify({
      success: true,
      message: 'BUZZ payment processed successfully',
      payment_intent_id,
      is_buzz_map,
      clue_text: clue_text || undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('❌ ERROR in handle-buzz-payment-success', { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'BUZZ payment success handling failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ - RESET COMPLETO 22/07/2025
 */