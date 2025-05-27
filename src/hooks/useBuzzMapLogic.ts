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

  // Calcola la settimana corrente
  const getCurrentWeek = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
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

  // Carica le aree della settimana corrente - MIGLIORATA CON LOGGING E VERIFICA DB
  const loadCurrentWeekAreas = async () => {
    if (!user?.id) {
      console.log('❌ No user ID for loading areas');
      return;
    }

    const currentWeek = getCurrentWeek();
    
    try {
      console.log('🔄 Loading BUZZ areas for user:', user.id, 'week:', currentWeek);
      
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

      console.log('✅ BUZZ areas loaded for week', currentWeek, ':', data);
      
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
          console.log('✅ VERIFIED: Area data is valid from DB');
        }
      }
      
      // DEBUG: Log prima e dopo l'aggiornamento dello stato
      console.log('📝 Setting currentWeekAreas state from:', currentWeekAreas, 'to:', data || []);
      setCurrentWeekAreas(data || []);
      
      // Verifica immediata dello stato
      setTimeout(() => {
        console.log('🔍 State verification - currentWeekAreas should now be:', data || []);
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

  // Genera una nuova area BUZZ MAPPA - MIGLIORATA CON VERIFICA E LOGGING COMPLETO
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

      console.log('🗺️ Generando area BUZZ MAPPA:', {
        lat: centerLat,
        lng: centerLng,
        radius_km: radiusKm,
        week: currentWeek,
        price: price
      });

      // STEP 1: ELIMINA l'area precedente della settimana corrente
      console.log('🗑️ Removing previous area...');
      const removed = await removePreviousArea();
      if (!removed) {
        toast.error('Errore nel rimuovere l\'area precedente');
        return null;
      }

      // STEP 2: Pulisci lo stato locale PRIMA di creare la nuova area
      console.log('🧹 Clearing local state...');
      setCurrentWeekAreas([]);

      // STEP 3: Crea la nuova area con il raggio calcolato
      const newArea = {
        user_id: user.id,
        lat: centerLat,
        lng: centerLng,
        radius_km: radiusKm,
        week: currentWeek
      };

      console.log('💾 Inserting new area into database:', newArea);
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

      console.log('✅ NUOVA area BUZZ MAPPA salvata in DB:', data);
      
      // VERIFICA CRITICA: dati salvati
      console.log('🔍 DB SAVE VERIFICATION:', {
        id: data.id,
        lat: data.lat,
        lng: data.lng,
        radius_km: data.radius_km,
        week: data.week,
        created_at: data.created_at,
        saveSuccessful: true
      });
      
      // STEP 4: Aggiorna lo stato locale IMMEDIATAMENTE con verifica
      console.log('🔄 Updating local state immediately with new area:', data);
      setCurrentWeekAreas([data]);
      
      // STEP 5: Verifica multipla che lo stato sia stato aggiornato
      setTimeout(() => {
        console.log('🔍 Verification - currentWeekAreas after update should contain:', data);
        console.log('🔍 Quick state check...');
        debugCurrentState();
      }, 50);
      
      // STEP 6: Messaggio con il valore REALE salvato
      toast.success(`Area BUZZ MAPPA generata! Raggio: ${data.radius_km.toFixed(1)} km - Prezzo: ${price.toFixed(2)}€`);
      
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
      console.log('🔄 Loading initial BUZZ MAPPA data for user:', user.id);
      loadUserCluesCount();
      loadCurrentWeekAreas();
    }
  }, [user]);

  // DEBUG: Log quando cambiano i valori chiave - MIGLIORATO
  useEffect(() => {
    console.log('📊 User clues count updated:', userCluesCount);
    console.log('💰 Current price:', calculateBuzzMapPrice());
  }, [userCluesCount]);

  // DEBUG: Log quando cambiano le aree correnti - CRITICO
  useEffect(() => {
    console.log('🗺️ Current week areas state updated:', currentWeekAreas);
    if (currentWeekAreas.length > 0) {
      console.log('🎯 AREA READY FOR RENDERING:', currentWeekAreas[0]);
    }
  }, [currentWeekAreas]);

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
      stateTimestamp: new Date().toISOString()
    });
    
    // Verifica dettagliata delle aree
    if (currentWeekAreas.length > 0) {
      currentWeekAreas.forEach((area, index) => {
        console.log(`🔍 Area ${index}:`, {
          id: area.id,
          coordinates: `${area.lat}, ${area.lng}`,
          radius: area.radius_km,
          valid: !!(area.lat && area.lng && area.radius_km)
        });
      });
    }
  };

  return {
    currentWeekAreas,
    isGenerating,
    userCluesCount,
    calculateNextRadius,
    calculateBuzzMapPrice,
    generateBuzzMapArea,
    getActiveArea,
    reloadAreas: loadCurrentWeekAreas,
    testCalculationLogic,
    debugCurrentState // Per debug completo
  };
};
