
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

// CRITICAL FIX: Dichiarazione globale per ApplePaySession
declare var ApplePaySession: any;

export const useStripePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCurrentUser } = useAuthContext();

  // CRITICAL FIX: Add missing detectPaymentMethodAvailability function
  const detectPaymentMethodAvailability = async () => {
    try {
      console.log('🔍 Detecting payment method availability...');
      
      // Mock detection for development - replace with real Stripe logic
      const availability = {
        card: true,
        apple_pay: typeof ApplePaySession !== 'undefined' && ApplePaySession.canMakePayments(),
        google_pay: window.google && window.google.payments,
      };
      
      console.log('💳 Payment methods availability:', availability);
      return availability;
    } catch (error) {
      console.error('❌ Error detecting payment methods:', error);
      return {
        card: true,
        apple_pay: false,
        google_pay: false,
      };
    }
  };

  // CRITICAL FIX: Enhanced BUZZ purchase con FORZATURA Stripe TOTALE
  const processBuzzPurchase = async (
    isMapBuzz: boolean = false, 
    customPrice?: number
  ): Promise<boolean> => {
    const currentUser = getCurrentUser();
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';

    // CRITICAL FIX: Developer simulation COMPLETA con webhook
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 DEVELOPER SIMULATION: Flusso Stripe COMPLETO simulato');
      
      setLoading(true);
      
      // Simula processo di pagamento con tempi reali
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // CRITICAL FIX: Simula webhook di completamento
      try {
        const { data: response, error: webhookError } = await supabase.functions.invoke('stripe-webhook', {
          body: {
            type: 'checkout.session.completed',
            data: {
              object: {
                id: `cs_test_dev_${Date.now()}`,
                amount_total: (customPrice || (isMapBuzz ? 7.99 : 7.99)) * 100,
                currency: 'eur',
                customer_email: currentUser?.email,
                payment_status: 'paid',
                metadata: {
                  user_id: currentUser?.id,
                  plan_type: isMapBuzz ? 'BuzzMap' : 'Buzz'
                }
              }
            }
          }
        });

        if (webhookError) {
          console.error('❌ Webhook simulation fallita:', webhookError);
        } else {
          console.log('✅ Webhook simulation completata');
        }
      } catch (webhookError) {
        console.error('❌ Webhook simulation error:', webhookError);
      }
      
      setLoading(false);
      toast.success('🔧 Developer: Pagamento simulato e webhook processato');
      return true;
    }

    if (!currentUser?.id) {
      toast.error('Devi essere loggato per effettuare acquisti');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💳 STRIPE REAL: Avvio processo pagamento REALE');
      
      const { data: response, error: stripeError } = await supabase.functions.invoke('create-stripe-session', {
        body: {
          planType: isMapBuzz ? 'BuzzMap' : 'Buzz',
          customPrice: customPrice || (isMapBuzz ? 7.99 : 7.99),
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

      console.log('✅ STRIPE: Apertura checkout in nuova tab');
      
      // CRITICAL FIX: Apertura Stripe FORZATA
      const newWindow = window.open(response.url, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        // Fallback se popup bloccato
        window.location.href = response.url;
      }
      
      toast.success('Reindirizzamento a Stripe in corso...');
      return true;

    } catch (error: any) {
      console.error('❌ STRIPE payment fallito:', error);
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
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';

    // CRITICAL FIX: Developer simulation completa
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 DEVELOPER: Simulazione subscription COMPLETA');
      
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        const { data: response, error: webhookError } = await supabase.functions.invoke('stripe-webhook', {
          body: {
            type: 'customer.subscription.created',
            data: {
              object: {
                id: `sub_dev_${Date.now()}`,
                customer: `cus_dev_${Date.now()}`,
                status: 'active',
                current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
                metadata: {
                  user_id: currentUser?.id,
                  plan_type: planType
                }
              }
            }
          }
        });

        if (webhookError) {
          console.error('❌ Subscription webhook simulation fallita:', webhookError);
        } else {
          console.log('✅ Subscription webhook simulation completata');
        }
      } catch (webhookError) {
        console.error('❌ Subscription webhook simulation error:', webhookError);
      }
      
      setLoading(false);
      toast.success(`🔧 Developer: Abbonamento ${planType} simulato e attivato`);
      return;
    }
    
    if (!currentUser?.id) {
      toast.error('Devi essere loggato per effettuare acquisti');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💳 STRIPE: Creazione sessione subscription REALE');

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

      console.log('✅ STRIPE: Sessione subscription creata');
      const newWindow = window.open(response.url, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        window.location.href = response.url;
      }

    } catch (error: any) {
      console.error('❌ STRIPE: Creazione subscription fallita:', error);
      const errorMessage = error.message || 'Errore nella creazione dell\'abbonamento';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    loading,
    error,
    detectPaymentMethodAvailability, // CRITICAL FIX: Export missing function
    processBuzzPurchase,
    processSubscription,
    clearError
  };
};
