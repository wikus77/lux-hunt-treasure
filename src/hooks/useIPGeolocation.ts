// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Geolocalizzazione IP robusta con fallback multipli per M1SSION™ PWA
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface IPLocationResponse {
  lat: number;
  lon: number;
  city: string;
  country: string;
}

// Servizi di geolocalizzazione IP in ordine di priorità
const GEO_SERVICES = [
  {
    name: 'ipinfo.io',
    url: 'https://ipinfo.io/json',
    parser: (data: any) => {
      if (data.loc) {
        const [lat, lng] = data.loc.split(',').map(parseFloat);
        return {
          lat, lng,
          city: data.city || 'Unknown',
          country: data.country || 'Unknown'
        };
      }
      return null;
    }
  },
  {
    name: 'geojs.io',
    url: 'https://get.geojs.io/v1/ip/geo.json',
    parser: (data: any) => ({
      lat: parseFloat(data.latitude),
      lng: parseFloat(data.longitude),
      city: data.city || 'Unknown',
      country: data.country || 'Unknown'
    })
  },
  {
    name: 'ip-api.com',
    url: 'http://ip-api.com/json/',
    parser: (data: any) => ({
      lat: data.lat,
      lng: data.lon,
      city: data.city || 'Unknown',
      country: data.country || 'Unknown'
    })
  }
];

export const useIPGeolocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const getLocationByIP = useCallback(async () => {
    console.log('🌍 M1SSION™ GEOLOCATION: Starting enhanced IP-based location...');
    setIsLoading(true);
    
    // Prima, prova GPS se disponibile e autorizzato
    try {
      if ('geolocation' in navigator) {
        console.log('🌍 M1SSION™ GEOLOCATION: Trying GPS first...');
        
        const gpsPromise = new Promise<{lat: number, lng: number}>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              console.log('🌍 M1SSION™ GEOLOCATION: GPS success:', coords);
              resolve(coords);
            },
            (error) => {
              console.log('🌍 M1SSION™ GEOLOCATION: GPS failed:', error.message);
              reject(error);
            },
            { 
              timeout: 2500, 
              enableHighAccuracy: true,
              maximumAge: 30000 
            }
          );
        });

        // Aspetta GPS per max 2.5 secondi
        const gpsCoords = await Promise.race([
          gpsPromise,
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('GPS timeout')), 2500)
          )
        ]);

        if (gpsCoords) {
          setCoords(gpsCoords);
          if (!(window as any).__M1_TOAST_DEDUP) (window as any).__M1_TOAST_DEDUP = {};
          const now = Date.now();
          if (!((window as any).__M1_TOAST_DEDUP['gps-success'] > now - 3000)) {
            toast.success('🎯 Posizione GPS rilevata con precisione');
            (window as any).__M1_TOAST_DEDUP['gps-success'] = now;
          }
          (window as any).__M1_DEBUG = {
            ...(window as any).__M1_DEBUG,
            geo: { source: 'gps', last: gpsCoords, error: null }
          };
          return gpsCoords;
        }
      }
    } catch (gpsError) {
      console.log('🌍 M1SSION™ GEOLOCATION: GPS not available, fallback to IP:', gpsError);
      if (!(window as any).__M1_TOAST_DEDUP) (window as any).__M1_TOAST_DEDUP = {};
      const now = Date.now();
      if (!((window as any).__M1_TOAST_DEDUP['gps-unavailable'] > now - 5000)) {
        toast.info('GPS non disponibile – uso posizione IP');
        (window as any).__M1_TOAST_DEDUP['gps-unavailable'] = now;
      }
    }

    // Se GPS fallisce, prova i servizi IP in sequenza
    for (const service of GEO_SERVICES) {
      try {
        console.log(`🌍 M1SSION™ GEOLOCATION: Trying ${service.name}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(service.url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`🌍 M1SSION™ GEOLOCATION: ${service.name} response:`, data);
        
        const parsed = service.parser(data);
        
        if (parsed && !isNaN(parsed.lat) && !isNaN(parsed.lng)) {
          const newCoords = { lat: parsed.lat, lng: parsed.lng };
          
          // Verifica che le coordinate siano ragionevoli (Europa)
          if (parsed.lat >= 36 && parsed.lat <= 71 && parsed.lng >= -11 && parsed.lng <= 40) {
            setCoords(newCoords);
            if (!(window as any).__M1_TOAST_DEDUP) (window as any).__M1_TOAST_DEDUP = {};
            const now = Date.now();
            if (!((window as any).__M1_TOAST_DEDUP['ip-success'] > now - 3000)) {
              toast.success(`🌍 Posizione rilevata: ${parsed.city}, ${parsed.country}`);
              (window as any).__M1_TOAST_DEDUP['ip-success'] = now;
            }
            console.log(`🌍 M1SSION™ GEOLOCATION: SUCCESS with ${service.name}!`, newCoords);
            (window as any).__M1_DEBUG = {
              ...(window as any).__M1_DEBUG,
              geo: { source: 'ip', last: newCoords, city: parsed.city, country: parsed.country, error: null }
            };
            return newCoords;
          } else {
            console.warn(`🌍 M1SSION™ GEOLOCATION: ${service.name} returned coordinates outside Europe:`, parsed);
          }
        } else {
          console.warn(`🌍 M1SSION™ GEOLOCATION: ${service.name} returned invalid coordinates:`, parsed);
        }
        
      } catch (error) {
        console.error(`🌍 M1SSION™ GEOLOCATION: ${service.name} failed:`, error);
        continue; // Prova il prossimo servizio
      }
    }
    
    // Se tutti i servizi falliscono, fallback geografico per l'Europa
    console.log('🌍 M1SSION™ GEOLOCATION: All services failed, using European fallback');
    const europeFallback = { lat: 50.1109, lng: 8.6821 }; // Francoforte, centro Europa
    setCoords(europeFallback);
    if (!(window as any).__M1_TOAST_DEDUP) (window as any).__M1_TOAST_DEDUP = {};
    const now = Date.now();
    if (!((window as any).__M1_TOAST_DEDUP['fallback'] > now - 5000)) {
      toast.info('🗺️ Posizione geografica non disponibile, usando vista Europa');
      (window as any).__M1_TOAST_DEDUP['fallback'] = now;
    }
    (window as any).__M1_DEBUG = {
      ...(window as any).__M1_DEBUG,
      geo: { source: 'cached', last: europeFallback, error: 'All services failed' }
    };
    return europeFallback;
    
  }, []);

  return {
    coords,
    isLoading,
    getLocationByIP
  };
};