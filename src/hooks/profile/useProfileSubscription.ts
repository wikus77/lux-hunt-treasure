
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth";

export const useProfileSubscription = () => {
  const { getCurrentUser } = useAuthContext();
  
  // Subscription
  const [subscription, setSubscription] = useState({
    plan: "Gold",
    expiry: "2025-12-31",
    benefits: ["Accesso prioritario", "Indizi esclusivi", "Supporto dedicato"]
  });

  // Wallet
  const [credits, setCredits] = useState(2500);

  useEffect(() => {
    // Check if current user is admin (wikus77@hotmail.it)
    const currentUser = getCurrentUser();
    const isAdminUser = currentUser?.email === 'wikus77@hotmail.it';
    
    if (isAdminUser) {
      // Set maximum subscription (Black) for admin user
      setSubscription({
        plan: "Black",
        expiry: "2030-12-31",
        benefits: [
          "Accesso prioritario",
          "Indizi esclusivi",
          "Supporto dedicato VIP",
          "Contenuti premium illimitati",
          "Leaderboard estesa",
          "Configurazione profilo completa",
          "Gestione indizi avanzata",
          "Cronologia premi completa"
        ]
      });
      setCredits(999999); // Unlimited credits for testing
    }
  }, [getCurrentUser]);

  return {
    subscription,
    credits,
    setSubscription,
    setCredits
  };
};
