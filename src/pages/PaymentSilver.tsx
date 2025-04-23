
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import CardPaymentForm from "@/components/payments/CardPaymentForm";
import ClueUnlockedExplosion from "@/components/clues/ClueUnlockedExplosion";

const PaymentSilver = () => {
  const navigate = useNavigate();
  const [showExplosion, setShowExplosion] = useState(false);
  const [fadeOutExplosion, setFadeOutExplosion] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentCompleted = () => {
    setIsProcessing(true);
    setShowExplosion(true);
    setFadeOutExplosion(false);

    setTimeout(() => {
      setFadeOutExplosion(true);
      setTimeout(() => {
        setShowExplosion(false);
        setFadeOutExplosion(false);
        toast.success("Abbonamento Silver attivato", {
          description: "Il tuo abbonamento Silver è stato attivato con successo!",
        });
        localStorage.setItem("subscription_plan", "Silver");
        window.dispatchEvent(new Event('storage'));
        setIsProcessing(false);
        navigate("/subscriptions");
      }, 1400);
    }, 1700);
  };

  const handleCardSubmit = () => {
    handlePaymentCompleted();
  };

  return (
    <div className="min-h-screen bg-black pb-6">
      <ClueUnlockedExplosion
        open={showExplosion}
        fadeOut={fadeOutExplosion}
        onFadeOutEnd={() => {}}
      />
      <header className="px-4 py-6 flex items-center border-b border-projectx-deep-blue">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate(-1)}
          disabled={isProcessing}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Piano Silver - €3,99/mese</h1>
      </header>

      <div className="p-4">
        <div className="glass-card mb-6">
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-xl font-semibold">Abbonamento Silver</h2>
            <p className="text-muted-foreground">Con questo piano avrai accesso a:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-projectx-neon-blue"></div>
                <span>Tutti i vantaggi Base</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-projectx-neon-blue"></div>
                <span>3 indizi premium aggiuntivi a settimana</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-projectx-neon-blue"></div>
                <span>Accesso anticipato ai nuovi eventi</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-projectx-neon-blue"></div>
                <span>Badge Silver nel profilo</span>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <button 
              className="flex flex-col items-center justify-center p-4 rounded-md w-full bg-projectx-deep-blue"
              disabled
            >
              <span className="text-sm">Carta</span>
            </button>
          </div>

          {isProcessing ? (
            <div className="bg-black/20 p-6 rounded-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-projectx-pink mx-auto mb-4"></div>
              <p>Elaborazione del pagamento in corso...</p>
            </div>
          ) : (
            <CardPaymentForm onSuccess={handleCardSubmit} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSilver;
