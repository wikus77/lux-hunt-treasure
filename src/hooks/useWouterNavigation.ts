// M1SSION™ - Enhanced Wouter Navigation Hook for Capacitor iOS
// 🔐 FIRMATO: Joseph Mulè – CEO NIYVORA KFT™

import { useLocation } from 'wouter';
import { useCallback } from 'react';

export const useWouterNavigation = () => {
  const [location, setLocation] = useLocation();

  // Detect Capacitor environment
  const isCapacitor = typeof window !== 'undefined' && 
    (window.location.protocol === 'capacitor:' || !!(window as any).Capacitor);

  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    console.log('🧭 Wouter Navigation:', { from: location, to: path });
    setLocation(path, { replace: options?.replace });
    
    // iOS WebView scroll fix
    if (isCapacitor) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  }, [location, setLocation, isCapacitor]);

  const goBack = useCallback(() => {
    // Wouter-compatible back navigation
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      setLocation('/home');
    }
  }, [setLocation]);

  // Enhanced navigation methods with haptic feedback
  const toHome = useCallback(() => navigate('/home'), [navigate]);
  const toMap = useCallback(() => navigate('/map'), [navigate]);
  const toBuzz = useCallback(() => navigate('/buzz'), [navigate]);
  const toGames = useCallback(() => navigate('/games'), [navigate]);
  const toNotifications = useCallback(() => navigate('/notifications'), [navigate]);
  const toLeaderboard = useCallback(() => navigate('/leaderboard'), [navigate]);
  const toProfile = useCallback(() => navigate('/profile'), [navigate]);
  const toSettings = useCallback(() => navigate('/settings'), [navigate]);
  const toSubscriptions = useCallback(() => navigate('/subscriptions'), [navigate]);
  const toLogin = useCallback(() => navigate('/login'), [navigate]);
  const toRegister = useCallback(() => navigate('/register'), [navigate]);

  return {
    navigate,
    goBack,
    toHome,
    toMap,
    toBuzz,
    toGames,
    toNotifications,
    toLeaderboard,
    toProfile,
    toSettings,
    toSubscriptions,
    toLogin,
    toRegister,
    currentPath: location,
    isCapacitor
  };
};