
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth";

export const useProfileSubscription = () => {
  const { getCurrentUser } = useAuthContext();
  const [subscription, setSubscription] = useState({
    plan: "Gold",
    expiry: "2025-12-31",
    benefits: ["Accesso prioritario", "Indizi esclusivi", "Supporto dedicato"]
  });
  const [credits, setCredits] = useState(2500);

  useEffect(() => {
    const currentUser = getCurrentUser();
    const isSpecialUser = currentUser?.email === 'wikus77@hotmail.it';
    
    if (isSpecialUser) {
      // Simulate Black subscription for special user
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
    }
  }, [getCurrentUser]);

  return {
    subscription,
    credits,
    setSubscription,
    setCredits
  };
};
