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
  const userEmail = user?.email;
  const isAllowed = isUserInProgressFeedbackAllowlist(userEmail);
  
  // 🐛 DEBUG: Log state on every render (only for allowlisted users)
  useEffect(() => {
    console.log('[ProgressFeedback] 🔍 DEBUG STATE:', {
      PROGRESS_FEEDBACK_ENABLED,
      authLoading,
      userEmail: userEmail || 'NOT_AVAILABLE',
      isAllowed,
      hasUser: !!user,
      timestamp: new Date().toISOString()
    });
  }, [authLoading, userEmail, isAllowed, user]);
  
  // Subscribe to queue changes
  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) {
      console.log('[ProgressFeedback] ⏳ Auth still loading, waiting...');
      return;
    }
    
    if (!PROGRESS_FEEDBACK_ENABLED) {
      console.log('[ProgressFeedback] ⚠️ Feature disabled via flag');
      return;
    }
    
    // 🛡️ ALLOWLIST: Skip if user not in allowlist
    if (!isAllowed) {
      console.log('[ProgressFeedback] 🔒 User not in allowlist:', { userEmail });
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
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('[ProgressFeedback] 📡 Event listener: waiting for auth...');
      return;
    }
    
    if (!PROGRESS_FEEDBACK_ENABLED) {
      console.log('[ProgressFeedback] 📡 Event listener: feature disabled');
      return;
    }
    
    if (!isAllowed) {
      console.log('[ProgressFeedback] 📡 Event listener: user not allowed, skipping');
      return;
    }
    
    console.log('[ProgressFeedback] 📡 ATTACHING global event listener for:', userEmail);
    
    const handleGameEvent = (e: CustomEvent<GameEvent>) => {
      console.log('[ProgressFeedback] 📥 RECEIVED event:', e.detail.type, e.detail);
      enqueueEvent(e.detail);
    };
    
    window.addEventListener('m1ssion:game-event', handleGameEvent as EventListener);
    
    return () => {
      console.log('[ProgressFeedback] 📡 REMOVING global event listener');
      window.removeEventListener('m1ssion:game-event', handleGameEvent as EventListener);
    };
  }, [authLoading, isAllowed, userEmail]);
  
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
  
  // 🐛 DEBUG INDICATOR: Only visible to allowlisted users (Joseph)
  const renderDebugIndicator = () => {
    if (!isAllowed) return null;
    
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '10px',
          zIndex: 99999,
          background: 'rgba(0, 255, 136, 0.9)',
          color: '#000',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '10px',
          fontFamily: 'monospace',
          maxWidth: '200px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}
      >
        <div><strong>🎉 PF DEBUG</strong></div>
        <div>FLAG: {PROGRESS_FEEDBACK_ENABLED ? '✅ ON' : '❌ OFF'}</div>
        <div>AUTH: {authLoading ? '⏳' : '✅'}</div>
        <div>EMAIL: {userEmail?.slice(0, 10) || '❌ N/A'}...</div>
        <div>ALLOWED: {isAllowed ? '✅' : '❌'}</div>
        <div>EVENT: {currentEvent?.type || 'none'}</div>
      </div>
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

