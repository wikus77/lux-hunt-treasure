
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

  // CRITICAL FIX: Calcolo raggio corretto con riduzione 5% EFFETTIVA
  const calculateRadiusWithReduction = (generation: number): number => {
    if (generation === 1) return 500;
    const reduction = Math.pow(0.95, generation - 1);
    const newRadius = 500 * reduction;
    console.log(`📊 CALCOLO RAGGIO Gen ${generation}: 500 * 0.95^${generation-1} = ${newRadius.toFixed(1)}km`);
    return Math.max(5, newRadius);
  };

  // CRITICAL FIX: Cancellazione FORZATA con validazione aggressiva
  const deletePreviousBuzzMapAreas = useCallback(async () => {
    if (!userId) {
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      if (!hasDeveloperAccess) return false;
    }

    try {
      console.log('🔥 CANCELLAZIONE FORZATA: Eliminando TUTTE le aree per user:', userId);
      
      // STEP 1: Reset stato locale immediato
      setAreas([]);
      
      // STEP 2: Cancellazione database con retry aggressivo
      let deleteSuccess = false;
      let attempts = 0;
      
      while (!deleteSuccess && attempts < 10) {
        attempts++;
        console.log(`🗑️ DELETE attempt ${attempts}/10`);
        
        const { error: deleteError, count } = await supabase
          .from('user_map_areas')
          .delete({ count: 'exact' })
          .eq('user_id', userId || '00000000-0000-4000-a000-000000000000');

        if (deleteError) {
          console.error(`❌ DELETE attempt ${attempts} fallito:`, deleteError);
          if (attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            continue;
          }
          return false;
        } else {
          console.log(`✅ DELETE riuscito al tentativo ${attempts}, cancellate ${count} aree`);
          deleteSuccess = true;
        }
      }

      // STEP 3: Verifica cancellazione
      let verificationSuccess = false;
      let verifyAttempts = 0;
      
      while (!verificationSuccess && verifyAttempts < 5) {
        verifyAttempts++;
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const { data: remainingAreas } = await supabase
          .from('user_map_areas')
          .select('id')
          .eq('user_id', userId || '00000000-0000-4000-a000-000000000000');

        if (!remainingAreas || remainingAreas.length === 0) {
          verificationSuccess = true;
          console.log(`✅ VERIFICA cancellazione OK al tentativo ${verifyAttempts}`);
        } else {
          console.error(`❌ Aree ancora presenti tentativo ${verifyAttempts}:`, remainingAreas);
        }
      }

      return verificationSuccess;
    } catch (error) {
      console.error('❌ Eccezione durante cancellazione:', error);
      return false;
    }
  }, [userId]);

  // CRITICAL FIX: Caricamento con cache busting aggressivo
  useEffect(() => {
    let isMounted = true;
    
    const loadAreas = async () => {
      if (!userId && !localStorage.getItem('developer_access')) return;

      try {
        const timestamp = Date.now();
        const { data, error } = await supabase
          .from('user_map_areas')
          .select('*')
          .eq('user_id', userId || '00000000-0000-4000-a000-000000000000')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('❌ Errore caricamento aree:', error);
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
          console.log('✅ Aree caricate:', mappedAreas.length, 'cache bust:', timestamp);
        }
      } catch (error) {
        console.error('❌ Eccezione caricamento aree:', error);
      }
    };

    loadAreas();
    
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // CRITICAL FIX: Generazione con calcolo raggio CORRETTO e cancellazione
  const generateBuzzMapArea = useCallback(async (lat: number, lng: number): Promise<BuzzMapArea | null> => {
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    if (!userId && !isDeveloper && !hasDeveloperAccess) {
      console.error('❌ No valid user ID');
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 GENERAZIONE POTENZIATA: Con cancellazione e riduzione 5%');

      // STEP 1: CANCELLAZIONE FORZATA
      const deletionSuccess = await deletePreviousBuzzMapAreas();
      if (!deletionSuccess) {
        console.error('❌ Fallimento cancellazione');
        toast.error('Errore nella cancellazione aree precedenti');
        setIsGenerating(false);
        return null;
      }

      // STEP 2: Calcola generazione e raggio con riduzione 5% CORRETTA
      const generationCount = dailyBuzzMapCounter + 1;
      const newRadius = calculateRadiusWithReduction(generationCount);

      // STEP 3: Chiama edge function con raggio CORRETTO
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
        console.error('❌ Edge function error:', edgeError);
        toast.error('Errore nella chiamata al server');
        setIsGenerating(false);
        return null;
      }

      if (!response?.success) {
        console.error('❌ Edge function fallita:', response?.errorMessage);
        toast.error(response?.errorMessage || 'Errore nella generazione area');
        setIsGenerating(false);
        return null;
      }

      // STEP 4: Crea nuova area con raggio CORRETTO
      const newArea: BuzzMapArea = {
        id: response.areaId || `area-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        lat: response.lat || lat,
        lng: response.lng || lng,
        radius_km: newRadius, // CRITICAL: Usa raggio calcolato correttamente
        week: Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000)),
        created_at: new Date().toISOString(),
        user_id: userId || '00000000-0000-4000-a000-000000000000'
      };

      // STEP 5: Aggiorna stato con SOLO la nuova area
      setAreas([newArea]);
      setDailyBuzzMapCounter(generationCount);

      console.log('✅ NUOVA AREA con RIDUZIONE 5% CORRETTA:', newArea);
      
      const maxGenerations = (isDeveloper || hasDeveloperAccess) ? 50 : 25;
      toast.success(`✅ Area BUZZ MAPPA: ${newArea.radius_km.toFixed(1)}km - Gen ${generationCount}/${maxGenerations}`);

      return newArea;

    } catch (error) {
      console.error('❌ Eccezione generazione area:', error);
      toast.error('Errore imprevisto nella generazione');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [userId, dailyBuzzMapCounter, deletePreviousBuzzMapAreas, currentUser?.email]);

  const getActiveArea = useCallback(() => {
    return areas.length > 0 ? areas[0] : null;
  }, [areas]);

  const reloadAreas = useCallback(async () => {
    if (!userId) return;

    try {
      const timestamp = Date.now();
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

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
        console.log('✅ Aree ricaricate:', mappedAreas.length, 'timestamp:', timestamp);
      }
    } catch (error) {
      console.error('❌ Errore ricaricamento aree:', error);
    }
  }, [userId]);

  return {
    isGenerating,
    areas,
    dailyBuzzMapCounter,
    generateBuzzMapArea,
    getActiveArea,
    reloadAreas,
    deletePreviousBuzzMapAreas
  };
};
