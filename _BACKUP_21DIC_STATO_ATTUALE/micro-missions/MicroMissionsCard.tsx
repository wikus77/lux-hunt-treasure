/**
 * MICRO-MISSIONS CARD — M1SSION™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Bottom floating card for micro-missions.
 * ALWAYS RESPONSIVE, ALWAYS CENTERED.
 * Does NOT interfere with map pills, header, or bottom nav.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { CheckCircle2 } from 'lucide-react';
import {
  MICRO_MISSIONS_ENABLED,
  MicroMission,
  getCurrentMission,
  advanceToNextMission,
  areAllMissionsCompleted,
  getMissionIndex,
  MICRO_MISSIONS,
} from './MicroMissionsConfig';

interface MicroMissionsCardProps {
  mapContainerId?: string;
}

export default function MicroMissionsCard({ mapContainerId = 'ml-sandbox' }: MicroMissionsCardProps) {
  const [currentMission, setCurrentMission] = useState<MicroMission | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [completedText, setCompletedText] = useState('');
  const [location] = useLocation();

  // Initialize mission on mount
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED) return;
    if (areAllMissionsCompleted()) return;
    
    const mission = getCurrentMission();
    setCurrentMission(mission);
  }, []);

  // Complete mission and show celebration
  const completeMission = useCallback(() => {
    if (!currentMission) return;

    console.log(`[MicroMissions] ✅ Completed: ${currentMission.id}`);
    
    setCompletedText(currentMission.completeText);
    setShowCompleted(true);

    setTimeout(() => {
      setShowCompleted(false);
      const nextMission = advanceToNextMission();
      setCurrentMission(nextMission);
    }, 2000);
  }, [currentMission]);

  // Listen for map pan (drag)
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED || !currentMission) return;
    if (currentMission.trigger !== 'map_pan') return;

    let hasMoved = false;
    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) return;

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
  }, [currentMission, mapContainerId, completeMission]);

  // Listen for map zoom
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED || !currentMission) return;
    if (currentMission.trigger !== 'map_zoom') return;

    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) return;

    const handleZoom = () => {
      completeMission();
    };

    mapContainer.addEventListener('wheel', handleZoom, { passive: true });
    mapContainer.addEventListener('gesturechange', handleZoom, { passive: true });

    return () => {
      mapContainer.removeEventListener('wheel', handleZoom);
      mapContainer.removeEventListener('gesturechange', handleZoom);
    };
  }, [currentMission, mapContainerId, completeMission]);

  // Listen for marker click - use event delegation on map container
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED || !currentMission) return;
    if (currentMission.trigger !== 'marker_click') return;

    const handleMarkerClick = (e: Event) => {
      const target = e.target as HTMLElement;
      // Check if clicked on a marker (maplibre markers have specific classes)
      if (target.closest('.maplibregl-marker') || 
          target.closest('[data-marker]') ||
          target.classList.contains('marker') ||
          target.closest('.map-marker')) {
        completeMission();
      }
    };

    document.addEventListener('click', handleMarkerClick);
    return () => document.removeEventListener('click', handleMarkerClick);
  }, [currentMission, completeMission]);

  // Listen for Buzz page navigation
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED || !currentMission) return;
    if (currentMission.trigger !== 'buzz_open') return;

    if (location === '/buzz' || location.startsWith('/buzz')) {
      completeMission();
    }
  }, [location, currentMission, completeMission]);

  // Listen for Map navigation (return to map)
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED || !currentMission) return;
    if (currentMission.trigger !== 'nav_map') return;

    if (location === '/map-3d-tiler' || location.startsWith('/map')) {
      completeMission();
    }
  }, [location, currentMission, completeMission]);

  // Don't render if disabled or all completed
  if (!MICRO_MISSIONS_ENABLED) return null;
  if (!currentMission && !showCompleted) return null;

  const missionIndex = getMissionIndex();
  const totalMissions = MICRO_MISSIONS.length;

  // Navigate to CTA route
  const handleCTAClick = () => {
    if (currentMission?.cta) {
      window.location.href = currentMission.cta.route;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {/* Completion celebration */}
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
            zIndex: 900,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              width: '100%',
              maxWidth: '320px',
              borderRadius: '20px',
              padding: '24px',
              textAlign: 'center',
              background: 'linear-gradient(145deg, rgba(0, 60, 30, 0.98), rgba(0, 80, 40, 0.95))',
              border: '2px solid rgba(0, 255, 150, 0.6)',
              boxShadow: '0 0 40px rgba(0, 255, 150, 0.4), 0 8px 32px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'auto',
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <CheckCircle2 
                style={{ 
                  width: '56px', 
                  height: '56px', 
                  color: '#34D399',
                  filter: 'drop-shadow(0 0 12px rgba(0, 255, 150, 0.8))',
                  margin: '0 auto 12px',
                }} 
              />
            </motion.div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: 'white', 
              marginBottom: '8px' 
            }}>
              {completedText}
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              marginTop: '12px',
            }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                {missionIndex + 1}/{totalMissions}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: totalMissions }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: i <= missionIndex ? '#00FF96' : 'rgba(255,255,255,0.2)',
                      boxShadow: i <= missionIndex ? '0 0 6px rgba(0, 255, 150, 0.6)' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Active mission card */}
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
            zIndex: 900,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            key={currentMission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              width: '100%',
              maxWidth: '320px',
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, rgba(10, 20, 40, 0.98), rgba(15, 30, 60, 0.95))',
              border: '1px solid rgba(0, 209, 255, 0.4)',
              boxShadow: '0 0 30px rgba(0, 209, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'auto',
            }}
          >
            {/* Progress bar */}
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #00D1FF, #34D399)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(missionIndex / totalMissions) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div style={{ padding: '16px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.2), rgba(0, 150, 255, 0.1))',
                    border: '1px solid rgba(0, 209, 255, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  {currentMission.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    fontSize: '10px', 
                    color: 'rgba(0, 209, 255, 0.7)', 
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    marginBottom: '2px',
                  }}>
                    MISSION {missionIndex + 1}/{totalMissions}
                  </p>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: 'white',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {currentMission.title}
                  </h3>
                </div>
              </div>

              {/* Instruction */}
              <p style={{ 
                fontSize: '14px', 
                color: 'rgba(255, 255, 255, 0.8)', 
                lineHeight: 1.5,
              }}>
                👉 {currentMission.instruction}
              </p>

              {/* CTA Button if available */}
              {currentMission.cta && (
                <motion.button
                  onClick={handleCTAClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #00D1FF, #0080FF)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0, 209, 255, 0.3)',
                  }}
                >
                  {currentMission.cta.text}
                </motion.button>
              )}

              {/* Pulsing indicator */}
              {!currentMission.cta && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ marginTop: '12px', textAlign: 'center' }}
                >
                  <span style={{ fontSize: '11px', color: 'rgba(0, 209, 255, 0.6)' }}>
                    Waiting for action...
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

