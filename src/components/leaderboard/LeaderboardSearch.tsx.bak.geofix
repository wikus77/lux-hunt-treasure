
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useDebounce } from '@/hooks/useDebounce';

interface LeaderboardSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const LeaderboardSearch = ({ value, onChange }: LeaderboardSearchProps) => {
  const [searchInput, setSearchInput] = React.useState(value);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update parent when debounced value changes
  React.useEffect(() => {
    onChange(debouncedSearch);
  }, [debouncedSearch, onChange]);

  // Sync with external value changes
  React.useEffect(() => {
    setSearchInput(value);
  }, [value]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        className="pl-10 bg-black/60 border-cyan-800/30 focus:border-cyan-400/50 rounded-lg"
        placeholder="Cerca giocatore..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
    </div>
  );
};
