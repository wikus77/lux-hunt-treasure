/**
 * MICRO-MISSIONS CARD - Card floating per micro-missioni
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Mostra una micro-missione alla volta
 * - Card floating centrata (NON modal bloccante)
 * - Rileva automaticamente pan/zoom/tap
 * - Animazione di completamento
 * - Responsive
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useLocation } from 'wouter';
import {
  MICRO_MISSIONS_ENABLED,
  TIMING,
  MICRO_MISSIONS,
  MicroMission,
  isFirstSession,
  isHudDismissed,
  getCurrentMission,
  getMissionIndex,
  advanceMission,
  areMissionsCompleted,
} from '@/config/firstSessionConfig';
import { useEntityOverlayStore } from '@/stores/entityOverlayStore';

interface MicroMissionsCardProps {
  /** ID del container mappa */
  mapContainerId?: string;
}

const POPUP_ID = 'micro-missions';

export default function MicroMissionsCard({ mapContainerId = 'ml-sandbox' }: MicroMissionsCardProps) {
  const [currentMission, setCurrentMission] = useState<MicroMission | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [completedText, setCompletedText] = useState('');
  const [motivationText, setMotivationText] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [location] = useLocation();
  const lastLocationRef = useRef(location);
  const registerActivePopup = useEntityOverlayStore((s) => s.registerActivePopup);
  const unregisterActivePopup = useEntityOverlayStore((s) => s.unregisterActivePopup);

  // 🆕 v9: Registra/deregistra popup per bloccare Shadow
  const isMissionVisible = isReady && (currentMission !== null || showCompleted);
  useEffect(() => {
    if (isMissionVisible) {
      registerActivePopup(POPUP_ID);
    } else {
      unregisterActivePopup(POPUP_ID);
    }
    return () => {
      unregisterActivePopup(POPUP_ID);
    };
  }, [isMissionVisible, registerActivePopup, unregisterActivePopup]);

  // Aspetta che l'HUD sia chiuso prima di mostrare le missioni
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED) return;
    if (!isFirstSession()) return;
    if (areMissionsCompleted()) return;

    const checkReady = () => {
      if (isHudDismissed()) {
        // Piccolo delay dopo HUD dismiss
        setTimeout(() => {
          setIsReady(true);
          const mission = getCurrentMission();
          setCurrentMission(mission);
          console.log('[MicroMissions] 🎯 Ready, current mission:', mission?.id);
        }, TIMING.FIRST_MISSION_DELAY_MS);
        return true;
      }
      return false;
    };

    // Check immediato
    if (checkReady()) return;

    // Poll ogni 500ms finché HUD non è chiuso
    const interval = setInterval(() => {
      if (checkReady()) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Completa missione e mostra animazione
  const completeMission = useCallback(() => {
    if (!currentMission) return;

    console.log(`[MicroMissions] ✅ Mission completed: ${currentMission.id}`);
    
    setCompletedText(currentMission.completeText);
    setMotivationText(currentMission.motivationText);
    setShowCompleted(true);

    // Dopo animazione, passa alla prossima
    setTimeout(() => {
      setShowCompleted(false);
      advanceMission();
      const nextMission = getCurrentMission();
      setCurrentMission(nextMission);
      console.log('[MicroMissions] 🎯 Next mission:', nextMission?.id || 'ALL COMPLETED');
    }, TIMING.MISSION_COMPLETE_ANIMATION_MS);
  }, [currentMission]);

  // === TRIGGER: Map Pan (drag) ===
  useEffect(() => {
    if (!isReady || !currentMission || currentMission.trigger !== 'map_pan') return;

    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) return;

    let hasMoved = false;
    const handleMove = () => {
      if (hasMoved) return;
      hasMoved = true;
      completeMission();
    };

    mapContainer.addEventListener('touchmove', handleMove, { passive: true });
    mapContainer.addEventListener('mousemove', handleMove, { passive: true });

    return () => {
      mapContainer.removeEventListener('touchmove', handleMove);
      mapContainer.removeEventListener('mousemove', handleMove);
    };
  }, [isReady, currentMission, mapContainerId, completeMission]);

  // === TRIGGER: Map Zoom ===
  useEffect(() => {
    if (!isReady || !currentMission || currentMission.trigger !== 'map_zoom') return;

    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) return;

    let hasZoomed = false;
    const handleZoom = () => {
      if (hasZoomed) return;
      hasZoomed = true;
      completeMission();
    };

    mapContainer.addEventListener('wheel', handleZoom, { passive: true });
    // Pinch zoom su touch
    let touchCount = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchCount = e.touches.length;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (touchCount >= 2 && !hasZoomed) {
        hasZoomed = true;
        completeMission();
      }
    };

    mapContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    mapContainer.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      mapContainer.removeEventListener('wheel', handleZoom);
      mapContainer.removeEventListener('touchstart', handleTouchStart);
      mapContainer.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isReady, currentMission, mapContainerId, completeMission]);

  // === TRIGGER: Map Tap ===
  useEffect(() => {
    if (!isReady || !currentMission || currentMission.trigger !== 'map_tap') return;

    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) return;

    const handleTap = () => {
      completeMission();
    };

    mapContainer.addEventListener('click', handleTap, { once: true });

    return () => {
      mapContainer.removeEventListener('click', handleTap);
    };
  }, [isReady, currentMission, mapContainerId, completeMission]);

  // === TRIGGER: Buzz Open (navigation to /buzz) ===
  useEffect(() => {
    if (!isReady || !currentMission || currentMission.trigger !== 'buzz_open') return;

    if (location === '/buzz' || location.startsWith('/buzz')) {
      completeMission();
    }
  }, [isReady, location, currentMission, completeMission]);

  // === TRIGGER: Nav Home ===
  useEffect(() => {
    if (!isReady || !currentMission || currentMission.trigger !== 'nav_home') return;

    if (location === '/home' && lastLocationRef.current !== '/home') {
      completeMission();
    }
    lastLocationRef.current = location;
  }, [isReady, location, currentMission, completeMission]);

  // Non mostrare se disabilitato o non pronto
  if (!MICRO_MISSIONS_ENABLED) return null;
  if (!isReady) return null;
  if (!currentMission && !showCompleted) return null;

  const missionIndex = getMissionIndex();
  const totalMissions = MICRO_MISSIONS.length;

  return (
    <AnimatePresence mode="wait">
      {/* === ANIMAZIONE COMPLETAMENTO === */}
      {showCompleted && (
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
            zIndex: 850,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              width: '100%',
              maxWidth: '340px',
              background: 'linear-gradient(145deg, rgba(0, 60, 30, 0.98), rgba(0, 80, 40, 0.95))',
              borderRadius: '20px',
              border: '2px solid rgba(0, 255, 150, 0.6)',
              boxShadow: '0 0 40px rgba(0, 255, 150, 0.4), 0 8px 32px rgba(0, 0, 0, 0.5)',
              padding: 'clamp(16px, 4vw, 24px)',
              textAlign: 'center',
              pointerEvents: 'auto',
            }}
          >
            {/* Checkmark animato */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{ marginBottom: '12px' }}
            >
              <CheckCircle2
                style={{
                  width: 'clamp(48px, 12vw, 64px)',
                  height: 'clamp(48px, 12vw, 64px)',
                  color: '#00FF96',
                  filter: 'drop-shadow(0 0 12px rgba(0, 255, 150, 0.8))',
                }}
              />
            </motion.div>

            <h3
              style={{
                fontSize: 'clamp(16px, 4vw, 20px)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '8px',
              }}
            >
              {completedText}
            </h3>

            <p
              style={{
                fontSize: 'clamp(11px, 2.5vw, 13px)',
                color: 'rgba(0, 255, 150, 0.8)',
                fontStyle: 'italic',
              }}
            >
              "{motivationText}"
            </p>

            {/* Progress dots */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '16px',
              }}
            >
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
                {missionIndex + 1}/{totalMissions}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: Math.min(totalMissions, 5) }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: i <= missionIndex ? '#00FF96' : 'rgba(255,255,255,0.2)',
                      boxShadow: i <= missionIndex ? '0 0 6px rgba(0, 255, 150, 0.6)' : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* === CARD MISSIONE ATTIVA === */}
      {!showCompleted && currentMission && (
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
            zIndex: 850,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            key={currentMission.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              width: '100%',
              maxWidth: '340px',
              background: 'linear-gradient(145deg, rgba(10, 20, 40, 0.98), rgba(15, 30, 60, 0.95))',
              borderRadius: '20px',
              border: '1px solid rgba(0, 209, 255, 0.4)',
              boxShadow: '0 0 30px rgba(0, 209, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              pointerEvents: 'auto',
            }}
          >
            {/* Progress bar in alto */}
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((missionIndex) / totalMissions) * 100}%` }}
                transition={{ duration: 0.5 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #00D1FF, #00FF96)',
                }}
              />
            </div>

            <div style={{ padding: 'clamp(12px, 3vw, 16px)' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: 'clamp(40px, 10vw, 48px)',
                    height: 'clamp(40px, 10vw, 48px)',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.2), rgba(0, 150, 255, 0.1))',
                    border: '1px solid rgba(0, 209, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(20px, 5vw, 24px)',
                    flexShrink: 0,
                  }}
                >
                  {currentMission.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '10px',
                      color: 'rgba(0, 209, 255, 0.7)',
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                      marginBottom: '2px',
                    }}
                  >
                    MISSION {missionIndex + 1}/{totalMissions}
                  </p>
                  <h3
                    style={{
                      fontSize: 'clamp(14px, 3.5vw, 16px)',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      margin: 0,
                    }}
                  >
                    {currentMission.title}
                  </h3>
                </div>
              </div>

              {/* Istruzione */}
              <p
                style={{
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 1.5,
                }}
              >
                👉 {currentMission.instruction}
              </p>

              {/* Pulsing indicator */}
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  marginTop: '12px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '10px', color: 'rgba(0, 209, 255, 0.6)' }}>
                  Waiting for action...
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

