
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BuzzMapArea } from './useBuzzMapLogic';
import { useBuzzMapUtils } from './buzz/useBuzzMapUtils';

export const useBuzzAreaManagement = (userId?: string) => {
  const [currentWeekAreas, setCurrentWeekAreas] = useState<BuzzMapArea[]>([]);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  
  const { getCurrentWeek, getActiveAreaFromList, calculateNextRadiusFromArea } = useBuzzMapUtils();

  // Get active area from current week areas
  const getActiveArea = useCallback((): BuzzMapArea | null => {
    return getActiveAreaFromList(currentWeekAreas);
  }, [currentWeekAreas, getActiveAreaFromList]);

  // Calculate next radius based on active area
  const calculateNextRadius = useCallback((): number => {
    const activeArea = getActiveArea();
    return calculateNextRadiusFromArea(activeArea);
  }, [getActiveArea, calculateNextRadiusFromArea]);

  // Load current week areas
  const loadCurrentWeekAreas = useCallback(async () => {
    if (!userId) {
      console.log('📍 No user ID provided for loading areas');
      return;
    }

    try {
      const currentWeek = getCurrentWeek();
      console.log('📍 Loading BUZZ areas for user:', userId, 'week:', currentWeek);

      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', userId)
        .eq('week', currentWeek)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading BUZZ areas:', error);
        return;
      }

      console.log('✅ Loaded BUZZ areas:', data?.length || 0);
      setCurrentWeekAreas(data || []);
    } catch (error) {
      console.error('❌ Exception loading BUZZ areas:', error);
    }
  }, [userId, getCurrentWeek]);

  // Remove previous area - IMPROVED WITH FALLBACK
  const removePreviousArea = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      console.log('❌ No user ID provided for removing area');
      return false;
    }

    try {
      const currentWeek = getCurrentWeek();
      console.log('🗑️ Attempting to remove previous BUZZ area for user:', userId, 'week:', currentWeek);

      // First check if there are any existing areas
      const { data: existingAreas, error: checkError } = await supabase
        .from('user_map_areas')
        .select('id')
        .eq('user_id', userId)
        .eq('week', currentWeek);

      if (checkError) {
        console.error('❌ Error checking existing areas:', checkError);
        return false;
      }

      // If no areas exist, that's OK - return success
      if (!existingAreas || existingAreas.length === 0) {
        console.log('✅ No previous areas to remove - proceeding');
        return true;
      }

      // Remove existing areas
      const { error: deleteError } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', userId)
        .eq('week', currentWeek);

      if (deleteError) {
        console.error('❌ Error removing previous BUZZ area:', deleteError);
        console.error('❌ Error details:', deleteError.message, deleteError.code);
        return false;
      }

      console.log('✅ Successfully removed', existingAreas.length, 'previous BUZZ areas');
      return true;
    } catch (error) {
      console.error('❌ Exception removing previous BUZZ area:', error);
      return false;
    }
  }, [userId, getCurrentWeek]);

  // Force reload areas
  const forceReload = useCallback(() => {
    setForceUpdateCounter(prev => prev + 1);
    loadCurrentWeekAreas();
  }, [loadCurrentWeekAreas]);

  // Load areas on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadCurrentWeekAreas();
    }
  }, [userId, loadCurrentWeekAreas, forceUpdateCounter]);

  return {
    currentWeekAreas,
    forceUpdateCounter,
    getActiveArea,
    calculateNextRadius,
    loadCurrentWeekAreas,
    removePreviousArea,
    setCurrentWeekAreas,
    forceReload
  };
};
