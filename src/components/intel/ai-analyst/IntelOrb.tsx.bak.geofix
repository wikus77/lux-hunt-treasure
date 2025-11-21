// © 2025 Joseph MULÉ – M1SSION™ - Giant Orb (Siri-style)
import React from 'react';
import { AnalystStatus } from '@/hooks/useIntelAnalyst';

interface IntelOrbProps {
  status: AnalystStatus;
  audioLevel: number;
  onClick: () => void;
}

const IntelOrb: React.FC<IntelOrbProps> = ({ status, audioLevel, onClick }) => {
  // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
  const getAnimation = () => {
    switch (status) {
      case 'thinking':
        return 'animate-pulse';
      case 'speaking':
        return '';
      default:
        return '';
    }
  };

  // Icon removed for clean orb look

  const orbScale = status === 'speaking' && audioLevel > 0 
    ? 1 + (audioLevel * 0.15) 
    : 1;

  const glowIntensity = status === 'speaking' && audioLevel > 0
    ? 0.5 + (audioLevel * 0.5)
    : status === 'thinking' ? 0.6 : 0.4;

  return (
    <button
      onClick={onClick}
      className={`relative group cursor-pointer ${getAnimation()}`}
      style={{
        width: 'min(320px, 56vw)',
        height: 'min(320px, 56vw)',
        transform: `scale(${orbScale})`,
        transition: 'transform 0.15s ease-out'
      }}
      aria-label="Open AI Analyst"
      aria-pressed={status !== 'idle'}
    >
      {/* Outer glow ring */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, rgba(242, 19, 164, 0.4), rgba(0, 229, 255, 0.4), rgba(242, 19, 164, 0.4))',
          filter: `blur(40px)`,
          opacity: glowIntensity,
          animation: status === 'speaking' ? 'spin 8s linear infinite' : 'spin 20s linear infinite'
        }}
      />

      {/* Middle blur layer */}
      <div 
        className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-500/30 to-pink-500/30 backdrop-blur-xl"
        style={{
          filter: 'blur(20px)',
          opacity: 0.7
        }}
      />

      {/* Inner core */}
      {/* © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ */}
      <div 
        className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-400/40 to-pink-400/40 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/90 transition-transform group-hover:scale-105 group-active:scale-95"
        style={{
          boxShadow: `
            inset 0 0 60px rgba(0, 229, 255, 0.2),
            inset 0 0 30px rgba(242, 19, 164, 0.2),
            0 0 80px rgba(0, 229, 255, ${glowIntensity * 0.4}),
            0 0 40px rgba(242, 19, 164, ${glowIntensity * 0.3})
          `
        }}
      >
        {/* Icon removed - clean orb look */}
      </div>

      {/* Pulsating ring animation for idle */}
      {status === 'idle' && (
        <div 
          className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping"
          style={{ animationDuration: '3s' }}
        />
      )}
    </button>
  );
};

export default IntelOrb;
