
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CardPaymentForm from "@/components/payments/CardPaymentForm";
import ApplePayBox from "@/components/payments/ApplePayBox";
import GooglePayBox from "@/components/payments/GooglePayBox";
import ClueUnlockedExplosion from "@/components/clues/ClueUnlockedExplosion";
import { useStripePayment } from "@/hooks/useStripePayment";

const PaymentSilver = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [showExplosion, setShowExplosion] = useState(false);
  const [fadeOutExplosion, setFadeOutExplosion] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethodsAvailable, setPaymentMethodsAvailable] = useState({
    applePayAvailable: false,
    googlePayAvailable: false
  });
  
  const { 
    processSubscription, 
    loading, 
    detectPaymentMethodAvailability 
  } = useStripePayment();

  useEffect(() => {
    // Check available payment methods
    const availableMethods = detectPaymentMethodAvailability();
    setPaymentMethodsAvailable(availableMethods);
    
    // If neither Apple Pay nor Google Pay is available, default to card
    if (!availableMethods.applePayAvailable && !availableMethods.googlePayAvailable) {
      setPaymentMethod('card');
    } 
    // If Apple Pay is available on iOS devices, default to it
    else if (availableMethods.applePayAvailable && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      setPaymentMethod('apple');
    } 
    // If Google Pay is available on Android devices, default to it
    else if (availableMethods.googlePayAvailable && /Android/.test(navigator.userAgent)) {
      setPaymentMethod('google');
    }
  }, [detectPaymentMethodAvailability]);

  const handlePaymentCompleted = () => {
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
        // Forziamo l'aggiornamento della localStorage per attivare l'evento
        window.dispatchEvent(new Event('storage'));
        navigate("/subscriptions");
      }, 1400);
    }, 1700);
  };

  const handleCardSubmit = async () => {
    if (isProcessing || loading) return;
    setIsProcessing(true);
    
    toast.info("Collegamento a Stripe in corso...", {
      description: "Verrai reindirizzato a Stripe per completare il pagamento in modo sicuro.",
      duration: 3000,
    });
    
    try {
      await processSubscription("Silver", "card");
    } catch (error) {
      console.error("Errore durante il processo di pagamento:", error);
      toast.error("Errore di pagamento", {
        description: "Si è verificato un errore durante il processo di pagamento.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplePay = async () => {
    if (isProcessing || loading) return;
    setIsProcessing(true);
    
    toast.info("Inizializzazione Apple Pay...", {
      description: "Preparazione del pagamento con Apple Pay in corso.",
      duration: 2000,
    });
    
    try {
      await processSubscription("Silver", "apple_pay");
    } catch (error) {
      console.error("Errore durante il pagamento con Apple Pay:", error);
      toast.error("Errore di pagamento", {
        description: "Si è verificato un errore durante il pagamento con Apple Pay.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGooglePay = async () => {
    if (isProcessing || loading) return;
    setIsProcessing(true);
    
    toast.info("Inizializzazione Google Pay...", {
      description: "Preparazione del pagamento con Google Pay in corso.",
      duration: 2000,
    });
    
    try {
      await processSubscription("Silver", "google_pay");
    } catch (error) {
      console.error("Errore durante il pagamento con Google Pay:", error);
      toast.error("Errore di pagamento", {
        description: "Si è verificato un errore durante il pagamento con Google Pay.",
      });
    } finally {
      setIsProcessing(false);
    }
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
              disabled={!paymentMethodsAvailable.applePayAvailable}
            >
              <span className="text-sm">Apple Pay</span>
            </button>
            
            <button 
              className={`flex flex-col items-center justify-center p-4 rounded-md w-1/3 ${paymentMethod === 'google' ? 'bg-projectx-deep-blue' : 'bg-gray-800'}`}
              onClick={() => setPaymentMethod('google')}
              disabled={!paymentMethodsAvailable.googlePayAvailable}
            >
              <span className="text-sm">Google Pay</span>
            </button>
          </div>

          {paymentMethod === "card" && (
            <CardPaymentForm onSubmit={handleCardSubmit} />
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

export default PaymentSilver;
