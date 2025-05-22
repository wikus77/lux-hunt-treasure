
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useSearchAreasLogic } from './useSearchAreasLogic';
import { useMapMarkersLogic } from './useMapMarkersLogic';
import { usePricingLogic } from './hooks/usePricingLogic';
import { supabase } from '@/integrations/supabase/client';
import { MapMarker } from '@/components/maps/types';

// Default location (Rome, Italy)
export const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

export const useMapLogic = () => {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const searchAreasLogic = useSearchAreasLogic(DEFAULT_LOCATION);
  const markerLogic = useMapMarkersLogic();
  const { buzzMapPrice, buzzRadiusMeters, handlePayment } = usePricingLogic();
  const locationPermissionChecked = useRef(false);
  const [mapPoints, setMapPoints] = useState<MapMarker[]>([]);
  const [isAddingMapPoint, setIsAddingMapPoint] = useState(false);
  const [activeMapPoint, setActiveMapPoint] = useState<string | null>(null);
  
  // Load user's map points on component mount
  useEffect(() => {
    fetchMapPoints();
  }, []);
  
  // Fetch map points from Supabase
  const fetchMapPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('map_points')
        .select('*');
        
      if (error) {
        console.error('Error fetching map points:', error);
        return;
      }
      
      // Convert to MapMarker format
      const convertedPoints: MapMarker[] = data.map(point => ({
        id: point.id,
        lat: point.latitude,
        lng: point.longitude,
        note: point.note || '',
        title: point.title,
        position: { lat: point.latitude, lng: point.longitude },
        createdAt: new Date(point.created_at)
      }));
      
      setMapPoints(convertedPoints);
    } catch (error) {
      console.error('Error in fetchMapPoints:', error);
    }
  };

  // Add a new map point
  const addMapPoint = async (point: { lat: number; lng: number; title: string; note: string }) => {
    try {
      const { data, error } = await supabase
        .from('map_points')
        .insert({
          latitude: point.lat,
          longitude: point.lng,
          title: point.title,
          note: point.note
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error adding map point:', error);
        toast.error('Errore nel salvare il punto di interesse');
        return null;
      }
      
      const newPoint: MapMarker = {
        id: data.id,
        lat: data.latitude,
        lng: data.longitude,
        note: data.note || '',
        title: data.title,
        position: { lat: data.latitude, lng: data.longitude },
        createdAt: new Date(data.created_at)
      };
      
      setMapPoints(prev => [...prev, newPoint]);
      toast.success('Punto di interesse salvato');
      return newPoint.id;
    } catch (error) {
      console.error('Error in addMapPoint:', error);
      toast.error('Errore nel salvare il punto di interesse');
      return null;
    }
  };

  // Update an existing map point
  const updateMapPoint = async (id: string, updates: { title?: string; note?: string }) => {
    try {
      const { error } = await supabase
        .from('map_points')
        .update(updates)
        .eq('id', id);
        
      if (error) {
        console.error('Error updating map point:', error);
        toast.error('Errore nell\'aggiornare il punto di interesse');
        return false;
      }
      
      setMapPoints(prev => 
        prev.map(point => 
          point.id === id ? { ...point, ...updates, note: updates.note || point.note, title: updates.title || point.title } : point
        )
      );
      
      toast.success('Punto di interesse aggiornato');
      return true;
    } catch (error) {
      console.error('Error in updateMapPoint:', error);
      toast.error('Errore nell\'aggiornare il punto di interesse');
      return false;
    }
  };

  // Delete a map point
  const deleteMapPoint = async (id: string) => {
    try {
      const { error } = await supabase
        .from('map_points')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting map point:', error);
        toast.error('Errore nell\'eliminare il punto di interesse');
        return false;
      }
      
      setMapPoints(prev => prev.filter(point => point.id !== id));
      setActiveMapPoint(null);
      toast.success('Punto di interesse eliminato');
      return true;
    } catch (error) {
      console.error('Error in deleteMapPoint:', error);
      toast.error('Errore nell\'eliminare il punto di interesse');
      return false;
    }
  };

  // Try to get user's location on component mount
  useEffect(() => {
    const getUserLocation = async () => {
      // Skip if we've already checked permission in this session
      if (locationPermissionChecked.current) return;
      
      try {
        // Check if the browser supports the Permissions API
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
          
          if (permissionStatus.state === 'granted') {
            // Permission already granted, get location
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation([latitude, longitude]);
              },
              (error) => {
                console.log('Error getting location:', error);
                handleGeolocationError(error);
              }
            );
          } else if (permissionStatus.state === 'prompt') {
            // Will prompt user, prepare for possible denial
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation([latitude, longitude]);
              },
              (error) => {
                console.log('Error getting location:', error);
                handleGeolocationError(error);
              }
            );
          } else {
            // Permission denied
            console.log('Geolocation permission denied');
            handleGeolocationDenied();
          }
          
          // Listen for permission changes
          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              // User granted permission after previously denying it
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  setCurrentLocation([latitude, longitude]);
                },
                (error) => {
                  console.log('Error getting location:', error);
                }
              );
            }
          };
        } else {
          // Browser doesn't support Permissions API, try direct geolocation
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setCurrentLocation([latitude, longitude]);
            },
            (error) => {
              console.log('Error getting location:', error);
              handleGeolocationError(error);
            }
          );
        }
      } catch (error) {
        console.error('Error checking geolocation permission:', error);
        // Fallback to default location
        setCurrentLocation(DEFAULT_LOCATION);
      }
      
      // Mark that we've checked permissions
      locationPermissionChecked.current = true;
    };
    
    getUserLocation();
  }, []);
  
  // Handle geolocation errors
  const handleGeolocationError = (error: GeolocationPositionError) => {
    // For permission denied (code 1), don't retry and show a helpful message
    if (error.code === 1) {
      handleGeolocationDenied();
    }
    
    // For other errors, fallback to default location
    setCurrentLocation(DEFAULT_LOCATION);
  };
  
  // Handle denied geolocation permission
  const handleGeolocationDenied = () => {
    toast.warning('Geolocalizzazione disattivata. Attiva la posizione per usare questa funzione.', {
      duration: 5000,
    });
    setCurrentLocation(DEFAULT_LOCATION);
  };
  
  // Request location permission again
  const requestLocationPermission = () => {
    locationPermissionChecked.current = false;
    
    // Show toast to inform user
    toast.info('Richiesta accesso alla posizione...', {
      duration: 3000,
    });
    
    // Try to get location again
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
        toast.success('Posizione aggiornata!');
      },
      (error) => {
        console.log('Error getting location:', error);
        handleGeolocationError(error);
      }
    );
  };
  
  // Handle Buzz button click
  const handleBuzz = useCallback(() => {
    handlePayment().then(success => {
      if (success) {
        // Generate a search area after successful payment using the calculated radius
        const areaId = searchAreasLogic.generateSearchArea(buzzRadiusMeters);
        if (areaId) {
          toast.success('Area di ricerca generata con successo!');
          searchAreasLogic.setActiveSearchArea(areaId);
        }
      }
    });
  }, [searchAreasLogic, handlePayment, buzzRadiusMeters]);
  
  // Toggle map point adding mode
  const toggleAddingMapPoint = () => {
    setIsAddingMapPoint(!isAddingMapPoint);
    if (!isAddingMapPoint) {
      toast.info('Clicca sulla mappa per aggiungere un punto di interesse');
    }
  };
  
  return {
    // Location
    currentLocation,
    setCurrentLocation,
    requestLocationPermission,
    
    // Search Areas
    ...searchAreasLogic,
    
    // Markers
    ...markerLogic,
    
    // Map Points
    mapPoints,
    isAddingMapPoint,
    toggleAddingMapPoint,
    setIsAddingMapPoint,
    activeMapPoint,
    setActiveMapPoint,
    addMapPoint,
    updateMapPoint,
    deleteMapPoint,
    
    // Buzz functionality
    buzzMapPrice,
    handleBuzz,
  };
};
