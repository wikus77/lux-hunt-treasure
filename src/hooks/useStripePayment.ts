
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';

interface PaymentResult {
  success: boolean;
  error?: string;
}

export const useStripePayment = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  const processBuzzPurchase = async (isBuzzMap: boolean = false, amount: number): Promise<boolean> => {
    if (!user) {
      toast.error('Devi essere loggato per effettuare acquisti');
      return false;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-buzz-purchase', {
        body: {
          user_id: user.id,
          amount,
          is_buzz_map: isBuzzMap,
          currency: 'EUR'
        }
      });

      if (error) {
        console.error('Error processing payment:', error);
        toast.error('Errore nel processare il pagamento');
        return false;
      }

      if (data?.success) {
        toast.success('Pagamento completato con successo!');
        return true;
      } else {
        toast.error('Pagamento fallito');
        return false;
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Errore nel processare il pagamento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const processSubscription = async (plan: string, paymentMethod?: string): Promise<void> => {
    if (!user) {
      toast.error('Devi essere loggato per effettuare acquisti');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          user_id: user.id,
          plan,
          payment_method: paymentMethod || 'card'
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast.error('Errore nel creare la sessione di pagamento');
        return;
      }

      if (data?.url) {
        // Redirect to Stripe checkout
        window.open(data.url, '_blank');
      } else {
        toast.error('Errore nel creare la sessione di pagamento');
      }
    } catch (error) {
      console.error('Subscription processing error:', error);
      toast.error('Errore nel processare l\'abbonamento');
    } finally {
      setLoading(false);
    }
  };

  const detectPaymentMethodAvailability = () => {
    // Detect Apple Pay availability
    const applePayAvailable = window.ApplePaySession && 
      ApplePaySession.canMakePayments && 
      ApplePaySession.canMakePayments();

    // Detect Google Pay availability (basic check)
    const googlePayAvailable = 'PaymentRequest' in window;

    return {
      applePayAvailable: applePayAvailable || false,
      googlePayAvailable: googlePayAvailable || false
    };
  };

  return {
    processBuzzPurchase,
    processSubscription,
    detectPaymentMethodAvailability,
    loading
  };
};
