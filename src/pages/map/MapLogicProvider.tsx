
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DEFAULT_LOCATION, useMapLogic } from './useMapLogic';
import { useMapPoints } from './hooks/useMapPoints';
import { useMapInitialization } from './hooks/useMapInitialization';
import { MapContext, MapContextType } from '@/contexts/mapContext';
import { useMapStore } from '@/stores/mapStore';
import LoadingScreen from './LoadingScreen';
import MapContent from './components/MapContent';
import MapControls from './components/MapControls';
import TechnicalStatus from './components/TechnicalStatus';
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

const MapLogicProvider = () => {
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  
  // Get state from centralized store
  const {
    isAddingPoint,
    isAddingMapPoint,
    isAddingSearchArea,
    mapLoaded,
    activeMapPoint,
    setIsAddingPoint,
    setIsAddingMapPoint,
    setMapLoaded,
    setActiveMapPoint
  } = useMapStore();
  
  // Get map logic from our custom hook
  const { 
    handleBuzz, 
    searchAreas, 
    handleMapClickArea, 
    setActiveSearchArea, 
    deleteSearchArea,
    setPendingRadius,
    toggleAddingSearchArea,
    mapPoints,
    addMapPoint,
    updateMapPoint,
    deleteMapPoint,
    requestLocationPermission
  } = useMapLogic();
  
  // Fixed to match the expected signature from useMapPoints
  const handleMapPointClick = async (point: { lat: number; lng: number; title: string; note: string }): Promise<string> => {
    const newPointId = `point-${Date.now()}`;
    addMapPoint({
      id: newPointId,
      lat: point.lat,
      lng: point.lng,
      title: point.title || '',
      note: point.note || ''
    });
    return newPointId;
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
    // Fix: updateMapPoint signature to match expected interface
    (id: string, updates: { title?: string; note?: string }) => updateMapPoint(id, updates.title || '', updates.note || ''),
    deleteMapPoint
  );
  
  // Use our custom hook for map initialization
  const {
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
  
  // Synchronize isAddingMapPoint state between hook and mapLogic to ensure consistency
  useEffect(() => {
    console.log("🔄 Synchronizing isAddingMapPoint states:", 
      {hookState: isAddingMapPoint, mapLogicState: isAddingPoint});
    
    if (isAddingPoint !== isAddingMapPoint) {
      console.log("🔄 Setting hook isAddingMapPoint to:", isAddingPoint);
      setIsAddingMapPoint(isAddingPoint);
    }
  }, [isAddingPoint, isAddingMapPoint, setIsAddingMapPoint]);

  // Also propagate state from hook to parent if needed
  useEffect(() => {
    if (isAddingMapPoint !== isAddingPoint) {
      console.log("🔄 Setting mapLogic isAddingMapPoint to:", isAddingMapPoint);
      setIsAddingPoint(isAddingMapPoint);
    }
  }, [isAddingMapPoint, isAddingPoint, setIsAddingPoint]);
  
  // Simulate a small loading delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapLoaded) {
        setMapLoaded(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [mapLoaded, setMapLoaded]);

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
    // Fix: Use wrapper function with correct signature
    updateMapPoint: (id: string, title: string, note: string) => updateMapPoint(id, title, note),
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
    handleMapPointClick: hookHandleMapPointClick,
    handleSaveNewPoint,
    // Fix: Use wrapper function with correct signature  
    handleUpdatePoint: (id: string, title: string, note: string) => handleUpdatePoint(id, title, note),
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
          handleUpdatePoint={(id: string, title: string, note: string) => handleUpdatePoint(id, title, note)}
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
