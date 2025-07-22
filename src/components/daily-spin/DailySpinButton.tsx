// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import { Button } from '@/components/ui/button';

interface DailySpinButtonProps {
  isSpinning: boolean;
  isAnimating: boolean;
  hasError: boolean;
  onSpin: () => void;
}

export const DailySpinButton: React.FC<DailySpinButtonProps> = ({
  isSpinning,
  isAnimating,
  hasError,
  onSpin
}) => {
  const isDisabled = isSpinning || isAnimating || hasError;

  return (
    <div className="relative flex justify-center mt-12">
      {/* Glow Effect Ring */}
      {!isDisabled && (
        <div 
          className="absolute inset-0 rounded-full opacity-60 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%)',
            filter: 'blur(20px)',
            transform: 'scale(1.5)',
          }}
        />
      )}
      
      {/* Main Button */}
      <Button
        onClick={onSpin}
        disabled={isDisabled}
        size="lg"
        className={`
          relative z-10 px-12 py-6 text-2xl font-bold font-mission tracking-wider
          rounded-full border-2 transition-all duration-300 transform
          ${!isDisabled 
            ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 border-cyan-400 text-white shadow-2xl hover:scale-105 hover:shadow-cyan-400/50' 
            : 'bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed'
          }
        `}
        style={{
          filter: !isDisabled 
            ? 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.4)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))'
            : 'none',
          textShadow: !isDisabled 
            ? '0 0 10px rgba(255, 255, 255, 0.8)'
            : 'none'
        }}
      >
        {/* Button Content */}
        <div className="flex items-center gap-3">
          {isSpinning || isAnimating ? (
            <>
              {/* Spinning Animation */}
              <div 
                className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))'
                }}
              />
              <span className="animate-pulse">GIRANDO...</span>
            </>
          ) : hasError ? (
            <>
              <span className="text-red-300">⚠️</span>
              <span>ERRORE - RIPROVA</span>
            </>
          ) : (
            <>
              <span className="text-2xl">🎯</span>
              <span>GIRA ORA</span>
            </>
          )}
        </div>
        
        {/* Inner Glow */}
        {!isDisabled && (
          <div 
            className="absolute inset-0 rounded-full opacity-30"
            style={{
              background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%)',
            }}
          />
        )}
      </Button>
      
      {/* Sound Indicator (for future use) */}
      {!isDisabled && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="text-xs text-white/50 flex items-center gap-1">
            <span>🔇</span>
            <span>Suono: OFF</span>
          </div>
        </div>
      )}
    </div>
  );
};