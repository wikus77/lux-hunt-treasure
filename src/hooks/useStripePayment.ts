
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
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
  const { getCurrentUser } = useAuthContext();

  const createCheckoutSession = async (options: StripePaymentOptions) => {
    const currentUser = getCurrentUser();
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';

    // CRITICAL: Developer bypass
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 Developer mode: Bypassing Stripe checkout');
      toast.success('✅ Developer: Pagamento simulato con successo');
      return { success: true, developer_mode: true };
    }

    setLoading(true);
    setError(null);

    try {
      // Track checkout start event
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('checkout_start');
      }

      console.log('🚀 Creating Stripe checkout session:', options);

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
        console.error('❌ Stripe checkout error:', error);
        throw new Error(error.message);
      }

      if (!data?.url) {
        throw new Error('Errore nella creazione della sessione di pagamento');
      }

      console.log('✅ Stripe checkout session created:', data.url);

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      
      return data;
    } catch (err: any) {
      console.error('❌ Stripe checkout exception:', err);
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
