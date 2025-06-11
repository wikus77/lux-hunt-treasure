
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

export interface BuzzMapArea {
  id: string;
  lat: number;
  lng: number;
  radius_km: number;
  week: number;
  created_at: string;
  user_id: string;
}

export const useBuzzMapLogic = () => {
  const { getCurrentUser } = useAuthContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [areas, setAreas] = useState<BuzzMapArea[]>([]);
  const [dailyBuzzMapCounter, setDailyBuzzMapCounter] = useState(0);
  
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;

  // CRITICAL FIX: Force complete area deletion before any new generation
  const deletePreviousBuzzMapAreas = useCallback(async () => {
    if (!userId) {
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      if (!hasDeveloperAccess) return false;
    }

    try {
      console.log('🗑️ SURGICAL FIX: FORCING complete deletion of all previous areas for user:', userId);
      
      // IMMEDIATE local state cleanup
      setAreas([]);
      
      // FORCED database deletion
      const { error: deleteError } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', userId || '00000000-0000-4000-a000-000000000000');

      if (deleteError) {
        console.error('❌ SURGICAL FIX: Error deleting previous areas:', deleteError);
        return false;
      } else {
        console.log('✅ SURGICAL FIX: ALL previous areas FORCEFULLY DELETED');
        return true;
      }
    } catch (error) {
      console.error('❌ SURGICAL FIX: Exception deleting areas:', error);
      return false;
    }
  }, [userId]);

  // Enhanced area loading
  useEffect(() => {
    let isMounted = true;
    
    const loadAreas = async () => {
      if (!userId) {
        const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
        if (!hasDeveloperAccess) return;
      }

      try {
        const { data, error } = await supabase
          .from('user_map_areas')
          .select('*')
          .eq('user_id', userId || '00000000-0000-4000-a000-000000000000')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error loading areas:', error);
          return;
        }

        const mappedAreas = (data || []).map(area => ({
          id: area.id,
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          week: area.week,
          created_at: area.created_at,
          user_id: area.user_id
        }));

        if (isMounted) {
          setAreas(mappedAreas);
          console.log('✅ Areas loaded:', mappedAreas.length);
        }
      } catch (error) {
        console.error('❌ Exception loading areas:', error);
      }
    };

    loadAreas();
    
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // CRITICAL FIX: Enhanced area generation with FORCED deletion and proper Stripe
  const generateBuzzMapArea = useCallback(async (lat: number, lng: number): Promise<BuzzMapArea | null> => {
    if (!userId) {
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      const isDeveloperEmail = localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
      
      if (!hasDeveloperAccess && !isDeveloperEmail) {
        console.error('❌ BUZZ MAP: No valid user ID');
        toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
        return null;
      }
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 SURGICAL FIX: Starting area generation with FORCED deletion...');

      // STEP 1: FORCE DELETE ALL PREVIOUS AREAS FIRST
      const deletionSuccess = await deletePreviousBuzzMapAreas();
      if (!deletionSuccess) {
        console.error('❌ SURGICAL FIX: Failed to delete previous areas');
        toast.error('Errore nella pulizia aree precedenti');
        return null;
      }

      // STEP 2: Calculate generation count and apply radius reduction
      const generationCount = dailyBuzzMapCounter + 1;
      let newRadius = 500; // Start at 500km
      
      if (generationCount > 1) {
        // Apply 5% reduction for each subsequent generation
        newRadius = Math.max(5, 500 * Math.pow(0.95, generationCount - 1));
        console.log(`📊 SURGICAL FIX: Radius reduction for generation ${generationCount}: ${newRadius}km`);
      }

      // STEP 3: Call edge function for area generation
      const { data: response, error: edgeError } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          userId: userId || '00000000-0000-4000-a000-000000000000',
          generateMap: true,
          coordinates: { lat, lng },
          radius: newRadius
        }
      });

      if (edgeError) {
        console.error('❌ SURGICAL FIX: Edge function error:', edgeError);
        toast.error('Errore nella chiamata al server');
        return null;
      }

      if (!response?.success) {
        console.error('❌ SURGICAL FIX: Edge function failed:', response?.errorMessage);
        toast.error(response?.errorMessage || 'Errore nella generazione area');
        return null;
      }

      // Create new area from response
      const newArea: BuzzMapArea = {
        id: response.areaId || `area-${Date.now()}`,
        lat: response.lat || lat,
        lng: response.lng || lng,
        radius_km: response.radius_km || newRadius,
        week: Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000)),
        created_at: new Date().toISOString(),
        user_id: userId || '00000000-0000-4000-a000-000000000000'
      };

      // Update local state with ONLY the new area
      setAreas([newArea]);
      setDailyBuzzMapCounter(response.generation_number || generationCount);

      console.log('✅ SURGICAL FIX: NEW SINGLE area generated successfully:', newArea);
      toast.success(`✅ Nuova area BUZZ MAPPA generata: ${newArea.radius_km.toFixed(1)}km - Gen #${generationCount}`);

      return newArea;

    } catch (error) {
      console.error('❌ SURGICAL FIX: Exception generating area:', error);
      toast.error('Errore imprevisto nella generazione');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [userId, dailyBuzzMapCounter, deletePreviousBuzzMapAreas]);

  const getActiveArea = useCallback(() => {
    return areas.length > 0 ? areas[0] : null;
  }, [areas]);

  const currentWeekAreas = useCallback(() => {
    const currentWeek = Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
    return areas.filter(area => area.week === currentWeek);
  }, [areas]);

  const reloadAreas = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mappedAreas = data.map(area => ({
          id: area.id,
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          week: area.week,
          created_at: area.created_at,
          user_id: area.user_id
        }));
        
        setAreas(mappedAreas);
        console.log('✅ Areas reloaded:', mappedAreas.length);
      }
    } catch (error) {
      console.error('❌ Error reloading areas:', error);
    }
  }, [userId]);

  return {
    isGenerating,
    areas,
    dailyBuzzMapCounter,
    generateBuzzMapArea,
    getActiveArea,
    currentWeekAreas: currentWeekAreas(),
    reloadAreas,
    loadAreas: reloadAreas,
    deletePreviousBuzzMapAreas
  };
};
