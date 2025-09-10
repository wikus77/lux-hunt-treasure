/**
 * © 2025 Joseph MULÉ – M1SSION™ Auto Interest Signals Hook
 * ZERO UI/UX IMPACT: Background tracking of user navigation and interactions
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackView, trackDwell, trackClick, TrackingSection } from '@/metrics/interestSignals';

// Route to section mapping
const routeToSection = (pathname: string): TrackingSection | null => {
  if (pathname.includes('/map')) return 'Map';
  if (pathname.includes('/intel')) return 'Intel';
  if (pathname.includes('/notice') || pathname.includes('/notification')) return 'Notice';
  if (pathname.includes('/reward') || pathname.includes('/prize')) return 'Rewards';
  if (pathname.includes('/buzz-map')) return 'BuzzMap';
  return null;
};

export function useAutoInterestSignals() {
  const [location] = useLocation();
  const currentSection = useRef<TrackingSection | null>(null);
  const sectionStartTime = useRef<number>(0);

  // Track page views and dwell time
  useEffect(() => {
    const section = routeToSection(location);
    
    // End previous section dwell tracking
    if (currentSection.current && sectionStartTime.current > 0) {
      const dwellTime = Date.now() - sectionStartTime.current;
      if (dwellTime > 1000) { // Only track meaningful dwell (>1s)
        trackDwell(currentSection.current, dwellTime);
      }
    }

    // Start new section tracking
    if (section) {
      trackView(section);
      currentSection.current = section;
      sectionStartTime.current = Date.now();
    } else {
      currentSection.current = null;
      sectionStartTime.current = 0;
    }
  }, [location]);

  // Track dwell time on cleanup
  useEffect(() => {
    return () => {
      if (currentSection.current && sectionStartTime.current > 0) {
        const dwellTime = Date.now() - sectionStartTime.current;
        if (dwellTime > 1000) {
          trackDwell(currentSection.current, dwellTime);
        }
      }
    };
  }, []);

  // Auto-instrument existing interactions (non-invasive)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Track clicks on key interactive elements
    const handleInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      try {
        // Mission cards
        if (target.closest('[data-mission-id]') || 
            target.closest('.mission-card') ||
            target.textContent?.toLowerCase().includes('mission')) {
          trackClick('mission_interaction');
        }
        
        // Reward/prize related
        else if (target.closest('[data-reward-id]') || 
                 target.closest('.reward-card') ||
                 target.textContent?.toLowerCase().includes('prize') ||
                 target.textContent?.toLowerCase().includes('reward')) {
          trackClick('reward_interaction');
        }
        
        // Navigation buttons
        else if (target.closest('nav') || 
                 target.closest('.bottom-navigation') ||
                 target.closest('[role="navigation"]')) {
          trackClick('navigation');
        }
        
        // Brand/sponsor related
        else if (target.closest('.brand-card') ||
                 target.textContent?.toLowerCase().includes('sponsor') ||
                 target.textContent?.toLowerCase().includes('brand')) {
          trackClick('brand_interaction');
        }
      } catch (error) {
        // Fail silently, never impact UI
        if (import.meta.env.VITE_DIAG === '1') {
          console.warn('Auto-tracking error:', error);
        }
      }
    };

    // Use passive listeners for performance
    document.addEventListener('click', handleInteraction, { passive: true });
    document.addEventListener('touchend', handleInteraction, { passive: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchend', handleInteraction);
    };
  }, []);
}

// Initialize hook only when safe to do so
export function initAutoInterestSignals() {
  // This will be called from main.tsx after first paint
  if (typeof window !== 'undefined') {
    try {
      const isDebugMode = new URLSearchParams(window.location.search).get('M1_DIAG') === '1' || 
                         import.meta.env.VITE_DIAG === '1';
      
      if (isDebugMode) {
        console.log('📊 Auto interest signals initialized');
        // Expose additional diagnostics for debug mode
        (window as any).__M1_AUTO_SIG__ = {
          isActive: true,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        };
      }
    } catch (error) {
      if (import.meta.env.VITE_DIAG === '1') {
        console.warn('Auto interest signals init failed:', error);
      }
    }
  }
}