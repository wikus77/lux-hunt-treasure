
import { useState, useEffect } from 'react';
import { useDynamicIsland } from './useDynamicIsland';

interface Mission {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'inactive';
  progress: number;
  timeLeft: number;
  foundClues?: number;
}

export const useMissionManager = () => {
  const { startActivity, updateActivity, endActivity } = useDynamicIsland();
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);

  const updateMissionProgress = (cluesFound: number) => {
    if (currentMission) {
      const updatedMission = { ...currentMission, foundClues: cluesFound };
      setCurrentMission(updatedMission);
      updateActivity({
        status: `${cluesFound} indizi trovati`,
        progress: (cluesFound / 10) * 100 // Assuming 10 total clues
      });
    }
  };

  return {
    currentMission,
    updateMissionProgress,
    startActivity,
    updateActivity,
    endActivity
  };
};
