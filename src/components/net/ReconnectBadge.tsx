/**
 * M1SSION™ - Reconnect Badge Component
 * Displays temporary "Reconnecting..." badge during Supabase Realtime reconnection
 * @ux Improves perceived continuity during network interruptions
 * @features Auto-positioning, 300ms throttle, feature toggle
 */

import React, { useEffect, useState, useRef } from 'react';
import { RECONNECT_EVENTS, onReconnectEvent } from '@/lib/realtime/reconnectBus';

/**
 * Feature toggle: check if badge should be shown
 */
const SHOW_BADGE = import.meta.env.VITE_SHOW_RECONNECT_BADGE !== 'false';

/**
 * ReconnectBadge Component
 * 
 * Shows a discrete, auto-hiding badge when Supabase Realtime is reconnecting.
 * Automatically dismisses after 3 seconds or when subscription is restored.
 * 
 * Features:
 * - Auto-positioning (bottom if toast present, top otherwise)
 * - 300ms throttle to prevent flicker on unstable networks
 * - Dedupe identical consecutive events
 * - Feature toggle via VITE_SHOW_RECONNECT_BADGE env var
 * 
 * @example
 * ```tsx
 * <ReconnectBadge />
 * ```
 */
export const ReconnectBadge: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isBottom, setIsBottom] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastEvent = useRef<string>('');

  // Check for toast presence and update positioning
  useEffect(() => {
    if (!isVisible) return;

    const checkToastPresence = () => {
      const hasToast = 
        document.body.hasAttribute('data-has-toast') ||
        document.querySelector('[data-sonner-toaster]') !== null ||
        document.querySelector('.sonner') !== null;
      
      setIsBottom(hasToast);
    };

    checkToastPresence();
    const interval = setInterval(checkToastPresence, 500);
    
    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    // Feature toggle: if disabled, don't set up listeners
    if (!SHOW_BADGE) return;

    // Throttled handler for reconnecting events (300ms)
    const handleReconnecting = (detail: { timestamp: number; channelName?: string; reason?: string }) => {
      const eventKey = `reconnecting:${detail.channelName || 'global'}:${detail.timestamp}`;
      
      // Dedupe identical consecutive events
      if (lastEvent.current === eventKey) {
        return;
      }
      
      // Throttle: ignore if already pending
      if (throttleTimeout.current) {
        return;
      }
      
      lastEvent.current = eventKey;
      
      // Set throttle timeout
      throttleTimeout.current = setTimeout(() => {
        throttleTimeout.current = null;
      }, 300);
      
      setIsVisible(true);
      
      // Clear any existing hide timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }

      // Auto-hide after 3 seconds
      const timeout = setTimeout(() => {
        setIsVisible(false);
        lastEvent.current = '';
      }, 3000);
      
      setHideTimeout(timeout);
    };

    // Listen for reconnecting state
    const unsubscribeReconnecting = onReconnectEvent(RECONNECT_EVENTS.RECONNECTING, handleReconnecting);

    // Listen for subscribed state (immediate hide)
    const unsubscribeSubscribed = onReconnectEvent(RECONNECT_EVENTS.SUBSCRIBED, () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
        throttleTimeout.current = null;
      }
      setIsVisible(false);
      lastEvent.current = '';
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
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
    };
  }, [hideTimeout]);

  // Feature toggle: don't render if disabled
  if (!SHOW_BADGE || !isVisible) {
    return null;
  }

  return (
    <div className={`reconnect-badge ${isBottom ? 'reconnect-bottom' : ''}`}>
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
