// by Joseph Mulé – M1SSION™ – BUZZ Stats Hook
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';

interface BuzzStats {
  today_count: number;
  total_count: number;
  areas_unlocked: number;
  credits_spent: number;
}

interface BuzzHistory {
  id: string;
  created_at: string;
  cost_eur: number;
  radius_generated: number;
  clue_count: number;
}

export const useBuzzStats = () => {
  const [stats, setStats] = useState<BuzzStats | null>(null);
  const [history, setHistory] = useState<BuzzHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load BUZZ statistics
  const loadBuzzStats = preserveFunctionName(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get today's buzz count
      const { data: todayData } = await supabase
        .from('user_buzz_counter')
        .select('buzz_count')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      // Get total buzz count
      const { data: totalData } = await supabase
        .from('user_buzz_counter')
        .select('buzz_count')
        .eq('user_id', user.id);

      // Get buzz map actions for history and credits
      const { data: mapActions } = await supabase
        .from('buzz_map_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get areas unlocked
      const { data: areasData } = await supabase
        .from('user_map_areas')
        .select('id')
        .eq('user_id', user.id);

      const today_count = todayData?.buzz_count || 0;
      const total_count = totalData?.reduce((sum, day) => sum + day.buzz_count, 0) || 0;
      const areas_unlocked = areasData?.length || 0;
      const credits_spent = mapActions?.reduce((sum, action) => sum + Number(action.cost_eur), 0) || 0;

      setStats({
        today_count,
        total_count,
        areas_unlocked,
        credits_spent
      });

      setHistory(mapActions || []);

    } catch (err) {
      console.error('Error loading buzz stats:', err);
      toast.error('Errore nel caricamento statistiche BUZZ');
    } finally {
      setLoading(false);
    }
  }, 'loadBuzzStats');

  useEffect(() => {
    loadBuzzStats();
  }, [user]);

  return {
    stats,
    history,
    loading,
    loadBuzzStats
  };
};