
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CardPaymentForm from "@/components/payments/CardPaymentForm";
import ApplePayBox from "@/components/payments/ApplePayBox";
import GooglePayBox from "@/components/payments/GooglePayBox";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useToast } from "@/hooks/use-toast";
import { useStripePayment } from "@/hooks/useStripePayment";
import { v4 as uuidv4 } from "uuid";

const PaymentMethods = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = useQueryParams<{ from?: string; price?: string; session?: string }>();
  const { toast: toastHandler } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [isMapBuzz, setIsMapBuzz] = useState(false);
  const [price, setPrice] = useState("1.99");
  const [sessionId, setSessionId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { processBuzzPurchase, loading } = useStripePayment();

  useEffect(() => {
    // Check if we're coming from the map page
    const fromMap = queryParams.from === "map";
    const queryPrice = queryParams.price;
    const querySession = queryParams.session;
    
    if (fromMap) {
      setIsMapBuzz(true);
      if (queryPrice) {
        setPrice(queryPrice);
      }
      if (querySession) {
        setSessionId(querySession);
      } else {
        setSessionId(uuidv4());
      }
    } else {
      // Regular buzz price
      setPrice("1.99");
      // Generate a unique session ID for regular buzz payments
      setSessionId(`buzz_${Date.now()}`);
    }
  }, [queryParams]);

  const handlePaymentCompleted = () => {
    if (isProcessing) return; // Evita doppi invii
    setIsProcessing(true);
    
    // Generate clue message
    const clueMessage = isMapBuzz 
      ? "Questo indizio ti porta in una zona specifica dell'Italia centrale." 
      : "Nuovo indizio extra sbloccato!";

    // Show success notification
    toast.success("Pagamento completato", {
      description: "Il tuo pagamento è stato elaborato con successo!",
    });

    // Set appropriate state based on payment type
    if (isMapBuzz) {
      // Redirect to map with state
      navigate("/map", {
        state: {
          paymentCompleted: true, 
          mapBuzz: true,
          sessionId: sessionId, // Include session ID to prevent duplicates
          clue: { description: clueMessage },
          createdAt: new Date().toISOString()
        },
        replace: true
      });
    } else {
      // Regular buzz, redirect to buzz page
      navigate("/buzz", {
        state: {
          paymentCompleted: true, 
          fromRegularBuzz: true,
          sessionId: sessionId, // Include session ID to prevent duplicates
          clue: { description: clueMessage },
          createdAt: new Date().toISOString()
        },
        replace: true
      });
    }
  };

  const handleCardSubmit = async () => {
    if (isProcessing || loading) return;
    toast.info("Collegamento a Stripe in corso...", {
      description: "Verrai reindirizzato a Stripe per completare il pagamento in modo sicuro.",
      duration: 3000,
    });
    
    // Calculate price in cents for Stripe
    const priceInCents = parseFloat(price) * 100;
    
    // Determine return URL based on payment type
    const redirectUrl = isMapBuzz ? "/map" : "/buzz";
    
    try {
      await processBuzzPurchase(
        isMapBuzz, 
        priceInCents, 
        redirectUrl,
        sessionId
      );
    } catch (error) {
      console.error("Errore durante il processo di pagamento:", error);
      toast.error("Errore di pagamento", {
        description: "Si è verificato un errore durante il processo di pagamento.",
      });
      setIsProcessing(false);
    }
  };

  const handleApplePay = async () => {
    if (isProcessing || loading) return;
    toast.success("Pagamento Rapido", {
      description: "Pagamento in elaborazione..."
    });
    
    // Calculate price in cents for Stripe
    const priceInCents = parseFloat(price) * 100;
    
    // Determine return URL based on payment type
    const redirectUrl = isMapBuzz ? "/map" : "/buzz";
    
    try {
      await processBuzzPurchase(
        isMapBuzz, 
        priceInCents, 
        redirectUrl,
        sessionId
      );
    } catch (error) {
      console.error("Errore durante il pagamento rapido:", error);
      toast.error("Errore di pagamento", {
        description: "Si è verificato un errore durante il pagamento rapido.",
      });
      setIsProcessing(false);
    }
  };

  const handleGooglePay = async () => {
    if (isProcessing || loading) return;
    toast.success("Metodo Alternativo", {
      description: "Pagamento in elaborazione..."
    });
    
    // Calculate price in cents for Stripe
    const priceInCents = parseFloat(price) * 100;
    
    // Determine return URL based on payment type
    const redirectUrl = isMapBuzz ? "/map" : "/buzz";
    
    try {
      await processBuzzPurchase(
        isMapBuzz, 
        priceInCents, 
        redirectUrl,
        sessionId
      );
    } catch (error) {
      console.error("Errore durante il pagamento alternativo:", error);
      toast.error("Errore di pagamento", {
        description: "Si è verificato un errore durante il pagamento alternativo.",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-6">
      <header className="px-4 py-6 flex items-center border-b border-projectx-deep-blue">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">
          {isMapBuzz ? `Buzz Map - €${price}` : `Indizio Extra - €1,99`}
        </h1>
      </header>

      <div className="p-4">
        <div className="glass-card mb-6">
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-xl font-semibold">
              {isMapBuzz ? "Buzz Map" : "Indizio Extra"}
            </h2>
            <p className="text-muted-foreground">
              {isMapBuzz 
                ? "Genera un'area di ricerca sulla mappa basata sugli indizi che possiedi."
                : "Sblocca un indizio extra che potrebbe essere la chiave per trovare l'auto!"}
            </p>
            <div className="bg-projectx-deep-blue/30 p-4 rounded-md border border-projectx-deep-blue/50">
              <p className="text-sm text-cyan-400">
                {isMapBuzz
                  ? "L'area generata sulla mappa ti aiuterà a restringere la zona di ricerca in base agli indizi attuali."
                  : "Gli indizi extra forniscono informazioni aggiuntive non disponibili nel percorso standard."}
              </p>
            </div>
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
              <span className="text-sm">Pagamento Rapido</span>
            </button>
            
            <button 
              className={`flex flex-col items-center justify-center p-4 rounded-md w-1/3 ${paymentMethod === 'google' ? 'bg-projectx-deep-blue' : 'bg-gray-800'}`}
              onClick={() => setPaymentMethod('google')}
            >
              <span className="text-sm">Altro metodo</span>
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
