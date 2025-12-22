/**
 * MICRO-MISSION OVERLAY — M1SSION™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Small toast-like overlay showing micro-mission completion.
 * 3-step event-driven state machine persisted in localStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  DISCOVERY_MODE_ENABLED,
  MICRO_MISSIONS_CONFIG,
  isDiscoveryActive,
  getMicroMissionStep,
  advanceMicroMission,
  recordFirstInteraction,
} from '@/config/firstSessionDiscovery';

interface MicroMissionOverlayProps {
  /** Optional ref to map container for event listening */
  mapContainerId?: string;
}

export default function MicroMissionOverlay({ mapContainerId = 'ml-sandbox' }: MicroMissionOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [location] = useLocation();

  // Initialize step from localStorage
  useEffect(() => {
    if (!DISCOVERY_MODE_ENABLED || !isDiscoveryActive()) return;
    setCurrentStep(getMicroMissionStep());
  }, []);

  // Show toast helper
  const showStepToast = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), MICRO_MISSIONS_CONFIG.toastDurationMs);
  }, []);

  // Step 1: Map interaction (pan/zoom)
  useEffect(() => {
    if (!DISCOVERY_MODE_ENABLED || !isDiscoveryActive() || currentStep >= 1) return;

    const handleMapInteraction = () => {
      recordFirstInteraction();
      const newStep = advanceMicroMission();
      setCurrentStep(newStep);
      showStepToast(MICRO_MISSIONS_CONFIG.steps[0].message);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('discovery-step-complete', { detail: { step: 1 } }));
    };

    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) return;

    const events = ['touchstart', 'mousedown', 'wheel'];
    events.forEach(event => {
      mapContainer.addEventListener(event, handleMapInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        mapContainer.removeEventListener(event, handleMapInteraction);
      });
    };
  }, [currentStep, mapContainerId, showStepToast]);

  // Step 2: Marker tap OR Buzz button tap
  useEffect(() => {
    if (!DISCOVERY_MODE_ENABLED || !isDiscoveryActive() || currentStep !== 1) return;

    const handleMarkerOrBuzzTap = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Check if it's a marker popup or buzz button
      const isMarker = target.closest('[data-marker]') || target.closest('.maplibregl-popup');
      const isBuzzButton = target.closest('[data-onboarding="buzz-map-button"]') || 
                          target.closest('[data-buzz-button]') ||
                          target.closest('button')?.textContent?.toLowerCase().includes('buzz');
      
      if (isMarker || isBuzzButton) {
        const newStep = advanceMicroMission();
        setCurrentStep(newStep);
        showStepToast(MICRO_MISSIONS_CONFIG.steps[1].message);
        
        window.dispatchEvent(new CustomEvent('discovery-step-complete', { detail: { step: 2 } }));
      }
    };

    document.addEventListener('click', handleMarkerOrBuzzTap, { passive: true });
    document.addEventListener('touchend', handleMarkerOrBuzzTap, { passive: true });

    return () => {
      document.removeEventListener('click', handleMarkerOrBuzzTap);
      document.removeEventListener('touchend', handleMarkerOrBuzzTap);
    };
  }, [currentStep, showStepToast]);

  // Step 3: Visit Buzz page
  useEffect(() => {
    if (!DISCOVERY_MODE_ENABLED || !isDiscoveryActive() || currentStep !== 2) return;

    // Check if we're on the buzz page
    if (location === '/buzz' || location.startsWith('/buzz')) {
      const newStep = advanceMicroMission();
      setCurrentStep(newStep);
      showStepToast(MICRO_MISSIONS_CONFIG.steps[2].message);
      
      window.dispatchEvent(new CustomEvent('discovery-step-complete', { detail: { step: 3 } }));
    }
  }, [location, currentStep, showStepToast]);

  if (!DISCOVERY_MODE_ENABLED) return null;

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 34px) + 180px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 600,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0, 40, 30, 0.95), rgba(0, 60, 40, 0.9))',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '14px 20px',
              border: '1px solid rgba(0, 255, 150, 0.4)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 255, 150, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {/* Checkmark icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00FF96, #00CC77)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(0, 255, 150, 0.5)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>

            {/* Message */}
            <span
              style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              {toastMessage}
            </span>
          </div>

          {/* Progress dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '8px',
            }}
          >
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: currentStep >= step 
                    ? 'linear-gradient(135deg, #00FF96, #00CC77)' 
                    : 'rgba(255, 255, 255, 0.2)',
                  boxShadow: currentStep >= step ? '0 0 8px rgba(0, 255, 150, 0.5)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

