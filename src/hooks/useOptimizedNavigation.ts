// © 2025 Joseph MULÉ – M1SSION™
import { useCallback } from 'react';
import { useLocation } from 'wouter';

// Prefetch route data for instant navigation
const prefetchRouteData = (route: string) => {
  // Pre-warm route-specific data
  const routePreloads: Record<string, () => void> = {
    '/leaderboard': () => {
      // Preload leaderboard data
      import('@/components/leaderboards/AdvancedLeaderboard');
    },
    '/notifications': () => {
      // Preload notifications components
      import('@/components/notifications/NotificationsHeader');
    },
    '/map': () => {
      // Preload map components
      console.log('Prefetching map components');
    },
    '/buzz': () => {
      // Preload buzz components  
      console.log('Prefetching buzz components');
    }
  };

  const preload = routePreloads[route];
  if (preload) {
    requestIdleCallback(preload);
  }
};

export const useOptimizedNavigation = () => {
  const [, setLocation] = useLocation();

  const navigateInstant = useCallback((route: string) => {
    // Immediate navigation with optimized rendering
    requestAnimationFrame(() => {
      setLocation(route);
    });
    
    // Prefetch next likely routes
    prefetchRouteData(route);
  }, [setLocation]);

  return { navigateInstant };
};