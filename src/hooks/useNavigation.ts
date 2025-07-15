// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ - Custom Navigation Hook (Capacitor iOS Compatible)
import { useCallback } from 'react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useCapacitorHardware } from './useCapacitorHardware';

export const useNavigation = () => {
  const { 
    currentPage, 
    history, 
    setCurrentPage, 
    addToHistory, 
    goBack,
    clearHistory,
    isCapacitor,
    setCapacitorMode 
  } = useNavigationStore();
  
  const { vibrate } = useCapacitorHardware();

  // Enhanced navigation with haptic feedback
  const navigateTo = useCallback(async (path: string, options?: { replace?: boolean; haptic?: boolean }) => {
    console.log('🧭 Navigation to:', path);
    
    // Haptic feedback on navigation (iOS)
    if (options?.haptic !== false && isCapacitor) {
      await vibrate(50);
    }
    
    // Update store
    setCurrentPage(path);
    if (!options?.replace) {
      addToHistory(path);
    }
    
    // iOS scroll fix
    if (isCapacitor) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  }, [setCurrentPage, addToHistory, isCapacitor, vibrate]);

  // Back navigation with haptic feedback
  const goBackWithFeedback = useCallback(async (options?: { haptic?: boolean }) => {
    console.log('🧭 Back navigation');
    
    // Haptic feedback
    if (options?.haptic !== false && isCapacitor) {
      await vibrate(30);
    }
    
    const previousPage = goBack();
    if (previousPage && isCapacitor) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
    
    return previousPage;
  }, [goBack, isCapacitor, vibrate]);

  // Quick navigation shortcuts
  const navigationShortcuts = {
    toHome: useCallback(() => navigateTo('/home'), [navigateTo]),
    toMap: useCallback(() => navigateTo('/map'), [navigateTo]),
    toBuzz: useCallback(() => navigateTo('/buzz'), [navigateTo]),
    toGames: useCallback(() => navigateTo('/games'), [navigateTo]),
    toProfile: useCallback(() => navigateTo('/profile'), [navigateTo]),
    toSettings: useCallback(() => navigateTo('/settings'), [navigateTo]),
    toNotifications: useCallback(() => navigateTo('/notifications'), [navigateTo]),
    toLeaderboard: useCallback(() => navigateTo('/leaderboard'), [navigateTo]),
    toSubscriptions: useCallback(() => navigateTo('/subscriptions'), [navigateTo]),
    toLogin: useCallback(() => navigateTo('/login'), [navigateTo]),
    toRegister: useCallback(() => navigateTo('/register'), [navigateTo]),
  };

  // Tab detection
  const getCurrentTab = useCallback((): string => {
    if (currentPage.startsWith('/home')) return 'home';
    if (currentPage.startsWith('/map')) return 'map';
    if (currentPage.startsWith('/buzz')) return 'buzz';
    if (currentPage.startsWith('/games')) return 'games';
    if (currentPage.startsWith('/profile')) return 'profile';
    if (currentPage.startsWith('/settings')) return 'settings';
    if (currentPage.startsWith('/notifications')) return 'notifications';
    if (currentPage.startsWith('/leaderboard')) return 'leaderboard';
    if (currentPage.startsWith('/subscriptions')) return 'subscriptions';
    
    return 'home'; // Default fallback
  }, [currentPage]);

  return {
    // Core navigation
    navigateTo,
    goBack: goBackWithFeedback,
    
    // Shortcuts
    ...navigationShortcuts,
    
    // State
    currentPage,
    history,
    currentTab: getCurrentTab(),
    isCapacitor,
    canGoBack: history.length > 1,
    
    // Utilities
    getCurrentTab,
    clearHistory,
    setCapacitorMode,
  };
};