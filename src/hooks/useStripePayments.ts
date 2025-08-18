// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Unified Stripe Payment System

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentConfig {
  type: 'buzz' | 'subscription';
  amount?: number;
  plan?: string;
  currency?: string;
  description?: string;
}

interface PaymentResult {
  success: boolean;
  error?: string;
  paymentIntentId?: string;
}

export const useStripePayments = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const processPayment = async (config: PaymentConfig): Promise<PaymentResult> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          type: config.type,
          amount: config.amount,
          plan: config.plan,
          currency: config.currency || 'eur',
          description: config.description
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Payment creation failed');
      }

      toast({
        title: "✅ Pagamento Completato",
        description: "Il pagamento è stato elaborato con successo",
        variant: "default"
      });

      return {
        success: true,
        paymentIntentId: data.paymentIntentId
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore di pagamento';
      
      toast({
        title: "❌ Errore Pagamento", 
        description: errorMessage,
        variant: "destructive"
      });

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const processBuzzPayment = (amount: number) => {
    return processPayment({
      type: 'buzz',
      amount,
      description: `Acquisto ${amount} BUZZ Credits`
    });
  };

  const processSubscription = (plan: string) => {
    return processPayment({
      type: 'subscription',
      plan,
      description: `Abbonamento ${plan.toUpperCase()}`
    });
  };

  return {
    loading,
    processPayment,
    processBuzzPayment,
    processSubscription
  };
};