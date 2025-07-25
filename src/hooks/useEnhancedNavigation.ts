// M1SSION™ - Enhanced Navigation Hook for iOS Capacitor
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useNavigationStore } from '@/stores/navigationStore';
import { useCapacitorHardware } from './useCapacitorHardware';
import { explicitNavigationHandler, preserveFunctionName } from '@/utils/iosCapacitorFunctions';

export const useEnhancedNavigation = () => {
  const { navigate, currentPath: location } = useWouterNavigation();
  const { isCapacitor, vibrate } = useCapacitorHardware();
  const { setCurrentTab, addToHistory, goBack } = useNavigationStore();

  // Enhanced navigation with haptic feedback and iOS optimizations
  const navigateWithFeedback = preserveFunctionName(
    async (path: string, options?: { replace?: boolean; haptic?: boolean }) => {
      console.log('🧭 Enhanced navigation to:', path);
      
      // Haptic feedback on navigation (iOS)
      if (options?.haptic !== false && isCapacitor) {
        await vibrate(50);
      }
      
      // Update store
      setCurrentTab(path);
      addToHistory(path);
      
      // Navigate using Wouter
      navigate(path, options);
      
      // iOS scroll fix
      if (isCapacitor) {
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    },
    'navigateWithFeedback'
  );

  // Back navigation with explicit function name
  const goBackWithFeedback = preserveFunctionName(
    async (options?: { haptic?: boolean }) => {
      console.log('🧭 Enhanced back navigation');
      
      // Haptic feedback
      if (options?.haptic !== false && isCapacitor) {
        await vibrate(30);
      }
      
      const previousPath = goBack();
      if (previousPath) {
        navigate(previousPath);
        
        // iOS scroll fix
        if (isCapacitor) {
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 100);
        }
      }
      
      return previousPath;
    },
    'goBackWithFeedback'
  );

  // Quick navigation shortcuts with explicit names
  const navigationShortcuts = {
    toHome: preserveFunctionName(() => navigateWithFeedback('/home'), 'toHome'),
    toMap: preserveFunctionName(() => navigateWithFeedback('/map'), 'toMap'),
    toBuzz: preserveFunctionName(() => navigateWithFeedback('/buzz'), 'toBuzz'),
    toGames: preserveFunctionName(() => navigateWithFeedback('/games'), 'toGames'),
    toProfile: preserveFunctionName(() => navigateWithFeedback('/profile'), 'toProfile'),
    toSettings: preserveFunctionName(() => navigateWithFeedback('/settings'), 'toSettings'),
    toNotifications: preserveFunctionName(() => navigateWithFeedback('/notifications'), 'toNotifications'),
    toLeaderboard: preserveFunctionName(() => navigateWithFeedback('/leaderboard'), 'toLeaderboard'),
  };

  // Tab detection with explicit function name
  const getCurrentTab = preserveFunctionName((): string => {
    const path = location;
    
    // Map complex paths to simple tab names
    if (path.startsWith('/home')) return 'home';
    if (path.startsWith('/map')) return 'map';
    if (path.startsWith('/buzz')) return 'buzz';
    if (path.startsWith('/games')) return 'games';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/notifications')) return 'notifications';
    if (path.startsWith('/leaderboard')) return 'leaderboard';
    
    return 'home'; // Default fallback
  }, 'getCurrentTab');

  // Navigation state with explicit getters
  const navigationState = {
    currentPath: location,
    currentTab: getCurrentTab(),
    isCapacitor,
    canGoBack: window.history.length > 1,
  };

  return {
    // Core navigation
    navigateWithFeedback,
    goBackWithFeedback,
    
    // Shortcuts
    ...navigationShortcuts,
    
    // State
    ...navigationState,
    
    // Utilities
    getCurrentTab,
  };
};