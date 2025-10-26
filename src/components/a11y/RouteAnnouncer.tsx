/**
 * M1SSION™ - Route Announcer Component
 * Provides ARIA live region for screen reader route announcements
 * @accessibility Implements WCAG 2.1 Level AA compliance
 */

import React from 'react';

/**
 * RouteAnnouncer Component
 * 
 * Renders an invisible live region that announces route changes to screen readers.
 * Must be used with useRouteAnnouncements hook to populate announcements.
 * 
 * @example
 * ```tsx
 * <RouteAnnouncer />
 * ```
 */
export const RouteAnnouncer: React.FC = () => {
  return (
    <div
      id="route-announcer"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
