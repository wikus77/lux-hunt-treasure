
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
  const getTypeStyles = () => {
    switch (type) {
      case "Black":
        return {
          border: "border-gray-800",
          background: "bg-gradient-to-b from-zinc-900 to-black",
          shadow: "shadow-xl shadow-black/20",
          button: "bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white hover:opacity-90 rounded-full"
        };
      case "Gold":
        return {
          border: "border-yellow-700/30",
          background: "bg-gradient-to-b from-zinc-800 to-zinc-900",
          shadow: "shadow-xl shadow-yellow-900/10",
          button: "bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white hover:opacity-90 rounded-full"
        };
      case "Silver":
        return {
          border: "border-zinc-700/30",
          background: "bg-gradient-to-b from-zinc-800 to-zinc-900",
          shadow: "shadow-xl shadow-zinc-900/20",
          button: "bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white hover:opacity-90 rounded-full"
        };
      default:
        return {
          border: "border-zinc-800/30",
          background: "bg-gradient-to-b from-zinc-900 to-black",
          shadow: "shadow-xl shadow-black/20",
          button: "bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white hover:opacity-90 rounded-full"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`rounded-xl ${styles.border} ${isPopular ? 'ring-2 ring-[#7209b7]/50' : ''} overflow-hidden backdrop-blur-lg transition-transform hover:transform hover:scale-[1.01] ${styles.shadow}`}>
      <div className="h-full flex flex-col">
        {isPopular && (
          <div className="py-1.5 px-4 bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-xs text-center font-medium text-white">
            Più Popolare
          </div>
        )}
        
        <div className={`p-6 ${styles.background} flex-grow`}>
          <h3 className="text-xl font-bold mb-1">{title}</h3>
          
          <div className="mt-4 mb-6">
            <span className="text-3xl font-bold">{price}</span>
            {period && <span className="text-sm opacity-80">/{period}</span>}
          </div>
          
          <ul className="mb-6 space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-[#4361ee]" />
                <span className="text-sm text-white/80">{feature.text}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            className={`w-full mt-auto ${styles.button}`}
          >
            {ctaText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
