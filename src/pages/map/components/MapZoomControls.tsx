
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

  const centerMap = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 15);
        },
        (error) => {
          console.error('Geolocation error:', error);
          map.setView([41.9028, 12.4964], 13);
        }
      );
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
