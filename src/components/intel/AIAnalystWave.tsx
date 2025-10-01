// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Siri-like Wave Effect
import React, { useEffect, useRef } from 'react';

interface AIAnalystWaveProps {
  energy: number; // 0-1 range
  isActive: boolean;
}

const AIAnalystWave: React.FC<AIAnalystWaveProps> = ({ energy, isActive }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Update CSS custom property for energy level
    canvasRef.current.style.setProperty('--voice-energy', String(energy));
  }, [energy]);

  if (!isActive) return null;

  return (
    <div
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{
        background: `
          radial-gradient(
            ellipse at center,
            rgba(242, 19, 164, calc(var(--voice-energy, 0) * 0.15)) 0%,
            rgba(255, 77, 77, calc(var(--voice-energy, 0) * 0.1)) 30%,
            rgba(14, 165, 233, calc(var(--voice-energy, 0) * 0.05)) 60%,
            transparent 100%
          )
        `,
        animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none',
        mixBlendMode: 'screen'
      }}
    />
  );
};

export default AIAnalystWave;
