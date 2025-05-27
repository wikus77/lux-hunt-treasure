
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

  // Calcola la settimana corrente (esempio: settimana dell'anno)
  const getCurrentWeek = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  };

  // Carica le aree della settimana corrente
  const loadCurrentWeekAreas = async () => {
    if (!user?.id) return;

    const currentWeek = getCurrentWeek();
    
    try {
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', user.id)
        .eq('week', currentWeek)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading map areas:', error);
        return;
      }

      setCurrentWeekAreas(data || []);
    } catch (err) {
      console.error('Exception loading map areas:', err);
    }
  };

  // Ottieni l'area attiva più recente per la settimana corrente
  const getActiveArea = (): BuzzMapArea | null => {
    if (currentWeekAreas.length === 0) return null;
    return currentWeekAreas[currentWeekAreas.length - 1];
  };

  // Calcola il raggio per la prossima area (decremento -5% dal precedente)
  const calculateNextRadius = (): number => {
    const BASE_RADIUS = 100; // 100 km iniziale
    const MIN_RADIUS = 5; // 5 km minimo
    const REDUCTION_FACTOR = 0.95; // -5% ogni volta

    const activeArea = getActiveArea();
    
    if (!activeArea) {
      return BASE_RADIUS;
    }

    // Calcola il nuovo raggio: precedente * 0.95
    const nextRadius = activeArea.radius_km * REDUCTION_FACTOR;
    
    return Math.max(MIN_RADIUS, nextRadius);
  };

  // Rimuovi l'area precedente della settimana corrente
  const removeCurrentWeekArea = async (): Promise<boolean> => {
    if (!user?.id) return false;

    const currentWeek = getCurrentWeek();
    
    try {
      const { error } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', user.id)
        .eq('week', currentWeek);

      if (error) {
        console.error('Error removing previous area:', error);
        return false;
      }

      console.log('✅ Area precedente rimossa per settimana:', currentWeek);
      return true;
    } catch (err) {
      console.error('Exception removing previous area:', err);
      return false;
    }
  };

  // Genera una nuova area BUZZ MAPPA
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

      console.log('🗺️ Generando area BUZZ MAPPA:', {
        lat: centerLat,
        lng: centerLng,
        radius: radiusKm,
        week: currentWeek,
        removingPrevious: currentWeekAreas.length > 0
      });

      // 🚨 STEP 1: Rimuovi l'area precedente della settimana corrente
      if (currentWeekAreas.length > 0) {
        const removed = await removeCurrentWeekArea();
        if (!removed) {
          toast.error('Errore nel rimuovere l\'area precedente');
          return null;
        }
      }

      // 🚨 STEP 2: Crea la nuova area con il raggio calcolato
      const newArea = {
        user_id: user.id,
        lat: centerLat,
        lng: centerLng,
        radius_km: radiusKm,
        week: currentWeek
      };

      const { data, error } = await supabase
        .from('user_map_areas')
        .insert(newArea)
        .select()
        .single();

      if (error) {
        console.error('Error saving map area:', error);
        toast.error('Errore nel salvare l\'area sulla mappa');
        return null;
      }

      console.log('✅ Area BUZZ MAPPA salvata:', data);
      console.log('📏 Raggio effettivo salvato:', data.radius_km, 'km');
      
      // 🚨 STEP 3: Aggiorna lo stato locale con la SOLA nuova area
      setCurrentWeekAreas([data]);
      
      // 🚨 STEP 4: Messaggio allineato al valore reale salvato
      toast.success(`Area di ricerca generata! Raggio: ${data.radius_km.toFixed(1)} km`);
      
      return data;
    } catch (err) {
      console.error('Exception generating map area:', err);
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    loadCurrentWeekAreas();
  }, [user]);

  return {
    currentWeekAreas,
    isGenerating,
    calculateNextRadius,
    generateBuzzMapArea,
    getActiveArea,
    reloadAreas: loadCurrentWeekAreas
  };
};
