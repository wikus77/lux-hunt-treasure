// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DNAProfile } from './dnaTypes';
import { ARCHETYPE_CONFIGS } from './dnaTypes';

// ============= 3D UTILITIES (Full Radar 3D Projection) =============
type Vec3 = { x: number; y: number; z: number };
type Mat3 = [number, number, number, number, number, number, number, number, number];

const deg = (a: number) => (a * Math.PI) / 180;

// Rotation matrices
function rotX(a: number): Mat3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [1, 0, 0, 0, c, -s, 0, s, c];
}

function rotY(a: number): Mat3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}

// Matrix multiplication
function mulMV(m: Mat3, v: Vec3): Vec3 {
  return {
    x: m[0] * v.x + m[1] * v.y + m[2] * v.z,
    y: m[3] * v.x + m[4] * v.y + m[5] * v.z,
    z: m[6] * v.x + m[7] * v.y + m[8] * v.z
  };
}

function compose(a: Mat3, b: Mat3): Mat3 {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6], a[0] * b[1] + a[1] * b[4] + a[2] * b[7], a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6], a[3] * b[1] + a[4] * b[4] + a[5] * b[7], a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6], a[6] * b[1] + a[7] * b[4] + a[8] * b[7], a[6] * b[2] + a[7] * b[5] + a[8] * b[8]
  ];
}

// Perspective projection
function project(v: Vec3, fov = 520, zOff = 240): { x: number; y: number } {
  const z = v.z + zOff;
  const k = fov / (fov + z);
  return { x: v.x * k, y: v.y * k };
}

// 3D Radar constants (Full Tron-Glass with depth layering)
const DEPTH = 45;            // Glass thickness for pentagon
const FOV = 520;             // Field of view
const Z_OFFSET = 240;        // Camera distance offset
const FACE_ALPHA = 0.35;     // Front face translucency
const EDGE_ALPHA = 1.0;      // Edge visibility
// =================================================================

interface DNAVisualizerProps {
  profile: DNAProfile;
  size?: number;
  animate?: boolean;
  disableTilt?: boolean;
}

interface VertexPulse {
  key: string;
  timestamp: number;
}

/**
 * Pentagon DNA Visualizer V2 - With micro-transitions
 * 
 * Animated pentagon chart showing the 5 DNA attributes with:
 * - Vertex pulse on value change
 * - Ring ripple effect
 * - Respect prefers-reduced-motion
 */
export const DNAVisualizer: React.FC<DNAVisualizerProps> = ({ 
  profile, 
  size = 300,
  animate = true,
  disableTilt = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const archetypeConfig = ARCHETYPE_CONFIGS[profile.archetype];
  const prevProfileRef = useRef<DNAProfile>(profile);
  const [vertexPulses, setVertexPulses] = useState<VertexPulse[]>([]);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for input handling - no stale closure
  const inputEnabledRef = useRef(true);
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number } | null>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const leaveTimeoutRef = useRef<number | null>(null);
  const idleTimeoutRef = useRef<number | null>(null);
  // Live rotation consumed by draw() to avoid stale closure
  const rotationLiveRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // Debug tracing (temporary)
  const debugFramesRef = useRef(0);
  const DEBUG_DNA = true;
  
  // Separate concerns: visual effects vs interaction control
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reducedVisuals = prefersReducedMotion || disableTilt; // Only affects decorative animations
  const disableTiltControl = false; // Tilt is always enabled unless explicitly disabled
  
  // Gain adjustments for better sensitivity
  const MOUSE_GAIN = useRef(1.6);
  const TOUCH_GAIN = useRef(0.35);
  
  // Expose debug helpers
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).__dnaDebug = {
        enableTilt: (enabled: boolean) => {
          console.log('[DNA Debug] Tilt', enabled ? 'enabled' : 'disabled');
        },
        setGain: (mouse: number, touch: number) => {
          MOUSE_GAIN.current = mouse;
          TOUCH_GAIN.current = touch;
          console.log('[DNA Debug] Gain updated:', { mouse, touch });
        }
      };
    }
  }, []);

  // Pentagon vertex positions (clockwise from top)
  const attributes = [
    { key: 'intuito', label: 'INTUITO', angle: -Math.PI / 2 },
    { key: 'audacia', label: 'AUDACIA', angle: -Math.PI / 10 },
    { key: 'rischio', label: 'RISCHIO', angle: Math.PI / 2 + Math.PI / 5 },
    { key: 'etica', label: 'ETICA', angle: Math.PI + Math.PI / 5 },
    { key: 'vibrazione', label: 'VIBRAZIONE', angle: -Math.PI + Math.PI / 10 }
  ];

  // Detect value changes and trigger pulse
  useEffect(() => {
    if (!prevProfileRef.current) {
      prevProfileRef.current = profile;
      return;
    }

    const changedKeys: string[] = [];
    attributes.forEach(attr => {
      const oldVal = prevProfileRef.current[attr.key as keyof DNAProfile];
      const newVal = profile[attr.key as keyof DNAProfile];
      if (oldVal !== newVal && typeof oldVal === 'number' && typeof newVal === 'number') {
        changedKeys.push(attr.key);
      }
    });

    if (changedKeys.length > 0 && !reducedVisuals) {
      const newPulses: VertexPulse[] = changedKeys.map(key => ({
        key,
        timestamp: Date.now()
      }));
      setVertexPulses(prev => [...prev, ...newPulses]);

      // Remove pulses after animation completes
      setTimeout(() => {
        setVertexPulses(prev => prev.filter(p => !newPulses.includes(p)));
      }, 600);
    }

    prevProfileRef.current = profile;
  }, [profile, reducedVisuals]);

  // Unified Pointer Events interaction - NO STALE CLOSURE
  useEffect(() => {
    if (disableTiltControl) {
      console.log('[DNA] Tilt control explicitly disabled');
      return;
    }
    
    const container = containerRef.current;
    if (!container) {
      console.warn('[DNA] Container ref not attached');
      return;
    }
    
    // Prevent native touch scroll/pan
    (container.style as any).touchAction = 'none';
    
    if (DEBUG_DNA) {
      console.log('[DNA TRACE] visualizer mounted: DNAVisualizerV2.tsx');
      console.log('[DNA TRACE] listeners attached: pointer=ON');
      console.log('[DNA TRACE] reducedMotion=', prefersReducedMotion, 'disableTilt=', disableTilt);
      console.log('[DNA TRACE] containerRef attached=', !!containerRef.current);
      console.log('[DNA TRACE] Full 3D Radar mode: ON (Tron-Glass)');
    } else {
      console.log('[DNA] hover parallax enabled (desktop), drag enabled (desktop+mobile), prefersReducedMotion=' + prefersReducedMotion);
    }
    
    // Constants
    const MAX_ROT_MOUSE = 18;
    const MAX_ROT_TOUCH = 22;
    const MOUSE_GAIN = 1.0;
    const TOUCH_GAIN = 0.5;
    const INERTIA_DECAY = 0.92;
    
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    
    // Pointer Events (unified for mouse, touch, pen)
    const onPointerDown = (e: PointerEvent) => {
      if (!inputEnabledRef.current) return;
      
      inputEnabledRef.current = true;
      isDraggingRef.current = true;
      setIsDragging(true);
      container.setPointerCapture?.(e.pointerId);
      
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        rotX: targetRotationRef.current.x,
        rotY: targetRotationRef.current.y,
      };
      
      velocityRef.current = { x: 0, y: 0 };
      
      if (DEBUG_DNA) {
        console.log('[DNA TRACE] pointerdown type=', e.pointerType, 'isDragging=true');
      }
    };
    
    const onPointerMove = (e: PointerEvent) => {
      if (!inputEnabledRef.current) return;
      
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / rect.width;   // roughly -0.5..+0.5
      const ny = (e.clientY - cy) / rect.height;  // roughly -0.5..+0.5

      const isTouch = e.pointerType === 'touch';
      const max = isTouch ? MAX_ROT_TOUCH : MAX_ROT_MOUSE;
      const gain = isTouch ? TOUCH_GAIN : MOUSE_GAIN;

      const baseX = clamp(ny * max * gain, -max, max);
      const baseY = clamp(nx * max * gain, -max, max);

      // Differentiate: explicit drag vs passive hover
      if (isDraggingRef.current) {
        // Manual control during drag (desktop + mobile)
        const prevTarget = targetRotationRef.current;
        velocityRef.current = {
          x: (baseX - prevTarget.x) * 0.25,
          y: (baseY - prevTarget.y) * 0.25,
        };
        targetRotationRef.current = { x: baseX, y: baseY };
        
        if (DEBUG_DNA) {
          console.log('[DNA TRACE] pointermove type=', e.pointerType, 'isDragging=true baseX=', baseX.toFixed(2), 'baseY=', baseY.toFixed(2));
        }
      } else if (e.pointerType === 'mouse') {
        // Passive parallax hover (desktop only, reduced sensitivity)
        const hoverX = baseX * 0.5; // 50% sensitivity for subtle effect
        const hoverY = baseY * 0.5;
        targetRotationRef.current = { x: hoverX, y: hoverY };
        
        if (DEBUG_DNA) {
          console.log('[DNA TRACE] pointermove type=mouse isDragging=false hoverX=', hoverX.toFixed(2), 'hoverY=', hoverY.toFixed(2), 'nx=', nx.toFixed(3), 'ny=', ny.toFixed(3));
        }
        
        // Idle stabilization: reset to (0,0) if mouse stays still
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => {
          if (!isDraggingRef.current) {
            targetRotationRef.current = { x: 0, y: 0 };
          }
        }, 800) as unknown as number;
      }
      // Touch without drag: no effect (touch requires explicit drag)
    };
    
    const onPointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      setIsDragging(false);
      dragStartRef.current = null;
      container.releasePointerCapture?.(e.pointerId);
      
      if (DEBUG_DNA) {
        console.log('[DNA TRACE] pointerup type=', e.pointerType, 'velocity=', velocityRef.current);
      }
      
      // Inertia: continue movement with decay (desktop + mobile)
      const DECAY = 0.92;
      const threshold = 0.01;
      const velocityThreshold = e.pointerType === 'mouse' ? 0.3 : 0.5;
      
      if (Math.abs(velocityRef.current.x) > velocityThreshold || Math.abs(velocityRef.current.y) > velocityThreshold) {
        const max = e.pointerType === 'mouse' ? MAX_ROT_MOUSE : MAX_ROT_TOUCH;
        
        const decay = () => {
          velocityRef.current.x *= DECAY;
          velocityRef.current.y *= DECAY;
          
          targetRotationRef.current = {
            x: clamp(targetRotationRef.current.x + velocityRef.current.x, -max, max),
            y: clamp(targetRotationRef.current.y + velocityRef.current.y, -max, max),
          };
          
          if (Math.abs(velocityRef.current.x) > threshold || Math.abs(velocityRef.current.y) > threshold) {
            requestAnimationFrame(decay);
          }
        };
        requestAnimationFrame(decay);
      }
    };
    
    const onMouseLeave = () => {
      // No auto-reset: keep last rotation when mouse leaves
      // User can double-click/tap to reset manually if needed
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
    
    const onDoubleClick = () => {
      targetRotationRef.current = { x: 0, y: 0 };
      setRotation({ x: 0, y: 0 });
      velocityRef.current = { x: 0, y: 0 };
    };
    
    // Register unified handlers
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('dblclick', onDoubleClick);
    
    return () => {
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('dblclick', onDoubleClick);
      
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []); // ❗️ EMPTY DEPENDENCY - NO STALE CLOSURE
  
  // Lerp/spring easing for smooth rotation - ALWAYS ACTIVE (independent from visual effects)
  useEffect(() => {
    if (disableTiltControl) return;
    
    let animationId: number;
    const lerp = (current: number, target: number, alpha: number) => {
      return current * (1 - alpha) + target * alpha;
    };
    
    const animate = () => {
      setRotation(prev => {
        const alpha = isDraggingRef.current ? 0.16 : 0.12; // More responsive on drag
        const target = targetRotationRef.current;
        const newX = lerp(prev.x, target.x, alpha);
        const newY = lerp(prev.y, target.y, alpha);
        
        // Update live ref for draw() to consume (fixes stale closure)
        rotationLiveRef.current = { x: newX, y: newY };
        
        if (DEBUG_DNA && debugFramesRef.current < 20) {
          console.log('[DNA TRACE] lerp rot=', newX.toFixed(2), newY.toFixed(2));
        }
        
        // Stop animating if close enough
        if (Math.abs(newX - target.x) < 0.01 && Math.abs(newY - target.y) < 0.01) {
          return { x: target.x, y: target.y };
        }
        
        return { x: newX, y: newY };
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [disableTiltControl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;

    let frame = 0;
    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      
      // Get current rotation from live ref
      const rot = rotationLiveRef.current;
      const rx = deg(rot.x);
      const ry = deg(rot.y);
      
      // Build rotation matrix once (Y then X for natural look)
      const RX = rotX(rx);
      const RY = rotY(ry);
      const R = compose(RY, RX);
      
      // Debug trace (first 20 frames to verify movement)
      if (DEBUG_DNA && debugFramesRef.current < 20) {
        console.log(`[DNA 3D FULL] frame=${frame} rot=(${rot.x.toFixed(2)}, ${rot.y.toFixed(2)})`);
        debugFramesRef.current++;
      }
      
      // Calculate pentagon vertices in 2D (normalized to radius)
      const pts2D: Array<{ x: number; y: number; value: number; attr: typeof attributes[0] }> = 
        attributes.map(attr => {
          const value = profile[attr.key as keyof DNAProfile] as number;
          const normalizedValue = (value / 100) * radius;
          return {
            x: normalizedValue * Math.cos(attr.angle),
            y: normalizedValue * Math.sin(attr.angle),
            value,
            attr
          };
        });
      
      ctx.save();

      // ============= FULL 3D RENDERING: All layers with depth =============
      
      // Z-depth levels for layering effect
      const gridDepths = [28, 18, 8, -2, -12]; // outer to inner (5 levels)
      
      // Grid lines (concentric pentagons) - FULL 3D with depth
      for (let i = 1; i <= 5; i++) {
        const gridRadius = (radius * i) / 5;
        const gridZ = gridDepths[i - 1];
        
        ctx.beginPath();
        attributes.forEach((attr, idx) => {
          const px = gridRadius * Math.cos(attr.angle);
          const py = gridRadius * Math.sin(attr.angle);
          const v = mulMV(R, { x: px, y: py, z: gridZ });
          const s = project(v, FOV, Z_OFFSET);
          
          if (idx === 0) ctx.moveTo(centerX + s.x, centerY + s.y);
          else ctx.lineTo(centerX + s.x, centerY + s.y);
        });
        ctx.closePath();
        
        // Double-stroke for neon glow (Tron style)
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + i * 0.03})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        if (!reducedVisuals) {
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 + i * 0.015})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // Axis lines - FULL 3D with slight depth
      attributes.forEach((attr) => {
        // Center point (slight negative z for depth)
        const vCenter = mulMV(R, { x: 0, y: 0, z: -8 });
        const sCenter = project(vCenter, FOV, Z_OFFSET);
        
        // Outer point (positive z for extrusion)
        const px = radius * Math.cos(attr.angle);
        const py = radius * Math.sin(attr.angle);
        const vOuter = mulMV(R, { x: px, y: py, z: 12 });
        const sOuter = project(vOuter, FOV, Z_OFFSET);
        
        ctx.beginPath();
        ctx.moveTo(centerX + sCenter.x, centerY + sCenter.y);
        ctx.lineTo(centerX + sOuter.x, centerY + sOuter.y);
        
        // Double-stroke for neon effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        if (!reducedVisuals) {
          ctx.globalAlpha = 0.4;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });

      // ============= DATA PENTAGON: 3D Glass with depth =============
      const pulseScale = (animate && !reducedVisuals) ? 1 + Math.sin(frame / 60) * 0.02 : 1;
      
      // Create 3D vertices (front face z=0, back face z=-DEPTH)
      const faceFront3D: Vec3[] = pts2D.map(p => ({ x: p.x, y: p.y, z: 0 }));
      const faceBack3D: Vec3[] = pts2D.map(p => ({ x: p.x, y: p.y, z: -DEPTH }));
      
      // Rotate & project both faces
      const F = faceFront3D.map(v => {
        const rotated = mulMV(R, v);
        return project(rotated, FOV, Z_OFFSET);
      });
      const B = faceBack3D.map(v => {
        const rotated = mulMV(R, v);
        return project(rotated, FOV, Z_OFFSET);
      });
      
      // Debug projection (first 3 frames)
      if (DEBUG_DNA && frame <= 2) {
        console.log(`[DNA 3D FULL] pentagon proj F0=(${F[0].x.toFixed(1)},${F[0].y.toFixed(1)}) B0=(${B[0].x.toFixed(1)},${B[0].y.toFixed(1)})`);
      }
      
      // BACK FACE (deeper, translucent - glass back)
      ctx.save();
      ctx.globalAlpha = FACE_ALPHA * 0.8;
      ctx.beginPath();
      B.forEach((pt, idx) => {
        const x = centerX + pt.x;
        const y = centerY + pt.y;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      
      // Back face fill
      const backGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      backGradient.addColorStop(0, `${archetypeConfig.color}40`);
      backGradient.addColorStop(1, `${archetypeConfig.color}10`);
      ctx.fillStyle = backGradient;
      ctx.fill();
      
      // Back face stroke
      ctx.strokeStyle = `${archetypeConfig.color}85`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
      
      // EDGE CONNECTORS (wireframe glass effect)
      ctx.save();
      ctx.globalAlpha = EDGE_ALPHA * 0.9;
      ctx.strokeStyle = `${archetypeConfig.color}`;
      ctx.lineWidth = 2.5;
      for (let i = 0; i < F.length; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX + F[i].x, centerY + F[i].y);
        ctx.lineTo(centerX + B[i].x, centerY + B[i].y);
        ctx.stroke();
      }
      ctx.restore();
      
      // FRONT FACE (main data polygon with holographic glow)
      ctx.save();
      ctx.globalAlpha = FACE_ALPHA;
      
      // Dynamic shadow based on rotation
      const shadowIntensity = Math.abs(Math.sin(rx)) * 0.5 + Math.abs(Math.sin(ry)) * 0.5;
      ctx.shadowColor = `${archetypeConfig.color}70`;
      ctx.shadowBlur = 25 + shadowIntensity * 20;
      ctx.shadowOffsetX = Math.sin(ry) * 12;
      ctx.shadowOffsetY = Math.sin(rx) * 12;
      
      ctx.beginPath();
      F.forEach((pt, idx) => {
        const x = centerX + pt.x;
        const y = centerY + pt.y;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      
      // Front face fill with gradient
      const frontGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      frontGradient.addColorStop(0, `${archetypeConfig.color}60`);
      frontGradient.addColorStop(1, `${archetypeConfig.color}20`);
      ctx.fillStyle = frontGradient;
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.restore();
      
      // FRONT FACE STROKE (bright edge with glow)
      ctx.save();
      ctx.globalAlpha = EDGE_ALPHA;
      
      // Add subtle glow to front edge
      if (!reducedVisuals) {
        ctx.shadowColor = archetypeConfig.color;
        ctx.shadowBlur = 8;
      }
      
      ctx.beginPath();
      F.forEach((pt, idx) => {
        const x = centerX + pt.x;
        const y = centerY + pt.y;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = archetypeConfig.color;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.restore();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Data points with pulse effect (on front face vertices in 3D)
      attributes.forEach((attr, idx) => {
        const value = profile[attr.key as keyof DNAProfile] as number;
        const isPulsing = vertexPulses.some(p => p.key === attr.key);
        const vertexPulseScale = isPulsing && !reducedVisuals ? 1.06 : 1;
        
        // Use projected 3D coordinates for front face
        const x = centerX + F[idx].x;
        const y = centerY + F[idx].y;

        // Ring ripple on pulse
        if (isPulsing && !reducedVisuals) {
          const pulse = vertexPulses.find(p => p.key === attr.key);
          if (pulse) {
            const elapsed = (Date.now() - pulse.timestamp) / 600; // 0-1 over 600ms
            const rippleRadius = 15 * elapsed;
            const rippleOpacity = (1 - elapsed) * 0.4;
            
            ctx.beginPath();
            ctx.arc(x, y, rippleRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `${archetypeConfig.color}${Math.floor(rippleOpacity * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        // Point glow
        const glowSize = 8 * vertexPulseScale;
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        glowGradient.addColorStop(0, archetypeConfig.color);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x - glowSize, y - glowSize, glowSize * 2, glowSize * 2);

        // Point
        ctx.beginPath();
        ctx.arc(x, y, 5 * vertexPulseScale, 0, Math.PI * 2);
        ctx.fillStyle = archetypeConfig.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Labels (static 2D positions, always readable)
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      attributes.forEach((attr) => {
        const labelRadius = radius + 30;
        const x = centerX + labelRadius * Math.cos(attr.angle);
        const y = centerY + labelRadius * Math.sin(attr.angle);
        const value = profile[attr.key as keyof DNAProfile] as number;

        // Label background
        const textWidth = ctx.measureText(attr.label).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x - textWidth / 2 - 4, y - 8, textWidth + 8, 16);

        // Label text
        ctx.fillStyle = archetypeConfig.color;
        ctx.fillText(attr.label, x, y - 4);

        // Value
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(`${value}`, x, y + 6);
        ctx.font = 'bold 11px Inter, sans-serif';
      });

      // ALWAYS redraw to reflect rotation changes (tilt is control, not decoration)
      if (animate) {
        frame++;
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [profile, size, animate, archetypeConfig.color, vertexPulses, reducedVisuals]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reducedVisuals ? 0.1 : 0.6, ease: "easeOut" }}
      className="relative"
      style={{ 
        width: size, 
        height: size,
        touchAction: 'none', // Prevent scroll during drag
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Canvas with Full 3D Radar (Tron-Glass) */}
      <canvas
        ref={canvasRef}
        className="rounded-lg"
        style={{
          filter: `drop-shadow(0 0 40px ${archetypeConfig.color}50) brightness(1.1)`,
          cursor: disableTiltControl ? 'default' : (isDragging ? 'grabbing' : 'grab'),
          pointerEvents: 'auto'
        }}
      />
      
      {/* Debug label (DEV only) */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          style={{
            position: 'absolute',
            bottom: -25,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'monospace',
            pointerEvents: 'none'
          }}
        >
          FULL 3D RADAR (Tron-Glass)
        </div>
      )}
    </motion.div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
