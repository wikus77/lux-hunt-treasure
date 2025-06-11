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

  // SURGICAL FIX: Enhanced force delete with cache invalidation
  const deletePreviousBuzzMapAreas = useCallback(async () => {
    if (!userId) {
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      if (!hasDeveloperAccess) return false;
    }

    try {
      console.log('🔥 SURGICAL FIX: FORCE DELETE all previous areas for user:', userId);
      
      // STEP 1: Clear local state immediately
      setAreas([]);
      
      // STEP 2: Force database deletion with multiple attempts
      let deleteSuccess = false;
      let attempts = 0;
      
      while (!deleteSuccess && attempts < 5) {
        attempts++;
        console.log(`🗑️ DELETE attempt ${attempts}/5`);
        
        const { error: deleteError, count } = await supabase
          .from('user_map_areas')
          .delete({ count: 'exact' })
          .eq('user_id', userId || '00000000-0000-4000-a000-000000000000');

        if (deleteError) {
          console.error(`❌ DELETE attempt ${attempts} failed:`, deleteError);
          if (attempts < 5) {
            await new Promise(resolve => setTimeout(resolve, 500 * attempts));
            continue;
          }
          return false;
        } else {
          console.log(`✅ DELETE successful on attempt ${attempts}, deleted ${count} areas`);
          deleteSuccess = true;
        }
      }

      // STEP 3: Verify deletion with query
      const { data: remainingAreas } = await supabase
        .from('user_map_areas')
        .select('id')
        .eq('user_id', userId || '00000000-0000-4000-a000-000000000000');

      if (remainingAreas && remainingAreas.length > 0) {
        console.error('❌ SURGICAL FIX: Areas still exist after deletion!', remainingAreas);
        return false;
      }

      console.log('✅ SURGICAL FIX: ALL areas FORCEFULLY DELETED and verified');
      return true;
    } catch (error) {
      console.error('❌ SURGICAL FIX: Exception during deletion:', error);
      return false;
    }
  }, [userId]);

  // Enhanced area loading with cache busting
  useEffect(() => {
    let isMounted = true;
    
    const loadAreas = async () => {
      if (!userId) {
        const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
        if (!hasDeveloperAccess) return;
      }

      try {
        // Force fresh data with cache busting
        const timestamp = Date.now();
        const { data, error } = await supabase
          .from('user_map_areas')
          .select('*')
          .eq('user_id', userId || '00000000-0000-4000-a000-000000000000')
          .order('created_at', { ascending: false })
          .limit(1); // Only get the most recent area

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
          console.log('✅ Areas loaded (latest only):', mappedAreas.length, 'cache bust:', timestamp);
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

  // SURGICAL FIX: Enhanced generation with developer access (10 generations)
  const generateBuzzMapArea = useCallback(async (lat: number, lng: number): Promise<BuzzMapArea | null> => {
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    if (!userId && !isDeveloper && !hasDeveloperAccess) {
      console.error('❌ BUZZ MAP: No valid user ID');
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 SURGICAL FIX: Starting enhanced generation...');

      // STEP 1: FORCE DELETE ALL PREVIOUS AREAS
      const deletionSuccess = await deletePreviousBuzzMapAreas();
      if (!deletionSuccess) {
        console.error('❌ SURGICAL FIX: Failed to delete previous areas');
        toast.error('Errore nella cancellazione aree precedenti');
        setIsGenerating(false);
        return null;
      }

      // STEP 2: Get generation count with enhanced dev access
      const generationCount = dailyBuzzMapCounter + 1;
      
      // SURGICAL FIX: Developers get 10 generations, others get standard logic
      const maxGenerations = (isDeveloper || hasDeveloperAccess) ? 10 : 3;
      
      if (generationCount > maxGenerations && !isDeveloper && !hasDeveloperAccess) {
        toast.error(`Limite generazioni raggiunto (${maxGenerations})`);
        setIsGenerating(false);
        return null;
      }

      // STEP 3: Calculate radius with 5% reduction
      let newRadius = 500; // Start at 500km
      if (generationCount > 1) {
        newRadius = Math.max(5, 500 * Math.pow(0.95, generationCount - 1));
        console.log(`📊 SURGICAL FIX: Generation ${generationCount}/${maxGenerations}, radius: ${newRadius.toFixed(1)}km`);
      }

      // STEP 4: Call edge function
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
        console.error('❌ SURGICAL FIX: Edge function error:', edgeError);
        toast.error('Errore nella chiamata al server');
        setIsGenerating(false);
        return null;
      }

      if (!response?.success) {
        console.error('❌ SURGICAL FIX: Edge function failed:', response?.errorMessage);
        toast.error(response?.errorMessage || 'Errore nella generazione area');
        setIsGenerating(false);
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
      setDailyBuzzMapCounter(generationCount);

      console.log('✅ SURGICAL FIX: NEW SINGLE area generated:', newArea);
      
      if (isDeveloper || hasDeveloperAccess) {
        toast.success(`✅ AREA ${generationCount}/${maxGenerations}: ${newArea.radius_km.toFixed(1)}km - DEVELOPER MODE`);
      } else {
        toast.success(`✅ Nuova area BUZZ MAPPA: ${newArea.radius_km.toFixed(1)}km - Gen ${generationCount}`);
      }

      return newArea;

    } catch (error) {
      console.error('❌ SURGICAL FIX: Exception generating area:', error);
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
        console.log('✅ Areas reloaded (latest only):', mappedAreas.length);
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
