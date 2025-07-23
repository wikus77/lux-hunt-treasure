// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Universal Stripe In-App Payment Hook - RESET COMPLETO 22/07/2025

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';

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
    const planDetails = {
      Silver: { amount: 399, description: 'Piano Silver con vantaggi premium' },
      Gold: { amount: 799, description: 'Piano Gold con accesso completo' },
      Black: { amount: 1299, description: 'Piano Black VIP esclusivo' },
      Titanium: { amount: 1999, description: 'Piano Titanium ultimate' }
    };

    const details = planDetails[plan as keyof typeof planDetails] || planDetails.Silver;

    const config: PaymentConfig = {
      type: 'subscription',
      amount: details.amount,
      description: details.description,
      plan: plan,
      metadata: {
        subscription_plan: plan,
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