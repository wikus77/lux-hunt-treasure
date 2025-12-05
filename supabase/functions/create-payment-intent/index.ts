// © 2025 M1SSION™ – Create Payment Intent with Multi-Auth Support

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "npm:stripe@14.25.0";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { getStripeModeFromKey } from "../_shared/stripeConfig.ts";
import { withCors } from "../_shared/cors.ts";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.info(`🔧 [CREATE-PAYMENT-INTENT] ${step}${detailsStr}`);
};

serve(withCors(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method Not Allowed" }), 
      { 
        status: 405, 
        headers: { "content-type": "application/json" }
      }
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Invalid JSON body" 
      }), 
      { 
        status: 400, 
        headers: { "content-type": "application/json" }
      }
    );
  }

  try {
    logStep("Starting payment intent creation", { bodyKeys: Object.keys(body) });
    
    // Get Stripe configuration
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    
    const serverMode = getStripeModeFromKey(stripeKey);
    const keyPrefix = stripeKey.substring(0, 8) + "...";
    
    logStep("Stripe configuration", { mode: serverMode, keyPrefix });
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Multi-path authentication
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      throw new Error("Authentication required: Missing Authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    let userId = "";
    let email = "";
    let authType = "";
    
    // Check for service role with admin smoke test
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      if (payload.iss === "supabase" && payload.role === "service_role" && body._adminSmoke === true) {
        logStep("Service role authentication with admin smoke test");
        userId = 'admin-smoke';
        email = body.email || 'wikus77@hotmail.it';
        authType = 'service-role';
      } else {
        // Regular user authentication
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
        
        if (userError || !userData.user) {
          throw new Error("Authentication failed: Invalid or expired token");
        }

        userId = userData.user.id;
        email = userData.user.email || 'no-email@unknown';
        authType = 'user';
      }
    } catch (authError) {
      // Try regular auth if JWT decode fails
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      
      if (userError || !userData.user) {
        throw new Error("Authentication failed: Invalid or expired token");
      }

      userId = userData.user.id;
      email = userData.user.email || 'no-email@unknown';
      authType = 'user';
    }

    logStep("Authentication result", { 
      authType, 
      userId,
      email 
    });

    // Validate mode if provided
    if (body.mode && body.mode !== serverMode) {
      logStep("Mode mismatch detected", { 
        clientMode: body.mode, 
        serverMode, 
        keyPrefix 
      });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Stripe mode mismatch: contatta il supporto.",
          mismatch: true,
          mode_server: serverMode,
          key_prefix: keyPrefix
        }), 
        { 
          status: 409, 
          headers: { "content-type": "application/json" }
        }
      );
    }

    // Validate amount
    const amount = body.amount ?? body.amountCents;
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new Error("Invalid amount: must be a positive integer");
    }
    
    logStep("Amount validated", { amount });

    // Extract payment details
    const { 
      currency = 'eur', 
      payment_type,
      plan,
      description,
      metadata = {}
    } = body;

    // Check if customer exists
    let customerId;
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: email,
        metadata: { 
          user_id: userId,
          auth_type: authType
        }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      description: description || `M1SSION™ Payment - ${payment_type}`,
      metadata: {
        user_id: userId,
        payment_type: payment_type || 'unknown',
        plan: plan || '',
        auth_type: authType,
        mode: serverMode,
        function: 'create-payment-intent',
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });

    logStep("Payment intent created", { 
      id: paymentIntent.id, 
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

    // Record payment in database (skip for admin smoke tests)
    if (authType !== 'service-role') {
      await supabaseClient.from('payment_intents').insert({
        user_id: userId,
        payment_intent_id: paymentIntent.id,
        plan: plan || payment_type,
        amount: amount,
        currency: currency,
        status: paymentIntent.status
      });
      logStep("Payment intent recorded in database");
    }

    const response = {
      success: true,
      payment_intent_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      clientSecret: paymentIntent.client_secret,
      mode: serverMode,
      status: paymentIntent.status,
      amount: amount,
      currency: currency,
      auth_type: authType,
      timestamp: new Date().toISOString()
    };

    logStep("Response created", { 
      success: true, 
      paymentIntentId: paymentIntent.id,
      mode: serverMode
    });
    
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    // Get server mode for error response
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const serverMode = stripeKey ? getStripeModeFromKey(stripeKey) : 'unknown';
    
    const errorResponse = { 
      success: false,
      error: errorMessage,
      payment_intent_id: null,
      client_secret: null,
      clientSecret: null,
      mode: serverMode,
      debug: {
        timestamp: new Date().toISOString(),
        function: 'create-payment-intent'
      }
    };
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}));
