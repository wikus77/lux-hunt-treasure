// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ v7 - Event Engine Hook
// v4: Shadow War AI Level Upgrade - Template selection based on threat level
// v7: Post-glitch message requests, unified engine coordination

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import {
  SHADOW_MESSAGE_TEMPLATES,
  SHADOW_PROTOCOL_TIMING,
  SHADOW_EXCLUDED_PATHS,
  SHADOW_PREFERRED_PATHS,
  FULL_WAR_ENABLED,
  getMissionPhase,
  getTemplatesForContext,
  getChainResponseTemplate,
  getWeightMultiplierForThreat,
  type ShadowMessageTemplate,
} from '@/config/shadowProtocolConfig';
import { 
  useEntityOverlayStore, 
  SHADOW_DEBUG,
} from '@/stores/entityOverlayStore';

// ============================================================================
// HOOK
// ============================================================================

export function useEntityEventEngine(): void {
  const { user, isAuthenticated } = useUnifiedAuth();
  const [location] = useLocation();
  
  // Ottieni stato e azioni dallo store
  const eventsShownThisSession = useEntityOverlayStore((s) => s.eventsShownThisSession);
  const isVisible = useEntityOverlayStore((s) => s.isVisible);
  const showOverlay = useEntityOverlayStore((s) => s.showOverlay);
  const pendingContextTrigger = useEntityOverlayStore((s) => s.pendingContextTrigger);
  const clearContextTrigger = useEntityOverlayStore((s) => s.clearContextTrigger);
  const isIntroActive = useEntityOverlayStore((s) => s.isIntroActive);
  const introStartTime = useEntityOverlayStore((s) => s.introStartTime);
  // 🆕 v9: Popup Interaction Blocker
  const isPopupInteractionActive = useEntityOverlayStore((s) => s.isPopupInteractionActive);
  const pendingChainTriggerId = useEntityOverlayStore((s) => s.pendingChainTriggerId);
  const setPendingChain = useEntityOverlayStore((s) => s.setPendingChain);
  
  // v3: Timer persistente
  const nextEventTimestamp = useEntityOverlayStore((s) => s.nextEventTimestamp);
  const setNextEventTimestamp = useEntityOverlayStore((s) => s.setNextEventTimestamp);
  const isFirstEventTriggered = useEntityOverlayStore((s) => s.isFirstEventTriggered);
  const markFirstEventTriggered = useEntityOverlayStore((s) => s.markFirstEventTriggered);
  const hasEnteredPreferredRoute = useEntityOverlayStore((s) => s.hasEnteredPreferredRoute);
  const markPreferredRouteEntered = useEntityOverlayStore((s) => s.markPreferredRouteEntered);
  const setIntroActive = useEntityOverlayStore((s) => s.setIntroActive);
  
  // 🆕 v4: Threat Level
  const shadowThreatLevel = useEntityOverlayStore((s) => s.shadowThreatLevel);
  const checkInactivityDecay = useEntityOverlayStore((s) => s.checkInactivityDecay);
  
  // Refs
  const timerRef = useRef<number | null>(null);
  const contextTimerRef = useRef<number | null>(null);
  const chainTimerRef = useRef<number | null>(null);
  const introTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const inactivityCheckedRef = useRef(false);

  // =========================================================================
  // 🆕 v4: Funzione per scegliere un template pesato CON THREAT LEVEL
  // =========================================================================
  const chooseWeightedTemplate = useCallback((
    candidates: ShadowMessageTemplate[],
    threatLevel: number
  ): ShadowMessageTemplate | null => {
    if (!candidates.length) return null;

    // Filtra template con weight > 0
    const validCandidates = candidates.filter((c) => c.weight > 0);
    if (!validCandidates.length) return null;

    // 🆕 v4: Calcola pesi aggiustati per threat level
    const adjustedWeights = validCandidates.map((template) => {
      const multiplier = getWeightMultiplierForThreat(template, threatLevel);
      const adjustedWeight = template.weight * multiplier;
      
      if (SHADOW_DEBUG && multiplier !== 1) {
        console.log('[SHADOW PROTOCOL v4] 🎯 Weight adjusted:', {
          id: template.id,
          entity: template.entity,
          intensity: template.intensity,
          originalWeight: template.weight,
          multiplier: Math.round(multiplier * 100) / 100,
          adjustedWeight: Math.round(adjustedWeight * 100) / 100,
        });
      }
      
      return { template, adjustedWeight };
    });

    const totalWeight = adjustedWeights.reduce((sum, c) => sum + c.adjustedWeight, 0);
    let random = Math.random() * totalWeight;

    for (const { template, adjustedWeight } of adjustedWeights) {
      random -= adjustedWeight;
      if (random <= 0) {
        return template;
      }
    }

    return adjustedWeights[0]?.template || null;
  }, []);

  // =========================================================================
  // Verifica se siamo su una route valida
  // =========================================================================
  const isValidRoute = useCallback((path: string): boolean => {
    const isExcluded = SHADOW_EXCLUDED_PATHS.some((p) => path.startsWith(p));
    return !isExcluded;
  }, []);

  const isPreferredRoute = useCallback((path: string): boolean => {
    return SHADOW_PREFERRED_PATHS.some((p) => path.startsWith(p));
  }, []);

  // =========================================================================
  // Genera nuovo timestamp per prossimo evento
  // =========================================================================
  const generateNextTimestamp = useCallback((useFirstEventDelay: boolean = false): number => {
    const { MIN_INTERVAL_MS, MAX_INTERVAL_MS, FIRST_EVENT_DELAY_MS } = SHADOW_PROTOCOL_TIMING;
    
    if (useFirstEventDelay) {
      return Date.now() + FIRST_EVENT_DELAY_MS;
    }
    
    const delay = Math.floor(MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS));
    return Date.now() + delay;
  }, []);

  // =========================================================================
  // 🆕 v4: Funzione per triggerare un evento generico CON THREAT LEVEL
  // =========================================================================
  const triggerEvent = useCallback(() => {
    if (!mountedRef.current) return;
    
    const phase = getMissionPhase();
    const threatLevel = useEntityOverlayStore.getState().shadowThreatLevel;

    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] 🌑 Selecting template with:', {
        phase,
        threatLevel,
        location,
      });
    }

    const candidates = SHADOW_MESSAGE_TEMPLATES.filter((tpl) => {
      const [minWeek, maxWeek] = tpl.weekRange;
      
      if (phase < minWeek || phase > maxWeek) return false;
      
      if (!FULL_WAR_ENABLED && phase === 0 && tpl.entity !== 'MCP') {
        return false;
      }
      
      if (!tpl.allowOnAllProtectedRoutes && !SHADOW_PREFERRED_PATHS.includes(location)) {
        return false;
      }
      
      if (tpl.trigger && tpl.trigger !== 'generic') return false;
      if (tpl.weight === 0) return false;
      
      return true;
    });

    if (!candidates.length) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v4] 🌑 No valid candidates for phase', phase, 'on', location);
      }
      return false;
    }

    // 🆕 v4: Usa threat level nella selezione
    const chosen = chooseWeightedTemplate(candidates, threatLevel);
    if (!chosen) return false;

    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] 🌑 Template selected:', {
        id: chosen.id,
        entity: chosen.entity,
        intensity: chosen.intensity,
        threatLevel,
      });
    }

    showOverlay(chosen);
    
    // Marca primo evento come triggerato
    if (!isFirstEventTriggered) {
      markFirstEventTriggered();
    }
    
    return true;
  }, [location, showOverlay, chooseWeightedTemplate, isFirstEventTriggered, markFirstEventTriggered]);

  // =========================================================================
  // 🆕 v4: Funzione per triggerare un evento contestuale CON THREAT LEVEL
  // =========================================================================
  const triggerContextEvent = useCallback((trigger: string) => {
    if (!mountedRef.current) return;
    
    const phase = getMissionPhase();
    const threatLevel = useEntityOverlayStore.getState().shadowThreatLevel;
    const candidates = getTemplatesForContext(trigger as any, phase);
    
    if (!candidates.length) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v4] 🌑 No context templates for', trigger);
      }
      return;
    }

    // 🆕 v4: Usa threat level nella selezione
    const chosen = chooseWeightedTemplate(candidates, threatLevel);
    if (!chosen) return;

    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] 🌑 Triggering context event:', {
        trigger,
        templateId: chosen.id,
        entity: chosen.entity,
        threatLevel,
      });
    }

    showOverlay(chosen);
  }, [showOverlay, chooseWeightedTemplate]);

  // =========================================================================
  // Funzione per triggerare risposta catena
  // =========================================================================
  const triggerChainResponse = useCallback((triggerId: string) => {
    if (!mountedRef.current) return;
    
    const response = getChainResponseTemplate(triggerId);
    if (!response) {
      setPendingChain(null);
      return;
    }

    if (!isValidRoute(location)) {
      setPendingChain(null);
      return;
    }

    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] 🌑 Triggering chain response:', response.id);
    }

    showOverlay(response);
    setPendingChain(null);
  }, [location, showOverlay, setPendingChain, isValidRoute]);

  // =========================================================================
  // Funzione per schedulare il prossimo evento (usa timestamp persistente)
  // =========================================================================
  const scheduleNextEvent = useCallback(() => {
    if (!mountedRef.current) return;
    
    // Cancella timer esistente
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const store = useEntityOverlayStore.getState();
    
    // Non schedulare se condizioni non soddisfatte
    if (store.isIntroActive) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v4] 🌑 Scheduling paused: intro active');
      }
      return;
    }
    
    // 🆕 v9: Check popup interaction blocker
    if (store.isPopupInteractionActive) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v9] 🌑 Scheduling paused: popup interaction active');
      }
      return;
    }
    
    if (store.eventsShownThisSession >= SHADOW_PROTOCOL_TIMING.MAX_EVENTS_PER_SESSION) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v4] 🌑 Scheduling stopped: session limit reached');
      }
      return;
    }

    // Calcola delay
    let targetTimestamp = store.nextEventTimestamp;
    
    if (!targetTimestamp || targetTimestamp < Date.now()) {
      // Genera nuovo timestamp
      const useFirstEventDelay = !store.isFirstEventTriggered && store.hasEnteredPreferredRoute;
      targetTimestamp = generateNextTimestamp(useFirstEventDelay);
      setNextEventTimestamp(targetTimestamp);
    }

    const delay = Math.max(100, targetTimestamp - Date.now());

    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v4] 🌑 Event scheduled in', Math.round(delay / 1000), 'seconds, threat level:', store.shadowThreatLevel);
    }

    timerRef.current = window.setTimeout(() => {
      if (!mountedRef.current) return;
      
      const currentStore = useEntityOverlayStore.getState();
      
      // Verifica condizioni prima di triggerare
      if (currentStore.isIntroActive) {
        scheduleNextEvent();
        return;
      }
      
      // 🆕 v9: Check popup interaction blocker
      if (currentStore.isPopupInteractionActive) {
        if (SHADOW_DEBUG) {
          console.log('[SHADOW PROTOCOL v9] 🌑 Event skipped: popup interaction active');
        }
        scheduleNextEvent();
        return;
      }
      
      if (currentStore.isVisible) {
        scheduleNextEvent();
        return;
      }
      
      if (currentStore.eventsShownThisSession >= SHADOW_PROTOCOL_TIMING.MAX_EVENTS_PER_SESSION) {
        if (SHADOW_DEBUG) {
          console.log('[SHADOW PROTOCOL v4] 🌑 Session limit reached, stopping engine');
        }
        return;
      }

      // Verifica route
      if (!isValidRoute(location)) {
        if (SHADOW_DEBUG) {
          console.log('[SHADOW PROTOCOL v4] 🌑 Event skipped: excluded path', location);
        }
        // Genera nuovo timestamp e riprova
        setNextEventTimestamp(generateNextTimestamp(false));
        scheduleNextEvent();
        return;
      }
      
      // Triggera evento
      const eventTriggered = triggerEvent();
      
      // Genera prossimo timestamp
      setNextEventTimestamp(generateNextTimestamp(false));
      
      // Schedula prossimo (se evento triggerato, aspetta che si chiuda)
      if (!eventTriggered) {
        scheduleNextEvent();
      }
    }, delay);
  }, [triggerEvent, generateNextTimestamp, setNextEventTimestamp, isValidRoute, location]);

  // =========================================================================
  // 🆕 v4: Effect: Check inactivity decay on startup
  // =========================================================================
  useEffect(() => {
    if (!inactivityCheckedRef.current && isAuthenticated && user) {
      inactivityCheckedRef.current = true;
      checkInactivityDecay();
    }
  }, [isAuthenticated, user, checkInactivityDecay]);

  // =========================================================================
  // 🆕 v7: Effect: Listen for post-glitch message requests from ShadowGlitchEngine
  // =========================================================================
  useEffect(() => {
    const handleRequestMessage = (e: Event) => {
      const customEvent = e as CustomEvent<{ context: string }>;
      const context = customEvent.detail?.context || 'map';
      
      if (SHADOW_DEBUG) {
        console.log('[SHADOW v7] 📝 Post-glitch message requested for:', context);
      }

      // Only trigger if we're not already showing an overlay
      const store = useEntityOverlayStore.getState();
      if (store.isVisible) return;
      if (store.isIntroActive) return;
      if (store.isPopupInteractionActive) return; // 🆕 v9: Block if popup active
      if (store.eventsShownThisSession >= SHADOW_PROTOCOL_TIMING.MAX_EVENTS_PER_SESSION) return;

      // Trigger a contextual event
      triggerContextEvent(context);
    };

    window.addEventListener('shadow:requestMessage', handleRequestMessage);
    return () => window.removeEventListener('shadow:requestMessage', handleRequestMessage);
  }, [triggerContextEvent]);

  // =========================================================================
  // Effect: Intro timeout fallback (PHASE 4)
  // =========================================================================
  useEffect(() => {
    if (!isIntroActive || !introStartTime) {
      if (introTimeoutRef.current) {
        window.clearTimeout(introTimeoutRef.current);
        introTimeoutRef.current = null;
      }
      return;
    }

    const elapsed = Date.now() - introStartTime;
    const remaining = SHADOW_PROTOCOL_TIMING.INTRO_MAX_DURATION_MS - elapsed;

    if (remaining <= 0) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v4] 🌑 Intro timeout reached, forcing reset');
      }
      setIntroActive(false);
      return;
    }

    introTimeoutRef.current = window.setTimeout(() => {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v4] 🌑 Intro timeout reached, forcing reset');
      }
      setIntroActive(false);
    }, remaining);

    return () => {
      if (introTimeoutRef.current) {
        window.clearTimeout(introTimeoutRef.current);
        introTimeoutRef.current = null;
      }
    };
  }, [isIntroActive, introStartTime, setIntroActive]);

  // =========================================================================
  // Effect: Marca ingresso in preferred route (PHASE 2)
  // =========================================================================
  useEffect(() => {
    if (isAuthenticated && user && isPreferredRoute(location)) {
      markPreferredRouteEntered();
    }
  }, [isAuthenticated, user, location, isPreferredRoute, markPreferredRouteEntered]);

  // =========================================================================
  // Effect: Trigger contestuali (PHASE 3)
  // =========================================================================
  useEffect(() => {
    if (!pendingContextTrigger) return;
    if (isVisible) return;
    if (isIntroActive) return;
    if (isPopupInteractionActive) return; // 🆕 v9: Block if popup active
    
    const triggerCopy = pendingContextTrigger;
    clearContextTrigger();
    
    contextTimerRef.current = window.setTimeout(() => {
      if (!mountedRef.current) return;
      
      const store = useEntityOverlayStore.getState();
      if (store.isVisible || store.isIntroActive) return;
      if (store.isPopupInteractionActive) return; // 🆕 v9: Block if popup active
      if (store.eventsShownThisSession >= SHADOW_PROTOCOL_TIMING.MAX_EVENTS_PER_SESSION) return;
      
      triggerContextEvent(triggerCopy);
    }, SHADOW_PROTOCOL_TIMING.CONTEXT_TRIGGER_DELAY_MS);
    
    return () => {
      if (contextTimerRef.current) {
        window.clearTimeout(contextTimerRef.current);
        contextTimerRef.current = null;
      }
    };
  }, [pendingContextTrigger, isVisible, isIntroActive, isPopupInteractionActive, clearContextTrigger, triggerContextEvent]);

  // =========================================================================
  // Effect: Catene MCP ↔ SHADOW
  // =========================================================================
  useEffect(() => {
    if (!pendingChainTriggerId) return;
    if (isVisible) return;
    
    chainTimerRef.current = window.setTimeout(() => {
      if (!mountedRef.current) return;
      
      const store = useEntityOverlayStore.getState();
      if (store.isIntroActive) {
        setPendingChain(null);
        return;
      }
      if (store.eventsShownThisSession >= SHADOW_PROTOCOL_TIMING.MAX_EVENTS_PER_SESSION) {
        setPendingChain(null);
        return;
      }
      
      triggerChainResponse(pendingChainTriggerId);
    }, SHADOW_PROTOCOL_TIMING.CHAIN_DELAY_MS);
    
    return () => {
      if (chainTimerRef.current) {
        window.clearTimeout(chainTimerRef.current);
        chainTimerRef.current = null;
      }
    };
  }, [pendingChainTriggerId, isVisible, triggerChainResponse, setPendingChain]);

  // =========================================================================
  // Effect: Ri-schedula quando overlay si chiude
  // =========================================================================
  useEffect(() => {
    if (!isVisible && isAuthenticated && user && !isIntroActive) {
      scheduleNextEvent();
    }
  }, [isVisible, isAuthenticated, user, isIntroActive, scheduleNextEvent]);

  // =========================================================================
  // Effect principale: Avvio engine
  // =========================================================================
  useEffect(() => {
    mountedRef.current = true;

    if (!isAuthenticated || !user) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v4] 🌑 Engine inactive: user not authenticated');
      }
      return;
    }

    if (isIntroActive) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v4] 🌑 Engine paused: intro active');
      }
      return;
    }

    if (!isValidRoute(location)) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v4] 🌑 Engine paused: excluded path', location);
      }
      return;
    }

    if (eventsShownThisSession >= SHADOW_PROTOCOL_TIMING.MAX_EVENTS_PER_SESSION) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v4] 🌑 Engine stopped: session limit reached');
      }
      return;
    }

    if (isVisible) {
      return;
    }

    if (SHADOW_DEBUG) {
      const phase = getMissionPhase();
      console.log('[SHADOW PROTOCOL v4] 🌑 Engine active on', location, {
        phase,
        threatLevel: shadowThreatLevel,
        fullWar: FULL_WAR_ENABLED,
      });
    }
    
    scheduleNextEvent();

    return () => {
      mountedRef.current = false;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAuthenticated, user, location, eventsShownThisSession, isVisible, isIntroActive, shadowThreatLevel, scheduleNextEvent, isValidRoute]);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
