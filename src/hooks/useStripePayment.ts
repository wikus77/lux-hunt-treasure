
// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - Stripe Payment Hook - RESET COMPLETO 17/07/2025

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';

interface PaymentResult {
  success: boolean;
  error?: string;
}

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Stripe Payment Hook - RESET COMPLETO 17/07/2025
 */
export const useStripePayment = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  const processBuzzPurchase = async (
    isBuzzMap: boolean = false, 
    amount: number,
    redirectUrl?: string,
    sessionId?: string
  ): Promise<boolean> => {
    if (!user) {
      console.warn('🚨 STRIPE BLOCK: No authenticated user');
      toast.error('Devi essere loggato per effettuare acquisti');
      return false;
    }

    setLoading(true);
    
    try {
      console.warn('🔥 STRIPE CHAIN START:', {
        user_id: user.id,
        amount,
        is_buzz_map: isBuzzMap,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase.functions.invoke('process-buzz-purchase', {
        body: {
          user_id: user.id,
          amount,
          is_buzz_map: isBuzzMap,
          currency: 'EUR',
          redirect_url: redirectUrl,
          session_id: sessionId,
          mode: 'live'
        }
      });

      console.warn('📦 STRIPE EDGE RESPONSE:', { 
        hasData: !!data, 
        dataUrl: data?.url, 
        dataSuccess: data?.success,
        error: error,
        fullResponse: data 
      });

      if (error) {
        console.error('❌ STRIPE EDGE ERROR:', error);
        toast.error(`Errore Stripe: ${error.message || 'Edge Function error'}`);
        return false;
      }

      if (!data) {
        console.error('❌ STRIPE: No data from Edge Function');
        toast.error("Nessuna risposta dal server Stripe");
        return false;
      }

      if (!data?.url || typeof data.url !== "string") {
        console.error("❌ STRIPE: Checkout URL non ricevuta", data);
        toast.error("URL checkout mancante o errata - verificare STRIPE_SECRET_KEY");
        throw new Error("Checkout URL mancante o errata");
      }
      
      console.log("✅ Stripe checkout URL ricevuta:", data.url);

      console.warn('✅ STRIPE SUCCESS: Opening checkout URL', { url: data.url });
      window.open(data.url, '_blank');
      toast.success('Apertura checkout Stripe...');
      return true;

    } catch (error) {
      console.error('💥 STRIPE FATAL ERROR:', { error, stack: error instanceof Error ? error.stack : 'No stack' });
      toast.error(`Errore critico: ${error instanceof Error ? error.message : String(error)}`);
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
          payment_method: paymentMethod || 'card',
          mode: 'live' // Force live mode for production
        }
      });

      if (error) {
        console.error('❌ STRIPE Error creating checkout session:', error);
        toast.error('Errore nel creare la sessione di pagamento');
        return;
      }

      if (data?.url) {
        // Open Stripe checkout in new tab for live payments
        window.open(data.url, '_blank');
        
        // Show live payment notification
        toast.success('Pagamento Live', {
          description: 'Verrai reindirizzato al checkout sicuro di Stripe',
        });
      } else {
        toast.error('Errore nel creare la sessione di pagamento');
      }
    } catch (error) {
      console.error('❌ STRIPE Subscription processing error:', error);
      toast.error('Errore nel processare l\'abbonamento');
    } finally {
      setLoading(false);
    }
  };

  const detectPaymentMethodAvailability = () => {
    // Detect Apple Pay availability with proper type checking
    const applePayAvailable = typeof window !== 'undefined' && 
      'ApplePaySession' in window && 
      (window as any).ApplePaySession?.canMakePayments?.();

    // Detect Google Pay availability (basic check)
    const googlePayAvailable = typeof window !== 'undefined' && 'PaymentRequest' in window;

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

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ - RESET COMPLETO 17/07/2025
 */
