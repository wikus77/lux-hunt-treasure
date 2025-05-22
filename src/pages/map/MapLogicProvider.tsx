
import React, { useState, useCallback, useEffect } from 'react';
import { useMapLogic } from './useMapLogic';
import { DEFAULT_LOCATION } from './useMapLogic';
import HelpDialog from './HelpDialog';
import LoadingScreen from './LoadingScreen';
import MapContainer from './components/MapContainer';
import AddingMarkerOverlay from './components/AddingMarkerOverlay';
import MapActionButtons from './components/MapActionButtons';
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const { 
    handleBuzz, 
    buzzMapPrice, 
    markers,
    isAddingMarker, 
    handleMapClickMarker, 
    activeMarker,
    setActiveMarker,
    saveMarkerNote,
    deleteMarker,
    handleAddMarker
  } = useMapLogic();
  
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

  useEffect(() => {
    console.log("Current markers:", markers);
  }, [markers]);

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
      {/* Map Container */}
      <MapContainer
        center={DEFAULT_LOCATION}
        handleMapLoad={handleMapLoad}
        markers={markers}
        isAddingMarker={isAddingMarker}
        handleMapClickMarker={handleMapClickMarker}
        activeMarker={activeMarker}
        setActiveMarker={setActiveMarker}
        saveMarkerNote={saveMarkerNote}
        deleteMarker={deleteMarker}
      />

      {/* Bottom action buttons */}
      <MapActionButtons 
        handleAddMarker={handleAddMarker}
        handleBuzz={handleBuzz}
        buzzMapPrice={buzzMapPrice}
      />

      {/* Adding Marker Instructions Overlay */}
      <AddingMarkerOverlay isAddingMarker={isAddingMarker} />

      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapLogicProvider;
