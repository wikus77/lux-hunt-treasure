// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Verify Subscription Sync Edge Function - Sistema Abbonamenti M1SSION™

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[M1SSION-VERIFY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("🚀 M1SSION™ Verify Subscription Sync Started");

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

    // Check current subscriptions
    const { data: subscriptions } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Check profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('subscription_tier, tier')
      .eq('id', user.id)
      .single();

    logStep("📊 Current state", {
      subscriptions: subscriptions?.map(s => ({ 
        id: s.id, 
        tier: s.tier, 
        status: s.status,
        created_at: s.created_at 
      })),
      profile: profile
    });

    // Find active subscription
    const activeSub = subscriptions?.find(s => s.status === 'active');
    let expectedTier = 'Base';
    
    if (activeSub) {
      expectedTier = activeSub.tier;
      logStep("✅ Active subscription found", { tier: expectedTier });
    } else {
      logStep("ℹ️ No active subscription - should be Base");
    }

    // Developer override
    if (user.email === 'wikus77@hotmail.it') {
      expectedTier = 'Titanium';
      logStep("🔑 Developer override applied", { tier: expectedTier });
    }

    // Check if sync is needed
    const needsSync = profile?.subscription_tier !== expectedTier || profile?.tier !== expectedTier;
    
    if (needsSync) {
      logStep("🔄 Sync needed", { 
        current: { tier: profile?.tier, subscription_tier: profile?.subscription_tier },
        expected: expectedTier 
      });

      // Force sync
      const { error: syncError } = await supabaseClient
        .from('profiles')
        .update({
          subscription_tier: expectedTier,
          tier: expectedTier,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (syncError) {
        logStep("❌ Sync failed", { error: syncError });
        throw new Error(`Sync failed: ${syncError.message}`);
      } else {
        logStep("✅ Sync completed", { newTier: expectedTier });
      }
    } else {
      logStep("✅ Already in sync", { tier: expectedTier });
    }

    return new Response(JSON.stringify({ 
      success: true,
      tier: expectedTier,
      wasSynced: needsSync,
      subscriptionsCount: subscriptions?.length || 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("❌ ERRORE VERIFY", { message: errorMessage });
    
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