
import { FileSearch } from "lucide-react";

interface EventsHeaderProps {
  unlockedClues: number;
  maxClues: number;
}

const EventsHeader = ({ unlockedClues, maxClues }: EventsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <FileSearch className="w-6 h-6 text-projectx-blue" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-projectx-blue to-projectx-pink bg-clip-text text-transparent">
          I miei indizi
        </h1>
      </div>
      <div className="text-sm px-3 py-1 rounded-full bg-projectx-deep-blue/50 backdrop-blur-sm border border-projectx-blue/20">
        <span className="text-projectx-blue font-mono">
          {unlockedClues} / {maxClues} 
        </span>
        <span className="text-gray-400 ml-1">sbloccati</span>
      </div>
    </div>
  );
};

export default EventsHeader;
