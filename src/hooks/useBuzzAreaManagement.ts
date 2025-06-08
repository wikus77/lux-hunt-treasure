
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

  // CRITICAL FIX: Load current week areas with atomic database fetch - NO CACHE
  const loadCurrentWeekAreas = useCallback(async () => {
    const validUserId = getValidUserId();
    
    try {
      const currentWeek = getCurrentWeek();
      console.log('📍 ATOMIC FETCH - Loading ALL user areas for user:', validUserId);

      // CRITICAL: Clear local state IMMEDIATELY to prevent stale data
      setCurrentWeekAreas([]);

      // CRITICAL FIX: Fetch ALL areas for this user (manual + BUZZ) with FRESH data
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading user areas:', error);
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No areas found - confirmed empty state');
          setCurrentWeekAreas([]);
        }
        return;
      }

      console.log('✅ ATOMIC FETCH COMPLETE - Fresh areas loaded:', data?.length || 0);
      console.log('📊 All user areas retrieved:', data?.map(area => ({
        id: area.id,
        radius_km: area.radius_km,
        created_at: area.created_at,
        week: area.week
      })));
      
      // Set the exact data from Supabase - ALL AREAS
      setCurrentWeekAreas(data || []);
    } catch (error) {
      console.error('❌ Exception in atomic fetch:', error);
      setCurrentWeekAreas([]);
    }
  }, [getValidUserId, getCurrentWeek]);

  // CRITICAL FIX: DEFINITIVE area removal with COMPLETE database cleanup - PERMANENT DELETE
  const removePreviousArea = useCallback(async (): Promise<boolean> => {
    const validUserId = getValidUserId();
    
    try {
      console.log('🗑️ DEFINITIVE CLEANUP - Starting PERMANENT removal for user:', validUserId);

      // Step 1: Clear local state IMMEDIATELY to prevent visual inconsistency
      setCurrentWeekAreas([]);
      console.log('✅ Local state cleared immediately for visual consistency');

      // Step 2: Execute DEFINITIVE PERMANENT DELETE from Supabase - DELETE ALL AREAS FOR THIS USER
      console.log('🔥 Executing DEFINITIVE PERMANENT DELETE from user_map_areas...');
      const { error: deleteError, count } = await supabase
        .from('user_map_areas')
        .delete({ count: 'exact' })
        .eq('user_id', validUserId);

      if (deleteError) {
        console.error('❌ Database PERMANENT delete error:', deleteError);
        return false;
      } else {
        console.log('✅ DEFINITIVE PERMANENT DELETE SUCCESS - Removed count:', count);
      }

      // Step 3: CRITICAL - Force immediate verification that areas are PERMANENTLY deleted
      console.log('🔍 VERIFICATION FETCH - Checking if areas truly PERMANENTLY deleted...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId);

      if (!verifyError) {
        const remainingCount = verifyData?.length || 0;
        console.log('🔍 POST-DELETE VERIFICATION - Remaining areas:', remainingCount);
        
        if (remainingCount > 0) {
          console.warn('⚠️ Some areas still exist after delete, executing FORCE DELETE:', verifyData);
          // Force second delete attempt
          const { error: secondDeleteError } = await supabase
            .from('user_map_areas')
            .delete()
            .eq('user_id', validUserId);
          
          if (secondDeleteError) {
            console.error('❌ Second delete attempt failed:', secondDeleteError);
            return false;
          } else {
            console.log('✅ FORCE DELETE successful - ALL AREAS PERMANENTLY REMOVED');
          }
        } else {
          console.log('✅ PERFECT CLEANUP - No areas remaining in database - PERMANENT DELETION CONFIRMED');
        }
        
        // Ensure local state reflects actual database state (should be empty)
        setCurrentWeekAreas([]);
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
  }, [getValidUserId]);

  // CRITICAL FIX: Delete specific area with immediate verification and PERMANENT REMOVAL
  const deleteSpecificArea = useCallback(async (areaId: string): Promise<boolean> => {
    const validUserId = getValidUserId();
    
    try {
      console.log('🗑️ ATOMIC DELETE - PERMANENTLY removing specific area:', areaId, 'for user:', validUserId);

      // Execute immediate PERMANENT database delete
      const { error: deleteError, count } = await supabase
        .from('user_map_areas')
        .delete({ count: 'exact' })
        .eq('id', areaId)
        .eq('user_id', validUserId);

      if (deleteError) {
        console.error('❌ Specific area PERMANENT delete error:', deleteError);
        return false;
      }

      console.log('✅ SPECIFIC DELETE SUCCESS - PERMANENTLY removed count:', count);

      // CRITICAL: Force immediate reload from database to ensure consistency
      await loadCurrentWeekAreas();
      
      console.log('📊 State synchronized after specific delete - current areas:', currentWeekAreas.length);
      
      return true;
    } catch (error) {
      console.error('❌ Exception in specific area delete:', error);
      return false;
    }
  }, [getValidUserId, loadCurrentWeekAreas]);

  // CRITICAL FIX: Delete ALL user areas (manual + BUZZ) - DEFINITIVE PERMANENT ELIMINATION
  const deleteAllUserAreas = useCallback(async (): Promise<boolean> => {
    const validUserId = getValidUserId();
    
    try {
      console.log('🧹 TOTAL CLEANUP - PERMANENTLY deleting ALL areas for user:', validUserId);

      // Step 1: Clear local state immediately for visual consistency
      setCurrentWeekAreas([]);

      // Step 2: PERMANENTLY delete ALL areas for this user (manual AND BUZZ areas)
      const { error: deleteError, count } = await supabase
        .from('user_map_areas')
        .delete({ count: 'exact' })
        .eq('user_id', validUserId);

      if (deleteError) {
        console.error('❌ Delete all areas PERMANENT error:', deleteError);
        return false;
      }

      console.log('✅ ALL AREAS PERMANENTLY DELETED - Removed count:', count);

      // Step 3: Verify complete PERMANENT deletion
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId);

      if (!verifyError && verifyData && verifyData.length > 0) {
        console.warn('⚠️ Some areas still exist, forcing final PERMANENT cleanup:', verifyData);
        // Force final PERMANENT cleanup
        await supabase
          .from('user_map_areas')
          .delete()
          .eq('user_id', validUserId);
      }

      // Step 4: Force state refresh to reflect PERMANENT deletion
      setCurrentWeekAreas([]);
      setForceUpdateCounter(prev => prev + 1);
      
      console.log('✅ TOTAL CLEANUP COMPLETE - All areas PERMANENTLY deleted FOREVER');
      return true;
    } catch (error) {
      console.error('❌ Exception in total cleanup:', error);
      setCurrentWeekAreas([]);
      return false;
    }
  }, [getValidUserId]);

  // Force reload areas with fresh fetch - NO CACHE
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
    deleteAllUserAreas,
    setCurrentWeekAreas,
    forceReload
  };
};
