// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Button
import React from 'react';
import { Bot } from 'lucide-react';

interface AIAnalystButtonProps {
  onClick: () => void;
  isActive: boolean;
}

const AIAnalystButton: React.FC<AIAnalystButtonProps> = ({ onClick, isActive }) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed top-24 right-6 z-50
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
      <Bot className="w-8 h-8 text-white" />
    </button>
  );
};

export default AIAnalystButton;
