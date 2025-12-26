/**
 * BUZZ HELP POPUP - Popup di aiuto per Buzz
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Appare dopo inattività per guidare l'utente verso Buzz
 * - Modal centrato e responsive
 * - Appare SOLO se utente inattivo
 * - Non sovrappone altri popup (check timing)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { useLocation } from 'wouter';
import {
  BUZZ_HELP_POPUP_ENABLED,
  TIMING,
  COPY,
  isFirstSession,
  getMissionIndex,
  areMissionsCompleted,
  isBuzzHelpShown,
  markBuzzHelpShown,
} from '@/config/firstSessionConfig';
import { useEntityOverlayStore } from '@/stores/entityOverlayStore';

interface BuzzHelpPopupProps {
  /** ID del container mappa */
  mapContainerId?: string;
}

const POPUP_ID = 'buzz-help';

export default function BuzzHelpPopup({ mapContainerId = 'ml-sandbox' }: BuzzHelpPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [, navigate] = useLocation();
  const lastActivityRef = useRef(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const registerActivePopup = useEntityOverlayStore((s) => s.registerActivePopup);
  const unregisterActivePopup = useEntityOverlayStore((s) => s.unregisterActivePopup);
  // ✅ FIX B5: Usa flag store invece di DOM query
  const isPopupInteractionActive = useEntityOverlayStore((s) => s.isPopupInteractionActive);

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

  // Reset attività quando utente interagisce
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Controlla se può mostrare il popup
  const canShow = useCallback(() => {
    // Non mostrare se già mostrato (o se utente ha scelto "non mostrare più")
    if (isBuzzHelpShown()) return false;
    
    // ✅ FIX 24/12/2025: Mostra popup SOLO in questi casi:
    // 1. Utente è alla prima micro-missione (getMissionIndex() === 0) e non sta interagendo
    // 2. Utente ha completato TUTTE le micro-missioni ed è tornato sulla mappa
    const missionIndex = getMissionIndex();
    const missionsCompleted = areMissionsCompleted();
    
    // Se le micro-missioni sono in corso (non completate e non alla prima), non interrompere
    if (!missionsCompleted && missionIndex > 0) return false;
    
    // ✅ FIX B5: Usa flag store affidabile invece di DOM query fragile
    // Non mostrare se ci sono altri popup aperti (registrati nel store)
    if (isPopupInteractionActive) return false;
    
    return true;
  }, [isPopupInteractionActive]);

  // Setup activity tracking
  useEffect(() => {
    if (!BUZZ_HELP_POPUP_ENABLED) return;
    // ✅ FIX 23/12/2025: Rimosso check isFirstSession() - mostra popup anche dopo first session
    if (isBuzzHelpShown()) return;

    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) return;

    // Eventi che resettano l'attività
    const events = ['touchstart', 'touchmove', 'mousedown', 'mousemove', 'wheel', 'click'];
    events.forEach(event => {
      mapContainer.addEventListener(event, resetActivity, { passive: true });
    });

    // Check inattività periodicamente
    inactivityTimerRef.current = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      
      if (inactiveTime >= TIMING.BUZZ_HELP_INACTIVITY_MS && canShow()) {
        setIsVisible(true);
        console.log('[BuzzHelp] 🆘 Showing help popup after inactivity');
        
        // Stop checking
        if (inactivityTimerRef.current) {
          clearInterval(inactivityTimerRef.current);
        }
      }
    }, 1000);

    return () => {
      events.forEach(event => {
        mapContainer.removeEventListener(event, resetActivity);
      });
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [mapContainerId, resetActivity, canShow]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    markBuzzHelpShown();
    console.log('[BuzzHelp] ✅ Popup closed');
  }, []);

  const handleOpenBuzz = useCallback(() => {
    setIsVisible(false);
    markBuzzHelpShown();
    console.log('[BuzzHelp] ⚡ Opening Buzz');
    navigate('/buzz');
  }, [navigate]);

  if (!BUZZ_HELP_POPUP_ENABLED) return null;
  if (!isVisible) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
          zIndex: 900, // Sotto i popup esistenti (10003) ma sopra micro-missions
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '320px',
            background: 'linear-gradient(145deg, rgba(20, 10, 40, 0.98), rgba(40, 20, 60, 0.95))',
            borderRadius: '24px',
            border: '2px solid rgba(255, 200, 0, 0.4)',
            boxShadow: '0 0 40px rgba(255, 200, 0, 0.2), 0 8px 32px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.6)',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ padding: 'clamp(20px, 5vw, 28px)', textAlign: 'center', position: 'relative' }}>
            {/* Icona Buzz animata */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                filter: [
                  'drop-shadow(0 0 10px rgba(255, 200, 0, 0.5))',
                  'drop-shadow(0 0 20px rgba(255, 200, 0, 0.8))',
                  'drop-shadow(0 0 10px rgba(255, 200, 0, 0.5))',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ marginBottom: '16px' }}
            >
              <Zap
                size={48}
                style={{
                  color: '#FFD700',
                  filter: 'drop-shadow(0 0 10px rgba(255, 200, 0, 0.5))',
                }}
              />
            </motion.div>

            {/* Titolo */}
            <h3
              style={{
                fontSize: 'clamp(18px, 4.5vw, 22px)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '8px',
              }}
            >
              {COPY.BUZZ_HELP.title}
            </h3>

            {/* Body */}
            <p
              style={{
                fontSize: 'clamp(13px, 3vw, 15px)',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '20px',
                lineHeight: 1.5,
              }}
            >
              {COPY.BUZZ_HELP.body}
            </p>

            {/* CTA Button */}
            <motion.button
              onClick={handleOpenBuzz}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              style={{
                width: '100%',
                padding: 'clamp(12px, 3vw, 16px)',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                border: 'none',
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                fontWeight: 700,
                color: '#000000',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(255, 200, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Zap size={18} />
              {COPY.BUZZ_HELP.button}
            </motion.button>

            {/* ✅ FIX 23/12/2025: Tasto "Non mostrare più" - setta flag permanente */}
            <button
              onClick={handleClose}
              style={{
                marginTop: '12px',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '8px',
                textDecoration: 'underline',
              }}
            >
              Non mostrare più
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

