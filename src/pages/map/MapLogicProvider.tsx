
import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { toast } from 'sonner';
import { DEFAULT_LOCATION, useMapLogic } from './useMapLogic';
import HelpDialog from './HelpDialog';
import LoadingScreen from './LoadingScreen';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SearchAreaMapLayer from './SearchAreaMapLayer';

// Import newly created components
import MapEventHandler from './components/MapEventHandler';
import MapPopupManager from './components/MapPopupManager';
import MapInstructionsOverlay from './components/MapInstructionsOverlay';
import LocationButton from './components/LocationButton';
import BuzzButton from './components/BuzzButton';
import { useMapPoints } from './hooks/useMapPoints';

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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  
  const { 
    handleBuzz, 
    buzzMapPrice, 
    searchAreas, 
    isAddingSearchArea, 
    handleMapClickArea, 
    setActiveSearchArea, 
    deleteSearchArea,
    setPendingRadius,
    mapPoints,
    isAddingMapPoint,
    setIsAddingMapPoint,
    activeMapPoint,
    setActiveMapPoint,
    addMapPoint,
    updateMapPoint,
    deleteMapPoint,
    toggleAddingMapPoint,
    requestLocationPermission
  } = useMapLogic();
  
  // Use our new custom hook for map points
  const {
    newPoint,
    handleMapPointClick,
    handleSaveNewPoint,
    handleUpdatePoint,
    handleCancelNewPoint
  } = useMapPoints(
    mapPoints,
    setActiveMapPoint,
    addMapPoint,
    updateMapPoint,
    deleteMapPoint
  );
  
  // Function to handle map load event
  const handleMapLoad = useCallback(() => {
    console.log("Map component mounted and ready");
    setMapLoaded(true);
  }, []);

  // Simulate a small loading delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapLoaded) {
        setMapLoaded(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [mapLoaded]);

  // Log whenever isAddingMapPoint changes
  useEffect(() => {
    console.log("isAddingMapPoint changed:", isAddingMapPoint);
  }, [isAddingMapPoint]);
  
  if (!mapLoaded) return <LoadingScreen />;

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
      <MapContainer 
        center={DEFAULT_LOCATION} 
        zoom={15}
        style={{ 
          height: '100%', 
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}
        className="z-10"
        whenReady={handleMapLoad}
      >
        {/* Balanced tone TileLayer - not too dark, not too light */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        />

        {/* Add labels layer separately for better visibility and control */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'
        />
        
        {/* Display search areas */}
        <SearchAreaMapLayer 
          searchAreas={searchAreas} 
          setActiveSearchArea={setActiveSearchArea}
          deleteSearchArea={deleteSearchArea}
        />
        
        {/* Use the new MapPopupManager component */}
        <MapPopupManager 
          mapPoints={mapPoints}
          activeMapPoint={activeMapPoint}
          setActiveMapPoint={setActiveMapPoint}
          handleUpdatePoint={handleUpdatePoint}
          deleteMapPoint={deleteMapPoint}
          newPoint={newPoint}
          handleSaveNewPoint={handleSaveNewPoint}
          handleCancelNewPoint={handleCancelNewPoint}
        />
        
        {/* Use the new MapEventHandler component */}
        <MapEventHandler 
          isAddingSearchArea={isAddingSearchArea} 
          handleMapClickArea={handleMapClickArea}
          searchAreas={searchAreas}
          setPendingRadius={setPendingRadius}
          isAddingMapPoint={isAddingMapPoint}
          onMapPointClick={handleMapPointClick}
        />
      </MapContainer>

      {/* Use the new LocationButton component */}
      <LocationButton requestLocationPermission={requestLocationPermission} />

      {/* Use the new BuzzButton component */}
      <BuzzButton handleBuzz={handleBuzz} buzzMapPrice={buzzMapPrice} />

      {/* Use the new MapInstructionsOverlay component */}
      <MapInstructionsOverlay 
        isAddingSearchArea={isAddingSearchArea} 
        isAddingMapPoint={isAddingMapPoint} 
      />

      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapLogicProvider;
