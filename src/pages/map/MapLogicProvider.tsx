
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Circle } from '@react-google-maps/api';
import { toast } from 'sonner';
import { DEFAULT_LOCATION, createUserMarkerIcon, createPrizeMarkerIcon, getPrizeCircleOptions } from './utils/leafletIcons';
import MapStatusMessages from './components/MapStatusMessages';
import { useUserLocationPermission } from '@/hooks/useUserLocationPermission';
import { usePrizeLocation } from './hooks/usePrizeLocation';
import HelpDialog from './HelpDialog';
import LoadingScreen from './LoadingScreen';
import { GOOGLE_MAPS_API_KEY } from '@/config/apiKeys';

// Define map libraries as a constant outside the component to prevent rerendering
const mapLibraries = ["places"] as ["places"];

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

// Define map libraries as a constant outside the component to prevent rerendering
const mapLibraries = ["places"] as ["places"];

const MapLogicProvider = () => {
  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: mapLibraries,
  });

  // Get user location information - request it immediately on component mount
  const { permission, userLocation, askPermission, loading: locationLoading, error: locationError } = useUserLocationPermission();
  const [locationReceived, setLocationReceived] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  
  // Get prize location based on user's location
  const { prizeLocation, bufferRadius } = usePrizeLocation(userLocation);

  // Map state - explicitly maintain the center state
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapZoom, setMapZoom] = useState(15);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const MAX_AUTO_RETRY = 3;

  // Request location permission immediately when component mounts
  useEffect(() => {
    console.log("MapLogicProvider mounted - requesting geolocation");
    askPermission(); // Explicit request on mount
    
    // Check status after a delay to ensure the request is processed
    const checkTimer = setTimeout(() => {
      if (permission === 'prompt' && !userLocation) {
        console.log("Retrying permission request after timeout");
        askPermission();
      }
    }, 3000);
    
    return () => clearTimeout(checkTimer);
  }, [askPermission, permission, userLocation]);

  // Set up automatic retry for geolocation
  useEffect(() => {
    if (permission !== 'denied' && !userLocation && !locationLoading && retryAttempts < MAX_AUTO_RETRY) {
      const retryTimer = setTimeout(() => {
        console.log(`Auto-retrying geolocation (${retryAttempts + 1}/${MAX_AUTO_RETRY})...`);
        askPermission();
        setRetryAttempts(prev => prev + 1);
      }, 5000); // Retry every 5 seconds
      
      return () => clearTimeout(retryTimer);
    }
  }, [permission, userLocation, locationLoading, retryAttempts, askPermission]);

  // Handle user location updates with improved center management
  useEffect(() => {
    console.log("Geolocation status:", { permission, loading: locationLoading, error: locationError });
    console.log("Geolocation data:", userLocation);
    
    if (permission === 'granted' && userLocation) {
      // Validate coordinates before setting them
      if (Array.isArray(userLocation) && userLocation.length === 2 && 
          !isNaN(userLocation[0]) && !isNaN(userLocation[1])) {
        console.log("Setting user location to:", userLocation);
        setLocationReceived(true);
        setRetryAttempts(0); // Reset retry attempts on success
        
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
      // Don't automatically request if we're still loading
      if (!locationLoading && retryAttempts < MAX_AUTO_RETRY) {
        askPermission();
      }
    } else if (permission === 'denied') {
      console.log("Geolocation permission denied, using fallback to Roma");
      
      // Set fallback location (Roma)
      const fallbackLocation = { lat: 41.9028, lng: 12.4964 }; // Roma
      setMapCenter(fallbackLocation);
      
      // Show a more informative toast message
      toast.info("Posizione non disponibile", {
        description: "Per vedere la tua posizione sulla mappa, attiva la localizzazione nelle impostazioni del browser.",
        duration: 5000
      });
    }
    
  }, [permission, userLocation, askPermission, locationLoading, locationError, map, mapZoom, retryAttempts]);
  
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
  
  // Retry getting location - improved function to force a new attempt
  const retryGetLocation = () => {
    console.log("Retrying location detection...");
    // Reset error state before retrying
    setLocationReceived(false);
    setRetryAttempts(0);
    
    // Try to clear any denied permissions cached in the browser
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(
        navigator.geolocation.watchPosition(() => {}, () => {})
      );
    }
    
    // Request permission again
    askPermission();
    
    // Show a toast to inform the user
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
        isLoading={locationLoading} 
        locationReceived={locationReceived}
        permissionDenied={permission === 'denied'}
        retryGetLocation={retryGetLocation}
      />
      
      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapLogicProvider;
