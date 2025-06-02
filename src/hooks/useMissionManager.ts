
import { useState, useEffect } from 'react';
import { useDynamicIsland } from '@/hooks/useDynamicIsland';

interface Mission {
  id: string;
  name: string;
  progress: number;
  timeLeft: number;
  totalClues: number;
  foundClues: number;
  status: 'active' | 'completed' | 'expired';
}

export const useMissionManager = () => {
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const { startActivity, updateActivity, endActivity } = useDynamicIsland();

  // Initialize with mock mission data - in real app this would come from Supabase
  useEffect(() => {
    const mockMission: Mission = {
      id: 'mission-1',
      name: 'Operazione Milano',
      progress: 45,
      timeLeft: 7200, // 2 hours
      totalClues: 10,
      foundClues: 4,
      status: 'active'
    };
    
    setCurrentMission(mockMission);
  }, []);

  // Auto-close Dynamic Island when mission is completed or expired
  useEffect(() => {
    if (currentMission && (currentMission.status === 'completed' || currentMission.status === 'expired')) {
      endActivity();
    }
  }, [currentMission, endActivity]);

  // Countdown timer for active mission
  useEffect(() => {
    if (!currentMission || currentMission.status !== 'active') return;

    const timer = setInterval(() => {
      setCurrentMission(prev => {
        if (!prev || prev.timeLeft <= 0) {
          return prev ? { ...prev, status: 'expired' } : null;
        }

        const newTimeLeft = prev.timeLeft - 1;
        
        // Update Dynamic Island with remaining time
        updateActivity({
          status: `Tempo rimasto: ${Math.floor(newTimeLeft / 3600)}h ${Math.floor((newTimeLeft % 3600) / 60)}m`,
          timeLeft: newTimeLeft,
        });

        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentMission, updateActivity]);

  const updateMissionProgress = (foundClues: number) => {
    if (!currentMission) return;

    const newProgress = Math.round((foundClues / currentMission.totalClues) * 100);
    const updatedMission = {
      ...currentMission,
      foundClues,
      progress: newProgress,
      status: foundClues >= currentMission.totalClues ? 'completed' as const : 'active' as const
    };

    setCurrentMission(updatedMission);

    // Update Dynamic Island
    updateActivity({
      status: `Indizi trovati: ${foundClues}/${currentMission.totalClues}`,
      progress: newProgress,
    });
  };

  const completeMission = () => {
    if (!currentMission) return;

    setCurrentMission(prev => prev ? { ...prev, status: 'completed', progress: 100 } : null);
    
    // Update Dynamic Island one last time before closing
    updateActivity({
      status: "Missione completata!",
      progress: 100,
    });

    // Close after a brief delay
    setTimeout(() => {
      endActivity();
    }, 3000);
  };

  return {
    currentMission,
    updateMissionProgress,
    completeMission,
  };
};
