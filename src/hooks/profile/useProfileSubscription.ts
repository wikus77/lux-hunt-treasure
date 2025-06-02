
import { useState } from "react";

export const useProfileSubscription = () => {
  // Subscription
  const [subscription, setSubscription] = useState({
    plan: "Gold",
    expiry: "2025-12-31",
    benefits: ["Accesso prioritario", "Indizi esclusivi", "Supporto dedicato"]
  });

  // Wallet
  const [credits, setCredits] = useState(2500);

  return {
    subscription,
    credits,
    setSubscription,
    setCredits
  };
};
