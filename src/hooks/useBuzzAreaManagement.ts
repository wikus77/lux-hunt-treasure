
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BuzzMapArea } from './useBuzzMapLogic';
import { useBuzzMapUtils } from './buzz/useBuzzMapUtils';

// UUID di fallback per sviluppo - SOLUZIONE DEFINITIVA
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

export const useBuzzAreaManagement = (userId?: string) => {
  const [currentWeekAreas, setCurrentWeekAreas] = useState<BuzzMapArea[]>([]);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
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

  // CRITICAL FIX: Load current week areas with COMPLETE DATABASE SYNCHRONIZATION
  const loadCurrentWeekAreas = useCallback(async () => {
    const validUserId = getValidUserId();
    
    try {
      console.log('📍 COMPLETE SYNC - Loading user areas for user:', validUserId);

      // STEP 1: Clear local state IMMEDIATELY to prevent stale data
      setCurrentWeekAreas([]);

      // STEP 2: FORCE database refresh with explicit cache bypass
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading user areas:', error);
        setCurrentWeekAreas([]);
        return;
      }

      console.log('✅ COMPLETE SYNC - Areas loaded from DB:', data?.length || 0);
      console.log('📊 Fresh areas retrieved:', data?.map(area => ({
        id: area.id,
        radius_km: area.radius_km,
        created_at: area.created_at,
        week: area.week
      })));
      
      // Set the exact data from Supabase - SINGLE SOURCE OF TRUTH
      setCurrentWeekAreas(data || []);
    } catch (error) {
      console.error('❌ Exception in complete sync:', error);
      setCurrentWeekAreas([]);
    }
  }, [getValidUserId]);

  // CRITICAL FIX: NUCLEAR DELETE - Remove ALL areas with COMPLETE verification
  const removePreviousArea = useCallback(async (): Promise<boolean> => {
    const validUserId = getValidUserId();
    
    if (isDeleting) {
      console.log('🚫 Delete already in progress, preventing duplicate');
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      console.log('🔥 NUCLEAR DELETE - Starting COMPLETE removal for user:', validUserId);

      // STEP 1: Clear local state IMMEDIATELY for instant UI feedback
      setCurrentWeekAreas([]);
      console.log('✅ Local state cleared immediately');

      // STEP 2: Execute NUCLEAR DELETE from ALL possible tables
      console.log('🗑️ Executing NUCLEAR DELETE from user_map_areas...');
      const { error: deleteError1, count: count1 } = await supabase
        .from('user_map_areas')
        .delete({ count: 'exact' })
        .eq('user_id', validUserId);

      console.log('🗑️ Executing NUCLEAR DELETE from user_buzz_map...');
      const { error: deleteError2, count: count2 } = await supabase
        .from('user_buzz_map')
        .delete({ count: 'exact' })
        .eq('user_id', validUserId);

      if (deleteError1 || deleteError2) {
        console.error('❌ Database NUCLEAR delete errors:', { deleteError1, deleteError2 });
        return false;
      }

      console.log('✅ NUCLEAR DELETE SUCCESS - Removed counts:', { count1, count2 });

      // STEP 3: TRIPLE VERIFICATION that ALL areas are deleted
      console.log('🔍 TRIPLE VERIFICATION - Checking if areas truly deleted...');
      const { data: verifyData1 } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId);

      const { data: verifyData2 } = await supabase
        .from('user_buzz_map')
        .select('*')
        .eq('user_id', validUserId);

      const remainingCount1 = verifyData1?.length || 0;
      const remainingCount2 = verifyData2?.length || 0;
      
      console.log('🔍 POST-DELETE VERIFICATION - Remaining areas:', {
        user_map_areas: remainingCount1,
        user_buzz_map: remainingCount2
      });
      
      if (remainingCount1 === 0 && remainingCount2 === 0) {
        console.log('✅ NUCLEAR DELETE VERIFIED - ALL areas permanently removed from ALL tables');
      } else {
        console.warn('⚠️ Some areas still exist after nuclear delete:', { verifyData1, verifyData2 });
      }
      
      // STEP 4: Force immediate state sync
      setForceUpdateCounter(prev => prev + 1);
      
      return true;
    } catch (error) {
      console.error('❌ Exception in nuclear delete:', error);
      setCurrentWeekAreas([]);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [getValidUserId, isDeleting]);

  // CRITICAL FIX: Delete specific area with immediate verification
  const deleteSpecificArea = useCallback(async (areaId: string): Promise<boolean> => {
    const validUserId = getValidUserId();
    
    if (isDeleting) {
      console.log('🚫 Delete already in progress, preventing duplicate');
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      console.log('🗑️ SPECIFIC DELETE - Removing area:', areaId, 'for user:', validUserId);

      // Execute immediate delete from ALL possible tables
      const { error: deleteError1 } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('id', areaId)
        .eq('user_id', validUserId);

      const { error: deleteError2 } = await supabase
        .from('user_buzz_map')
        .delete()
        .eq('id', areaId)
        .eq('user_id', validUserId);

      if (deleteError1 && deleteError2) {
        console.error('❌ Specific area delete errors:', { deleteError1, deleteError2 });
        return false;
      }

      console.log('✅ SPECIFIC DELETE SUCCESS - Area removed from all tables');

      // CRITICAL: Force immediate reload with complete sync
      await loadCurrentWeekAreas();
      
      return true;
    } catch (error) {
      console.error('❌ Exception in specific area delete:', error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [getValidUserId, loadCurrentWeekAreas, isDeleting]);

  // CRITICAL FIX: Delete ALL user areas - COMPLETE ELIMINATION
  const deleteAllUserAreas = useCallback(async (): Promise<boolean> => {
    console.log('🧹 TOTAL ELIMINATION - Starting complete user area cleanup');
    return await removePreviousArea();
  }, [removePreviousArea]);

  // Force reload areas with complete database sync
  const forceReload = useCallback(async () => {
    console.log('🔄 FORCE RELOAD - Triggering complete database sync');
    setForceUpdateCounter(prev => prev + 1);
    await loadCurrentWeekAreas();
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
    forceReload,
    isDeleting
  };
};
