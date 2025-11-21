
import React from 'react';
import { Filter, Users, Map } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface LeaderboardFiltersProps {
  onFilterChange: (filter: 'all' | 'team' | 'country') => void;
}

export const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({ onFilterChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-black/40 border-white/10">
          <Filter className="h-4 w-4 mr-2" />
          Filtri
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-black/90 border-white/10">
        <DropdownMenuLabel>Filtra per</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem 
          className="hover:bg-white/10 cursor-pointer"
          onClick={() => onFilterChange('all')}
        >
          <Filter className="h-4 w-4 mr-2" />
          Tutti
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="hover:bg-white/10 cursor-pointer"
          onClick={() => onFilterChange('team')}
        >
          <Users className="h-4 w-4 mr-2" />
          La mia squadra
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="hover:bg-white/10 cursor-pointer"
          onClick={() => onFilterChange('country')}
        >
          <Map className="h-4 w-4 mr-2" />
          Il mio paese
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
