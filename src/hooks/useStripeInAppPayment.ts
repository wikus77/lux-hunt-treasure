// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Universal Stripe In-App Payment Hook - SYNCHRONIZED PRICING
// @ts-nocheck

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
// Utilizzo configurazione prezzi centralizzata da pricingConfig

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
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<any>(null);
  const { user } = useAuthContext();

  // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
  // Load default payment method on initialization
  useEffect(() => {
    const loadDefaultPaymentMethod = async () => {
      if (!user) return;

      try {
        console.log('🔍 M1SSION™ Loading default payment method for auto-fill');
        
        const { data, error } = await supabase
          .from('user_payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('❌ M1SSION™ Error loading default payment method:', error);
          return;
        }

        if (data) {
          setDefaultPaymentMethod(data);
          console.log('✅ M1SSION™ Default payment method loaded for auto-fill:', { 
            brand: data.brand, 
            last4: data.last4 
          });
        }
      } catch (error) {
        console.error('❌ M1SSION™ Error in loadDefaultPaymentMethod:', error);
      }
    };

    loadDefaultPaymentMethod();
  }, [user]);

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
      defaultPaymentMethod: defaultPaymentMethod ? `${defaultPaymentMethod.brand} ****${defaultPaymentMethod.last4}` : 'none',
      timestamp: new Date().toISOString()
    });

    // Auto-fill with default payment method if available
    const configWithDefaults = {
      ...config,
      metadata: {
        ...config.metadata,
        default_payment_method: defaultPaymentMethod?.stripe_pm_id,
        auto_fill_enabled: !!defaultPaymentMethod
      }
    };

    setPaymentConfig(configWithDefaults);
    setShowCheckout(true);
  };

  const processSubscription = async (plan: string): Promise<void> => {
    // Import centralized pricing configuration
    const { getPriceCents, getPriceEur } = await import('@/lib/constants/pricingConfig');
    
    const cents = getPriceCents(plan);
    const eur = getPriceEur(plan);
    
    if (!cents || !eur) {
      toast.error('Piano di abbonamento non valido');
      return;
    }

    const config: PaymentConfig = {
      type: 'subscription',
      amount: cents, // SYNCHRONIZED: Use centralized pricing
      description: `Piano ${plan} con vantaggi premium`,
      plan: plan,
      metadata: {
        subscription_plan: plan,
        price_cents: cents,
        price_eur: eur,
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

  const handlePaymentSuccess = async (paymentIntentId: string): Promise<{ ok: boolean; clue_text?: string; skipFollowUpBuzzPress?: boolean }> => {
    console.log('✅ M1SSION™ STRIPE SUCCESS: Payment completed', { 
      paymentIntentId, 
      type: paymentConfig?.type 
    });

    try {
      // Handle subscription payment completion  
      if (paymentConfig?.type === 'subscription') {
        // Handle subscription payment completion  
        await supabase.functions.invoke('handle-payment-success', {
          body: {
            payment_intent_id: paymentIntentId,
            user_id: user?.id,
            plan: paymentConfig.plan
          }
        });

        toast.success(`🎉 Abbonamento ${paymentConfig.plan} attivato!`);
        return { ok: true };
      }

      setShowCheckout(false);
      setPaymentConfig(null);
      return { ok: true };
    } catch (error) {
      console.error('❌ M1SSION™ STRIPE: Error handling payment success', error);
      toast.error('Errore nella finalizzazione del pagamento');
      return { ok: false };
    }
  };

  return {
    // Universal payment methods
    processSubscription,
    
    // UI state
    showCheckout,
    paymentConfig,
    loading,
    setLoading,
    defaultPaymentMethod, // © 2025 Joseph MULÉ – M1SSION™ – Auto-fill support
    
    // Handlers
    closeCheckout,
    handlePaymentSuccess,
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ - RESET COMPLETO 22/07/2025
 */