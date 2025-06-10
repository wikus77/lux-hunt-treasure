
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { useTestMode } from './useTestMode';

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
  const { isDeveloperUser } = useTestMode();
  
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
      // DEVELOPER BLACK: Accesso completo senza limitazioni
      if (isDeveloperUser) {
        setVerification({
          hasValidPayment: true,
          subscriptionTier: 'Black',
          canAccessPremium: true,
          remainingBuzz: 999,
          weeklyBuzzLimit: 999,
          loading: false
        });
        
        console.log('🔧 DEVELOPER BLACK: Accesso illimitato confermato');
        return;
      }

      // PRODUZIONE: Verifica pagamento reale per altri utenti
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_end, stripe_customer_id, email')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
        throw profileError;
      }

      // Verifica abbonamento attivo
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

      // Verifica pagamenti completati
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

      // Ottieni limiti BUZZ settimanali
      let weeklyBuzzLimit = 0;
      if (subscriptionTier === 'Black') {
        weeklyBuzzLimit = 999;
      } else {
        const { data: tierData } = await supabase
          .from('subscription_tiers')
          .select('max_weekly_buzz')
          .eq('name', subscriptionTier)
          .single();
        weeklyBuzzLimit = tierData?.max_weekly_buzz || 0;
      }

      // Calcola BUZZ rimanenti
      const { data: allowance } = await supabase
        .from('weekly_buzz_allowances')
        .select('max_buzz_count, used_buzz_count')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let remainingBuzz = 0;
      if (subscriptionTier === 'Black') {
        remainingBuzz = 999;
      } else if (allowance) {
        remainingBuzz = Math.max(0, allowance.max_buzz_count - allowance.used_buzz_count);
      }

      setVerification({
        hasValidPayment,
        subscriptionTier,
        canAccessPremium,
        remainingBuzz,
        weeklyBuzzLimit,
        loading: false
      });

      console.log('✅ Payment verification completed:', {
        hasValidPayment,
        subscriptionTier,
        canAccessPremium,
        remainingBuzz
      });

    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      
      await logUnauthorizedAccess('payment_verification_failed');
      
      setVerification({
        hasValidPayment: false,
        subscriptionTier: 'Free',
        canAccessPremium: false,
        remainingBuzz: 0,
        weeklyBuzzLimit: 0,
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
      
      console.warn(`⚠️ Unauthorized access logged: ${eventType} by user ${user.id}`);
    } catch (error) {
      console.error('❌ Failed to log unauthorized access:', error);
    }
  };

  const requirePayment = (feature: string): boolean => {
    const { hasValidPayment, canAccessPremium } = verification;
    
    // DEVELOPER BLACK: Sempre autorizzato
    if (isDeveloperUser) {
      return true;
    }
    
    if (!hasValidPayment || !canAccessPremium) {
      logUnauthorizedAccess(`blocked_${feature}`);
      toast.error('Accesso Negato', {
        description: 'Questa funzione richiede un abbonamento attivo o pagamento valido.',
        duration: 4000
      });
      return false;
    }
    
    return true;
  };

  const requireBuzzPayment = async (): Promise<boolean> => {
    const { hasValidPayment, remainingBuzz, subscriptionTier } = verification;
    
    // DEVELOPER BLACK: Sempre autorizzato
    if (isDeveloperUser) {
      return true;
    }
    
    if (subscriptionTier === 'Black') {
      return true;
    }
    
    if (!hasValidPayment) {
      await logUnauthorizedAccess('blocked_buzz_no_payment');
      toast.error('Pagamento Richiesto', {
        description: 'Devi effettuare un pagamento per utilizzare questa funzione.',
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
