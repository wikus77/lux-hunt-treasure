// M1SSION™ - Enhanced Navigation Hook for iOS Capacitor
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useNavigationStore } from '@/stores/navigationStore';
import { usePWAHardwareStub } from './usePWAHardwareStub';
import { pwaNavigationHandler, preserveFunctionName } from '@/utils/pwaStubs';

export const useEnhancedNavigation = () => {
  const { navigate, currentPath: location } = useWouterNavigation();
  const { isPWA, triggerHaptic } = usePWAHardwareStub();
  const { setCurrentTab, addToHistory, goBack } = useNavigationStore();

  // Enhanced navigation with haptic feedback and iOS optimizations
  const navigateWithFeedback = preserveFunctionName(
    async (path: string, options?: { replace?: boolean; haptic?: boolean }) => {
      console.log('🧭 Enhanced navigation to:', path);
      
      // Haptic feedback on navigation
      if (options?.haptic !== false) {
        await triggerHaptic('tick');
      }
      
      // Update store
      setCurrentTab(path);
      addToHistory(path);
      
      // Navigate using Wouter
      navigate(path, options);
      
      // PWA scroll fix
      if (isPWA) {
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
      if (options?.haptic !== false) {
        await triggerHaptic('selection');
      }
      
      // Use browser's native back navigation for better UX
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
        
        // PWA scroll fix
        if (isPWA) {
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 100);
        }
        
        return true;
      } else {
        // Fallback to home if no history
        navigate('/home');
        return '/home';
      }
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
    isPWA,
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