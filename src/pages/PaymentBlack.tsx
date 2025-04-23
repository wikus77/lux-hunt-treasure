
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import CardPaymentForm from "@/components/payments/CardPaymentForm";
import ApplePayBox from "@/components/payments/ApplePayBox";
import GooglePayBox from "@/components/payments/GooglePayBox";
import ClueUnlockedExplosion from "@/components/clues/ClueUnlockedExplosion";

const PaymentBlack = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [showExplosion, setShowExplosion] = useState(false);
  const [fadeOutExplosion, setFadeOutExplosion] = useState(false);

  const handlePaymentCompleted = () => {
    setShowExplosion(true);
    setFadeOutExplosion(false);

    setTimeout(() => {
      setFadeOutExplosion(true);
      setTimeout(() => {
        setShowExplosion(false);
        setFadeOutExplosion(false);
        toast.success("Abbonamento Black attivato", {
          description: "Il tuo abbonamento Black è stato attivato con successo!",
        });
        localStorage.setItem("subscription_plan", "Black");
        // Forziamo l'aggiornamento della localStorage per attivare l'evento
        window.dispatchEvent(new Event('storage'));
        navigate("/subscriptions");
      }, 1400);
    }, 1700);
  };

  const handleCardSubmit = () => {
    handlePaymentCompleted();
  };

  const handleApplePay = () => {
    toast.success("Apple Pay", {
      description: "Pagamento con Apple Pay in elaborazione..."
    });
    setTimeout(() => {
      handlePaymentCompleted();
    }, 2000);
  };

  const handleGooglePay = () => {
    toast.success("Google Pay", {
      description: "Pagamento con Google Pay in elaborazione..."
    });
    setTimeout(() => {
      handlePaymentCompleted();
    }, 2000);
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
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Piano Black - €9,99/mese</h1>
      </header>

      <div className="p-4">
        <div className="glass-card mb-6">
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-xl font-semibold">Abbonamento Black</h2>
            <p className="text-muted-foreground">Con questo piano avrai accesso a:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-projectx-neon-blue"></div>
                <span>Tutti i vantaggi Gold</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-projectx-neon-blue"></div>
                <span>Accesso VIP ad eventi esclusivi</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-projectx-neon-blue"></div>
                <span>Premi misteriosi aggiuntivi</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-projectx-neon-blue"></div>
                <span>Badge Black nel profilo</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-between mb-6">
            <button 
              className={`flex flex-col items-center justify-center p-4 rounded-md w-1/3 ${paymentMethod === 'card' ? 'bg-projectx-deep-blue' : 'bg-gray-800'}`}
              onClick={() => setPaymentMethod('card')}
            >
              <span className="text-sm">Carta</span>
            </button>
            
            <button 
              className={`flex flex-col items-center justify-center p-4 rounded-md w-1/3 ${paymentMethod === 'apple' ? 'bg-projectx-deep-blue' : 'bg-gray-800'}`}
              onClick={() => setPaymentMethod('apple')}
            >
              <span className="text-sm">Apple Pay</span>
            </button>
            
            <button 
              className={`flex flex-col items-center justify-center p-4 rounded-md w-1/3 ${paymentMethod === 'google' ? 'bg-projectx-deep-blue' : 'bg-gray-800'}`}
              onClick={() => setPaymentMethod('google')}
            >
              <span className="text-sm">Google Pay</span>
            </button>
          </div>

          {paymentMethod === "card" && (
            <CardPaymentForm onSuccess={handleCardSubmit} />
          )}
          {paymentMethod === "apple" && (
            <ApplePayBox onApplePay={handleApplePay} />
          )}
          {paymentMethod === "google" && (
            <GooglePayBox onGooglePay={handleGooglePay} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentBlack;
