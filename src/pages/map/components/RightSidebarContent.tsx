
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2, Plus } from 'lucide-react';

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  note: string;
  position: { lat: number; lng: number };
}

interface SearchArea {
  id: string;
  lat: number;
  lng: number;
  radius: number;
}

interface RightSidebarContentProps {
  mapPoints: MapPoint[];
  isAddingMapPoint: boolean;
  toggleAddingMapPoint: () => void;
  setActiveMapPoint: (id: string | null) => void;
  deleteMapPoint: (id: string) => Promise<boolean>;
  searchAreas: SearchArea[];
  setActiveSearchArea: (id: string | null) => void;
  clearAllSearchAreas: () => void;
  handleAddArea: (area: SearchArea) => void;
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
  isAddingSearchArea,
  deleteSearchArea,
}) => {
  return (
    <div className="space-y-6">
      {/* Punti di interesse */}
      <div className="m1ssion-glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Punti di interesse</h3>
          <Button
            onClick={toggleAddingMapPoint}
            size="sm"
            variant={isAddingMapPoint ? "secondary" : "default"}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isAddingMapPoint ? 'Annulla' : 'Aggiungi'}
          </Button>
        </div>
        
        <div className="space-y-2">
          {mapPoints.length === 0 ? (
            <p className="text-gray-400 text-sm">Nessun punto di interesse aggiunto</p>
          ) : (
            mapPoints.map((point) => (
              <div
                key={point.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer group"
                onClick={() => setActiveMapPoint(point.id)}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#00D1FF]" />
                  <div>
                    <p className="text-white text-sm font-medium">{point.title || 'Punto senza nome'}</p>
                    {point.note && (
                      <p className="text-gray-400 text-xs">{point.note}</p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMapPoint(point.id);
                  }}
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Aree di ricerca */}
      <div className="m1ssion-glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Aree di interesse</h3>
        </div>
        
        <div className="space-y-2">
          {searchAreas.length === 0 ? (
            <p className="text-gray-400 text-sm">Nessuna area di ricerca aggiunta</p>
          ) : (
            searchAreas.map((area) => (
              <div
                key={area.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer group"
                onClick={() => setActiveSearchArea(area.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#00D1FF]" />
                  <div>
                    <p className="text-white text-sm font-medium">
                      Area {area.radius}m
                    </p>
                    <p className="text-gray-400 text-xs">
                      {area.lat.toFixed(4)}, {area.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSearchArea(area.id);
                  }}
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebarContent;
