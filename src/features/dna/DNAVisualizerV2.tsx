// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DNAProfile } from './dnaTypes';
import { ARCHETYPE_CONFIGS } from './dnaTypes';
import { DNA3DPentagonIsomorphic } from './DNA3DPentagonIsomorphic';

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
  // 3D mode flag
  const ENABLE_3D = true;
  
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
      console.log('[DNA TRACE] 3D mode=', ENABLE_3D ? 'ON (React Three Fiber)' : 'OFF (Canvas 2D)');
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
    if (!canvas || ENABLE_3D) return; // Skip 2D draw if 3D mode is active

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
      
      // Apply perspective transform for parallax - ALWAYS if not disabled
      ctx.save();
      ctx.translate(centerX, centerY);
      
      if (!disableTiltControl) {
        // Read from live ref (fixes stale closure bug)
        const rot = rotationLiveRef.current;
        const rotX = (rot.x * Math.PI) / 180;
        const rotY = (rot.y * Math.PI) / 180;
        
        if (DEBUG_DNA && debugFramesRef.current < 20) {
          console.log('[DNA TRACE] draw frame=', frame, 'rot=', rot);
          debugFramesRef.current++;
        }
        
        // Simple 2D projection approximation
        const scaleX = Math.cos(rotY);
        const skewY = Math.sin(rotY) * 0.3;
        const scaleY = Math.cos(rotX);
        const skewX = Math.sin(rotX) * 0.3;
        
        ctx.transform(scaleX, skewX, skewY, scaleY, 0, 0);
      }
      
      ctx.translate(-centerX, -centerY);

      // Grid lines (concentric pentagons)
      for (let i = 1; i <= 5; i++) {
        const gridRadius = (radius * i) / 5;
        ctx.beginPath();
        attributes.forEach((attr, idx) => {
          const x = centerX + gridRadius * Math.cos(attr.angle);
          const y = centerY + gridRadius * Math.sin(attr.angle);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Axis lines
      attributes.forEach((attr) => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const x = centerX + radius * Math.cos(attr.angle);
        const y = centerY + radius * Math.sin(attr.angle);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Data polygon
      const pulseScale = (animate && !reducedVisuals) ? 1 + Math.sin(frame / 60) * 0.02 : 1;
      ctx.beginPath();
      attributes.forEach((attr, idx) => {
        const value = profile[attr.key as keyof DNAProfile] as number;
        const normalizedValue = (value / 100) * radius * pulseScale;
        const x = centerX + normalizedValue * Math.cos(attr.angle);
        const y = centerY + normalizedValue * Math.sin(attr.angle);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();

      // Fill with gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, `${archetypeConfig.color}60`);
      gradient.addColorStop(1, `${archetypeConfig.color}20`);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke
      ctx.strokeStyle = archetypeConfig.color;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Data points with pulse effect
      attributes.forEach((attr) => {
        const value = profile[attr.key as keyof DNAProfile] as number;
        const isPulsing = vertexPulses.some(p => p.key === attr.key);
        const vertexPulseScale = isPulsing && !reducedVisuals ? 1.06 : 1;
        
        const normalizedValue = (value / 100) * radius * pulseScale;
        const x = centerX + normalizedValue * Math.cos(attr.angle);
        const y = centerY + normalizedValue * Math.sin(attr.angle);

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

      // Labels
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
      {ENABLE_3D ? (
        // 3D Pentagon Isomorphic (Exact 2D replica with depth)
        <DNA3DPentagonIsomorphic
          rotation={rotationLiveRef.current}
          color={archetypeConfig.color}
          size={size}
          profile={profile}
          strokeWidth={3}
          glowIntensity={0.6}
        />
      ) : (
        // 2D Canvas fallback
        <canvas
          ref={canvasRef}
          className="rounded-lg"
          style={{
            filter: `drop-shadow(0 0 30px ${archetypeConfig.color}40)`,
            cursor: disableTiltControl ? 'default' : (isDragging ? 'grabbing' : 'grab'),
            pointerEvents: 'auto'
          }}
        />
      )}
      
      {/* Debug label (DEV only) */}
      {process.env.NODE_ENV === 'development' && ENABLE_3D && (
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
          3D MODE ON
        </div>
      )}
    </motion.div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
