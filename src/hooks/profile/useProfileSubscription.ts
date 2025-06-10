
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

export const useProfileSubscription = () => {
  const { user } = useAuthContext();
  const [subscription, setSubscription] = useState({
    plan: "Free",
    expiry: "2025-12-31",
    benefits: ["Accesso base agli eventi", "Indizi limitati", "Supporto standard"]
  });
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_end, credits, email')
          .eq('id', user.id)
          .single();

        const isDeveloperUser = profile?.email === 'wikus77@hotmail.it';

        if (profile) {
          let planName = profile.subscription_tier || 'Free';
          let benefits = ["Accesso base agli eventi", "Indizi limitati", "Supporto standard"];
          let userCredits = profile.credits || 0;

          // Special handling for developer user - force Black tier
          if (isDeveloperUser) {
            planName = 'Black';
            benefits = [
              "Accesso prioritario VIP",
              "Indizi illimitati",
              "Supporto dedicato 24/7",
              "Contenuti esclusivi Black",
              "Accesso anticipato alle novità",
              "BUZZ illimitati",
              "Accesso sviluppatore"
            ];
            userCredits = 99999;
          } else {
            // Set benefits based on subscription tier
            switch (planName) {
              case 'Silver':
                benefits = [
                  "Accesso prioritario",
                  "Indizi premium limitati",
                  "Supporto dedicato",
                  "Badge Silver"
                ];
                break;
              case 'Gold':
                benefits = [
                  "Accesso prioritario VIP",
                  "Indizi premium illimitati",
                  "Supporto dedicato 24/7",
                  "Badge Gold",
                  "Accesso anticipato"
                ];
                break;
              case 'Black':
                benefits = [
                  "Accesso prioritario VIP",
                  "Indizi illimitati",
                  "Supporto dedicato 24/7",
                  "Contenuti esclusivi Black",
                  "Accesso anticipato alle novità",
                  "BUZZ illimitati"
                ];
                break;
            }
          }

          setSubscription({
            plan: planName,
            expiry: profile.subscription_end || "2025-12-31",
            benefits
          });
          setCredits(userCredits);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user]);

  return {
    subscription,
    credits,
    setSubscription,
    setCredits,
    loading
  };
};
