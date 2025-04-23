
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import CardPaymentForm from '@/components/payments/CardPaymentForm';
import ApplePayBox from '@/components/payments/ApplePayBox';
import GooglePayBox from '@/components/payments/GooglePayBox';

const PaymentMethods = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [backPath, setBackPath] = useState('/settings');
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  
  // Estrai parametri dalla location state
  const fromBuzz = location.state?.fromBuzz || false;
  const fromRegularBuzz = location.state?.fromRegularBuzz || false;
  const clue = location.state?.clue;
  const generateMapArea = location.state?.generateMapArea;
  
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
    
    // Determina il percorso di ritorno
    if (fromBuzz) {
      setBackPath('/buzz');
    }
  }, [fromBuzz]);
  
  const handlePaymentSuccess = () => {
    try {
      console.log("Payment success triggered");
      setPaymentProcessing(true);
      
      // Simula elaborazione pagamento
      setTimeout(() => {
        localStorage.setItem('hasPaymentMethod', 'true');
        
        toast.success("Pagamento completato", {
          description: "Il tuo metodo di pagamento è stato registrato.",
        });
        
        // Reindirizza in base alla fonte
        if (fromBuzz) {
          if (fromRegularBuzz) {
            // Se proviene dalla sezione Buzz standard
            navigate('/buzz', {
              replace: true,
              state: { 
                paymentCompleted: true,
                fromRegularBuzz: true,
                clue: clue
              }
            });
          } else {
            // Se proviene dalla mappa interattiva
            navigate('/map', {
              replace: true,
              state: { 
                paymentCompleted: true,
                mapBuzz: true,
                clue: clue,
                generateMapArea: generateMapArea
              }
            });
          }
        } else {
          // Altrimenti torna alle impostazioni
          navigate('/settings', { replace: true });
        }
      }, 2000);
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("Errore durante il pagamento", {
        description: "Si è verificato un errore. Riprova più tardi.",
      });
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      <UnifiedHeader profileImage={profileImage} />
      <div className="h-[72px]"></div>
      
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Metodi di Pagamento</h1>
          <button
            onClick={() => navigate(backPath)}
            className="text-sm text-muted-foreground"
          >
            Annulla
          </button>
        </div>
        
        <div className="space-y-6">
          {paymentProcessing ? (
            <div className="bg-black/20 p-6 rounded-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-projectx-pink mx-auto mb-4"></div>
              <p>Elaborazione del pagamento in corso...</p>
            </div>
          ) : (
            <>
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
                <CardPaymentForm onSubmit={handlePaymentSuccess} />
              )}
              {paymentMethod === "apple" && (
                <ApplePayBox onApplePay={handlePaymentSuccess} />
              )}
              {paymentMethod === "google" && (
                <GooglePayBox onGooglePay={handlePaymentSuccess} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
