// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Universal Stripe In-App Payment Hook - SYNCHRONIZED PRICING

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { SUBSCRIPTION_PRICES, getPriceCents } from '@/lib/constants/subscriptionPrices';

export interface PaymentConfig {
  type: 'buzz' | 'buzz_map' | 'subscription';
  amount: number; // Amount in cents
  currency?: string;
  description: string;
  plan?: string; // For subscriptions
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  payment_intent_id?: string;
}

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Universal Stripe In-App Payment Hook - RESET COMPLETO 22/07/2025
 */
export const useStripeInAppPayment = () => {
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const { user } = useAuthContext();

  const initiatePayment = async (config: PaymentConfig): Promise<void> => {
    if (!user) {
      console.warn('🚨 M1SSION™ STRIPE BLOCK: No authenticated user');
      toast.error('Devi essere loggato per effettuare pagamenti');
      return;
    }

    console.log('🔥 M1SSION™ STRIPE IN-APP: Initiating payment', {
      type: config.type,
      amount: config.amount,
      user_id: user.id,
      timestamp: new Date().toISOString()
    });

    setPaymentConfig(config);
    setShowCheckout(true);
  };

  const processBuzzPayment = async (amount: number, isBuzzMap: boolean = false): Promise<void> => {
    const config: PaymentConfig = {
      type: isBuzzMap ? 'buzz_map' : 'buzz',
      amount: amount, // Amount already in cents
      description: isBuzzMap ? 'M1SSION™ BUZZ MAPPA - Area geolocalizzata' : 'M1SSION™ BUZZ - Indizio premium',
      metadata: {
        is_buzz_map: isBuzzMap,
        mission: 'M1SSION',
        reset_date: '2025-07-22'
      }
    };

    await initiatePayment(config);
  };

  const processSubscription = async (plan: string): Promise<void> => {
    // CORRECTED: Use exact pricing with forced cent alignment
    const planPrices: Record<string, { cents: number; eur: number }> = {
      'Silver': { cents: 399, eur: 3.99 },
      'Gold': { cents: 699, eur: 6.99 },
      'Black': { cents: 999, eur: 9.99 },
      'Titanium': { cents: 2999, eur: 29.99 }
    };
    
    const planData = planPrices[plan];
    if (!planData) {
      toast.error('Piano di abbonamento non valido');
      return;
    }

    const config: PaymentConfig = {
      type: 'subscription',
      amount: planData.cents, // FIXED: Use exact cents
      description: `Piano ${plan} con vantaggi premium`,
      plan: plan,
      metadata: {
        subscription_plan: plan,
        price_cents: planData.cents,
        price_eur: planData.eur,
        mission: 'M1SSION',
        reset_date: '2025-07-22'
      }
    };

    await initiatePayment(config);
  };

  const closeCheckout = () => {
    if (!loading) {
      setShowCheckout(false);
      setPaymentConfig(null);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    console.log('✅ M1SSION™ STRIPE SUCCESS: Payment completed', { 
      paymentIntentId, 
      type: paymentConfig?.type 
    });

    try {
      // Handle different payment types
      if (paymentConfig?.type === 'buzz' || paymentConfig?.type === 'buzz_map') {
        // Handle BUZZ payment completion
        await supabase.functions.invoke('handle-buzz-payment-success', {
          body: {
            payment_intent_id: paymentIntentId,
            user_id: user?.id,
            amount: paymentConfig.amount,
            is_buzz_map: paymentConfig.type === 'buzz_map',
            metadata: paymentConfig.metadata
          }
        });

        toast.success(`🎉 ${paymentConfig.type === 'buzz_map' ? 'Area BUZZ' : 'BUZZ'} acquistato con successo!`);
      } else if (paymentConfig?.type === 'subscription') {
        // Handle subscription payment completion  
        await supabase.functions.invoke('handle-payment-success', {
          body: {
            payment_intent_id: paymentIntentId,
            user_id: user?.id,
            plan: paymentConfig.plan
          }
        });

        toast.success(`🎉 Abbonamento ${paymentConfig.plan} attivato!`);
      }

      setShowCheckout(false);
      setPaymentConfig(null);
    } catch (error) {
      console.error('❌ M1SSION™ STRIPE: Error handling payment success', error);
      toast.error('Errore nella finalizzazione del pagamento');
    }
  };

  return {
    // Universal payment methods
    processBuzzPayment,
    processSubscription,
    
    // UI state
    showCheckout,
    paymentConfig,
    loading,
    setLoading,
    
    // Handlers
    closeCheckout,
    handlePaymentSuccess,
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ - RESET COMPLETO 22/07/2025
 */