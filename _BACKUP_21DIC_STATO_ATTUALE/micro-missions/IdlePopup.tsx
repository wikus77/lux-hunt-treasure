/**
 * IDLE POPUP — M1SSION™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Popup that appears if user is idle on map for 5+ seconds.
 * Shows motivational message to start exploring.
 * ALWAYS RESPONSIVE, ALWAYS CENTERED.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MICRO_MISSIONS_ENABLED,
  IDLE_POPUP_CONFIG,
  hasIdlePopupBeenShown,
  markIdlePopupShown,
} from './MicroMissionsConfig';

interface IdlePopupProps {
  mapContainerId?: string;
}

export default function IdlePopup({ mapContainerId = 'ml-sandbox' }: IdlePopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    markIdlePopupShown();
  }, []);

  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED) return;
    if (hasIdlePopupBeenShown()) return;

    let idleTimer: NodeJS.Timeout | null = null;
    let hasShown = false;

    const resetTimer = () => {
      if (hasShown) return;
      if (idleTimer) clearTimeout(idleTimer);
      
      idleTimer = setTimeout(() => {
        if (!hasShown && !hasIdlePopupBeenShown()) {
          hasShown = true;
          setIsVisible(true);
        }
      }, IDLE_POPUP_CONFIG.idleTimeMs);
    };

    const mapContainer = document.getElementById(mapContainerId);
    
    // Start timer immediately
    resetTimer();

    // Reset on any interaction
    const events = ['touchstart', 'touchmove', 'mousedown', 'mousemove', 'wheel', 'keydown'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
      if (mapContainer) {
        mapContainer.addEventListener(event, resetTimer, { passive: true });
      }
    });

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
        if (mapContainer) {
          mapContainer.removeEventListener(event, resetTimer);
        }
      });
    };
  }, [mapContainerId]);

  if (!MICRO_MISSIONS_ENABLED) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 950,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={handleDismiss}
            style={{
              width: '100%',
              maxWidth: '340px',
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, rgba(10, 15, 30, 0.98), rgba(20, 30, 50, 0.95))',
              border: '1px solid rgba(0, 209, 255, 0.3)',
              boxShadow: '0 0 60px rgba(0, 209, 255, 0.15), 0 12px 40px rgba(0, 0, 0, 0.6)',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
          >
            {/* Glowing top border */}
            <div
              style={{
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #00D1FF, transparent)',
                boxShadow: '0 0 20px rgba(0, 209, 255, 0.5)',
              }}
            />

            <div style={{ padding: '24px 20px' }}>
              {/* Icon */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.15), rgba(0, 100, 200, 0.1))',
                  border: '2px solid rgba(0, 209, 255, 0.3)',
                  boxShadow: '0 0 30px rgba(0, 209, 255, 0.2)',
                }}
              >
                🎯
              </div>

              {/* Text content */}
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#00D1FF',
                  textAlign: 'center',
                  marginBottom: '8px',
                  textShadow: '0 0 20px rgba(0, 209, 255, 0.5)',
                }}
              >
                {IDLE_POPUP_CONFIG.line1}
              </p>
              
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  textAlign: 'center',
                  marginBottom: '12px',
                  lineHeight: 1.5,
                }}
              >
                {IDLE_POPUP_CONFIG.line2}
              </p>

              <p
                style={{
                  fontSize: '13px',
                  color: 'rgba(0, 209, 255, 0.7)',
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                👆 {IDLE_POPUP_CONFIG.line3}
              </p>

              {/* Tap to dismiss hint */}
              <motion.p
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  textAlign: 'center',
                  marginTop: '20px',
                }}
              >
                Tap anywhere to start
              </motion.p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

