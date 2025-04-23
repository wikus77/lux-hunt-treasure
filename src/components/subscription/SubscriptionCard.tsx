
import React, { useState, useEffect } from "react";
import { Check, Badge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

interface SubscriptionFeature {
  text: string;
  included?: boolean;
}

interface SubscriptionCardProps {
  title: string;
  price: string;
  period: string;
  features: SubscriptionFeature[];
  isPopular?: boolean;
  ctaText: string;
  type: "Base" | "Silver" | "Gold" | "Black";
}

const SubscriptionCard = ({
  title,
  price,
  period,
  features,
  isPopular = false,
  ctaText,
  type,
}: SubscriptionCardProps) => {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<string>("Base");
  
  useEffect(() => {
    const savedPlan = localStorage.getItem("subscription_plan");
    if (savedPlan) {
      setCurrentPlan(savedPlan);
    }
    
    // Listen for storage changes to update the UI
    const handleStorageChange = () => {
      const updatedPlan = localStorage.getItem("subscription_plan");
      if (updatedPlan && updatedPlan !== currentPlan) {
        setCurrentPlan(updatedPlan);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [currentPlan]);
  
  const isPlanActive = currentPlan === type;
  const buttonText = isPlanActive ? "Piano Attuale" : ctaText;
  const isMostRequested = type === "Gold";
  
  const handleSubscriptionAction = () => {
    if (isPlanActive) {
      return; // Already on this plan
    }
    
    if (type === "Base") {
      // For Base plan, update directly without payment
      localStorage.setItem("subscription_plan", "Base");
      setCurrentPlan("Base");
      toast.success("Piano Base attivato", {
        description: "Il tuo piano è stato aggiornato a Base"
      });
      // Force localStorage event to trigger event listeners
      window.dispatchEvent(new Event('storage'));
      return;
    }
    
    // For other plans, go to payment page
    navigate(`/payment/${type.toLowerCase()}`);
  };
  
  return (
    <div
      className={`glass-card relative overflow-hidden ${
        isPopular ? "ring-2 ring-projectx-neon-blue" : ""
      } ${isPlanActive ? "ring-2 ring-green-500" : ""}`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-projectx-neon-blue text-black font-bold px-3 py-1 text-xs transform translate-x-2 translate-y-0 rotate-45 origin-top-right">
          Popolare
        </div>
      )}
      
      {isMostRequested && (
        <div className="absolute top-3 left-3 bg-amber-500 text-black font-bold px-2 py-0.5 text-xs rounded-full flex items-center gap-1">
          <Badge className="h-3 w-3" /> Il più richiesto
        </div>
      )}
      
      {isPlanActive && (
        <div className="absolute top-2 left-2 bg-green-500 text-black font-bold px-2 py-0.5 text-xs rounded-full">
          Attivo
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-2xl font-bold">{price}</span>
          <span className="text-sm text-gray-400">/{period}</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-300">{feature.text}</span>
          </div>
        ))}
      </div>

      <Button
        className={`w-full transition-colors ${
          isPlanActive
            ? "bg-gradient-to-r from-green-700 to-green-600 cursor-default"
            : type === "Base" 
              ? (currentPlan === "Base" 
                ? "bg-gradient-to-r from-gray-800 to-gray-700 cursor-default"
                : "bg-gradient-to-r from-gray-700 to-gray-600 hover:opacity-90")
              : "bg-gradient-to-r from-projectx-blue to-projectx-pink hover:opacity-90"
        }`}
        onClick={handleSubscriptionAction}
        disabled={isPlanActive}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default SubscriptionCard;
