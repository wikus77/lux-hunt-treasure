// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ v7 - Shadow Glitch Engine
// Orchestrazione centralizzata di tutti gli effetti glitch/distorsione
// v7: Integrazione completa con sistema narrativo v4

import { useEntityOverlayStore, SHADOW_DEBUG } from '@/stores/entityOverlayStore';
import { 
  getThreatLevelCategory, 
  type ShadowEntity, 
  type ShadowIntensity,
  type ShadowContextTrigger 
} from '@/config/shadowProtocolConfig';

// ============================================================================
// 🆕 v7: NARRATIVE EVENT INTERFACE
// ============================================================================

export interface NarrativeEventData {
  entity: ShadowEntity;
  intensity: ShadowIntensity;
  context?: ShadowContextTrigger;
  templateId?: string;
}

// ============================================================================
// TYPES
// ============================================================================

export type GlitchType = 
  | 'noise'           // Rumore statico overlay
  | 'tearing'         // Tearing orizzontale
  | 'pixelSort'       // Pixel sorting streaks
  | 'channelShift'    // RGB channel offset
  | 'turbulence'      // Canvas turbulence
  | 'skewFlicker'     // CSS transform skew/scale flicker
  | 'blackoutFlash'   // Scanline blackout flash
  | 'vignettePulse'   // Dark vignette breathing
  | 'cameraShake'     // Camera/container shake
  | 'terrainWarp';    // Perspective warp for map

export type GlitchPriority = 'low' | 'medium' | 'high' | 'critical';

export interface GlitchConfig {
  type: GlitchType;
  duration: number;      // ms
  intensity: number;     // 0-1
  priority: GlitchPriority;
  target?: string;       // CSS selector or 'global'
  callback?: () => void; // Called after glitch ends
}

export interface GlitchableComponent {
  id: string;
  ref: React.RefObject<HTMLElement>;
  priority: GlitchPriority;
}

// ============================================================================
// PRIORITY ORDER
// ============================================================================

const PRIORITY_ORDER: Record<GlitchPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

// ============================================================================
// GLITCH ENGINE STATE
// ============================================================================

interface GlitchEngineState {
  isActive: boolean;
  currentGlitch: GlitchConfig | null;
  queue: GlitchConfig[];
  registeredComponents: Map<string, GlitchableComponent>;
  heatMeter: number;  // 0-100, internal tracking
  lastGlitchTime: number;
  whisperQueue: string[];
  isWhisperActive: boolean;
}

const engineState: GlitchEngineState = {
  isActive: false,
  currentGlitch: null,
  queue: [],
  registeredComponents: new Map(),
  heatMeter: 0,
  lastGlitchTime: 0,
  whisperQueue: [],
  isWhisperActive: false,
};

// ============================================================================
// GLITCH CSS CLASSES
// ============================================================================

const GLITCH_CLASSES: Record<GlitchType, string> = {
  noise: 'shadow-glitch-noise',
  tearing: 'shadow-glitch-tearing',
  pixelSort: 'shadow-glitch-pixel-sort',
  channelShift: 'shadow-glitch-channel-shift',
  turbulence: 'shadow-glitch-turbulence',
  skewFlicker: 'shadow-glitch-skew-flicker',
  blackoutFlash: 'shadow-glitch-blackout',
  vignettePulse: 'shadow-glitch-vignette-pulse',
  cameraShake: 'shadow-glitch-camera-shake',
  terrainWarp: 'shadow-glitch-terrain-warp',
};

// ============================================================================
// HELPER: Get target element
// ============================================================================

function getTargetElement(target?: string): HTMLElement | null {
  if (!target || target === 'global') {
    return document.documentElement;
  }
  return document.querySelector(target);
}

// ============================================================================
// HELPER: Check reduced motion
// 🆕 v7.1: DEV bypass for testing (SHADOW_IGNORE_REDUCED_MOTION)
// ============================================================================

/**
 * SHADOW_IGNORE_REDUCED_MOTION - When true, bypasses prefers-reduced-motion in DEV
 * In PRODUCTION, this is always false to respect accessibility preferences.
 */
const SHADOW_IGNORE_REDUCED_MOTION = import.meta.env.DEV;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  
  // 🆕 v7.1: Bypass reduced motion check in DEV for testing
  if (SHADOW_IGNORE_REDUCED_MOTION) {
    return false;
  }
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============================================================================
// CORE: Execute Single Glitch
// ============================================================================

function executeGlitch(config: GlitchConfig): Promise<void> {
  return new Promise((resolve) => {
    if (prefersReducedMotion()) {
      resolve();
      return;
    }

    const element = getTargetElement(config.target);
    if (!element) {
      resolve();
      return;
    }

    const className = GLITCH_CLASSES[config.type];
    if (!className) {
      resolve();
      return;
    }

    if (SHADOW_DEBUG) {
      console.log(`[SHADOW GLITCH ENGINE] 🌀 Executing: ${config.type}, intensity: ${config.intensity}, duration: ${config.duration}ms`);
    }

    // Apply glitch class and intensity
    element.classList.add(className);
    element.style.setProperty('--glitch-intensity', String(config.intensity));

    // Update state
    engineState.isActive = true;
    engineState.currentGlitch = config;
    engineState.lastGlitchTime = Date.now();

    // Remove after duration
    setTimeout(() => {
      element.classList.remove(className);
      element.style.removeProperty('--glitch-intensity');
      
      engineState.isActive = false;
      engineState.currentGlitch = null;

      config.callback?.();
      resolve();
    }, config.duration);
  });
}

// ============================================================================
// CORE: Process Queue
// ============================================================================

async function processQueue(): Promise<void> {
  if (engineState.isActive || engineState.queue.length === 0) return;

  // Sort by priority
  engineState.queue.sort((a, b) => 
    PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
  );

  const next = engineState.queue.shift();
  if (next) {
    await executeGlitch(next);
    // Process next after small delay
    setTimeout(processQueue, 50);
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

export const ShadowGlitchEngine = {
  /**
   * Register a component that can receive glitch effects
   */
  registerGlitchableComponent(id: string, ref: React.RefObject<HTMLElement>, priority: GlitchPriority = 'medium'): void {
    engineState.registeredComponents.set(id, { id, ref, priority });
    if (SHADOW_DEBUG) {
      console.log(`[SHADOW GLITCH ENGINE] 📝 Registered component: ${id}`);
    }
  },

  /**
   * Unregister a component
   */
  unregisterComponent(id: string): void {
    engineState.registeredComponents.delete(id);
  },

  /**
   * Trigger a random page glitch
   */
  triggerRandomPageGlitch(intensity?: number): void {
    const store = useEntityOverlayStore.getState();
    const threatLevel = store.shadowThreatLevel;
    const category = getThreatLevelCategory(threatLevel);
    
    const baseIntensity = intensity ?? (category === 'HIGH' ? 0.9 : category === 'MEDIUM' ? 0.6 : 0.3);
    
    // Select random glitch types
    const pageGlitchTypes: GlitchType[] = ['noise', 'tearing', 'channelShift', 'skewFlicker'];
    const type = pageGlitchTypes[Math.floor(Math.random() * pageGlitchTypes.length)];
    
    const config: GlitchConfig = {
      type,
      duration: 150 + Math.random() * 200, // 150-350ms
      intensity: baseIntensity,
      priority: 'medium',
      target: 'global',
    };

    engineState.queue.push(config);
    processQueue();
  },

  /**
   * Trigger map-specific distortion
   */
  triggerMapDistortion(mapContainerSelector: string = '#ml-sandbox'): void {
    const store = useEntityOverlayStore.getState();
    const threatLevel = store.shadowThreatLevel;
    const category = getThreatLevelCategory(threatLevel);
    
    const intensity = category === 'HIGH' ? 0.8 : category === 'MEDIUM' ? 0.5 : 0.3;
    
    // Multiple effects for map
    const effects: GlitchConfig[] = [
      {
        type: 'terrainWarp',
        duration: 400,
        intensity,
        priority: 'high',
        target: mapContainerSelector,
      },
      {
        type: 'cameraShake',
        duration: 200,
        intensity: intensity * 0.7,
        priority: 'high',
        target: mapContainerSelector,
      },
    ];

    effects.forEach(e => engineState.queue.push(e));
    processQueue();
  },

  /**
   * Trigger full Shadow takeover sequence
   */
  async triggerShadowTakeover(callback?: () => void): Promise<void> {
    if (prefersReducedMotion()) {
      callback?.();
      return;
    }

    if (SHADOW_DEBUG) {
      console.log('[SHADOW GLITCH ENGINE] 🔥 SHADOW TAKEOVER INITIATED');
    }

    // Sequence of intense effects
    const sequence: GlitchConfig[] = [
      { type: 'blackoutFlash', duration: 120, intensity: 1, priority: 'critical', target: 'global' },
      { type: 'channelShift', duration: 200, intensity: 0.9, priority: 'critical', target: 'global' },
      { type: 'tearing', duration: 300, intensity: 0.8, priority: 'critical', target: 'global' },
      { type: 'noise', duration: 150, intensity: 1, priority: 'critical', target: 'global' },
      { type: 'vignettePulse', duration: 500, intensity: 0.9, priority: 'critical', target: 'global' },
    ];

    for (const effect of sequence) {
      await executeGlitch(effect);
      await new Promise(r => setTimeout(r, 50));
    }

    callback?.();
  },

  /**
   * Trigger redirect with glitch effect
   */
  triggerRedirectCTA(path: string, navigate: (path: string) => void): void {
    // Quick glitch before navigation
    const config: GlitchConfig = {
      type: 'blackoutFlash',
      duration: 100,
      intensity: 0.7,
      priority: 'high',
      target: 'global',
      callback: () => {
        setTimeout(() => navigate(path), 50);
      },
    };

    engineState.queue.push(config);
    processQueue();
  },

  /**
   * Shadow Whisper Mode - micro-overlay in bottom-left
   * Dispatches custom event for React layer to handle
   */
  triggerWhisper(text: string): void {
    if (prefersReducedMotion()) return;
    
    if (SHADOW_DEBUG) {
      console.log('[SHADOW GLITCH ENGINE] 💨 Whisper:', text);
    }

    window.dispatchEvent(new CustomEvent('shadow:whisper', { detail: { text } }));
  },

  /**
   * Increase heat meter (spam detection)
   * 🆕 v7: Now syncs to threat level at thresholds
   */
  increaseHeat(amount: number): void {
    const previousHeat = engineState.heatMeter;
    engineState.heatMeter = Math.min(100, engineState.heatMeter + amount);
    
    if (SHADOW_DEBUG && amount > 0) {
      console.log(`[SHADOW v7] 🔥 Heat: ${previousHeat.toFixed(1)} → ${engineState.heatMeter.toFixed(1)} (+${amount})`);
    }

    // Trigger effects based on heat level
    if (engineState.heatMeter >= 80) {
      ShadowGlitchEngine.triggerRandomPageGlitch(0.9);
    } else if (engineState.heatMeter >= 50) {
      ShadowGlitchEngine.triggerRandomPageGlitch(0.5);
    }

    // 🆕 v7: Sync to threat level when crossing thresholds
    const crossedThreshold70 = previousHeat < 70 && engineState.heatMeter >= 70;
    const crossedThreshold90 = previousHeat < 90 && engineState.heatMeter >= 90;
    
    if (crossedThreshold70 || crossedThreshold90) {
      this.syncToThreatLevel();
    }
  },

  /**
   * Decrease heat over time (called periodically)
   */
  coolDown(amount: number = 1): void {
    engineState.heatMeter = Math.max(0, engineState.heatMeter - amount);
  },

  /**
   * Get current heat level
   */
  getHeatLevel(): number {
    return engineState.heatMeter;
  },

  /**
   * Shadow Crosshair - brief targeting overlay
   * Dispatches custom event for React layer to handle
   */
  triggerCrosshair(_duration: number = 800): void {
    if (prefersReducedMotion()) return;

    if (SHADOW_DEBUG) {
      console.log('[SHADOW GLITCH ENGINE] 🎯 Crosshair active');
    }

    window.dispatchEvent(new CustomEvent('shadow:crosshair'));
  },

  /**
   * Shadow Timeline Skip - black flash
   * Dispatches custom event for React layer to handle
   */
  triggerTimelineSkip(): void {
    if (prefersReducedMotion()) return;

    if (SHADOW_DEBUG) {
      console.log('[SHADOW GLITCH ENGINE] ⏭️ Timeline skip');
    }

    window.dispatchEvent(new CustomEvent('shadow:timelineSkip'));
  },

  /**
   * Shadow Breath Pattern - pulsing vignette
   * Dispatches custom event for React layer to handle
   */
  triggerBreathPattern(intensity: number = 0.5): void {
    if (prefersReducedMotion()) return;

    if (SHADOW_DEBUG) {
      console.log(`[SHADOW GLITCH ENGINE] 😮‍💨 Breath pattern (intensity: ${intensity})`);
    }

    window.dispatchEvent(new CustomEvent('shadow:breathPattern', { detail: { intensity } }));
  },

  /**
   * Shadow Interrupt - immediate overlay for spam detection
   * Dispatches custom event for React layer to handle
   */
  triggerInterrupt(message: string): void {
    if (prefersReducedMotion()) return;

    // First, intense glitch
    ShadowGlitchEngine.triggerRandomPageGlitch(1);
    
    // Then show interrupt overlay
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('shadow:interrupt', { detail: { text: message } }));
    }, 200);

    if (SHADOW_DEBUG) {
      console.log('[SHADOW GLITCH ENGINE] ⚠️ INTERRUPT:', message);
    }
  },

  /**
   * Highlight a UI component with pulse effect
   */
  highlightComponent(componentId: string): void {
    const component = engineState.registeredComponents.get(componentId);
    if (!component?.ref.current) return;

    component.ref.current.classList.add('shadow-highlight-pulse');
    
    setTimeout(() => {
      component.ref.current?.classList.remove('shadow-highlight-pulse');
    }, 2000);

    if (SHADOW_DEBUG) {
      console.log(`[SHADOW GLITCH ENGINE] ✨ Highlighting: ${componentId}`);
    }
  },

  /**
   * Pulse the BUZZ button
   */
  pulseBuzzButton(): void {
    const buzzBtn = document.querySelector('[data-buzz-button]');
    if (buzzBtn) {
      buzzBtn.classList.add('shadow-pulse-buzz');
      setTimeout(() => buzzBtn.classList.remove('shadow-pulse-buzz'), 2000);
    }
  },

  /**
   * Flash a map zone
   */
  flashMapZone(lat: number, lon: number): void {
    // Create temporary marker overlay at location
    // This would need integration with map library
    if (SHADOW_DEBUG) {
      console.log(`[SHADOW GLITCH ENGINE] 📍 Flash zone at: ${lat}, ${lon}`);
    }
  },

  /**
   * Get engine status for debugging
   */
  getStatus(): GlitchEngineState {
    return { ...engineState };
  },

  /**
   * Shadow Map Jammer - distort isolated map tiles with blur/grayscale
   */
  triggerMapJammer(tiles: number = 3): void {
    if (prefersReducedMotion()) return;
    
    // Find map tiles and apply random distortion
    const mapContainer = document.querySelector('#ml-sandbox');
    if (!mapContainer) return;

    // Create jammer overlay
    let jammer = document.getElementById('shadow-map-jammer');
    if (!jammer) {
      jammer = document.createElement('div');
      jammer.id = 'shadow-map-jammer';
      jammer.className = 'shadow-map-jammer';
      mapContainer.appendChild(jammer);
    }

    // Generate random jammer positions
    const jammerSpots: HTMLElement[] = [];
    for (let i = 0; i < tiles; i++) {
      const spot = document.createElement('div');
      spot.className = 'shadow-jammer-spot';
      spot.style.left = `${10 + Math.random() * 80}%`;
      spot.style.top = `${10 + Math.random() * 80}%`;
      spot.style.width = `${50 + Math.random() * 100}px`;
      spot.style.height = `${50 + Math.random() * 100}px`;
      jammer.appendChild(spot);
      jammerSpots.push(spot);
    }

    if (SHADOW_DEBUG) {
      console.log(`[SHADOW GLITCH ENGINE] 📡 Map Jammer active (${tiles} spots)`);
    }

    // Remove after delay
    setTimeout(() => {
      jammerSpots.forEach(s => s.remove());
    }, 2000 + Math.random() * 1000);
  },

  /**
   * Shadow Directive Injection - floating text message
   * Dispatches custom event for React layer to handle
   */
  triggerDirectiveInjection(_targetSelector: string, message: string): void {
    if (prefersReducedMotion()) return;
    
    if (SHADOW_DEBUG) {
      console.log(`[SHADOW GLITCH ENGINE] 📝 Directive injection: "${message}"`);
    }

    window.dispatchEvent(new CustomEvent('shadow:directiveInjection', { detail: { text: message } }));
  },

  /**
   * Random Shadow behavior trigger based on heat level
   * 🔧 v7.1: Threshold reduced from 30 to 12 for PRODUCTION visibility
   */
  triggerRandomBehavior(): void {
    const heat = engineState.heatMeter;
    
    if (heat < 12) return; // 🔧 v7.1: Reduced from 30 to 12 for earlier activation

    const whispers = [
      'We are watching...',
      'Your movements are logged.',
      'This is not your territory.',
      'Echo. We know your pattern.',
      'Signal intercepted.',
    ];

    const behaviors = [
      () => ShadowGlitchEngine.triggerCrosshair(),
      () => ShadowGlitchEngine.triggerTimelineSkip(),
      () => ShadowGlitchEngine.triggerBreathPattern(0.5),
      () => ShadowGlitchEngine.triggerWhisper(whispers[Math.floor(Math.random() * whispers.length)]),
    ];

    if (heat >= 50) {
      behaviors.push(
        () => ShadowGlitchEngine.triggerRandomPageGlitch(0.6),
        () => ShadowGlitchEngine.triggerMapJammer(2),
        () => ShadowGlitchEngine.triggerBreathPattern(0.7),
      );
    }

    if (heat >= 70) {
      behaviors.push(
        () => ShadowGlitchEngine.triggerShadowTakeover(),
        () => ShadowGlitchEngine.triggerMapJammer(4),
        () => ShadowGlitchEngine.triggerInterrupt('WE SEE YOU'),
      );
    }

    const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
    behavior();
  },

  // =========================================================================
  // 🆕 v7: NARRATIVE EVENT BRIDGE
  // =========================================================================

  /**
   * onNarrativeEvent - Called when a v4 overlay is shown
   * Bridges narrative events to glitch engine behaviors
   * 
   * @param data - Entity, intensity, context from the overlay
   */
  onNarrativeEvent(data: NarrativeEventData): void {
    const { entity, intensity, context } = data;

    if (SHADOW_DEBUG) {
      console.log('[SHADOW v7] 📡 Narrative event received:', data);
    }

    // Increase heat based on entity and intensity
    const heatAmount = entity === 'SHADOW' 
      ? intensity * 8  // SHADOW: 8/16/24
      : entity === 'MCP' 
      ? intensity * 3  // MCP: 3/6/9
      : intensity * 2; // ECHO: 2/4/6

    this.increaseHeat(heatAmount);

    // Trigger pre-effects for SHADOW messages
    if (entity === 'SHADOW' && intensity >= 2) {
      // Small glitch before message appears
      this.triggerRandomPageGlitch(intensity === 3 ? 0.9 : 0.5);
    }

    // Context-specific ambient effects
    if (context === 'map' && intensity >= 2) {
      // Map context: trigger map jammer briefly
      setTimeout(() => this.triggerMapJammer(1), 200);
    } else if (context === 'buzz' && entity === 'SHADOW') {
      // BUZZ context: crosshair effect
      setTimeout(() => this.triggerCrosshair(), 100);
    } else if (context === 'reward' && entity === 'SHADOW') {
      // Reward: directive injection
      this.triggerDirectiveInjection('body', 'DISPUTED');
    }
  },

  /**
   * syncFromThreatLevel - Sync engine heat from v4 threat level
   * Call this when threat level changes externally
   * 
   * @param threatLevel - Current threat level (0-5)
   */
  syncFromThreatLevel(threatLevel: number): void {
    // Map threat (0-5) to heat (0-100) as a baseline
    // Actual heat can be higher from recent activity
    const baseHeat = (threatLevel / 5) * 40; // 0-40 baseline from threat
    
    // If current heat is lower than baseline, bring it up
    if (engineState.heatMeter < baseHeat) {
      engineState.heatMeter = baseHeat;
      
      if (SHADOW_DEBUG) {
        console.log(`[SHADOW v7] 🔄 Heat synced from threat: ${engineState.heatMeter.toFixed(1)}`);
      }
    }
  },

  /**
   * 🆕 v7: syncToThreatLevel - Push heat changes back to threat level store
   * Called when heat reaches certain thresholds
   */
  syncToThreatLevel(): void {
    const delta = this.getRecommendedThreatDelta();
    if (delta > 0) {
      // Dispatch event for store to pick up
      window.dispatchEvent(new CustomEvent('shadow:heatThreatSync', { 
        detail: { delta, currentHeat: engineState.heatMeter } 
      }));
      
      if (SHADOW_DEBUG) {
        console.log(`[SHADOW v7] 🔥 Heat→Threat sync requested: +${delta} (heat: ${engineState.heatMeter.toFixed(1)})`);
      }
    }
  },

  /**
   * getRecommendedThreatDelta - Calculate threat change based on heat
   * Used by store to know when to increase threat level
   * 
   * @returns number - Suggested threat delta (0 if no change)
   */
  getRecommendedThreatDelta(): number {
    const heat = engineState.heatMeter;
    
    // Heat thresholds for threat increase
    if (heat >= 90) return 0.5;  // Very hot → increase threat
    if (heat >= 70) return 0.3;  // Hot → slight increase
    
    // No automatic increase below 70
    return 0;
  },

  /**
   * triggerMicroCta - Show a small, non-blocking CTA
   * Dispatches event for ShadowBehaviorsLayer to render
   */
  triggerMicroCta(route: string, label: string): void {
    if (prefersReducedMotion()) return;

    if (SHADOW_DEBUG) {
      console.log(`[SHADOW v7] 🔗 Micro CTA: ${label} → ${route}`);
    }

    window.dispatchEvent(new CustomEvent('shadow:microCta', { 
      detail: { route, label } 
    }));
  },

  /**
   * triggerPostGlitchMessage - Request a contextual message after glitch
   * Dispatches event for the engine to pick a template
   */
  triggerPostGlitchMessage(context: ShadowContextTrigger = 'map'): void {
    if (SHADOW_DEBUG) {
      console.log(`[SHADOW v7] 📝 Requesting post-glitch message for: ${context}`);
    }

    window.dispatchEvent(new CustomEvent('shadow:requestMessage', { 
      detail: { context } 
    }));
  },

  /**
   * 🆕 v7.2: triggerHeavyMapInterference - Visible map blackout sequence
   * 
   * Creates a dramatic sequence:
   * 1. Full map blackout (1.5-3s)
   * 2. Heavy glitch effects (noise, tearing)
   * 3. Automatic SHADOW message after blackout
   * 
   * @param duration - Blackout duration in ms (default: 2000)
   * @param autoMessage - If true, trigger SHADOW message after (default: true)
   */
  triggerHeavyMapInterference(duration: number = 2000, autoMessage: boolean = true): void {
    if (prefersReducedMotion()) {
      // Fallback: just show message
      if (autoMessage) {
        setTimeout(() => {
          this.triggerPostGlitchMessage('map');
        }, 500);
      }
      return;
    }

    const mapContainer = document.querySelector('#ml-sandbox');
    if (!mapContainer) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW v7.2] ❌ Heavy interference skipped: map container not found');
      }
      return;
    }

    if (SHADOW_DEBUG) {
      console.log(`[SHADOW v7.2] 🌑 HEAVY MAP INTERFERENCE - Duration: ${duration}ms`);
    }

    // Step 1: Create blackout overlay
    const blackout = document.createElement('div');
    blackout.id = 'shadow-map-blackout';
    blackout.className = 'shadow-map-blackout';
    blackout.innerHTML = `
      <div class="shadow-blackout-inner">
        <div class="shadow-blackout-scan"></div>
        <div class="shadow-blackout-text">SIGNAL LOST</div>
        <div class="shadow-blackout-static"></div>
      </div>
    `;
    (mapContainer as HTMLElement).appendChild(blackout);

    // Step 2: Add glitch effects to entire page
    document.documentElement.classList.add('shadow-heavy-interference');
    
    // Step 3: Trigger random glitches during blackout
    const glitchInterval = setInterval(() => {
      const glitchTypes: GlitchType[] = ['noise', 'tearing', 'channelShift', 'blackoutFlash'];
      const type = glitchTypes[Math.floor(Math.random() * glitchTypes.length)];
      executeGlitch({
        type,
        duration: 80 + Math.random() * 120,
        intensity: 0.8 + Math.random() * 0.2,
        priority: 'critical',
        target: 'global',
      });
    }, 300);

    // Step 4: Cleanup after duration
    setTimeout(() => {
      clearInterval(glitchInterval);
      blackout.classList.add('fade-out');
      
      setTimeout(() => {
        blackout.remove();
        document.documentElement.classList.remove('shadow-heavy-interference');
        
        // Step 5: Trigger SHADOW message
        if (autoMessage) {
          if (SHADOW_DEBUG) {
            console.log('[SHADOW v7.2] 📝 Triggering post-interference SHADOW message');
          }
          this.triggerPostGlitchMessage('map');
        }
      }, 500);
    }, duration);
  },

  /**
   * 🆕 v7.2: triggerQuickMapStatic - Quick static burst on map
   * Lighter effect than heavy interference
   */
  triggerQuickMapStatic(duration: number = 600): void {
    if (prefersReducedMotion()) return;

    const mapContainer = document.querySelector('#ml-sandbox');
    if (!mapContainer) return;

    const staticOverlay = document.createElement('div');
    staticOverlay.className = 'shadow-map-static-burst';
    (mapContainer as HTMLElement).appendChild(staticOverlay);

    // Camera shake
    (mapContainer as HTMLElement).classList.add('shadow-glitch-camera-shake');

    setTimeout(() => {
      staticOverlay.remove();
      (mapContainer as HTMLElement).classList.remove('shadow-glitch-camera-shake');
    }, duration);

    if (SHADOW_DEBUG) {
      console.log('[SHADOW v7.2] ⚡ Quick map static burst');
    }
  },
};

// ============================================================================
// HEAT DECAY INTERVAL
// ============================================================================

if (typeof window !== 'undefined') {
  setInterval(() => {
    ShadowGlitchEngine.coolDown(0.5);
  }, 5000); // Cool down 0.5 every 5 seconds
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

