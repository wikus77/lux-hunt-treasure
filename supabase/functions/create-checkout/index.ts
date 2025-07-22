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
    logStep("🚀 M1SSION™ Checkout Started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY non configurato");
    logStep("✅ Stripe key verificata");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Header Authorization mancante");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Errore autenticazione: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("Utente non autenticato o email mancante");
    logStep("✅ Utente autenticato", { userId: user.id, email: user.email });

    const body = await req.json();
    const { plan } = body;
    if (!plan) throw new Error("Piano mancante nel body");
    logStep("📋 Piano richiesto", { plan });

    // Configurazione prezzi corretti M1SSION™
    const priceConfig = {
      'Silver': { price: 399, name: 'M1SSION™ Silver' },
      'Gold': { price: 699, name: 'M1SSION™ Gold' },
      'Black': { price: 999, name: 'M1SSION™ Black' },
      'Titanium': { price: 2999, name: 'M1SSION™ Titanium VIP' }
    };

    const tierConfig = priceConfig[plan as keyof typeof priceConfig];
    if (!tierConfig) throw new Error(`Piano "${plan}" non supportato`);
    logStep("💰 Configurazione prezzo", tierConfig);

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Cerca o crea customer Stripe
    let customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("🔍 Customer esistente trovato", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      logStep("✨ Nuovo customer creato", { customerId });
    }

    // Crea sessione checkout Stripe
    const origin = req.headers.get("origin") || "https://vkjrqirvdvjbemsfzxof.supabase.co";
    const session = await stripe.checkout.sessions.create({
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
      success_url: `${origin}/subscriptions?success=true&tier=${plan}`,
      cancel_url: `${origin}/subscriptions?canceled=true`,
      metadata: {
        user_id: user.id,
        tier: plan
      }
    });

    logStep("✅ Sessione Stripe creata", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("❌ ERRORE", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™