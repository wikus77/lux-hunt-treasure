// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Universal Stripe In-App Payment Hook - SYNCHRONIZED PRICING

import { useState, useEffect } from 'react';
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
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<any>(null);
  const { user } = useAuthContext();

  // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
  // Load default payment method on initialization
  useEffect(() => {
    const loadDefaultPaymentMethod = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setDefaultPaymentMethod(data);
        }
      } catch {
        // no-op
      }
    };

    loadDefaultPaymentMethod();
  }, [user]);

  const initiatePayment = async (config: PaymentConfig): Promise<void> => {
    if (!user) {
      toast.error('Devi essere loggato per effettuare pagamenti');
      return;
    }

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

  const processBuzzPayment = async (amount: number, isBuzzMap: boolean = false): Promise<void> => {
    const config: PaymentConfig = {
      type: isBuzzMap ? 'buzz_map' : 'buzz',
      amount, // Amount already in cents
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
    const { getPriceCents, getPriceEur } = await import('@/lib/constants/pricingConfig');

    const cents = getPriceCents(plan);
    const eur = getPriceEur(plan);

    if (!cents || !eur) {
      toast.error('Piano di abbonamento non valido');
      return;
    }

    const config: PaymentConfig = {
      type: 'subscription',
      amount: cents,
      description: `Piano ${plan} con vantaggi premium`,
      plan,
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

  // 🔑 NUOVO: passaggio opzionale coordinate per BUZZ MAP + AUTH header esplicito
  const handlePaymentSuccess = async (
    paymentIntentId: string,
    opts?: { coords?: { lat: number; lng: number } }
  ): Promise<{ ok: boolean; clue_text?: string; skipFollowUpBuzzPress?: boolean }> => {
    try {
      if (!paymentConfig) return { ok: true };

      if (paymentConfig.type === 'buzz' || paymentConfig.type === 'buzz_map') {
        if (!paymentIntentId) {
          toast.error('Pagamento completato, ma manca il riferimento. Aggiorna e riprova.');
          return { ok: false };
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const authHeader = sessionData?.session?.access_token
          ? { Authorization: `Bearer ${sessionData.session.access_token}` }
          : undefined;

        const { data: buzzResponse, error: buzzError } = await supabase.functions.invoke(
          'handle-buzz-payment-success',
          {
            body: {
              payment_intent_id: paymentIntentId,
              user_id: user?.id,
              amount: paymentConfig.amount,
              is_buzz_map: paymentConfig.type === 'buzz_map',
              coordinates: opts?.coords ?? null,
              metadata: paymentConfig.metadata
            },
            headers: authHeader
          }
        );

        if (buzzError) {
          toast.error('Operazione non riuscita. Riprova.');
          return { ok: false };
        }

        if (paymentConfig.type === 'buzz') {
          const clueText =
            buzzResponse?.clue_text ||
            buzzResponse?.metadata?.clue_text ||
            buzzResponse?.message ||
            '';
          if (clueText) {
            toast.success(`🎯 Nuovo indizio BUZZ!`, {
              description: clueText,
              duration: 5000,
              position: 'top-center',
              style: {
                zIndex: 9999,
                background: 'linear-gradient(135deg, #F213A4 0%, #FF4D4D 100%)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '12px 16px'
              }
            });
            return { ok: true, clue_text: clueText, skipFollowUpBuzzPress: true };
          } else {
            toast.success('🎉 BUZZ acquistato con successo!');
            return { ok: true, skipFollowUpBuzzPress: true };
          }
        }

        // BUZZ MAP: la UI gestisce toasts/overlay
        return { ok: true };
      }

      return { ok: true };
    } catch (error) {
      console.error('❌ handlePaymentSuccess fatal:', error);
      toast.error('Errore nella finalizzazione del pagamento.');
      return { ok: false };
    }
  };

  return {
    loading,
    showCheckout,
    paymentConfig,
    initiatePayment,
    processBuzzPayment,
    processSubscription,
    closeCheckout: () => {
      if (!loading) {
        setShowCheckout(false);
        setPaymentConfig(null);
      }
    },
    handlePaymentSuccess
  };
};
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
