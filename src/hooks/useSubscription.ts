
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
        .select('subscription_tier, email')
        .eq('id', user.id)
        .single();

      // Special handling for developer user
      const isDeveloperUser = profile?.email === 'wikus77@hotmail.it';
      
      if (profile) {
        if (isDeveloperUser) {
          setCurrentTier('Black');
          console.log('🔧 Developer user detected - setting Black tier');
        } else {
          setCurrentTier(profile.subscription_tier || 'Free');
        }
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
      } else if (isDeveloperUser) {
        // Create unlimited allowance for developer if not exists
        const currentWeek = new Date().getWeek();
        const currentYear = new Date().getFullYear();
        
        const { data: newAllowance } = await supabase
          .from('weekly_buzz_allowances')
          .insert({
            user_id: user.id,
            week_number: currentWeek,
            year: currentYear,
            max_buzz_count: 999,
            used_buzz_count: 0
          })
          .select()
          .single();
          
        if (newAllowance) {
          setWeeklyAllowance(newAllowance);
        }
      }

    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canUseBuzz = async (): Promise<boolean> => {
    if (!user) return false;

    // Check if user is developer
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();
      
    if (profile?.email === 'wikus77@hotmail.it') {
      return true; // Developer has unlimited access
    }

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

    // Check if user is developer
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();
      
    if (profile?.email === 'wikus77@hotmail.it') {
      return true; // Developer doesn't consume buzz
    }

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
    // Developer has unlimited buzz
    if (currentTier === 'Black') return 999;
    
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

// Add week number calculation to Date prototype if not exists
declare global {
  interface Date {
    getWeek(): number;
  }
}

if (!Date.prototype.getWeek) {
  Date.prototype.getWeek = function() {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };
}
