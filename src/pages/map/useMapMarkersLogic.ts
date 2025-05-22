
import { useState, useCallback } from 'react';
import { MapMarker } from '@/components/maps/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useMapMarkersLogic = () => {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Load markers from Supabase on component mount
  const loadMarkers = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('map_points')
        .select('*');
        
      if (error) {
        console.error('Error loading map markers:', error);
        return;
      }
      
      if (data) {
        const loadedMarkers: MapMarker[] = data.map(point => ({
          id: point.id,
          lat: point.latitude,
          lng: point.longitude,
          note: point.note || '',
          position: { lat: point.latitude, lng: point.longitude }
        }));
        setMarkers(loadedMarkers);
      }
    } catch (error) {
      console.error('Error loading markers:', error);
    }
  }, [user]);
  
  // Handle adding a new marker
  const handleAddMarker = useCallback(() => {
    setIsAddingMarker(true);
    toast.info("Clicca sulla mappa per posizionare un punto di interesse");
  }, []);
  
  // Handle map click for adding a marker
  const handleMapClickMarker = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!isAddingMarker || !user || !e.latLng) return;
    
    try {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      const newMarker: MapMarker = {
        id: uuidv4(),
        lat,
        lng,
        note: '',
        position: { lat, lng }
      };
      
      setMarkers(prev => [...prev, newMarker]);
      setActiveMarker(newMarker.id);
      setIsAddingMarker(false);
      
      // Store in Supabase
      const { error } = await supabase
        .from('map_points')
        .insert({
          user_id: user.id,
          latitude: lat,
          longitude: lng,
          title: 'Nuovo punto',
          note: ''
        });
        
      if (error) {
        console.error('Error saving marker:', error);
        toast.error('Errore nel salvare il punto');
      }
    } catch (error) {
      console.error('Error adding marker:', error);
      setIsAddingMarker(false);
    }
  }, [isAddingMarker, user]);
  
  // Save marker note
  const saveMarkerNote = useCallback(async (id: string, note: string) => {
    setMarkers(markers.map(marker =>
      marker.id === id ? { ...marker, note } : marker
    ));
    
    // Update in Supabase
    try {
      const marker = markers.find(m => m.id === id);
      if (!marker || !user) return;
      
      const { error } = await supabase
        .from('map_points')
        .update({ note, title: note.substring(0, 50) })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating marker note:', error);
        toast.error('Errore nell\'aggiornare la nota');
      } else {
        toast.success('Punto di interesse aggiornato');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }, [markers, user]);
  
  // Delete marker
  const deleteMarker = useCallback(async (id: string) => {
    try {
      // Remove from Supabase
      const { error } = await supabase
        .from('map_points')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting marker:', error);
        toast.error('Errore nell\'eliminare il punto');
        return;
      }
      
      // Remove from state
      setMarkers(markers.filter(marker => marker.id !== id));
      if (activeMarker === id) setActiveMarker(null);
      
      toast.success('Punto di interesse eliminato');
    } catch (error) {
      console.error('Error deleting marker:', error);
    }
  }, [markers, activeMarker]);
  
  // Edit marker
  const editMarker = useCallback((id: string) => {
    setActiveMarker(id);
  }, []);

  return {
    markers,
    loadMarkers,
    isAddingMarker,
    setIsAddingMarker,
    handleAddMarker,
    handleMapClickMarker,
    activeMarker,
    setActiveMarker,
    saveMarkerNote,
    deleteMarker,
    editMarker
  };
};
