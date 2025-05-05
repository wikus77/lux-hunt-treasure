
import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SubscriptionFeature {
  text: string;
}

interface SubscriptionCardProps {
  title: string;
  price: string;
  period: string;
  features: SubscriptionFeature[];
  isPopular: boolean;
  ctaText: string;
  type: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SubscriptionCard = ({
  title,
  price,
  period,
  features,
  isPopular,
  ctaText,
  type,
  isActive = false,
  onClick
}: SubscriptionCardProps) => {
  const getGradient = () => {
    switch (type) {
      case "Silver":
        return "from-gray-400 to-gray-600";
      case "Gold":
        return "from-amber-400 to-amber-600";
      case "Black":
        return "from-gray-900 to-gray-700";
      default:
        return "from-blue-500 to-cyan-600";
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case "Silver":
        return "bg-gray-500";
      case "Gold":
        return "bg-amber-500";
      case "Black":
        return "bg-gray-900";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className={cn(
      "relative glass-card p-6 transition-all",
      isActive && "ring-2 ring-cyan-500",
      isPopular && "transform scale-105 z-10"
    )}>
      {isPopular && (
        <Badge className="absolute -top-2 right-6 bg-gradient-to-r from-indigo-500 to-purple-600">
          Più popolare
        </Badge>
      )}

      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div className="mb-6">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-sm text-gray-400">/{period}</span>
      </div>

      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full mr-2 mt-0.5 bg-gradient-to-r ${getGradient()} flex-shrink-0`}>
              <Check className="h-3 w-3 text-white" />
            </span>
            <span className="text-sm text-gray-300">{feature.text}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onClick}
        disabled={isActive && type !== "Base"}
        className={cn(
          "w-full",
          isActive 
            ? "bg-gradient-to-r from-cyan-600 to-cyan-800"
            : `bg-gradient-to-r ${getGradient()}`
        )}
      >
        {ctaText}
      </Button>
      
      {isActive && (
        <Badge className={`mt-2 w-full flex justify-center ${getBadgeColor()}`}>
          Attualmente attivo
        </Badge>
      )}
    </div>
  );
};

export default SubscriptionCard;
