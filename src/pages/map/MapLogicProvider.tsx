
import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import { toast } from 'sonner';
import { DEFAULT_LOCATION } from './utils/leafletIcons';
import MapStatusMessages from './components/MapStatusMessages';
import { usePrizeLocation } from './hooks/usePrizeLocation';
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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationReceived, setLocationReceived] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const { prizeLocation, bufferRadius } = usePrizeLocation(userLocation);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocalizzazione non supportata dal browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setLocationReceived(true);
        localStorage.setItem('geoPermission', 'granted');
      },
      (error) => {
        console.warn("Errore geolocalizzazione:", error);
        toast.error("Errore nella geolocalizzazione: " + error.message);
        
        // IP-based fallback using ipapi.co
        toast.info("Attivazione localizzazione approssimativa", {
          description: "Utilizziamo la tua posizione IP per una stima approssimativa."
        });
        
        fetch("https://ipapi.co/json/")
          .then(res => res.json())
          .then(data => {
            const coords: [number, number] = [data.latitude, data.longitude];
            setUserLocation(coords);
            setLocationReceived(true);
            toast.success("Posizione IP ottenuta", {
              description: "Geolocalizzazione tramite IP approssimativa attivata."
            });
          })
          .catch(err => {
            console.error("Errore nel fallback IP:", err);
            setUserLocation([41.9028, 12.4964]); // fallback Roma
            toast.error("Impossibile determinare la posizione", {
              description: "Utilizzando una posizione predefinita."
            });
          });
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const retryGetLocation = () => {
    setUserLocation(null);
    setLocationReceived(false);
    requestLocation();
    toast.info("Richiesta posizione in corso", {
      description: "Assicurati di concedere l'autorizzazione quando richiesto dal browser."
    });
  };

  if (!userLocation) return <LoadingScreen />;

  return (
    <div style={{ height: '60vh', width: '100%', zIndex: 1 }} className="rounded-[24px] overflow-hidden relative">
      <MapContainer 
        center={userLocation as [number, number]} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; Stadia Maps, OpenMapTiles, OpenStreetMap'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
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
        isLoading={!locationReceived}
        locationReceived={locationReceived}
        permissionDenied={false}
        retryGetLocation={retryGetLocation}
      />

      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapLogicProvider;
