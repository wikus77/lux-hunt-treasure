
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
      toast.error('Devi essere loggato per effettuare acquisti');
      return false;
    }

    setLoading(true);
    
    try {
      console.log('💳 STRIPE PAYMENT START - RESET COMPLETO 17/07/2025:', {
        user_id: user.id,
        amount,
        is_buzz_map: isBuzzMap,
        redirect_url: redirectUrl,
        session_id: sessionId
      });

      const { data, error } = await supabase.functions.invoke('process-buzz-purchase', {
        body: {
          user_id: user.id,
          amount,
          is_buzz_map: isBuzzMap,
          currency: 'EUR',
          redirect_url: redirectUrl,
          session_id: sessionId,
          mode: 'live' // Force live mode for production
        }
      });

      if (error) {
        console.error('❌ STRIPE Error processing payment:', error);
        toast.error('Errore nel processare il pagamento: ' + error.message);
        return false;
      }

      console.log('✅ STRIPE Response:', data);

      // Check if we received a checkout URL
      if (data?.url) {
        console.log('💳 STRIPE: Redirecting to checkout:', data.url);
        
        // Open Stripe checkout in new tab for live payments
        window.open(data.url, '_blank');
        
        // Show live payment notification
        toast.success('Pagamento Live', {
          description: 'Verrai reindirizzato al checkout sicuro di Stripe',
        });
        
        return true;
      }

      if (data?.success) {
        toast.success('Pagamento completato con successo!');
        return true;
      } else {
        toast.error('Pagamento fallito: ' + (data?.error || 'Errore sconosciuto'));
        return false;
      }
    } catch (error) {
      console.error('❌ STRIPE Payment processing error:', error);
      toast.error('Errore nel processare il pagamento: ' + error);
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
