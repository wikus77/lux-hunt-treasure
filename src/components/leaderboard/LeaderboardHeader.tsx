
import React from 'react';
import { Award } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { LeaderboardFilters } from './LeaderboardFilters';
import { CalendarDays } from 'lucide-react';

interface LeaderboardHeaderProps {
  onSimulateRankChange: () => void;
  onFilterChange: (filter: 'all' | 'team' | 'country' | '7days') => void;
}

export const LeaderboardHeader = ({ onSimulateRankChange, onFilterChange }: LeaderboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            M1SSION<span className="text-xs align-top">™</span>
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-500" />
          <p className="text-cyan-400 text-lg font-light tracking-wider">CLASSIFICA</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <LeaderboardFilters onFilterChange={onFilterChange} />
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-black/40 border-white/10"
          onClick={onSimulateRankChange}
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          SIMULA
        </Button>
      </div>
    </div>
  );
};
