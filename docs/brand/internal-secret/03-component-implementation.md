# M1SSION™ BRAND & DESIGN BIBLE — INTERNAL SECRET
## Volume 3: UI Component Implementation Secrets

**Document Version:** 1.0  
**Classification:** INTERNAL SECRET — NOT FOR DISTRIBUTION  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## ⚠️ CONFIDENTIALITY NOTICE

This document contains proprietary React component implementation details. Unauthorized disclosure is prohibited.

---

## 1. COMPONENT ARCHITECTURE

### 1.1 Directory Structure

```
src/components/
├── auth/                 # Authentication components
├── buzz/                 # Buzz button & related
├── cards/                # Card variations
├── common/               # Shared primitives
├── forms/                # Form elements
├── home/                 # Home page components
├── leaderboard/          # Leaderboard UI
├── map/                  # Map-related UI
├── modals/               # Modal dialogs
├── navigation/           # Navigation components
├── overlay/              # Shadow Protocol overlays
├── portals/              # Portal system UI
├── profile/              # User profile
└── ui/                   # Base UI primitives
```

### 1.2 Component Patterns

**Standard component structure:**
```typescript
// ComponentName.tsx
import React from 'react';
import { motion } from 'framer-motion';
import './ComponentName.css';

interface ComponentNameProps {
  // Props definition
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  // Destructured props
}) => {
  // Hook calls
  // State management
  // Effects
  
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

---

## 2. ENTITY OVERLAY IMPLEMENTATION

### 2.1 EntityOverlay Component

**Location:** `src/components/overlay/EntityOverlay.tsx`

**Key implementation details:**

```typescript
// State machine for overlay phases
type OverlayPhase = 
  | 'entering'      // Backdrop + symbol appearing
  | 'messaging'     // Text typing
  | 'interactive'   // CTA visible
  | 'exiting';      // Dismissing

// Entity evolution integration
const getEvolutionModifiers = (
  entity: Entity, 
  level: number
): VisualModifiers => {
  // Returns animation intensity, color shifts, etc.
};

// Typing effect controller
const useTypingEffect = (text: string, speed: number) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);
  
  return { displayedText, isComplete };
};
```

### 2.2 Entity Visual Components

**ShadowEntityVisual:**
```typescript
export const ShadowEntityVisual: React.FC<{
  evolutionLevel: number;
  intensity: number;
}> = ({ evolutionLevel, intensity }) => {
  const glitchIntensity = evolutionLevel * 0.3 + intensity * 0.2;
  
  return (
    <motion.div
      className="shadow-entity-visual"
      animate={{
        rotate: [0, 0.5, -0.3, 0],
        scale: [1, 1.02, 0.99, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Inverted triangle with eye */}
      <div className="shadow-triangle" />
      <div className="shadow-eye" />
      
      {/* Glitch overlay */}
      {glitchIntensity > 0.3 && (
        <div 
          className="shadow-glitch-overlay"
          style={{ opacity: glitchIntensity }}
        />
      )}
    </motion.div>
  );
};
```

**McpEntityVisual:**
```typescript
export const McpEntityVisual: React.FC<{
  evolutionLevel: number;
}> = ({ evolutionLevel }) => {
  const ringCount = 2 + evolutionLevel;
  
  return (
    <motion.div className="mcp-entity-visual">
      <div className="mcp-hexagon" />
      {Array.from({ length: ringCount }).map((_, i) => (
        <motion.div
          key={i}
          className="mcp-ring"
          animate={{ rotate: 360 * (i % 2 ? 1 : -1) }}
          transition={{
            duration: 10 - i * 2,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            width: 60 + i * 20,
            height: 60 + i * 20,
          }}
        />
      ))}
      <div className="mcp-scanline" />
    </motion.div>
  );
};
```

**EchoEntityVisual:**
```typescript
export const EchoEntityVisual: React.FC<{
  evolutionLevel: number;
}> = ({ evolutionLevel }) => {
  const fragmentCount = 4 - Math.min(evolutionLevel, 2);
  
  return (
    <motion.div
      className="echo-entity-visual"
      animate={{ opacity: [0.6, 0.9, 0.7, 1, 0.6] }}
      transition={{
        duration: 4,
        repeat: Infinity,
      }}
    >
      {/* Fragmented circle */}
      <svg className="echo-circle" viewBox="0 0 100 100">
        {Array.from({ length: fragmentCount }).map((_, i) => (
          <motion.path
            key={i}
            d={getArcPath(i, fragmentCount)}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: i * 0.2 }}
          />
        ))}
      </svg>
      
      {/* Wave pulses */}
      <div className="echo-waves" />
    </motion.div>
  );
};
```

---

## 3. SHADOW GLITCH ENGINE

### 3.1 Core Engine Structure

**Location:** `src/engine/shadowGlitchEngine.ts`

```typescript
class ShadowGlitchEngine {
  private heatMeter: number = 0;
  private lastGlitchTime: number = 0;
  private isGlitching: boolean = false;
  
  // Singleton pattern
  private static instance: ShadowGlitchEngine;
  
  public static getInstance(): ShadowGlitchEngine {
    if (!ShadowGlitchEngine.instance) {
      ShadowGlitchEngine.instance = new ShadowGlitchEngine();
    }
    return ShadowGlitchEngine.instance;
  }
  
  // Heat meter management
  public increaseHeat(amount: number): void {
    this.heatMeter = Math.min(100, this.heatMeter + amount);
    this.checkTriggers();
    this.syncToThreatLevel();
  }
  
  public decreaseHeat(amount: number): void {
    this.heatMeter = Math.max(0, this.heatMeter - amount);
  }
  
  // Glitch triggers
  public triggerRandomPageGlitch(): void {
    if (this.shouldSkipGlitch()) return;
    
    const intensity = this.calculateIntensity();
    document.body.classList.add(`page-glitch-${intensity}`);
    
    setTimeout(() => {
      document.body.classList.remove(`page-glitch-${intensity}`);
    }, this.getGlitchDuration(intensity));
    
    this.lastGlitchTime = Date.now();
  }
  
  public triggerMapDistortion(autoMessage: boolean = true): void {
    if (this.shouldSkipGlitch()) return;
    
    window.dispatchEvent(new CustomEvent('shadow:mapGlitch', {
      detail: { 
        intensity: this.calculateIntensity(),
        autoMessage 
      }
    }));
    
    if (autoMessage) {
      setTimeout(() => {
        this.triggerPostGlitchMessage();
      }, 600);
    }
  }
  
  private shouldSkipGlitch(): boolean {
    if (this.prefersReducedMotion() && !SHADOW_IGNORE_REDUCED_MOTION) {
      return true;
    }
    if (this.isGlitching) return true;
    if (Date.now() - this.lastGlitchTime < MIN_GLITCH_INTERVAL) return true;
    return false;
  }
  
  private calculateIntensity(): 'light' | 'medium' | 'heavy' {
    if (this.heatMeter >= 70) return 'heavy';
    if (this.heatMeter >= 35) return 'medium';
    return 'light';
  }
}
```

### 3.2 Behavior Dispatch System

```typescript
// Custom event types for behaviors
type ShadowBehaviorEvent = 
  | 'shadow:whisper'
  | 'shadow:interrupt'
  | 'shadow:crosshair'
  | 'shadow:timelineSkip'
  | 'shadow:breathPattern'
  | 'shadow:directiveInjection'
  | 'shadow:microCta';

// Dispatch behaviors based on heat level
private checkTriggers(): void {
  if (this.heatMeter >= 80) {
    this.dispatchBehavior('shadow:interrupt');
  } else if (this.heatMeter >= 50) {
    const behaviors: ShadowBehaviorEvent[] = [
      'shadow:crosshair',
      'shadow:timelineSkip',
      'shadow:whisper'
    ];
    this.dispatchBehavior(
      behaviors[Math.floor(Math.random() * behaviors.length)]
    );
  } else if (this.heatMeter >= 20) {
    if (Math.random() < 0.3) {
      this.dispatchBehavior('shadow:breathPattern');
    }
  }
}

private dispatchBehavior(event: ShadowBehaviorEvent): void {
  window.dispatchEvent(new CustomEvent(event, {
    detail: {
      heatLevel: this.heatMeter,
      timestamp: Date.now()
    }
  }));
}
```

---

## 4. MAP INTEGRATION SECRETS

### 4.1 ShadowMapEffectsProvider

```typescript
// Wraps MapContainer for Shadow integration
export const ShadowMapEffectsProvider: React.FC<{
  children: React.ReactNode;
  mapRef: React.RefObject<MLMap>;
}> = ({ children, mapRef }) => {
  
  useEffect(() => {
    const handleMapGlitch = (e: CustomEvent) => {
      const { intensity, autoMessage } = e.detail;
      applyMapGlitch(mapRef.current, intensity);
    };
    
    window.addEventListener('shadow:mapGlitch', handleMapGlitch);
    return () => {
      window.removeEventListener('shadow:mapGlitch', handleMapGlitch);
    };
  }, [mapRef]);
  
  return <>{children}</>;
};

const applyMapGlitch = (
  map: MLMap | null, 
  intensity: 'light' | 'medium' | 'heavy'
): void => {
  if (!map) return;
  
  const container = map.getContainer();
  
  // CSS-based distortion
  container.style.filter = getFilterForIntensity(intensity);
  container.classList.add(`map-glitch-${intensity}`);
  
  // Camera shake for heavy
  if (intensity === 'heavy') {
    applyCameraShake(map);
  }
  
  // Reset after duration
  setTimeout(() => {
    container.style.filter = '';
    container.classList.remove(`map-glitch-${intensity}`);
  }, getGlitchDuration(intensity));
};
```

### 4.2 Map Tile Jammer

```typescript
// Random tile distortion effect
export const useMapTileJammer = (mapRef: React.RefObject<MLMap>) => {
  useEffect(() => {
    const jamRandomTile = () => {
      if (!mapRef.current) return;
      
      const tiles = mapRef.current
        .getContainer()
        .querySelectorAll('.maplibregl-tile');
      
      if (tiles.length === 0) return;
      
      const randomTile = tiles[
        Math.floor(Math.random() * tiles.length)
      ] as HTMLElement;
      
      // Apply distortion
      randomTile.style.filter = 'grayscale(80%) blur(1px)';
      randomTile.style.opacity = '0.7';
      
      // Reset
      setTimeout(() => {
        randomTile.style.filter = '';
        randomTile.style.opacity = '';
      }, 2000);
    };
    
    // Listen for jammer events
    window.addEventListener('shadow:mapJammer', jamRandomTile);
    return () => {
      window.removeEventListener('shadow:mapJammer', jamRandomTile);
    };
  }, [mapRef]);
};
```

---

## 5. BUZZ BUTTON IMPLEMENTATION

### 5.1 Core Component

```typescript
export const BuzzButton: React.FC<BuzzButtonProps> = ({
  onBuzz,
  cost,
  disabled,
  isProcessing,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handlePress = useCallback(async () => {
    if (disabled || isProcessing) return;
    
    setIsPressed(true);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    try {
      await onBuzz();
      setShowSuccess(true);
      
      // Success haptic
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 100]);
      }
      
      // Notify Shadow system
      window.dispatchEvent(new CustomEvent('buzzCompleted'));
      
      setTimeout(() => setShowSuccess(false), 500);
    } catch (error) {
      // Error state
    } finally {
      setIsPressed(false);
    }
  }, [onBuzz, disabled, isProcessing]);
  
  return (
    <motion.button
      ref={buttonRef}
      className={classNames('buzz-button', {
        'buzz-button--pressed': isPressed,
        'buzz-button--processing': isProcessing,
        'buzz-button--success': showSuccess,
        'buzz-button--disabled': disabled,
      })}
      onClick={handlePress}
      disabled={disabled || isProcessing}
      whileTap={{ scale: 0.95 }}
    >
      {/* Ring animation */}
      <div className="buzz-button__ring" />
      
      {/* Main content */}
      <div className="buzz-button__content">
        {isProcessing ? (
          <Spinner />
        ) : (
          <>
            <BuzzIcon />
            <span>BUZZ</span>
          </>
        )}
      </div>
      
      {/* Cost display */}
      {cost && (
        <div className="buzz-button__cost">
          {cost === 0 ? 'FREE' : `${cost} PULSE`}
        </div>
      )}
      
      {/* Success particles */}
      <AnimatePresence>
        {showSuccess && <SuccessParticles />}
      </AnimatePresence>
    </motion.button>
  );
};
```

### 5.2 Success Particles

```typescript
const SuccessParticles: React.FC = () => {
  const particleCount = 12;
  
  return (
    <div className="success-particles">
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="particle"
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: Math.cos((i / particleCount) * Math.PI * 2) * 60,
            y: Math.sin((i / particleCount) * Math.PI * 2) * 60,
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};
```

---

## 6. PORTAL SYSTEM IMPLEMENTATION

### 6.1 Portal Behavior Overlay

```typescript
export const PortalBehaviorOverlay: React.FC<{
  portal: PortalDTO | null;
  behavior: PortalBehaviorConfig | undefined;
  isVisible: boolean;
  onClose: () => void;
  mapRef?: React.RefObject<MLMap>;
}> = ({ portal, behavior, isVisible, onClose, mapRef }) => {
  const { buzzCount, buzzMapCount } = useActivityTracker();
  const [phase, setPhase] = useState<'dialogue' | 'content'>('dialogue');
  const [isLocked, setIsLocked] = useState(false);
  
  // Check requirements
  useEffect(() => {
    if (!behavior?.requirement) {
      setIsLocked(false);
      return;
    }
    
    const req = behavior.requirement;
    switch (req.type) {
      case 'buzz_count':
        setIsLocked(buzzCount < (req.minValue || 0));
        break;
      case 'buzz_map_count':
        setIsLocked(buzzMapCount < (req.minValue || 0));
        break;
      default:
        setIsLocked(false);
    }
  }, [behavior, buzzCount, buzzMapCount]);
  
  // Apply effects
  useEffect(() => {
    if (!isVisible || !behavior) return;
    
    // Glitch effect
    if (behavior.effects.glitch) {
      applyPortalGlitch(behavior.effects.glitch);
    }
    
    // Camera swirl
    if (behavior.effects.cameraSwirl && mapRef?.current) {
      applyCameraSwirl(mapRef.current);
    }
    
    return () => cleanupEffects();
  }, [isVisible, behavior, mapRef]);
  
  // ... render logic
};
```

### 6.2 Dialogue System

```typescript
const DialogueDisplay: React.FC<{
  dialogues: PortalDialogue[];
  onComplete: () => void;
}> = ({ dialogues, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { displayedText, isComplete } = useTypingEffect(
    dialogues[currentIndex]?.lines.join('\n') || '',
    30
  );
  
  useEffect(() => {
    if (isComplete && currentIndex < dialogues.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 1500);
    } else if (isComplete && currentIndex === dialogues.length - 1) {
      setTimeout(onComplete, 500);
    }
  }, [isComplete, currentIndex, dialogues.length, onComplete]);
  
  return (
    <div className="portal-dialogue">
      <EntitySymbol entity={dialogues[currentIndex].entity} />
      <pre className="portal-dialogue-text">
        {displayedText}
        {!isComplete && <span className="cursor">▌</span>}
      </pre>
    </div>
  );
};
```

---

## 7. STORE PATTERNS

### 7.1 Entity Overlay Store

```typescript
// entityOverlayStore.ts - Key implementation patterns

export const useEntityOverlayStore = create<EntityOverlayState>()(
  persist(
    (set, get) => ({
      // State
      currentEvent: null,
      isVisible: false,
      shadowThreatLevel: 0,
      entityEvolutionLevels: { shadow: 0, mcp: 0, echo: 0 },
      branchingFlags: {
        lastShadowWarningAt: null,
        ignoredWarningCount: 0,
        fastDismissCount: 0,
      },
      
      // Actions
      showOverlay: (event) => {
        set({ 
          currentEvent: event, 
          isVisible: true,
          lastEventTime: Date.now(),
        });
        
        // Update entity event counts
        get().incrementEntityCount(event.entity);
        
        // Notify glitch engine
        ShadowGlitchEngine.getInstance()
          .onNarrativeEvent(event);
      },
      
      hideOverlay: () => {
        const state = get();
        
        // Check for fast dismiss (branching logic)
        if (state.currentEvent && state.isVisible) {
          const showDuration = Date.now() - (state.lastEventTime || 0);
          if (showDuration < 2000) {
            state.recordFastDismiss();
          }
        }
        
        set({ isVisible: false });
      },
      
      // Evolution management
      increaseEntityEvolution: (entity) => {
        const levels = get().entityEvolutionLevels;
        const currentLevel = levels[entity.toLowerCase()];
        
        if (currentLevel < 3) {
          set({
            entityEvolutionLevels: {
              ...levels,
              [entity.toLowerCase()]: currentLevel + 1,
            }
          });
        }
      },
    }),
    {
      name: 'm1ssion-shadow-state',
      partialize: (state) => ({
        shadowThreatLevel: state.shadowThreatLevel,
        entityEvolutionLevels: state.entityEvolutionLevels,
        entityEventCounts: state.entityEventCounts,
        // Don't persist: currentEvent, isVisible
      }),
    }
  )
);
```

---

## 8. HOOK PATTERNS

### 8.1 useShadowBehaviors

```typescript
export const useShadowBehaviors = () => {
  const { pathname } = useLocation();
  const threatLevel = useEntityOverlayStore(s => s.shadowThreatLevel);
  
  // Ambient behavior scheduling
  useEffect(() => {
    if (EXCLUDED_ROUTES.includes(pathname)) return;
    
    const scheduleAmbient = () => {
      const interval = getAmbientInterval(threatLevel);
      const probability = getAmbientProbability(threatLevel);
      
      const timer = setTimeout(() => {
        if (Math.random() < probability) {
          ShadowGlitchEngine.getInstance().triggerRandomBehavior();
        }
        scheduleAmbient();
      }, interval);
      
      return timer;
    };
    
    const timer = scheduleAmbient();
    return () => clearTimeout(timer);
  }, [pathname, threatLevel]);
  
  // Activity tracking for heat
  useEffect(() => {
    const handleActivity = (event: string) => {
      const heatIncrement = ACTIVITY_HEAT_MAP[event] || 5;
      ShadowGlitchEngine.getInstance().increaseHeat(heatIncrement);
    };
    
    // Listen to game events
    window.addEventListener('buzzCompleted', () => handleActivity('buzz'));
    window.addEventListener('buzzAreaCreated', () => handleActivity('buzzMap'));
    // ... other events
    
    return () => {
      // Cleanup
    };
  }, []);
};
```

---

**Document End**

*This document contains M1SSION™ proprietary component implementation details.*
*Unauthorized distribution is prohibited.*

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved





