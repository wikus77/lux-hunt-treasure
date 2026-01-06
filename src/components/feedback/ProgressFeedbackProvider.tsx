/**
 * M1SSION™ Progress Feedback Provider V2
 * Global provider for game event celebrations
 * AAA game-feel with audio feedback
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'wouter';
import { 
  PROGRESS_FEEDBACK_ENABLED, 
  isUserInProgressFeedbackAllowlist,
  DEBUG_PANELS_ENABLED 
} from '@/config/featureFlags';
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
import { unlockAudio, playSound, getSoundForEvent } from './audioFeedback';

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ProgressFeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const { user, isLoading: authLoading } = useUnifiedAuth();
  const [, navigate] = useLocation();
  const hasUnlockedAudioRef = useRef(false);
  
  // 🛡️ ALLOWLIST CHECK: Only show celebrations to allowlisted users
  const userEmail = user?.email;
  const isAllowed = isUserInProgressFeedbackAllowlist(userEmail);
  
  // Unlock audio on first user interaction (iOS requirement)
  useEffect(() => {
    if (!isAllowed || hasUnlockedAudioRef.current) return;
    
    const handleFirstInteraction = async () => {
      if (hasUnlockedAudioRef.current) return;
      
      const unlocked = await unlockAudio();
      if (unlocked) {
        hasUnlockedAudioRef.current = true;
        // Remove listeners after unlock
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      }
    };
    
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isAllowed]);
  
  // Play sound when event appears
  useEffect(() => {
    if (!currentEvent || !isAllowed) return;
    
    // Play appropriate sound for event type
    const soundType = getSoundForEvent(currentEvent.type);
    playSound(soundType);
  }, [currentEvent, isAllowed]);
  
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
      return; // Silent skip, no console spam
    }
    
    console.log('[ProgressFeedback] 🚀 Provider active for:', userEmail);
    
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
  }, [authLoading, isAllowed, userEmail]);
  
  // Listen for global game events
  useEffect(() => {
    if (authLoading || !PROGRESS_FEEDBACK_ENABLED || !isAllowed) {
      return;
    }
    
    const handleGameEvent = (e: CustomEvent<GameEvent>) => {
      console.log('[ProgressFeedback] 📥 Event:', e.detail.type);
      enqueueEvent(e.detail);
    };
    
    window.addEventListener('m1ssion:game-event', handleGameEvent as EventListener);
    
    return () => {
      window.removeEventListener('m1ssion:game-event', handleGameEvent as EventListener);
    };
  }, [authLoading, isAllowed]);
  
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
  
  // 🐛 MINIMAL DEBUG: Only in dev mode AND for allowlisted users
  const renderDebugIndicator = () => {
    // Only show in development AND for allowed users
    if (!DEBUG_PANELS_ENABLED || !isAllowed) return null;
    
    return createPortal(
      <div 
        style={{
          position: 'fixed',
          bottom: '8px',
          right: '8px',
          zIndex: 99999,
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '9px',
          fontFamily: 'monospace',
          background: currentEvent 
            ? 'rgba(0, 255, 136, 0.85)' 
            : 'rgba(0, 209, 255, 0.6)',
          color: '#000',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      >
        PF {currentEvent ? `⚡${currentEvent.type.slice(0, 8)}` : '✓'}
      </div>,
      document.body
    );
  };
  
  return (
    <>
      {children}
      {renderOverlay()}
      {renderDebugIndicator()}
    </>
  );
};

export default ProgressFeedbackProvider;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
