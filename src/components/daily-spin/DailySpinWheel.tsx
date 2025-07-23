// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useDailySpin } from '@/hooks/useDailySpin';
import { DailySpinHeader } from './DailySpinHeader';
import { DailySpin3DWheel } from './DailySpin3DWheel';
import { DailySpinButton } from './DailySpinButton';
import { DailySpinResultModal } from './DailySpinResultModal';
import { getCosmeticSegment, SEGMENTS, getMessageFromRotation } from '@/utils/dailySpinUtils';

export const DailySpinWheel: React.FC = () => {
  const [, setLocation] = useLocation();
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [wheelSize, setWheelSize] = useState(400);
  const { spinWheel, isSpinning, error } = useDailySpin();
  const [cosmeticResult, setCosmeticResult] = useState<any>(null);

  const handleSpin = async () => {
    if (isSpinning || isAnimating) return;

    setIsAnimating(true);
    setShowResult(false);
    
    // COSMETIC ONLY: Fixed segment for visual experience
    const cosmeticSegment = getCosmeticSegment();
    const segmentAngle = 360 / 12; // 30 gradi per segmento
    const targetAngle = (cosmeticSegment * segmentAngle) + (segmentAngle / 2);
    
    // Fixed animation for consistent experience (4 complete spins)
    const extraSpins = 4 * 360; // Fixed 4 spins instead of random
    const finalRotation = extraSpins + (360 - targetAngle);
    
    setRotation(prev => prev + finalRotation);
    
    // COSMETIC: Show message without prize award
    const message = getMessageFromRotation(finalRotation);
    
    // Simulate result for visual feedback only - NO PRIZES
    const newCosmeticResult = {
      success: true,
      prize: message,
      rotation_deg: finalRotation,
      message: "Grazie per aver partecipato! Continua la missione per vincere premi reali basati sulla tua abilità.",
      reroute_path: "/home"
    };
    
    // Fine animazione dopo 4 secondi
    setTimeout(() => {
      setIsAnimating(false);
      setShowResult(true);
      // Set cosmetic result directly without server call
      setCosmeticResult(newCosmeticResult);
    }, 4000);
  };

  const handleRedirect = () => {
    setLocation('/home');
  };

  const handleCloseModal = () => {
    setShowResult(false);
    setLocation('/home');
  };

  // Handle responsive wheel size
  useEffect(() => {
    const updateSize = () => {
      setWheelSize(window.innerWidth < 768 ? 350 : 400);
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-close effect for cosmetic wheel
  useEffect(() => {
    if (cosmeticResult && showResult) {
      const timer = setTimeout(() => {
        setLocation('/home');
      }, 3000); // 3 seconds for auto-close
      return () => clearTimeout(timer);
    }
  }, [cosmeticResult, showResult, setLocation]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
      </div>

      {/* Floating Particles - FIXED POSITIONS for compliance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-60 animate-float-particle"
            style={{
              left: `${(i * 15) % 100}%`, // Fixed positions based on index
              top: `${(i * 20) % 100}%`,  // Fixed positions based on index
              animationDelay: `${i * 2}s`,
              animationDuration: `${10 + i * 2}s`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        
        {/* Header */}
        <DailySpinHeader />
        
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-6 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm text-center max-w-md">
            <div className="text-red-400 text-lg font-semibold mb-2">Errore</div>
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        {/* 3D Wheel */}
        <div className="mb-8">
          <DailySpin3DWheel 
            rotation={rotation}
            isAnimating={isAnimating}
            size={wheelSize}
          />
        </div>
        
        {/* Spin Button */}
        <DailySpinButton
          isSpinning={isSpinning}
          isAnimating={isAnimating}
          hasError={!!error}
          onSpin={handleSpin}
        />
        
        {/* Result Modal */}
        {cosmeticResult && (
          <DailySpinResultModal
            isOpen={showResult}
            prize={cosmeticResult.prize}
            message={cosmeticResult.message}
            reroute_path={cosmeticResult.reroute_path}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};