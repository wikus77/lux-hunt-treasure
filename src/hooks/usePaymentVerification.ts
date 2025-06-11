
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

  // CRITICAL FIX: Enhanced payment status loading with immediate developer access
  const loadPaymentStatus = useCallback(async () => {
    const currentUser = getCurrentUser();
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';

    // CRITICAL: Developer sempre ha accesso completo
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 EMERGENCY FIX: Developer has full payment access granted');
      setHasValidPayment(true);
      setCanAccessPremium(true);
      setSubscriptionTier('Developer');
      setRemainingBuzz(999);
      setWeeklyBuzzLimit(999);
      setLoading(false);
      return;
    }

    if (!currentUser?.id) {
      console.log('⚠️ EMERGENCY FIX: No user - setting free tier');
      setHasValidPayment(false);
      setCanAccessPremium(false);
      setSubscriptionTier('Free');
      setRemainingBuzz(1);
      setWeeklyBuzzLimit(1);
      setLoading(false);
      return;
    }

    try {
      // CRITICAL FIX: Enhanced subscription check with better error handling
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('❌ EMERGENCY FIX: Error checking subscription:', subError);
      }

      const tier = subscription?.tier || 'Free';
      setSubscriptionTier(tier);

      // CRITICAL FIX: Enhanced tier-based limits
      let buzzLimit = 1;
      if (tier === 'Silver') buzzLimit = 3;
      if (tier === 'Gold') buzzLimit = 7;
      if (tier === 'Black') buzzLimit = 15;

      setWeeklyBuzzLimit(buzzLimit);

      // CRITICAL FIX: Enhanced weekly usage calculation
      const currentWeek = Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      const { data: allowance, error: allowanceError } = await supabase
        .from('weekly_buzz_allowances')
        .select('used_buzz_count, max_buzz_count')
        .eq('user_id', currentUser.id)
        .eq('week_number', currentWeek)
        .single();

      if (allowanceError && allowanceError.code !== 'PGRST116') {
        console.error('❌ EMERGENCY FIX: Error checking allowance:', allowanceError);
      }

      const used = allowance?.used_buzz_count || 0;
      const remaining = Math.max(0, buzzLimit - used);
      setRemainingBuzz(remaining);

      // CRITICAL FIX: Enhanced access determination
      const hasPayment = tier !== 'Free';
      const canAccess = hasPayment || remaining > 0; // FREE users get 1 BUZZ per week

      setHasValidPayment(hasPayment);
      setCanAccessPremium(canAccess);

      console.log('💳 EMERGENCY FIX: Payment verification:', {
        tier,
        hasPayment,
        canAccess,
        remaining,
        buzzLimit
      });

    } catch (error) {
      console.error('❌ EMERGENCY FIX: Exception in payment verification:', error);
      // Fallback to free tier with 1 BUZZ
      setHasValidPayment(false);
      setCanAccessPremium(true); // Allow 1 free BUZZ
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

  // CRITICAL FIX: Enhanced payment requirement check - FORCE STRIPE FOR ALL NON-DEVELOPERS
  const requireBuzzPayment = useCallback(async (): Promise<boolean> => {
    const currentUser = getCurrentUser();
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';

    // CRITICAL: Developer bypass - immediate return
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 EMERGENCY FIX: Developer - Payment requirement bypassed');
      return true;
    }

    // CRITICAL FIX: For non-developers, check subscription status more strictly
    if (!hasValidPayment && subscriptionTier === 'Free') {
      if (remainingBuzz <= 0) {
        console.log('💳 EMERGENCY FIX: Free plan, no remaining BUZZ - FORCE STRIPE');
        return false; // This will trigger Stripe flow
      } else {
        console.log('💳 EMERGENCY FIX: Free plan, has remaining BUZZ - ALLOW');
        return true; // Allow the free BUZZ
      }
    }

    if (!hasValidPayment) {
      console.log('💳 EMERGENCY FIX: No valid payment - FORCE STRIPE');
      return false; // This will trigger Stripe flow
    }

    if (remainingBuzz <= 0) {
      toast.error('Limite BUZZ raggiunto', {
        description: 'Hai esaurito i BUZZ settimanali disponibili'
      });
      return false;
    }

    return true;
  }, [hasValidPayment, remainingBuzz, subscriptionTier, getCurrentUser]);

  const logUnauthorizedAccess = useCallback(async (action: string, details: any) => {
    console.warn('🚫 EMERGENCY FIX: Unauthorized access attempt:', action, details);
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
