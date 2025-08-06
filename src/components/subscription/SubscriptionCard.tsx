// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
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
      case "Base":
        return "from-green-400 to-green-600";
      case "Silver":
        return "from-gray-400 to-gray-600";
      case "Gold":
        return "from-amber-400 to-amber-600";
      case "Black":
        return "from-gray-900 to-gray-700";
      case "Titanium":
        return "from-purple-500 to-cyan-500";
      default:
        return "from-blue-500 to-cyan-600";
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case "Base":
        return "bg-green-500";
      case "Silver":
        return "bg-gray-500";
      case "Gold":
        return "bg-amber-500";
      case "Black":
        return "bg-gray-900";
      case "Titanium":
        return "bg-gradient-to-r from-purple-500 to-cyan-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div 
      className={cn(
        "relative glass-card p-6",
        isActive 
          ? "ring-2 ring-cyan-500" 
          : "transition-all duration-300 hover:scale-102",
        isPopular && !isActive && "transform scale-105 z-10",
        type === "Titanium" && isActive 
          ? "shadow-[0_0_30px_rgba(168,85,247,0.4)]" 
          : type === "Titanium" && !isActive && "shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]"
      )}
      data-plan={type}
      style={isActive ? { 
        animation: 'none !important', 
        transition: 'none !important',
        pointerEvents: type === "Titanium" ? 'auto' : 'auto'
      } : {}}>
    
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
        onClick={() => {
          console.log(`🔥 M1SSION™ CARD CLICK: ${type} button clicked`);
          if (onClick && !isActive) {
            console.log(`🔧 M1SSION™ Executing onClick for ${type}`);
            onClick();
          } else if (isActive) {
            console.log(`🚫 M1SSION™ Plan ${type} already active - no action`);
          } else {
            console.error(`❌ M1SSION™ No onClick handler for ${type}`);
          }
        }}
        disabled={isActive}
        className={cn(
          "w-full font-semibold",
          isActive 
            ? "bg-gradient-to-r from-cyan-600 to-cyan-800 cursor-not-allowed opacity-75"
            : `bg-gradient-to-r ${getGradient()} transition-all duration-200 hover:scale-102 active:scale-98 cursor-pointer`,
          type === "Titanium" && !isActive && "shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
        )}
        style={isActive ? { 
          animation: 'none !important', 
          transition: 'none !important'
        } : {}}
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