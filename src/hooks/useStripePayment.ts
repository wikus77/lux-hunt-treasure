
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

      // CRITICAL: Show payment processing toast
      toast.info("Reindirizzamento a Stripe", {
        description: "Apertura pagina di pagamento...",
        duration: 2000,
      });

      // FIXED: Use window.location.href instead of window.open to avoid popup blockers
      console.log('🔗 Redirecting to Stripe Checkout:', data.url);
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

  // CRITICAL: Enhanced BUZZ purchase validation with MANDATORY payment check
  const processBuzzPurchase = async (
    isMapBuzz = false, 
    customPrice?: number, 
    redirectUrl?: string, 
    sessionId?: string,
    paymentMethod?: 'card' | 'apple_pay' | 'google_pay'
  ): Promise<boolean> => {
    console.log('💳 Processing BUZZ purchase - PAYMENT REQUIRED:', {
      isMapBuzz,
      customPrice,
      mandatory: true,
      sessionId
    });

    try {
      // Check for active subscription first
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user?.id) {
        toast.error('Accesso richiesto', {
          description: 'Devi essere loggato per utilizzare questa funzione.'
        });
        return false;
      }

      // Check for developer bypass ONLY for wikus77@hotmail.it
      const isDeveloper = currentUser.data.user?.email === 'wikus77@hotmail.it';
      
      if (isDeveloper) {
        console.log('🔓 Developer payment bypass - REAL EMAIL VERIFIED');
        toast.success('Pagamento sviluppatore autorizzato');
        return true;
      }

      // MANDATORY: Check for active subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('status, tier')
        .eq('user_id', currentUser.data.user.id)
        .eq('status', 'active')
        .single();

      if (!subError && subscription) {
        console.log('✅ Active subscription found, allowing action');
        return true;
      }

      // CRITICAL: No subscription found, payment is MANDATORY
      console.log('💳 No active subscription, payment REQUIRED');

      // Log payment requirement
      try {
        await supabase.from('abuse_logs').insert({
          user_id: currentUser.data.user.id,
          event_type: isMapBuzz ? 'buzz_map_payment_attempt' : 'buzz_payment_attempt'
        });
      } catch (error) {
        console.error("Failed to log payment attempt:", error);
      }

      const result = await createCheckoutSession({
        planType: isMapBuzz ? 'BuzzMap' : 'Buzz',
        customPrice,
        redirectUrl,
        isBuzz: !isMapBuzz,
        isMapBuzz,
        sessionId,
        paymentMethod
      });

      // CRITICAL: For BUZZ purchases, payment is MANDATORY for non-subscribers
      if (!result) {
        console.error('❌ Payment session creation failed');
        toast.error('Pagamento richiesto', {
          description: 'È necessario completare il pagamento per continuare.'
        });
        return false;
      }

      console.log('✅ Payment session created successfully, redirecting to Stripe');
      return true;
    } catch (error) {
      console.error('❌ BUZZ payment error:', error);
      toast.error('Errore di pagamento', {
        description: 'Impossibile processare il pagamento.'
      });
      return false;
    }
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
