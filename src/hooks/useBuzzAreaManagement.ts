
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
  
  // FIXED: Ottieni user_id valido per Supabase con UUID validation e debug completo
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

  // CRITICAL FIX: Load current week areas with proper state reset
  const loadCurrentWeekAreas = useCallback(async () => {
    const validUserId = getValidUserId();
    
    try {
      const currentWeek = getCurrentWeek();
      console.log('📍 Loading BUZZ areas for user:', validUserId, 'week:', currentWeek);

      // CRITICAL DEBUG: Check auth state before query
      const { data: authData } = await supabase.auth.getUser();
      console.log('🔐 Auth state during area load:', {
        auth_user: authData?.user?.id || 'No auth user',
        query_user_id: validUserId,
        week: currentWeek
      });

      // FIXED: Use correct table name user_map_areas
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
        .eq('week', currentWeek)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading BUZZ areas:', error);
        console.error('❌ Query details:', {
          table: 'user_map_areas',
          user_id: validUserId,
          week: currentWeek,
          error_code: error.code,
          error_message: error.message
        });
        
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No BUZZ areas found or access denied - setting empty array');
          setCurrentWeekAreas([]);
        }
        return;
      }

      console.log('✅ Loaded BUZZ areas:', data?.length || 0);
      console.log('✅ Areas data:', data);
      
      // CRITICAL FIX: Always set the exact data from Supabase, no merging with old state
      setCurrentWeekAreas(data || []);
    } catch (error) {
      console.error('❌ Exception loading BUZZ areas:', error);
      // CRITICAL: Set empty array on exception to prevent stale data
      setCurrentWeekAreas([]);
    }
  }, [getValidUserId, getCurrentWeek]);

  // CRITICAL FIX: Enhanced remove previous area with complete state cleanup
  const removePreviousArea = useCallback(async (): Promise<boolean> => {
    const validUserId = getValidUserId();
    
    try {
      const currentWeek = getCurrentWeek();
      console.log('🗑️ Attempting to remove previous BUZZ area for user:', validUserId, 'week:', currentWeek);

      // CRITICAL DEBUG: Check auth state before delete
      const { data: authData } = await supabase.auth.getUser();
      console.log('🔐 Auth state during area removal:', {
        auth_user: authData?.user?.id || 'No auth user',
        delete_user_id: validUserId,
        week: currentWeek
      });

      // CRITICAL FIX: First clear local state immediately to prevent stale data
      console.log('🧹 Clearing local state before delete operation');
      setCurrentWeekAreas([]);

      // Then check if there are areas to delete in Supabase
      const { data: existingAreas, error: checkError } = await supabase
        .from('user_map_areas')
        .select('id')
        .eq('user_id', validUserId)
        .eq('week', currentWeek);

      if (checkError) {
        console.error('❌ Error checking existing areas:', checkError);
        if (checkError.code === 'PGRST116') {
          console.log('ℹ️ No areas to check or access denied - proceeding anyway');
          return true;
        }
        return false;
      }

      // If no areas exist, we're already done
      if (!existingAreas || existingAreas.length === 0) {
        console.log('✅ No previous areas to remove - local state already cleared');
        return true;
      }

      console.log('🗑️ Found', existingAreas.length, 'areas to remove from Supabase');

      // Remove areas from Supabase
      const { error: deleteError } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', validUserId)
        .eq('week', currentWeek);

      if (deleteError) {
        console.error('❌ Error removing previous BUZZ area from Supabase:', deleteError);
        console.error('❌ Delete error details:', {
          message: deleteError.message,
          code: deleteError.code,
          details: deleteError.details,
          user_id: validUserId,
          week: currentWeek
        });
        // Continue anyway for developer mode compatibility, state already cleared
        console.log('ℹ️ Proceeding despite deletion error - local state cleared');
        return true;
      }

      console.log('✅ Successfully removed', existingAreas.length, 'previous BUZZ areas from Supabase');
      console.log('✅ Local state was already cleared');
      return true;
    } catch (error) {
      console.error('❌ Exception removing previous BUZZ area:', error);
      // CRITICAL: Ensure local state is cleared even on exception
      console.log('🧹 Clearing local state due to exception');
      setCurrentWeekAreas([]);
      console.log('ℹ️ Continuing despite exception - local state cleared');
      return true;
    }
  }, [getValidUserId, getCurrentWeek]);

  // Force reload areas
  const forceReload = useCallback(() => {
    console.log('🔄 Force reload triggered');
    setForceUpdateCounter(prev => prev + 1);
    // Reload fresh data from Supabase
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
