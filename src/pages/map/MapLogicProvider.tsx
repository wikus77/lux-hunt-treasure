
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DEFAULT_LOCATION, useMapLogic } from './useMapLogic';
import { useMapPoints } from './hooks/useMapPoints';
import { useMapInitialization } from './hooks/useMapInitialization';
import LoadingScreen from './LoadingScreen';
import MapContent from './components/MapContent';
import MapControls from './components/MapControls';
import TechnicalStatus from './components/TechnicalStatus';
import { useMapStore } from '@/stores/mapStore';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Simple context type for internal use
interface MapContextType {
  handleBuzz: () => void;
  searchAreas: any[];
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  setActiveSearchArea: (id: string | null) => void;
  deleteSearchArea: (id: string) => Promise<boolean>;
  setPendingRadius: (value: number) => void;
  toggleAddingSearchArea: () => void;
  mapPoints: any[];
  isAddingPoint: boolean;
  setIsAddingPoint: (value: boolean) => void;
  activeMapPoint: string | null;
  setActiveMapPoint: (id: string | null) => void;
  addMapPoint: (point: any) => void;
  updateMapPoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  requestLocationPermission: () => void;
  showHelpDialog: boolean;
  setShowHelpDialog: (show: boolean) => void;
  mapCenter: [number, number];
  setMapCenter: (center: [number, number]) => void;
  mapLoaded: boolean;
  setMapLoaded: (loaded: boolean) => void;
  mapRef: React.RefObject<any>;
  handleMapLoad: (map: any) => void;
  newPoint: any | null;
  handleMapPointClick: (point: { lat: number; lng: number; title: string; note: string }) => Promise<string>;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  handleCancelNewPoint: () => void;
  isAddingMapPoint: boolean;
  setIsAddingMapPoint: (value: boolean) => void;
  onAreaGenerated: (lat: number, lng: number, radius: number) => void;
}

const MapContext = React.createContext<MapContextType | undefined>(undefined);

const MapLogicProvider = () => {
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  
  // Use Zustand store for centralized state management
  const { 
    isAddingPoint, 
    isAddingMapPoint, 
    mapStatus,
    setIsAddingPoint, 
    setIsAddingMapPoint,
    syncPointStates,
    setMapStatus
  } = useMapStore();
  
  // Get map logic from our custom hook
  const { 
    handleBuzz, 
    searchAreas, 
    isAddingSearchArea, 
    handleMapClickArea, 
    setActiveSearchArea, 
    deleteSearchArea,
    setPendingRadius,
    toggleAddingSearchArea,
    mapPoints,
    activeMapPoint,
    setActiveMapPoint,
    addMapPoint,
    updateMapPoint,
    deleteMapPoint,
    requestLocationPermission
  } = useMapLogic();
  
  // Modified to match the expected signature: (point: { lat: number; lng: number; title: string; note: string }) => Promise<string>
  const handleMapPointClick = async (point: { lat: number; lng: number; title: string; note: string }): Promise<string> => {
    const newPointId = `point-${Date.now()}`;
    addMapPoint({
      id: newPointId,
      lat: point.lat,
      lng: point.lng,
      title: point.title || '',
      note: point.note || ''
    });
    return newPointId; // Return the new point ID
  };

  // Wrapper function for useMapPoints hook (expects object-based updates)
  const handleUpdatePointForHook = async (id: string, updates: { title?: string; note?: string }): Promise<boolean> => {
    return await updateMapPoint(id, updates);
  };

  // Wrapper function for context (expects individual parameters)
  const handleUpdatePointWrapper = async (id: string, title: string, note: string): Promise<boolean> => {
    return await updateMapPoint(id, { title, note });
  };

  // Use our custom hook for map points
  const {
    newPoint,
    handleMapPointClick: hookHandleMapPointClick,
    handleSaveNewPoint,
    handleUpdatePoint,
    handleCancelNewPoint
  } = useMapPoints(
    mapPoints,
    setActiveMapPoint,
    handleMapPointClick,
    handleUpdatePointForHook,
    deleteMapPoint
  );
  
  // Use our custom hook for map initialization
  const {
    mapLoaded,
    setMapLoaded,
    mapRef,
    handleMapLoad
  } = useMapInitialization(
    isAddingMapPoint,
    isAddingPoint,
    isAddingSearchArea,
    hookHandleMapPointClick,
    handleMapClickArea
  );

  // Handle area generation callback
  const handleAreaGenerated = (lat: number, lng: number, radius: number) => {
    console.log('🎯 Area generated, updating map center:', { lat, lng, radius });
    setMapCenter([lat, lng]);
    
    // Update map reference if available
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 13);
      
      // Calculate appropriate zoom for radius
      const radiusMeters = radius * 1000;
      const bounds = L.latLng(lat, lng).toBounds(radiusMeters * 2);
      
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }, 100);
    }
  };
  
  // Synchronize point states using Zustand
  useEffect(() => {
    console.log("🔄 Synchronizing point states via Zustand:", 
      {isAddingPoint, isAddingMapPoint});
    
    // Keep states in sync
    if (isAddingPoint !== isAddingMapPoint) {
      syncPointStates(isAddingPoint);
    }
  }, [isAddingPoint, isAddingMapPoint, syncPointStates]);
  
  // Simulate a small loading delay for better UX
  useEffect(() => {
    setMapStatus('loading');
    const timer = setTimeout(() => {
      if (!mapLoaded) {
        setMapLoaded(true);
        setMapStatus('ready');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [mapLoaded, setMapLoaded, setMapStatus]);

  // Create context value
  const contextValue: MapContextType = {
    handleBuzz,
    searchAreas,
    isAddingSearchArea,
    handleMapClickArea,
    setActiveSearchArea,
    deleteSearchArea,
    setPendingRadius,
    toggleAddingSearchArea,
    mapPoints,
    isAddingPoint,
    setIsAddingPoint,
    activeMapPoint,
    setActiveMapPoint,
    addMapPoint,
    updateMapPoint: handleUpdatePointWrapper,
    deleteMapPoint,
    requestLocationPermission,
    showHelpDialog,
    setShowHelpDialog,
    mapCenter,
    setMapCenter,
    mapLoaded,
    setMapLoaded,
    mapRef,
    handleMapLoad,
    newPoint,
    handleMapPointClick,
    handleSaveNewPoint,
    handleUpdatePoint,
    handleCancelNewPoint,
    isAddingMapPoint,
    setIsAddingMapPoint,
    onAreaGenerated: handleAreaGenerated
  };
  
  if (!mapLoaded) return <LoadingScreen />;
  
  return (
    <MapContext.Provider value={contextValue}>
      <div 
        className="rounded-[24px] overflow-hidden relative w-full" 
        style={{ 
          height: '70vh', 
          minHeight: '500px',
          width: '100%',
          display: 'block',
          position: 'relative'
        }}
      >
        {/* Map content */}
        <MapContent 
          mapRef={mapRef}
          handleMapLoad={handleMapLoad}
          searchAreas={searchAreas}
          setActiveSearchArea={setActiveSearchArea}
          deleteSearchArea={deleteSearchArea}
          mapPoints={mapPoints}
          activeMapPoint={activeMapPoint}
          setActiveMapPoint={setActiveMapPoint}
          handleUpdatePoint={handleUpdatePoint}
          deleteMapPoint={deleteMapPoint}
          newPoint={newPoint}
          handleSaveNewPoint={handleSaveNewPoint}
          handleCancelNewPoint={handleCancelNewPoint}
          isAddingSearchArea={isAddingSearchArea}
          handleMapClickArea={handleMapClickArea}
          setPendingRadius={setPendingRadius}
          isAddingMapPoint={isAddingMapPoint || isAddingPoint}
          hookHandleMapPointClick={hookHandleMapPointClick}
        />

        {/* Map controls */}
        <MapControls
          requestLocationPermission={requestLocationPermission}
          toggleAddingSearchArea={toggleAddingSearchArea}
          isAddingSearchArea={isAddingSearchArea}
          handleBuzz={handleBuzz}
          isAddingMapPoint={isAddingMapPoint || isAddingPoint}
          showHelpDialog={showHelpDialog}
          setShowHelpDialog={setShowHelpDialog}
          mapCenter={mapCenter}
          onAreaGenerated={handleAreaGenerated}
        />
        
        {/* Technical status logger */}
        <TechnicalStatus 
          mapRef={mapRef}
          isAddingMapPoint={isAddingMapPoint}
          isAddingPoint={isAddingPoint}
          isAddingSearchArea={isAddingSearchArea}
          newPoint={newPoint}
          mapPoints={mapPoints}
          searchAreas={searchAreas}
        />
      </div>
    </MapContext.Provider>
  );
};

export default MapLogicProvider;
