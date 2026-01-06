/**
 * M1SSION™ Progress Feedback Provider
 * Global provider for game event celebrations
 * Mounts globally in App.tsx, listens for events, renders overlays
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { PROGRESS_FEEDBACK_ENABLED } from '@/config/featureFlags';
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
  
  // Subscribe to queue changes
  useEffect(() => {
    if (!PROGRESS_FEEDBACK_ENABLED) {
      console.log('[ProgressFeedback] ⚠️ Feature disabled via flag');
      return;
    }
    
    console.log('[ProgressFeedback] 🚀 Provider mounted, subscribing to queue');
    
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
  }, []);
  
  // Listen for global game events
  useEffect(() => {
    if (!PROGRESS_FEEDBACK_ENABLED) return;
    
    const handleGameEvent = (e: CustomEvent<GameEvent>) => {
      console.log('[ProgressFeedback] 📥 Received event:', e.detail.type);
      enqueueEvent(e.detail);
    };
    
    window.addEventListener('m1ssion:game-event', handleGameEvent as EventListener);
    
    return () => {
      window.removeEventListener('m1ssion:game-event', handleGameEvent as EventListener);
    };
  }, []);
  
  // Handle dismiss
  const handleDismiss = useCallback(() => {
    dismissCurrentEvent();
  }, []);
  
  // Handle CTA click
  const handleCtaClick = useCallback((path: string) => {
    dismissCurrentEvent();
    // Navigate after dismiss animation
    setTimeout(() => {
      window.location.href = path;
    }, 100);
  }, []);
  
  // Render overlay based on event priority
  const renderOverlay = () => {
    if (!PROGRESS_FEEDBACK_ENABLED || !currentEvent) return null;
    
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

