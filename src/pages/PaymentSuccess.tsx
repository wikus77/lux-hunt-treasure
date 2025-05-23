
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import ClueUnlockedExplosion from "@/components/clues/ClueUnlockedExplosion";
import { useQueryParams } from "@/hooks/useQueryParams";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const queryParams = useQueryParams<{ plan?: string }>();
  const [plan, setPlan] = useState<string>("Base");
  const [showExplosion, setShowExplosion] = useState(false);
  const [fadeOutExplosion, setFadeOutExplosion] = useState(false);

  useEffect(() => {
    // Get the plan from query parameters
    const planParam = queryParams.plan;
    if (planParam && ["Silver", "Gold", "Black"].includes(planParam)) {
      setPlan(planParam);
      
      // Update local storage with the new plan
      localStorage.setItem("subscription_plan", planParam);
      // Force localStorage update event
      window.dispatchEvent(new Event('storage'));
      
      // Show success animation
      setShowExplosion(true);
      setTimeout(() => {
        setFadeOutExplosion(true);
        setTimeout(() => {
          setShowExplosion(false);
          setFadeOutExplosion(false);
        }, 1400);
      }, 1700);
      
      // Show success toast
      toast.success(`Abbonamento ${planParam} attivato`, {
        description: `Il tuo abbonamento ${planParam} è stato attivato con successo!`,
      });
    }
  }, [queryParams]);

  const getPrice = () => {
    switch (plan) {
      case "Silver": return "€3,99";
      case "Gold": return "€6,99";
      case "Black": return "€9,99";
      default: return "€0";
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <ClueUnlockedExplosion
        open={showExplosion}
        fadeOut={fadeOutExplosion}
        onFadeOutEnd={() => {}}
      />
      
      <div className="glass-card max-w-md w-full p-6 text-center">
        <div className="flex flex-col items-center justify-center mb-6">
          <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Pagamento Completato!</h1>
          <p className="text-muted-foreground">
            Il tuo abbonamento {plan} è stato attivato con successo.
          </p>
        </div>
        
        <div className="bg-projectx-deep-blue/30 p-4 rounded-md border border-projectx-deep-blue/50 mb-6">
          <h3 className="font-semibold mb-2">Dettagli Abbonamento</h3>
          <div className="flex justify-between mb-2">
            <span>Piano:</span>
            <span className="font-semibold">{plan}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Prezzo:</span>
            <span className="font-semibold">{getPrice()}/mese</span>
          </div>
          <div className="flex justify-between">
            <span>Stato:</span>
            <span className="text-green-500 font-semibold">Attivo</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button 
            className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
            onClick={() => navigate("/subscriptions")}
          >
            Gestisci Abbonamento
          </Button>
          
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => navigate("/")}
          >
            Torna alla Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
