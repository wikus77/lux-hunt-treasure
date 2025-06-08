
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

  // FIXED: Correct queryKey with userId - QUESTO È IL QUERYKEY DEFINITIVO
  const queryKey = ['user_map_areas', validUserId];

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
      console.log('🔄 UNIFIED QUERY: Fetching areas from database for user:', validUserId);
      
      const { data: mapAreas, error: mapError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
        .order('created_at', { ascending: false });

      if (mapError) {
        console.error('❌ UNIFIED QUERY: Error loading user_map_areas:', mapError);
        throw mapError;
      }

      console.log('✅ UNIFIED QUERY: Loaded areas:', mapAreas?.length || 0);
      return mapAreas || [];
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!validUserId
  });

  // FIXED: Complete cache invalidation with EXACT SAME queryKey + refetch
  const forceCompleteInvalidation = useCallback(async () => {
    console.log('🧹 FORCE INVALIDATION: Starting complete cleanup with queryKey:', queryKey);
    
    // 1. Clear React Query cache with EXACT SAME queryKey
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.removeQueries({ queryKey });
    
    // 2. Clear related queries
    await queryClient.invalidateQueries({ queryKey: ['user_buzz_map'] });
    await queryClient.removeQueries({ queryKey: ['user_buzz_map'] });
    
    // 3. Clear localStorage and sessionStorage
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('map_area') || key.includes('buzz') || key.includes('area'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('map_area') || key.includes('buzz') || key.includes('area'))) {
          sessionStorage.removeItem(key);
        }
      }
      console.log('✅ CACHE CLEANUP: Storage cleared:', keysToRemove.length, 'keys removed');
    } catch (error) {
      console.log('⚠️ CACHE CLEANUP: Storage clear error:', error);
    }
    
    // 4. Reset Zustand state
    resetMapState();
    
    // 5. CRITICAL: Force refetch after invalidation
    await queryClient.refetchQueries({ queryKey });
    
    console.log('✅ FORCE INVALIDATION: Complete cleanup + refetch finished');
  }, [queryClient, queryKey, resetMapState]);

  // DELETE mutation with FIXED invalidation + refetch
  const deleteMutation = useMutation({
    mutationFn: async (): Promise<boolean> => {
      console.log('🔥 DELETE MUTATION: Starting nuclear delete for user:', validUserId);
      
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
        console.error('❌ DELETE MUTATION: Errors:', { deleteError1, deleteError2 });
        throw new Error('Failed to delete areas');
      }

      console.log('✅ DELETE MUTATION: Deleted counts:', { 
        user_map_areas: count1, 
        user_buzz_map: count2 
      });

      return true;
    },
    onSuccess: async () => {
      console.log('🎉 DELETE MUTATION: Success, starting complete invalidation...');
      
      // SEQUENTIAL: invalidate, then refetch with EXACT SAME queryKey
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.refetchQueries({ queryKey });
      
      console.log('✅ DELETE MUTATION: Cache invalidated and refetched with queryKey:', queryKey);
    },
    onError: (error) => {
      console.error('❌ DELETE MUTATION: Error:', error);
    }
  });

  // DELETE specific area mutation
  const deleteSpecificMutation = useMutation({
    mutationFn: async (areaId: string): Promise<boolean> => {
      console.log('🗑️ DELETE SPECIFIC: Starting delete for area:', areaId);
      
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
        throw new Error('Failed to delete specific area');
      }

      return true;
    },
    onSuccess: async () => {
      // SEQUENTIAL: invalidate, then refetch with EXACT SAME queryKey
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.refetchQueries({ queryKey });
    }
  });

  // DELETE ALL with complete protection and FIXED queryKey usage
  const deleteAllUserAreas = useCallback(async (): Promise<boolean> => {
    if (isDeleting || isGenerating) {
      console.log('🚫 DELETE ALL: Operation blocked - already in progress');
      return false;
    }

    setIsDeleting(true);
    toast.dismiss(); // Clear all existing toasts

    try {
      console.log('🔥 DELETE ALL: Starting with queryKey:', queryKey);
      
      await deleteMutation.mutateAsync();
      
      console.log('✅ DELETE ALL: Completed successfully');
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

  // DELETE specific area with protection and FIXED queryKey usage
  const deleteSpecificArea = useCallback(async (areaId: string): Promise<boolean> => {
    if (isDeleting || isGenerating) {
      console.log('🚫 DELETE SPECIFIC: Operation blocked - already in progress');
      return false;
    }

    setIsDeleting(true);
    toast.dismiss();

    try {
      console.log('🗑️ DELETE SPECIFIC: Using queryKey:', queryKey);
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

  // Force reload with FIXED queryKey
  const forceReload = useCallback(async () => {
    console.log('🔄 FORCE RELOAD: Triggered with queryKey:', queryKey);
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.refetchQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    // Data from React Query (single source of truth)
    currentWeekAreas,
    isLoading: isLoading || isFetching,
    error,
    
    // Actions
    deleteAllUserAreas,
    deleteSpecificArea,
    forceReload,
    forceCompleteInvalidation,
    refetch,
    
    // Status
    isDeleting,
    isGenerating
  };
};
