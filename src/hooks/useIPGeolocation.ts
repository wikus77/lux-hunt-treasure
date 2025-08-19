// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Geolocalizzazione IP come fallback per iframe Lovable
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface IPLocationResponse {
  lat: number;
  lon: number;
  city: string;
  country: string;
}

export const useIPGeolocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const getLocationByIP = useCallback(async () => {
    setIsLoading(true);
    console.log('🌍 IP GEOLOCATION: Starting IP-based location...');
    
    try {
      // Uso servizio IP gratuito
      const response = await fetch('http://ip-api.com/json/?fields=status,lat,lon,city,country');
      const data: IPLocationResponse = await response.json();
      
      console.log('🌍 IP GEOLOCATION: Response:', data);
      
      if (data.lat && data.lon) {
        const newCoords = { lat: data.lat, lng: data.lon };
        setCoords(newCoords);
        toast.success(`📍 Posizione rilevata via IP: ${data.city}, ${data.country}`);
        console.log('🌍 IP GEOLOCATION: SUCCESS!', newCoords);
        return newCoords;
      } else {
        throw new Error('Coordinate non disponibili');
      }
    } catch (error) {
      console.error('🌍 IP GEOLOCATION: ERROR!', error);
      
      // Fallback Milano
      const fallbackCoords = { lat: 45.4642, lng: 9.19 };
      setCoords(fallbackCoords);
      toast.error('❌ Errore geolocalizzazione IP - Fallback: Milano');
      return fallbackCoords;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    coords,
    isLoading,
    getLocationByIP
  };
};