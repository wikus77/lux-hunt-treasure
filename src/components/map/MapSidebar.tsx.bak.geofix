
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Search } from 'lucide-react';

interface MapSidebarProps {
  mapPoints: any[];
  isAddingMapPoint: boolean;
  toggleAddingMapPoint: () => void;
  setActiveMapPoint: (id: string | null) => void;
  deleteMapPoint: (id: string) => Promise<boolean>;
  searchAreas: any[];
  setActiveSearchArea: (id: string | null) => void;
  handleAddArea: (area: any) => void;
  isAddingSearchArea: boolean;
  deleteSearchArea: (id: string) => Promise<boolean>;
}

const MapSidebar: React.FC<MapSidebarProps> = ({
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Map Points Section */}
      <div className="m1ssion-glass-card p-4 rounded-[24px] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan-400" />
            Punti di Interesse
          </h3>
          <Button
            onClick={toggleAddingMapPoint}
            size="sm"
            className={`${
              isAddingMapPoint
                ? 'bg-cyan-500 hover:bg-cyan-600'
                : 'bg-purple-500 hover:bg-purple-600'
            } transition-colors`}
          >
            <Plus className="h-4 w-4 mr-1" />
            {isAddingMapPoint ? 'Annulla' : 'Aggiungi'}
          </Button>
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {mapPoints.length === 0 ? (
            <p className="text-gray-400 text-sm">Nessun punto aggiunto</p>
          ) : (
            mapPoints.map((point) => (
              <div key={point.id} className="p-2 bg-black/30 rounded-lg">
                <h4 className="text-white font-medium text-sm">{point.title}</h4>
                {point.note && (
                  <p className="text-gray-300 text-xs mt-1">{point.note}</p>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">
                    {point.lat?.toFixed(4)}, {point.lng?.toFixed(4)}
                  </span>
                  <Button
                    onClick={() => deleteMapPoint(point.id)}
                    size="sm"
                    variant="destructive"
                    className="h-6 px-2 text-xs"
                  >
                    Elimina
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Search Areas Section */}
      <div className="m1ssion-glass-card p-4 rounded-[24px] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-green-400" />
            Aree di Ricerca
          </h3>
          <Button
            onClick={() => {}}
            size="sm"
            className="bg-green-500 hover:bg-green-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Aggiungi
          </Button>
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {searchAreas.length === 0 ? (
            <p className="text-gray-400 text-sm">Nessuna area aggiunta</p>
          ) : (
            searchAreas.map((area) => (
              <div key={area.id} className="p-2 bg-black/30 rounded-lg">
                <h4 className="text-white font-medium text-sm">
                  {area.label || 'Area di ricerca'}
                </h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">
                    Raggio: {(area.radius / 1000).toFixed(1)} km
                  </span>
                  <Button
                    onClick={() => deleteSearchArea(area.id)}
                    size="sm"
                    variant="destructive"
                    className="h-6 px-2 text-xs"
                  >
                    Elimina
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MapSidebar;
