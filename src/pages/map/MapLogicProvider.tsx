import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Circle } from '@react-google-maps/api';
import { toast } from 'sonner';
import { DEFAULT_LOCATION, createUserMarkerIcon, createPrizeMarkerIcon, getPrizeCircleOptions } from './utils/leafletIcons';
import MapStatusMessages from './components/MapStatusMessages';
import { usePrizeLocation } from './hooks/usePrizeLocation';
import HelpDialog from './HelpDialog';
import LoadingScreen from './LoadingScreen';
import { GOOGLE_MAPS_API_KEY } from '@/config/apiKeys';

const mapLibraries = ["places"] as ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '60vh',
  borderRadius: '0.5rem',
};

const darkModeStyle = [
  // ... (stilizzazione mappa omessa per brevità)
];

const MapLogicProvider = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: mapLibraries,
  });

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationReceived, setLocationReceived] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const { prizeLocation, bufferRadius } = usePrizeLocation(userLocation);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapZoom, setMapZoom] = useState(15);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const MAX_AUTO_RETRY = 3;

  // Geolocalizzazione diretta
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocalizzazione non supportata dal browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude] as [number, number];
        setUserLocation(coords);
        setMapCenter({ lat: coords[0], lng: coords[1] });
        setLocationReceived(true);
        setRetryAttempts(0);
      },
      (error) => {
        console.warn("Errore geolocalizzazione:", error);
        toast.error("Errore nella geolocalizzazione: " + error.message);
        setMapCenter({ lat: 41.9028, lng: 12.4964 });
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (!userLocation && retryAttempts < MAX_AUTO_RETRY) {
      const retryTimer = setTimeout(() => {
        console.log(`Retry ${retryAttempts + 1}/${MAX_AUTO_RETRY}`);
        requestLocation();
        setRetryAttempts(prev => prev + 1);
      }, 5000);
      return () => clearTimeout(retryTimer);
    }
  }, [userLocation, retryAttempts, requestLocation]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    console.log("Google Maps loaded");
    if (userLocation) {
      map.panTo({ lat: userLocation[0], lng: userLocation[1] });
      map.setZoom(mapZoom);
    }
  }, [userLocation, mapZoom]);

  const retryGetLocation = () => {
    setUserLocation(null);
    setLocationReceived(false);
    setRetryAttempts(0);
    requestLocation();
    toast.info("Richiesta posizione in corso", {
      description: "Assicurati di concedere l'autorizzazione quando richiesto dal browser."
    });
  };

  if (loadError) return <div className="text-red-500 text-center p-4">Errore nel caricamento della mappa</div>;
  if (!isLoaded) return <LoadingScreen />;

  const getMapCenter = () => {
    if (mapCenter) return mapCenter;
    if (userLocation) return { lat: userLocation[0], lng: userLocation[1] };
    return { lat: 41.9028, lng: 12.4964 };
  };

  return (
    <div style={{ height: '60vh', width: '100%', zIndex: 1 }} className="rounded-[24px] overflow-hidden relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={getMapCenter()}
        zoom={mapZoom}
        options={{
          styles: darkModeStyle,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
        onLoad={onMapLoad}
      >
        {userLocation && (
          <Marker
            position={{ lat: userLocation[0], lng: userLocation[1] }}
            icon={{
              url: '/assets/marker-icon.png',
              scaledSize: new window.google.maps.Size(30, 30),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 15),
            }}
          />
        )}

        {prizeLocation && bufferRadius && (
          <Circle
            center={{ lat: prizeLocation[0], lng: prizeLocation[1] }}
            options={{
              strokeColor: '#00D1FF',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#00D1FF',
              fillOpacity: 0.2,
              clickable: false,
              draggable: false,
              editable: false,
              visible: true,
              radius: bufferRadius,
              zIndex: 1,
            }}
          />
        )}
      </GoogleMap>

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
