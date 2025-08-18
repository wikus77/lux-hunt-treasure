import React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddMapPointButtonProps {
  isAddingMapPoint: boolean;
  setIsAddingMapPoint: (value: boolean) => void;
}

const AddMapPointButton: React.FC<AddMapPointButtonProps> = ({
  isAddingMapPoint,
  setIsAddingMapPoint
}) => {
  return (
    <div className="leaflet-bar leaflet-control" style={{ position: 'absolute', top: '150px', left: '10px', zIndex: 1000 }}>
      <Button
        variant={isAddingMapPoint ? "default" : "outline"}
        size="sm"
        onClick={() => setIsAddingMapPoint(!isAddingMapPoint)}
        className="h-8 w-8 p-0 rounded border"
        title={isAddingMapPoint ? "Annulla aggiunta punto" : "Aggiungi punto sulla mappa"}
      >
        <MapPin className={`h-4 w-4 ${isAddingMapPoint ? 'text-white' : ''}`} />
      </Button>
    </div>
  );
};

export default AddMapPointButton;