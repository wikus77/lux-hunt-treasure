
import { useState, useCallback } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNewMapPage = () => {
  const { user } = useAuthContext();
  
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [mapPoints, setMapPoints] = useState<any[]>([]);
  const [newPoint, setNewPoint] = useState<any | null>(null);
  const [activeMapPoint, setActiveMapPoint] = useState<string | null>(null);
  
  const [searchAreas, setSearchAreas] = useState<any[]>([]);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [pendingRadius, setPendingRadius] = useState<number>(1000);

  const addNewPoint = useCallback((lat: number, lng: number) => {
    const point = {
      id: `temp-${Date.now()}`,
      latitude: lat,
      longitude: lng,
      title: '',
      note: '',
      isNew: true
    };
    setNewPoint(point);
    setIsAddingPoint(false);
  }, []);

  const savePoint = useCallback(async (title: string, note: string) => {
    if (!newPoint || !user) return;

    try {
      const { data, error } = await supabase
        .from('map_points')
        .insert([{
          user_id: user.id,
          latitude: newPoint.latitude,
          longitude: newPoint.longitude,
          title: title || 'Nuovo punto',
          note: note || ''
        }])
        .select()
        .single();

      if (error) throw error;

      setMapPoints(prev => [...prev, {
        id: data.id,
        latitude: data.latitude,
        longitude: data.longitude,
        title: data.title,
        note: data.note
      }]);
      
      setNewPoint(null);
      toast.success('Punto salvato!');
    } catch (error) {
      console.error('Error saving point:', error);
      toast.error('Errore nel salvare il punto');
    }
  }, [newPoint, user]);

  const updateMapPoint = useCallback(async (id: string, title: string, note: string) => {
    try {
      const { error } = await supabase
        .from('map_points')
        .update({ title, note })
        .eq('id', id);

      if (error) throw error;

      setMapPoints(prev => prev.map(point => 
        point.id === id ? { ...point, title, note } : point
      ));
      
      toast.success('Punto aggiornato!');
      return true;
    } catch (error) {
      console.error('Error updating point:', error);
      toast.error('Errore nell\'aggiornare il punto');
      return false;
    }
  }, []);

  const deleteMapPoint = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('map_points')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMapPoints(prev => prev.filter(point => point.id !== id));
      toast.success('Punto eliminato!');
      return true;
    } catch (error) {
      console.error('Error deleting point:', error);
      toast.error('Errore nell\'eliminare il punto');
      return false;
    }
  }, []);

  const handleAddArea = useCallback(() => {
    setIsAddingSearchArea(true);
  }, []);

  const handleMapClickArea = useCallback((e: any) => {
    if (!isAddingSearchArea || !user) return;

    const area = {
      id: `area-${Date.now()}`,
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      radius: pendingRadius,
      label: `Area ${searchAreas.length + 1}`
    };

    setSearchAreas(prev => [...prev, area]);
    setIsAddingSearchArea(false);
    toast.success('Area di ricerca aggiunta!');
  }, [isAddingSearchArea, user, pendingRadius, searchAreas.length]);

  const deleteSearchArea = useCallback(async (id: string) => {
    try {
      setSearchAreas(prev => prev.filter(area => area.id !== id));
      toast.success('Area eliminata!');
      return true;
    } catch (error) {
      console.error('Error deleting area:', error);
      toast.error('Errore nell\'eliminare l\'area');
      return false;
    }
  }, []);

  const toggleAddingSearchArea = useCallback(() => {
    setIsAddingSearchArea(prev => !prev);
  }, []);

  const handleBuzz = useCallback(() => {
    console.log('BUZZ pressed');
    toast.info('Funzione BUZZ non ancora implementata');
  }, []);

  const requestLocationPermission = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location:', position.coords);
          toast.success('Posizione ottenuta!');
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Errore nel ottenere la posizione');
        }
      );
    } else {
      toast.error('Geolocalizzazione non supportata');
    }
  }, []);

  return {
    isAddingPoint,
    setIsAddingPoint,
    mapPoints,
    newPoint,
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
    requestLocationPermission
  };
};
