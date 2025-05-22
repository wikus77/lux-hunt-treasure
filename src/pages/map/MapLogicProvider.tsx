
import React, { useState, useCallback, useEffect } from 'react';
import { useMapLogic } from './useMapLogic';
import { DEFAULT_LOCATION } from './useMapLogic';
import HelpDialog from './HelpDialog';
import LoadingScreen from './LoadingScreen';
import MapContainer from './components/MapContainer';
import AddingMarkerOverlay from './components/AddingMarkerOverlay';
import MapActionButtons from './components/MapActionButtons';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    handleAddMarker,
    currentLocation,
    locationPermissionState,
    retryGeolocation
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
        center={currentLocation || DEFAULT_LOCATION}
        handleMapLoad={handleMapLoad}
        markers={markers}
        isAddingMarker={isAddingMarker}
        handleMapClickMarker={handleMapClickMarker}
        activeMarker={activeMarker}
        setActiveMarker={setActiveMarker}
        saveMarkerNote={saveMarkerNote}
        deleteMarker={deleteMarker}
        currentLocation={currentLocation}
      />

      {/* Location Permission Alert */}
      {locationPermissionState === 'denied' && (
        <div className="absolute top-4 left-0 right-0 mx-auto w-max z-30">
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-yellow-500/50">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span>Geolocalizzazione non attiva. Controlla le impostazioni del browser.</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 bg-projectx-blue/20 text-white border-projectx-blue/50 hover:bg-projectx-blue/30"
              onClick={retryGeolocation}
            >
              Riprova
            </Button>
          </div>
        </div>
      )}

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
