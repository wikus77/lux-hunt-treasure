# M1SSION™ BRAND & DESIGN BIBLE — INTERNAL SECRET
## Volume 2: CSS Architecture & Component Secrets

**Document Version:** 1.0  
**Classification:** INTERNAL SECRET — NOT FOR DISTRIBUTION  
**Copyright:** © 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved

---

## ⚠️ CONFIDENTIALITY NOTICE

This document contains proprietary implementation details. Unauthorized disclosure is prohibited.

---

## 1. CSS ARCHITECTURE OVERVIEW

### 1.1 File Structure

```
src/styles/
├── base/
│   ├── reset.css           # Normalized reset
│   ├── typography.css      # Type system
│   └── variables.css       # CSS custom properties
├── components/
│   ├── buttons.css
│   ├── cards.css
│   ├── forms.css
│   └── modals.css
├── effects/
│   ├── glitch.css          # Glitch effects
│   ├── glow.css            # Neon glow system
│   └── shadow-protocol.css # Entity overlay styles
├── layouts/
│   ├── grid.css
│   ├── navigation.css
│   └── pages.css
└── index.css               # Main entry
```

### 1.2 Naming Conventions

**BEM-inspired with M1SSION modifications:**
```
.block {}
.block__element {}
.block--modifier {}
.block__element--modifier {}
```

**Entity prefixes:**
```
.shadow-*  # SHADOW entity styles
.mcp-*     # MCP entity styles
.echo-*    # ECHO entity styles
.entity-*  # Shared entity styles
```

**State prefixes:**
```
.is-*      # State classes (is-active, is-loading)
.has-*     # Conditional content (has-error)
```

---

## 2. CSS CUSTOM PROPERTIES SYSTEM

### 2.1 Color Properties

```css
:root {
  /* Base palette */
  --color-void: #0A0A14;
  --color-deep-space: #12121F;
  --color-night-surface: #1A1A2E;
  --color-midnight: #252538;
  
  /* Entity colors */
  --color-mcp-primary: #00E5FF;
  --color-mcp-secondary: #00BFFF;
  --color-shadow-primary: #FF3366;
  --color-shadow-secondary: #FF6B8A;
  --color-echo-primary: #9966FF;
  --color-echo-secondary: #B388FF;
  
  /* Semantic colors */
  --color-success: #00FF88;
  --color-warning: #FF8C00;
  --color-error: #FF3366;
  --color-info: #00E5FF;
  
  /* Text colors */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: rgba(255, 255, 255, 0.7);
  --color-text-muted: rgba(255, 255, 255, 0.4);
  
  /* Dynamic colors (modified by JS) */
  --color-entity-active: var(--color-mcp-primary);
  --color-threat-level: var(--color-mcp-primary);
}

/* Threat level overrides */
.threat-warning {
  --color-threat-level: var(--color-warning);
}

.threat-high {
  --color-threat-level: var(--color-shadow-primary);
}
```

### 2.2 Spacing Properties

```css
:root {
  /* Base spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  
  /* Component spacing */
  --card-padding: var(--space-4);
  --modal-padding: var(--space-6);
  --section-gap: var(--space-8);
  --page-padding: var(--space-4);
}

/* Responsive scaling */
@media (min-width: 768px) {
  :root {
    --card-padding: var(--space-5);
    --modal-padding: var(--space-8);
    --page-padding: var(--space-6);
  }
}
```

### 2.3 Typography Properties

```css
:root {
  /* Font families */
  --font-display: 'Electrolize', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'Roboto Mono', monospace;
  
  /* Font sizes */
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 15px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  --text-4xl: 40px;
  
  /* Line heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;
  
  /* Letter spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}
```

### 2.4 Effect Properties

```css
:root {
  /* Glow effects */
  --glow-sm: 0 0 10px;
  --glow-md: 0 0 20px;
  --glow-lg: 0 0 40px;
  --glow-xl: 0 0 60px;
  
  /* Blur values */
  --blur-sm: 4px;
  --blur-md: 8px;
  --blur-lg: 16px;
  --blur-xl: 24px;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 250ms ease-out;
  --transition-slow: 400ms ease-out;
  --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 3. GLOW SYSTEM IMPLEMENTATION

### 3.1 Base Glow Classes

```css
.glow-cyan {
  box-shadow: 
    0 0 5px rgba(0, 229, 255, 0.3),
    0 0 10px rgba(0, 229, 255, 0.2),
    0 0 20px rgba(0, 229, 255, 0.1);
}

.glow-cyan-intense {
  box-shadow: 
    0 0 10px rgba(0, 229, 255, 0.5),
    0 0 20px rgba(0, 229, 255, 0.3),
    0 0 40px rgba(0, 229, 255, 0.2),
    0 0 60px rgba(0, 229, 255, 0.1);
}

.glow-red {
  box-shadow: 
    0 0 5px rgba(255, 51, 102, 0.3),
    0 0 10px rgba(255, 51, 102, 0.2),
    0 0 20px rgba(255, 51, 102, 0.1);
}

.glow-purple {
  box-shadow: 
    0 0 5px rgba(153, 102, 255, 0.3),
    0 0 10px rgba(153, 102, 255, 0.2),
    0 0 20px rgba(153, 102, 255, 0.1);
}
```

### 3.2 Text Glow System

```css
.text-glow-cyan {
  text-shadow: 
    0 0 5px rgba(0, 229, 255, 0.5),
    0 0 10px rgba(0, 229, 255, 0.3),
    0 0 20px rgba(0, 229, 255, 0.2);
}

.text-glow-red {
  text-shadow: 
    0 0 5px rgba(255, 51, 102, 0.5),
    0 0 10px rgba(255, 51, 102, 0.3),
    0 0 20px rgba(255, 51, 102, 0.2);
}

/* Animated glow pulse */
@keyframes glow-pulse {
  0%, 100% {
    filter: brightness(1);
    text-shadow: 
      0 0 5px currentColor,
      0 0 10px currentColor;
  }
  50% {
    filter: brightness(1.1);
    text-shadow: 
      0 0 10px currentColor,
      0 0 20px currentColor,
      0 0 30px currentColor;
  }
}

.glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}
```

### 3.3 Border Glow

```css
.border-glow {
  position: relative;
}

.border-glow::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    135deg,
    var(--color-mcp-primary),
    transparent 40%,
    transparent 60%,
    var(--color-mcp-primary)
  );
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

---

## 4. GLITCH EFFECTS SYSTEM

### 4.1 Base Glitch Animation

```css
@keyframes glitch {
  0%, 100% {
    transform: translate(0);
    filter: none;
  }
  20% {
    transform: translate(-2px, 1px);
    filter: hue-rotate(10deg);
  }
  40% {
    transform: translate(2px, -1px);
    filter: hue-rotate(-10deg);
  }
  60% {
    transform: translate(-1px, 2px);
    filter: saturate(1.2);
  }
  80% {
    transform: translate(1px, -2px);
    filter: saturate(0.8);
  }
}

.glitch-effect {
  animation: glitch 0.3s ease-out;
}
```

### 4.2 Channel Separation

```css
.channel-separation {
  position: relative;
}

.channel-separation::before,
.channel-separation::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.channel-separation::before {
  color: #ff0000;
  left: -2px;
  animation: channel-glitch-r 3s infinite linear;
}

.channel-separation::after {
  color: #00ffff;
  left: 2px;
  animation: channel-glitch-c 3s infinite linear;
}

@keyframes channel-glitch-r {
  0%, 100% { clip-path: inset(0 0 100% 0); }
  10% { clip-path: inset(30% 0 60% 0); }
  20% { clip-path: inset(70% 0 20% 0); }
  30% { clip-path: inset(0 0 100% 0); }
}

@keyframes channel-glitch-c {
  0%, 100% { clip-path: inset(0 0 100% 0); }
  15% { clip-path: inset(50% 0 40% 0); }
  25% { clip-path: inset(20% 0 70% 0); }
  35% { clip-path: inset(0 0 100% 0); }
}
```

### 4.3 Scan Line Effect

```css
.scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  pointer-events: none;
  animation: scanline-move 8s linear infinite;
}

@keyframes scanline-move {
  0% { background-position: 0 0; }
  100% { background-position: 0 100%; }
}
```

### 4.4 Static Noise

```css
.static-noise::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.05;
  pointer-events: none;
  animation: noise-shift 0.2s steps(10) infinite;
}

@keyframes noise-shift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-10px, -10px); }
}
```

---

## 5. ENTITY OVERLAY STYLES

### 5.1 Base Overlay Container

```css
.entity-overlay {
  position: fixed;
  inset: 0;
  z-index: 50000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.entity-overlay__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 20, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

### 5.2 SHADOW Specific Styles

```css
.entity-overlay--shadow {
  --entity-color: var(--color-shadow-primary);
}

.entity-overlay--shadow .entity-overlay__backdrop {
  background: linear-gradient(
    135deg,
    rgba(10, 10, 20, 0.98) 0%,
    rgba(30, 10, 20, 0.95) 50%,
    rgba(10, 10, 20, 0.98) 100%
  );
}

.shadow-symbol {
  width: 120px;
  height: 120px;
  position: relative;
}

.shadow-symbol__triangle {
  width: 0;
  height: 0;
  border-left: 60px solid transparent;
  border-right: 60px solid transparent;
  border-bottom: 104px solid var(--color-shadow-primary);
  transform: rotate(180deg);
  filter: drop-shadow(0 0 20px var(--color-shadow-primary));
  animation: shadow-pulse 3s ease-in-out infinite;
}

.shadow-symbol__eye {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -20%);
  width: 24px;
  height: 12px;
  background: #0A0A14;
  border-radius: 50%;
  animation: eye-blink 4s ease-in-out infinite;
}

@keyframes shadow-pulse {
  0%, 100% { transform: rotate(180deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.02); }
}

@keyframes eye-blink {
  0%, 90%, 100% { transform: translate(-50%, -20%) scaleY(1); }
  95% { transform: translate(-50%, -20%) scaleY(0.1); }
}
```

### 5.3 MCP Specific Styles

```css
.entity-overlay--mcp {
  --entity-color: var(--color-mcp-primary);
}

.mcp-symbol {
  width: 120px;
  height: 120px;
  position: relative;
}

.mcp-symbol__hexagon {
  width: 100px;
  height: 115px;
  background: transparent;
  position: relative;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  border: 3px solid var(--color-mcp-primary);
  filter: drop-shadow(0 0 15px var(--color-mcp-primary));
}

.mcp-symbol__ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(0, 229, 255, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: mcp-rotate 10s linear infinite;
}

.mcp-symbol__ring:nth-child(2) {
  width: 60px;
  height: 60px;
  animation-direction: reverse;
  animation-duration: 8s;
}

.mcp-symbol__ring:nth-child(3) {
  width: 40px;
  height: 40px;
  animation-duration: 6s;
}

@keyframes mcp-rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
```

### 5.4 ECHO Specific Styles

```css
.entity-overlay--echo {
  --entity-color: var(--color-echo-primary);
}

.echo-symbol {
  width: 120px;
  height: 120px;
  position: relative;
}

.echo-symbol__wave {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  border: 2px solid var(--color-echo-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.7;
  animation: echo-pulse 2s ease-out infinite;
  clip-path: polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%);
}

.echo-symbol__wave:nth-child(2) {
  animation-delay: 0.5s;
  width: 100px;
  height: 100px;
}

.echo-symbol__wave:nth-child(3) {
  animation-delay: 1s;
  width: 120px;
  height: 120px;
}

@keyframes echo-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}
```

---

## 6. COMPONENT SECRETS

### 6.1 Glass Card Effect

```css
.glass-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.glass-card--elevated {
  transform: translateY(0);
  transition: transform var(--transition-normal), 
              box-shadow var(--transition-normal);
}

.glass-card--elevated:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 8px 12px rgba(0, 0, 0, 0.15),
    0 20px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
```

### 6.2 Buzz Button Complete Styles

```css
.buzz-button {
  --buzz-size: 80px;
  --buzz-glow-color: var(--color-mcp-primary);
  
  width: var(--buzz-size);
  height: var(--buzz-size);
  border-radius: 50%;
  border: none;
  background: linear-gradient(
    135deg,
    var(--color-mcp-primary) 0%,
    var(--color-mcp-secondary) 100%
  );
  color: var(--color-void);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  position: relative;
  overflow: visible;
  transition: transform var(--transition-fast);
}

/* Outer ring */
.buzz-button::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba(0, 229, 255, 0.3);
  animation: buzz-ring-rotate 10s linear infinite;
}

/* Glow effect */
.buzz-button::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: transparent;
  box-shadow: 
    0 0 20px var(--buzz-glow-color),
    0 0 40px var(--buzz-glow-color),
    0 0 60px rgba(0, 229, 255, 0.3);
  opacity: 0.5;
  animation: buzz-glow-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes buzz-ring-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes buzz-glow-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

/* States */
.buzz-button:hover {
  transform: scale(1.05);
}

.buzz-button:active {
  transform: scale(0.95);
}

.buzz-button:disabled {
  background: var(--color-midnight);
  cursor: not-allowed;
}

.buzz-button:disabled::after {
  display: none;
}

/* Processing state */
.buzz-button--processing {
  pointer-events: none;
}

.buzz-button--processing::after {
  animation: buzz-glow-intense 0.5s ease-in-out infinite;
}

@keyframes buzz-glow-intense {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}
```

---

## 7. RESPONSIVE UTILITIES

### 7.1 Visibility Classes

```css
/* Mobile only (< 768px) */
.mobile-only {
  display: block;
}

@media (min-width: 768px) {
  .mobile-only { display: none; }
}

/* Tablet+ (≥ 768px) */
.tablet-up {
  display: none;
}

@media (min-width: 768px) {
  .tablet-up { display: block; }
}

/* Desktop+ (≥ 1024px) */
.desktop-up {
  display: none;
}

@media (min-width: 1024px) {
  .desktop-up { display: block; }
}
```

### 7.2 Safe Area Utilities

```css
.safe-top {
  padding-top: env(safe-area-inset-top);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-all {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

---

## 8. PERFORMANCE PATTERNS

### 8.1 GPU Acceleration

```css
/* Force GPU layer for animations */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}

/* Only during animation */
.animate-gpu {
  will-change: transform, opacity;
}

.animate-gpu.animation-complete {
  will-change: auto;
}
```

### 8.2 Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .glow-pulse,
  .buzz-button::after,
  .buzz-button::before {
    animation: none !important;
  }
}
```

---

**Document End**

*This document contains M1SSION™ proprietary CSS implementation details.*
*Unauthorized distribution is prohibited.*

© 2025 Joseph MULÉ — NIYVORA KFT™ — All Rights Reserved




