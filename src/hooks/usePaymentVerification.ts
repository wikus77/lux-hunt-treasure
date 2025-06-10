
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

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
      // Verifica stato abbonamento attivo
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_end, stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
        throw profileError;
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

      // Verifica abbonamento attivo
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('status, tier, end_date')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const hasActiveSubscription = subscription && 
        new Date(subscription.end_date || '') > new Date();

      const hasValidPayment = (payments && payments.length > 0) || hasActiveSubscription;
      const subscriptionTier = profile?.subscription_tier || 'Free';
      const canAccessPremium = hasValidPayment && subscriptionTier !== 'Free';

      // Ottieni limiti BUZZ settimanali
      const { data: tierData } = await supabase
        .from('subscription_tiers')
        .select('max_weekly_buzz')
        .eq('name', subscriptionTier)
        .single();

      const weeklyBuzzLimit = tierData?.max_weekly_buzz || 0;

      // Calcola BUZZ rimanenti questa settimana
      const { data: allowance } = await supabase
        .from('weekly_buzz_allowances')
        .select('max_buzz_count, used_buzz_count')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const remainingBuzz = allowance ? 
        Math.max(0, allowance.max_buzz_count - allowance.used_buzz_count) : 0;

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
      
      // Log unauthorized access attempt
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
    const { hasValidPayment, remainingBuzz } = verification;
    
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
