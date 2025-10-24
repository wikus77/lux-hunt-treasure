/**
 * The Pulse™ — Ritual Distortion Trigger
 * Programmatic control for EMP interference visual effect
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

export interface RitualDistortionOptions {
  duration?: number; // milliseconds
  intensity?: 'normal' | 'high'; // 'high' for interference phase
  enableDisplacement?: boolean; // enable SVG displacement filter
}

let activeTimeout: NodeJS.Timeout | null = null;
let overlayElement: HTMLDivElement | null = null;
let svgElement: SVGSVGElement | null = null;
let isActive = false;

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Create and inject the CRT overlay element
 */
function createOverlay(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.className = 'ritual-crt-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  // Scanlines layer
  const scanlines = document.createElement('div');
  scanlines.className = 'ritual-scanlines';
  overlay.appendChild(scanlines);

  // Vignette layer
  const vignette = document.createElement('div');
  vignette.className = 'ritual-vignette';
  overlay.appendChild(vignette);

  // Shear bars (random positions)
  const shearContainer = document.createElement('div');
  shearContainer.className = 'ritual-shear-bars';
  
  // Generate 3-5 random shear bars
  const barCount = prefersReducedMotion() ? 0 : 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement('div');
    bar.className = 'ritual-shear-bar';
    bar.style.top = `${Math.random() * 100}%`;
    bar.style.animationDelay = `${Math.random() * 0.3}s`;
    shearContainer.appendChild(bar);
  }
  overlay.appendChild(shearContainer);

  // Flash pulse layer (irregular light bursts)
  const flashPulse = document.createElement('div');
  flashPulse.className = 'ritual-flash-pulse';
  overlay.appendChild(flashPulse);

  return overlay;
}

/**
 * Create and inject SVG displacement filter
 */
function createDisplacementSVG(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'ritual-displacement-svg');
  svg.setAttribute('aria-hidden', 'true');

  // Create filter
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filter.setAttribute('id', 'ritual-turbulence-filter');
  filter.setAttribute('x', '0');
  filter.setAttribute('y', '0');
  filter.setAttribute('width', '100%');
  filter.setAttribute('height', '100%');

  // Turbulence
  const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
  turbulence.setAttribute('type', 'fractalNoise');
  turbulence.setAttribute('baseFrequency', '0.01 0.02');
  turbulence.setAttribute('numOctaves', '2');
  turbulence.setAttribute('result', 'turbulence');
  turbulence.setAttribute('seed', String(Math.floor(Math.random() * 100)));

  // Displacement map
  const displacement = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
  displacement.setAttribute('in', 'SourceGraphic');
  displacement.setAttribute('in2', 'turbulence');
  displacement.setAttribute('scale', prefersReducedMotion() ? '1' : '3');
  displacement.setAttribute('xChannelSelector', 'R');
  displacement.setAttribute('yChannelSelector', 'G');

  filter.appendChild(turbulence);
  filter.appendChild(displacement);
  defs.appendChild(filter);
  svg.appendChild(defs);

  return svg;
}

/**
 * Cleanup function to remove effect
 */
function cleanup() {
  // Remove body classes
  document.body.classList.remove(
    'ritual-distortion-active',
    'ritual-distortion-interference',
    'ritual-displacement-enabled'
  );

  // Remove overlay
  if (overlayElement && overlayElement.parentNode) {
    overlayElement.parentNode.removeChild(overlayElement);
    overlayElement = null;
  }

  // Remove SVG filter
  if (svgElement && svgElement.parentNode) {
    svgElement.parentNode.removeChild(svgElement);
    svgElement = null;
  }

  // Clear timeout
  if (activeTimeout) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }

  isActive = false;
  console.log('[Ritual Distortion] Effect cleared');
}

/**
 * Trigger the ritual distortion effect
 * 
 * @param options - Configuration options
 * @returns Cleanup function to manually stop the effect
 */
export function triggerRitualDistortion(options: RitualDistortionOptions = {}): () => void {
  const {
    duration = 9000,
    intensity = 'normal',
    enableDisplacement = true
  } = options;

  // If already active, extend duration instead of restarting
  if (isActive) {
    console.log('[Ritual Distortion] Already active, extending duration');
    
    // Update intensity if needed
    if (intensity === 'high') {
      document.body.classList.add('ritual-distortion-interference');
    } else {
      document.body.classList.remove('ritual-distortion-interference');
    }

    // Clear existing timeout and set new one
    if (activeTimeout) {
      clearTimeout(activeTimeout);
    }
    activeTimeout = setTimeout(cleanup, duration);
    return cleanup;
  }

  console.log('[Ritual Distortion] Activating effect', { duration, intensity, enableDisplacement });

  // Mark as active
  isActive = true;

  // Add body class
  document.body.classList.add('ritual-distortion-active');
  
  if (intensity === 'high') {
    document.body.classList.add('ritual-distortion-interference');
  }

  // Create and inject overlay
  overlayElement = createOverlay();
  document.body.appendChild(overlayElement);

  // Create and inject SVG displacement (if enabled and not reduced motion)
  if (enableDisplacement && !prefersReducedMotion()) {
    svgElement = createDisplacementSVG();
    document.body.appendChild(svgElement);
    document.body.classList.add('ritual-displacement-enabled');
  }

  // Auto-cleanup after duration
  activeTimeout = setTimeout(cleanup, duration);

  // Return manual cleanup function
  return cleanup;
}

/**
 * Check if distortion effect is currently active
 */
export function isDistortionActive(): boolean {
  return isActive;
}

/**
 * Manually stop the distortion effect
 */
export function stopRitualDistortion(): void {
  if (isActive) {
    cleanup();
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
