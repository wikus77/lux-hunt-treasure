
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Circle } from 'lucide-react';
import BuzzMapButton from './BuzzMapButton';

interface RightSidebarContentProps {
  mapPoints: any[];
  isAddingMapPoint: boolean;
  toggleAddingMapPoint: () => void;
  setActiveMapPoint: (id: string | null) => void;
  deleteMapPoint: (id: string) => Promise<boolean>;
  searchAreas: any[];
  setActiveSearchArea: (id: string | null) => void;
  handleAddArea: () => void;
  isAddingSearchArea: boolean;
  deleteSearchArea: (id: string) => Promise<boolean>;
}

const RightSidebarContent: React.FC<RightSidebarContentProps> = ({
  mapPoints,
  isAddingMapPoint,
  toggleAddingMapPoint,
  setActiveMapPoint,
  deleteMapPoint,
  searchAreas,
  setActiveSearchArea,
  handleAddArea,
  isAddingSearchArea,
  deleteSearchArea
}) => {
  return (
    <div className="space-y-4">
      <Card className="bg-gray-900/50 border-gray-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            Punti Mappa ({mapPoints.length})
          </h3>
          <Button
            variant={isAddingMapPoint ? "destructive" : "outline"}
            size="sm"
            onClick={toggleAddingMapPoint}
            className="text-xs"
          >
            {isAddingMapPoint ? 'Annulla' : <Plus className="w-3 h-3" />}
          </Button>
        </div>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {mapPoints.map((point) => (
            <div
              key={point.id}
              className="text-sm text-gray-300 p-2 bg-gray-800/30 rounded cursor-pointer hover:bg-gray-700/30"
              onClick={() => setActiveMapPoint(point.id)}
            >
              <div className="font-medium text-white">{point.title}</div>
              {point.note && <div className="text-xs opacity-75">{point.note}</div>}
            </div>
          ))}
          {mapPoints.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-2">
              Nessun punto salvato
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-gray-900/50 border-gray-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Circle className="w-4 h-4 text-purple-400" />
            Aree Ricerca ({searchAreas.length})
          </h3>
          <Button
            variant={isAddingSearchArea ? "destructive" : "outline"}
            size="sm"
            onClick={handleAddArea}
            className="text-xs"
          >
            {isAddingSearchArea ? 'Annulla' : <Plus className="w-3 h-3" />}
          </Button>
        </div>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {searchAreas.map((area) => (
            <div
              key={area.id}
              className="text-sm text-gray-300 p-2 bg-gray-800/30 rounded cursor-pointer hover:bg-gray-700/30"
              onClick={() => setActiveSearchArea(area.id)}
            >
              <div className="font-medium text-white">{area.label || 'Area di ricerca'}</div>
              <div className="text-xs opacity-75">Raggio: {area.radius}m</div>
            </div>
          ))}
          {searchAreas.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-2">
              Nessuna area definita
            </div>
          )}
        </div>
      </Card>

      <BuzzMapButton />
    </div>
  );
};

export default RightSidebarContent;
