
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface LeaderboardSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const LeaderboardSearch = ({ value, onChange }: LeaderboardSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        className="pl-10 bg-black/60 border-cyan-800/30 focus:border-cyan-400/50 rounded-lg"
        placeholder="Cerca giocatore..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
