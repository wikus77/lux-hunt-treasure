// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Stripe Checkout Edge Function - Sistema Abbonamenti M1SSION™

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[M1SSION-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("🚀 M1SSION™ Checkout Started", { 
      method: req.method, 
      url: req.url,
      timestamp: new Date().toISOString()
    });

    // Environment variables check
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    logStep("🔍 M1SSION™ Environment check", {
      stripeKeyExists: !!stripeKey,
      stripeKeyLength: stripeKey?.length || 0,
      supabaseUrlExists: !!supabaseUrl,
      supabaseServiceKeyExists: !!supabaseServiceKey
    });
    
    if (!stripeKey) {
      logStep("❌ M1SSION™ CRITICAL - Missing STRIPE_SECRET_KEY");
      throw new Error("STRIPE_SECRET_KEY non configurato");
    }
    logStep("✅ Stripe key verificata", { keyPrefix: stripeKey.substring(0, 8) + "..." });

    const supabaseClient = createClient(
      supabaseUrl ?? "",
      supabaseServiceKey ?? "",
      { auth: { persistSession: false } }
    );

    // Auth check
    const authHeader = req.headers.get("Authorization");
    logStep("🔍 M1SSION™ Auth header check", { 
      headerExists: !!authHeader,
      headerLength: authHeader?.length || 0
    });
    
    if (!authHeader) {
      logStep("❌ M1SSION™ CRITICAL - Missing Authorization header");
      throw new Error("Header Authorization mancante");
    }
    
    const token = authHeader.replace("Bearer ", "");
    logStep("🔍 M1SSION™ Processing token", { tokenLength: token.length });
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    logStep("🔍 M1SSION™ User lookup result", { 
      hasUserData: !!userData, 
      hasUser: !!userData?.user,
      userError: userError?.message 
    });
    
    if (userError) {
      logStep("❌ M1SSION™ CRITICAL - Auth error", { error: userError });
      throw new Error(`Errore autenticazione: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("❌ M1SSION™ CRITICAL - No user or email", { user: !!user, email: user?.email });
      throw new Error("Utente non autenticato o email mancante");
    }
    logStep("✅ Utente autenticato", { userId: user.id, email: user.email });

    // Body parsing with detailed logging
    let body;
    try {
      const rawBody = await req.text();
      logStep("🔍 M1SSION™ Raw body received", { 
        rawBody: rawBody,
        bodyLength: rawBody.length,
        bodyType: typeof rawBody
      });
      
      body = JSON.parse(rawBody);
      logStep("📋 M1SSION™ Parsed body", { 
        body: body,
        bodyKeys: Object.keys(body || {}),
        plan: body?.plan
      });
    } catch (parseError) {
      logStep("❌ M1SSION™ CRITICAL - Body parse error", { error: parseError.message });
      throw new Error(`Errore parsing body: ${parseError.message}`);
    }
    
    const { plan } = body;
    if (!plan) {
      logStep("❌ M1SSION™ CRITICAL - Missing plan", { bodyReceived: body });
      throw new Error("Piano mancante nel body");
    }
    logStep("📋 Piano richiesto", { plan });

    // Configurazione prezzi corretti M1SSION™ (in centesimi)
    const priceConfig = {
      'Silver': { price: 399, name: 'M1SSION™ Silver' },
      'Gold': { price: 699, name: 'M1SSION™ Gold' },
      'Black': { price: 999, name: 'M1SSION™ Black' },
      'Titanium': { price: 2999, name: 'M1SSION™ Titanium VIP' } // €29.99
    };

    const tierConfig = priceConfig[plan as keyof typeof priceConfig];
    if (!tierConfig) {
      logStep("❌ M1SSION™ CRITICAL - Unsupported plan", { plan, availablePlans: Object.keys(priceConfig) });
      throw new Error(`Piano "${plan}" non supportato`);
    }
    logStep("💰 Configurazione prezzo", tierConfig);

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("✅ Stripe client initialized");

    // Cerca o crea customer Stripe
    logStep("🔍 M1SSION™ Looking for existing customer", { email: user.email });
    let customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    logStep("🔍 M1SSION™ Customer search result", { 
      foundCustomers: customers.data.length,
      customers: customers.data.map(c => ({ id: c.id, email: c.email }))
    });
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("🔍 Customer esistente trovato", { customerId });
    } else {
      logStep("🆕 M1SSION™ Creating new customer", { email: user.email });
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      logStep("✨ Nuovo customer creato", { customerId });
    }

    // Crea sessione checkout Stripe
    const origin = req.headers.get("origin") || "https://vkjrqirvdvjbemsfzxof.supabase.co";
    logStep("🔍 M1SSION™ Creating checkout session", { 
      origin,
      customerId,
      tierConfig,
      plan
    });
    
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: tierConfig.name,
                description: `Piano ${plan} - Accesso premium M1SSION™`
              },
              unit_amount: tierConfig.price,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${origin}/subscriptions?success=true&tier=${plan}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/subscriptions?canceled=true`,
        metadata: {
          user_id: user.id,
          tier: plan,
          session_id: "{CHECKOUT_SESSION_ID}",
          plan: plan
        }
      });
      
      logStep("✅ M1SSION™ Stripe session created successfully", { 
        sessionId: session.id,
        url: session.url,
        customerId: session.customer,
        mode: session.mode
      });
      
    } catch (stripeError) {
      logStep("❌ M1SSION™ CRITICAL - Stripe session creation failed", { 
        error: stripeError.message,
        code: stripeError.code,
        type: stripeError.type
      });
      throw new Error(`Errore Stripe: ${stripeError.message}`);
    }

    // 🚨 CRITICAL: Log checkout session in database
    try {
      const { error: sessionError } = await supabaseClient
        .from('checkout_sessions')
        .insert({
          user_id: user.id,
          session_id: session.id,
          tier: plan,
          status: 'pending',
          stripe_customer_id: customerId,
          amount_total: tierConfig.price,
          currency: 'eur'
        });

      if (sessionError) {
        logStep("⚠️ Warning: Failed to log session", { error: sessionError });
      } else {
        logStep("✅ Session logged in database", { sessionId: session.id });
      }
    } catch (dbError) {
      logStep("⚠️ Warning: Database logging failed", { error: dbError.message });
    }

    const responseData = { 
      url: session.url,
      session_id: session.id 
    };
    
    logStep("✅ Sessione Stripe creata", { 
      sessionId: session.id, 
      url: session.url,
      responseData 
    });

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logStep("❌ ERRORE CRITICO", { 
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      stack: errorStack
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™