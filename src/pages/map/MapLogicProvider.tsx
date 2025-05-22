
import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { toast } from 'sonner';
import { DEFAULT_LOCATION } from './useMapLogic';
import HelpDialog from './HelpDialog';
import LoadingScreen from './LoadingScreen';
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

  if (!mapLoaded) return <LoadingScreen />;

  return (
    <div style={{ height: '60vh', width: '100%', zIndex: 1 }} className="rounded-[24px] overflow-hidden relative">
      <MapContainer 
        center={DEFAULT_LOCATION} 
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        whenReady={handleMapLoad}
      >
        {/* Balanced tone TileLayer - not too dark, not too light */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png'
        />

        {/* Add labels layer separately for better visibility and control */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png'
        />
      </MapContainer>

      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapLogicProvider;
