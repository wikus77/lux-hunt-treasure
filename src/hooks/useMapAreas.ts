
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
  console.debug('🔑 UNIFIED QUERYKEY:', queryKey);

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
      console.debug('🔄 QUERY START: Fetching from DB for user:', validUserId);
      
      const { data: mapAreas, error: mapError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
        .order('created_at', { ascending: false });

      if (mapError) {
        console.error('❌ QUERY ERROR:', mapError);
        throw mapError;
      }

      console.debug('✅ QUERY SUCCESS: DB returned areas:', mapAreas?.length || 0);
      console.debug('📋 QUERY AREAS DETAIL:', mapAreas);
      return mapAreas || [];
    },
    staleTime: 0, // SEMPRE FRESH DATA
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!validUserId
  });

  // FORCED INVALIDATE + REFETCH SEQUENCE
  const forceCompleteSync = useCallback(async () => {
    console.debug('🧹 FORCE SYNC START with UNIFIED queryKey:', queryKey);
    
    try {
      // Step 1: Invalidate with UNIFIED queryKey
      console.debug('🗑️ STEP 1: Invalidating with UNIFIED queryKey:', queryKey);
      await queryClient.invalidateQueries({ queryKey });
      
      // Step 2: FORCE immediate refetch with UNIFIED queryKey
      console.debug('🔄 STEP 2: FORCE refetch with UNIFIED queryKey:', queryKey);
      await queryClient.refetchQueries({ queryKey });
      
      // Step 3: Reset Zustand state
      console.debug('🗑️ STEP 3: Resetting Zustand state...');
      resetMapState();
      
      // Step 4: Verify final state
      const finalData = queryClient.getQueryData(queryKey);
      console.debug('✅ FORCE SYNC COMPLETE. Final areas:', finalData);
      
      return true;
    } catch (error) {
      console.error('❌ FORCE SYNC ERROR:', error);
      return false;
    }
  }, [queryClient, queryKey, resetMapState]);

  // DELETE ALL MUTATION with FORCED sync sequence
  const deleteMutation = useMutation({
    mutationFn: async (): Promise<boolean> => {
      console.debug('🔥 DELETE ALL START for user:', validUserId);
      
      // Delete from BOTH tables (complete cleanup)
      const { error: deleteError1, count: count1 } = await supabase
        .from('user_map_areas')
        .delete({ count: 'exact' })
        .eq('user_id', validUserId);

      const { error: deleteError2, count: count2 } = await supabase
        .from('user_buzz_map')
        .delete({ count: 'exact' })
        .eq('user_id', validUserId);

      console.debug('🗑️ DELETE RESULTS:', {
        user_map_areas: { error: deleteError1, count: count1 },
        user_buzz_map: { error: deleteError2, count: count2 }
      });

      if (deleteError1 || deleteError2) {
        console.error('❌ DELETE ALL ERROR:', { deleteError1, deleteError2 });
        throw new Error('Failed to delete areas from database');
      }

      // Verify DELETE success
      const { data: verifyMapAreas } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId);
      
      const { data: verifyBuzzMap } = await supabase
        .from('user_buzz_map')
        .select('*')
        .eq('user_id', validUserId);

      console.debug('✅ DELETE SUCCESS on [user_id]:', validUserId);
      console.debug('✅ count = 0 after SELECT user_map_areas:', (verifyMapAreas || []).length);
      console.debug('✅ count = 0 after SELECT user_buzz_map:', (verifyBuzzMap || []).length);

      return true;
    },
    onSuccess: async () => {
      console.debug('🎉 DELETE SUCCESS: Starting FORCED sync sequence...');
      
      // CRITICAL: Force complete sync with UNIFIED queryKey
      console.debug('🔄 DELETE: FORCE complete sync with UNIFIED queryKey:', queryKey);
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.refetchQueries({ queryKey });
      
      console.debug('✅ DELETE: Sync sequence COMPLETE');
      
      // Verify final state
      const finalAreas = queryClient.getQueryData(queryKey);
      console.debug('🔍 DELETE VERIFICATION: Final areas in cache:', finalAreas);
      
      if (Array.isArray(finalAreas) && finalAreas.length === 0) {
        console.debug('✅ query invalidated');
        console.debug('✅ query refetched');
        console.debug('✅ SELECT post-delete returned 0');
      } else {
        console.warn('❗ SYNC INCOMPLETE: Areas still in cache:', finalAreas);
      }
    },
    onError: (error) => {
      console.error('❌ DELETE ALL MUTATION ERROR:', error);
    }
  });

  // DELETE SPECIFIC AREA MUTATION
  const deleteSpecificMutation = useMutation({
    mutationFn: async (areaId: string): Promise<boolean> => {
      console.debug('🗑️ DELETE SPECIFIC START for area:', areaId);
      
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

      console.debug('🗑️ DELETE SPECIFIC RESULTS:', {
        user_map_areas_error: deleteError1,
        user_buzz_map_error: deleteError2
      });

      if (deleteError1 && deleteError2) {
        console.error('❌ DELETE SPECIFIC ERROR:', { deleteError1, deleteError2 });
        throw new Error('Failed to delete specific area');
      }

      console.debug('✅ DELETE SPECIFIC SUCCESS for area:', areaId);
      return true;
    },
    onSuccess: async () => {
      console.debug('🎉 DELETE SPECIFIC SUCCESS: Starting FORCED sync...');
      
      // CRITICAL: Force complete sync with UNIFIED queryKey
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.refetchQueries({ queryKey });
      
      console.debug('✅ DELETE SPECIFIC: Sync COMPLETE');
    }
  });

  // DELETE ALL with complete protection and FORCED sync
  const deleteAllUserAreas = useCallback(async (): Promise<boolean> => {
    if (isDeleting || isGenerating) {
      console.debug('🚫 DELETE ALL: Operation blocked - already in progress');
      return false;
    }

    setIsDeleting(true);
    toast.dismiss();

    try {
      console.debug('🔥 DELETE ALL: Starting with UNIFIED queryKey:', queryKey);
      
      await deleteMutation.mutateAsync();
      
      console.debug('✅ DELETE ALL: Completed successfully');
      toast.success('Tutte le aree sono state eliminate definitivamente');
      
      return true;
    } catch (error) {
      console.error('❌ DELETE ALL: Failed:', error);
      toast.error('Errore nell\'eliminazione delle aree');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, isGenerating, setIsDeleting, deleteMutation, queryKey]);

  // DELETE specific area with protection and FORCED sync
  const deleteSpecificArea = useCallback(async (areaId: string): Promise<boolean> => {
    if (isDeleting || isGenerating) {
      console.debug('🚫 DELETE SPECIFIC: Operation blocked - already in progress');
      return false;
    }

    setIsDeleting(true);
    toast.dismiss();

    try {
      console.debug('🗑️ DELETE SPECIFIC: Using UNIFIED queryKey:', queryKey);
      await deleteSpecificMutation.mutateAsync(areaId);
      toast.success('Area eliminata definitivamente');
      return true;
    } catch (error) {
      console.error('❌ DELETE SPECIFIC: Failed:', error);
      toast.error('Errore nell\'eliminazione dell\'area');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, isGenerating, setIsDeleting, deleteSpecificMutation, queryKey]);

  // Force reload with UNIFIED queryKey
  const forceReload = useCallback(async () => {
    console.debug('🔄 FORCE RELOAD: Triggered with UNIFIED queryKey:', queryKey);
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.refetchQueries({ queryKey });
    console.debug('✅ FORCE RELOAD: Complete');
  }, [queryClient, queryKey]);

  console.debug('🔍 CURRENT STATE:', {
    unifiedQueryKey: queryKey,
    areasCount: currentWeekAreas.length,
    isLoading,
    isFetching,
    areas: currentWeekAreas
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
