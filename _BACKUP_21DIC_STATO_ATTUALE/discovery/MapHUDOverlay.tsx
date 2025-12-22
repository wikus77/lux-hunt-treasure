/**
 * MAP HUD OVERLAY — M1SSION™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Lightweight text overlay for first-session guidance on the map.
 * Does NOT block pointer events.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DISCOVERY_MODE_ENABLED,
  MAP_HUD_CONFIG,
  shouldShowHUD,
  dismissHUD,
  recordFirstInteraction,
} from '@/config/firstSessionDiscovery';

interface MapHUDOverlayProps {
  /** Optional callback when HUD is dismissed */
  onDismiss?: () => void;
}

export default function MapHUDOverlay({ onDismiss }: MapHUDOverlayProps) {
  const [visible, setVisible] = useState(false);

  // Check if HUD should be shown
  useEffect(() => {
    if (!DISCOVERY_MODE_ENABLED) return;
    
    // Small delay to let map render first
    const timer = setTimeout(() => {
      if (shouldShowHUD()) {
        setVisible(true);
        console.log('[MapHUD] 📝 HUD shown');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Auto-hide after timeout
  useEffect(() => {
    if (!visible || MAP_HUD_CONFIG.autoHideAfterMs === 0) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, MAP_HUD_CONFIG.autoHideAfterMs);

    return () => clearTimeout(timer);
  }, [visible]);

  // Listen for map interactions to hide HUD
  useEffect(() => {
    if (!visible || !MAP_HUD_CONFIG.hideOnInteraction) return;

    const handleInteraction = () => {
      recordFirstInteraction();
      handleDismiss();
    };

    // Listen for various map interaction events
    const events = ['touchstart', 'mousedown', 'wheel'];
    const mapContainer = document.getElementById('ml-sandbox');
    
    events.forEach(event => {
      mapContainer?.addEventListener(event, handleInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        mapContainer?.removeEventListener(event, handleInteraction);
      });
    };
  }, [visible]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    dismissHUD();
    onDismiss?.();
  }, [onDismiss]);

  if (!DISCOVERY_MODE_ENABLED) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed z-[500] pointer-events-none"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 90px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)', // 16px margin each side
            maxWidth: '340px',
          }}
        >
          <div
            className="relative rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 10, 30, 0.95), rgba(0, 20, 50, 0.9))',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              padding: 'clamp(14px, 4vw, 20px) clamp(16px, 5vw, 24px)',
              border: '1px solid rgba(0, 209, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Decorative glow */}
            <div
              className="absolute -top-0.5 left-1/4 right-1/4 h-1 rounded"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(0, 209, 255, 0.6), transparent)',
                filter: 'blur(2px)',
              }}
            />

            {/* Icon - responsive size */}
            <div className="flex justify-center mb-2 sm:mb-3">
              <span 
                className="text-2xl sm:text-3xl"
                style={{ filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))' }}
              >
                🎁
              </span>
            </div>

            {/* Text content - responsive typography */}
            <div className="text-center text-white">
              <p
                className="text-sm sm:text-base font-semibold mb-1"
                style={{
                  color: '#00D1FF',
                  textShadow: '0 0 10px rgba(0, 209, 255, 0.5)',
                }}
              >
                {MAP_HUD_CONFIG.line1}
              </p>
              <p className="text-xs sm:text-sm text-white/80 mb-2">
                {MAP_HUD_CONFIG.line2}
              </p>
              <p className="text-xs text-cyan-400/70 italic">
                👆 {MAP_HUD_CONFIG.line3}
              </p>
            </div>

            {/* Tap to dismiss hint */}
            <motion.p
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center text-[10px] text-white/40 mt-2 sm:mt-3"
            >
              Tap anywhere to start
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

