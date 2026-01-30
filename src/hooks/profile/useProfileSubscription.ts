// @ts-nocheck

// ✅ COMPONENT MODIFICATO
// BY JOSEPH MULE — 2025-07-12
// 🔧 v2: Added in-flight guard to prevent request storms
import { useState, useEffect, useRef, useCallback } from "react";
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
  
  // 🔧 v2: In-flight guard to prevent request storms
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef(0);
  const MIN_FETCH_INTERVAL = 5000; // 5 seconds between fetches

  // M1SSION™ Sistema Sincronizzazione Abbonamenti
  const loadSubscriptionFromSupabase = useCallback(async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) return;
      
      // 🔧 v2: Guard against concurrent/rapid fetches
      const now = Date.now();
      if (isFetchingRef.current) {
        console.log('⏸️ useProfileSubscription: fetch in progress, skipping');
        return;
      }
      if (now - lastFetchRef.current < MIN_FETCH_INTERVAL) {
        console.log('⏸️ useProfileSubscription: too soon, skipping');
        return;
      }
      
      isFetchingRef.current = true;
      lastFetchRef.current = now;

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
      } finally {
        // 🔧 v2: Reset in-flight guard
        isFetchingRef.current = false;
      }
    }, [getCurrentUser, triggerGlobalSync]);

  useEffect(() => {
    loadSubscriptionFromSupabase();

    // 🔧 v2: Removed storage listener - it was causing request storms
    // The hook will refresh when the component remounts
  }, [loadSubscriptionFromSupabase]);

  const upgradeSubscription = async (newPlan: string) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      console.warn(`🔥 M1SSION™ SUBSCRIPTION CHANGE: ${newPlan} for user ${currentUser.id}`);
      
      // 🔐 SECURITY FIX: Only allow FREE tier changes via client
      // Paid upgrades MUST go through Stripe/IAP payment flow
      const normalizedPlan = newPlan.toLowerCase();
      const isDowngradeToFree = normalizedPlan === 'base' || normalizedPlan === 'free';
      
      if (!isDowngradeToFree) {
        // 🚫 BLOCKED: Paid plan upgrades must use payment flow
        console.error('🚫 M1SSION™ SECURITY: Direct paid plan upgrade blocked');
        console.error('🚫 Use Stripe checkout or IAP for paid subscriptions');
        throw new Error('Paid plan upgrades require payment. Use the subscription page.');
      }

      // ✅ SAFE: Downgrade to free tier via secure RPC
      console.warn('🔻 M1SSION™ DOWNGRADE TO FREE via secure RPC');
      
      // Call secure RPC that handles everything server-side
      const { data: rpcResult, error: rpcError } = await supabase.rpc('downgrade_to_free');
      
      if (rpcError) {
        // Fallback: try create_free_subscription
        console.warn('⚠️ downgrade_to_free failed, trying create_free_subscription');
        const { data: freeResult, error: freeError } = await supabase.rpc('create_free_subscription');
        if (freeError) {
          console.error('❌ M1SSION™ Free subscription RPC failed:', freeError);
          throw new Error(`Subscription change failed: ${freeError.message}`);
        }
        console.warn('✅ M1SSION™ Free subscription created via RPC:', freeResult);
      } else {
        console.warn('✅ M1SSION™ Downgrade completed via secure RPC:', rpcResult);
      }
      
      // Also try to cancel Stripe subscription if exists
      try {
        const { data: cancelData, error: cancelStripeError } = await supabase.functions.invoke('cancel-subscription');
        if (cancelStripeError) {
          console.warn('⚠️ M1SSION™ Stripe cancel (non-critical):', cancelStripeError);
        } else {
          console.warn('✅ M1SSION™ Stripe cancellation completed:', cancelData);
        }
      } catch (stripeError) {
        console.warn('⚠️ M1SSION™ Stripe cancel skipped:', stripeError);
      }

      // 🔐 SECURITY: Profile tier is now updated by the RPC (SECURITY DEFINER)
      // No direct client update needed - trust the server
      
      // ✅ SAFE: Force localStorage sync (local display only, not authoritative)
      localStorage.setItem('subscription_plan', 'Base');
      localStorage.setItem('userTier', 'base');
      
      // 🔧 v2: Single refresh after upgrade (not triple!)
      // Reset the guard to allow immediate fetch after upgrade
      isFetchingRef.current = false;
      lastFetchRef.current = 0;
      setTimeout(() => {
        loadSubscriptionFromSupabase();
      }, 500);
      
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
