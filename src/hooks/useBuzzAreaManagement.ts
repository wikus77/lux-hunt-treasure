
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BuzzMapArea } from './useBuzzMapLogic';
import { useBuzzMapUtils } from './buzz/useBuzzMapUtils';

// UUID di fallback per sviluppo - SOLUZIONE DEFINITIVA
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

export const useBuzzAreaManagement = (userId?: string) => {
  const [currentWeekAreas, setCurrentWeekAreas] = useState<BuzzMapArea[]>([]);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  
  const { getCurrentWeek, getActiveAreaFromList, calculateNextRadiusFromArea } = useBuzzMapUtils();
  
  // FIXED: Ottieni user_id valido per Supabase con UUID validation
  const getValidUserId = useCallback(() => {
    console.log('🔧 getValidUserId called with userId:', userId);
    
    if (!userId) {
      console.log('🔧 No userId provided, using developer UUID');
      return DEVELOPER_UUID;
    }
    
    if (userId === 'developer-fake-id') {
      console.log('🔧 Developer fake id detected, using developer UUID');
      return DEVELOPER_UUID;
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.log('🔧 Invalid UUID format detected, using developer UUID for:', userId);
      return DEVELOPER_UUID;
    }
    
    console.log('🔧 Valid UUID provided:', userId);
    return userId;
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

  // CRITICAL FIX: Load current week areas with proper state reset and fresh data fetch
  const loadCurrentWeekAreas = useCallback(async () => {
    const validUserId = getValidUserId();
    
    try {
      const currentWeek = getCurrentWeek();
      console.log('📍 Loading BUZZ areas for user:', validUserId, 'week:', currentWeek);

      // CRITICAL: Always fetch fresh data from Supabase - no cache
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
        .eq('week', currentWeek)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading BUZZ areas:', error);
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No BUZZ areas found - setting empty array');
          setCurrentWeekAreas([]);
        }
        return;
      }

      console.log('✅ Fresh BUZZ areas loaded from database:', data?.length || 0);
      
      // CRITICAL FIX: Always set the exact data from Supabase, no merging
      setCurrentWeekAreas(data || []);
    } catch (error) {
      console.error('❌ Exception loading BUZZ areas:', error);
      setCurrentWeekAreas([]);
    }
  }, [getValidUserId, getCurrentWeek]);

  // CRITICAL FIX: Enhanced remove previous area with complete cleanup
  const removePreviousArea = useCallback(async (): Promise<boolean> => {
    const validUserId = getValidUserId();
    
    try {
      const currentWeek = getCurrentWeek();
      console.log('🗑️ Removing previous BUZZ area for user:', validUserId, 'week:', currentWeek);

      // CRITICAL FIX: Clear local state immediately to prevent any stale data
      console.log('🧹 Clearing local state before delete operation');
      setCurrentWeekAreas([]);

      // Delete from Supabase
      const { error: deleteError } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', validUserId)
        .eq('week', currentWeek);

      if (deleteError) {
        console.error('❌ Error removing previous BUZZ area:', deleteError);
        // For developer mode compatibility, continue anyway since state is cleared
        console.log('ℹ️ Proceeding despite deletion error - local state cleared');
      } else {
        console.log('✅ Successfully removed previous BUZZ areas from database');
      }

      return true;
    } catch (error) {
      console.error('❌ Exception removing previous BUZZ area:', error);
      // Ensure local state is cleared even on exception
      setCurrentWeekAreas([]);
      return true;
    }
  }, [getValidUserId, getCurrentWeek]);

  // Force reload areas with fresh fetch
  const forceReload = useCallback(() => {
    console.log('🔄 Force reload triggered - fetching fresh data');
    setForceUpdateCounter(prev => prev + 1);
    loadCurrentWeekAreas();
  }, [loadCurrentWeekAreas]);

  // Load areas on mount and when userId changes
  useEffect(() => {
    const validUserId = getValidUserId();
    console.log('🔄 Effect triggered - loading areas for userId:', validUserId);
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
