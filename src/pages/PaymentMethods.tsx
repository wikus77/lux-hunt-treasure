import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import CardPaymentForm from '@/components/payments/CardPaymentForm';
import ApplePayBox from '@/components/payments/ApplePayBox';
import GooglePayBox from '@/components/payments/GooglePayBox';
import CheckoutWithStripeButton from "@/components/payments/CheckoutWithStripeButton";

const PaymentMethods = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [backPath, setBackPath] = useState('/settings');
  
  const fromBuzz = location.state?.fromBuzz || false;
  const fromRegularBuzz = location.state?.fromRegularBuzz || false;
  const clue = location.state?.clue;
  const generateMapArea = location.state?.generateMapArea;
  
  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
    
    if (fromBuzz) {
      setBackPath('/buzz');
    }
  }, [fromBuzz]);
  
  const handlePaymentSuccess = () => {
    setPaymentProcessing(true);
    
    setTimeout(() => {
      localStorage.setItem('hasPaymentMethod', 'true');
      
      toast.success("Pagamento completato", {
        description: "Il tuo metodo di pagamento è stato registrato.",
      });
      
      if (fromBuzz) {
        if (fromRegularBuzz) {
          navigate('/buzz', {
            replace: true,
            state: { 
              paymentCompleted: true,
              fromRegularBuzz: true,
              clue: clue
            }
          });
        } else {
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
        navigate('/settings', { replace: true });
      }
    }, 2000);
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
              <CardPaymentForm onSubmit={handlePaymentSuccess} />
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-black text-muted-foreground">
                    oppure paga con
                  </span>
                </div>
              </div>
              <CheckoutWithStripeButton label="Paga subito con Stripe" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
