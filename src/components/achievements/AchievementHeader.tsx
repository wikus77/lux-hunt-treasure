
import { Trophy } from "lucide-react";
import { useBuzzClues } from "@/hooks/useBuzzClues";

const AchievementHeader = () => {
  const { unlockedClues, MAX_CLUES } = useBuzzClues();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <Trophy className="w-6 h-6 text-projectx-gold" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-projectx-blue to-projectx-pink bg-clip-text text-transparent">
          Traguardi
        </h1>
      </div>
      
      <div className="text-sm px-3 py-1 rounded-full bg-projectx-deep-blue/50 backdrop-blur-sm border border-projectx-blue/20">
        <span className="text-projectx-blue font-mono">
          {unlockedClues} / {MAX_CLUES} 
        </span>
        <span className="text-gray-400 ml-1">indizi sbloccati</span>
      </div>
    </div>
  );
};

export default AchievementHeader;
