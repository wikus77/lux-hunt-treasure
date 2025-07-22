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

  // 🚨 CRITICAL: LOG STATE CHANGES
  console.log('🔄 useUniversalStripePayment STATE:', {
    isCheckoutOpen,
    hasCurrentPaymentConfig: !!currentPaymentConfig,
    paymentType: currentPaymentConfig?.paymentType,
    amount: currentPaymentConfig?.amount,
    user: !!user,
    timestamp: new Date().toISOString()
  });

  const processPayment = (config: PaymentConfig) => {
    console.log('🚨 processPayment CALLED WITH CONFIG:', {
      config,
      userExists: !!user,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

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

    console.log('🚨 ABOUT TO SET STATE - setCurrentPaymentConfig & setIsCheckoutOpen');
    setCurrentPaymentConfig(config);
    setIsCheckoutOpen(true);
    
    console.log('🚨 STATE SET COMPLETE - should trigger modal');
    return true;
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setCurrentPaymentConfig(null);
  };

  const processBuzzPurchase = async (
    isBuzzMap: boolean = false, 
    amount: number,
    onPaymentSuccess?: () => void
  ): Promise<boolean> => {
    console.log('🚨 processBuzzPurchase CALLED:', {
      isBuzzMap,
      amount,
      onPaymentSuccessExists: !!onPaymentSuccess,
      userExists: !!user,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

    if (!user) {
      console.warn('🚨 STRIPE BLOCK: No authenticated user');
      toast.error('Devi essere loggato per effettuare acquisti');
      return false;
    }

    const paymentType: 'subscription' | 'buzz' | 'buzz_map' = isBuzzMap ? 'buzz_map' : 'buzz';
    const planName = isBuzzMap ? 'BUZZ Map' : 'BUZZ Extra';
    const description = isBuzzMap 
      ? 'Genera area di ricerca sulla mappa'
      : 'Indizio extra per la missione';

    console.log('🔥 M1SSION™ BUZZ PURCHASE START:', {
      user_id: user.id,
      paymentType,
      amount: amount * 100,
      planName,
      timestamp: new Date().toISOString()
    });

    const paymentConfig: PaymentConfig = {
      paymentType,
      planName,
      amount: amount * 100, // Convert to cents
      description,
      isBuzzMap,
      onSuccess: onPaymentSuccess // Pass the callback
    };

    console.log('🚨 ABOUT TO CALL processPayment WITH CONFIG:', paymentConfig);
    
    const result = processPayment(paymentConfig);
    
    console.log('🚨 processPayment RETURNED:', result);
    
    return result;
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