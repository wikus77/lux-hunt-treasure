
import { useEffect, useCallback } from 'react';
import { DynamicIsland } from '@/plugins/dynamic-island';
import { useAuth } from '@/hooks/useAuth';

interface MissionData {
  missionId: string;
  timeLeft: number;
  progress: number;
  status?: string;
}

export const useDynamicIsland = () => {
  const { user } = useAuth();
  
  const startMissionActivity = useCallback(async (data: MissionData) => {
    try {
      const result = await DynamicIsland.startActivity({
        type: 'mission',
        data
      });
      console.log('Dynamic Island activity started:', result);
      return result.success;
    } catch (error) {
      console.error('Failed to start Dynamic Island activity:', error);
      return false;
    }
  }, []);
  
  const updateMissionActivity = useCallback(async (data: Omit<MissionData, 'missionId'> & { missionId: string }) => {
    try {
      const result = await DynamicIsland.updateActivity(data);
      console.log('Dynamic Island activity updated:', result);
      return result.success;
    } catch (error) {
      console.error('Failed to update Dynamic Island activity:', error);
      return false;
    }
  }, []);
  
  const endMissionActivity = useCallback(async (missionId: string) => {
    try {
      const result = await DynamicIsland.endActivity({ missionId });
      console.log('Dynamic Island activity ended:', result);
      return result.success;
    } catch (error) {
      console.error('Failed to end Dynamic Island activity:', error);
      return false;
    }
  }, []);
  
  return {
    startMissionActivity,
    updateMissionActivity,
    endMissionActivity
  };
};
