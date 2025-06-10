
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { useTestMode } from './useTestMode';
import { useGameRules } from './useGameRules';

interface PaymentVerification {
  hasValidPayment: boolean;
  subscriptionTier: string;
  canAccessPremium: boolean;
  remainingBuzz: number;
  weeklyBuzzLimit: number;
  loading: boolean;
}

export const usePaymentVerification = () => {
  const { user } = useAuthContext();
  const { isDeveloperUser, fakePaymentEnabled } = useTestMode();
  const { getBuzzLimit } = useGameRules();
  
  const [verification, setVerification] = useState<PaymentVerification>({
    hasValidPayment: false,
    subscriptionTier: 'Free',
    canAccessPremium: false,
    remainingBuzz: 0,
    weeklyBuzzLimit: 0,
    loading: true
  });

  const verifyPaymentStatus = async () => {
    if (!user?.id) {
      setVerification(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      if (isDeveloperUser) {
        // LANCIO 19 LUGLIO: Developer BLACK con regole corrette
        const blackBuzzLimit = getBuzzLimit('Black');
        
        setVerification({
          hasValidPayment: true,
          subscriptionTier: 'Black',
          canAccessPremium: true,
          remainingBuzz: blackBuzzLimit, // 999 per developer
          weeklyBuzzLimit: blackBuzzLimit,
          loading: false
        });
        
        console.log('🔧 LANCIO DEVELOPER: Black tier activated', {
          buzzLimit: blackBuzzLimit,
          tier: 'Black',
          launchReady: true
        });
        return;
      }

      // PRODUZIONE: Verifica pagamento per altri utenti
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_end, stripe_customer_id, email')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
        throw profileError;
      }

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('status, tier, end_date')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let subscriptionTier = 'Free';
      let hasActiveSubscription = false;

      if (subscription && new Date(subscription.end_date || '') > new Date()) {
        subscriptionTier = subscription.tier;
        hasActiveSubscription = true;
      } else if (profile?.subscription_tier && profile.subscription_tier !== 'Free') {
        subscriptionTier = profile.subscription_tier;
        hasActiveSubscription = true;
      }

      const { data: payments, error: paymentsError } = await supabase
        .from('payment_transactions')
        .select('status, created_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (paymentsError) {
        console.error('❌ Error fetching payments:', paymentsError);
      }

      const hasValidPayment = (payments && payments.length > 0) || hasActiveSubscription;
      const canAccessPremium = hasValidPayment && subscriptionTier !== 'Free';

      // LANCIO: Usa regole corrette per limiti
      const weeklyBuzzLimit = getBuzzLimit(subscriptionTier);

      // LANCIO: RESET ALLOWANCES - Verifica allowances fresche
      const { data: allowance } = await supabase
        .from('weekly_buzz_allowances')
        .select('max_buzz_count, used_buzz_count')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let remainingBuzz = 0;
      if (subscriptionTier === 'Black') {
        remainingBuzz = weeklyBuzzLimit; // 999 per Black
      } else if (allowance) {
        remainingBuzz = Math.max(0, allowance.max_buzz_count - allowance.used_buzz_count);
      } else {
        // LANCIO: Per utenti nuovi, usa i limiti corretti resettati
        remainingBuzz = weeklyBuzzLimit;
      }

      setVerification({
        hasValidPayment,
        subscriptionTier,
        canAccessPremium,
        remainingBuzz,
        weeklyBuzzLimit,
        loading: false
      });

      console.log('✅ LANCIO PAYMENT: Verification completed', {
        hasValidPayment,
        subscriptionTier,
        canAccessPremium,
        remainingBuzz,
        weeklyBuzzLimit,
        launchReady: true
      });

    } catch (error) {
      console.error('❌ LANCIO PAYMENT: Verification failed', error);
      
      await logUnauthorizedAccess('payment_verification_failed');
      
      // LANCIO: Fallback sicuro
      setVerification({
        hasValidPayment: false,
        subscriptionTier: 'Free',
        canAccessPremium: false,
        remainingBuzz: 0,
        weeklyBuzzLimit: 1, // Free = 1 BUZZ settimanale
        loading: false
      });
    }
  };

  const logUnauthorizedAccess = async (eventType: string, details?: any) => {
    if (!user?.id) return;

    try {
      await supabase.from('abuse_logs').insert({
        user_id: user.id,
        event_type: 'unauthorized_access',
        meta: {
          access_type: eventType,
          timestamp: new Date().toISOString(),
          details
        }
      });
      
      console.warn(`⚠️ LANCIO SECURITY: Unauthorized access logged - ${eventType}`);
    } catch (error) {
      console.error('❌ Failed to log unauthorized access:', error);
    }
  };

  const requirePayment = (feature: string): boolean => {
    const { hasValidPayment, canAccessPremium } = verification;
    
    if (isDeveloperUser && fakePaymentEnabled) {
      console.log('🔧 LANCIO DEVELOPER: Payment bypass for', feature);
      return true;
    }
    
    if (!hasValidPayment || !canAccessPremium) {
      logUnauthorizedAccess(`blocked_${feature}`);
      toast.error('Pagamento Richiesto', {
        description: 'Questa funzione richiede un pagamento verificato.',
        duration: 4000
      });
      return false;
    }
    
    return true;
  };

  const requireBuzzPayment = async (): Promise<boolean> => {
    const { hasValidPayment, remainingBuzz, subscriptionTier } = verification;
    
    if (isDeveloperUser && fakePaymentEnabled) {
      console.log('🔧 LANCIO DEVELOPER: BUZZ bypass authorized');
      return true;
    }
    
    if (subscriptionTier === 'Black') {
      return true; // Black = sempre autorizzato
    }
    
    if (!hasValidPayment) {
      await logUnauthorizedAccess('blocked_buzz_no_payment');
      toast.error('Pagamento Richiesto', {
        description: 'Devi effettuare un pagamento per utilizzare BUZZ.',
        duration: 4000
      });
      return false;
    }

    if (remainingBuzz <= 0) {
      await logUnauthorizedAccess('blocked_buzz_limit_exceeded');
      toast.error('Limite BUZZ Raggiunto', {
        description: 'Hai esaurito i BUZZ settimanali disponibili.',
        duration: 4000
      });
      return false;
    }

    return true;
  };

  useEffect(() => {
    verifyPaymentStatus();
  }, [user]);

  return {
    ...verification,
    verifyPaymentStatus,
    requirePayment,
    requireBuzzPayment,
    logUnauthorizedAccess
  };
};
