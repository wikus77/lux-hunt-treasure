
import { useCallback, useState } from "react";

interface ActivityData {
  missionId: string;
  title: string;
  status: string;
  progress: number;
  timeLeft: string;
}

export function useDynamicIsland() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityData | null>(null);

  const startActivity = useCallback((data: ActivityData) => {
    console.log("Starting Dynamic Island activity:", data);
    setCurrentActivity(data);
    setIsVisible(true);
  }, []);

  const updateActivity = useCallback((data: Partial<ActivityData>) => {
    console.log("Updating Dynamic Island activity:", data);
    setCurrentActivity(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const endActivity = useCallback(() => {
    console.log("Ending Dynamic Island activity");
    setCurrentActivity(null);
    setIsVisible(false);
  }, []);

  const showIsland = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideIsland = useCallback(() => {
    setIsVisible(false);
  }, []);

  return { 
    startActivity, 
    updateActivity, 
    endActivity, 
    showIsland, 
    hideIsland,
    isVisible,
    currentActivity
  };
}
