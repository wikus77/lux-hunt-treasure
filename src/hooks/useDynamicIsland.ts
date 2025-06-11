import { useState, useEffect } from 'react';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { useDynamicIslandSafety } from '@/hooks/useDynamicIslandSafety';
import { useAuthContext } from '@/contexts/auth';

interface IslandState {
  isVisible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export const useDynamicIsland = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [islandState, setIslandState] = useState<IslandState>({
    isVisible: false,
    message: '',
    type: 'info',
  });
  const { playNotificationSound } = useSoundEffects();
  const { performSafetyChecks } = useDynamicIslandSafety();

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

  useEffect(() => {
    if (isAuthenticated && user) {
      performSafetyChecks();
    }
  }, [isAuthenticated, user]);

  return {
    islandState,
    showIsland,
    hideIsland,
  };
};
