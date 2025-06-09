
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BuzzMapArea } from './useBuzzMapLogic';
import { useMapStore } from '@/stores/mapStore';
import { toast } from 'sonner';

// UUID di fallback per sviluppo
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

// CRITICAL: Mandatory database validation function after DELETE
const validateBuzzDeletion = async (validUserId: string): Promise<boolean> => {
  console.debug('🧪 VALIDATING BUZZ DELETION for user:', validUserId);
  
  // Check user_map_areas with exact count
  const { count: areaCount, error: areaError } = await supabase
    .from("user_map_areas")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", validUserId);
  
  console.debug("✅ POST DELETE QUERY user_map_areas:", areaCount);
  
  // Check user_buzz_map with exact count
  const { count: buzzCount, error: buzzError } = await supabase
    .from("user_buzz_map")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", validUserId);
  
  console.debug("✅ POST DELETE QUERY user_buzz_map:", buzzCount);
  
  if (areaError || buzzError) {
    console.error('❌ VALIDATION ERROR:', { areaError, buzzError });
    return false;
  }
  
  const isClean = (areaCount || 0) === 0 && (buzzCount || 0) === 0;
  
  if (!isClean) {
    console.error('🚨 RENDER BLOCCATO: DB NON VUOTO DOPO DELETE:', {
      user_map_areas_remaining: areaCount || 0,
      user_buzz_map_remaining: buzzCount || 0,
      validUserId
    });
  } else {
    console.debug('✅ DATABASE VALIDATION PASSED - Both tables empty');
  }
  
  return isClean;
};

// UNIFIED DELETE FUNCTION - Used by both trash icon and "Cancella Tutto"
const executeUnifiedDelete = async (validUserId: string, areaId?: string): Promise<boolean> => {
  console.debug('🔥 UNIFIED DELETE START:', { validUserId, areaId, isSpecific: !!areaId });
  
  if (areaId) {
    // DELETE SPECIFIC AREA
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
      console.error('❌ UNIFIED DELETE SPECIFIC ERROR:', { deleteError1, deleteError2 });
      throw new Error('Failed to delete specific area');
    }
  } else {
    // DELETE ALL AREAS
    const { error: deleteError1, count: count1 } = await supabase
      .from('user_map_areas')
      .delete({ count: 'exact' })
      .eq('user_id', validUserId);

    const { error: deleteError2, count: count2 } = await supabase
      .from('user_buzz_map')
      .delete({ count: 'exact' })
      .eq('user_id', validUserId);

    console.debug('🗑️ UNIFIED DELETE ALL RESULTS:', {
      user_map_areas: { error: deleteError1, rowsDeleted: count1 },
      user_buzz_map: { error: deleteError2, rowsDeleted: count2 }
    });

    if (deleteError1 || deleteError2) {
      console.error('❌ UNIFIED DELETE ALL ERROR:', { deleteError1, deleteError2 });
      throw new Error('Failed to delete all areas');
    }
  }

  // CRITICAL: MANDATORY POST-DELETE VALIDATION
  console.debug('🧪 PERFORMING MANDATORY POST-DELETE VALIDATION...');
  const isValidated = await validateBuzzDeletion(validUserId);
  
  if (!isValidated) {
    const errorMsg = `🚨 DELETE VALIDATION FAILED: Database still contains rows after DELETE operation`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.debug('✅ UNIFIED DELETE SUCCESS VERIFICATION COMPLETE');
  return true;
};

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

  // MANDATORY QUERYKEY - SINGLE SOURCE OF TRUTH
  const queryKey = ['user_map_areas', validUserId];
  console.debug('🔑 QUERYKEY:', queryKey);

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
      console.debug('🔄 QUERY START - Fetching from DB for user:', validUserId);
      
      // CRITICAL: NO FALLBACKS - Only database data
      const { data: mapAreas, error: mapError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
        .order('created_at', { ascending: false });

      if (mapError) {
        console.error('❌ QUERY ERROR:', mapError);
        throw mapError;
      }

      console.debug('✅ QUERY SUCCESS - DB returned areas count:', mapAreas?.length || 0);
      
      return mapAreas || [];
    },
    staleTime: 0, // ALWAYS FRESH DATA
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!validUserId
  });

  // UNIFIED DELETE ALL MUTATION
  const deleteAllMutation = useMutation({
    mutationFn: async (): Promise<boolean> => {
      return await executeUnifiedDelete(validUserId);
    },
    onSuccess: async () => {
      console.debug('🎉 DELETE ALL SUCCESS - Starting FORCED sync sequence...');
      
      // CRITICAL: Force complete sync with EXACT queryKey
      console.debug('🔄 FORCED SYNC with queryKey:', queryKey);
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.refetchQueries({ queryKey });
      
      // Verify final state
      const finalAreas = queryClient.getQueryData(queryKey);
      console.debug('🔍 FINAL VERIFICATION - Areas in cache:', finalAreas);
      
      // CRITICAL: Block any render if cache is not empty
      if (Array.isArray(finalAreas) && finalAreas.length > 0) {
        const blockMsg = '🚨 BLOCKING: Cache still contains areas after DELETE';
        console.error(blockMsg);
        throw new Error(blockMsg);
      }
      
      console.debug('✅ DELETE ALL COMPLETE - query synced, cache verified empty');
    }
  });

  // UNIFIED DELETE SPECIFIC MUTATION
  const deleteSpecificMutation = useMutation({
    mutationFn: async (areaId: string): Promise<boolean> => {
      console.debug('🗑️ DELETE SPECIFIC START for area:', areaId);
      return await executeUnifiedDelete(validUserId, areaId);
    },
    onSuccess: async () => {
      console.debug('🎉 DELETE SPECIFIC SUCCESS - Starting FORCED sync...');
      
      // CRITICAL: Force complete sync with EXACT queryKey
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.refetchQueries({ queryKey });
      
      console.debug('✅ DELETE SPECIFIC - Sync COMPLETE');
    }
  });

  // FORCED INVALIDATE + REFETCH SEQUENCE
  const forceCompleteSync = useCallback(async () => {
    console.debug('🧹 FORCE SYNC START with queryKey:', queryKey);
    
    try {
      // Step 1: Invalidate with EXACT queryKey
      console.debug('🗑️ Invalidating with queryKey:', queryKey);
      await queryClient.invalidateQueries({ queryKey });
      
      // Step 2: FORCE immediate refetch with EXACT queryKey
      console.debug('🔄 FORCE refetch with queryKey:', queryKey);
      await queryClient.refetchQueries({ queryKey });
      
      // Step 3: Reset Zustand state
      resetMapState();
      
      console.debug('✅ FORCE SYNC COMPLETE');
      return true;
    } catch (error) {
      console.error('❌ FORCE SYNC ERROR:', error);
      return false;
    }
  }, [queryClient, queryKey, resetMapState]);

  // DELETE ALL AREAS - Uses unified logic (same as trash icon)
  const deleteAllUserAreas = useCallback(async (): Promise<boolean> => {
    if (isDeleting || isGenerating) {
      console.debug('🚫 DELETE ALL - Operation blocked - already in progress');
      return false;
    }

    setIsDeleting(true);
    toast.dismiss();

    try {
      console.debug('🔥 DELETE ALL - Starting with validUserId:', validUserId);
      
      await deleteAllMutation.mutateAsync();
      
      console.debug('✅ DELETE ALL - Completed successfully');
      toast.success('Tutte le aree sono state eliminate definitivamente');
      
      return true;
    } catch (error) {
      console.error('❌ DELETE ALL - Failed:', error);
      toast.error('Errore nell\'eliminazione delle aree');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, isGenerating, setIsDeleting, deleteAllMutation, validUserId]);

  // DELETE SPECIFIC AREA - Uses unified logic (same as "Cancella Tutto")
  const deleteSpecificArea = useCallback(async (areaId: string): Promise<boolean> => {
    if (isDeleting || isGenerating) {
      console.debug('🚫 DELETE SPECIFIC - Operation blocked - already in progress');
      return false;
    }

    setIsDeleting(true);
    toast.dismiss();

    try {
      await deleteSpecificMutation.mutateAsync(areaId);
      toast.success('Area eliminata definitivamente');
      return true;
    } catch (error) {
      console.error('❌ DELETE SPECIFIC - Failed:', error);
      toast.error('Errore nell\'eliminazione dell\'area');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, isGenerating, setIsDeleting, deleteSpecificMutation]);

  // Force reload with EXACT queryKey
  const forceReload = useCallback(async () => {
    console.debug('🔄 FORCE RELOAD - Triggered with queryKey:', queryKey);
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.refetchQueries({ queryKey });
    console.debug('✅ FORCE RELOAD - Complete');
  }, [queryClient, queryKey]);

  return {
    // Data from React Query (single source of truth)
    currentWeekAreas,
    isLoading: isLoading || isFetching,
    error,
    
    // Actions - BOTH USE UNIFIED LOGIC
    deleteAllUserAreas,
    deleteSpecificArea,
    forceReload,
    forceCompleteSync,
    refetch,
    
    // Status
    isDeleting,
    isGenerating,
    
    // Validation function
    validateBuzzDeletion: () => validateBuzzDeletion(validUserId)
  };
};
