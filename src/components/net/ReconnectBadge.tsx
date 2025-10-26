/**
 * M1SSION™ - Reconnect Badge Component
 * Displays temporary "Reconnecting..." badge during Supabase Realtime reconnection
 * @ux Improves perceived continuity during network interruptions
 */

import React, { useEffect, useState } from 'react';
import { RECONNECT_EVENTS, onReconnectEvent } from '@/lib/realtime/reconnectBus';

/**
 * ReconnectBadge Component
 * 
 * Shows a discrete, auto-hiding badge when Supabase Realtime is reconnecting.
 * Automatically dismisses after 3 seconds or when subscription is restored.
 * 
 * @example
 * ```tsx
 * <ReconnectBadge />
 * ```
 */
export const ReconnectBadge: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Listen for reconnecting state
    const unsubscribeReconnecting = onReconnectEvent(RECONNECT_EVENTS.RECONNECTING, () => {
      setIsVisible(true);
      
      // Clear any existing timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }

      // Auto-hide after 3 seconds
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      setHideTimeout(timeout);
    });

    // Listen for subscribed state (immediate hide)
    const unsubscribeSubscribed = onReconnectEvent(RECONNECT_EVENTS.SUBSCRIBED, () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      setIsVisible(false);
    });

    // Listen for error state (keep visible)
    const unsubscribeError = onReconnectEvent(RECONNECT_EVENTS.ERROR, () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      // Keep visible on error, user needs to be aware
    });

    return () => {
      unsubscribeReconnecting();
      unsubscribeSubscribed();
      unsubscribeError();
      
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="reconnect-badge">
      <div className="reconnect-badge-content">
        <svg
          className="reconnect-badge-spinner"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="reconnect-badge-text">Reconnecting…</span>
      </div>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
