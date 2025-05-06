
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StripePaymentOptions {
  planType: 'Silver' | 'Gold' | 'Black' | 'Buzz' | 'BuzzMap';
  customPrice?: number;
  redirectUrl?: string;
  isBuzz?: boolean;
  isMapBuzz?: boolean;
  sessionId?: string;
}

export const useStripePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (options: StripePaymentOptions) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planType: options.planType,
          customPrice: options.customPrice,
          redirectUrl: options.redirectUrl,
          isBuzz: options.isBuzz,
          isMapBuzz: options.isMapBuzz,
          sessionId: options.sessionId,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.url) {
        throw new Error('Errore nella creazione della sessione di pagamento');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
      return data;
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'Si è verificato un errore durante il checkout');
      toast.error('Errore di pagamento', {
        description: err.message || 'Si è verificato un errore durante il checkout',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processSubscription = async (planType: 'Silver' | 'Gold' | 'Black') => {
    return createCheckoutSession({
      planType,
    });
  };

  const processBuzzPurchase = async (isMapBuzz = false, customPrice?: number, redirectUrl?: string, sessionId?: string) => {
    return createCheckoutSession({
      planType: isMapBuzz ? 'BuzzMap' : 'Buzz',
      customPrice,
      redirectUrl,
      isBuzz: !isMapBuzz,
      isMapBuzz,
      sessionId
    });
  };

  return {
    loading,
    error,
    processSubscription,
    processBuzzPurchase,
  };
};
