
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, MapPin, Target } from 'lucide-react';

interface MapFiltersProps {
  showPrizes: boolean;
  showSearchAreas: boolean;
  showBuzzAreas: boolean;
  onTogglePrizes: () => void;
  onToggleSearchAreas: () => void;
  onToggleBuzzAreas: () => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({
  showPrizes,
  showSearchAreas,
  showBuzzAreas,
  onTogglePrizes,
  onToggleSearchAreas,
  onToggleBuzzAreas
}) => {
  return (
    <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
      <div className="bg-black/70 rounded-lg p-2 border border-cyan-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-cyan-400" />
          <span className="text-xs text-white font-medium">Filtri</span>
        </div>
        
        <div className="flex flex-col gap-1">
          <Button
            onClick={onTogglePrizes}
            size="sm"
            variant={showPrizes ? "default" : "outline"}
            className={`h-8 text-xs justify-start ${
              showPrizes 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500' 
                : 'bg-black/50 hover:bg-black/70 text-yellow-400 border-yellow-500/30'
            }`}
          >
            <Target className="h-3 w-3 mr-1" />
            Premi
          </Button>
          
          <Button
            onClick={onToggleSearchAreas}
            size="sm"
            variant={showSearchAreas ? "default" : "outline"}
            className={`h-8 text-xs justify-start ${
              showSearchAreas 
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500' 
                : 'bg-black/50 hover:bg-black/70 text-cyan-400 border-cyan-500/30'
            }`}
          >
            <MapPin className="h-3 w-3 mr-1" />
            Ricerca
          </Button>
          
          <Button
            onClick={onToggleBuzzAreas}
            size="sm"
            variant={showBuzzAreas ? "default" : "outline"}
            className={`h-8 text-xs justify-start ${
              showBuzzAreas 
                ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500' 
                : 'bg-black/50 hover:bg-black/70 text-purple-400 border-purple-500/30'
            }`}
          >
            <Target className="h-3 w-3 mr-1" />
            BUZZ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapFilters;
