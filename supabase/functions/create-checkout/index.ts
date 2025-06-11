
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

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// In-memory rate limiting store (simple implementation)
const rateLimitStore = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 60 seconds

// Rate limiting check
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitStore.get(userId);
  
  if (lastRequest && (now - lastRequest) < RATE_LIMIT_WINDOW) {
    return false; // Rate limit exceeded
  }
  
  rateLimitStore.set(userId, now);
  return true;
}

// Validazione UUID v4
function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

serve(async (req) => {
  console.log(`Processing ${req.method} request to create-checkout`);
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. AUTENTICAZIONE - Verifica Authorization Header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Token di autorizzazione mancante" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Estrai il token Bearer
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      console.error("Invalid authorization format");
      return new Response(
        JSON.stringify({ success: false, error: "Formato token di autorizzazione non valido" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create authenticated Supabase client for token verification
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verifica il token con Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Invalid token:", authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Token di autorizzazione non valido" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authenticatedUserId = user.id;

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: "Formato della richiesta non valido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 2. VALIDAZIONE INPUT COMPLETA
    const { planType, customPrice, redirectUrl, isBuzz, isMapBuzz, sessionId, paymentMethod } = requestData;

    // Validazione planType (obbligatorio)
    if (!planType || typeof planType !== 'string') {
      console.error("Missing or invalid planType parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Parametro planType mancante o non valido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validazione che planType sia tra quelli consentiti
    const validPlans = ['Silver', 'Gold', 'Black', 'Buzz', 'BuzzMap'];
    if (!validPlans.includes(planType) && !customPrice) {
      console.error("Invalid planType");
      return new Response(
        JSON.stringify({ success: false, error: "Piano non valido e prezzo personalizzato non specificato" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validazione customPrice se presente
    if (customPrice !== undefined && (typeof customPrice !== 'number' || customPrice <= 0)) {
      console.error("Invalid customPrice parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Parametro customPrice deve essere un numero positivo" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validazione parametri booleani
    if (isBuzz !== undefined && typeof isBuzz !== 'boolean') {
      console.error("Invalid isBuzz parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Parametro isBuzz deve essere un boolean" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (isMapBuzz !== undefined && typeof isMapBuzz !== 'boolean') {
      console.error("Invalid isMapBuzz parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Parametro isMapBuzz deve essere un boolean" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validazione sessionId se presente
    if (sessionId !== undefined && typeof sessionId !== 'string') {
      console.error("Invalid sessionId parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Parametro sessionId deve essere una stringa" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validazione redirectUrl se presente
    if (redirectUrl !== undefined && typeof redirectUrl !== 'string') {
      console.error("Invalid redirectUrl parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Parametro redirectUrl deve essere una stringa" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validazione paymentMethod se presente
    if (paymentMethod !== undefined && typeof paymentMethod !== 'string') {
      console.error("Invalid paymentMethod parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Parametro paymentMethod deve essere una stringa" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 3. RATE LIMITING - Controllo spam (1 checkout ogni 60 secondi)
    if (!checkRateLimit(authenticatedUserId)) {
      console.error(`Rate limit exceeded for user: ${authenticatedUserId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Troppi tentativi. Attendi 60 secondi prima di creare un nuovo checkout" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ Security checks passed for user: ${authenticatedUserId}`);

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
    // Handle errors securely
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
