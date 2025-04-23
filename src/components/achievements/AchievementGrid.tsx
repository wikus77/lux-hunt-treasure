
import { Star } from "lucide-react";
import { Achievement } from "@/data/achievementsData";
import AchievementBadge from "./AchievementBadge";

interface AchievementGridProps {
  achievements: Achievement[];
  onAchievementClick: (achievement: Achievement) => void;
}

const AchievementGrid = ({ achievements, onAchievementClick }: AchievementGridProps) => {
  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-300" /> Collezione Traguardi
        </h2>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            size="md"
            onClick={() => onAchievementClick(achievement)}
            className="mx-auto"
          />
        ))}
        
        {achievements.length === 0 && (
          <div className="col-span-full py-8 text-center">
            <p className="text-white/60">Nessun traguardo in questa categoria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementGrid;
