
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { FilterX, Filter, Image, FileText, MapPin, Target, Calendar } from "lucide-react";

interface MapFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  clueTypes: {
    text: boolean;
    photo: boolean;
    location: boolean;
  };
  probabilityThreshold: number;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export function MapFilters({ onFilterChange }: MapFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    clueTypes: {
      text: true,
      photo: true,
      location: true,
    },
    probabilityThreshold: 20,
    dateRange: {
      start: null,
      end: null,
    },
  });
  
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
    
    // Calculate active filters count
    let count = 0;
    if (!newFilters.clueTypes.text) count++;
    if (!newFilters.clueTypes.photo) count++;
    if (!newFilters.clueTypes.location) count++;
    if (newFilters.probabilityThreshold > 20) count++;
    if (newFilters.dateRange.start || newFilters.dateRange.end) count++;
    
    setActiveFiltersCount(count);
  };
  
  const resetFilters = () => {
    const defaultFilters = {
      clueTypes: {
        text: true,
        photo: true,
        location: true,
      },
      probabilityThreshold: 20,
      dateRange: {
        start: null,
        end: null,
      },
    };
    
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setActiveFiltersCount(0);
    setIsOpen(false);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-black/40 border-projectx-deep-blue/40 hover:bg-black/60"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtri
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-2 bg-projectx-blue text-xs h-5 min-w-5 flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4 bg-black/80 backdrop-blur-md border-projectx-deep-blue/40">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Filtri Mappa</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2 text-xs"
            >
              <FilterX className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Tipo di Indizi</h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-text"
                  checked={filters.clueTypes.text}
                  onCheckedChange={(checked) => {
                    handleFilterChange({
                      ...filters,
                      clueTypes: {
                        ...filters.clueTypes,
                        text: checked === true,
                      },
                    });
                  }}
                />
                <label
                  htmlFor="filter-text"
                  className="text-sm flex items-center cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2 text-gray-400" />
                  Indizi testuali
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-photo"
                  checked={filters.clueTypes.photo}
                  onCheckedChange={(checked) => {
                    handleFilterChange({
                      ...filters,
                      clueTypes: {
                        ...filters.clueTypes,
                        photo: checked === true,
                      },
                    });
                  }}
                />
                <label
                  htmlFor="filter-photo"
                  className="text-sm flex items-center cursor-pointer"
                >
                  <Image className="h-4 w-4 mr-2 text-gray-400" />
                  Indizi fotografici
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-location"
                  checked={filters.clueTypes.location}
                  onCheckedChange={(checked) => {
                    handleFilterChange({
                      ...filters,
                      clueTypes: {
                        ...filters.clueTypes,
                        location: checked === true,
                      },
                    });
                  }}
                />
                <label
                  htmlFor="filter-location"
                  className="text-sm flex items-center cursor-pointer"
                >
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  Luoghi di interesse
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4 text-gray-400" />
              <h4 className="text-sm font-medium">Probabilità minima</h4>
            </div>
            
            <div className="px-2">
              <Slider
                value={[filters.probabilityThreshold]}
                min={0}
                max={100}
                step={10}
                onValueChange={([val]) => {
                  handleFilterChange({
                    ...filters,
                    probabilityThreshold: val,
                  });
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>{filters.probabilityThreshold}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-800">
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
            >
              Applica Filtri
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
