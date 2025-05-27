import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface BuzzMapArea {
  id: string;
  lat: number;
  lng: number;
  radius_km: number;
  week: number;
  created_at: string;
  user_id?: string;
}

export const useBuzzMapLogic = () => {
  const { user } = useAuth();
  const [currentWeekAreas, setCurrentWeekAreas] = useState<BuzzMapArea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userCluesCount, setUserCluesCount] = useState(0);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0); // CRITICO: Force re-render
  const [dailyBuzzCounter, setDailyBuzzCounter] = useState(0); // NEW: For dynamic color calculation

  // Calcola la settimana corrente
  const getCurrentWeek = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  };

  // NEW: Carica il conteggio BUZZ giornaliero per il calcolo del colore
  const loadDailyBuzzCounter = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_buzz_counter')
        .select('buzz_count')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading daily buzz counter:', error);
        return;
      }

      const buzzCount = data?.buzz_count || 0;
      setDailyBuzzCounter(buzzCount);
      console.log('📊 DYNAMIC COLOR - Daily buzz counter loaded:', buzzCount);
    } catch (err) {
      console.error('Exception loading daily buzz counter:', err);
    }
  };

  // Carica il conteggio degli indizi utente per calcolare il prezzo
  const loadUserCluesCount = async () => {
    if (!user?.id) return;

    try {
      const { count, error } = await supabase
        .from('user_clues')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading user clues count:', error);
        return;
      }

      const cluesCount = count || 0;
      setUserCluesCount(cluesCount);
      console.log('📊 User clues count loaded:', cluesCount);
    } catch (err) {
      console.error('Exception loading user clues count:', err);
    }
  };

  // Calcola il prezzo BUZZ MAPPA basato sul numero di indizi - CORRETTO
  const calculateBuzzMapPrice = (): number => {
    console.log('💰 Calculating price for clues count:', userCluesCount);
    
    if (userCluesCount <= 10) {
      console.log('💰 Price tier: 1-10 clues = 7.99€');
      return 7.99;
    }
    if (userCluesCount <= 20) {
      console.log('💰 Price tier: 11-20 clues = 9.99€');
      return 9.99;
    }
    if (userCluesCount <= 30) {
      console.log('💰 Price tier: 21-30 clues = 13.99€');
      return 13.99;
    }
    if (userCluesCount <= 40) {
      console.log('💰 Price tier: 31-40 clues = 19.99€');
      return 19.99;
    }
    console.log('💰 Price tier: 41+ clues = 29.99€');
    return 29.99;
  };

  // ENHANCED: Carica le aree della settimana corrente con forzatura aggiornamento
  const loadCurrentWeekAreas = async (forceRefresh: boolean = false) => {
    if (!user?.id) {
      console.log('❌ No user ID for loading areas');
      return;
    }

    const currentWeek = getCurrentWeek();
    
    try {
      console.log('🔄 CRITICAL - Loading BUZZ areas for user:', user.id, 'week:', currentWeek, 'forceRefresh:', forceRefresh);
      
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', user.id)
        .eq('week', currentWeek)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error loading map areas:', error);
        return;
      }

      console.log('✅ CRITICAL - BUZZ areas loaded for week', currentWeek, ':', data);
      
      // VERIFICA CRITICA: dati dal DB
      if (data && data.length > 0) {
        const area = data[0];
        console.log('🔍 DB VERIFICATION - Area data:', {
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
          console.log('✅ CRITICAL: Area data is valid from DB - radius:', area.radius_km, 'km');
        }
      }
      
      // CRITICAL FIX: Forza sempre l'aggiornamento dello stato anche se i dati sembrano uguali
      console.log('📝 CRITICAL - FORCE updating currentWeekAreas state from:', currentWeekAreas, 'to:', data || []);
      setCurrentWeekAreas(data || []);
      
      // FORZA un counter aggiuntivo per triggerare re-render
      setForceUpdateCounter(prev => prev + 1);
      console.log('🔥 FORCED update counter incremented to:', forceUpdateCounter + 1);
      
      // Verifica immediata dello stato
      setTimeout(() => {
        console.log('🔍 CRITICAL - State verification - currentWeekAreas should now be:', data || []);
      }, 100);
      
    } catch (err) {
      console.error('❌ Exception loading map areas:', err);
    }
  };

  // Ottieni l'area attiva più recente per la settimana corrente
  const getActiveArea = (): BuzzMapArea | null => {
    if (currentWeekAreas.length === 0) return null;
    return currentWeekAreas[0];
  };

  // Calcola il raggio per la prossima area (decremento -5% dal precedente) - CORRETTO
  const calculateNextRadius = (): number => {
    const BASE_RADIUS = 100; // 100 km iniziale
    const MIN_RADIUS = 5; // 5 km minimo
    const REDUCTION_FACTOR = 0.95; // -5% ogni volta

    const activeArea = getActiveArea();
    
    if (!activeArea) {
      console.log('📏 No active area, using base radius:', BASE_RADIUS, 'km');
      return BASE_RADIUS;
    }

    // Calcola il nuovo raggio: precedente * 0.95
    const nextRadius = activeArea.radius_km * REDUCTION_FACTOR;
    const finalRadius = Math.max(MIN_RADIUS, nextRadius);
    
    console.log('📏 Previous radius:', activeArea.radius_km, 'km');
    console.log('📏 Calculated next radius:', nextRadius, 'km');
    console.log('📏 Final radius (with minimum):', finalRadius, 'km');
    
    return finalRadius;
  };

  // Rimuovi l'area precedente della settimana corrente
  const removePreviousArea = async (): Promise<boolean> => {
    if (!user?.id) return false;

    const currentWeek = getCurrentWeek();
    
    try {
      console.log('🗑️ ELIMINAZIONE area precedente per user:', user.id, 'settimana:', currentWeek);
      
      const { error } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', user.id)
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
  };

  // ENHANCED: Genera una nuova area BUZZ MAPPA con forzatura immediata del refresh
  const generateBuzzMapArea = async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    if (!user?.id) {
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    // Verifica coordinate valide
    if (!centerLat || !centerLng || isNaN(centerLat) || isNaN(centerLng)) {
      toast.error('Coordinate della mappa non valide');
      return null;
    }

    setIsGenerating(true);
    
    try {
      const currentWeek = getCurrentWeek();
      const radiusKm = calculateNextRadius();
      const price = calculateBuzzMapPrice();

      console.log('🗺️ CRITICAL - Generando area BUZZ MAPPA:', {
        lat: centerLat,
        lng: centerLng,
        radius_km: radiusKm,
        week: currentWeek,
        price: price,
        currentBuzzCounter: dailyBuzzCounter
      });

      // STEP 1: ELIMINA l'area precedente della settimana corrente
      console.log('🗑️ CRITICAL - Removing previous area...');
      const removed = await removePreviousArea();
      if (!removed) {
        toast.error('Errore nel rimuovere l\'area precedente');
        return null;
      }

      // STEP 2: Pulisci lo stato locale PRIMA di creare la nuova area
      console.log('🧹 CRITICAL - Clearing local state...');
      setCurrentWeekAreas([]);
      
      // STEP 3: Crea la nuova area con il raggio calcolato
      const newArea = {
        user_id: user.id,
        lat: centerLat,
        lng: centerLng,
        radius_km: radiusKm,
        week: currentWeek
      };

      console.log('💾 CRITICAL - Inserting new area into database:', newArea);
      const { data, error } = await supabase
        .from('user_map_areas')
        .insert(newArea)
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving map area:', error);
        toast.error('Errore nel salvare l\'area sulla mappa');
        return null;
      }

      console.log('✅ CRITICAL - NUOVA area BUZZ MAPPA salvata in DB:', data);
      
      // STEP 4: AGGIORNA il counter BUZZ giornaliero per il calcolo del colore
      const newBuzzCounter = dailyBuzzCounter + 1;
      setDailyBuzzCounter(newBuzzCounter);
      console.log('🎨 DYNAMIC COLOR - Updated buzz counter for color calculation:', newBuzzCounter);
      
      // STEP 5: FORZA l'aggiornamento dello stato locale IMMEDIATAMENTE
      console.log('🔄 CRITICAL - FORCE updating local state immediately with new area:', data);
      setCurrentWeekAreas([data]);
      
      // FORZA il counter per triggerare re-render di tutti i componenti che dipendono dalle aree
      setForceUpdateCounter(prev => prev + 1);
      console.log('🔥 CRITICAL - FORCED update counter incremented for immediate re-render');
      
      // STEP 6: Aspetta un momento e poi forza un reload completo per sicurezza
      setTimeout(async () => {
        console.log('🔄 CRITICAL - Double-check reload after area creation...');
        await loadCurrentWeekAreas(true); // Force refresh
        await loadDailyBuzzCounter(); // Refresh buzz counter
      }, 200);
      
      // STEP 7: Verifica multipla che lo stato sia stato aggiornato
      setTimeout(() => {
        console.log('🔍 CRITICAL - Verification - currentWeekAreas after update should contain:', data);
        console.log('🔍 CRITICAL - Quick state check...');
        debugCurrentState();
      }, 300);
      
      // STEP 8: Messaggio con il valore REALE salvato
      const colorNames = ['GIALLO NEON', 'ROSA NEON', 'VERDE NEON', 'FUCSIA NEON'];
      const currentColorName = colorNames[newBuzzCounter % 4];
      toast.success(`Area BUZZ MAPPA generata! Raggio: ${data.radius_km.toFixed(1)} km - Colore: ${currentColorName} - Prezzo: ${price.toFixed(2)}€`);
      
      return data;
    } catch (err) {
      console.error('❌ Exception generating map area:', err);
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Test della logica di calcolo - AGGIUNTO PER DEBUG
  const testCalculationLogic = () => {
    console.log('🧪 TESTING BUZZ MAPPA LOGIC:');
    console.log('Current user clues:', userCluesCount);
    console.log('Calculated price:', calculateBuzzMapPrice());
    console.log('Active area:', getActiveArea());
    console.log('Next radius:', calculateNextRadius());
    console.log('Daily buzz counter:', dailyBuzzCounter);
    
    // Test pricing logic
    const testCases = [5, 15, 25, 35, 45];
    testCases.forEach(clues => {
      const oldCount = userCluesCount;
      setUserCluesCount(clues);
      console.log(`With ${clues} clues: ${calculateBuzzMapPrice()}€`);
      setUserCluesCount(oldCount);
    });
  };

  // Carica i dati iniziali - MIGLIORATO
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 CRITICAL - Loading initial BUZZ MAPPA data for user:', user.id);
      loadUserCluesCount();
      loadCurrentWeekAreas();
      loadDailyBuzzCounter(); // NEW: Load buzz counter for color calculation
    }
  }, [user]);

  // DEBUG: Log quando cambiano i valori chiave - MIGLIORATO
  useEffect(() => {
    console.log('📊 User clues count updated:', userCluesCount);
    console.log('💰 Current price:', calculateBuzzMapPrice());
  }, [userCluesCount]);

  // ENHANCED DEBUG: Log quando cambiano le aree correnti - CRITICO
  useEffect(() => {
    console.log('🗺️ CRITICAL - Current week areas state updated:', {
      areas: currentWeekAreas,
      count: currentWeekAreas.length,
      forceUpdateCounter: forceUpdateCounter,
      dailyBuzzCounter: dailyBuzzCounter,
      timestamp: new Date().toISOString()
    });
    
    if (currentWeekAreas.length > 0) {
      console.log('🎯 CRITICAL - AREA READY FOR RENDERING:', {
        ...currentWeekAreas[0],
        forceUpdateCounter: forceUpdateCounter,
        buzzCounterForColor: dailyBuzzCounter
      });
    }
  }, [currentWeekAreas, forceUpdateCounter, dailyBuzzCounter]);

  // DEBUG: Funzione per verificare lo stato corrente - MIGLIORATA
  const debugCurrentState = () => {
    console.log('🔍 DEBUG STATE REPORT:', {
      user: user?.id,
      currentWeekAreas,
      areasCount: currentWeekAreas.length,
      userCluesCount,
      isGenerating,
      activeArea: getActiveArea(),
      nextRadius: calculateNextRadius(),
      price: calculateBuzzMapPrice(),
      forceUpdateCounter: forceUpdateCounter,
      dailyBuzzCounter: dailyBuzzCounter,
      stateTimestamp: new Date().toISOString()
    });
    
    // Verifica dettagliata delle aree
    if (currentWeekAreas.length > 0) {
      currentWeekAreas.forEach((area, index) => {
        console.log(`🔍 Area ${index}:`, {
          id: area.id,
          coordinates: `${area.lat}, ${area.lng}`,
          radius: area.radius_km,
          valid: !!(area.lat && area.lng && area.radius_km),
          forceUpdateCounter: forceUpdateCounter,
          buzzCounterForColor: dailyBuzzCounter
        });
      });
    }
  };

  return {
    currentWeekAreas,
    isGenerating,
    userCluesCount,
    dailyBuzzCounter, // NEW: Expose buzz counter for color calculation
    calculateNextRadius,
    calculateBuzzMapPrice,
    generateBuzzMapArea,
    getActiveArea,
    reloadAreas: () => loadCurrentWeekAreas(true), // CRITICAL: Force refresh
    testCalculationLogic,
    debugCurrentState,
    forceUpdateCounter // Expose for components that need to force re-render
  };
};
