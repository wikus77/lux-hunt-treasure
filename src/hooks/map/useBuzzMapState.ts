
import { useState, useCallback } from 'react';
import { BuzzMapArea } from '../useBuzzMapLogic';

export const useBuzzMapState = () => {
  const [currentWeekAreas, setCurrentWeekAreas] = useState<BuzzMapArea[]>([]);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const getActiveArea = useCallback((): BuzzMapArea | null => {
    return currentWeekAreas.length > 0 ? currentWeekAreas[0] : null;
  }, [currentWeekAreas]);

  const forceUpdate = useCallback(() => {
    setForceUpdateCounter(prev => prev + 1);
  }, []);

  return {
    currentWeekAreas,
    setCurrentWeekAreas,
    forceUpdateCounter,
    isGenerating,
    setIsGenerating,
    getActiveArea,
    forceUpdate
  };
};
