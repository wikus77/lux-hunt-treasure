
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BuzzMapArea } from './useBuzzMapLogic';
import { useBuzzMapUtils } from './buzz/useBuzzMapUtils';

// UUID di fallback per sviluppo
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

export const useBuzzAreaManagement = (userId?: string) => {
  const [currentWeekAreas, setCurrentWeekAreas] = useState<BuzzMapArea[]>([]);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  
  const { getCurrentWeek, getActiveAreaFromList, calculateNextRadiusFromArea } = useBuzzMapUtils();
  
  // Ottieni user_id valido per Supabase
  const getValidUserId = useCallback(() => {
    if (!userId) return null;
    return userId === 'developer-fake-id' ? DEVELOPER_UUID : userId;
  }, [userId]);

  // Get active area from current week areas
  const getActiveArea = useCallback((): BuzzMapArea | null => {
    return getActiveAreaFromList(currentWeekAreas);
  }, [currentWeekAreas, getActiveAreaFromList]);

  // Calculate next radius based on active area
  const calculateNextRadius = useCallback((): number => {
    const activeArea = getActiveArea();
    return calculateNextRadiusFromArea(activeArea);
  }, [getActiveArea, calculateNextRadiusFromArea]);

  // Load current week areas - con user ID valido
  const loadCurrentWeekAreas = useCallback(async () => {
    const validUserId = getValidUserId();
    if (!validUserId) {
      console.log('📍 No valid user ID provided for loading areas');
      return;
    }

    try {
      const currentWeek = getCurrentWeek();
      console.log('📍 Loading BUZZ areas for user:', validUserId, 'week:', currentWeek);

      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
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
  }, [getValidUserId, getCurrentWeek]);

  // Remove previous area - IMPROVED WITH FALLBACK and valid user ID
  const removePreviousArea = useCallback(async (): Promise<boolean> => {
    const validUserId = getValidUserId();
    if (!validUserId) {
      console.log('❌ No valid user ID provided for removing area');
      return false;
    }

    try {
      const currentWeek = getCurrentWeek();
      console.log('🗑️ Attempting to remove previous BUZZ area for user:', validUserId, 'week:', currentWeek);

      // First check if there are any existing areas
      const { data: existingAreas, error: checkError } = await supabase
        .from('user_map_areas')
        .select('id')
        .eq('user_id', validUserId)
        .eq('week', currentWeek);

      if (checkError) {
        console.error('❌ Error checking existing areas:', checkError);
        console.error('❌ Error details:', checkError.message, checkError.code);
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
        .eq('user_id', validUserId)
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
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
      }
      return false;
    }
  }, [getValidUserId, getCurrentWeek]);

  // Force reload areas
  const forceReload = useCallback(() => {
    setForceUpdateCounter(prev => prev + 1);
    loadCurrentWeekAreas();
  }, [loadCurrentWeekAreas]);

  // Load areas on mount and when userId changes
  useEffect(() => {
    const validUserId = getValidUserId();
    if (validUserId) {
      loadCurrentWeekAreas();
    }
  }, [getValidUserId, loadCurrentWeekAreas, forceUpdateCounter]);

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
