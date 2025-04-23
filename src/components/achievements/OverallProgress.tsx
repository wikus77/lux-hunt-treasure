
import { Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressBar from "./ProgressBar";
import { useBuzzClues } from "@/hooks/useBuzzClues";

interface OverallProgressProps {
  onResetAchievements: () => void;
}

const OverallProgress = ({ onResetAchievements }: OverallProgressProps) => {
  const { unlockedClues, MAX_CLUES } = useBuzzClues();

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Medal className="w-5 h-5 text-projectx-gold" /> Progresso Complessivo
        </h2>
        <span className="text-sm text-white/70">
          {unlockedClues} / {MAX_CLUES} sbloccati
        </span>
      </div>
      
      <ProgressBar 
        value={unlockedClues} 
        max={MAX_CLUES} 
        size="lg" 
        colorClass="bg-gradient-to-r from-projectx-blue via-projectx-pink to-projectx-blue"
      />
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onResetAchievements}
          className="text-xs"
        >
          Azzera Traguardi
        </Button>
      </div>
    </div>
  );
};

export default OverallProgress;
