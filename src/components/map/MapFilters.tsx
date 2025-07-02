
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Eye, EyeOff } from 'lucide-react';

interface MapFiltersProps {
  showBuzzAreas?: boolean;
  showPrizeAreas?: boolean;
  showSearchAreas?: boolean;
  showMapPoints?: boolean;
  onToggleBuzzAreas?: (show: boolean) => void;
  onTogglePrizeAreas?: (show: boolean) => void;
  onToggleSearchAreas?: (show: boolean) => void;
  onToggleMapPoints?: (show: boolean) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({
  showBuzzAreas = true,
  showPrizeAreas = true,
  showSearchAreas = true,
  showMapPoints = true,
  onToggleBuzzAreas = () => {},
  onTogglePrizeAreas = () => {},
  onToggleSearchAreas = () => {},
  onToggleMapPoints = () => {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filters = [
    {
      label: 'BUZZ Areas',
      active: showBuzzAreas,
      toggle: onToggleBuzzAreas,
      color: 'cyan'
    },
    {
      label: 'Prize Areas',
      active: showPrizeAreas,
      toggle: onTogglePrizeAreas,
      color: 'yellow'
    },
    {
      label: 'Search Areas',
      active: showSearchAreas,
      toggle: onToggleSearchAreas,
      color: 'green'
    },
    {
      label: 'Map Points',
      active: showMapPoints,
      toggle: onToggleMapPoints,
      color: 'purple'
    }
  ];

  const activeCount = filters.filter(f => f.active).length;

  return (
    <div className="absolute top-4 left-4 z-50">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-10 rounded-full bg-black/70 border border-cyan-500/30 hover:bg-black/90 hover:border-cyan-500/60 px-3"
      >
        <Filter className="h-4 w-4 text-cyan-400 mr-2" />
        <span className="text-cyan-400 text-sm">{activeCount}</span>
      </Button>
      
      {isExpanded && (
        <div className="mt-2 bg-black/90 border border-cyan-500/30 rounded-lg p-2 backdrop-blur-md">
          {filters.map((filter, index) => (
            <Button
              key={index}
              onClick={() => filter.toggle(!filter.active)}
              variant="ghost"
              size="sm"
              className={`w-full justify-between mb-1 last:mb-0 ${
                filter.active 
                  ? `bg-${filter.color}-500/20 text-${filter.color}-400 border-${filter.color}-500/30` 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-sm">{filter.label}</span>
              {filter.active ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapFilters;
