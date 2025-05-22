
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Circle } from '@react-google-maps/api';
import { toast } from 'sonner';
import { DEFAULT_LOCATION, createUserMarkerIcon, createPrizeMarkerIcon, getPrizeCircleOptions } from './utils/leafletIcons';
import MapStatusMessages from './components/MapStatusMessages';
import { useUserLocationPermission } from '@/hooks/useUserLocationPermission';
import { usePrizeLocation } from './hooks/usePrizeLocation';
import HelpDialog from './HelpDialog';
import LoadingScreen from './LoadingScreen';

// Google Maps API key from the project
const GOOGLE_MAPS_API_KEY = "AIzaSyDcPS0_nVl2-Waxcby_Vn3iu1ojh360oKQ";

// Map container styles
const mapContainerStyle = {
  width: '100%',
  height: '60vh',
  borderRadius: '0.5rem',
};

// Dark mode style for Google Maps
const darkModeStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const mapLibraries: ["places"] = ["places"];

const MapLogicProvider = () => {
  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: mapLibraries,
    loadingElement: <LoadingScreen />,
  });

  // Get user location information - request it immediately on component mount
  const { permission, userLocation, askPermission, loading, error } = useUserLocationPermission();
  const [locationReceived, setLocationReceived] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  
  // Get prize location based on user's location
  const { prizeLocation, bufferRadius } = usePrizeLocation(userLocation);

  // Map state - explicitly maintain the center state
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapZoom, setMapZoom] = useState(15);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(null);

  // Request location permission immediately when component mounts (doppio controllo)
  useEffect(() => {
    console.log("MapLogicProvider mounted - requesting geolocation");
    askPermission(); // Richiesta esplicita della posizione al mount
    
    // Ricontrolliamo lo stato dopo un breve ritardo per assicurarci che la richiesta venga processata
    const checkTimer = setTimeout(() => {
      if (permission === 'prompt' && !userLocation) {
        console.log("Retrying permission request after timeout");
        askPermission();
      }
    }, 3000);
    
    return () => clearTimeout(checkTimer);
  }, [askPermission, permission, userLocation]);

  // Handle user location updates with improved center management
  useEffect(() => {
    console.log("Geolocation status:", { permission, loading, error });
    console.log("Geolocation data:", userLocation);
    
    if (permission === 'granted' && userLocation) {
      // Validate coordinates before setting them
      if (Array.isArray(userLocation) && userLocation.length === 2 && 
          !isNaN(userLocation[0]) && !isNaN(userLocation[1])) {
        console.log("Setting user location to:", userLocation);
        setLocationReceived(true);
        
        // Update the map center state
        setMapCenter({ lat: userLocation[0], lng: userLocation[1] });
        
        // If map is already loaded, center it and zoom in
        if (map) {
          map.panTo({ lat: userLocation[0], lng: userLocation[1] });
          map.setZoom(mapZoom);
        }
      }
    } else if (permission === 'prompt') {
      console.log("Requesting geolocation permission again...");
      // Non richiedere automaticamente se siamo ancora in attesa
      if (!loading) {
        askPermission();
      }
    } else if (permission === 'denied') {
      console.log("Geolocation permission denied, using fallback to Roma");
      
      // Set fallback location (Roma)
      const fallbackLocation = { lat: 41.9028, lng: 12.4964 }; // Roma
      setMapCenter(fallbackLocation);
    }
    
  }, [permission, userLocation, askPermission, loading, error, map, mapZoom]);
  
  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    console.log("Google Maps component is mounted and ready");
    
    // Try to get location again if not available yet
    if (!userLocation && permission !== 'denied') {
      askPermission();
    }
    
    // If we already have a location, center the map on it
    if (userLocation && Array.isArray(userLocation) && userLocation.length === 2) {
      map.panTo({ lat: userLocation[0], lng: userLocation[1] });
      map.setZoom(mapZoom);
    }
  }, [userLocation, permission, askPermission, mapZoom]);
  
  // Retry getting location - funzione migliorata per forzare un nuovo tentativo
  const retryGetLocation = () => {
    console.log("Retrying location detection...");
    // Resetta lo stato di errore prima di ritentare
    setLocationReceived(false);
    
    // Cerca di pulire eventuali permessi negati in cache del browser
    navigator.geolocation.clearWatch(
      navigator.geolocation.watchPosition(() => {}, () => {})
    );
    
    // Richiedi nuovamente il permesso
    askPermission();
    
    // Mostra un toast per informare l'utente
    toast.info("Richiesta posizione in corso", {
      description: "Assicurati di concedere l'autorizzazione quando richiesto dal browser."
    });
  };

  // Handle loading state and errors
  if (loadError) return <div className="text-red-500 text-center p-4">Errore nel caricamento della mappa</div>;
  if (!isLoaded) return <LoadingScreen />;

  // Determine appropriate center for the map
  const getMapCenter = () => {
    // If we have a specific map center state, use it
    if (mapCenter) {
      return mapCenter;
    }
    
    // If we have user location, use it
    if (userLocation && Array.isArray(userLocation) && userLocation.length === 2) {
      return { lat: userLocation[0], lng: userLocation[1] };
    }
    
    // Fall back to Roma
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
        {/* User marker */}
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
        
        {/* Prize location circle */}
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
        isLoading={loading} 
        locationReceived={locationReceived}
        permissionDenied={permission === 'denied'}
        retryGetLocation={retryGetLocation}
      />
      
      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapLogicProvider;
