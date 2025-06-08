
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
  
  // FIXED: Ottieni user_id valido per Supabase
  const getValidUserId = useCallback(() => {
    if (!userId) return null;
    return userId === 'developer-fake-id' ? DEVELOPER_UUID : userId;
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

  // Load current week areas - con user ID valido
  const loadCurrentWeekAreas = useCallback(async () => {
    const validUserId = getValidUserId();
    if (!validUserId) {
      console.log('📍 No valid user ID provided for loading areas');
      return;
    }

    try {
      const currentWeek = getCurrentWeek();
      console.log('📍 Loading BUZZ areas for user:', validUserId, 'week:', currentWeek);

      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', validUserId)
        .eq('week', currentWeek)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading BUZZ areas:', error);
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No BUZZ areas found or access denied');
          setCurrentWeekAreas([]);
        }
        return;
      }

      console.log('✅ Loaded BUZZ areas:', data?.length || 0);
      setCurrentWeekAreas(data || []);
    } catch (error) {
      console.error('❌ Exception loading BUZZ areas:', error);
    }
  }, [getValidUserId, getCurrentWeek]);

  // FIXED: Remove previous area con controllo esistenza - SOLUZIONE DEFINITIVA
  const removePreviousArea = useCallback(async (): Promise<boolean> => {
    const validUserId = getValidUserId();
    if (!validUserId) {
      console.log('❌ No valid user ID provided for removing area');
      return false;
    }

    try {
      const currentWeek = getCurrentWeek();
      console.log('🗑️ Attempting to remove previous BUZZ area for user:', validUserId, 'week:', currentWeek);

      // FIXED: Prima controlla se esistono aree
      const { data: existingAreas, error: checkError } = await supabase
        .from('user_map_areas')
        .select('id')
        .eq('user_id', validUserId)
        .eq('week', currentWeek);

      if (checkError) {
        console.error('❌ Error checking existing areas:', checkError);
        // Se l'errore è di accesso, non è bloccante
        if (checkError.code === 'PGRST116') {
          console.log('ℹ️ No areas to check or access denied - proceeding');
          return true;
        }
        return false;
      }

      // FIXED: Se non esistono aree, non è un errore - procedi
      if (!existingAreas || existingAreas.length === 0) {
        console.log('✅ No previous areas to remove - proceeding');
        return true;
      }

      // Rimuovi aree esistenti solo se ce ne sono
      const { error: deleteError } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', validUserId)
        .eq('week', currentWeek);

      if (deleteError) {
        console.error('❌ Error removing previous BUZZ area:', deleteError);
        // Per il developer mode, non bloccare se l'errore è di permessi
        if (validUserId === DEVELOPER_UUID && deleteError.code === 'PGRST116') {
          console.log('ℹ️ Developer mode: ignoring permission error');
          return true;
        }
        return false;
      }

      console.log('✅ Successfully removed', existingAreas.length, 'previous BUZZ areas');
      return true;
    } catch (error) {
      console.error('❌ Exception removing previous BUZZ area:', error);
      // In developer mode, continua comunque
      if (validUserId === DEVELOPER_UUID) {
        console.log('ℹ️ Developer mode: continuing despite error');
        return true;
      }
      return false;
    }
  }, [getValidUserId, getCurrentWeek]);

  // Force reload areas
  const forceReload = useCallback(() => {
    setForceUpdateCounter(prev => prev + 1);
    loadCurrentWeekAreas();
  }, [loadCurrentWeekAreas]);

  // Load areas on mount and when userId changes
  useEffect(() => {
    const validUserId = getValidUserId();
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
