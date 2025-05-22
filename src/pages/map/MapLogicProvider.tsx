
import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { toast } from 'sonner';
import { DEFAULT_LOCATION } from './useMapLogic';
import HelpDialog from './HelpDialog';
import LoadingScreen from './LoadingScreen';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // Function to handle the BUZZ button click
  const handleBuzzClick = () => {
    toast.success("Generazione area di ricerca in corso", {
      description: "Stai per essere reindirizzato al pagamento"
    });
    // Redirect to payment page or open payment modal
    window.location.href = '/payment-methods?from=map&price=1.99&session=map_buzz_' + Date.now();
  };

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
        zoomControl={false}
      >
        {/* Dark map style for M1SSION theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        />

        {/* Add labels layer separately for better visibility */}
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'
        />
        
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Mini BUZZ button positioned in bottom right */}
      <div className="absolute bottom-4 right-4 z-20">
        <Button 
          onClick={handleBuzzClick}
          className="bg-gradient-to-r from-projectx-blue to-projectx-pink hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] flex items-center gap-1.5 py-1.5 px-3 rounded-full text-sm font-medium"
        >
          <Zap className="h-4 w-4" />
          <span>Buzz 1.99€</span>
        </Button>
      </div>

      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapLogicProvider;
