/**
 * M1SSION™ Progress Feedback Provider
 * Global provider for game event celebrations
 * Mounts globally in App.tsx, listens for events, renders overlays
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'wouter';
import { PROGRESS_FEEDBACK_ENABLED, isUserInProgressFeedbackAllowlist } from '@/config/featureFlags';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import {
  GameEvent,
  enqueueEvent,
  subscribeToQueue,
  dismissCurrentEvent,
  startAutoDismiss,
} from '@/gameplay/events';
import { CelebrationModal } from './CelebrationModal';
import { CelebrationToast } from './CelebrationToast';

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ProgressFeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const { user, isLoading: authLoading } = useUnifiedAuth();
  const [, navigate] = useLocation();
  
  // 🛡️ ALLOWLIST CHECK: Only show celebrations to allowlisted users
  const isAllowed = isUserInProgressFeedbackAllowlist(user?.email);
  
  // Subscribe to queue changes
  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) return;
    
    if (!PROGRESS_FEEDBACK_ENABLED) {
      console.log('[ProgressFeedback] ⚠️ Feature disabled via flag');
      return;
    }
    
    // 🛡️ ALLOWLIST: Skip if user not in allowlist
    if (!isAllowed) {
      console.log('[ProgressFeedback] 🔒 User not in allowlist, skipping');
      return;
    }
    
    console.log('[ProgressFeedback] 🚀 Provider mounted for allowlisted user, subscribing to queue');
    
    const unsubscribe = subscribeToQueue((event) => {
      setCurrentEvent(event);
      
      // Start auto-dismiss for minor events
      if (event?.priority === 'minor') {
        startAutoDismiss();
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [authLoading, isAllowed]);
  
  // Listen for global game events
  useEffect(() => {
    if (!PROGRESS_FEEDBACK_ENABLED) return;
    if (!isAllowed) return; // 🛡️ ALLOWLIST check
    
    const handleGameEvent = (e: CustomEvent<GameEvent>) => {
      console.log('[ProgressFeedback] 📥 Received event:', e.detail.type);
      enqueueEvent(e.detail);
    };
    
    window.addEventListener('m1ssion:game-event', handleGameEvent as EventListener);
    
    return () => {
      window.removeEventListener('m1ssion:game-event', handleGameEvent as EventListener);
    };
  }, [isAllowed]);
  
  // Handle dismiss
  const handleDismiss = useCallback(() => {
    dismissCurrentEvent();
  }, []);
  
  // Handle CTA click - use wouter navigate for SPA navigation
  const handleCtaClick = useCallback((path: string) => {
    dismissCurrentEvent();
    // Navigate after dismiss animation (SPA, no full reload)
    setTimeout(() => {
      navigate(path);
    }, 100);
  }, [navigate]);
  
  // Render overlay based on event priority
  const renderOverlay = () => {
    // 🛡️ ALLOWLIST: Double-check before rendering
    if (!PROGRESS_FEEDBACK_ENABLED || !isAllowed || !currentEvent) return null;
    
    const portal = (
      <>
        {currentEvent.priority === 'major' && (
          <CelebrationModal
            event={currentEvent}
            onDismiss={handleDismiss}
            onCtaClick={handleCtaClick}
          />
        )}
        {currentEvent.priority === 'minor' && (
          <CelebrationToast
            event={currentEvent}
            onDismiss={handleDismiss}
            onCtaClick={handleCtaClick}
          />
        )}
      </>
    );
    
    // Use portal to render at document body level
    if (typeof document !== 'undefined') {
      return createPortal(portal, document.body);
    }
    
    return null;
  };
  
  return (
    <>
      {children}
      {renderOverlay()}
    </>
  );
};

export default ProgressFeedbackProvider;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

