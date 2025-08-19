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
      // Provo prima ipapi.co
      console.log('🌍 IP GEOLOCATION: Trying ipapi.co...');
      let response = await fetch('https://ipapi.co/json/');
      let data = await response.json();
      
      console.log('🌍 IP GEOLOCATION: ipapi.co response:', data);
      
      // Se ipapi.co fallisce, provo ip-api.com
      if (!data.latitude || !data.longitude) {
        console.log('🌍 IP GEOLOCATION: ipapi.co failed, trying ip-api.com...');
        response = await fetch('https://ipapi.com/ip_api.php?ip=check');
        data = await response.json();
        console.log('🌍 IP GEOLOCATION: ip-api.com response:', data);
      }
      
      // Se anche quello fallisce, provo geoplugin
      if (!data.latitude && !data.longitude && !data.lat && !data.lon) {
        console.log('🌍 IP GEOLOCATION: Previous services failed, trying geoplugin...');
        response = await fetch('http://www.geoplugin.net/json.gp');
        data = await response.json();
        console.log('🌍 IP GEOLOCATION: geoplugin response:', data);
        
        if (data.geoplugin_latitude && data.geoplugin_longitude) {
          data.latitude = parseFloat(data.geoplugin_latitude);
          data.longitude = parseFloat(data.geoplugin_longitude);
          data.city = data.geoplugin_city;
          data.country_name = data.geoplugin_countryName;
        }
      }
      
      // Estrai coordinate in modo flessibile
      const lat = data.latitude || data.lat;
      const lng = data.longitude || data.lon;
      const city = data.city || data.geoplugin_city || 'Unknown';
      const country = data.country_name || data.country || data.geoplugin_countryName || 'Unknown';
      
      console.log('🌍 IP GEOLOCATION: Final coordinates extracted:', { lat, lng, city, country });
      
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        const newCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };
        setCoords(newCoords);
        toast.success(`🌍 Posizione rilevata via IP: ${city}, ${country}`);
        console.log('🌍 IP GEOLOCATION: SUCCESS!', newCoords);
        return newCoords;
      } else {
        throw new Error('Coordinate non valide dai servizi IP');
      }
    } catch (error) {
      console.error('🌍 IP GEOLOCATION: ERROR!', error);
      
      // ULTIMO TENTATIVO: Provo ipinfo.io
      try {
        console.log('🌍 IP GEOLOCATION: Final attempt with ipinfo.io...');
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        console.log('🌍 IP GEOLOCATION: ipinfo.io response:', data);
        
        if (data.loc) {
          const [lat, lng] = data.loc.split(',').map(parseFloat);
          if (!isNaN(lat) && !isNaN(lng)) {
            const newCoords = { lat, lng };
            setCoords(newCoords);
            toast.success(`🌍 Posizione rilevata via IP: ${data.city || 'Unknown'}, ${data.country || 'Unknown'}`);
            console.log('🌍 IP GEOLOCATION: SUCCESS with ipinfo.io!', newCoords);
            return newCoords;
          }
        }
      } catch (finalError) {
        console.error('🌍 IP GEOLOCATION: Final attempt failed!', finalError);
      }
      
      // Solo se tutti i servizi falliscono, usa Milano
      const fallbackCoords = { lat: 45.4642, lng: 9.19 };
      setCoords(fallbackCoords);
      toast.error('❌ Tutti i servizi di geolocalizzazione IP falliti - Fallback: Milano');
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