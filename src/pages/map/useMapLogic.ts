
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useMapMarkersLogic } from './useMapMarkersLogic';
import { usePricingLogic } from './hooks/usePricingLogic';

// Default location (Rome, Italy)
export const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

export const useMapLogic = () => {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [locationPermissionState, setLocationPermissionState] = useState<PermissionState | null>(null);
  const permissionChecked = useRef(false);
  const markerLogic = useMapMarkersLogic();
  const { buzzMapPrice, buzzRadiusMeters, handlePayment } = usePricingLogic();
  
  // Check geolocation permission and get user's location if permitted
  useEffect(() => {
    const checkPermissionAndGetLocation = async () => {
      if (permissionChecked.current) return;
      
      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          console.log('Geolocation not supported by browser');
          setCurrentLocation(DEFAULT_LOCATION);
          return;
        }
        
        // Check permission status if the Permissions API is available
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
          setLocationPermissionState(permissionStatus.state);
          
          // Listen for permission changes
          permissionStatus.addEventListener('change', () => {
            setLocationPermissionState(permissionStatus.state);
          });
          
          // Only proceed if permission is granted
          if (permissionStatus.state === 'granted') {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation([latitude, longitude]);
              },
              (error) => {
                console.error('Geolocation error:', error);
                setCurrentLocation(DEFAULT_LOCATION);
                
                // Show a toast for permission denied
                if (error.code === 1) { // PERMISSION_DENIED
                  toast.warning('Geolocalizzazione non attiva. Controlla le impostazioni del browser.');
                }
              },
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
            );
          } else if (permissionStatus.state === 'prompt') {
            // Will prompt the user, handled in the error callback
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation([latitude, longitude]);
              },
              (error) => {
                console.warn('Geolocation permission not granted', error);
                setCurrentLocation(DEFAULT_LOCATION);
                
                // Show a toast for permission denied
                if (error.code === 1) { // PERMISSION_DENIED
                  toast.warning('Geolocalizzazione non attiva. Controlla le impostazioni del browser.');
                }
              }
            );
          } else {
            // Permission denied
            console.warn('Geolocation permission denied');
            setCurrentLocation(DEFAULT_LOCATION);
            toast.warning('Geolocalizzazione non attiva. Controlla le impostazioni del browser.');
          }
        } else {
          // Fallback for browsers without Permissions API
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setCurrentLocation([latitude, longitude]);
            },
            (error) => {
              console.warn('Geolocation error:', error);
              setCurrentLocation(DEFAULT_LOCATION);
              
              // Show a toast for permission denied
              if (error.code === 1) { // PERMISSION_DENIED
                toast.warning('Geolocalizzazione non attiva. Controlla le impostazioni del browser.');
              }
            }
          );
        }
        
        permissionChecked.current = true;
      } catch (e) {
        console.error('Error in geolocation handling:', e);
        setCurrentLocation(DEFAULT_LOCATION);
      }
    };
    
    checkPermissionAndGetLocation();
    markerLogic.loadMarkers();
  }, [markerLogic]);
  
  // Function to manually retry getting location
  const retryGeolocation = useCallback(() => {
    permissionChecked.current = false;
    toast.info('Tentativo di ottenere la posizione in corso...');
    
    // Reset the permission check and retry
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        if (permissionStatus.state !== 'denied') {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setCurrentLocation([latitude, longitude]);
              toast.success('Posizione ottenuta con successo!');
            },
            (error) => {
              console.error('Errore geolocalizzazione:', error);
              toast.error('Impossibile ottenere la posizione.');
            }
          );
        } else {
          toast.error('Permesso di geolocalizzazione negato. Controlla le impostazioni del browser.');
        }
      });
    } else {
      // Fallback for browsers without Permissions API
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          toast.success('Posizione ottenuta con successo!');
        },
        (error) => {
          console.error('Errore geolocalizzazione:', error);
          toast.error('Impossibile ottenere la posizione.');
        }
      );
    }
  }, []);
  
  // Handle Buzz button click
  const handleBuzz = useCallback(() => {
    handlePayment().then(success => {
      if (success) {
        toast.success('Azione completata con successo!');
      }
    });
  }, [handlePayment]);
  
  return {
    // Location
    currentLocation,
    setCurrentLocation,
    locationPermissionState,
    retryGeolocation,
    
    // Markers
    ...markerLogic,
    
    // Buzz functionality
    buzzMapPrice,
    handleBuzz,
  };
};
