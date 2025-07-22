
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

  // M1SSION™ Sistema Sincronizzazione Abbonamenti
  useEffect(() => {
    const loadSubscriptionFromSupabase = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      try {
        console.log('🔄 M1SSION™ Checking active subscriptions...');
        
        // PRIORITÀ 1: Subscription attiva
        const { data: activeSubscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

        // PRIORITÀ 2: Fallback profilo
        const { data: profileData } = await supabase
          .from('profiles')
          .select('subscription_tier, tier')
          .eq('id', currentUser.id)
          .single();

        // Determina piano finale con logica prioritaria
        let finalPlan = "Base";
        
        if (activeSubscription && activeSubscription.length > 0) {
          const sub = activeSubscription[0];
          const isExpired = sub.end_date && new Date(sub.end_date) < new Date();
          
          if (!isExpired) {
            finalPlan = sub.tier;
            console.log('✅ M1SSION™ Active subscription found:', finalPlan);
          }
        } else if (profileData?.subscription_tier) {
          finalPlan = profileData.subscription_tier;
          console.log('📋 M1SSION™ Using profile tier:', finalPlan);
        }
        
        // Override speciale per developer
        if (currentUser?.email === 'wikus77@hotmail.it') {
          finalPlan = "Titanium";
          console.log('🔑 M1SSION™ Developer override: Titanium');
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
