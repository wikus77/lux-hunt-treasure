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
  isOnboardingCompleted,
  getCurrentMission,
  getMissionIndex,
  advanceMission,
  areMissionsCompleted,
} from '@/config/firstSessionConfig';
import { supabase } from '@/integrations/supabase/client';

// Premio per completamento micro-missions
const MICRO_MISSIONS_REWARD_M1U = 50;
const MICRO_MISSIONS_REWARDED_KEY = 'm1_micro_missions_rewarded';
import { useEntityOverlayStore } from '@/stores/entityOverlayStore';

interface MicroMissionsCardProps {
  /** ID del container mappa */
  mapContainerId?: string;
}

const POPUP_ID = 'micro-missions';

export default function MicroMissionsCard({ mapContainerId = 'ml-sandbox' }: MicroMissionsCardProps) {
  const [currentMission, setCurrentMission] = useState<MicroMission | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showFinalCelebration, setShowFinalCelebration] = useState(false);
  const [completedText, setCompletedText] = useState('');
  const [motivationText, setMotivationText] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [location, setLocation] = useLocation();
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

  // ✅ INIT: Carica missione e diventa ready in base alla pagina
  // ✅ FIX 23/12/2025: Aspetta che l'onboarding sia completato
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED) {
      console.log('[MicroMissions] ❌ Disabled');
      return;
    }
    if (areMissionsCompleted()) {
      console.log('[MicroMissions] ✅ All missions completed');
      return;
    }

    // ✅ FIX: Aspetta onboarding completato
    const checkOnboardingAndInit = () => {
      if (!isOnboardingCompleted()) {
        console.log('[MicroMissions] ⏳ Waiting for onboarding to complete...');
        return false;
      }

      const mission = getCurrentMission();
      const isOnHomePage = location === '/home';
      const isOnMapPage = location.includes('/map');
      const isOnBuzzPage = location.includes('/buzz');
      
      console.log('[MicroMissions] 📍 Init check:', {
        location,
        isOnHomePage,
        isOnMapPage,
        isOnBuzzPage,
        missionId: mission?.id,
        missionTrigger: mission?.trigger,
        missionIndex: getMissionIndex(),
        onboardingCompleted: true
      });

      // HOME PAGE: diventa ready
      if (isOnHomePage) {
        // ✅ FIX 23/12/2025: Includi anche nav_home per quando l'utente arriva dalla mappa/buzz
        const homeAllowedTriggers = ['home_tap', 'nav_home'];
        if (mission && homeAllowedTriggers.includes(mission.trigger)) {
          console.log('[MicroMissions] 🏠 Home ready - showing mission:', mission.id);
          setTimeout(() => {
            setIsReady(true);
            setCurrentMission(mission);
            highlightElement(mission.highlightSelector);
          }, 1000);
          return true;
        }
      }

      // BUZZ PAGE: mostra missione se siamo in buzz_open o nav_home
      if (isOnBuzzPage) {
        if (mission && (mission.trigger === 'buzz_open' || mission.trigger === 'nav_home')) {
          console.log('[MicroMissions] ⚡ Buzz page - showing mission:', mission.id);
          setTimeout(() => {
            setIsReady(true);
            setCurrentMission(mission);
          }, 500);
          return true;
        }
      }

      // MAP PAGE: aspetta HUD dismissed
      if (isOnMapPage) {
        const mapTriggers = ['map_pan', 'map_zoom', 'map_tap', 'buzz_open', 'nav_home'];
        if (mission && mapTriggers.includes(mission.trigger)) {
          if (isHudDismissed()) {
            console.log('[MicroMissions] 🗺️ Map ready - showing mission:', mission?.id);
            setTimeout(() => {
              setIsReady(true);
              setCurrentMission(mission);
            }, TIMING.FIRST_MISSION_DELAY_MS);
            return true;
          }
        }
      }

      return false;
    };

    // Check immediato
    if (checkOnboardingAndInit()) return;

    // Polling se non ready
    const interval = setInterval(() => {
      if (checkOnboardingAndInit()) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [location]);

  // ✅ FIX 23/12/2025: Funzione per evidenziare elemento E scrollare verso di esso
  // ✅ FIX: Scroll in modo che l'elemento sia visibile SOTTO il popup
  const highlightElement = useCallback((selector?: string) => {
    if (!selector) return;
    
    // Rimuovi highlight precedenti
    document.querySelectorAll('.micro-mission-highlight').forEach(el => {
      el.classList.remove('micro-mission-highlight');
    });
    
    // Aggiungi highlight al nuovo elemento
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('micro-mission-highlight');
      
      // ✅ FIX: Scroll con offset - elemento deve apparire SOTTO il popup
      // Il popup è alto ~250px e centrato, quindi l'elemento deve essere nella parte bassa dello schermo
      setTimeout(() => {
        const elementRect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const popupApproxHeight = 280; // Altezza approssimativa del popup micro-mission
        const topPadding = (viewportHeight / 2) + (popupApproxHeight / 2) + 20; // Centro schermo + metà popup + margine
        
        // Calcola quanto scrollare per posizionare l'elemento sotto il popup
        const scrollTarget = window.scrollY + elementRect.top - topPadding;
        
        // Scroll solo se l'elemento è coperto dal popup
        if (elementRect.top < topPadding) {
          window.scrollTo({
            top: Math.max(0, scrollTarget),
            behavior: 'smooth'
          });
        } else {
          // Se l'elemento è già sotto il popup, scrolliamo per centrarlo nella parte visibile inferiore
          const visibleAreaStart = topPadding;
          const visibleAreaEnd = viewportHeight;
          const visibleAreaCenter = visibleAreaStart + (visibleAreaEnd - visibleAreaStart) / 2;
          
          // Calcola lo scroll per centrare l'elemento nella parte visibile
          const targetY = window.scrollY + elementRect.top - visibleAreaCenter + (elementRect.height / 2);
          
          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: 'smooth'
          });
        }
      }, 200);
      
      console.log('[MicroMissions] 🎯 Highlighted + scrolled to element (below popup):', selector);
    } else {
      console.log('[MicroMissions] ⚠️ Element not found:', selector);
    }
  }, []);

  // ✅ Refresh missione corrente quando si ritorna su una pagina
  useEffect(() => {
    if (!MICRO_MISSIONS_ENABLED || areMissionsCompleted() || !isReady) return;
    
    const mission = getCurrentMission();
    if (mission && mission.id !== currentMission?.id) {
      console.log('[MicroMissions] 🔄 Mission refresh:', mission?.id);
      setCurrentMission(mission);
      // Evidenzia l'elemento se la missione lo richiede
      if (mission.highlightSelector) {
        setTimeout(() => highlightElement(mission.highlightSelector), 500);
      }
    }
  }, [location, isReady, currentMission?.id, highlightElement]);
  
  // ✅ FIX 23/12/2025: Evidenzia elemento quando cambia missione
  useEffect(() => {
    if (!currentMission) {
      // Rimuovi tutti gli highlight
      document.querySelectorAll('.micro-mission-highlight').forEach(el => {
        el.classList.remove('micro-mission-highlight');
      });
      return;
    }
    
    if (currentMission.highlightSelector) {
      // Delay per assicurarsi che la UI sia caricata
      const timer = setTimeout(() => {
        highlightElement(currentMission.highlightSelector);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentMission, highlightElement]);

  // Completa missione e mostra animazione
  const completeMission = useCallback(() => {
    if (!currentMission) return;

    console.log(`[MicroMissions] ✅ Mission completed: ${currentMission.id}`);
    
    // ✅ FIX 23/12/2025: Rimuovi highlight al completamento
    document.querySelectorAll('.micro-mission-highlight').forEach(el => {
      el.classList.remove('micro-mission-highlight');
    });
    
    // Verifica se è l'ultima missione
    const currentIndex = getMissionIndex();
    const isLastMission = currentIndex >= MICRO_MISSIONS.length - 1;
    
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
      
      // ✅ FIX: Evidenzia prossimo elemento se necessario
      if (nextMission?.highlightSelector) {
        setTimeout(() => highlightElement(nextMission.highlightSelector), 500);
      }
      
      // Se era l'ultima missione, mostra celebrazione finale
      if (isLastMission) {
        setTimeout(() => {
          setShowFinalCelebration(true);
        }, 500);
      }
    }, TIMING.MISSION_COMPLETE_ANIMATION_MS);
  }, [currentMission, highlightElement]);

  // === TRIGGER: Map Pan (drag) ===
  useEffect(() => {
    if (!isReady || !currentMission || currentMission.trigger !== 'map_pan') return;
    if (!location.includes('/map')) return; // Solo sulla mappa

    let hasMoved = false;
    let cleanupFn: (() => void) | null = null;

    const setupListener = () => {
      const mapContainer = document.getElementById(mapContainerId);
      if (!mapContainer) {
        console.log('[MicroMissions] ⏳ Waiting for map container...');
        return false;
      }

      const handleMove = () => {
        if (hasMoved) return;
        hasMoved = true;
        completeMission();
      };

      mapContainer.addEventListener('touchmove', handleMove, { passive: true });
      mapContainer.addEventListener('mousemove', handleMove, { passive: true });
      console.log('[MicroMissions] ✅ Map pan listener attached');

      cleanupFn = () => {
        mapContainer.removeEventListener('touchmove', handleMove);
        mapContainer.removeEventListener('mousemove', handleMove);
      };
      return true;
    };

    // Try immediately, then poll
    if (!setupListener()) {
      const interval = setInterval(() => {
        if (setupListener()) {
          clearInterval(interval);
        }
      }, 500);
      return () => {
        clearInterval(interval);
        cleanupFn?.();
      };
    }

    return () => cleanupFn?.();
  }, [isReady, currentMission, mapContainerId, completeMission, location]);

  // === TRIGGER: Map Zoom ===
  useEffect(() => {
    if (!isReady || !currentMission || currentMission.trigger !== 'map_zoom') return;
    if (!location.includes('/map')) return; // Solo sulla mappa

    let hasZoomed = false;
    let cleanupFn: (() => void) | null = null;

    const setupListener = () => {
      const mapContainer = document.getElementById(mapContainerId);
      if (!mapContainer) {
        console.log('[MicroMissions] ⏳ Waiting for map container (zoom)...');
        return false;
      }

      const handleZoom = () => {
        if (hasZoomed) return;
        hasZoomed = true;
        completeMission();
      };

      let touchCount = 0;
      const handleTouchStart = (e: TouchEvent) => {
        touchCount = e.touches.length;
      };
      const handleTouchMove = () => {
        if (touchCount >= 2 && !hasZoomed) {
          hasZoomed = true;
          completeMission();
        }
      };

      mapContainer.addEventListener('wheel', handleZoom, { passive: true });
      mapContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
      mapContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
      console.log('[MicroMissions] ✅ Map zoom listener attached');

      cleanupFn = () => {
        mapContainer.removeEventListener('wheel', handleZoom);
        mapContainer.removeEventListener('touchstart', handleTouchStart);
        mapContainer.removeEventListener('touchmove', handleTouchMove);
      };
      return true;
    };

    if (!setupListener()) {
      const interval = setInterval(() => {
        if (setupListener()) {
          clearInterval(interval);
        }
      }, 500);
      return () => {
        clearInterval(interval);
        cleanupFn?.();
      };
    }

    return () => cleanupFn?.();
  }, [isReady, currentMission, mapContainerId, completeMission, location]);

  // === TRIGGER: Map Tap ===
  useEffect(() => {
    if (!isReady || !currentMission || currentMission.trigger !== 'map_tap') return;
    if (!location.includes('/map')) return; // Solo sulla mappa

    let cleanupFn: (() => void) | null = null;

    const setupListener = () => {
      const mapContainer = document.getElementById(mapContainerId);
      if (!mapContainer) {
        console.log('[MicroMissions] ⏳ Waiting for map container (tap)...');
        return false;
      }

      const handleTap = () => {
        completeMission();
      };

      mapContainer.addEventListener('click', handleTap, { once: true });
      console.log('[MicroMissions] ✅ Map tap listener attached');

      cleanupFn = () => {
        mapContainer.removeEventListener('click', handleTap);
      };
      return true;
    };

    if (!setupListener()) {
      const interval = setInterval(() => {
        if (setupListener()) {
          clearInterval(interval);
        }
      }, 500);
      return () => {
        clearInterval(interval);
        cleanupFn?.();
      };
    }

    return () => cleanupFn?.();
  }, [isReady, currentMission, mapContainerId, completeMission, location]);

  // === TRIGGER: Buzz Open (navigation to /buzz) ===
  // ✅ FIX 23/12/2025: NON completare automaticamente - mostra popup su /buzz invece
  // La missione viene completata quando l'utente preme "GO TO HOME" nel popup
  useEffect(() => {
    if (!isReady || !currentMission || currentMission.trigger !== 'buzz_open') return;
    
    // Se siamo su /buzz, aggiorna lo stato per mostrare il popup "vai alla home"
    if (location === '/buzz' || location.startsWith('/buzz')) {
      console.log('[MicroMissions] ⚡ On Buzz page - showing "go to home" popup');
      // NON chiamare completeMission() qui - lascia che l'utente prema il tasto
    }
  }, [isReady, location, currentMission]);

  // === TRIGGER: Nav Home ===
  // ✅ FIX 23/12/2025: Completa quando l'utente arriva su /home
  useEffect(() => {
    if (!isReady || !currentMission || currentMission.trigger !== 'nav_home') return;

    // Se siamo su home, completa la missione (l'utente è arrivato)
    if (location === '/home') {
      console.log('[MicroMissions] 🏠 Arrived at home - completing nav_home mission');
      // Delay breve per permettere al popup di mostrarsi prima del completamento
      const timer = setTimeout(() => {
        completeMission();
      }, 1000);
      return () => clearTimeout(timer);
    }
    lastLocationRef.current = location;
  }, [isReady, location, currentMission, completeMission]);

  // === TRIGGER: Home Tap (tap anywhere on home to acknowledge) ===
  useEffect(() => {
    if (!isReady || !currentMission || currentMission.trigger !== 'home_tap') return;
    
    // Solo sulla home page
    if (location !== '/home') return;

    // Il tap avviene sul tasto "TAP TO CONTINUE" nel popup
    // Non serve listener globale, il tasto gestisce il completamento
  }, [isReady, location, currentMission]);

  // Non mostrare se disabilitato o non pronto
  if (!MICRO_MISSIONS_ENABLED) return null;
  if (!isReady) return null;
  if (!currentMission && !showCompleted && !showFinalCelebration) return null;

  // ✅ Mostra missioni solo nella pagina corretta
  const mapTriggers = ['map_pan', 'map_zoom', 'map_tap', 'buzz_open', 'nav_home'];
  const homeTriggers = ['home_tap'];
  const isMapPage = location.includes('/map');
  const isHomePage = location === '/home';
  const isBuzzPage = location.includes('/buzz');

  // Se stiamo mostrando completamento, mostralo ovunque
  if (!showCompleted && currentMission) {
    // ✅ FIX 23/12/2025: buzz_open si mostra sia su mappa che su /buzz
    if (currentMission.trigger === 'buzz_open') {
      if (!isMapPage && !isBuzzPage) return null;
    }
    // ✅ FIX 23/12/2025: nav_home si mostra su mappa, buzz E home (per completare quando arriva)
    else if (currentMission.trigger === 'nav_home') {
      if (!isMapPage && !isBuzzPage && !isHomePage) return null;
    }
    // Missioni mappa solo sulla mappa
    else if (mapTriggers.includes(currentMission.trigger) && !isMapPage) return null;
    // Missioni home solo sulla home
    if (homeTriggers.includes(currentMission.trigger) && !isHomePage) return null;
  }

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

              {/* ✅ FIX 23/12/2025: Tasto OPEN BUZZ per missione buzz_open - solo su mappa */}
              {currentMission.trigger === 'buzz_open' && !isBuzzPage && (
                <motion.button
                  onClick={() => {
                    setLocation('/buzz');
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    background: 'linear-gradient(135deg, #00D1FF, #0096FF)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: 'clamp(13px, 3vw, 15px)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0, 209, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  ⚡ OPEN BUZZ
                </motion.button>
              )}

              {/* ✅ FIX 23/12/2025: Popup su /buzz - "Hai scoperto Buzz! Vai alla Home" */}
              {currentMission.trigger === 'buzz_open' && isBuzzPage && (
                <>
                  <p
                    style={{
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      color: 'rgba(0, 255, 136, 0.9)',
                      lineHeight: 1.5,
                      marginTop: '8px',
                      fontWeight: 600,
                    }}
                  >
                    ✅ Hai scoperto Buzz! Ora vai alla Home per continuare la scoperta.
                  </p>
                  <motion.button
                    onClick={() => {
                      completeMission();
                      // ✅ FIX: Naviga DOPO che la missione è stata avanzata (2500ms > 2000ms)
                      setTimeout(() => setLocation('/home'), TIMING.MISSION_COMPLETE_ANIMATION_MS + 500);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      marginTop: '12px',
                      width: '100%',
                      padding: 'clamp(10px, 2.5vw, 14px)',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: 'clamp(13px, 3vw, 15px)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    🏠 GO TO HOME
                  </motion.button>
                </>
              )}

              {/* ✅ Tasto GO HOME per missione nav_home */}
              {currentMission.trigger === 'nav_home' && !isHomePage && (
                <motion.button
                  onClick={() => {
                    completeMission();
                    // ✅ FIX: Naviga DOPO che la missione è stata avanzata
                    setTimeout(() => setLocation('/home'), TIMING.MISSION_COMPLETE_ANIMATION_MS + 500);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: 'clamp(13px, 3vw, 15px)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  🏠 GO TO HOME
                </motion.button>
              )}

              {/* ✅ Tasto TAP TO CONTINUE per missioni home_tap */}
              {currentMission.trigger === 'home_tap' && (
                <motion.button
                  onClick={() => completeMission()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: 'clamp(13px, 3vw, 15px)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  👆 TAP TO CONTINUE
                </motion.button>
              )}

              {/* Pulsing indicator - solo per missioni mappa senza tasto */}
              {!['buzz_open', 'nav_home', 'home_tap'].includes(currentMission.trigger) && (
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
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* === POPUP FINALE DI CELEBRAZIONE - GREEN GLASS STYLE === */}
      {showFinalCelebration && (
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
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'auto',
          }}
        >
          <motion.div
            key="final-celebration"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'linear-gradient(145deg, rgba(0, 40, 40, 0.98), rgba(0, 60, 60, 0.95))',
              borderRadius: '28px',
              border: '2px solid rgba(0, 255, 136, 0.6)',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.4), 0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
              padding: 'clamp(24px, 6vw, 40px)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ambient glow */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 255, 136, 0.2) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
            {/* Emoji celebrativa */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
              style={{ marginBottom: '16px' }}
            >
              <span style={{ fontSize: 'clamp(56px, 15vw, 72px)' }}>🏆</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: 'clamp(26px, 6vw, 34px)',
                fontWeight: 800,
                color: '#00FF88',
                textShadow: '0 0 30px rgba(0, 255, 136, 0.6)',
                marginBottom: '16px',
              }}
            >
              DISCOVERY COMPLETE!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.6,
                marginBottom: '8px',
              }}
            >
              Hai completato tutte le micro-missioni!
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                color: 'rgba(0, 209, 255, 0.8)',
                fontStyle: 'italic',
                marginBottom: '20px',
              }}
            >
              "You are now ready for the real hunt."
            </motion.p>

            {/* Stats + Premio */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFD700' }}>
                  {totalMissions}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
                  MISSIONS
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#00FF96' }}>
                  100%
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
                  COMPLETE
                </div>
              </div>
            </motion.div>

            {/* ✅ FIX 23/12/2025: Premio 50 M1U */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.1))',
                border: '2px solid rgba(255, 215, 0, 0.5)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
                🎁 IL TUO PREMIO
              </div>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: 800, 
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                +{MICRO_MISSIONS_REWARD_M1U} M1U
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(0, 209, 255, 0.8)', marginTop: '4px' }}>
                Verranno aggiunti al tuo saldo
              </div>
            </motion.div>

            {/* Tasto chiudi */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={async () => {
                // ✅ FIX 23/12/2025: Accredita 50 M1U SOLO UNA VOLTA per utente
                const alreadyRewarded = localStorage.getItem(MICRO_MISSIONS_REWARDED_KEY) === 'true';
                
                if (!alreadyRewarded) {
                  console.log('[MicroMissions] 🎰 Crediting reward (first time):', MICRO_MISSIONS_REWARD_M1U, 'M1U');
                  
                  try {
                    // ✅ FIX: Accredita REALMENTE i M1U nel database
                    const { data: authData } = await supabase.auth.getUser();
                    if (authData?.user?.id) {
                      // Leggi saldo attuale
                      const { data: profile } = await supabase
                        .from('profiles')
                        .select('m1_units')
                        .eq('id', authData.user.id)
                        .single();
                      
                      const currentBalance = profile?.m1_units || 0;
                      const newBalance = currentBalance + MICRO_MISSIONS_REWARD_M1U;
                      
                      // Aggiorna saldo
                      const { error: updateError } = await supabase
                        .from('profiles')
                        .update({ 
                          m1_units: newBalance,
                          updated_at: new Date().toISOString()
                        })
                        .eq('id', authData.user.id);
                      
                      if (!updateError) {
                        console.log('[MicroMissions] ✅ M1U credited successfully:', { oldBalance: currentBalance, newBalance });
                        
                        // ✅ FIX: Dispatch evento m1u-credited per animazione slot machine
                        window.dispatchEvent(new CustomEvent('m1u-credited', {
                          detail: { amount: MICRO_MISSIONS_REWARD_M1U }
                        }));
                        
                        // Segna come già premiato
                        localStorage.setItem(MICRO_MISSIONS_REWARDED_KEY, 'true');
                      } else {
                        console.error('[MicroMissions] ❌ Failed to credit M1U:', updateError);
                      }
                    }
                  } catch (err) {
                    console.error('[MicroMissions] ❌ Error crediting M1U:', err);
                  }
                } else {
                  console.log('[MicroMissions] ℹ️ User already rewarded, skipping credit');
                }
                
                // ✅ FIX 23/12/2025: Scroll in alto della pagina Home
                setTimeout(() => {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }, 100);
                
                // Chiudi popup
                setShowFinalCelebration(false);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: 'clamp(12px, 3vw, 16px)',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                border: 'none',
                borderRadius: '14px',
                color: '#0a0b0f',
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
              }}
            >
              🚀 START THE HUNT
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

