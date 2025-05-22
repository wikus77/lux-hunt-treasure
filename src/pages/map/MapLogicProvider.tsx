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
  {
    "featureType": "all",
    "elementType": "labels.text",
    "stylers": [
      {
        "color": "#f9f9f9"
      },
      {
        "weight": "0.50"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#9b87f5"
      },
      {
        "weight": 1.3
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#9b87f5"
      },
      {
        "weight": 2
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#9b87f5"
      },
      {
        "weight": 1.5
      }
    ]
  },
  {
    "featureType": "administrative.continent",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1EAEDB"
      },
      {
        "weight": 3
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#0d0d1f"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#1a1a3a"
      },
      {
        "weight": 1
      },
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#070714"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1EAEDB"
      },
      {
        "weight": 0.5
      },
      {
        "visibility": "on"
      }
    ]
  }
];

const MapLogicProvider = () => {
  // Check if we're in a secure context (required for geolocation)
  const [isSecureContext, setIsSecureContext] = useState(() => {
    // window.isSecureContext checks if the page is loaded over HTTPS or localhost
    const secure = typeof window !== 'undefined' && (window.isSecureContext === true);
    if (!secure) {
      console.error('Page not running in a secure context. Geolocation may not work.');
    }
    return secure;
  });

  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: mapLibraries,
  });

  // Get user location information using watchPosition for more reliable results
  const { permission, userLocation, askPermission, loading: locationLoading, error: locationError } = useUserLocationPermission();
  const [locationReceived, setLocationReceived] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  
  // Get prize location based on user's location
  const { prizeLocation, bufferRadius } = usePrizeLocation(userLocation);

  // Map state - explicitly maintain the center state
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapZoom, setMapZoom] = useState(15);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const MAX_AUTO_RETRY = 3;

  // Set up watchPosition instead of getCurrentPosition for more reliable updates
  useEffect(() => {
    if (!isSecureContext) {
      toast.error("Contesto non sicuro", {
        description: "Questa pagina deve essere caricata in HTTPS per utilizzare la geolocalizzazione."
      });
      return;
    }

    if ('geolocation' in navigator && permission === 'granted') {
      // Clear any previous watches
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      console.log("Setting up position watching...");
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Position update received:", { latitude, longitude });
          
          if (map) {
            map.panTo({ lat: latitude, lng: longitude });
          }
          
          setUserLocation && setUserLocation([latitude, longitude]);
          setLocationReceived(true);
          setRetryAttempts(0);
        },
        (error) => {
          console.error("Watch position error:", error);
          if (error.code === 1) { // PERMISSION_DENIED
            toast.error("Accesso alla posizione negato", {
              description: "Per vedere la tua posizione sulla mappa, attiva la localizzazione nelle impostazioni del browser."
            });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        }
      );
      
      setWatchId(id);
      
      return () => {
        if (id !== null) {
          navigator.geolocation.clearWatch(id);
        }
      };
    }
  }, [isSecureContext, permission, map]);

  // Request location permission immediately when component mounts
  useEffect(() => {
    if (isSecureContext) {
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
    }
  }, [askPermission, permission, userLocation, isSecureContext]);

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    console.log("Google Maps component is mounted and ready");
    
    // If we already have a location, center the map on it
    if (userLocation && Array.isArray(userLocation) && userLocation.length === 2) {
      map.panTo({ lat: userLocation[0], lng: userLocation[1] });
      map.setZoom(mapZoom);
    }
  }, [userLocation, mapZoom]);
  
  // Retry getting location - improved function to force a new attempt
  const retryGetLocation = () => {
    if (!isSecureContext) {
      toast.error("Contesto non sicuro", {
        description: "Questa pagina deve essere caricata in HTTPS per utilizzare la geolocalizzazione."
      });
      return;
    }
    
    console.log("Retrying location detection...");
    // Reset error state before retrying
    setLocationReceived(false);
    setRetryAttempts(0);
    
    // Try to clear any denied permissions cached in the browser
    if (navigator.geolocation) {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
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
      {!isSecureContext && (
        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10 p-4">
          <div className="bg-red-500/90 text-white p-4 rounded-xl shadow-lg max-w-md">
            <h3 className="text-lg font-bold mb-2">Errore di sicurezza</h3>
            <p>La geolocalizzazione richiede una connessione sicura (HTTPS).</p>
            <p className="mt-2 text-sm">Questa pagina dovrebbe essere caricata tramite HTTPS per accedere alla tua posizione.</p>
          </div>
        </div>
      )}
      
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
        {/* User marker with HTTPS URL */}
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
