
import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import { toast } from 'sonner';
import { DEFAULT_LOCATION } from './utils/leafletIcons';
import MapStatusMessages from './components/MapStatusMessages';
import { usePrizeLocation } from './hooks/usePrizeLocation';
import { useRefactoredUserLocation } from './useRefactoredUserLocation';
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
  // Use our optimized custom hook for user location
  const { currentLocation: userLocation, isLoading } = useRefactoredUserLocation();
  const [locationReceived, setLocationReceived] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const { prizeLocation, bufferRadius } = usePrizeLocation(userLocation);
  
  // Update locationReceived state when userLocation changes
  useEffect(() => {
    if (userLocation) {
      console.log("Location received in MapLogicProvider:", userLocation);
      setLocationReceived(true);
    }
  }, [userLocation]);

  // Retry function that uses our custom hook's functionality
  const retryGetLocation = useCallback(() => {
    setLocationReceived(false);
    // Force page refresh to trigger new geolocation request
    window.location.reload();
    toast.info("Richiesta posizione in corso", {
      description: "Assicurati di concedere l'autorizzazione quando richiesto dal browser."
    });
  }, []);

  if (!userLocation) return <LoadingScreen />;

  return (
    <div style={{ height: '60vh', width: '100%', zIndex: 1 }} className="rounded-[24px] overflow-hidden relative">
      <MapContainer 
        center={userLocation} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
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

        <Marker
          position={userLocation}
          icon={L.icon({
            iconUrl: '/assets/marker-icon.png',
            iconSize: [30, 30],
          })}
        />

        {prizeLocation && bufferRadius && (
          <Circle
            center={[prizeLocation[0], prizeLocation[1]]}
            pathOptions={{
              color: '#00D1FF',
              fillColor: '#00D1FF',
              fillOpacity: 0.2,
            }}
            radius={bufferRadius}
          />
        )}
      </MapContainer>

      <MapStatusMessages
        isLoading={isLoading}
        locationReceived={locationReceived}
        permissionDenied={false}
        retryGetLocation={retryGetLocation}
      />

      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapLogicProvider;
