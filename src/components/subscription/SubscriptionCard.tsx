
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscriptionFeature {
  text: string;
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

export const SubscriptionCard = ({ 
  title, 
  price, 
  period, 
  features, 
  isPopular = false, 
  ctaText,
  type
}: SubscriptionCardProps) => {
  // Determina le classi in base al tipo di abbonamento
  const getTypeStyles = () => {
    switch (type) {
      case "Black":
        return {
          border: "border-gray-800",
          gradient: "bg-gradient-to-b from-gray-900 to-black",
          shadow: "shadow-lg shadow-gray-900/50",
          button: "bg-black hover:bg-gray-900 text-white"
        };
      case "Gold":
        return {
          border: "border-projectx-gold",
          gradient: "bg-gradient-to-b from-yellow-700 to-projectx-gold",
          shadow: "shadow-lg shadow-yellow-600/50",
          button: "bg-projectx-gold hover:bg-yellow-600 text-black"
        };
      case "Silver":
        return {
          border: "border-gray-400",
          gradient: "bg-gradient-to-b from-gray-500 to-gray-300",
          shadow: "shadow-lg shadow-gray-400/50",
          button: "bg-gray-400 hover:bg-gray-500 text-black"
        };
      default:
        return {
          border: "border-projectx-blue",
          gradient: "bg-gradient-to-b from-projectx-blue to-projectx-neon-blue",
          shadow: "shadow-lg shadow-blue-500/50",
          button: "bg-projectx-blue hover:bg-blue-600 text-white"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`rounded-xl p-0.5 ${styles.border} ${isPopular ? 'animate-pulse-border' : ''}`}>
      <div className="rounded-lg overflow-hidden">
        {isPopular && (
          <div className="py-1.5 px-4 bg-projectx-pink text-white text-xs text-center font-medium">
            Più Popolare
          </div>
        )}
        
        <div className={`p-6 ${styles.gradient}`}>
          <h3 className="text-xl font-bold mb-1">{title}</h3>
          
          <div className="mt-4 mb-6">
            <span className="text-3xl font-bold">{price}</span>
            {period && <span className="text-sm opacity-80">/{period}</span>}
          </div>
          
          <ul className="mb-6 space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature.text}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            className={`w-full ${styles.button} ${styles.shadow}`}
          >
            {ctaText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
