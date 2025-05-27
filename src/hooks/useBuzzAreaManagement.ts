
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BuzzMapArea } from './useBuzzMapLogic';

export const useBuzzAreaManagement = (userId: string | undefined) => {
  const [currentWeekAreas, setCurrentWeekAreas] = useState<BuzzMapArea[]>([]);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);

  // Calculate current week
  const getCurrentWeek = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  };

  // Get active area
  const getActiveArea = useCallback((): BuzzMapArea | null => {
    if (currentWeekAreas.length === 0) return null;
    return currentWeekAreas[0];
  }, [currentWeekAreas]);

  // Calculate next radius with -5% reduction
  const calculateNextRadius = useCallback((): number => {
    const BASE_RADIUS = 100; // 100 km initial
    const MIN_RADIUS = 5; // 5 km minimum
    const REDUCTION_FACTOR = 0.95; // -5% each time

    const activeArea = getActiveArea();
    
    if (!activeArea) {
      console.log('📏 No active area, using base radius:', BASE_RADIUS, 'km');
      return BASE_RADIUS;
    }

    const nextRadius = activeArea.radius_km * REDUCTION_FACTOR;
    const finalRadius = Math.max(MIN_RADIUS, nextRadius);
    
    console.log('📏 Previous radius:', activeArea.radius_km, 'km');
    console.log('📏 Calculated next radius:', nextRadius, 'km');
    console.log('📏 Final radius (with minimum):', finalRadius, 'km');
    
    return finalRadius;
  }, [getActiveArea]);

  // Load current week areas
  const loadCurrentWeekAreas = useCallback(async (forceRefresh: boolean = false) => {
    if (!userId) {
      console.log('❌ No user ID for loading areas');
      return;
    }

    const currentWeek = getCurrentWeek();
    
    try {
      console.log('🔄 CRITICAL RADIUS - Loading BUZZ areas for user:', userId, 'week:', currentWeek, 'forceRefresh:', forceRefresh);
      
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', userId)
        .eq('week', currentWeek)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error loading map areas:', error);
        return;
      }

      console.log('✅ CRITICAL RADIUS - BUZZ areas loaded for week', currentWeek, ':', data);
      
      if (data && data.length > 0) {
        const area = data[0];
        console.log('🔍 RADIUS DB VERIFICATION - Area data:', {
          id: area.id,
          user_id: area.user_id,
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          week: area.week,
          created_at: area.created_at,
          dataValid: !!(area.lat && area.lng && area.radius_km)
        });
        
        if (!area.lat || !area.lng || !area.radius_km) {
          console.error('❌ CRITICAL: Invalid area data from DB');
        } else {
          console.log('✅ CRITICAL RADIUS: Area data is valid from DB - radius:', area.radius_km, 'km');
        }
      }
      
      console.log('📝 CRITICAL RADIUS - FORCE updating currentWeekAreas state from:', currentWeekAreas, 'to:', data || []);
      setCurrentWeekAreas(data || []);
      setForceUpdateCounter(prev => prev + 1);
      
    } catch (err) {
      console.error('❌ Exception loading map areas:', err);
    }
  }, [userId, currentWeekAreas]);

  // Remove previous area
  const removePreviousArea = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    const currentWeek = getCurrentWeek();
    
    try {
      console.log('🗑️ ELIMINAZIONE area precedente per user:', userId, 'settimana:', currentWeek);
      
      const { error } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', userId)
        .eq('week', currentWeek);

      if (error) {
        console.error('❌ Error removing previous area:', error);
        return false;
      }

      console.log('✅ Area precedente ELIMINATA per settimana:', currentWeek);
      return true;
    } catch (err) {
      console.error('❌ Exception removing previous area:', err);
      return false;
    }
  }, [userId]);

  return {
    currentWeekAreas,
    forceUpdateCounter,
    getActiveArea,
    calculateNextRadius,
    loadCurrentWeekAreas,
    removePreviousArea,
    getCurrentWeek,
    setCurrentWeekAreas
  };
};
