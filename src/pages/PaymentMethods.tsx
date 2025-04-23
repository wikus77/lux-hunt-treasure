
import { useState } from "react";
import { ArrowLeft, CreditCard, AppleIcon, GlobeIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CardPaymentForm from "@/components/payments/CardPaymentForm";
import ApplePayBox from "@/components/payments/ApplePayBox";
import GooglePayBox from "@/components/payments/GooglePayBox";
import ClueUnlockedExplosion from "@/components/clues/ClueUnlockedExplosion";

const PaymentMethods = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  const [showExplosion, setShowExplosion] = useState(false);
  const [fadeOutExplosion, setFadeOutExplosion] = useState(false);

  const clue = location.state?.clue;
  const isBuzzMapPayment = localStorage.getItem('buzzRequest') === 'map';

  const handleIndizioDopoPagamento = () => {
    if (clue) {
      const notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title: "Indizio Sbloccato!",
        description: clue.description,
        date: new Date().toISOString(),
        read: false
      };
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      existingNotifications.push(notification);
      localStorage.setItem('notifications', JSON.stringify(existingNotifications));
    }
  };

  const handlePaymentCompleted = () => {
    if (isBuzzMapPayment) {
      // Se è un pagamento per il Buzz della mappa
      localStorage.setItem('paymentCompleted', 'true');
      toast({
        title: "Pagamento Completato",
        description: "Analisi degli indizi in corso...",
      });
      setTimeout(() => {
        navigate("/map");
      }, 1200);
    } else if (clue) {
      // Se è un pagamento per sbloccare un indizio
      setShowExplosion(true);
      setFadeOutExplosion(false);

      setTimeout(() => {
        setFadeOutExplosion(true);
        setTimeout(() => {
          setShowExplosion(false);
          setFadeOutExplosion(false);
          toast({
            title: "Pagamento Completato",
            description: "Hai sbloccato un nuovo indizio! Vieni a leggerlo nella sezione Notifiche.",
          });
          handleIndizioDopoPagamento();
          navigate("/notifications");
        }, 1400);
      }, 1700);
    } else {
      // Pagamento generico per salvare metodo di pagamento
      toast({
        title: "Pagamento Completato",
        description: "Il tuo metodo di pagamento è stato salvato con successo.",
      });
      setTimeout(() => {
        navigate("/settings");
      }, 1200);
    }
  };

  const handleCardSubmit = () => {
    handlePaymentCompleted();
  };

  const handleApplePay = () => {
    toast({
      title: "Apple Pay",
      description: "Pagamento con Apple Pay in elaborazione..."
    });
    setTimeout(() => {
      handlePaymentCompleted();
    }, 2000);
  };

  const handleGooglePay = () => {
    toast({
      title: "Google Pay",
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
        <h1 className="text-xl font-bold">Metodi di Pagamento</h1>
      </header>

      <div className="p-4">
        <div className="glass-card mb-6">
          {isBuzzMapPayment && (
            <div className="mb-4 p-3 bg-gradient-to-r from-[#4361ee]/20 to-[#7209b7]/20 rounded-md border border-[#7209b7]/40 text-center">
              <h2 className="text-lg font-bold mb-2">Funzione Buzz per la Mappa</h2>
              <p className="text-sm text-white/80">
                Stai per sbloccare la funzionalità di analisi AI degli indizi che ti aiuterà a 
                trovare le aree più probabili sulla mappa. Costo: €5,99
              </p>
            </div>
          )}
          
          <div className="flex justify-between mb-6">
            <button 
              className={`flex flex-col items-center justify-center p-4 rounded-md w-1/3 ${paymentMethod === 'card' ? 'bg-projectx-deep-blue' : 'bg-gray-800'}`}
              onClick={() => setPaymentMethod('card')}
            >
              <CreditCard className="h-6 w-6 mb-2" />
              <span className="text-sm">Carta</span>
            </button>
            
            <button 
              className={`flex flex-col items-center justify-center p-4 rounded-md w-1/3 ${paymentMethod === 'apple' ? 'bg-projectx-deep-blue' : 'bg-gray-800'}`}
              onClick={() => setPaymentMethod('apple')}
            >
              <AppleIcon className="h-6 w-6 mb-2" />
              <span className="text-sm">Apple Pay</span>
            </button>
            
            <button 
              className={`flex flex-col items-center justify-center p-4 rounded-md w-1/3 ${paymentMethod === 'google' ? 'bg-projectx-deep-blue' : 'bg-gray-800'}`}
              onClick={() => setPaymentMethod('google')}
            >
              <GlobeIcon className="h-6 w-6 mb-2" />
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

export default PaymentMethods;
