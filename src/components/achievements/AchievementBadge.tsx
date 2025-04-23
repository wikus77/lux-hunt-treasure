
import { useState } from "react";
import { Achievement } from "@/data/achievementsData";
import { cn } from "@/lib/utils";
import { useSound } from "@/contexts/SoundContext";
import useSoundEffects from "@/hooks/use-sound-effects";

interface AchievementBadgeProps {
  achievement: Achievement;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

const AchievementBadge = ({ 
  achievement, 
  onClick, 
  size = "md",
  showTooltip = true,
  className = ""
}: AchievementBadgeProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const { playSound } = useSoundEffects();
  
  // Size classes
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20"
  };
  
  const iconSizeClasses = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10"
  };
  
  const handleClick = () => {
    if (onClick) {
      playSound("chime");
      onClick();
    }
  };

  return (
    <div 
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full p-1 cursor-pointer transition-all duration-300",
          sizeClasses[size],
          achievement.isUnlocked 
            ? `${achievement.badgeColor} shadow-lg` 
            : "bg-black/40 border border-white/10 grayscale"
        )}
        onClick={handleClick}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-2 transition-all",
            iconSizeClasses[size],
            achievement.isUnlocked 
              ? "border-white/30 text-white" 
              : "border-gray-600 text-gray-500"
          )}
        >
          <achievement.iconComponent />
        </div>
      </div>

      {/* Achievement glowing ring for unlocked badges */}
      {achievement.isUnlocked && (
        <div 
          className={cn(
            "absolute inset-0 -z-10 rounded-full blur-md opacity-50",
            achievement.badgeColor
          )}
        />
      )}
      
      {/* Tooltip */}
      {showTooltip && isHovering && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 z-50 w-max max-w-[200px] bg-black/90 border border-white/10 p-2 rounded-md shadow-xl">
          <p className="text-sm font-medium mb-1">{achievement.title}</p>
          <p className="text-xs text-white/70">{achievement.description}</p>
          {achievement.isUnlocked && achievement.unlockedAt && (
            <p className="text-xs text-projectx-blue mt-1">
              Sbloccato il {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
