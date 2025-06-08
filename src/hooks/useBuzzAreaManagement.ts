
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

  // DIAGNOSTIC: Load areas with extensive logging
  const loadCurrentWeekAreas = useCallback(async () => {
    const validUserId = getValidUserId();
    
    try {
      console.log('👀 DIAGNOSTIC - loadCurrentWeekAreas starting for user:', validUserId);
      console.log('👀 DIAGNOSTIC - Current state before load:', {
        currentAreas: currentWeekAreas.length,
        forceCounter: forceUpdateCounter
      });

      // STEP 1: Clear local state immediately
      setCurrentWeekAreas([]);
      console.log('👀 DIAGNOSTIC - Local state cleared');

      // STEP 2: Query user_map_areas
      console.log('👀 DIAGNOSTIC - Querying user_map_areas...');
      const { data: mapAreas, error: mapError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
        .order('created_at', { ascending: false });

      if (mapError) {
        console.error('❌ DIAGNOSTIC - Error loading user_map_areas:', mapError);
        setCurrentWeekAreas([]);
        return;
      }

      console.log('👀 DIAGNOSTIC - user_map_areas result:', {
        count: mapAreas?.length || 0,
        data: mapAreas?.map(area => ({
          id: area.id,
          radius_km: area.radius_km,
          created_at: area.created_at
        }))
      });

      // STEP 3: Query user_buzz_map for comparison
      console.log('👀 DIAGNOSTIC - Querying user_buzz_map...');
      const { data: buzzAreas, error: buzzError } = await supabase
        .from('user_buzz_map')
        .select('*')
        .eq('user_id', validUserId)
        .order('generated_at', { ascending: false });

      if (buzzError) {
        console.error('❌ DIAGNOSTIC - Error loading user_buzz_map:', buzzError);
      } else {
        console.log('👀 DIAGNOSTIC - user_buzz_map result:', {
          count: buzzAreas?.length || 0,
          data: buzzAreas?.map(area => ({
            id: area.id,
            radius_km: area.radius_km,
            generated_at: area.generated_at
          }))
        });
      }

      // STEP 4: Set the areas and log final state
      const finalAreas = mapAreas || [];
      setCurrentWeekAreas(finalAreas);
      
      console.log('👀 DIAGNOSTIC - Final areas set:', {
        count: finalAreas.length,
        areas: finalAreas.map(area => ({
          id: area.id,
          radius_km: area.radius_km,
          lat: area.lat,
          lng: area.lng
        }))
      });

    } catch (error) {
      console.error('❌ DIAGNOSTIC - Exception in loadCurrentWeekAreas:', error);
      setCurrentWeekAreas([]);
    }
  }, [getValidUserId, currentWeekAreas.length, forceUpdateCounter]);

  // NUCLEAR DELETE with extensive diagnostics
  const removePreviousArea = useCallback(async (): Promise<boolean> => {
    const validUserId = getValidUserId();
    
    if (isDeleting) {
      console.log('🚫 DIAGNOSTIC - Delete already in progress, preventing duplicate');
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      console.log('🔥 DIAGNOSTIC - NUCLEAR DELETE starting for user:', validUserId);
      console.log('🔥 DIAGNOSTIC - Areas before delete:', currentWeekAreas.length);

      // STEP 1: Clear local state immediately
      setCurrentWeekAreas([]);
      console.log('✅ DIAGNOSTIC - Local state cleared immediately');

      // STEP 2: Delete from user_map_areas
      console.log('🗑️ DIAGNOSTIC - Deleting from user_map_areas...');
      const { error: deleteError1, count: count1 } = await supabase
        .from('user_map_areas')
        .delete({ count: 'exact' })
        .eq('user_id', validUserId);

      // STEP 3: Delete from user_buzz_map
      console.log('🗑️ DIAGNOSTIC - Deleting from user_buzz_map...');
      const { error: deleteError2, count: count2 } = await supabase
        .from('user_buzz_map')
        .delete({ count: 'exact' })
        .eq('user_id', validUserId);

      if (deleteError1 || deleteError2) {
        console.error('❌ DIAGNOSTIC - Delete errors:', { deleteError1, deleteError2 });
        return false;
      }

      console.log('✅ DIAGNOSTIC - Delete counts:', { 
        user_map_areas_deleted: count1, 
        user_buzz_map_deleted: count2 
      });

      // STEP 4: Verification queries
      console.log('🔍 DIAGNOSTIC - Verifying deletion...');
      
      const { data: verifyMapAreas } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId);

      const { data: verifyBuzzAreas } = await supabase
        .from('user_buzz_map')
        .select('*')
        .eq('user_id', validUserId);

      console.log('🔍 DIAGNOSTIC - Post-delete verification:', {
        remaining_map_areas: verifyMapAreas?.length || 0,
        remaining_buzz_areas: verifyBuzzAreas?.length || 0,
        map_areas_data: verifyMapAreas,
        buzz_areas_data: verifyBuzzAreas
      });

      // STEP 5: Force update counter
      setForceUpdateCounter(prev => prev + 1);
      console.log('🔄 DIAGNOSTIC - Force update counter incremented');
      
      const success = (verifyMapAreas?.length || 0) === 0 && (verifyBuzzAreas?.length || 0) === 0;
      console.log('✅ DIAGNOSTIC - Nuclear delete success:', success);
      
      return success;
    } catch (error) {
      console.error('❌ DIAGNOSTIC - Exception in nuclear delete:', error);
      setCurrentWeekAreas([]);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [getValidUserId, isDeleting, currentWeekAreas.length]);

  // Delete specific area with diagnostics
  const deleteSpecificArea = useCallback(async (areaId: string): Promise<boolean> => {
    const validUserId = getValidUserId();
    
    if (isDeleting) {
      console.log('🚫 DIAGNOSTIC - Delete already in progress, preventing duplicate');
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      console.log('🗑️ DIAGNOSTIC - Deleting specific area:', areaId, 'for user:', validUserId);

      // Delete from both tables
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
        console.error('❌ DIAGNOSTIC - Specific area delete errors:', { deleteError1, deleteError2 });
        return false;
      }

      console.log('✅ DIAGNOSTIC - Specific area deleted from both tables');

      // Force reload
      await loadCurrentWeekAreas();
      
      return true;
    } catch (error) {
      console.error('❌ DIAGNOSTIC - Exception in specific area delete:', error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [getValidUserId, loadCurrentWeekAreas, isDeleting]);

  // Delete all user areas
  const deleteAllUserAreas = useCallback(async (): Promise<boolean> => {
    console.log('🧹 DIAGNOSTIC - deleteAllUserAreas called');
    return await removePreviousArea();
  }, [removePreviousArea]);

  // Force reload with cache busting
  const forceReload = useCallback(async () => {
    console.log('🔄 DIAGNOSTIC - forceReload triggered');
    setForceUpdateCounter(prev => {
      const newCounter = prev + 1;
      console.log('🔄 DIAGNOSTIC - Force counter updated to:', newCounter);
      return newCounter;
    });
    await loadCurrentWeekAreas();
  }, [loadCurrentWeekAreas]);

  // Load areas on mount and when dependencies change
  useEffect(() => {
    const validUserId = getValidUserId();
    console.log('🔄 DIAGNOSTIC - useEffect triggered for userId:', validUserId, 'counter:', forceUpdateCounter);
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
