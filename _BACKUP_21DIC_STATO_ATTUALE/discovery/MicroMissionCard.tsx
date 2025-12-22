/**
 * MICRO-MISSION CARD — M1SSION™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Bottom floating card that shows the current micro-mission.
 * ALWAYS VISIBLE until mission is completed.
 * Impossible to ignore.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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
} from '@/config/microMissions';
import { isFirstSession } from '@/config/firstSessionFlags';

interface MicroMissionCardProps {
  mapContainerId?: string;
}

export default function MicroMissionCard({ mapContainerId = 'ml-sandbox' }: MicroMissionCardProps) {
  const [currentMission, setCurrentMission] = useState<MicroMission | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [completedText, setCompletedText] = useState('');
  const [motivationText, setMotivationText] = useState('');
  const [location] = useLocation();
  const lastLocationRef = useRef(location);

  // Initialize mission on mount
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED) return;
    // Only show for first session users
    if (!isFirstSession() && areAllMissionsCompleted()) return;
    
    const mission = getCurrentMission();
    setCurrentMission(mission);
    console.log('[MicroMissionCard] 🎯 Current mission:', mission?.id || 'COMPLETED');
  }, []);

  // Complete mission and show celebration
  const completeMission = useCallback(() => {
    if (!currentMission) return;

    console.log(`[MicroMissionCard] ✅ Mission completed: ${currentMission.id}`);
    
    // Show completion state
    setCompletedText(currentMission.completeText);
    setMotivationText(currentMission.motivationText || '');
    setShowCompleted(true);

    // After delay, advance to next mission
    setTimeout(() => {
      setShowCompleted(false);
      const nextMission = advanceToNextMission();
      setCurrentMission(nextMission);
    }, 2500);
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

    // Listen for drag events
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

    mapContainer.addEventListener('wheel', handleZoom, { once: true, passive: true });
    
    // Touch pinch zoom
    let initialDistance = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (Math.abs(distance - initialDistance) > 30) {
          completeMission();
        }
      }
    };

    mapContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    mapContainer.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      mapContainer.removeEventListener('wheel', handleZoom);
      mapContainer.removeEventListener('touchstart', handleTouchStart);
      mapContainer.removeEventListener('touchmove', handleTouchMove);
    };
  }, [currentMission, mapContainerId, completeMission]);

  // Listen for marker click (or any map tap for simplicity)
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED || !currentMission) return;
    if (currentMission.trigger !== 'marker_click') return;

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      // For onboarding: any tap on the map canvas counts as "tap a marker"
      const isMapCanvas = target.closest('.maplibregl-canvas') ||
                          target.closest('.maplibregl-canvas-container') ||
                          target.closest('#ml-sandbox') ||
                          target.closest('[data-marker]') || 
                          target.closest('.maplibregl-popup') ||
                          target.closest('.maplibregl-marker') ||
                          target.closest('[class*="marker"]');
      if (isMapCanvas) {
        completeMission();
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('touchend', handleClick, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchend', handleClick);
    };
  }, [currentMission, completeMission]);

  // Listen for Buzz page visit
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED || !currentMission) return;
    if (currentMission.trigger !== 'buzz_open') return;

    if (location === '/buzz' || location.startsWith('/buzz')) {
      completeMission();
    }
  }, [location, currentMission, completeMission]);

  // Listen for Home navigation
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED || !currentMission) return;
    if (currentMission.trigger !== 'nav_home') return;

    if (location === '/home' && lastLocationRef.current !== '/home') {
      completeMission();
    }
    lastLocationRef.current = location;
  }, [location, currentMission, completeMission]);

  // Listen for Map navigation
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED || !currentMission) return;
    if (currentMission.trigger !== 'nav_map') return;

    if ((location === '/map-3d-tiler' || location.startsWith('/map')) && 
        lastLocationRef.current !== '/map-3d-tiler') {
      completeMission();
    }
    lastLocationRef.current = location;
  }, [location, currentMission, completeMission]);

  // Don't render if disabled or all completed
  if (!MICRO_MISSIONS_ENABLED) return null;
  if (!currentMission && !showCompleted) return null;

  const missionIndex = getMissionIndex();
  const totalMissions = MICRO_MISSIONS.length;

  return (
    <AnimatePresence mode="wait">
      {/* Completion celebration - CENTERED with high z-index */}
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
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-[340px] rounded-2xl p-5 text-center pointer-events-auto"
            style={{
              background: 'linear-gradient(145deg, rgba(0, 60, 30, 0.98), rgba(0, 80, 40, 0.95))',
              border: '2px solid rgba(0, 255, 150, 0.6)',
              boxShadow: '0 0 40px rgba(0, 255, 150, 0.4), 0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Big checkmark */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="mx-auto mb-3"
            >
              <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-400" style={{ filter: 'drop-shadow(0 0 12px rgba(0, 255, 150, 0.8))' }} />
            </motion.div>

            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{completedText}</h3>
            {motivationText && (
              <p className="text-xs sm:text-sm text-emerald-300/80 italic">"{motivationText}"</p>
            )}

            {/* Progress */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-xs text-white/60">Mission {missionIndex + 1}/{totalMissions}</span>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalMissions, 10) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
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

      {/* Active mission card - CENTERED with high z-index */}
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
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            key={currentMission.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-[340px] rounded-2xl overflow-hidden pointer-events-auto"
            style={{
              background: 'linear-gradient(145deg, rgba(10, 20, 40, 0.98), rgba(15, 30, 60, 0.95))',
              border: '1px solid rgba(0, 209, 255, 0.4)',
              boxShadow: '0 0 30px rgba(0, 209, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Progress bar at top */}
            <div className="h-1 bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${((missionIndex) / totalMissions) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="p-3 sm:p-4">
              {/* Header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.2), rgba(0, 150, 255, 0.1))',
                    border: '1px solid rgba(0, 209, 255, 0.3)',
                  }}
                >
                  {currentMission.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-cyan-400/70 font-medium tracking-wider">
                    MISSION {missionIndex + 1}/{totalMissions}
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    {currentMission.title}
                  </h3>
                </div>
              </div>

              {/* Instruction */}
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                👉 {currentMission.instruction}
              </p>

              {/* Pulsing indicator */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-2 sm:mt-3 text-center"
              >
                <span className="text-[10px] sm:text-xs text-cyan-400/60">
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

