
// ✅ Fix by Joseph Mulé — M1SSION™
// ✅ Compatibile Capacitor iOS
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const useNewMapPage = () => {
  const { isAuthenticated, user } = useAuthContext();
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [mapPoints, setMapPoints] = useState([]);
  const [newPoint, setNewPoint] = useState(null);
  const [activeMapPoint, setActiveMapPoint] = useState(null);
  const [searchAreas, setSearchAreas] = useState([]);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const [activeSearchArea, setActiveSearchArea] = useState(null);
  const [pendingRadius, setPendingRadius] = useState(null);

  // Add new point
  const addNewPoint = useCallback((lat: number, lng: number) => {
    if (isAddingPoint) {
      const point = {
        id: 'new',
        lat,
        lng,
        latitude: lat,
        longitude: lng,
        title: '',
        note: ''
      };
      setNewPoint(point);
      setIsAddingPoint(false);
      toast.success("Punto posizionato. Inserisci titolo e nota.");
    }
  }, [isAddingPoint]);

  // Save point
  const savePoint = useCallback(async (title: string, note: string) => {
    if (!newPoint || !isAuthenticated || !user?.id) return;

    if (!title.trim()) {
      toast.error("Il titolo è obbligatorio");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('map_points')
        .insert({
          user_id: user.id,
          latitude: newPoint.lat,
          longitude: newPoint.lng,
          title: title.trim(),
          note: note.trim() || null
        })
        .select()
        .single();

      if (error) throw error;

      setMapPoints(prev => [...prev, {
        ...data,
        lat: data.latitude,
        lng: data.longitude
      }]);
      setNewPoint(null);
      toast.success("Punto salvato");
    } catch (error) {
      console.error('Error saving point:', error);
      toast.error("Errore nel salvare il punto");
    }
  }, [newPoint, isAuthenticated, user]);

  // Update map point
  const updateMapPoint = useCallback(async (id: string, title: string, note: string): Promise<boolean> => {
    if (!isAuthenticated || !user?.id) return false;

    if (!title.trim()) {
      toast.error("Il titolo è obbligatorio");
      return false;
    }

    try {
      const { error } = await supabase
        .from('map_points')
        .update({
          title: title.trim(),
          note: note.trim() || null
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMapPoints(prev =>
        prev.map(point =>
          point.id === id ? { ...point, title: title.trim(), note: note.trim() } : point
        )
      );
      setActiveMapPoint(null);
      toast.success("Punto aggiornato");
      return true;
    } catch (error) {
      console.error('Error updating point:', error);
      toast.error("Errore nell'aggiornare il punto");
      return false;
    }
  }, [isAuthenticated, user]);

  // Delete map point
  const deleteMapPoint = useCallback(async (id: string): Promise<boolean> => {
    if (!isAuthenticated || !user?.id) return false;

    try {
      const { error } = await supabase
        .from('map_points')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMapPoints(prev => prev.filter(point => point.id !== id));
      if (activeMapPoint === id) setActiveMapPoint(null);
      toast.success("Punto eliminato");
      return true;
    } catch (error) {
      console.error('Error deleting point:', error);
      toast.error("Errore nell'eliminare il punto");
      return false;
    }
  }, [isAuthenticated, user, activeMapPoint]);

  // Handle add area
  const handleAddArea = useCallback((area) => {
    setSearchAreas(prev => [...prev, area]);
  }, []);

  // Handle map click for area
  const handleMapClickArea = useCallback((e) => {
    if (isAddingSearchArea) {
      const { lat, lng } = e.latlng;
      if (pendingRadius !== null) {
        const newArea = {
          id: String(Date.now()),
          lat,
          lng,
          radius: pendingRadius,
          label: `Area ${searchAreas.length + 1}`
        };
        handleAddArea(newArea);
        setPendingRadius(null);
        setIsAddingSearchArea(false);
        toast.success('Area di ricerca aggiunta!');
      } else {
        toast.error('Definisci prima il raggio di ricerca.');
      }
    }
  }, [isAddingSearchArea, pendingRadius, searchAreas.length, handleAddArea]);

  // Delete search area
  const deleteSearchArea = useCallback(async (id: string): Promise<boolean> => {
    setSearchAreas(prev => prev.filter(area => area.id !== id));
    toast.success('Area eliminata');
    return true;
  }, []);

  // Toggle adding search area
  const toggleAddingSearchArea = useCallback(() => {
    setIsAddingSearchArea(prev => !prev);
  }, []);

  // Handle BUZZ
  const handleBuzz = useCallback(() => {
    toast.info("Funzione BUZZ in arrivo presto!");
  }, []);

  // Request location permission
  const requestLocationPermission = useCallback(() => {
    if (navigator.geolocation) {
      toast.info("Rilevamento posizione in corso...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          toast.success("Posizione rilevata");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Errore nel rilevare la posizione");
        }
      );
    } else {
      toast.error("Geolocalizzazione non supportata dal browser");
    }
  }, []);

  return {
    isAddingPoint,
    setIsAddingPoint,
    mapPoints,
    newPoint,
    setNewPoint,
    activeMapPoint,
    setActiveMapPoint,
    searchAreas,
    isAddingSearchArea,
    activeSearchArea,
    setActiveSearchArea,
    handleAddArea,
    handleMapClickArea,
    deleteSearchArea,
    toggleAddingSearchArea,
    setPendingRadius,
    addNewPoint,
    savePoint,
    updateMapPoint,
    deleteMapPoint,
    handleBuzz,
    requestLocationPermission,
  };
};
