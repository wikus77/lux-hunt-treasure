
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

interface SubscriptionTier {
  id: string;
  name: string;
  price_monthly: number;
  stripe_price_id: string;
  buzz_days: string[];
  max_weekly_buzz: number;
}

interface WeeklyAllowance {
  id: string;
  week_number: number;
  year: number;
  max_buzz_count: number;
  used_buzz_count: number;
}

export const useSubscription = () => {
  const { user } = useAuthContext();
  const [currentTier, setCurrentTier] = useState<string>('Free');
  const [weeklyAllowance, setWeeklyAllowance] = useState<WeeklyAllowance | null>(null);
  const [availableTiers, setAvailableTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionData = async () => {
    if (!user) return;

    try {
      // Get user's current subscription tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCurrentTier(profile.subscription_tier || 'Free');
      }

      // Get available subscription tiers
      const { data: tiers } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (tiers) {
        setAvailableTiers(tiers);
      }

      // Get current week's allowance
      const { data: allowance } = await supabase
        .from('weekly_buzz_allowances')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (allowance) {
        setWeeklyAllowance(allowance);
      }

    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canUseBuzz = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('can_user_use_buzz', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking buzz usage:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking buzz usage:', error);
      return false;
    }
  };

  const consumeBuzz = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('consume_buzz_usage', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error consuming buzz:', error);
        toast.error('Errore nell\'utilizzo del BUZZ');
        return false;
      }

      if (data) {
        // Refresh allowance data
        await fetchSubscriptionData();
        return true;
      } else {
        toast.error('Hai raggiunto il limite settimanale di BUZZ');
        return false;
      }
    } catch (error) {
      console.error('Error consuming buzz:', error);
      toast.error('Errore nell\'utilizzo del BUZZ');
      return false;
    }
  };

  const getRemainingBuzz = (): number => {
    if (!weeklyAllowance) return 0;
    return Math.max(0, weeklyAllowance.max_buzz_count - weeklyAllowance.used_buzz_count);
  };

  const getCurrentTierInfo = (): SubscriptionTier | null => {
    return availableTiers.find(tier => tier.name === currentTier) || null;
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [user]);

  return {
    currentTier,
    weeklyAllowance,
    availableTiers,
    loading,
    canUseBuzz,
    consumeBuzz,
    getRemainingBuzz,
    getCurrentTierInfo,
    refetch: fetchSubscriptionData
  };
};
