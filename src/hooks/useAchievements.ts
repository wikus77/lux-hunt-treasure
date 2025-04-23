
import { useState, useEffect, useCallback } from "react";
import { achievements, Achievement, AchievementCategory } from "@/data/achievementsData";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";
import { cluesCategories } from "@/components/profile/cluesCategories";

const STORAGE_KEY = 'userAchievements';

export const useAchievements = () => {
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const { addNotification } = useNotifications();
  
  // Load achievements from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUserAchievements(JSON.parse(saved));
      } else {
        setUserAchievements(achievements);
      }
    } catch (e) {
      console.error("Failed to load achievements from localStorage", e);
      setUserAchievements(achievements);
    }
  }, []);
  
  // Save achievements to localStorage when they change
  useEffect(() => {
    if (userAchievements.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userAchievements));
      } catch (e) {
        console.error("Failed to save achievements to localStorage", e);
      }
    }
  }, [userAchievements]);
  
  // Check if an achievement is unlocked
  const isAchievementUnlocked = useCallback((id: string) => {
    const achievement = userAchievements.find(a => a.id === id);
    return achievement?.isUnlocked || false;
  }, [userAchievements]);
  
  // Unlock an achievement
  const unlockAchievement = useCallback((id: string) => {
    if (isAchievementUnlocked(id)) return false;
    
    setUserAchievements(prev => 
      prev.map(a => 
        a.id === id 
          ? { 
              ...a, 
              isUnlocked: true, 
              unlockedAt: new Date().toISOString() 
            } 
          : a
      )
    );
    
    const achievement = achievements.find(a => a.id === id);
    if (achievement) {
      // Show a toast notification
      toast.success(`Traguardo Sbloccato: ${achievement.title}`, {
        description: achievement.description,
        duration: 5000,
      });
      
      // Add to notifications system
      addNotification?.({
        title: `Nuovo traguardo: ${achievement.title}`,
        description: achievement.description
      });
    }
    
    return true;
  }, [isAchievementUnlocked, addNotification]);
  
  // Check for achievements based on clue category counts
  const checkCategoryAchievements = useCallback((categoryName: string, count: number) => {
    if (count <= 0) return;
    
    let achievementCategory: AchievementCategory = "detective";
    
    // Map clue category to achievement category
    if (/luoghi|posizione|location|place|dove|map|via|città/i.test(categoryName)) {
      achievementCategory = "luoghi";
    } else if (/auto|car|modello|marca|veicolo|motore|carrozzeria|motori/i.test(categoryName)) {
      achievementCategory = "auto";
    } else if (/interni|interno|abitacolo|sedili|cruscotto|cockpit|dashboard|esterni|esterno|carrozzeria|foto|immagine|scatto|photo|picture/i.test(categoryName)) {
      achievementCategory = "foto";
    }
    
    // Check relevant achievements for this category
    const relevantAchievements = userAchievements.filter(a => 
      a.category === achievementCategory && !a.isUnlocked && a.requiredCount <= count
    );
    
    // Unlock any achievements that meet the criteria
    relevantAchievements.forEach(achievement => {
      unlockAchievement(achievement.id);
    });
  }, [userAchievements, unlockAchievement]);
  
  // Check completion achievements based on overall progress
  const checkCompletionAchievements = useCallback((percentage: number) => {
    if (percentage <= 0) return;
    
    const completionMilestones = [25, 50, 75, 100];
    
    // Check each completion milestone
    completionMilestones.forEach(milestone => {
      if (percentage >= milestone) {
        const achievementId = `completamento-${milestone}`;
        const achievement = userAchievements.find(a => a.id === achievementId);
        
        if (achievement && !achievement.isUnlocked) {
          unlockAchievement(achievementId);
        }
      }
    });
  }, [userAchievements, unlockAchievement]);
  
  // Reset all achievements
  const resetAchievements = useCallback(() => {
    setUserAchievements(achievements.map(a => ({ ...a, isUnlocked: false, unlockedAt: undefined })));
    localStorage.removeItem(STORAGE_KEY);
    toast("Tutti i traguardi sono stati azzerati", { duration: 3000 });
  }, []);
  
  return {
    achievements: userAchievements,
    isAchievementUnlocked,
    unlockAchievement,
    checkCategoryAchievements,
    checkCompletionAchievements,
    resetAchievements
  };
};
