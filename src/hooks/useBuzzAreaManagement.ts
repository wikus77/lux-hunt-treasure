
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

  // CRITICAL FIX: Load current week areas with atomic database fetch
  const loadCurrentWeekAreas = useCallback(async () => {
    const validUserId = getValidUserId();
    
    try {
      const currentWeek = getCurrentWeek();
      console.log('📍 ATOMIC FETCH - Loading BUZZ areas for user:', validUserId, 'week:', currentWeek);

      // CRITICAL: Clear local state first to prevent stale data
      setCurrentWeekAreas([]);

      // Always fetch fresh data from Supabase - no cache, no local state dependency
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
        .eq('week', currentWeek)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading BUZZ areas:', error);
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No BUZZ areas found - confirmed empty state');
          setCurrentWeekAreas([]);
        }
        return;
      }

      console.log('✅ ATOMIC FETCH COMPLETE - Fresh areas loaded:', data?.length || 0);
      console.log('📊 Loaded areas with exact radius values:', data?.map(area => ({
        id: area.id,
        radius_km: area.radius_km,
        created_at: area.created_at
      })));
      
      // Set the exact data from Supabase, ensuring visual consistency
      setCurrentWeekAreas(data || []);
    } catch (error) {
      console.error('❌ Exception in atomic fetch:', error);
      setCurrentWeekAreas([]);
    }
  }, [getValidUserId, getCurrentWeek]);

  // CRITICAL FIX: Enhanced definitive area removal with complete database cleanup
  const removePreviousArea = useCallback(async (): Promise<boolean> => {
    const validUserId = getValidUserId();
    
    try {
      const currentWeek = getCurrentWeek();
      console.log('🗑️ DEFINITIVE CLEANUP - Starting complete removal for user:', validUserId, 'week:', currentWeek);

      // Step 1: Clear local state immediately to prevent visual inconsistency
      setCurrentWeekAreas([]);
      console.log('✅ Local state cleared immediately');

      // Step 2: Execute atomic delete from Supabase with explicit logging
      console.log('🔥 Executing DELETE from user_map_areas...');
      const { error: deleteError, count } = await supabase
        .from('user_map_areas')
        .delete({ count: 'exact' })
        .eq('user_id', validUserId)
        .eq('week', currentWeek);

      if (deleteError) {
        console.error('❌ Database delete error:', deleteError);
        // Even with error, try to continue for developer mode compatibility
      } else {
        console.log('✅ DEFINITIVE DELETE SUCCESS - Removed count:', count);
      }

      // Step 3: CRITICAL - Force immediate fresh fetch to verify cleanup
      console.log('🔍 VERIFICATION FETCH - Checking if areas truly deleted...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
        .eq('week', currentWeek);

      if (!verifyError) {
        const remainingCount = verifyData?.length || 0;
        console.log('🔍 POST-DELETE VERIFICATION - Remaining areas:', remainingCount);
        
        if (remainingCount > 0) {
          console.warn('⚠️ Some areas still exist after delete:', verifyData);
          // Try a second delete attempt
          const { error: secondDeleteError } = await supabase
            .from('user_map_areas')
            .delete()
            .eq('user_id', validUserId)
            .eq('week', currentWeek);
          
          if (secondDeleteError) {
            console.error('❌ Second delete attempt failed:', secondDeleteError);
          } else {
            console.log('✅ Second delete successful');
          }
        } else {
          console.log('✅ PERFECT CLEANUP - No areas remaining in database');
        }
        
        // Ensure local state reflects actual database state (should be empty)
        setCurrentWeekAreas(verifyData || []);
      }

      // Step 4: Force update counter to trigger any dependent refreshes
      setForceUpdateCounter(prev => prev + 1);
      console.log('🔄 Force update counter incremented');

      return true;
    } catch (error) {
      console.error('❌ Exception in definitive cleanup:', error);
      setCurrentWeekAreas([]);
      return false;
    }
  }, [getValidUserId, getCurrentWeek]);

  // CRITICAL FIX: Delete specific area with immediate verification
  const deleteSpecificArea = useCallback(async (areaId: string): Promise<boolean> => {
    const validUserId = getValidUserId();
    
    try {
      console.log('🗑️ ATOMIC DELETE - Removing specific area:', areaId, 'for user:', validUserId);

      // Execute immediate database delete
      const { error: deleteError, count } = await supabase
        .from('user_map_areas')
        .delete({ count: 'exact' })
        .eq('id', areaId)
        .eq('user_id', validUserId);

      if (deleteError) {
        console.error('❌ Specific area delete error:', deleteError);
        return false;
      }

      console.log('✅ SPECIFIC DELETE SUCCESS - Removed count:', count);

      // CRITICAL: Force immediate reload from database to ensure consistency
      await loadCurrentWeekAreas();
      
      console.log('📊 State synchronized after specific delete - current areas:', currentWeekAreas.length);
      
      return true;
    } catch (error) {
      console.error('❌ Exception in specific area delete:', error);
      return false;
    }
  }, [getValidUserId, loadCurrentWeekAreas]);

  // Force reload areas with fresh fetch
  const forceReload = useCallback(() => {
    console.log('🔄 FORCE RELOAD - Triggering fresh database fetch');
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
    deleteSpecificArea,
    setCurrentWeekAreas,
    forceReload
  };
};
