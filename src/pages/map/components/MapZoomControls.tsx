
import React from 'react';
import { useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Plus, Minus, MapPin } from 'lucide-react';

interface MapZoomControlsProps {
  currentLocation?: { lat: number; lng: number };
}

const MapZoomControls: React.FC<MapZoomControlsProps> = ({ currentLocation }) => {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleGoToLocation = () => {
    if (currentLocation) {
      map.setView([currentLocation.lat, currentLocation.lng], 15);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <Button
        onClick={handleZoomIn}
        size="sm"
        variant="outline"
        className="bg-white/90 hover:bg-white border-gray-300 p-2"
      >
        <Plus className="w-4 h-4" />
      </Button>
      
      <Button
        onClick={handleZoomOut}
        size="sm"
        variant="outline"
        className="bg-white/90 hover:bg-white border-gray-300 p-2"
      >
        <Minus className="w-4 h-4" />
      </Button>

      {currentLocation && (
        <Button
          onClick={handleGoToLocation}
          size="sm"
          variant="outline"
          className="bg-white/90 hover:bg-white border-gray-300 p-2"
        >
          <MapPin className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default MapZoomControls;
