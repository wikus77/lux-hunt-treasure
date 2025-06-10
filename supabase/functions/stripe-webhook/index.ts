
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature!,
        Deno.env.get("STRIPE_WEBHOOK_SECRET")!
      );
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === "subscription") {
          // Get customer details
          const customer = await stripe.customers.retrieve(session.customer as string);
          const customerEmail = (customer as Stripe.Customer).email;

          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceAmount = subscription.items.data[0].price.unit_amount || 0;
          
          // Get subscription tiers from database for dynamic price matching
          const { data: tiers } = await supabaseAdmin.from("subscription_tiers").select("*");
          const matchedTier = tiers?.find(t => Math.round(t.price_monthly * 100) === priceAmount);
          const tier = matchedTier?.name || "Free";

          // Update profile using stripe_customer_id lookup
          const { data: user } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", session.customer)
            .single();

          if (user) {
            const { error: profileError } = await supabaseAdmin
              .from("profiles")
              .update({
                subscription_tier: tier,
                subscription_start: new Date().toISOString(),
                subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                stripe_customer_id: session.customer
              })
              .eq("id", user.id);

            if (profileError) {
              console.error("Error updating profile:", profileError);
            }
          } else {
            // Fallback: try to find user by email and update stripe_customer_id
            const { data: emailUser } = await supabaseAdmin
              .from("profiles")
              .select("id")
              .eq("email", customerEmail)
              .single();

            if (emailUser) {
              const { error: profileError } = await supabaseAdmin
                .from("profiles")
                .update({
                  subscription_tier: tier,
                  subscription_start: new Date().toISOString(),
                  subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  stripe_customer_id: session.customer
                })
                .eq("id", emailUser.id);

              if (profileError) {
                console.error("Error updating profile:", profileError);
              }
            }
          }

          // Update subscriptions table
          const userId = user?.id || (await supabaseAdmin.from("profiles").select("id").eq("email", customerEmail).single()).data?.id;
          
          if (userId) {
            const { error: subError } = await supabaseAdmin
              .from("subscriptions")
              .upsert({
                user_id: userId,
                tier,
                provider: "stripe",
                provider_subscription_id: session.subscription,
                status: "active",
                start_date: new Date().toISOString(),
                end_date: new Date(subscription.current_period_end * 1000).toISOString()
              });

            if (subError) {
              console.error("Error updating subscription:", subError);
            }
          }

          // Update payment transaction status
          const { error: txError } = await supabaseAdmin
            .from("payment_transactions")
            .update({ status: "completed" })
            .eq("provider_transaction_id", session.id);

          if (txError) {
            console.error("Error updating transaction:", txError);
          }

          console.log(`Subscription created for ${customerEmail} with tier ${tier}`);
        }
        break;

      case "customer.subscription.updated":
        const updatedSub = event.data.object as Stripe.Subscription;
        
        // Update subscription status using stripe_customer_id
        const { data: userForUpdate } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", updatedSub.customer)
          .single();

        if (userForUpdate) {
          const { error: updateError } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: updatedSub.status,
              end_date: new Date(updatedSub.current_period_end * 1000).toISOString()
            })
            .eq("provider_subscription_id", updatedSub.id);

          if (updateError) {
            console.error("Error updating subscription:", updateError);
          }
        }
        break;

      case "customer.subscription.deleted":
        const deletedSub = event.data.object as Stripe.Subscription;
        
        // Update profile to Free tier using stripe_customer_id
        const { data: userForDelete } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", deletedSub.customer)
          .single();

        if (userForDelete) {
          const { error: freeError } = await supabaseAdmin
            .from("profiles")
            .update({
              subscription_tier: "Free",
              subscription_end: new Date().toISOString()
            })
            .eq("id", userForDelete.id);

          if (freeError) {
            console.error("Error updating profile to free:", freeError);
          }

          // Update subscription status
          const { error: cancelError } = await supabaseAdmin
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("provider_subscription_id", deletedSub.id);

          if (cancelError) {
            console.error("Error canceling subscription:", cancelError);
          }

          console.log(`Subscription canceled for user ${userForDelete.id}`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
