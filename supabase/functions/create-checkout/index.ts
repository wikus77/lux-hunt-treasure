
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
    price: 399, // €3.99 in cents
  },
  "Gold": {
    name: "Abbonamento Gold",
    description: "Piano mensile Gold con vantaggi esclusivi",
    price: 699, // €6.99 in cents
  },
  "Black": {
    name: "Abbonamento Black",
    description: "Piano mensile Black con vantaggi VIP",
    price: 999, // €9.99 in cents
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
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    const { planType, customPrice, redirectUrl, isBuzz, isMapBuzz, sessionId, paymentMethod } = await req.json();
    
    // Validate required params
    if (!planType) {
      throw new Error("Tipo di abbonamento non specificato");
    }
    
    if (!PLAN_DETAILS[planType] && !customPrice) {
      throw new Error("Piano non valido e prezzo personalizzato non specificato");
    }

    // Get authentication header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Autenticazione richiesta");
    }

    // Setup Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Utente non autenticato");
    }
    
    const user = userData.user;

    // Create Stripe instance
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const { data: customers } = await stripe.customers.search({
      query: `email:'${user.email}'`,
    });

    let customerId;
    if (customers && customers.length > 0) {
      customerId = customers[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    // Set price based on plan or custom price
    const amount = customPrice || PLAN_DETAILS[planType].price;
    
    // Set up payment method options based on request
    const payment_method_types = ["card"];
    
    // Add Apple Pay and Google Pay if requested
    if (paymentMethod === 'apple_pay') {
      payment_method_types.push("apple_pay");
    } else if (paymentMethod === 'google_pay') {
      // For Google Pay, Stripe uses the "card" payment method with Google Pay wallet
      // The frontend needs to handle the Google Pay flow
      console.log("Google Pay payment method requested");
    }

    // Create checkout session based on request type
    let session;
    
    if (isBuzz || isMapBuzz) {
      // One-time payment
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
      
      // Record transaction in database
      await supabaseAdmin.from("payment_transactions").insert({
        user_id: user.id,
        amount: amount / 100, // Convert cents to euros
        description: isMapBuzz ? "Acquisto Buzz Map" : "Acquisto Indizio Extra",
        provider_transaction_id: session.id,
        status: "pending",
        payment_method: paymentMethod || "card"
      });
      
    } else {
      // Subscription payment
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
      
      // Record subscription transaction
      await supabaseAdmin.from("payment_transactions").insert({
        user_id: user.id,
        amount: amount / 100, // Convert cents to euros
        description: `Abbonamento ${planType}`,
        provider_transaction_id: session.id,
        status: "pending",
        payment_method: paymentMethod || "card"
      });
      
      // Create or update subscription record
      await supabaseAdmin.from("subscriptions").upsert({
        user_id: user.id,
        tier: planType,
        provider: "stripe",
        provider_subscription_id: session.id,
        status: "pending",
        payment_method: paymentMethod || "card"
      });
    }

    // Return checkout session URL
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
    // Handle errors
    console.error("Stripe checkout error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
