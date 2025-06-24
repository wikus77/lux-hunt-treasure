
import { useState, useEffect } from 'react';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { useDynamicIslandSafety } from '@/hooks/useDynamicIslandSafety';
import { useAuthContext } from '@/contexts/auth';

interface IslandState {
  isVisible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ActivityData {
  missionId?: string;
  title: string;
  status: string;
  progress?: number;
  timeLeft?: number;
}

export const useDynamicIsland = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [islandState, setIslandState] = useState<IslandState>({
    isVisible: false,
    message: '',
    type: 'info',
  });
  const { playSound } = useSoundEffects();
  const { isBuzzSafe } = useDynamicIslandSafety();

  const playNotificationSound = (type: IslandState['type']) => {
    // Map notification types to available sound types
    switch (type) {
      case 'success':
        playSound('buzz');
        break;
      case 'error':
        playSound('buzz'); // Using buzz as fallback
        break;
      default:
        playSound('buzz');
        break;
    }
  };

  const performSafetyChecks = () => {
    // Basic safety check implementation
    console.log('🔒 Dynamic Island safety checks performed');
    return isBuzzSafe.isSafe;
  };

  const showIsland = (message: string, type: IslandState['type']) => {
    if (!isAuthenticated || !user) {
      console.warn("Dynamic Island: User not authenticated, skipping island display");
      return;
    }

    setIslandState({
      isVisible: true,
      message: message,
      type: type,
    });
    playNotificationSound(type);

    // Hide the island after 5 seconds
    setTimeout(() => {
      hideIsland();
    }, 5000);
  };

  const hideIsland = () => {
    setIslandState({
      ...islandState,
      isVisible: false,
    });
  };

  // Added missing activity management methods
  const startActivity = (data: ActivityData) => {
    console.log('🚀 Starting Dynamic Island activity:', data.title);
    showIsland(data.title, 'info');
  };

  const updateActivity = (data: Partial<ActivityData>) => {
    console.log('🔄 Updating Dynamic Island activity:', data);
    if (data.status) {
      showIsland(data.status, 'info');
    }
  };

  const endActivity = () => {
    console.log('🏁 Ending Dynamic Island activity');
    hideIsland();
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      performSafetyChecks();
    }
  }, [isAuthenticated, user]);

  return {
    islandState,
    showIsland,
    hideIsland,
    playNotificationSound,
    performSafetyChecks,
    startActivity,
    updateActivity,
    endActivity
  };
};
