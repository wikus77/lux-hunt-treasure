/**
 * MAP EXPLORE HINT - Hint animato per utenti inattivi sulla mappa
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Mostra un testo "Esplora la mappa" con dito animato
 * - Appare dopo 45 secondi di inattività
 * - 1 volta al giorno per utente
 * - NON è un popup, è un overlay leggero
 * - Scompare immediatamente se l'utente interagisce
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand } from 'lucide-react';

interface MapExploreHintProps {
  mapContainerId?: string;
}

const STORAGE_KEY = 'm1_map_explore_hint_date';
const INACTIVITY_MS = 45000; // 45 secondi

export default function MapExploreHint({ mapContainerId = 'ml-sandbox' }: MapExploreHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(false);

  // Controlla se l'hint è già stato mostrato oggi
  const wasShownToday = useCallback((): boolean => {
    try {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (!lastShown) return false;
      
      const today = new Date().toDateString();
      return lastShown === today;
    } catch {
      return false;
    }
  }, []);

  // Segna l'hint come mostrato oggi
  const markShownToday = useCallback(() => {
    try {
      const today = new Date().toDateString();
      localStorage.setItem(STORAGE_KEY, today);
    } catch {}
  }, []);

  // Funzione per nascondere l'hint (solo su interazione utente)
  const hideHint = useCallback(() => {
    if (isVisibleRef.current) {
      setIsVisible(false);
      isVisibleRef.current = false;
      console.log('[MapExploreHint] 👆 Hidden by user interaction');
    }
  }, []);

  // Setup activity tracking
  useEffect(() => {
    // Se già mostrato oggi, non fare nulla
    if (wasShownToday()) return;

    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) return;

    // ✅ FIX: Handler per reset attività che nasconde l'hint
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      hideHint();
    };

    // Eventi che resettano l'attività
    const events = ['touchstart', 'touchmove', 'mousedown', 'mousemove', 'wheel', 'click'];
    events.forEach(event => {
      mapContainer.addEventListener(event, handleActivity, { passive: true });
    });

    // Check inattività periodicamente
    inactivityTimerRef.current = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      
      if (inactiveTime >= INACTIVITY_MS && !wasShownToday() && !isVisibleRef.current) {
        setIsVisible(true);
        isVisibleRef.current = true;
        markShownToday();
        console.log('[MapExploreHint] 👆 Showing explore hint after inactivity');
        
        // Stop checking per oggi (NO auto-hide - scompare solo su interazione)
        if (inactivityTimerRef.current) {
          clearInterval(inactivityTimerRef.current);
        }
      }
    }, 1000);

    return () => {
      events.forEach(event => {
        mapContainer.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [mapContainerId, wasShownToday, markShownToday, hideHint]);

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
          {/* Mano animata sinistra-destra */}
          <motion.div
            animate={{ x: [-20, 20, -20] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <Hand
              size={52}
              strokeWidth={1.5}
              style={{
                color: '#00E5FF',
                filter: 'drop-shadow(0 0 15px #00E5FF) drop-shadow(0 0 30px rgba(0, 229, 255, 0.6))',
              }}
            />
          </motion.div>

          {/* Testo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="px-6 py-4 rounded-2xl text-center"
            style={{
              background: 'rgba(0, 0, 0, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '2px solid #00E5FF',
              boxShadow: '0 0 40px rgba(0, 229, 255, 0.6), inset 0 0 30px rgba(0, 229, 255, 0.15)',
              maxWidth: '280px',
            }}
          >
            <p
              className="text-white font-bold m-0"
              style={{
                fontSize: 'clamp(15px, 4vw, 18px)',
                textShadow: '0 0 15px #00E5FF',
                letterSpacing: '0.5px',
              }}
            >
              Esplora la mappa
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

