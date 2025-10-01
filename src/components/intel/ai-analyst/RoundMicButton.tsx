// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Round Button
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
        fixed bottom-24 right-6 z-50
        w-16 h-16 rounded-full
        bg-gradient-to-br from-[#F213A4] via-[#FF4D4D] to-[#0EA5E9]
        shadow-[0_0_30px_rgba(242,19,164,0.6)]
        flex items-center justify-center
        transition-all duration-300
        hover:scale-110 hover:shadow-[0_0_50px_rgba(242,19,164,0.8)]
        ${isActive ? 'scale-110 animate-pulse' : ''}
      `}
      aria-label="Open AI Analyst"
    >
      {isActive ? (
        <Waves className="w-8 h-8 text-white animate-pulse" />
      ) : (
        <Mic className="w-8 h-8 text-white" />
      )}
    </button>
  );
};

export default RoundMicButton;
