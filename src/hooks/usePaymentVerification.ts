
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

export const usePaymentVerification = () => {
  const { getCurrentUser } = useAuthContext();
  const [hasValidPayment, setHasValidPayment] = useState(false);
  const [canAccessPremium, setCanAccessPremium] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('Free');
  const [remainingBuzz, setRemainingBuzz] = useState(0);
  const [weeklyBuzzLimit, setWeeklyBuzzLimit] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadPaymentStatus = useCallback(async () => {
    const currentUser = getCurrentUser();
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';

    // CRITICAL FIX: Developer sempre ha accesso completo
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 Developer: Full payment access granted');
      setHasValidPayment(true);
      setCanAccessPremium(true);
      setSubscriptionTier('Developer');
      setRemainingBuzz(999);
      setWeeklyBuzzLimit(999);
      setLoading(false);
      return;
    }

    if (!currentUser?.id) {
      console.log('⚠️ No user - setting free tier');
      setHasValidPayment(false);
      setCanAccessPremium(false);
      setSubscriptionTier('Free');
      setRemainingBuzz(1);
      setWeeklyBuzzLimit(1);
      setLoading(false);
      return;
    }

    try {
      // Check subscription status
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('❌ Error checking subscription:', subError);
      }

      const tier = subscription?.tier || 'Free';
      setSubscriptionTier(tier);

      // Set limits based on tier
      let buzzLimit = 1;
      if (tier === 'Silver') buzzLimit = 3;
      if (tier === 'Gold') buzzLimit = 7;
      if (tier === 'Black') buzzLimit = 15;

      setWeeklyBuzzLimit(buzzLimit);

      // Check weekly usage
      const currentWeek = Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      const { data: allowance, error: allowanceError } = await supabase
        .from('weekly_buzz_allowances')
        .select('used_buzz_count, max_buzz_count')
        .eq('user_id', currentUser.id)
        .eq('week_number', currentWeek)
        .single();

      if (allowanceError && allowanceError.code !== 'PGRST116') {
        console.error('❌ Error checking allowance:', allowanceError);
      }

      const used = allowance?.used_buzz_count || 0;
      const remaining = Math.max(0, buzzLimit - used);
      setRemainingBuzz(remaining);

      // CRITICAL FIX: Determine access correctly
      const hasPayment = tier !== 'Free';
      const canAccess = hasPayment && remaining > 0;

      setHasValidPayment(hasPayment);
      setCanAccessPremium(canAccess);

      console.log('💳 Payment verification:', {
        tier,
        hasPayment,
        canAccess,
        remaining,
        buzzLimit
      });

    } catch (error) {
      console.error('❌ Exception in payment verification:', error);
      // Fallback to free tier
      setHasValidPayment(false);
      setCanAccessPremium(false);
      setSubscriptionTier('Free');
      setRemainingBuzz(1);
      setWeeklyBuzzLimit(1);
    } finally {
      setLoading(false);
    }
  }, [getCurrentUser]);

  useEffect(() => {
    loadPaymentStatus();
  }, [loadPaymentStatus]);

  const requireBuzzPayment = useCallback(async (): Promise<boolean> => {
    const currentUser = getCurrentUser();
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';

    // CRITICAL FIX: Developer bypass
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 Developer: Payment requirement bypassed');
      return true;
    }

    if (!hasValidPayment) {
      toast.error('Abbonamento richiesto', {
        description: 'Devi avere un abbonamento attivo per utilizzare BUZZ'
      });
      return false;
    }

    if (remainingBuzz <= 0) {
      toast.error('Limite BUZZ raggiunto', {
        description: 'Hai esaurito i BUZZ settimanali disponibili'
      });
      return false;
    }

    return true;
  }, [hasValidPayment, remainingBuzz, getCurrentUser]);

  const logUnauthorizedAccess = useCallback(async (action: string, details: any) => {
    console.warn('🚫 Unauthorized access attempt:', action, details);
    // Could log to database here if needed
  }, []);

  return {
    hasValidPayment,
    canAccessPremium,
    subscriptionTier,
    remainingBuzz,
    weeklyBuzzLimit,
    loading,
    requireBuzzPayment,
    logUnauthorizedAccess,
    reloadPaymentStatus: loadPaymentStatus
  };
};
