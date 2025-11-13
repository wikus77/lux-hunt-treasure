// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - Stripe Payment Hook - RESET COMPLETO 17/07/2025

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { PaymentErrorHandler } from '@/utils/paymentErrorHandler';

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

  const processSubscription = async (plan: string, paymentMethod?: string): Promise<void> => {
    if (!user) {
      toast.error('Devi essere loggato per effettuare acquisti');
      return;
    }

    // Verify Stripe mode alignment (client pk_* vs server sk_*)
    try {
      await PaymentErrorHandler.retryWithBackoff(async () => {
        const { data: modeData, error: modeErr } = await supabase.functions.invoke('stripe-mode');
        if (modeErr) throw new Error(`Mode check failed: ${modeErr.message}`);
        
        const { assertPkMatchesMode } = await import('@/lib/stripe/guard');
        assertPkMatchesMode((modeData as any)?.mode as 'live' | 'test' | 'unknown');
      });
    } catch (e) {
      await PaymentErrorHandler.handlePaymentError(e, 'stripe_mode_check');
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          user_id: user.id,
          plan: plan.toUpperCase(), // 🔥 CRITICAL: Convert to uppercase for edge function
          payment_method: paymentMethod || 'card',
          mode: 'live' // Force live mode for production
        }
      });

      if (error) {
      console.error('❌ STRIPE Error creating checkout session:', error);
      console.error('❌ STRIPE Full error details:', JSON.stringify(error, null, 2));
      toast.error(`Errore Stripe: ${error.message || 'Sessione di pagamento fallita'}`);
        return;
      }

      if (data?.url) {
        console.log('🚀 M1SSION™ STRIPE REDIRECT - Opening checkout in new tab:', data.url);
        
        // 🔥 CRITICAL FIX: Use window.open for consistent behavior with BUZZ payments
        console.log('⚡ M1SSION™ Using window.open for subscription checkout (same as BUZZ)');
        const newWindow = window.open(data.url, '_blank');
        
        if (!newWindow) {
          console.error('❌ window.open blocked - trying fallback redirect methods');
          
          // Fallback to direct redirect if popup blocked
          const isIOSPWA = (window.navigator as any).standalone || 
            (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
          
          if (isIOSPWA) {
            console.log('📱 iOS PWA detected - Using immediate redirect method');
            try {
              console.log('⚡ M1SSION™ Using location.replace for immediate redirect');
              window.location.replace(data.url);
            } catch (error) {
              console.error('❌ location.replace failed, trying assign:', error);
              try {
                window.location.assign(data.url);
              } catch (assignError) {
                console.error('❌ location.assign failed, using href:', assignError);
                window.location.href = data.url;
              }
            }
          } else {
            // Standard redirect for non-PWA environments
            window.location.href = data.url;
          }
        } else {
          console.log('✅ M1SSION™ STRIPE CHECKOUT opened in new tab successfully');
        }
        
        // Show success notification
        toast.success('✅ Apertura checkout Stripe...', {
          description: 'Checkout aperto in nuova scheda - completa il pagamento',
        });
      } else {
        console.error('❌ M1SSION™ STRIPE CHECKOUT FAILED - No URL received');
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
    processSubscription,
    detectPaymentMethodAvailability,
    loading
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ - RESET COMPLETO 17/07/2025
 */
