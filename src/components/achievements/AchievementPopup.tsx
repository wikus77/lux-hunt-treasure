
import { useEffect, useRef, useState } from "react";
import { Achievement } from "@/data/achievementsData";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import useSoundEffects from "@/hooks/use-sound-effects";

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
  onAutoClose?: () => void;
  autoCloseDelay?: number;
}

const AchievementPopup = ({ 
  achievement, 
  onClose, 
  onAutoClose,
  autoCloseDelay = 5000 
}: AchievementPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const { playSound } = useSoundEffects();
  const timerRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (achievement) {
      playSound("chime");
      setIsVisible(true);
      
      if (autoCloseDelay > 0) {
        timerRef.current = window.setTimeout(() => {
          handleClose(true);
        }, autoCloseDelay);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [achievement, autoCloseDelay, playSound]);
  
  const handleClose = (isAutoClose = false) => {
    setIsFadingOut(true);
    
    setTimeout(() => {
      setIsVisible(false);
      setIsFadingOut(false);
      if (isAutoClose && onAutoClose) {
        onAutoClose();
      } else {
        onClose();
      }
    }, 300);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
  
  if (!achievement || !isVisible) return null;
  
  const Icon = achievement.iconComponent;
  
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div 
        className={cn(
          "bg-black/80 border w-[90%] max-w-sm p-6 rounded-xl shadow-2xl transition-all duration-300 transform",
          achievement.badgeColor ? `border-[3px] border-[${achievement.badgeColor}]` : "border-projectx-blue",
          isFadingOut ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}
      >
        <button 
          onClick={() => handleClose()}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center justify-center">
          <div className="text-center mb-6 mt-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Traguardo Sbloccato!
            </h3>
          </div>
          
          <div 
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mb-6",
              achievement.badgeColor || "bg-gradient-to-r from-projectx-blue to-projectx-pink"
            )}
          >
            <Icon className="w-12 h-12 text-white" />
          </div>
          
          <h4 className="text-xl font-bold mb-2">{achievement.title}</h4>
          <p className="text-white/80 text-center mb-6">{achievement.description}</p>
          
          <div className="w-full flex justify-center">
            <Button onClick={() => handleClose()} className="px-8">
              Fantastico!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementPopup;
