
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  
  const handleSubscriptionAction = () => {
    if (type === "Base" || ctaText.includes("Piano Attuale")) {
      return; // Already on this plan
    }
    
    navigate(`/payment/${type.toLowerCase()}`);
  };
  
  return (
    <div
      className={`glass-card relative overflow-hidden ${
        isPopular ? "ring-2 ring-projectx-neon-blue" : ""
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-projectx-neon-blue text-black font-bold px-3 py-1 text-xs transform translate-x-2 translate-y-0 rotate-45 origin-top-right">
          Popolare
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
          type === "Base" || ctaText.includes("Piano Attuale")
            ? "bg-gradient-to-r from-gray-800 to-gray-700 cursor-default"
            : "bg-gradient-to-r from-projectx-blue to-projectx-pink hover:opacity-90"
        }`}
        onClick={handleSubscriptionAction}
        disabled={type === "Base" || ctaText.includes("Piano Attuale")}
      >
        {ctaText}
      </Button>
    </div>
  );
};

export default SubscriptionCard;
