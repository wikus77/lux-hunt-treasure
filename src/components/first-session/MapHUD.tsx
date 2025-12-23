/**
 * MAP HUD - Overlay leggero sulla mappa
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Mostra una frase di benvenuto/guida per i nuovi utenti
 * - NON è un modal/popup bloccante
 * - Sparisce dopo interazione o timeout
 * - Responsive e centrato
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MAP_HUD_ENABLED,
  TIMING,
  COPY,
  isFirstSession,
  isHudDismissed,
  dismissHud,
} from '@/config/firstSessionConfig';
import { useEntityOverlayStore } from '@/stores/entityOverlayStore';

interface MapHUDProps {
  /** ID del container mappa per rilevare interazioni */
  mapContainerId?: string;
  /** Callback quando l'HUD viene chiuso */
  onDismiss?: () => void;
}

const POPUP_ID = 'map-hud';

export default function MapHUD({ mapContainerId = 'ml-sandbox', onDismiss }: MapHUDProps) {
  const [isVisible, setIsVisible] = useState(false);
  const registerActivePopup = useEntityOverlayStore((s) => s.registerActivePopup);
  const unregisterActivePopup = useEntityOverlayStore((s) => s.unregisterActivePopup);

  // 🆕 v9: Registra/deregistra popup per bloccare Shadow
  useEffect(() => {
    if (isVisible) {
      registerActivePopup(POPUP_ID);
    } else {
      unregisterActivePopup(POPUP_ID);
    }
    return () => {
      unregisterActivePopup(POPUP_ID);
    };
  }, [isVisible, registerActivePopup, unregisterActivePopup]);

  // Mostra HUD solo per prima sessione e se non già dismissato
  useEffect(() => {
    if (!MAP_HUD_ENABLED) return;
    if (!isFirstSession()) return;
    if (isHudDismissed()) return;
    
    // Piccolo delay per permettere alla mappa di caricare
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      console.log('[MapHUD] 🗺️ Showing HUD');
    }, 500);

    return () => clearTimeout(showTimer);
  }, []);

  // Auto-hide dopo timeout
  useEffect(() => {
    if (!isVisible) return;

    const hideTimer = setTimeout(() => {
      handleDismiss();
    }, TIMING.HUD_AUTO_HIDE_MS);

    return () => clearTimeout(hideTimer);
  }, [isVisible]);

  // Rileva interazione con la mappa (pan/zoom/click)
  useEffect(() => {
    if (!isVisible) return;

    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) return;

    const handleInteraction = () => {
      handleDismiss();
    };

    // Rileva qualsiasi interazione
    mapContainer.addEventListener('touchstart', handleInteraction, { once: true });
    mapContainer.addEventListener('mousedown', handleInteraction, { once: true });
    mapContainer.addEventListener('wheel', handleInteraction, { once: true });

    return () => {
      mapContainer.removeEventListener('touchstart', handleInteraction);
      mapContainer.removeEventListener('mousedown', handleInteraction);
      mapContainer.removeEventListener('wheel', handleInteraction);
    };
  }, [isVisible, mapContainerId]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    dismissHud();
    console.log('[MapHUD] ✅ HUD dismissed');
    onDismiss?.();
  }, [onDismiss]);

  if (!MAP_HUD_ENABLED) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onClick={handleDismiss}
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
            zIndex: 800, // Sotto i popup esistenti (10003)
            pointerEvents: 'none',
          }}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            style={{
              width: '100%',
              maxWidth: '340px',
              background: 'linear-gradient(145deg, rgba(0, 20, 40, 0.95), rgba(0, 40, 60, 0.9))',
              borderRadius: '20px',
              border: '1px solid rgba(0, 209, 255, 0.3)',
              boxShadow: '0 0 40px rgba(0, 209, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.4)',
              padding: 'clamp(16px, 4vw, 24px)',
              textAlign: 'center',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
          >
            {/* Icona */}
            <div
              style={{
                fontSize: 'clamp(32px, 8vw, 48px)',
                marginBottom: '12px',
                filter: 'drop-shadow(0 0 8px rgba(0, 209, 255, 0.5))',
              }}
            >
              🎯
            </div>

            {/* Testo principale */}
            <p
              style={{
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                fontWeight: 600,
                color: '#00D1FF',
                marginBottom: '8px',
                textShadow: '0 0 10px rgba(0, 209, 255, 0.5)',
              }}
            >
              {COPY.HUD.line1}
            </p>

            {/* Testo secondario */}
            <p
              style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '12px',
              }}
            >
              {COPY.HUD.line2}
            </p>

            {/* CTA */}
            <p
              style={{
                fontSize: 'clamp(11px, 2.5vw, 13px)',
                color: 'rgba(0, 209, 255, 0.7)',
                fontStyle: 'italic',
              }}
            >
              👆 {COPY.HUD.line3}
            </p>

            {/* Tap to dismiss hint */}
            <motion.p
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.4)',
                marginTop: '16px',
              }}
            >
              Tap anywhere to start
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

