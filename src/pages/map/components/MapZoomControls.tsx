
import React from 'react';
import { useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Locate } from 'lucide-react';

const MapZoomControls: React.FC = () => {
  const map = useMap();

  const zoomIn = () => {
    map.zoomIn();
  };

  const zoomOut = () => {
    map.zoomOut();
  };

  const centerMap = async () => {
    console.log('🎯 Location button pressed - Priority GPS...');
    
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000
          });
        });
        
        const { latitude, longitude } = position.coords;
        console.log('🎯 GPS SUCCESS from button:', { latitude, longitude });
        map.setView([latitude, longitude], 15);
        // Success toast is handled by the geolocation API
      } catch (error) {
        console.log('🚫 GPS failed from button, trying IP...');
        
        // IP fallback
        try {
          const response = await fetch('https://ipinfo.io/json');
          const data = await response.json();
          if (data.loc) {
            const [lat, lng] = data.loc.split(',').map(parseFloat);
            if (!isNaN(lat) && !isNaN(lng)) {
              console.log('🌐 IP location from button:', { lat, lng });
              map.setView([lat, lng], 13);
              // Don't show success toast for IP location since it's imprecise
            }
          }
        } catch (ipError) {
          console.error('Both GPS and IP failed:', ipError);
          map.setView([45.4642, 9.19], 13); // Milan fallback
        }
      }
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
      <Button
        onClick={zoomIn}
        size="sm"
        className="h-10 w-10 rounded-full bg-black/70 border border-cyan-500/30 hover:bg-black/90 hover:border-cyan-500/60 p-0"
      >
        <Plus className="h-4 w-4 text-cyan-400" />
      </Button>
      
      <Button
        onClick={zoomOut}
        size="sm"
        className="h-10 w-10 rounded-full bg-black/70 border border-cyan-500/30 hover:bg-black/90 hover:border-cyan-500/60 p-0"
      >
        <Minus className="h-4 w-4 text-cyan-400" />
      </Button>
      
      <Button
        onClick={centerMap}
        size="sm"
        className="h-10 w-10 rounded-full bg-black/70 border border-cyan-500/30 hover:bg-black/90 hover:border-cyan-500/60 p-0"
      >
        <Locate className="h-4 w-4 text-cyan-400" />
      </Button>
    </div>
  );
};

export default MapZoomControls;
