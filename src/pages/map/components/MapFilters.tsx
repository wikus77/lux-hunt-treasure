
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, MapPin, Target, Circle } from 'lucide-react';

interface MapFiltersProps {
  onFilterChange?: (filters: MapFilterState) => void;
}

export interface MapFilterState {
  showMapPoints: boolean;
  showBuzzAreas: boolean;
  showPrizeArea: boolean;
  showSearchAreas: boolean;
}

const MapFilters: React.FC<MapFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<MapFilterState>({
    showMapPoints: true,
    showBuzzAreas: true,
    showPrizeArea: true,
    showSearchAreas: true,
  });

  const [isOpen, setIsOpen] = useState(false);

  const toggleFilter = (key: keyof MapFilterState) => {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/50 border-cyan-500/30 text-white hover:bg-black/70"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filtri
        {activeFilterCount < 4 && (
          <Badge variant="secondary" className="ml-2 bg-cyan-500 text-black">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 space-y-3 min-w-48 z-50">
          <div className="text-sm font-medium text-white mb-2">Mostra sulla mappa:</div>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showMapPoints}
              onChange={() => toggleFilter('showMapPoints')}
              className="rounded border-gray-300"
            />
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white">Punti mappa</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showBuzzAreas}
              onChange={() => toggleFilter('showBuzzAreas')}
              className="rounded border-gray-300"
            />
            <Circle className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white">Aree BUZZ</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showPrizeArea}
              onChange={() => toggleFilter('showPrizeArea')}
              className="rounded border-gray-300"
            />
            <Target className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white">Area premio</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showSearchAreas}
              onChange={() => toggleFilter('showSearchAreas')}
              className="rounded border-gray-300"
            />
            <Circle className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white">Aree ricerca</span>
          </label>
        </div>
      )}
    </div>
  );
};

export default MapFilters;
