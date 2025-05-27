
import React, { useState } from 'react';
import { DEFAULT_LOCATION, useMapLogic } from './useMapLogic';
import LoadingScreen from './LoadingScreen';
import MapLogicCore from '@/components/map/MapLogicCore';
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
    isAddingPoint,
    setIsAddingPoint,
    activeMapPoint,
    setActiveMapPoint,
    addMapPoint,
    updateMapPoint,
    deleteMapPoint,
    requestLocationPermission
  } = useMapLogic();

  // Funzione per gestire la centratura automatica dopo la generazione di un'area
  const handleAreaGenerated = (lat: number, lng: number, radius: number) => {
    console.log('🎯 Area generated, updating map center:', { lat, lng, radius });
    setMapCenter([lat, lng]);
  };
  
  return (
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
      <MapLogicCore
        handleBuzz={handleBuzz}
        searchAreas={searchAreas}
        isAddingSearchArea={isAddingSearchArea}
        handleMapClickArea={handleMapClickArea}
        setActiveSearchArea={setActiveSearchArea}
        deleteSearchArea={deleteSearchArea}
        setPendingRadius={setPendingRadius}
        toggleAddingSearchArea={toggleAddingSearchArea}
        mapPoints={mapPoints}
        isAddingPoint={isAddingPoint}
        setIsAddingPoint={setIsAddingPoint}
        activeMapPoint={activeMapPoint}
        setActiveMapPoint={setActiveMapPoint}
        addMapPoint={addMapPoint}
        updateMapPoint={updateMapPoint}
        deleteMapPoint={deleteMapPoint}
        requestLocationPermission={requestLocationPermission}
        showHelpDialog={showHelpDialog}
        setShowHelpDialog={setShowHelpDialog}
        mapCenter={mapCenter}
        onAreaGenerated={handleAreaGenerated}
      />
    </div>
  );
};

export default MapLogicProvider;
