// © 2025 Joseph MULÉ – M1SSION™ - Edge Glow Canvas Component
import React, { useRef, useEffect } from 'react';
import styles from './EdgeGlowCanvas.module.css';

interface EdgeGlowCanvasProps {
  audioLevel: number;
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
  isActive?: boolean;
}

const EdgeGlowCanvas: React.FC<EdgeGlowCanvasProps> = ({ 
  audioLevel, 
  status, 
  isActive = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match viewport
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    let time = 0;

    const drawGlow = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check if mobile (disable side glows)
      const isMobile = window.innerWidth < 768;

      // Calculate intensity based on status and audio level
      let baseIntensity = 0.3;
      let pulseSpeed = 0.5;

      if (status === 'listening') {
        baseIntensity = 0.4 + audioLevel * 0.4;
        pulseSpeed = 1.0;
      } else if (status === 'thinking') {
        baseIntensity = 0.5;
        pulseSpeed = 1.5;
      } else if (status === 'speaking') {
        baseIntensity = 0.45 + audioLevel * 0.3;
        pulseSpeed = 1.2;
      }

      // Create gradient colors (M1SSION gradient: magenta → pink → cyan)
      const colors = [
        { r: 242, g: 19, b: 164 },  // Magenta
        { r: 236, g: 72, b: 153 },   // Pink
        { r: 0, g: 229, b: 255 }     // Cyan
      ];

      // Animate time
      time += 0.01 * pulseSpeed;
      const pulse = Math.sin(time) * 0.5 + 0.5;

      // Edge thickness
      const thickness = 40 + pulse * 30;
      const blurAmount = 50 + pulse * 30;

      // Draw top edge
      const topGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      colors.forEach((color, i) => {
        const alpha = (baseIntensity + pulse * 0.3) * 0.6;
        topGradient.addColorStop(i / (colors.length - 1), 
          `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
        );
      });
      ctx.save();
      ctx.filter = `blur(${blurAmount}px)`;
      ctx.fillStyle = topGradient;
      ctx.fillRect(0, 0, canvas.width, thickness);
      ctx.restore();

      // Draw bottom edge
      const bottomGradient = ctx.createLinearGradient(0, canvas.height, canvas.width, canvas.height);
      colors.forEach((color, i) => {
        const alpha = (baseIntensity + pulse * 0.3) * 0.6;
        bottomGradient.addColorStop(i / (colors.length - 1), 
          `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
        );
      });
      ctx.save();
      ctx.filter = `blur(${blurAmount}px)`;
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(0, canvas.height - thickness, canvas.width, thickness);
      ctx.restore();

      // Draw left edge - ONLY ON DESKTOP (>= 768px)
      if (!isMobile) {
        const leftGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        colors.forEach((color, i) => {
          const alpha = (baseIntensity + pulse * 0.3) * 0.6;
          leftGradient.addColorStop(i / (colors.length - 1), 
            `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
          );
        });
        ctx.save();
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.fillStyle = leftGradient;
        ctx.fillRect(0, 0, thickness, canvas.height);
        ctx.restore();
      }

      // Draw right edge - ONLY ON DESKTOP (>= 768px)
      if (!isMobile) {
        const rightGradient = ctx.createLinearGradient(canvas.width, 0, canvas.width, canvas.height);
        colors.forEach((color, i) => {
          const alpha = (baseIntensity + pulse * 0.3) * 0.6;
          rightGradient.addColorStop(i / (colors.length - 1), 
            `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
          );
        });
        ctx.save();
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.fillStyle = rightGradient;
        ctx.fillRect(canvas.width - thickness, 0, thickness, canvas.height);
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(drawGlow);
    };

    drawGlow();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioLevel, status, isActive]);

  if (!isActive) return null;

  return (
    <div className={styles.edgeGlowCanvas}>
      <canvas 
        ref={canvasRef} 
        className={styles.canvas}
        aria-hidden="true"
      />
    </div>
  );
};

export default EdgeGlowCanvas;
