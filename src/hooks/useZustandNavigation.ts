// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Zustand Navigation Hook - iOS Capacitor Compatible

import { useNavigationStore, navigationHelpers } from '@/stores/navigationStore';
import { detectCapacitorEnvironment } from '@/utils/capacitor';
import { useAuth } from '@/hooks/use-auth';

export const useZustandNavigation = () => {
  const { 
    currentTab, 
    navigateToPage,
    canGoBack: storeCanGoBack,
    goBack 
  } = useNavigationStore();
  
  const { isAuthenticated } = useAuth();
  const isCapacitor = detectCapacitorEnvironment();

  // Enhanced navigation with auth checks
  const navigateWithAuth = (path: string) => {
    const protectedRoutes = [
      '/home', '/profile', '/map', '/buzz', '/games', 
      '/leaderboard', '/notifications', '/settings', '/subscriptions'
    ];

    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
    
    if (isProtectedRoute && !isAuthenticated) {
      console.log('🔒 Protected route access denied - redirecting to login');
      navigateToPage('/login');
      return;
    }

    console.log('🧭 Zustand Navigation:', { path, isCapacitor, isAuthenticated });
    navigateToPage(path);
  };

  // iOS optimized navigation handlers
  const toHome = () => navigateWithAuth('/home');
  const toMap = () => navigateWithAuth('/map');
  const toBuzz = () => navigateWithAuth('/buzz');
  const toGames = () => navigateWithAuth('/games');
  const toNotifications = () => navigateWithAuth('/notifications');
  const toLeaderboard = () => navigateWithAuth('/leaderboard');
  const toProfile = () => navigateWithAuth('/profile');
  const toSettings = () => navigateWithAuth('/settings');
  const toLogin = () => navigateToPage('/login');
  const toRegister = () => navigateToPage('/register');

  // Enhanced back navigation with haptic feedback
  const goBackWithFeedback = async () => {
    try {
      // Haptic feedback for iOS
      if (isCapacitor && (window as any).Haptics) {
        await (window as any).Haptics.impact({ style: 'light' });
      }
      
      const previousPath = goBack();
      if (!previousPath) {
        // Fallback to home if no history
        navigateWithAuth('/home');
      }
      
      return previousPath;
    } catch (error) {
      console.error('❌ Back navigation error:', error);
      navigateWithAuth('/home');
    }
  };

  return {
    // Current state
    currentPath: currentTab,
    isCapacitor,
    canGoBack: storeCanGoBack(),
    
    // Navigation methods
    navigate: navigateWithAuth,
    goBack: goBackWithFeedback,
    
    // Specific routes
    toHome,
    toMap,
    toBuzz,
    toGames,
    toNotifications,
    toLeaderboard,
    toProfile,
    toSettings,
    toLogin,
    toRegister,
    
    // Helpers
    helpers: navigationHelpers
  };
};