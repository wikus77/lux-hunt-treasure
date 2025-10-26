/**
 * M1SSION™ - Route Announcements Hook
 * Populates #route-announcer live region on route changes
 * @accessibility Implements WCAG 2.1 Level AA compliance
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { getRouteTitle } from '@/lib/a11y/routeTitles';

/**
 * useRouteAnnouncements Hook
 * 
 * Announces route changes to screen readers via live region.
 * Respects prefers-reduced-motion for accessibility.
 * Debounces announcements to prevent double-reading.
 * 
 * @example
 * ```tsx
 * function App() {
 *   useRouteAnnouncements();
 *   return <RouteAnnouncer />;
 * }
 * ```
 */
export const useRouteAnnouncements = () => {
  const [location] = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnnouncedRef = useRef<string>('');

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Clear any pending announcements
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce announcement by 100ms to prevent double-reading
    timeoutRef.current = setTimeout(() => {
      const announcer = document.getElementById('route-announcer');
      if (!announcer) {
        console.warn('[RouteAnnouncer] #route-announcer element not found');
        return;
      }

      // Get human-readable route title (localized)
      const routeTitle = getRouteTitle(location);
      const announcement = `Navigato a ${routeTitle}`;

      // Prevent duplicate announcements
      if (announcement === lastAnnouncedRef.current) {
        return;
      }

      // Clear and populate live region
      announcer.textContent = '';
      
      // Small delay to ensure screen readers detect the change
      setTimeout(() => {
        announcer.textContent = announcement;
        lastAnnouncedRef.current = announcement;
        
        if (!prefersReducedMotion) {
          console.log(`♿ [A11y] ${announcement}`);
        }
      }, 50);
    }, 100);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location]);
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
