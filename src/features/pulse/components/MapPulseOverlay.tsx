/**
 * THE PULSE™ — Map Pulse Overlay (2D/3D Ripple Effect)
 * Overlay canvas 2D per onde/ripple sulla mappa, disaccoppiato da layers e markers
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useRef, useState } from 'react';
import { usePulseRealtime } from '../hooks/usePulseRealtime';
import { motion, AnimatePresence } from 'framer-motion';

interface MapPulseOverlayProps {
  enabled?: boolean;
  reduceMotion?: boolean;
}

export const MapPulseOverlay = ({ enabled = true, reduceMotion = false }: MapPulseOverlayProps) => {
  const { lastUpdate, pulseState } = usePulseRealtime();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showThresholdBurst, setShowThresholdBurst] = useState(false);
  const animationFrameRef = useRef<number>();
  const ripplesRef = useRef<Array<{ x: number; y: number; radius: number; opacity: number; maxRadius: number }>>([]);

  // Trigger threshold burst animation
  useEffect(() => {
    if (lastUpdate?.threshold && !reduceMotion) {
      setShowThresholdBurst(true);
      setTimeout(() => setShowThresholdBurst(false), 1200);

      // Add ripple effect
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ripplesRef.current.push({
          x: centerX,
          y: centerY,
          radius: 0,
          opacity: 1,
          maxRadius: Math.max(canvas.width, canvas.height) * 0.8,
        });
      }
    }
  }, [lastUpdate?.threshold, reduceMotion]);

  // Canvas animation loop
  useEffect(() => {
    if (!enabled || reduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ripples
      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        ripple.radius += 3;
        ripple.opacity -= 0.015;

        if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
          return false;
        }

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(14, 165, 233, ${ripple.opacity * 0.5})`; // primary cyan
        ctx.lineWidth = 3;
        ctx.stroke();

        // Glow effect
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(14, 165, 233, ${ripple.opacity * 0.2})`;
        ctx.lineWidth = 6;
        ctx.stroke();

        return true;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, reduceMotion]);

  if (!enabled) return null;

  return (
    <>
      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[90]"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Threshold burst effect */}
      <AnimatePresence>
        {showThresholdBurst && !reduceMotion && (
          <motion.div
            className="fixed inset-0 z-[91] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-32 h-32 rounded-full bg-primary/30"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 2], opacity: [1, 0.5, 0] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute w-48 h-48 rounded-full bg-primary/20"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.8, 2.5], opacity: [1, 0.3, 0] }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
            />

            {/* Threshold text */}
            <motion.div
              className="absolute text-4xl font-bold text-primary"
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -50 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              {lastUpdate?.threshold}%
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
