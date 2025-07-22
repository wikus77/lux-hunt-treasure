
// ✅ COMPONENT MODIFICATO
// BY JOSEPH MULE — 2025-07-12
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

export const useProfileSubscription = () => {
  const { getCurrentUser } = useAuthContext();
  const [subscription, setSubscription] = useState({
    plan: "Base",
    expiry: "2025-12-31",
    benefits: ["Accesso di base", "Missioni standard"]
  });
  const [credits, setCredits] = useState(500);

  // TASK 1 — Sincronizzazione Piano Abbonamento - FIXED SYNC
  useEffect(() => {
    const loadSubscriptionFromSupabase = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      try {
        // Query Supabase for subscription data first (priority source)
        const { data: supabaseSubscription } = await supabase
          .from('subscriptions')
          .select('tier, status, end_date')
          .eq('user_id', currentUser.id)
          .eq('status', 'active')
          .single();

        // Fallback to profiles table if no active subscription
        const { data: profileData } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', currentUser.id)
          .single();

        // Priority: Active subscription > Profile tier > Default Base
        let finalPlan = supabaseSubscription?.tier || profileData?.subscription_tier || "Base";
        
        // Special user handling
        const isSpecialUser = currentUser?.email === 'wikus77@hotmail.it';
        if (isSpecialUser) {
          finalPlan = "Black";
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
          default:
            setSubscription({
              plan: "Base",
              expiry: "2025-12-31", 
              benefits: ["Accesso di base", "Missioni standard"]
            });
            setCredits(500);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      }
    };

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
      // Save to Supabase
      await supabase.from('subscriptions').upsert({
        user_id: currentUser.id,
        tier: newPlan,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Save to localStorage for immediate sync
      localStorage.setItem('subscription_plan', newPlan);
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    }
  };

  return {
    subscription,
    credits,
    setSubscription,
    setCredits,
    upgradeSubscription
  };
};
