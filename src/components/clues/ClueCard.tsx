
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClueCardProps {
  title: string;
  description: string;
  week: number;
  isLocked: boolean;
  subscriptionType?: "Base" | "Silver" | "Gold" | "Black";
}

export const ClueCard = ({ title, description, week, isLocked, subscriptionType = "Base" }: ClueCardProps) => {
  const navigate = useNavigate();

  // Determina il colore del bordo in base al tipo di abbonamento
  const getBorderClass = () => {
    if (isLocked) return "border-muted";
    switch (subscriptionType) {
      case "Black":
        return "border-gray-800 bg-gradient-to-r from-gray-900 to-black";
      case "Gold":
        return "border-projectx-gold bg-gradient-to-r from-yellow-600 to-projectx-gold";
      case "Silver":
        return "border-gray-400 bg-gradient-to-r from-gray-400 to-gray-300";
      default:
        return "border-projectx-blue";
    }
  };

  const handleUnlockClick = () => {
    // Trasmetti informazioni sull’indizio per il post-pagamento
    navigate("/payment-methods", {
      state: {
        clue: { title, description, week, subscriptionType }
      }
    });
  };

  return (
    <Card className={`w-full mb-4 overflow-hidden ${getBorderClass()}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <span className="text-xs px-2 py-1 rounded-full bg-projectx-deep-blue">
            Settimana {week}
          </span>
        </div>
        <CardDescription>
          {subscriptionType !== "Base" && (
            <span className={`text-xs ${
              subscriptionType === "Black" ? "text-gray-800" : 
              subscriptionType === "Gold" ? "text-projectx-gold" : 
              "text-gray-400"
            }`}>
              Indizio {subscriptionType}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLocked ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Lock className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Questo indizio è bloccato. Sblocca il pacchetto {subscriptionType} per accedere.
            </p>
          </div>
        ) : (
          <p className="text-sm">{description}</p>
        )}
      </CardContent>
      
      {isLocked && (
        <CardFooter className="pt-0">
          <button 
            className="w-full py-2 text-sm bg-gradient-to-r from-projectx-blue to-projectx-pink rounded-md"
            onClick={handleUnlockClick}
          >
            Sblocca Indizio
          </button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ClueCard;
