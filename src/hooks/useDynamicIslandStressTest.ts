
import { useState } from 'react';
import { useDynamicIsland } from './useDynamicIsland';

export const useDynamicIslandStressTest = () => {
  const { showIsland, hideIsland } = useDynamicIsland();
  const [isTestRunning, setIsTestRunning] = useState(false);

  const startActivity = (mission: string) => {
    console.log('🚀 Starting activity:', mission);
    showIsland(`Mission started: ${mission}`, 'info');
  };

  const endActivity = () => {
    console.log('🏁 Ending activity');
    hideIsland();
    setIsTestRunning(false);
  };

  const runStressTest = () => {
    setIsTestRunning(true);
    
    // Simulate various island states
    setTimeout(() => showIsland('Test message 1', 'info'), 1000);
    setTimeout(() => showIsland('Test message 2', 'success'), 3000);
    setTimeout(() => showIsland('Test message 3', 'warning'), 5000);
    setTimeout(() => showIsland('Test message 4', 'error'), 7000);
    setTimeout(() => {
      endActivity();
    }, 10000);
  };

  return {
    isTestRunning,
    runStressTest,
    startActivity,
    endActivity
  };
};
