// ✅ Fix UI chirurgico firmato esclusivamente BY JOSEPH MULE — M1SSION™
import { useEffect } from 'react';

interface UseMapPageEffectsProps {
  mapPoints: any[];
  searchAreas: any[];
  currentMission: any;
  updateMissionProgress: (clues: number) => void;
  updateActivity: (activity: { status: string }) => void;
}

export const useMapPageEffects = ({
  mapPoints,
  searchAreas,
  currentMission,
  updateMissionProgress,
  updateActivity,
}: UseMapPageEffectsProps) => {
  // Dynamic Island integration for MAP - Update when new clues found or areas explored
  useEffect(() => {
    if (currentMission && currentMission.status === 'active') {
      const cluesFound = mapPoints.filter(point => 
        point.title.toLowerCase().includes('indizio') || 
        point.title.toLowerCase().includes('clue')
      ).length;
      
      if (cluesFound !== currentMission.foundClues) {
        updateMissionProgress(cluesFound);
      }
    }
  }, [mapPoints, currentMission, updateMissionProgress]);

  // Update Dynamic Island when search areas change
  useEffect(() => {
    if (searchAreas.length > 0 && currentMission?.status === 'active') {
      updateActivity({
        status: `${searchAreas.length} zone esplorate`,
      });
    }
  }, [searchAreas, updateActivity, currentMission]);

  // Cleanup when leaving map page
  useEffect(() => {
    return () => {
      // Keep Live Activity running, don't close on page change
      console.log('🗺️ Leaving map page, keeping Live Activity active');
    };
  }, []);
};
