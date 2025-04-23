
import { useMemo } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import ProgressBar from "./ProgressBar";
import AchievementBadge from "./AchievementBadge";
import { Trophy, Star, Award, Medal } from "lucide-react";

interface AchievementsDashboardProps {
  className?: string;
  compact?: boolean;
}

const AchievementsDashboard = ({ className = "", compact = false }: AchievementsDashboardProps) => {
  const { achievements } = useAchievements();
  const { unlockedClues, MAX_CLUES } = useBuzzClues();
  
  // Calculate overall progress percentage
  const progressPercentage = useMemo(() => {
    return Math.min(100, Math.round((unlockedClues / MAX_CLUES) * 100));
  }, [unlockedClues, MAX_CLUES]);
  
  // Count unlocked achievements by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number, unlocked: number }> = {
      luoghi: { total: 0, unlocked: 0 },
      auto: { total: 0, unlocked: 0 },
      foto: { total: 0, unlocked: 0 },
      detective: { total: 0, unlocked: 0 },
      completamento: { total: 0, unlocked: 0 }
    };
    
    achievements.forEach(achievement => {
      counts[achievement.category].total++;
      if (achievement.isUnlocked) {
        counts[achievement.category].unlocked++;
      }
    });
    
    return counts;
  }, [achievements]);
  
  // Get the latest unlocked achievements
  const latestAchievements = useMemo(() => {
    return achievements
      .filter(a => a.isUnlocked && a.unlockedAt)
      .sort((a, b) => {
        const dateA = new Date(a.unlockedAt || "");
        const dateB = new Date(b.unlockedAt || "");
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, compact ? 3 : 5);
  }, [achievements, compact]);
  
  // Count total unlocked achievements
  const totalUnlocked = useMemo(() => {
    return achievements.filter(a => a.isUnlocked).length;
  }, [achievements]);
  
  return (
    <div className={`glass-card p-4 ${className}`}>
      {/* Main Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-projectx-gold" /> 
            Progresso Missione
          </h3>
          <span className="text-sm text-white/60">
            {unlockedClues} / {MAX_CLUES} indizi
          </span>
        </div>
        <ProgressBar 
          value={unlockedClues} 
          max={MAX_CLUES} 
          size="lg" 
          colorClass="bg-gradient-to-r from-projectx-blue via-projectx-pink to-projectx-blue"
        />
        
        {!compact && (
          <p className="text-sm text-white/70 mt-2">
            {progressPercentage < 25 && "Hai appena iniziato la tua avventura!"}
            {progressPercentage >= 25 && progressPercentage < 50 && "Stai facendo progressi! Continua così."}
            {progressPercentage >= 50 && progressPercentage < 75 && "Sei a metà strada! Il mistero inizia a svelarsi."}
            {progressPercentage >= 75 && progressPercentage < 100 && "Ci sei quasi! Ancora pochi indizi."}
            {progressPercentage === 100 && "Hai completato la missione! Sei un vero detective."}
          </p>
        )}
      </div>
      
      {/* Achievements Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-bold flex items-center">
            <Medal className="mr-2 h-5 w-5 text-projectx-gold" /> 
            Traguardi Sbloccati
          </h3>
          <span className="text-sm text-white/60">
            {totalUnlocked} / {achievements.length}
          </span>
        </div>
        
        <ProgressBar 
          value={totalUnlocked} 
          max={achievements.length} 
          colorClass="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
        />
      </div>
      
      {/* Categories Progress */}
      {!compact && (
        <div className="mb-6 space-y-3">
          <h3 className="text-md font-bold flex items-center">
            <Star className="mr-2 h-5 w-5 text-yellow-300" /> 
            Progresso per Categoria
          </h3>
          
          <div className="grid grid-cols-1 gap-y-3">
            {Object.entries(categoryCounts).map(([category, { total, unlocked }]) => (
              <div key={category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="capitalize">{category}</span>
                  <span>{unlocked}/{total}</span>
                </div>
                <ProgressBar 
                  value={unlocked} 
                  max={total} 
                  size="sm" 
                  showPercentage={false}
                  colorClass={
                    category === "luoghi" ? "bg-gradient-to-r from-blue-400 to-blue-600" :
                    category === "auto" ? "bg-gradient-to-r from-red-400 to-red-600" :
                    category === "foto" ? "bg-gradient-to-r from-purple-400 to-purple-600" :
                    category === "detective" ? "bg-gradient-to-r from-green-400 to-green-600" :
                    "bg-gradient-to-r from-amber-400 to-amber-600"
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recent Achievements */}
      {latestAchievements.length > 0 && (
        <div>
          <h3 className="text-md font-bold flex items-center mb-3">
            <Award className="mr-2 h-5 w-5 text-projectx-pink" /> 
            Ultimi Traguardi
          </h3>
          
          <div className="flex flex-wrap gap-4 justify-center">
            {latestAchievements.map((achievement) => (
              <AchievementBadge 
                key={achievement.id} 
                achievement={achievement}
                size={compact ? "sm" : "md"}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsDashboard;
