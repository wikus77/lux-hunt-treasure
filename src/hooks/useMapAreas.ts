
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

  // FIXED QUERYKEY - SINGLE SOURCE OF TRUTH
  const queryKey = ['user_map_areas', validUserId];
  console.debug('🔑 QUERYKEY FIXED:', queryKey);

  // SINGLE SOURCE OF TRUTH: React Query for areas
  const {
    data: currentWeekAreas = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<BuzzMapArea[]> => {
      console.debug('🔄 QUERY START: Fetching areas from database for user:', validUserId);
      
      const { data: mapAreas, error: mapError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
        .order('created_at', { ascending: false });

      if (mapError) {
        console.error('❌ QUERY ERROR:', mapError);
        throw mapError;
      }

      console.debug('✅ QUERY SUCCESS: Loaded areas:', mapAreas?.length || 0, mapAreas);
      return mapAreas || [];
    },
    staleTime: 0, // ALWAYS FETCH FRESH DATA
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!validUserId
  });

  // COMPLETE CACHE INVALIDATION + REFETCH SEQUENCE
  const forceCompleteSync = useCallback(async () => {
    console.debug('🧹 FORCE SYNC START: Complete cache + DB sync with queryKey:', queryKey);
    
    try {
      // Step 1: Invalidate cache
      console.debug('🗑️ STEP 1: Invalidating cache...');
      await queryClient.invalidateQueries({ queryKey });
      
      // Step 2: Remove from cache
      console.debug('🗑️ STEP 2: Removing from cache...');
      await queryClient.removeQueries({ queryKey });
      
      // Step 3: Clear related queries
      console.debug('🗑️ STEP 3: Clearing related queries...');
      await queryClient.invalidateQueries({ queryKey: ['user_buzz_map'] });
      await queryClient.removeQueries({ queryKey: ['user_buzz_map'] });
      
      // Step 4: Reset Zustand state
      console.debug('🗑️ STEP 4: Resetting Zustand state...');
      resetMapState();
      
      // Step 5: CRITICAL - Force immediate refetch
      console.debug('🔄 STEP 5: Force refetch...');
      const result = await queryClient.refetchQueries({ queryKey });
      
      console.debug('✅ FORCE SYNC COMPLETE:', result);
      return true;
    } catch (error) {
      console.error('❌ FORCE SYNC ERROR:', error);
      return false;
    }
  }, [queryClient, queryKey, resetMapState]);

  // DELETE ALL MUTATION with SEQUENTIAL sync
  const deleteMutation = useMutation({
    mutationFn: async (): Promise<boolean> => {
      console.debug('🔥 DELETE ALL START for user:', validUserId);
      
      // Delete from both tables
      const { error: deleteError1, count: count1 } = await supabase
        .from('user_map_areas')
        .delete({ count: 'exact' })
        .eq('user_id', validUserId);

      const { error: deleteError2, count: count2 } = await supabase
        .from('user_buzz_map')
        .delete({ count: 'exact' })
        .eq('user_id', validUserId);

      if (deleteError1 || deleteError2) {
        console.error('❌ DELETE ALL ERROR:', { deleteError1, deleteError2 });
        throw new Error('Failed to delete areas');
      }

      console.debug('✅ DELETE ALL SUCCESS: Deleted counts:', { 
        user_map_areas: count1, 
        user_buzz_map: count2 
      });

      return true;
    },
    onSuccess: async () => {
      console.debug('🎉 DELETE ALL SUCCESS: Starting sync sequence...');
      
      // SEQUENTIAL: invalidate, then refetch
      console.debug('🔄 DELETE ALL: Invalidating queries...');
      await queryClient.invalidateQueries({ queryKey });
      
      console.debug('🔄 DELETE ALL: Refetching queries...');
      await queryClient.refetchQueries({ queryKey });
      
      console.debug('✅ DELETE ALL: Sync sequence complete');
    },
    onError: (error) => {
      console.error('❌ DELETE ALL MUTATION ERROR:', error);
    }
  });

  // DELETE SPECIFIC AREA MUTATION
  const deleteSpecificMutation = useMutation({
    mutationFn: async (areaId: string): Promise<boolean> => {
      console.debug('🗑️ DELETE SPECIFIC START for area:', areaId);
      
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
        console.error('❌ DELETE SPECIFIC ERROR:', { deleteError1, deleteError2 });
        throw new Error('Failed to delete specific area');
      }

      console.debug('✅ DELETE SPECIFIC SUCCESS for area:', areaId);
      return true;
    },
    onSuccess: async () => {
      console.debug('🎉 DELETE SPECIFIC SUCCESS: Starting sync sequence...');
      
      // SEQUENTIAL: invalidate, then refetch
      console.debug('🔄 DELETE SPECIFIC: Invalidating queries...');
      await queryClient.invalidateQueries({ queryKey });
      
      console.debug('🔄 DELETE SPECIFIC: Refetching queries...');
      await queryClient.refetchQueries({ queryKey });
      
      console.debug('✅ DELETE SPECIFIC: Sync sequence complete');
    }
  });

  // DELETE ALL with complete protection
  const deleteAllUserAreas = useCallback(async (): Promise<boolean> => {
    if (isDeleting || isGenerating) {
      console.debug('🚫 DELETE ALL: Operation blocked - already in progress');
      return false;
    }

    setIsDeleting(true);
    toast.dismiss();

    try {
      console.debug('🔥 DELETE ALL: Starting with queryKey:', queryKey);
      
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

  // DELETE specific area with protection
  const deleteSpecificArea = useCallback(async (areaId: string): Promise<boolean> => {
    if (isDeleting || isGenerating) {
      console.debug('🚫 DELETE SPECIFIC: Operation blocked - already in progress');
      return false;
    }

    setIsDeleting(true);
    toast.dismiss();

    try {
      console.debug('🗑️ DELETE SPECIFIC: Using queryKey:', queryKey);
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

  // Force reload with proper sequence
  const forceReload = useCallback(async () => {
    console.debug('🔄 FORCE RELOAD: Triggered with queryKey:', queryKey);
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.refetchQueries({ queryKey });
    console.debug('✅ FORCE RELOAD: Complete');
  }, [queryClient, queryKey]);

  console.debug('🔍 CURRENT STATE:', {
    queryKey,
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
