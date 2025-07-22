// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Universal Stripe Payment Hook - RESET COMPLETO 22/07/2025

import { useState } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

export interface PaymentConfig {
  paymentType: 'subscription' | 'buzz' | 'buzz_map';
  planName: string;
  amount: number; // In cents
  description?: string;
  isBuzzMap?: boolean;
  onSuccess?: () => void;
}

export const useUniversalStripePayment = () => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentPaymentConfig, setCurrentPaymentConfig] = useState<PaymentConfig | null>(null);
  const { user } = useAuthContext();

  const processPayment = (config: PaymentConfig) => {
    if (!user) {
      console.warn('🚨 STRIPE BLOCK: No authenticated user');
      toast.error('Devi essere loggato per effettuare acquisti');
      return false;
    }

    console.log('🔥 M1SSION™ UNIVERSAL PAYMENT START:', {
      user_id: user.id,
      paymentType: config.paymentType,
      amount: config.amount,
      planName: config.planName,
      timestamp: new Date().toISOString()
    });

    setCurrentPaymentConfig(config);
    setIsCheckoutOpen(true);
    return true;
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setCurrentPaymentConfig(null);
  };

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

    const paymentType = isBuzzMap ? 'buzz_map' : 'buzz';
    const planName = isBuzzMap ? 'BUZZ Map' : 'BUZZ Extra';
    const description = isBuzzMap 
      ? 'Genera area di ricerca sulla mappa'
      : 'Indizio extra per la missione';

    return processPayment({
      paymentType,
      planName,
      amount: amount * 100, // Convert to cents
      description,
      isBuzzMap,
      onSuccess: () => {
        // Handle navigation or callback based on redirectUrl
        if (redirectUrl) {
          console.log('✅ M1SSION™ Payment completed, redirect:', redirectUrl);
        }
      }
    });
  };

  const processSubscription = async (plan: string, paymentMethod?: string): Promise<void> => {
    if (!user) {
      toast.error('Devi essere loggato per effettuare acquisti');
      return;
    }

    // Get plan amount in cents
    const getPlanAmount = (planName: string) => {
      switch (planName) {
        case 'Silver': return 399;
        case 'Gold': return 799;
        case 'Black': return 1299;
        case 'Titanium': return 1999;
        default: return 399;
      }
    };

    processPayment({
      paymentType: 'subscription',
      planName: plan,
      amount: getPlanAmount(plan),
      description: `Piano ${plan} con vantaggi premium`,
      onSuccess: () => {
        console.log('✅ M1SSION™ Subscription payment completed');
      }
    });
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
    processPayment,
    processBuzzPurchase,
    processSubscription,
    detectPaymentMethodAvailability,
    isCheckoutOpen,
    currentPaymentConfig,
    closeCheckout,
    loading: false // This is now handled by the checkout component
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ - RESET COMPLETO 22/07/2025
 */