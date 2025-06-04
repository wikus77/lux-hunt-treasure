
import { useState, useCallback } from 'react';

interface DynamicIslandActivity {
  missionId: string;
  title: string;
  status: string;
  progress: number;
  timeLeft: number;
}

export const useDynamicIsland = () => {
  const [activity, setActivity] = useState<DynamicIslandActivity | null>(null);
  const [isActive, setIsActive] = useState(false);

  const startActivity = useCallback(async (newActivity: DynamicIslandActivity) => {
    setActivity(newActivity);
    setIsActive(true);
    return Promise.resolve();
  }, []);

  const updateActivity = useCallback(async (updates: Partial<DynamicIslandActivity>) => {
    setActivity(prev => prev ? { ...prev, ...updates } : null);
    return Promise.resolve();
  }, []);

  const endActivity = useCallback(async () => {
    setIsActive(false);
    setTimeout(() => setActivity(null), 500);
    return Promise.resolve();
  }, []);

  return {
    activity,
    isActive,
    startActivity,
    updateActivity,
    endActivity,
  };
};
