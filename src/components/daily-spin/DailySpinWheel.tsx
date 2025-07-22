// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useDailySpin } from '@/hooks/useDailySpin';
import { DailySpinHeader } from './DailySpinHeader';
import { DailySpin3DWheel } from './DailySpin3DWheel';
import { DailySpinButton } from './DailySpinButton';
import { DailySpinResultModal } from './DailySpinResultModal';
import { getRandomSegment, SEGMENTS, isWinningPrize } from '@/utils/dailySpinUtils';

export const DailySpinWheel: React.FC = () => {
  const [, setLocation] = useLocation();
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [wheelSize, setWheelSize] = useState(380);
  const { spinWheel, isSpinning, spinResult, error } = useDailySpin();

  const handleSpin = async () => {
    if (isSpinning || isAnimating) return;

    setIsAnimating(true);
    setShowResult(false);
    
    // Calcola il segmento vincente
    const winningSegment = getRandomSegment();
    const segmentAngle = 360 / 12; // 30 gradi per segmento
    const targetAngle = (winningSegment * segmentAngle) + (segmentAngle / 2);
    
    // Aggiunge giri extra per l'animazione (3-5 giri completi)
    const extraSpins = (Math.floor(Math.random() * 3) + 3) * 360;
    const finalRotation = extraSpins + (360 - targetAngle); // Inverso perché la ruota gira al contrario
    
    setRotation(prev => prev + finalRotation);
    
    // Invia il risultato al server
    const prize = SEGMENTS[winningSegment];
    const result = await spinWheel(prize, finalRotation);
    
    // Fine animazione dopo 4 secondi
    setTimeout(() => {
      setIsAnimating(false);
      if (result && result.success) {
        setShowResult(true);
      }
    }, 4000);
  };

  const handleRedirect = () => {
    if (spinResult?.reroute_path) {
      setLocation(spinResult.reroute_path);
    } else {
      setLocation('/home');
    }
  };

  const handleCloseModal = () => {
    setShowResult(false);
    setLocation('/home');
  };

  // Handle responsive wheel size
  useEffect(() => {
    const updateSize = () => {
      setWheelSize(window.innerWidth < 768 ? 320 : 380);
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-close effect for losing prizes
  useEffect(() => {
    if (spinResult && showResult && !isWinningPrize(spinResult.prize)) {
      const timer = setTimeout(() => {
        setLocation('/home');
      }, 4000); // 4 seconds for auto-close
      return () => clearTimeout(timer);
    }
  }, [spinResult, showResult, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
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

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-60 animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
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
            <div className="text-red-400 text-lg font-semibold mb-2">⚠️ Errore</div>
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
        {spinResult && (
          <DailySpinResultModal
            isOpen={showResult}
            prize={spinResult.prize}
            message={spinResult.message}
            reroute_path={spinResult.reroute_path}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};