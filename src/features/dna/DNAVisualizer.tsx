// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { DNAProfile } from './dnaTypes';
import { ARCHETYPE_CONFIGS } from './dnaTypes';

interface DNAVisualizerProps {
  profile: DNAProfile;
  size?: number;
  animate?: boolean;
}

/**
 * Pentagon DNA Visualizer
 * 
 * Animated pentagon chart showing the 5 DNA attributes:
 * - INTUITO (top)
 * - AUDACIA (top-right)
 * - RISCHIO (bottom-right)
 * - ETICA (bottom-left)
 * - VIBRAZIONE (top-left)
 */
export const DNAVisualizer: React.FC<DNAVisualizerProps> = ({ 
  profile, 
  size = 300,
  animate = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const archetypeConfig = ARCHETYPE_CONFIGS[profile.archetype];

  // Pentagon vertex positions (clockwise from top)
  const attributes = [
    { key: 'intuito', label: 'INTUITO', angle: -Math.PI / 2 },
    { key: 'audacia', label: 'AUDACIA', angle: -Math.PI / 10 },
    { key: 'rischio', label: 'RISCHIO', angle: Math.PI / 2 + Math.PI / 5 },
    { key: 'etica', label: 'ETICA', angle: Math.PI + Math.PI / 5 },
    { key: 'vibrazione', label: 'VIBRAZIONE', angle: -Math.PI + Math.PI / 10 }
  ];

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
      const pulseScale = animate ? 1 + Math.sin(frame / 60) * 0.02 : 1;
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

      // Data points
      attributes.forEach((attr) => {
        const value = profile[attr.key as keyof DNAProfile] as number;
        const normalizedValue = (value / 100) * radius * pulseScale;
        const x = centerX + normalizedValue * Math.cos(attr.angle);
        const y = centerY + normalizedValue * Math.sin(attr.angle);

        // Point glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
        glowGradient.addColorStop(0, archetypeConfig.color);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x - 8, y - 8, 16, 16);

        // Point
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
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

      if (animate) {
        frame++;
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [profile, size, animate, archetypeConfig.color]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        className="rounded-lg"
        style={{
          filter: `drop-shadow(0 0 30px ${archetypeConfig.color}40)`
        }}
      />
    </motion.div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
