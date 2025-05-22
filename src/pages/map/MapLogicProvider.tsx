
import React, { useState, useCallback } from 'react';
import { MapContainer } from 'react-leaflet';
import HelpDialog from './HelpDialog';
import LoadingScreen from './LoadingScreen';
import { useMapLogic } from './useMapLogic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SearchAreaMapLayer from './SearchAreaMapLayer';

// Import the new components
import MapEventHandlerComponent from './components/MapEventHandlerComponent';
import AddingAreaInstructions from './components/AddingAreaInstructions';
import BuzzButton from './components/BuzzButton';
import MapLayers from './components/MapLayers';

// Import the CSS for cursor styles
import './styles/mapCursor.css';

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
    mapRef
  } = useMapLogic();
  
  // Function to handle map load event
  const handleMapLoad = useCallback(() => {
    console.log("Map component mounted and ready");
    setMapLoaded(true);
  }, []);

  // Simulate a small loading delay for better UX
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapLoaded) {
        setMapLoaded(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [mapLoaded]);

  React.useEffect(() => {
    console.log("MapLogicProvider - Current search areas:", searchAreas);
  }, [searchAreas]);

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
        center={[41.9028, 12.4964]} 
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
        {/* Map Layers Component */}
        <MapLayers />
        
        {/* Display search areas */}
        <SearchAreaMapLayer 
          searchAreas={searchAreas} 
          setActiveSearchArea={setActiveSearchArea}
          deleteSearchArea={deleteSearchArea}
          mapRef={mapRef}
        />
        
        {/* Map event handler component */}
        <MapEventHandlerComponent 
          isAddingSearchArea={isAddingSearchArea} 
          handleMapClickArea={handleMapClickArea}
          searchAreas={searchAreas}
          setPendingRadius={setPendingRadius}
        />
      </MapContainer>

      {/* BUZZ button component */}
      <BuzzButton handleBuzz={handleBuzz} buzzMapPrice={buzzMapPrice} />

      {/* Adding Area Instructions Overlay */}
      <AddingAreaInstructions isAddingSearchArea={isAddingSearchArea} />

      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapLogicProvider;
