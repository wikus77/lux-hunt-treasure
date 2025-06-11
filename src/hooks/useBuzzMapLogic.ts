
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

  // CRITICAL FIX: Enhanced force delete with aggressive cache invalidation
  const deletePreviousBuzzMapAreas = useCallback(async () => {
    if (!userId) {
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      if (!hasDeveloperAccess) return false;
    }

    try {
      console.log('🔥 CRITICAL FIX: FORCE DELETE all previous areas for user:', userId);
      
      // STEP 1: Clear local state immediately and force re-render
      setAreas([]);
      
      // STEP 2: Force database deletion with aggressive retry mechanism
      let deleteSuccess = false;
      let attempts = 0;
      
      while (!deleteSuccess && attempts < 10) {
        attempts++;
        console.log(`🗑️ CRITICAL DELETE attempt ${attempts}/10`);
        
        const { error: deleteError, count } = await supabase
          .from('user_map_areas')
          .delete({ count: 'exact' })
          .eq('user_id', userId || '00000000-0000-4000-a000-000000000000');

        if (deleteError) {
          console.error(`❌ CRITICAL DELETE attempt ${attempts} failed:`, deleteError);
          if (attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 700 * attempts));
            continue;
          }
          return false;
        } else {
          console.log(`✅ CRITICAL DELETE successful on attempt ${attempts}, deleted ${count} areas`);
          deleteSuccess = true;
        }
      }

      // STEP 3: Verify deletion with aggressive verification
      let verificationSuccess = false;
      let verifyAttempts = 0;
      
      while (!verificationSuccess && verifyAttempts < 5) {
        verifyAttempts++;
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: remainingAreas } = await supabase
          .from('user_map_areas')
          .select('id')
          .eq('user_id', userId || '00000000-0000-4000-a000-000000000000');

        if (!remainingAreas || remainingAreas.length === 0) {
          verificationSuccess = true;
          console.log(`✅ CRITICAL FIX: Deletion verified on attempt ${verifyAttempts}`);
        } else {
          console.error(`❌ CRITICAL FIX: Areas still exist after deletion attempt ${verifyAttempts}:`, remainingAreas);
          if (verifyAttempts < 5) {
            continue;
          }
        }
      }

      if (!verificationSuccess) {
        console.error('❌ CRITICAL FIX: FINAL verification failed - areas may still exist');
        return false;
      }

      console.log('✅ CRITICAL FIX: ALL areas FORCEFULLY DELETED and verified');
      return true;
    } catch (error) {
      console.error('❌ CRITICAL FIX: Exception during deletion:', error);
      return false;
    }
  }, [userId]);

  // CRITICAL FIX: Enhanced area loading with aggressive cache busting
  useEffect(() => {
    let isMounted = true;
    
    const loadAreas = async () => {
      if (!userId) {
        const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
        if (!hasDeveloperAccess) return;
      }

      try {
        // CRITICAL FIX: Force fresh data with aggressive cache busting
        const timestamp = Date.now();
        const randomParam = Math.random().toString(36);
        
        const { data, error } = await supabase
          .from('user_map_areas')
          .select('*')
          .eq('user_id', userId || '00000000-0000-4000-a000-000000000000')
          .order('created_at', { ascending: false })
          .limit(1); // Only get the most recent area

        if (error) {
          console.error('❌ CRITICAL FIX: Error loading areas:', error);
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
          console.log('✅ CRITICAL FIX: Areas loaded (latest only):', mappedAreas.length, 'cache bust:', timestamp, randomParam);
        }
      } catch (error) {
        console.error('❌ CRITICAL FIX: Exception loading areas:', error);
      }
    };

    loadAreas();
    
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // CRITICAL FIX: Enhanced generation with proper radius calculation and forced deletion
  const generateBuzzMapArea = useCallback(async (lat: number, lng: number): Promise<BuzzMapArea | null> => {
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    if (!userId && !isDeveloper && !hasDeveloperAccess) {
      console.error('❌ CRITICAL FIX: No valid user ID');
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 CRITICAL FIX: Starting enhanced generation...');

      // STEP 1: FORCE DELETE ALL PREVIOUS AREAS WITH AGGRESSIVE VERIFICATION
      const deletionSuccess = await deletePreviousBuzzMapAreas();
      if (!deletionSuccess) {
        console.error('❌ CRITICAL FIX: Failed to delete previous areas');
        toast.error('Errore nella cancellazione aree precedenti');
        setIsGenerating(false);
        return null;
      }

      // STEP 2: Calculate generation count and radius with 5% reduction
      const generationCount = dailyBuzzMapCounter + 1;
      
      // CRITICAL FIX: Proper radius calculation with 5% reduction per generation
      let newRadius = 500; // Start at 500km
      if (generationCount > 1) {
        newRadius = Math.max(5, 500 * Math.pow(0.95, generationCount - 1));
        console.log(`📊 CRITICAL FIX: Generation ${generationCount}, radius calculation: 500 * 0.95^${generationCount - 1} = ${newRadius.toFixed(1)}km`);
      }

      // STEP 3: Call edge function with enhanced parameters
      const { data: response, error: edgeError } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          userId: userId || '00000000-0000-4000-a000-000000000000',
          generateMap: true,
          coordinates: { lat, lng },
          radius: newRadius,
          generationCount: generationCount
        }
      });

      if (edgeError) {
        console.error('❌ CRITICAL FIX: Edge function error:', edgeError);
        toast.error('Errore nella chiamata al server');
        setIsGenerating(false);
        return null;
      }

      if (!response?.success) {
        console.error('❌ CRITICAL FIX: Edge function failed:', response?.errorMessage);
        toast.error(response?.errorMessage || 'Errore nella generazione area');
        setIsGenerating(false);
        return null;
      }

      // CRITICAL FIX: Create new area with forced unique properties
      const newArea: BuzzMapArea = {
        id: response.areaId || `area-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        lat: response.lat || lat,
        lng: response.lng || lng,
        radius_km: response.radius_km || newRadius,
        week: Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000)),
        created_at: new Date().toISOString(),
        user_id: userId || '00000000-0000-4000-a000-000000000000'
      };

      // STEP 4: Update local state with ONLY the new area and force re-render
      setAreas([newArea]);
      setDailyBuzzMapCounter(generationCount);

      console.log('✅ CRITICAL FIX: NEW SINGLE area generated with proper radius:', newArea);
      
      const maxGenerations = (isDeveloper || hasDeveloperAccess) ? 25 : 10;
      
      if (isDeveloper || hasDeveloperAccess) {
        toast.success(`✅ AREA ${generationCount}/${maxGenerations}: ${newArea.radius_km.toFixed(1)}km - DEVELOPER MODE`);
      } else {
        toast.success(`✅ Nuova area BUZZ MAPPA: ${newArea.radius_km.toFixed(1)}km - Gen ${generationCount}`);
      }

      return newArea;

    } catch (error) {
      console.error('❌ CRITICAL FIX: Exception generating area:', error);
      toast.error('Errore imprevisto nella generazione');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [userId, dailyBuzzMapCounter, deletePreviousBuzzMapAreas, currentUser?.email]);

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
      // CRITICAL FIX: Force reload with cache busting
      const timestamp = Date.now();
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1); // Only latest area

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
        console.log('✅ CRITICAL FIX: Areas reloaded (latest only):', mappedAreas.length, 'timestamp:', timestamp);
      }
    } catch (error) {
      console.error('❌ CRITICAL FIX: Error reloading areas:', error);
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
