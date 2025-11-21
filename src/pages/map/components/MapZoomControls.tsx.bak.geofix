
import React from 'react';
import { useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Locate } from 'lucide-react';
import { toast } from 'sonner';

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
        console.log('🚫 GPS failed from button:', error);
        toast.error('Impossibile rilevare la posizione GPS');
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
