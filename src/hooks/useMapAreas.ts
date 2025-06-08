
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BuzzMapArea } from './useBuzzMapLogic';
import { useMapStore } from '@/stores/mapStore';
import { toast } from 'sonner';

// UUID di fallback per sviluppo
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

export const useMapAreas = (userId?: string) => {
  const queryClient = useQueryClient();
  const { isDeleting, isGenerating, setIsDeleting, resetMapState } = useMapStore();

  // Get valid user ID
  const getValidUserId = useCallback(() => {
    if (!userId) return DEVELOPER_UUID;
    if (userId === 'developer-fake-id') return DEVELOPER_UUID;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) return DEVELOPER_UUID;
    
    return userId;
  }, [userId]);

  const validUserId = getValidUserId();

  // UNIFIED QUERYKEY - SINGLE SOURCE OF TRUTH
  const queryKey = ['user_map_areas', validUserId];
  console.debug('🔑 DIAGNOSTIC: UNIFIED QUERYKEY:', queryKey);

  // React Query for areas - SINGLE SOURCE OF TRUTH
  const {
    data: currentWeekAreas = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<BuzzMapArea[]> => {
      console.debug('🔄 DIAGNOSTIC: QUERY START - Fetching from DB for user:', validUserId);
      
      const { data: mapAreas, error: mapError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
        .order('created_at', { ascending: false });

      if (mapError) {
        console.error('❌ DIAGNOSTIC: QUERY ERROR:', mapError);
        throw mapError;
      }

      console.debug('✅ DIAGNOSTIC: QUERY SUCCESS - DB returned areas count:', mapAreas?.length || 0);
      console.debug('📋 DIAGNOSTIC: QUERY AREAS DETAIL:', mapAreas);
      console.debug('🔍 DIAGNOSTIC: Raw DB response validation:', {
        isArray: Array.isArray(mapAreas),
        actualLength: mapAreas?.length,
        firstItem: mapAreas?.[0] || 'No items',
        isEmpty: !mapAreas || mapAreas.length === 0
      });
      
      return mapAreas || [];
    },
    staleTime: 0, // SEMPRE FRESH DATA
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!validUserId
  });

  // DIAGNOSTIC: Log every data change
  console.debug('🔍 DIAGNOSTIC: Current useMapAreas state:', {
    queryKey,
    currentWeekAreas_length: currentWeekAreas.length,
    currentWeekAreas_data: currentWeekAreas,
    isLoading,
    isFetching,
    error: error?.message || 'No error'
  });

  // FORCED INVALIDATE + REFETCH SEQUENCE
  const forceCompleteSync = useCallback(async () => {
    console.debug('🧹 DIAGNOSTIC: FORCE SYNC START with UNIFIED queryKey:', queryKey);
    
    try {
      // Step 1: Invalidate with UNIFIED queryKey
      console.debug('🗑️ DIAGNOSTIC: STEP 1 - Invalidating with UNIFIED queryKey:', queryKey);
      await queryClient.invalidateQueries({ queryKey });
      console.debug('✅ DIAGNOSTIC: Invalidation completed');
      
      // Step 2: FORCE immediate refetch with UNIFIED queryKey
      console.debug('🔄 DIAGNOSTIC: STEP 2 - FORCE refetch with UNIFIED queryKey:', queryKey);
      const refetchResult = await queryClient.refetchQueries({ queryKey });
      console.debug('✅ DIAGNOSTIC: Refetch completed with result:', refetchResult);
      
      // Step 3: Reset Zustand state
      console.debug('🗑️ DIAGNOSTIC: STEP 3 - Resetting Zustand state...');
      resetMapState();
      console.debug('✅ DIAGNOSTIC: Zustand reset completed');
      
      // Step 4: Verify final state
      const finalData = queryClient.getQueryData(queryKey);
      console.debug('✅ DIAGNOSTIC: FORCE SYNC COMPLETE. Final areas:', finalData);
      console.debug('🔍 DIAGNOSTIC: Final state validation:', {
        finalData_isArray: Array.isArray(finalData),
        finalData_length: Array.isArray(finalData) ? finalData.length : 'Not array',
        finalData_content: finalData
      });
      
      return true;
    } catch (error) {
      console.error('❌ DIAGNOSTIC: FORCE SYNC ERROR:', error);
      return false;
    }
  }, [queryClient, queryKey, resetMapState]);

  // DELETE ALL MUTATION with FORCED sync sequence
  const deleteMutation = useMutation({
    mutationFn: async (): Promise<boolean> => {
      console.debug('🔥 DIAGNOSTIC: DELETE ALL START for user:', validUserId);
      
      // STEP 1: Verify current state before deletion
      const { data: preDeleteAreas } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId);
      
      const { data: preDeleteBuzzMap } = await supabase
        .from('user_buzz_map')
        .select('*')
        .eq('user_id', validUserId);

      console.debug('📊 DIAGNOSTIC: PRE-DELETE STATE:', {
        user_map_areas_count: preDeleteAreas?.length || 0,
        user_buzz_map_count: preDeleteBuzzMap?.length || 0,
        user_id: validUserId
      });
      
      // Delete from BOTH tables (complete cleanup)
      const { error: deleteError1, count: count1 } = await supabase
        .from('user_map_areas')
        .delete({ count: 'exact' })
        .eq('user_id', validUserId);

      const { error: deleteError2, count: count2 } = await supabase
        .from('user_buzz_map')
        .delete({ count: 'exact' })
        .eq('user_id', validUserId);

      console.debug('🗑️ DIAGNOSTIC: DELETE RESULTS:', {
        user_map_areas: { error: deleteError1, rowsDeleted: count1 },
        user_buzz_map: { error: deleteError2, rowsDeleted: count2 }
      });

      if (deleteError1 || deleteError2) {
        console.error('❌ DIAGNOSTIC: DELETE ALL ERROR:', { deleteError1, deleteError2 });
        throw new Error('Failed to delete areas from database');
      }

      // CRITICAL: Verify DELETE success by re-querying
      const { data: verifyMapAreas } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId);
      
      const { data: verifyBuzzMap } = await supabase
        .from('user_buzz_map')
        .select('*')
        .eq('user_id', validUserId);

      console.debug('✅ DIAGNOSTIC: DELETE SUCCESS VERIFICATION:', {
        user_id: validUserId,
        rowsDeletedFromDB_user_map_areas: count1,
        rowsDeletedFromDB_user_buzz_map: count2,
        post_delete_user_map_areas_count: (verifyMapAreas || []).length,
        post_delete_user_buzz_map_count: (verifyBuzzMap || []).length,
        verification_success: (verifyMapAreas || []).length === 0 && (verifyBuzzMap || []).length === 0
      });

      return true;
    },
    onSuccess: async () => {
      console.debug('🎉 DIAGNOSTIC: DELETE SUCCESS - Starting FORCED sync sequence...');
      
      // CRITICAL: Force complete sync with UNIFIED queryKey
      console.debug('🔄 DIAGNOSTIC: DELETE - FORCE complete sync with UNIFIED queryKey:', queryKey);
      await queryClient.invalidateQueries({ queryKey });
      console.debug('✅ DIAGNOSTIC: DELETE - Invalidation completed');
      
      const refetchResult = await queryClient.refetchQueries({ queryKey });
      console.debug('✅ DIAGNOSTIC: DELETE - Refetch completed with result:', refetchResult);
      
      console.debug('✅ DIAGNOSTIC: DELETE - Sync sequence COMPLETE');
      
      // Verify final state
      const finalAreas = queryClient.getQueryData(queryKey);
      console.debug('🔍 DIAGNOSTIC: DELETE VERIFICATION - Final areas in cache:', finalAreas);
      console.debug('🔍 DIAGNOSTIC: DELETE VERIFICATION - Final state check:', {
        finalAreas_isArray: Array.isArray(finalAreas),
        finalAreas_length: Array.isArray(finalAreas) ? finalAreas.length : 'Not array',
        expected_length: 0,
        sync_success: Array.isArray(finalAreas) && finalAreas.length === 0
      });
      
      if (Array.isArray(finalAreas) && finalAreas.length === 0) {
        console.debug('✅ DIAGNOSTIC: query invalidated');
        console.debug('✅ DIAGNOSTIC: query refetched');
        console.debug('✅ DIAGNOSTIC: SELECT post-delete returned 0');
      } else {
        console.warn('❗ DIAGNOSTIC: SYNC INCOMPLETE - Areas still in cache:', finalAreas);
      }
    },
    onError: (error) => {
      console.error('❌ DIAGNOSTIC: DELETE ALL MUTATION ERROR:', error);
    }
  });

  // DELETE SPECIFIC AREA MUTATION
  const deleteSpecificMutation = useMutation({
    mutationFn: async (areaId: string): Promise<boolean> => {
      console.debug('🗑️ DIAGNOSTIC: DELETE SPECIFIC START for area:', areaId);
      
      // Delete from BOTH tables
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

      console.debug('🗑️ DIAGNOSTIC: DELETE SPECIFIC RESULTS:', {
        user_map_areas_error: deleteError1,
        user_buzz_map_error: deleteError2
      });

      if (deleteError1 && deleteError2) {
        console.error('❌ DIAGNOSTIC: DELETE SPECIFIC ERROR:', { deleteError1, deleteError2 });
        throw new Error('Failed to delete specific area');
      }

      console.debug('✅ DIAGNOSTIC: DELETE SPECIFIC SUCCESS for area:', areaId);
      return true;
    },
    onSuccess: async () => {
      console.debug('🎉 DIAGNOSTIC: DELETE SPECIFIC SUCCESS - Starting FORCED sync...');
      
      // CRITICAL: Force complete sync with UNIFIED queryKey
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.refetchQueries({ queryKey });
      
      console.debug('✅ DIAGNOSTIC: DELETE SPECIFIC - Sync COMPLETE');
    }
  });

  // DELETE ALL with complete protection and FORCED sync
  const deleteAllUserAreas = useCallback(async (): Promise<boolean> => {
    if (isDeleting || isGenerating) {
      console.debug('🚫 DIAGNOSTIC: DELETE ALL - Operation blocked - already in progress');
      return false;
    }

    setIsDeleting(true);
    toast.dismiss();

    try {
      console.debug('🔥 DIAGNOSTIC: DELETE ALL - Starting with UNIFIED queryKey:', queryKey);
      
      await deleteMutation.mutateAsync();
      
      console.debug('✅ DIAGNOSTIC: DELETE ALL - Completed successfully');
      toast.success('Tutte le aree sono state eliminate definitivamente');
      
      return true;
    } catch (error) {
      console.error('❌ DIAGNOSTIC: DELETE ALL - Failed:', error);
      toast.error('Errore nell\'eliminazione delle aree');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, isGenerating, setIsDeleting, deleteMutation, queryKey]);

  // DELETE specific area with protection and FORCED sync
  const deleteSpecificArea = useCallback(async (areaId: string): Promise<boolean> => {
    if (isDeleting || isGenerating) {
      console.debug('🚫 DIAGNOSTIC: DELETE SPECIFIC - Operation blocked - already in progress');
      return false;
    }

    setIsDeleting(true);
    toast.dismiss();

    try {
      console.debug('🗑️ DIAGNOSTIC: DELETE SPECIFIC - Using UNIFIED queryKey:', queryKey);
      await deleteSpecificMutation.mutateAsync(areaId);
      toast.success('Area eliminata definitivamente');
      return true;
    } catch (error) {
      console.error('❌ DIAGNOSTIC: DELETE SPECIFIC - Failed:', error);
      toast.error('Errore nell\'eliminazione dell\'area');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, isGenerating, setIsDeleting, deleteSpecificMutation, queryKey]);

  // Force reload with UNIFIED queryKey
  const forceReload = useCallback(async () => {
    console.debug('🔄 DIAGNOSTIC: FORCE RELOAD - Triggered with UNIFIED queryKey:', queryKey);
    await queryClient.invalidateQueries({ queryKey });
    const refetchResult = await queryClient.refetchQueries({ queryKey });
    console.debug('✅ DIAGNOSTIC: FORCE RELOAD - Complete with result:', refetchResult);
  }, [queryClient, queryKey]);

  console.debug('🔍 DIAGNOSTIC: FINAL CURRENT STATE:', {
    unifiedQueryKey: queryKey,
    areasCount: currentWeekAreas.length,
    isLoading,
    isFetching,
    areas_source: 'react-query',
    areas_content: currentWeekAreas
  });

  return {
    // Data from React Query (single source of truth)
    currentWeekAreas,
    isLoading: isLoading || isFetching,
    error,
    
    // Actions
    deleteAllUserAreas,
    deleteSpecificArea,
    forceReload,
    forceCompleteSync,
    refetch,
    
    // Status
    isDeleting,
    isGenerating
  };
};
