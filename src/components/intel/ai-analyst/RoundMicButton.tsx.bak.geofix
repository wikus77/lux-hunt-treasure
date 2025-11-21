// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Orb Button
import React from 'react';
import { Mic, Waves } from 'lucide-react';

interface RoundMicButtonProps {
  onClick: () => void;
  isActive: boolean;
}

const RoundMicButton: React.FC<RoundMicButtonProps> = ({ onClick, isActive }) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-8 left-1/2 -translate-x-1/2 z-50
        w-24 h-24 rounded-full
        backdrop-blur-xl
        transition-all duration-300 ease-out
        hover:scale-105 active:scale-98
        ${isActive ? 'scale-105' : ''}
      `}
      style={{
        background: isActive 
          ? 'radial-gradient(circle at 30% 30%, rgba(242, 19, 164, 0.4), rgba(0, 229, 255, 0.3))'
          : 'radial-gradient(circle at 30% 30%, rgba(242, 19, 164, 0.2), rgba(0, 229, 255, 0.15))',
        boxShadow: isActive
          ? '0 0 40px rgba(242, 19, 164, 0.6), 0 0 80px rgba(0, 229, 255, 0.4), inset 0 2px 12px rgba(255, 255, 255, 0.2)'
          : '0 0 28px rgba(242, 19, 164, 0.36), 0 0 52px rgba(0, 229, 255, 0.28), inset 0 2px 8px rgba(255, 255, 255, 0.15)',
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
        borderImage: 'linear-gradient(135deg, #00E5FF, #F213A4) 1',
        willChange: 'transform, opacity'
      }}
      aria-label="Open AI Analyst (Shortcut: A)"
      title="Press A to open/close"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Inner ring */}
        <div 
          className={`absolute inset-1 rounded-full transition-opacity duration-300 ${isActive ? 'opacity-70' : 'opacity-40'}`}
          style={{
            background: 'conic-gradient(from 0deg, #00E5FF, #F213A4, #00E5FF)',
            filter: 'blur(8px)',
            animation: isActive ? 'spin 3s linear infinite' : 'none'
          }}
        />
        
        {/* Icon */}
        <div className="relative z-10">
          {isActive ? (
            <Waves className="w-10 h-10 text-white drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
          ) : (
            <Mic className="w-10 h-10 text-white drop-shadow-[0_0_6px_rgba(242,19,164,0.6)]" />
          )}
        </div>
      </div>
    </button>
  );
};

export default RoundMicButton;
