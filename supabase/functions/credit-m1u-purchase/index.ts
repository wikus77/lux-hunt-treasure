// © 2025 M1SSION™ – Credit M1U after successful purchase
// This function is called directly by the frontend after Stripe payment succeeds

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "npm:stripe@14.25.0";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { withCors } from "../_shared/cors.ts";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.info(`💰 [CREDIT-M1U-PURCHASE] ${step}${detailsStr}`);
};

serve(withCors(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method Not Allowed" }), { 
      status: 405, 
      headers: { "content-type": "application/json" }
    });
  }

  try {
    const body = await req.json();
    const { payment_intent_id, user_id, m1u_amount, pack_code } = body;

    logStep("🚀 Credit M1U request received", { payment_intent_id, user_id, m1u_amount, pack_code });

    // Validate required fields
    if (!payment_intent_id || !user_id || !m1u_amount) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing required fields: payment_intent_id, user_id, m1u_amount" 
      }), { 
        status: 400, 
        headers: { "content-type": "application/json" }
      });
    }

    // Get Stripe configuration
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Initialize Supabase with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 1. VERIFY PAYMENT WITH STRIPE - Prevent fraud
    logStep("🔍 Verifying payment with Stripe...", { payment_intent_id });
    
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    if (paymentIntent.status !== 'succeeded') {
      logStep("❌ Payment not succeeded", { status: paymentIntent.status });
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Payment not completed. Status: ${paymentIntent.status}` 
      }), { 
        status: 400, 
        headers: { "content-type": "application/json" }
      });
    }

    // Verify user_id matches metadata
    if (paymentIntent.metadata?.user_id !== user_id) {
      logStep("❌ User ID mismatch", { 
        metadataUserId: paymentIntent.metadata?.user_id, 
        requestUserId: user_id 
      });
      return new Response(JSON.stringify({ 
        success: false, 
        error: "User ID mismatch - potential fraud detected" 
      }), { 
        status: 403, 
        headers: { "content-type": "application/json" }
      });
    }

    logStep("✅ Payment verified", { 
      paymentIntentId: paymentIntent.id, 
      amount: paymentIntent.amount,
      status: paymentIntent.status 
    });

    // 2. CHECK IF ALREADY CREDITED (idempotency)
    const { data: existingCredit } = await supabaseClient
      .from('user_m1_units_events')
      .select('id')
      .eq('metadata->>payment_intent_id', payment_intent_id)
      .single();

    if (existingCredit) {
      logStep("⚠️ M1U already credited for this payment", { payment_intent_id });
      return new Response(JSON.stringify({ 
        success: true, 
        already_credited: true,
        message: "M1U già accreditati per questo pagamento" 
      }), { 
        status: 200, 
        headers: { "content-type": "application/json" }
      });
    }

    // 3. CREDIT M1U using RPC
    logStep("💰 Crediting M1U...", { user_id, m1u_amount });

    const { data: creditResult, error: creditError } = await supabaseClient.rpc('admin_credit_m1u', {
      p_user_id: user_id,
      p_amount: parseInt(m1u_amount, 10),
      p_reason: `m1u_purchase:${pack_code || 'unknown'}:${payment_intent_id}`
    });

    if (creditError) {
      logStep("❌ RPC credit failed, trying direct update", creditError);
      
      // Fallback: Direct update
      const { data: profile, error: getError } = await supabaseClient
        .from('profiles')
        .select('m1_units')
        .eq('id', user_id)
        .single();

      if (getError) {
        throw new Error(`Failed to get profile: ${getError.message}`);
      }

      const currentBalance = profile?.m1_units || 0;
      const newBalance = currentBalance + parseInt(m1u_amount, 10);

      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ 
          m1_units: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id);

      if (updateError) {
        throw new Error(`Failed to update balance: ${updateError.message}`);
      }

      // Log the transaction manually
      await supabaseClient
        .from('user_m1_units_events')
        .insert({
          user_id: user_id,
          delta: parseInt(m1u_amount, 10),
          reason: `m1u_purchase:${pack_code || 'unknown'}`,
          metadata: {
            payment_intent_id: payment_intent_id,
            pack_code: pack_code,
            old_balance: currentBalance,
            new_balance: newBalance,
            credited_by: 'credit-m1u-purchase-fallback',
            timestamp: new Date().toISOString()
          }
        });

      logStep("✅ M1U credited via direct update", { 
        user_id, 
        m1u_amount, 
        oldBalance: currentBalance, 
        newBalance 
      });

      return new Response(JSON.stringify({ 
        success: true, 
        credited: parseInt(m1u_amount, 10),
        new_balance: newBalance,
        method: 'direct_update'
      }), { 
        status: 200, 
        headers: { "content-type": "application/json" }
      });
    }

    logStep("✅ M1U credited successfully via RPC", { creditResult });

    // 4. Log to admin_logs for audit
    await supabaseClient
      .from('admin_logs')
      .insert({
        event_type: 'm1u_purchase_credited',
        user_id: user_id,
        note: `M1U Purchase: ${m1u_amount} M1U credited from ${pack_code}`,
        context: JSON.stringify({
          payment_intent_id: payment_intent_id,
          m1u_amount: m1u_amount,
          pack_code: pack_code,
          credit_result: creditResult,
          timestamp: new Date().toISOString()
        })
      });

    return new Response(JSON.stringify({ 
      success: true, 
      credited: parseInt(m1u_amount, 10),
      result: creditResult,
      method: 'rpc'
    }), { 
      status: 200, 
      headers: { "content-type": "application/json" }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("❌ ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), { 
      status: 500, 
      headers: { "content-type": "application/json" }
    });
  }
}));




