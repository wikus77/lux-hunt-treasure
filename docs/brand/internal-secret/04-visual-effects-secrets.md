# M1SSION™ BRAND & DESIGN BIBLE — INTERNAL SECRET
## Volume 4: Visual Effects & Animation Secrets

**Document Version:** 1.0  
**Classification:** INTERNAL SECRET — NOT FOR DISTRIBUTION  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## ⚠️ CONFIDENTIALITY NOTICE

This document contains proprietary visual effect algorithms. Unauthorized disclosure is prohibited.

---

## 1. GLITCH EFFECT ALGORITHMS

### 1.1 Horizontal Tearing Effect

**Algorithm:**
```typescript
interface TearConfig {
  tearCount: number;
  maxOffset: number;
  duration: number;
}

const generateTearingEffect = (config: TearConfig): CSSProperties => {
  const { tearCount, maxOffset, duration } = config;
  
  // Generate random horizontal offsets for each "tear"
  const tears = Array.from({ length: tearCount }, (_, i) => {
    const yPosition = (i / tearCount) * 100;
    const offset = (Math.random() - 0.5) * maxOffset * 2;
    return { y: yPosition, offset };
  });
  
  // Create CSS clip-path animation keyframes
  const keyframes = generateTearKeyframes(tears);
  
  return {
    animation: `tearing ${duration}ms steps(2) forwards`,
    '--tear-keyframes': keyframes,
  };
};

// CSS implementation
const TEARING_CSS = `
@keyframes horizontal-tear {
  0% { 
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    transform: translateX(0);
  }
  25% {
    clip-path: polygon(0 0, 100% 0, 100% 30%, 95% 30%, 
                       95% 35%, 100% 35%, 100% 100%, 0 100%);
    transform: translateX(-3px);
  }
  50% {
    clip-path: polygon(5% 0, 100% 0, 100% 60%, 0 60%, 
                       0 55%, 5% 55%);
    transform: translateX(3px);
  }
  75% {
    clip-path: polygon(0 0, 100% 0, 100% 80%, 98% 80%, 
                       98% 85%, 100% 85%, 100% 100%, 0 100%);
    transform: translateX(-2px);
  }
  100% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    transform: translateX(0);
  }
}
`;
```

### 1.2 Pixel Sorting Effect

**Algorithm:**
```typescript
// Simulated pixel sorting via CSS (not actual pixel manipulation)
const createPixelSortOverlay = (
  intensity: number, // 0-1
  direction: 'horizontal' | 'vertical'
): HTMLElement => {
  const overlay = document.createElement('div');
  overlay.className = 'pixel-sort-overlay';
  
  // Create gradient strips that simulate sorted pixels
  const stripCount = Math.floor(intensity * 20) + 5;
  const strips: string[] = [];
  
  for (let i = 0; i < stripCount; i++) {
    const position = Math.random() * 100;
    const size = Math.random() * 10 + 2;
    const hue = Math.random() * 60 - 30; // Cyan-ish range
    
    strips.push(
      `linear-gradient(${direction === 'horizontal' ? '90deg' : '0deg'},
        transparent ${position}%,
        hsla(${180 + hue}, 100%, 50%, 0.3) ${position + size * 0.3}%,
        transparent ${position + size}%
      )`
    );
  }
  
  overlay.style.background = strips.join(', ');
  overlay.style.mixBlendMode = 'screen';
  
  return overlay;
};
```

### 1.3 Channel Offset Algorithm

**Algorithm:**
```typescript
interface ChannelOffsetConfig {
  redOffset: { x: number; y: number };
  greenOffset: { x: number; y: number };
  blueOffset: { x: number; y: number };
  animationDuration: number;
}

const generateChannelOffset = (intensity: number): ChannelOffsetConfig => {
  const maxOffset = intensity * 5; // Max 5px at full intensity
  
  return {
    redOffset: {
      x: (Math.random() - 0.5) * maxOffset,
      y: (Math.random() - 0.5) * maxOffset * 0.5,
    },
    greenOffset: { x: 0, y: 0 }, // Green stays centered
    blueOffset: {
      x: (Math.random() - 0.5) * maxOffset * -1, // Opposite of red
      y: (Math.random() - 0.5) * maxOffset * 0.5,
    },
    animationDuration: 100 + Math.random() * 200,
  };
};

// CSS for text channel separation
const CHANNEL_OFFSET_CSS = `
.channel-offset {
  position: relative;
}

.channel-offset::before,
.channel-offset::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.8;
  pointer-events: none;
}

.channel-offset::before {
  color: #ff0000;
  left: var(--red-x, -2px);
  top: var(--red-y, 0);
  clip-path: var(--channel-clip);
}

.channel-offset::after {
  color: #00ffff;
  left: var(--blue-x, 2px);
  top: var(--blue-y, 0);
  clip-path: var(--channel-clip);
}
`;
```

### 1.4 Noise Generation

**SVG Filter for Static Noise:**
```typescript
const createNoiseFilter = (
  baseFrequency: number = 0.9,
  numOctaves: number = 3
): string => {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" style="display:none">
      <filter id="shadow-noise">
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="${baseFrequency}" 
          numOctaves="${numOctaves}" 
          stitchTiles="stitch"
          result="noise"
        />
        <feColorMatrix
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 0.1 0"
        />
      </filter>
    </svg>
  `;
};

// Animated noise using background position
const ANIMATED_NOISE_CSS = `
@keyframes noise-scroll {
  0% { background-position: 0 0; }
  10% { background-position: -5% -10%; }
  20% { background-position: -15% 5%; }
  30% { background-position: 7% -25%; }
  40% { background-position: 20% 25%; }
  50% { background-position: -25% 10%; }
  60% { background-position: 15% 0%; }
  70% { background-position: 0% 15%; }
  80% { background-position: 25% 35%; }
  90% { background-position: -10% 10%; }
  100% { background-position: 0 0; }
}

.noise-overlay {
  background-image: url("data:image/svg+xml,...");
  animation: noise-scroll 0.2s steps(10) infinite;
  mix-blend-mode: overlay;
  opacity: 0.15;
}
`;
```

---

## 2. GLOW ALGORITHMS

### 2.1 Dynamic Glow Calculation

**Algorithm:**
```typescript
interface GlowConfig {
  baseColor: string;
  intensity: number;     // 0-1
  spreadMultiplier: number;
  layerCount: number;
}

const calculateGlowLayers = (config: GlowConfig): string => {
  const { baseColor, intensity, spreadMultiplier, layerCount } = config;
  const layers: string[] = [];
  
  for (let i = 0; i < layerCount; i++) {
    const spread = (i + 1) * 10 * spreadMultiplier;
    const opacity = intensity * (1 - (i / layerCount)) * 0.5;
    const color = hexToRgba(baseColor, opacity);
    
    layers.push(`0 0 ${spread}px ${color}`);
  }
  
  return layers.join(', ');
};

// Usage example
const entityGlow = (entity: 'MCP' | 'SHADOW' | 'ECHO', intensity: number) => {
  const colors = {
    MCP: '#00E5FF',
    SHADOW: '#FF3366',
    ECHO: '#9966FF'
  };
  
  return calculateGlowLayers({
    baseColor: colors[entity],
    intensity,
    spreadMultiplier: entity === 'SHADOW' ? 1.2 : 1,
    layerCount: 4
  });
};
```

### 2.2 Pulsing Glow Animation

**Algorithm:**
```typescript
const generatePulseAnimation = (
  minIntensity: number,
  maxIntensity: number,
  duration: number,
  easing: 'ease' | 'ease-in-out' | 'linear'
): Keyframes => {
  return {
    '0%, 100%': {
      boxShadow: calculateGlowLayers({ 
        ...baseConfig, 
        intensity: minIntensity 
      }),
      filter: `brightness(${1 + minIntensity * 0.1})`,
    },
    '50%': {
      boxShadow: calculateGlowLayers({ 
        ...baseConfig, 
        intensity: maxIntensity 
      }),
      filter: `brightness(${1 + maxIntensity * 0.2})`,
    },
  };
};
```

### 2.3 Threat-Based Glow Modulation

**Algorithm:**
```typescript
const getThreatGlowColor = (
  baseColor: string,
  threatLevel: number // 0-5
): string => {
  if (threatLevel <= 1) return baseColor;
  
  // Gradually shift toward red as threat increases
  const shiftAmount = (threatLevel - 1) / 4; // 0 to 1
  const baseHsl = hexToHsl(baseColor);
  
  // Shift hue toward red (0°)
  const targetHue = 0;
  const newHue = baseHsl.h + (targetHue - baseHsl.h) * shiftAmount * 0.5;
  
  // Increase saturation
  const newSaturation = Math.min(100, baseHsl.s + shiftAmount * 20);
  
  return hslToHex({ h: newHue, s: newSaturation, l: baseHsl.l });
};
```

---

## 3. ANIMATION CHOREOGRAPHY

### 3.1 Entity Entrance Sequences

**SHADOW Entrance:**
```typescript
const shadowEntranceSequence: AnimationSequence = [
  // Phase 1: Environment preparation (pre-entrance)
  {
    target: 'body',
    duration: 500,
    properties: {
      filter: 'hue-rotate(-10deg) saturate(0.9)',
    },
    timing: -500, // 500ms before main animation
  },
  
  // Phase 2: Backdrop
  {
    target: '.overlay-backdrop',
    duration: 200,
    properties: {
      opacity: [0, 0.95],
      background: ['rgba(10,10,20,0)', 'rgba(30,10,20,0.95)'],
    },
    timing: 0,
  },
  
  // Phase 3: Symbol appearance
  {
    target: '.shadow-symbol',
    duration: 300,
    properties: {
      scale: [0.5, 1.02, 1],
      opacity: [0, 1],
      filter: ['blur(10px)', 'blur(0px)'],
    },
    timing: 200,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  
  // Phase 4: Eye opening
  {
    target: '.shadow-eye',
    duration: 300,
    properties: {
      scaleY: [0, 1],
    },
    timing: 500,
  },
  
  // Phase 5: Container
  {
    target: '.message-container',
    duration: 200,
    properties: {
      opacity: [0, 1],
      y: [10, 0],
    },
    timing: 700,
  },
];

// MCP Entrance (more stable, protective)
const mcpEntranceSequence: AnimationSequence = [
  {
    target: '.overlay-backdrop',
    duration: 200,
    properties: { opacity: [0, 0.9] },
    timing: 0,
  },
  {
    target: '.mcp-hexagon',
    duration: 300,
    properties: { 
      scale: [0.8, 1], 
      opacity: [0, 1],
      rotate: [30, 0],
    },
    timing: 100,
  },
  {
    target: '.mcp-ring',
    duration: 400,
    properties: { scale: [0, 1], opacity: [0, 1] },
    timing: 200,
    stagger: 100,
  },
  {
    target: '.mcp-scanline',
    duration: 300,
    properties: { scaleX: [0, 1] },
    timing: 500,
  },
];

// ECHO Entrance (uncertain, flickering)
const echoEntranceSequence: AnimationSequence = [
  {
    target: '.overlay-backdrop',
    duration: 300,
    properties: { 
      opacity: [0, 0.5, 0.8, 0.6, 0.85],
    },
    timing: 0,
  },
  {
    target: '.echo-symbol',
    duration: 500,
    properties: { 
      opacity: [0, 0.8, 0.4, 1, 0.7, 0.9],
      scale: [0.9, 1.02, 0.98, 1],
    },
    timing: 100,
  },
  {
    target: '.echo-wave',
    duration: 600,
    properties: { scale: [0.5, 1.5], opacity: [0.8, 0] },
    timing: 200,
    stagger: 200,
  },
];
```

### 3.2 Typing Effect Variations

**Algorithm:**
```typescript
interface TypingConfig {
  entity: 'MCP' | 'SHADOW' | 'ECHO';
  baseSpeed: number; // ms per character
  text: string;
}

const getTypingVariation = (config: TypingConfig) => {
  const { entity, baseSpeed, text } = config;
  
  // Entity-specific variations
  const variations = {
    MCP: {
      speedVariation: 0.1, // Very consistent
      pauseAtPunctuation: 100,
      cursorStyle: 'block',
    },
    SHADOW: {
      speedVariation: 0.3, // Slightly erratic
      pauseAtPunctuation: 200,
      occasionalGlitch: true,
      cursorStyle: 'underscore',
    },
    ECHO: {
      speedVariation: 0.5, // Very uncertain
      pauseAtPunctuation: 300,
      fadeInOut: true,
      cursorStyle: 'fading',
    },
  };
  
  const v = variations[entity];
  
  // Generate per-character timing
  return text.split('').map((char, i) => {
    let delay = baseSpeed;
    
    // Add variation
    delay *= 1 + (Math.random() - 0.5) * v.speedVariation;
    
    // Punctuation pause
    if (['.', '!', '?', ','].includes(char)) {
      delay += v.pauseAtPunctuation;
    }
    
    // SHADOW glitch chance
    if (entity === 'SHADOW' && v.occasionalGlitch && Math.random() < 0.05) {
      return { char, delay, glitch: true };
    }
    
    // ECHO fade
    if (entity === 'ECHO' && v.fadeInOut) {
      return { char, delay, opacity: 0.7 + Math.random() * 0.3 };
    }
    
    return { char, delay };
  });
};
```

---

## 4. MAP VISUAL EFFECTS

### 4.1 Camera Shake Algorithm

```typescript
interface ShakeConfig {
  intensity: number;    // 0-1
  duration: number;     // ms
  frequency: number;    // shakes per second
  decay: boolean;       // intensity decreases over time
}

const applyCameraShake = (
  map: MLMap, 
  config: ShakeConfig
): void => {
  const { intensity, duration, frequency, decay } = config;
  const intervalMs = 1000 / frequency;
  const startTime = Date.now();
  const originalCenter = map.getCenter();
  
  const shake = () => {
    const elapsed = Date.now() - startTime;
    if (elapsed >= duration) {
      map.setCenter(originalCenter);
      return;
    }
    
    // Calculate current intensity (with optional decay)
    let currentIntensity = intensity;
    if (decay) {
      currentIntensity *= 1 - (elapsed / duration);
    }
    
    // Random offset
    const maxOffset = currentIntensity * 0.001; // ~100m at zoom 15
    const offsetLng = (Math.random() - 0.5) * maxOffset;
    const offsetLat = (Math.random() - 0.5) * maxOffset;
    
    map.setCenter([
      originalCenter.lng + offsetLng,
      originalCenter.lat + offsetLat
    ]);
    
    setTimeout(shake, intervalMs);
  };
  
  shake();
};
```

### 4.2 Terrain Warp Effect

```typescript
const applyTerrainWarp = (mapContainer: HTMLElement): void => {
  // CSS perspective warp
  mapContainer.style.transformOrigin = 'center center';
  mapContainer.style.perspective = '1000px';
  
  const warpAnimation = [
    { transform: 'rotateX(0deg) rotateY(0deg)' },
    { transform: 'rotateX(2deg) rotateY(-1deg)' },
    { transform: 'rotateX(-1deg) rotateY(2deg)' },
    { transform: 'rotateX(1deg) rotateY(-1deg)' },
    { transform: 'rotateX(0deg) rotateY(0deg)' },
  ];
  
  mapContainer.animate(warpAnimation, {
    duration: 600,
    easing: 'ease-in-out',
  });
};
```

### 4.3 Signal Pulse Visualization

```typescript
const createSignalPulse = (
  center: { lat: number; lng: number },
  map: MLMap,
  strength: number // 0-1
): void => {
  const pulseLayer: PulseLayerConfig = {
    id: `signal-pulse-${Date.now()}`,
    center,
    maxRadius: 50 + strength * 100, // meters
    color: strengthToColor(strength),
    duration: 1500,
    rings: 3,
  };
  
  // Add to map
  addPulseLayer(map, pulseLayer);
  
  // Auto-remove after animation
  setTimeout(() => {
    removePulseLayer(map, pulseLayer.id);
  }, pulseLayer.duration);
};

const strengthToColor = (strength: number): string => {
  // Transition from dim cyan to bright cyan based on strength
  const lightness = 40 + strength * 20;
  const saturation = 70 + strength * 30;
  return `hsl(187, ${saturation}%, ${lightness}%)`;
};
```

---

## 5. PARTICLE SYSTEMS

### 5.1 Success Burst Particles

```typescript
interface ParticleConfig {
  count: number;
  spread: number;
  colors: string[];
  gravity: number;
  decay: number;
  size: { min: number; max: number };
}

const createSuccessBurst = (
  origin: { x: number; y: number },
  config: ParticleConfig
): Particle[] => {
  const particles: Particle[] = [];
  
  for (let i = 0; i < config.count; i++) {
    const angle = (i / config.count) * Math.PI * 2;
    const velocity = config.spread * (0.5 + Math.random() * 0.5);
    
    particles.push({
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: 1,
      color: config.colors[i % config.colors.length],
      size: config.size.min + Math.random() * (config.size.max - config.size.min),
    });
  }
  
  return particles;
};

// Animation loop
const animateParticles = (
  particles: Particle[],
  config: ParticleConfig,
  ctx: CanvasRenderingContext2D
): void => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  let hasActiveParticles = false;
  
  particles.forEach(p => {
    if (p.life <= 0) return;
    
    hasActiveParticles = true;
    
    // Update physics
    p.x += p.vx;
    p.y += p.vy;
    p.vy += config.gravity;
    p.life -= config.decay;
    
    // Draw
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  });
  
  if (hasActiveParticles) {
    requestAnimationFrame(() => animateParticles(particles, config, ctx));
  }
};
```

### 5.2 ECHO Particle Halo

```typescript
const createEchoHalo = (
  centerElement: HTMLElement
): AnimationController => {
  const particleCount = 8;
  const particles: HTMLElement[] = [];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'echo-particle';
    centerElement.appendChild(particle);
    particles.push(particle);
    
    // Individual orbit animation
    const angle = (i / particleCount) * 360;
    const radius = 40 + Math.random() * 20;
    const duration = 3000 + Math.random() * 2000;
    
    particle.animate([
      { 
        transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
        opacity: 0.6,
      },
      { 
        transform: `rotate(${angle + 360}deg) translateX(${radius}px) rotate(-${angle + 360}deg)`,
        opacity: 0.8,
      },
    ], {
      duration,
      iterations: Infinity,
      easing: 'linear',
    });
  }
  
  return {
    stop: () => particles.forEach(p => p.remove()),
  };
};
```

---

## 6. FRAMER MOTION VARIANTS

### 6.1 Entity Overlay Variants

```typescript
export const overlayVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      when: 'afterChildren',
    },
  },
};

export const shadowSymbolVariants = {
  hidden: { 
    scale: 0.5, 
    opacity: 0, 
    filter: 'blur(10px)',
    rotate: -10,
  },
  visible: { 
    scale: 1, 
    opacity: 1, 
    filter: 'blur(0px)',
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    filter: 'blur(5px)',
  },
};

export const mcpSymbolVariants = {
  hidden: { scale: 0.8, opacity: 0, rotate: 30 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    rotate: 0,
    transition: { duration: 0.3 },
  },
  exit: { scale: 0.9, opacity: 0 },
};

export const echoSymbolVariants = {
  hidden: { 
    scale: 0.9, 
    opacity: 0,
  },
  visible: { 
    scale: 1, 
    opacity: [0, 0.8, 0.5, 1],
    transition: {
      opacity: { duration: 0.5, times: [0, 0.3, 0.6, 1] },
      scale: { duration: 0.4 },
    },
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    transition: { duration: 0.2 },
  },
};
```

### 6.2 Stagger Patterns

```typescript
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.08,
    },
  },
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};
```

---

**Document End**

*This document contains M1SSION™ proprietary visual effects algorithms.*
*Unauthorized distribution is prohibited.*

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved





