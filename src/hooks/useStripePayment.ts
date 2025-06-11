
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

  // CRITICAL FIX: Enhanced BUZZ purchase with forced Stripe activation
  const processBuzzPurchase = async (
    isMapBuzz: boolean = false, 
    customPrice?: number
  ): Promise<boolean> => {
    const currentUser = getCurrentUser();
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';

    // CRITICAL: Developer simulation
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 EMERGENCY FIX: Developer - Simulating Stripe payment');
      
      // Simulate payment processing delay
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLoading(false);
      
      toast.success('🔧 Developer: Pagamento simulato con successo');
      return true;
    }

    if (!currentUser?.id) {
      toast.error('Devi essere loggato per effettuare acquisti');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💳 STRIPE EMERGENCY FIX: Starting payment process...');
      
      const { data: response, error: stripeError } = await supabase.functions.invoke('create-stripe-session', {
        body: {
          planType: isMapBuzz ? 'BuzzMap' : 'Buzz',
          customPrice: customPrice || (isMapBuzz ? 2.99 : 1.99),
          redirectUrl: `${window.location.origin}/payment-success`,
          userId: currentUser.id,
          userEmail: currentUser.email,
          isBuzz: !isMapBuzz,
          isMapBuzz: isMapBuzz
        }
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Errore nella creazione della sessione di pagamento');
      }

      if (!response?.url) {
        throw new Error('URL di checkout non ricevuto');
      }

      console.log('✅ STRIPE EMERGENCY FIX: Opening checkout in new tab');
      window.open(response.url, '_blank');
      
      toast.success('Reindirizzamento a Stripe in corso...');
      return true;

    } catch (error: any) {
      console.error('❌ STRIPE EMERGENCY FIX: Payment failed:', error);
      const errorMessage = error.message || 'Errore nel processo di pagamento';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // CRITICAL FIX: Enhanced subscription processing
  const processSubscription = async (
    planType: 'Silver' | 'Gold' | 'Black',
    paymentMethod: 'card' | 'apple_pay' | 'google_pay' = 'card'
  ): Promise<void> => {
    const currentUser = getCurrentUser();
    
    if (!currentUser?.id) {
      toast.error('Devi essere loggato per effettuare acquisti');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💳 STRIPE EMERGENCY FIX: Creating subscription session...', { planType, paymentMethod });

      const { data: response, error: stripeError } = await supabase.functions.invoke('create-stripe-session', {
        body: {
          planType,
          redirectUrl: `${window.location.origin}/payment-success?plan=${planType}`,
          userId: currentUser.id,
          userEmail: currentUser.email,
          isBuzz: false,
          isMapBuzz: false,
          paymentMethod
        }
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Errore nella creazione della sessione');
      }

      if (!response?.url) {
        throw new Error('URL di checkout non ricevuto');
      }

      console.log('✅ STRIPE EMERGENCY FIX: Subscription session created');
      window.open(response.url, '_blank');

    } catch (error: any) {
      console.error('❌ STRIPE EMERGENCY FIX: Subscription creation failed:', error);
      const errorMessage = error.message || 'Errore nella creazione dell\'abbonamento';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // CRITICAL FIX: Enhanced payment method detection
  const detectPaymentMethodAvailability = () => {
    const applePayAvailable = typeof window !== 'undefined' && 
      typeof (window as any).ApplePaySession !== 'undefined' && 
      (window as any).ApplePaySession.canMakePayments();

    const googlePayAvailable = typeof window !== 'undefined' && 
      /Android/.test(navigator.userAgent);

    return {
      applePayAvailable: applePayAvailable || false,
      googlePayAvailable: googlePayAvailable || false
    };
  };

  const createCheckoutSession = async (options: StripePaymentOptions): Promise<string | null> => {
    const currentUser = getCurrentUser();
    
    if (!currentUser?.id) {
      toast.error('Devi essere loggato per effettuare acquisti');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💳 STRIPE: Creating checkout session...', options);

      const { data: response, error: stripeError } = await supabase.functions.invoke('create-stripe-session', {
        body: {
          planType: options.planType,
          customPrice: options.customPrice,
          redirectUrl: options.redirectUrl || `${window.location.origin}/payment-success`,
          userId: currentUser.id,
          userEmail: currentUser.email,
          isBuzz: options.isBuzz,
          isMapBuzz: options.isMapBuzz,
          paymentMethod: options.paymentMethod || 'card'
        }
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Errore nella creazione della sessione');
      }

      if (!response?.url) {
        throw new Error('URL di checkout non ricevuto');
      }

      console.log('✅ STRIPE: Checkout session created:', response.sessionId);
      return response.url;

    } catch (error: any) {
      console.error('❌ STRIPE: Checkout session creation failed:', error);
      const errorMessage = error.message || 'Errore nella creazione della sessione';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    loading,
    error,
    processBuzzPurchase,
    processSubscription,
    detectPaymentMethodAvailability,
    createCheckoutSession,
    clearError
  };
};
