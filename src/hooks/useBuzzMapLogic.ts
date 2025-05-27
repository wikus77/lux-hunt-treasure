
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface BuzzMapArea {
  id: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  week_id: string;
  created_at: string;
}

export const useBuzzMapLogic = () => {
  const { user } = useAuth();
  const [currentWeekAreas, setCurrentWeekAreas] = useState<BuzzMapArea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calcola la settimana corrente (esempio: settimana dell'anno)
  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return `${now.getFullYear()}-W${Math.ceil(diff / oneWeek)}`;
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
        .eq('week_id', currentWeek)
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

  // Calcola il raggio per la prossima area (logica decrescente -5%)
  const calculateNextRadius = (): number => {
    const BASE_RADIUS = 100; // 100 km iniziale
    const MIN_RADIUS = 5; // 5 km minimo
    const REDUCTION_FACTOR = 0.95; // -5% ogni volta

    if (currentWeekAreas.length === 0) {
      return BASE_RADIUS;
    }

    // Calcola il raggio basato sul numero di aree già create
    const nextRadius = BASE_RADIUS * Math.pow(REDUCTION_FACTOR, currentWeekAreas.length);
    
    return Math.max(MIN_RADIUS, nextRadius);
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
        areaCount: currentWeekAreas.length
      });

      const newArea = {
        user_id: user.id,
        latitude: centerLat,
        longitude: centerLng,
        radius_km: radiusKm,
        week_id: currentWeek
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
      
      // Aggiorna lo stato locale
      setCurrentWeekAreas(prev => [...prev, data]);
      
      toast.success(`Area di ricerca generata! Raggio: ${radiusKm.toFixed(1)} km`);
      
      return data;
    } catch (err) {
      console.error('Exception generating map area:', err);
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Ottieni l'area attiva più recente
  const getActiveArea = (): BuzzMapArea | null => {
    if (currentWeekAreas.length === 0) return null;
    return currentWeekAreas[currentWeekAreas.length - 1];
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
