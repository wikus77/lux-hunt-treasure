// @ts-nocheck

// ✅ COMPONENT MODIFICATO
// BY JOSEPH MULE — 2025-07-12
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useUniversalSubscriptionSync } from "@/hooks/useUniversalSubscriptionSync";

export const useProfileSubscription = () => {
  const { getCurrentUser } = useAuthContext();
  const { triggerGlobalSync } = useUniversalSubscriptionSync();
  const [subscription, setSubscription] = useState({
    plan: "Base",
    expiry: "2025-12-31",
    benefits: ["Accesso di base", "Missioni standard"]
  });
  const [credits, setCredits] = useState(500);

  // M1SSION™ Sistema Sincronizzazione Abbonamenti
  const loadSubscriptionFromSupabase = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      try {
        // PRIORITÀ 1: Subscription attiva (silent error handling)
        const { data: activeSubscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

        // PRIORITÀ 2: Fallback profilo
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier, tier')
          .eq('id', currentUser.id)
          .single();

        if (profileError) return; // Silent fail

        // Determina piano finale con logica prioritaria
        let finalPlan = "Base";
        
        if (!subError && activeSubscription && activeSubscription.length > 0) {
          const sub = activeSubscription[0];
          const isExpired = sub.end_date && new Date(sub.end_date) < new Date();
          
          if (!isExpired) {
            finalPlan = sub.tier;
          }
        } else if (profileData?.subscription_tier) {
          finalPlan = profileData.subscription_tier;
        }

        // Update subscription based on active plan
        switch (finalPlan) {
          case "Silver":
            setSubscription({
              plan: "Silver",
              expiry: "2025-12-31",
              benefits: ["Accesso prioritario", "Indizi esclusivi", "Supporto dedicato"]
            });
            setCredits(1500);
            break;
          case "Gold":
            setSubscription({
              plan: "Gold", 
              expiry: "2025-12-31",
              benefits: ["Accesso prioritario", "Indizi esclusivi", "Supporto dedicato", "Contenuti premium"]
            });
            setCredits(2500);
            break;
          case "Black":
            setSubscription({
              plan: "Black",
              expiry: "2025-12-31",
              benefits: [
                "Accesso prioritario VIP",
                "Indizi esclusivi premium", 
                "Supporto dedicato 24/7",
                "Contenuti esclusivi Black",
                "Accesso anticipato alle novità"
              ]
            });
            setCredits(10000);
            break;
          case "Titanium":
            setSubscription({
              plan: "Titanium",
              expiry: "2025-12-31",
              benefits: [
                "Accesso illimitato a tutto",
                "Badge Titanium esclusivo neon",
                "Supporto prioritario 24/7",
                "Eventi esclusivi Titanium VIP",
                "Contenuti premium anticipati"
              ]
            });
            setCredits(25000);
            break;
          default:
            setSubscription({
              plan: "Base",
              expiry: "2025-12-31", 
              benefits: ["Accesso di base", "Missioni standard"]
            });
            setCredits(500);
        }
        
        // 🚨 CRITICAL: Trigger universal sync after plan is set
        triggerGlobalSync(finalPlan);
        
      } catch (error) {
        // Silent error - don't flood console
      }
    };

  useEffect(() => {
    loadSubscriptionFromSupabase();

    // Listen for localStorage changes to sync across tabs
    const handleStorageChange = () => {
      loadSubscriptionFromSupabase();
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [getCurrentUser]);

  const upgradeSubscription = async (newPlan: string) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      console.warn(`🔥 M1SSION™ UPGRADE STARTED: ${newPlan} for user ${currentUser.id}`);
      
      // 🚨 CRITICAL FIX: Cancel ALL existing subscriptions regardless of status
      console.warn(`🧹 M1SSION™ CLEANUP: Canceling ALL existing subscriptions`);
      const { error: cancelAllError } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('user_id', currentUser.id)
        .neq('status', 'canceled');
      
      if (cancelAllError) {
        console.error('❌ M1SSION™ Error canceling existing subscriptions:', cancelAllError);
      } else {
        console.warn('✅ M1SSION™ All existing subscriptions canceled');
      }

      // 🚨 CRITICAL FIX: If downgrading to Base, force complete cleanup
      if (newPlan === 'Base') {
        console.warn('🔻 M1SSION™ FORCING BASE DOWNGRADE');
        
        try {
          const { data: cancelData, error: cancelStripeError } = await supabase.functions.invoke('cancel-subscription');
          if (cancelStripeError) {
            console.error('❌ M1SSION™ Stripe cancel error:', cancelStripeError);
          } else {
            console.warn('✅ M1SSION™ Stripe cancellation completed:', cancelData);
          }
        } catch (stripeError) {
          console.error('❌ M1SSION™ Stripe cancel failed:', stripeError);
        }
      } else {
        // 🚨 CRITICAL FIX: For paid plans, create new subscription
        console.warn(`💰 M1SSION™ CREATING NEW SUBSCRIPTION: ${newPlan}`);
        const { error: insertError } = await supabase.from('subscriptions').insert({
          user_id: currentUser.id,
          tier: newPlan,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          provider: 'stripe'
        });

        if (insertError) {
          console.error('❌ M1SSION™ Error creating subscription:', insertError);
        } else {
          console.warn('✅ M1SSION™ New subscription created');
        }
      }

      // 🚨 CRITICAL FIX: FORCE profile update ALWAYS
      console.warn(`🎯 M1SSION™ FORCING PROFILE UPDATE: ${newPlan}`);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: newPlan,
          tier: newPlan,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (profileError) {
        console.error('❌ M1SSION™ CRITICAL PROFILE UPDATE ERROR:', profileError);
        throw new Error(`Profile update failed: ${profileError.message}`);
      } else {
        console.warn(`✅ M1SSION™ PROFILE FORCED TO: ${newPlan}`);
      }

      // 🚨 CRITICAL FIX: Force localStorage sync
      localStorage.setItem('subscription_plan', newPlan);
      localStorage.setItem('userTier', newPlan);
      window.dispatchEvent(new Event('storage'));
      
      // 🚨 CRITICAL FIX: Force immediate UI state update (triplo refresh per sincronizzazione garantita)
      setTimeout(() => {
        loadSubscriptionFromSupabase();
      }, 100);
      
      // 🚨 CRITICAL FIX: Force component refresh after delay to ensure DB consistency
      setTimeout(() => {
        loadSubscriptionFromSupabase();
      }, 1000);
      
      // 🚨 CRITICAL FIX: Final safety refresh for persistent state sync
      setTimeout(() => {
        loadSubscriptionFromSupabase();
      }, 3000);
      
      console.warn(`✅ M1SSION™ UPGRADE COMPLETE: ${newPlan}`);
      
    } catch (error) {
      console.error('❌ M1SSION™ CRITICAL UPGRADE ERROR:', error);
      throw error;
    }
  };

  return {
    subscription,
    credits,
    setSubscription,
    setCredits,
    upgradeSubscription,
    refreshSubscription: loadSubscriptionFromSupabase
  };
};
