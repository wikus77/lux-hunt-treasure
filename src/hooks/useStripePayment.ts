
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
  paymentMethod?: 'card' | 'apple_pay' | 'google_pay';
}

export const useStripePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (options: StripePaymentOptions) => {
    setLoading(true);
    setError(null);

    try {
      // Track checkout start event
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('checkout_start');
      }

      // Log the payment method being used
      const paymentMethodLog = options.paymentMethod 
        ? `Usando ${options.paymentMethod === 'apple_pay' ? 'Apple Pay' : options.paymentMethod === 'google_pay' ? 'Google Pay' : 'carta di credito'}`
        : 'Usando metodo di pagamento standard';
      console.log(paymentMethodLog);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planType: options.planType,
          customPrice: options.customPrice,
          redirectUrl: options.redirectUrl,
          isBuzz: options.isBuzz,
          isMapBuzz: options.isMapBuzz,
          sessionId: options.sessionId,
          paymentMethod: options.paymentMethod || 'card',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.url) {
        throw new Error('Errore nella creazione della sessione di pagamento');
      }

      // If the payment method is Apple Pay or Google Pay, show appropriate message
      if (options.paymentMethod) {
        const methodName = options.paymentMethod === 'apple_pay' ? 'Apple Pay' : 
                          options.paymentMethod === 'google_pay' ? 'Google Pay' : 'carta di credito';
        toast.info(`Pagamento con ${methodName}`, {
          description: `Stai per pagare con ${methodName}`,
          duration: 3000,
        });
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

  const processSubscription = async (planType: 'Silver' | 'Gold' | 'Black', paymentMethod?: 'card' | 'apple_pay' | 'google_pay') => {
    return createCheckoutSession({
      planType,
      paymentMethod
    });
  };

  const processBuzzPurchase = async (
    isMapBuzz = false, 
    customPrice?: number, 
    redirectUrl?: string, 
    sessionId?: string,
    paymentMethod?: 'card' | 'apple_pay' | 'google_pay'
  ) => {
    return createCheckoutSession({
      planType: isMapBuzz ? 'BuzzMap' : 'Buzz',
      customPrice,
      redirectUrl,
      isBuzz: !isMapBuzz,
      isMapBuzz,
      sessionId,
      paymentMethod
    });
  };

  const detectPaymentMethodAvailability = () => {
    const isApplePayAvailable = typeof window.ApplePaySession !== 'undefined' && window.ApplePaySession?.canMakePayments();
    const isGooglePayAvailable = typeof window.google !== 'undefined' && typeof window.google.payments !== 'undefined';
    
    return {
      applePayAvailable: isApplePayAvailable,
      googlePayAvailable: isGooglePayAvailable
    };
  };

  return {
    loading,
    error,
    processSubscription,
    processBuzzPurchase,
    detectPaymentMethodAvailability
  };
};
