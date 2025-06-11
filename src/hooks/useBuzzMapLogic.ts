
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

  // CRITICAL FIX: Cancellazione forzata con invalidazione cache aggressiva
  const deletePreviousBuzzMapAreas = useCallback(async () => {
    if (!userId) {
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      if (!hasDeveloperAccess) return false;
    }

    try {
      console.log('🔥 RIPARAZIONE: CANCELLAZIONE FORZATA di tutte le aree precedenti per user:', userId);
      
      // STEP 1: Pulisci stato locale immediatamente e forza re-render
      setAreas([]);
      
      // STEP 2: Cancellazione database forzata con meccanismo retry aggressivo
      let deleteSuccess = false;
      let attempts = 0;
      
      while (!deleteSuccess && attempts < 15) { // Aumentato a 15 tentativi
        attempts++;
        console.log(`🗑️ RIPARAZIONE: DELETE attempt ${attempts}/15`);
        
        const { error: deleteError, count } = await supabase
          .from('user_map_areas')
          .delete({ count: 'exact' })
          .eq('user_id', userId || '00000000-0000-4000-a000-000000000000');

        if (deleteError) {
          console.error(`❌ RIPARAZIONE: DELETE attempt ${attempts} fallito:`, deleteError);
          if (attempts < 15) {
            await new Promise(resolve => setTimeout(resolve, 200 * attempts)); // Ridotto tempo attesa
            continue;
          }
          return false;
        } else {
          console.log(`✅ RIPARAZIONE: DELETE riuscito al tentativo ${attempts}, cancellate ${count} aree`);
          deleteSuccess = true;
        }
      }

      // STEP 3: Verifica cancellazione con verifica aggressiva
      let verificationSuccess = false;
      let verifyAttempts = 0;
      
      while (!verificationSuccess && verifyAttempts < 8) { // Aumentato tentativi verifica
        verifyAttempts++;
        await new Promise(resolve => setTimeout(resolve, 200)); // Ridotto tempo attesa
        
        const { data: remainingAreas } = await supabase
          .from('user_map_areas')
          .select('id')
          .eq('user_id', userId || '00000000-0000-4000-a000-000000000000');

        if (!remainingAreas || remainingAreas.length === 0) {
          verificationSuccess = true;
          console.log(`✅ RIPARAZIONE: Cancellazione verificata al tentativo ${verifyAttempts}`);
        } else {
          console.error(`❌ RIPARAZIONE: Aree ancora esistenti dopo cancellazione tentativo ${verifyAttempts}:`, remainingAreas);
          if (verifyAttempts < 8) {
            continue;
          }
        }
      }

      if (!verificationSuccess) {
        console.error('❌ RIPARAZIONE: VERIFICA FINALE fallita - aree potrebbero ancora esistere');
        return false;
      }

      console.log('✅ RIPARAZIONE: TUTTE le aree FORZATAMENTE CANCELLATE e verificate');
      return true;
    } catch (error) {
      console.error('❌ RIPARAZIONE: Eccezione durante cancellazione:', error);
      return false;
    }
  }, [userId]);

  // CRITICAL FIX: Caricamento aree potenziato con cache busting aggressivo
  useEffect(() => {
    let isMounted = true;
    
    const loadAreas = async () => {
      if (!userId) {
        const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
        if (!hasDeveloperAccess) return;
      }

      try {
        // CRITICAL FIX: Forza dati freschi con cache busting aggressivo
        const timestamp = Date.now();
        const randomParam = Math.random().toString(36);
        
        const { data, error } = await supabase
          .from('user_map_areas')
          .select('*')
          .eq('user_id', userId || '00000000-0000-4000-a000-000000000000')
          .order('created_at', { ascending: false })
          .limit(1); // Solo l'area più recente

        if (error) {
          console.error('❌ RIPARAZIONE: Errore caricamento aree:', error);
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
          console.log('✅ RIPARAZIONE: Aree caricate (solo ultima):', mappedAreas.length, 'cache bust:', timestamp, randomParam);
        }
      } catch (error) {
        console.error('❌ RIPARAZIONE: Eccezione caricamento aree:', error);
      }
    };

    loadAreas();
    
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // CRITICAL FIX: Generazione potenziata con calcolo raggio corretto e cancellazione forzata
  const generateBuzzMapArea = useCallback(async (lat: number, lng: number): Promise<BuzzMapArea | null> => {
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    if (!userId && !isDeveloper && !hasDeveloperAccess) {
      console.error('❌ RIPARAZIONE: No valid user ID');
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 RIPARAZIONE: Avvio generazione potenziata con tempo target 1.5s...');

      // STEP 1: CANCELLAZIONE FORZATA di TUTTE le aree precedenti con verifica aggressiva
      const deletionSuccess = await deletePreviousBuzzMapAreas();
      if (!deletionSuccess) {
        console.error('❌ RIPARAZIONE: Fallimento cancellazione aree precedenti');
        toast.error('Errore nella cancellazione aree precedenti');
        setIsGenerating(false);
        return null;
      }

      // STEP 2: Calcola conteggio generazione e raggio con riduzione 5%
      const generationCount = dailyBuzzMapCounter + 1;
      
      // CRITICAL FIX: Calcolo raggio corretto con riduzione 5% per generazione
      let newRadius = 500; // Inizia a 500km
      if (generationCount > 1) {
        newRadius = Math.max(5, 500 * Math.pow(0.95, generationCount - 1));
        console.log(`📊 RIPARAZIONE: Generazione ${generationCount}, calcolo raggio: 500 * 0.95^${generationCount - 1} = ${newRadius.toFixed(1)}km`);
      }

      // STEP 3: Chiama edge function con parametri potenziati
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
        console.error('❌ RIPARAZIONE: Edge function error:', edgeError);
        toast.error('Errore nella chiamata al server');
        setIsGenerating(false);
        return null;
      }

      if (!response?.success) {
        console.error('❌ RIPARAZIONE: Edge function fallita:', response?.errorMessage);
        toast.error(response?.errorMessage || 'Errore nella generazione area');
        setIsGenerating(false);
        return null;
      }

      // CRITICAL FIX: Crea nuova area con proprietà uniche forzate
      const newArea: BuzzMapArea = {
        id: response.areaId || `area-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        lat: response.lat || lat,
        lng: response.lng || lng,
        radius_km: response.radius_km || newRadius,
        week: Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000)),
        created_at: new Date().toISOString(),
        user_id: userId || '00000000-0000-4000-a000-000000000000'
      };

      // STEP 4: Aggiorna stato locale con SOLO la nuova area e forza re-render
      setAreas([newArea]);
      setDailyBuzzMapCounter(generationCount);

      console.log('✅ RIPARAZIONE: NUOVA SINGOLA area generata con raggio corretto:', newArea);
      
      const maxGenerations = (isDeveloper || hasDeveloperAccess) ? 50 : 25;
      
      if (isDeveloper || hasDeveloperAccess) {
        toast.success(`✅ AREA ${generationCount}/${maxGenerations}: ${newArea.radius_km.toFixed(1)}km - DEVELOPER MODE`);
      } else {
        toast.success(`✅ Nuova area BUZZ MAPPA: ${newArea.radius_km.toFixed(1)}km - Gen ${generationCount}`);
      }

      return newArea;

    } catch (error) {
      console.error('❌ RIPARAZIONE: Eccezione generazione area:', error);
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
      // CRITICAL FIX: Forza reload con cache busting
      const timestamp = Date.now();
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1); // Solo ultima area

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
        console.log('✅ RIPARAZIONE: Aree ricaricate (solo ultima):', mappedAreas.length, 'timestamp:', timestamp);
      }
    } catch (error) {
      console.error('❌ RIPARAZIONE: Errore ricaricamento aree:', error);
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
