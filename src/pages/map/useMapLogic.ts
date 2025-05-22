
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useSearchAreasLogic } from './useSearchAreasLogic';
import { useMapMarkersLogic } from './useMapMarkersLogic';
import { usePricingLogic } from './hooks/usePricingLogic';

// Default location (Rome, Italy)
export const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

export const useMapLogic = () => {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const searchAreasLogic = useSearchAreasLogic();
  const markerLogic = useMapMarkersLogic(DEFAULT_LOCATION);
  const { buzzMapPrice, handlePayment } = usePricingLogic();
  
  // Try to get user's location on component mount
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation([latitude, longitude]);
          },
          (error) => {
            console.log('Error getting location:', error);
            // Fallback to default location
            setCurrentLocation(DEFAULT_LOCATION);
          }
        );
      } else {
        console.log('Geolocation not supported');
        // Fallback to default location
        setCurrentLocation(DEFAULT_LOCATION);
      }
    };
    
    getUserLocation();
  }, []);
  
  // Handle Buzz button click
  const handleBuzz = useCallback(() => {
    handlePayment().then(success => {
      if (success) {
        // Generate a search area after successful payment
        const areaId = searchAreasLogic.generateSearchArea(5000);
        if (areaId) {
          toast.success('Area di ricerca generata con successo!');
          searchAreasLogic.setActiveSearchArea(areaId);
        }
      }
    });
  }, [searchAreasLogic, handlePayment]);
  
  return {
    // Location
    currentLocation,
    setCurrentLocation,
    
    // Search Areas
    ...searchAreasLogic,
    
    // Markers
    ...markerLogic,
    
    // Buzz functionality
    buzzMapPrice,
    handleBuzz,
  };
};
