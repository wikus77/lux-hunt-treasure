// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - Process BUZZ Purchase via Stripe
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
    logStep("🔥 M1SSION™ Buzz Purchase Started");

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

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

    logStep("✅ User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { user_id, amount, is_buzz_map, currency = 'EUR', redirect_url, session_id, mode = 'test' } = await req.json();

    if (!user_id || !amount) {
      throw new Error("Missing required parameters: user_id, amount");
    }

    logStep("📦 Request data", { user_id, amount, is_buzz_map, currency, mode });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("👤 Existing customer found", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id, mission: 'M1SSION' }
      });
      customerId = customer.id;
      logStep("🆕 New customer created", { customerId });
    }

    // Create Stripe Checkout Session
    const origin = req.headers.get("origin") || "https://your-domain.com";
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
              metadata: { mission: 'M1SSION', type: is_buzz_map ? 'buzz_map' : 'buzz_clue' }
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
        session_id: session_id || 'none'
      }
    });

    logStep("💳 Stripe session created", { sessionId: sessionData.id, url: sessionData.url });

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
        description: is_buzz_map ? 'M1SSION™ Buzz Map Purchase' : 'M1SSION™ Buzz Purchase'
      });

    if (transactionError) {
      logStep("⚠️ Transaction log error", { error: transactionError.message });
    } else {
      logStep("📝 Transaction logged successfully");
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
          timestamp: new Date().toISOString()
        }
      });

    if (buzzLogError) {
      logStep("⚠️ Buzz log error", { error: buzzLogError.message });
    }

    logStep("🎯 M1SSION™ Buzz Purchase Session Created Successfully");

    return new Response(JSON.stringify({
      success: true,
      url: sessionData.url,
      session_id: sessionData.id,
      message: "Stripe checkout session created successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("❌ ERROR in process-buzz-purchase", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});