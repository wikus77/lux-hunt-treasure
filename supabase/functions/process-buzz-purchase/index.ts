
// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - Process BUZZ Purchase via Stripe - RESET COMPLETO 17/07/2025
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-BUZZ-PURCHASE] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("🔥 M1SSION™ Buzz Purchase Started - RESET COMPLETO 17/07/2025");

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 🚨 FORCE CHECK: Validate Stripe Secret Key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    logStep("🔍 STRIPE KEY VERIFICATION", { 
      hasKey: !!stripeKey, 
      keyLength: stripeKey?.length || 0,
      keyStart: stripeKey?.substring(0, 8) || 'NONE'
    });
    
    if (!stripeKey) {
      logStep("❌ CRITICAL: STRIPE_SECRET_KEY is null or undefined");
      throw new Error("STRIPE_SECRET_KEY non configurata - controllare Supabase Edge Functions Secrets");
    }
    
    if (!stripeKey.startsWith("sk_")) {
      logStep("❌ CRITICAL: STRIPE_SECRET_KEY invalid format", { received: stripeKey.substring(0, 10) });
      throw new Error("STRIPE_SECRET_KEY deve iniziare con sk_test_ o sk_live_");
    }
    
    logStep("✅ STRIPE_SECRET_KEY verificata correttamente", { keyPrefix: stripeKey.substring(0, 12) });

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    logStep("✅ User authenticated - RESET COMPLETO 17/07/2025", { userId: user.id, email: user.email });

    // Parse request body
    const { user_id, amount, is_buzz_map, currency = 'EUR', redirect_url, session_id, mode = 'live' } = await req.json();

    if (!user_id || !amount) {
      throw new Error("Missing required parameters: user_id, amount");
    }

    logStep("📦 Request data - RESET COMPLETO 17/07/2025", { user_id, amount, is_buzz_map, currency, mode });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("👤 Existing customer found - RESET COMPLETO 17/07/2025", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id, mission: 'M1SSION', reset_date: '2025-07-17' }
      });
      customerId = customer.id;
      logStep("🆕 New customer created - RESET COMPLETO 17/07/2025", { customerId });
    }

    // Create Stripe Checkout Session
    const origin = req.headers.get("origin") || "https://m1ssion.app";
    const successUrl = redirect_url || `${origin}/buzz?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/buzz?payment=cancelled`;

    const sessionData = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: is_buzz_map ? 'M1SSION™ Buzz Map' : 'M1SSION™ Buzz',
              description: is_buzz_map ? 'Unlock exclusive map area' : 'Unlock exclusive clue',
              metadata: { 
                mission: 'M1SSION', 
                type: is_buzz_map ? 'buzz_map' : 'buzz_clue',
                reset_date: '2025-07-17'
              }
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id,
        mission: 'M1SSION',
        type: is_buzz_map ? 'buzz_map' : 'buzz_clue',
        amount: amount.toString(),
        session_id: session_id || 'none',
        reset_date: '2025-07-17'
      }
    });

    logStep("💳 Stripe session created - RESET COMPLETO 17/07/2025", { sessionId: sessionData.id, url: sessionData.url });

    // Record transaction in database
    const { error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        user_id,
        amount,
        currency,
        provider: 'stripe',
        provider_transaction_id: sessionData.id,
        status: 'pending',
        description: is_buzz_map ? 'M1SSION™ Buzz Map Purchase - RESET COMPLETO 17/07/2025' : 'M1SSION™ Buzz Purchase - RESET COMPLETO 17/07/2025'
      });

    if (transactionError) {
      logStep("⚠️ Transaction log error - RESET COMPLETO 17/07/2025", { error: transactionError.message });
    } else {
      logStep("📝 Transaction logged successfully - RESET COMPLETO 17/07/2025");
    }

    // Log buzz action
    const { error: buzzLogError } = await supabaseClient
      .from('buzz_logs')
      .insert({
        user_id,
        step: 'payment_initiated',
        action: 'stripe_checkout_created',
        details: {
          session_id: sessionData.id,
          amount,
          currency,
          is_buzz_map,
          reset_date: '2025-07-17',
          timestamp: new Date().toISOString()
        }
      });

    if (buzzLogError) {
      logStep("⚠️ Buzz log error - RESET COMPLETO 17/07/2025", { error: buzzLogError.message });
    }

    // 🚨 CRITICAL: Verify sessionData.url exists before returning
    if (!sessionData.url) {
      logStep("❌ STRIPE CRITICAL ERROR: sessionData.url is undefined - RESET COMPLETO 17/07/2025", { sessionData });
      throw new Error("Stripe checkout session URL is undefined - configuration error");
    }

    logStep("🎯 M1SSION™ Buzz Purchase Session Created Successfully - RESET COMPLETO 17/07/2025", { 
      url: sessionData.url,
      sessionId: sessionData.id 
    });

    return new Response(JSON.stringify({
      success: true,
      url: sessionData.url,
      session_id: sessionData.id,
      message: "Stripe checkout session created successfully - RESET COMPLETO 17/07/2025"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("❌ ERROR in process-buzz-purchase - RESET COMPLETO 17/07/2025", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
