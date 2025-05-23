import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';
import BottomNavigation from '@/components/layout/BottomNavigation';
import './map/components/ItalyRegionsStyles.css';
import MapPointsSection from './map/MapPointsSection';
import NotesSection from './map/NotesSection';
import MapContainer from './map/components/MapContainer';
import SearchAreasSection from './map/SearchAreasSection';
import { MapMarker, SearchArea } from '@/components/maps/types';
import { useSearchAreasLogic } from './map/useSearchAreasLogic';
import L from 'leaflet';

// Fix for Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Default location (Rome, Italy)
const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

// Interface for map points from database
interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  note: string;
  created_at?: string;
}

// Create a default Leaflet icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Set as default marker icon
L.Marker.prototype.options.icon = DefaultIcon;

const NewMapPage = () => {
  const { user } = useAuth();
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [newPoint, setNewPoint] = useState<MapMarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMapPoint, setActiveMapPoint] = useState<string | null>(null);
  // Remove the static buzzMapPrice definition since we're now getting it from the hook
  // const buzzMapPrice = 1.99; <- Remove this line

  // Initialize search areas logic
  const { 
    searchAreas,
    isAddingSearchArea,
    activeSearchArea,
    setActiveSearchArea,
    handleAddArea,
    handleMapClickArea,
    deleteSearchArea,
    clearAllSearchAreas,
    toggleAddingSearchArea,
    setPendingRadius
  } = useSearchAreasLogic(DEFAULT_LOCATION);

  // Fetch existing map points on mount
  useEffect(() => {
    const fetchMapPoints = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('map_points')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error fetching map points:", error);
          toast.error("Errore nel caricamento dei punti");
          return;
        }

        console.log("📍 Fetched map points:", data);
        setMapPoints(data || []);
      } catch (err) {
        console.error("Exception fetching map points:", err);
        toast.error("Errore nel caricamento dei punti");
      } finally {
        setIsLoading(false);
      }
    };

    // Also fetch search areas here if needed
    fetchMapPoints();
  }, [user]);

  // Add a new point to the map
  const addNewPoint = useCallback((lat: number, lng: number) => {
    console.log("📍 Adding new point at:", lat, lng);
    setNewPoint({
      id: 'new',
      lat,
      lng,
      title: '',
      note: '',
      position: { lat, lng } // Adding position property to match MapMarker type
    });
    
    // Reset search area adding mode if active
    if (isAddingSearchArea) {
      toggleAddingSearchArea();
    }
  }, [isAddingSearchArea, toggleAddingSearchArea]);

  // Save the point to Supabase
  const savePoint = async (title: string, note: string) => {
    if (!newPoint || !user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('map_points')
        .insert([{
          user_id: user.id,
          latitude: newPoint.lat,
          longitude: newPoint.lng,
          title,
          note
        }])
        .select();

      if (error) {
        console.error("Error saving map point:", error);
        toast.error("Errore nel salvare il punto");
        return;
      }

      console.log("📍 Saved new point:", data);
      toast.success("Punto salvato con successo");
      
      // Add the new point to the current list
      if (data && data.length > 0) {
        setMapPoints(prev => [...prev, data[0]]);
      }
      
      // Reset new point state
      setNewPoint(null);
    } catch (err) {
      console.error("Exception saving map point:", err);
      toast.error("Errore nel salvare il punto");
    }
  };

  // Update an existing point
  const updateMapPoint = async (id: string, title: string, note: string): Promise<void> => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('map_points')
        .update({
          title,
          note
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error updating map point:", error);
        toast.error("Errore nell'aggiornare il punto");
        return;
      }

      // Update local state
      setMapPoints(prev => prev.map(point => 
        point.id === id ? { ...point, title, note } : point
      ));
      
      toast.success("Punto aggiornato con successo");
      setActiveMapPoint(null);
    } catch (err) {
      console.error("Exception updating map point:", err);
      toast.error("Errore nell'aggiornare il punto");
    }
  };

  // Delete a map point
  const deleteMapPoint = async (id: string) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('map_points')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error deleting map point:", error);
        toast.error("Errore nell'eliminare il punto");
        return false;
      }

      // Update local state
      setMapPoints(prev => prev.filter(point => point.id !== id));
      setActiveMapPoint(null);
      toast.success("Punto eliminato con successo");
      return true;
    } catch (err) {
      console.error("Exception deleting map point:", err);
      toast.error("Errore nell'eliminare il punto");
      return false;
    }
  };

  // Handle BUZZ button click
  const handleBuzz = () => {
    toast.info("Funzione BUZZ in arrivo presto!");
  };

  // Request user location
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      toast.info("Rilevamento posizione in corso...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Here you would update the map center
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
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <UnifiedHeader
        leftComponent={<M1ssionText />}
      />
      
      {/* Main content with proper spacing */}
      <div className="container mx-auto px-4 pt-20 pb-2 max-w-6xl">
        <div className="m1ssion-glass-card p-4 sm:p-6 mb-6">
          {/* Map container - remove buzzMapPrice prop */}
          <MapContainer
            isAddingPoint={isAddingPoint}
            setIsAddingPoint={setIsAddingPoint}
            addNewPoint={addNewPoint}
            mapPoints={mapPoints.map(p => ({
              id: p.id,
              lat: p.latitude,
              lng: p.longitude,
              title: p.title,
              note: p.note,
              position: { lat: p.latitude, lng: p.longitude }
            }))}
            activeMapPoint={activeMapPoint}
            setActiveMapPoint={setActiveMapPoint}
            handleUpdatePoint={updateMapPoint}
            deleteMapPoint={deleteMapPoint}
            newPoint={newPoint}
            handleSaveNewPoint={savePoint}
            handleCancelNewPoint={() => setNewPoint(null)}
            handleBuzz={handleBuzz}
            requestLocationPermission={requestLocationPermission}
            // Search area props
            isAddingSearchArea={isAddingSearchArea}
            handleMapClickArea={handleMapClickArea}
            searchAreas={searchAreas}
            setActiveSearchArea={setActiveSearchArea}
            deleteSearchArea={deleteSearchArea}
            setPendingRadius={setPendingRadius}
            toggleAddingSearchArea={toggleAddingSearchArea}
          />
        </div>
        
        {/* Split into two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {/* Left column: Notes section */}
          <div className="m1ssion-glass-card p-4 sm:p-6 rounded-[24px]">
            <NotesSection />
          </div>
          
          {/* Right column: Map points and search areas */}
          <div className="space-y-6">
            {/* Map points list section */}
            <div className="m1ssion-glass-card p-4 sm:p-6 rounded-[24px]">
              <MapPointsSection 
                mapPoints={mapPoints.map(p => ({
                  id: p.id,
                  lat: p.latitude,
                  lng: p.longitude,
                  title: p.title,
                  note: p.note,
                  position: { lat: p.latitude, lng: p.longitude }
                }))}
                isAddingMapPoint={isAddingPoint}
                toggleAddingMapPoint={() => setIsAddingPoint(prev => !prev)}
                setActiveMapPoint={setActiveMapPoint}
                deleteMapPoint={deleteMapPoint}
              />
            </div>
            
            {/* Search areas section */}
            <div className="m1ssion-glass-card p-4 sm:p-6 rounded-[24px]">
              <SearchAreasSection
                searchAreas={searchAreas}
                setActiveSearchArea={setActiveSearchArea}
                clearAllSearchAreas={clearAllSearchAreas}
                handleAddArea={handleAddArea}
                isAddingSearchArea={isAddingSearchArea}
              />
            </div>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default NewMapPage;
