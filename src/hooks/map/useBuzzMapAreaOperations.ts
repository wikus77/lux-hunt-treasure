
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BuzzMapArea } from '../useBuzzMapLogic';
import { getCurrentWeek } from '@/utils/buzzMapUtils';

export const useBuzzMapAreaOperations = (userId?: string) => {
  const loadCurrentWeekAreas = useCallback(async (force: boolean = false): Promise<BuzzMapArea[]> => {
    if (!userId) return [];
    
    try {
      const currentWeek = getCurrentWeek();
      console.log('🔄 Loading current week areas for week:', currentWeek, force ? '(forced)' : '');
      
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', userId)
        .eq('week', currentWeek)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading areas:', error);
        return [];
      }

      console.log('✅ Loaded areas:', data);
      return data || [];
    } catch (err) {
      console.error('❌ Exception loading areas:', err);
      return [];
    }
  }, [userId]);

  const removePreviousArea = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const currentWeek = getCurrentWeek();
      console.log('🗑️ Removing previous areas for week:', currentWeek);
      
      const { error } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', userId)
        .eq('week', currentWeek);

      if (error) {
        console.error('❌ Error removing previous area:', error);
        return false;
      }

      console.log('✅ Previous areas removed successfully');
      return true;
    } catch (err) {
      console.error('❌ Exception removing previous area:', err);
      return false;
    }
  }, [userId]);

  return {
    loadCurrentWeekAreas,
    removePreviousArea
  };
};
