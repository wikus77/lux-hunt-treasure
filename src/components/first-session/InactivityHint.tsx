/**
 * INACTIVITY HINT - Hint animato generico per utenti inattivi
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Componente riutilizzabile per mostrare hint di inattività
 * - Appare dopo X secondi di inattività
 * - 1 volta al giorno per pagina
 * - Scompare SOLO se l'utente interagisce (NO auto-hide)
 * - Icone contestuali per ogni pagina
 * - RESPONSIVE e CENTRATO
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, ChevronsUpDown, Pointer, MessageCircle } from 'lucide-react';

export type HintType = 'map' | 'home' | 'buzz' | 'aion';

interface InactivityHintProps {
  type: HintType;
  containerId?: string;
}

const HINT_CONFIG: Record<HintType, {
  storageKey: string;
  message: string;
  color: string;
}> = {
  map: {
    storageKey: 'm1_map_explore_hint_date',
    message: 'Esplora la mappa',
    color: '#00E5FF',
  },
  home: {
    storageKey: 'm1_home_explore_hint_date',
    message: 'Scorri per scoprire',
    color: '#FFD700',
  },
  buzz: {
    storageKey: 'm1_buzz_explore_hint_date',
    message: 'Premi BUZZ',
    color: '#FF00FF',
  },
  aion: {
    storageKey: 'm1_aion_explore_hint_date',
    message: 'Parla con AION',
    color: '#00FF88',
  },
};

const INACTIVITY_MS = 45000; // 45 secondi

export default function InactivityHint({ type, containerId }: InactivityHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(false);

  const config = HINT_CONFIG[type];

  // Controlla se l'hint è già stato mostrato oggi
  const wasShownToday = useCallback((): boolean => {
    try {
      const lastShown = localStorage.getItem(config.storageKey);
      if (!lastShown) return false;
      const today = new Date().toDateString();
      return lastShown === today;
    } catch {
      return false;
    }
  }, [config.storageKey]);

  // Segna l'hint come mostrato oggi
  const markShownToday = useCallback(() => {
    try {
      const today = new Date().toDateString();
      localStorage.setItem(config.storageKey, today);
    } catch {}
  }, [config.storageKey]);

  // Funzione per nascondere l'hint
  const hideHint = useCallback(() => {
    if (isVisibleRef.current) {
      setIsVisible(false);
      isVisibleRef.current = false;
      console.log(`[InactivityHint:${type}] 👆 Hidden by user interaction`);
    }
  }, [type]);

  // Setup activity tracking - SEMPRE su document.body per garantire che funzioni
  useEffect(() => {
    if (wasShownToday()) {
      console.log(`[InactivityHint:${type}] Already shown today, skipping`);
      return;
    }

    console.log(`[InactivityHint:${type}] Setting up activity tracking`);

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      hideHint();
    };

    // Eventi che resettano l'attività - SEMPRE su document e window
    const events = ['touchstart', 'touchmove', 'mousedown', 'mousemove', 'wheel', 'click', 'scroll', 'keydown'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    window.addEventListener('scroll', handleActivity, { passive: true });

    // Check inattività periodicamente
    inactivityTimerRef.current = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      
      if (inactiveTime >= INACTIVITY_MS && !wasShownToday() && !isVisibleRef.current) {
        setIsVisible(true);
        isVisibleRef.current = true;
        markShownToday();
        console.log(`[InactivityHint:${type}] 👆 Showing hint after ${INACTIVITY_MS}ms inactivity`);
        
        // Stop checking per oggi
        if (inactivityTimerRef.current) {
          clearInterval(inactivityTimerRef.current);
        }
      }
    }, 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('scroll', handleActivity);
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [type, wasShownToday, markShownToday, hideHint]);

  // Render icona contestuale
  const renderIcon = () => {
    const iconSize = 52;
    const iconStyle = {
      color: config.color,
      filter: `drop-shadow(0 0 15px ${config.color}) drop-shadow(0 0 30px ${config.color}80)`,
    };

    switch (type) {
      case 'map':
        // Mano che si muove sinistra-destra
        return (
          <motion.div
            animate={{ x: [-20, 20, -20] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Hand size={iconSize} style={iconStyle} />
          </motion.div>
        );
      case 'home':
        // Frecce su/giù per scroll
        return (
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronsUpDown size={iconSize} style={iconStyle} />
          </motion.div>
        );
      case 'buzz':
        // Dito che preme (pointer)
        return (
          <motion.div
            animate={{ scale: [1, 0.9, 1], y: [0, 5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Pointer size={iconSize} style={iconStyle} />
          </motion.div>
        );
      case 'aion':
        // Messaggio/chat per parlare
        return (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MessageCircle size={iconSize} style={iconStyle} />
          </motion.div>
        );
      default:
        return (
          <motion.div
            animate={{ x: [-20, 20, -20] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Hand size={iconSize} style={iconStyle} />
          </motion.div>
        );
    }
  };

  if (!isVisible) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{
          zIndex: 99999,
          pointerEvents: 'none',
        }}
      >
        <div 
          className="flex flex-col items-center gap-4"
          style={{ maxWidth: '90vw' }}
        >
          {/* Icona contestuale animata */}
          <div className="flex items-center justify-center">
            {renderIcon()}
          </div>

          {/* Testo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="px-6 py-4 rounded-2xl text-center"
            style={{
              background: 'rgba(0, 0, 0, 0.92)',
              backdropFilter: 'blur(12px)',
              border: `2px solid ${config.color}`,
              boxShadow: `0 0 40px ${config.color}60, inset 0 0 30px ${config.color}15`,
              maxWidth: '280px',
            }}
          >
            <p
              className="text-white font-bold m-0"
              style={{
                fontSize: 'clamp(15px, 4vw, 18px)',
                textShadow: `0 0 15px ${config.color}`,
                letterSpacing: '0.5px',
              }}
            >
              {config.message}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

