
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_DETAILS = {
  "Silver": {
    name: "Abbonamento Silver",
    description: "Piano mensile Silver con vantaggi premium",
    price: 799, // €7.99 in cents
  },
  "Gold": {
    name: "Abbonamento Gold",
    description: "Piano mensile Gold con vantaggi esclusivi",
    price: 1399, // €13.99 in cents
  },
  "Black": {
    name: "Abbonamento Black",
    description: "Piano mensile Black con vantaggi VIP",
    price: 1999, // €19.99 in cents
  },
  "Buzz": {
    name: "Indizio Extra",
    description: "Indizio supplementare",
    price: 199, // €1.99 in cents
  },
  "BuzzMap": {
    name: "Area Ricerca Mappa",
    description: "Genera un'area di ricerca sulla mappa",
    price: 499, // €4.99 in cents
  }
};

serve(async (req) => {
  console.log(`Processing ${req.method} request to create-checkout`);
  
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Token di autorizzazione mancante" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      console.error("Invalid authorization format");
      return new Response(
        JSON.stringify({ success: false, error: "Formato token di autorizzazione non valido" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Invalid token:", authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Token di autorizzazione non valido" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const requestData = await req.json();
    const { planType, customPrice, redirectUrl, isBuzz, isMapBuzz, sessionId, paymentMethod } = requestData;

    if (!planType || typeof planType !== 'string') {
      console.error("Missing or invalid planType parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Parametro planType mancante o non valido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const validPlans = ['Silver', 'Gold', 'Black', 'Buzz', 'BuzzMap'];
    if (!validPlans.includes(planType) && !customPrice) {
      console.error("Invalid planType");
      return new Response(
        JSON.stringify({ success: false, error: "Piano non valido e prezzo personalizzato non specificato" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ Security checks passed for user: ${user.id}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const { data: customers } = await stripe.customers.search({
      query: `email:'${user.email}'`,
    });

    let customerId;
    if (customers && customers.length > 0) {
      customerId = customers[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    const amount = customPrice || PLAN_DETAILS[planType].price;
    const payment_method_types = ["card"];
    
    if (paymentMethod === 'apple_pay') {
      payment_method_types.push("apple_pay");
    } else if (paymentMethod === 'google_pay') {
      console.log("Google Pay payment method requested");
    }

    let session;
    
    if (isBuzz || isMapBuzz) {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types,
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: {
              name: isMapBuzz ? PLAN_DETAILS["BuzzMap"].name : PLAN_DETAILS["Buzz"].name,
              description: isMapBuzz ? PLAN_DETAILS["BuzzMap"].description : PLAN_DETAILS["Buzz"].description,
            },
            unit_amount: customPrice || (isMapBuzz ? PLAN_DETAILS["BuzzMap"].price : PLAN_DETAILS["Buzz"].price),
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${req.headers.get("origin")}${redirectUrl || "/buzz"}?success=true&session_id=${sessionId || ''}`,
        cancel_url: `${req.headers.get("origin")}${redirectUrl || "/buzz"}?canceled=true`,
        metadata: {
          userId: user.id,
          type: isMapBuzz ? "buzzMap" : "buzz",
          sessionId: sessionId || '',
          paymentMethod: paymentMethod || "card"
        },
      });
      
      await supabaseAdmin.from("payment_transactions").insert({
        user_id: user.id,
        amount: amount / 100,
        description: isMapBuzz ? "Acquisto Buzz Map" : "Acquisto Indizio Extra",
        provider_transaction_id: session.id,
        status: "pending",
        payment_method: paymentMethod || "card"
      });
      
    } else {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types,
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: {
              name: PLAN_DETAILS[planType].name,
              description: PLAN_DETAILS[planType].description,
            },
            unit_amount: amount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        }],
        mode: "subscription",
        success_url: `${req.headers.get("origin")}/payment-success?plan=${planType}`,
        cancel_url: `${req.headers.get("origin")}/subscriptions?canceled=true`,
        metadata: {
          userId: user.id,
          subscriptionTier: planType,
          paymentMethod: paymentMethod || "card"
        },
      });
      
      await supabaseAdmin.from("payment_transactions").insert({
        user_id: user.id,
        amount: amount / 100,
        description: `Abbonamento ${planType}`,
        provider_transaction_id: session.id,
        status: "pending",
        payment_method: paymentMethod || "card"
      });
      
      await supabaseAdmin.from("subscriptions").upsert({
        user_id: user.id,
        tier: planType,
        provider: "stripe",
        provider_subscription_id: session.id,
        status: "pending",
        payment_method: paymentMethod || "card"
      });
    }

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Stripe checkout error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Errore del server durante l'elaborazione della richiesta" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
