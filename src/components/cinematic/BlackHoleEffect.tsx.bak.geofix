// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface BlackHoleEffectProps {
  isVisible: boolean;
  onComplete: () => void;
}

const BlackHoleEffect: React.FC<BlackHoleEffectProps> = ({ isVisible, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const holeRef = useRef<HTMLDivElement>(null);
  const accretionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isVisible && containerRef.current) {
      console.log('🕳️ BLACK HOLE: Starting animation');
      
      // Set initial state
      gsap.set([holeRef.current, accretionRef.current], {
        scale: 0,
        opacity: 0
      });
      
      // Animate black hole appearance
      const tl = gsap.timeline();
      
      tl.to(holeRef.current, {
        duration: 1.5,
        scale: 1,
        opacity: 1,
        ease: "power2.out"
      })
      .to(accretionRef.current, {
        duration: 1,
        scale: 1,
        opacity: 0.8,
        ease: "power2.out"
      }, "-=1")
      .to([holeRef.current, accretionRef.current], {
        duration: 1,
        scale: 0.3,
        opacity: 0.3,
        ease: "power2.out",
        onComplete: () => {
          console.log('🕳️ BLACK HOLE: Animation complete');
          onComplete();
        }
      }, "+=0.5");
    }
  }, [isVisible, onComplete]);
  
  if (!isVisible) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
    >
      {/* Accretion Disk */}
      <div 
        ref={accretionRef}
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: `
            radial-gradient(
              circle at center,
              transparent 30%,
              rgba(0, 255, 255, 0.3) 40%,
              rgba(255, 100, 0, 0.4) 60%,
              rgba(0, 255, 255, 0.2) 80%,
              transparent 100%
            )
          `,
          animation: 'rotate-slow 8s linear infinite'
        }}
      />
      
      {/* Black Hole Center */}
      <div 
        ref={holeRef}
        className="absolute w-32 h-32 rounded-full"
        style={{
          background: `
            radial-gradient(
              circle at center,
              rgba(0, 0, 0, 1) 0%,
              rgba(0, 0, 0, 0.9) 70%,
              rgba(0, 255, 255, 0.1) 100%
            )
          `,
          boxShadow: `
            inset 0 0 50px rgba(0, 255, 255, 0.3),
            0 0 100px rgba(0, 0, 0, 0.8)
          `
        }}
      />
      
      {/* Event Horizon Glow */}
      <div 
        className="absolute w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 60%, rgba(0, 255, 255, 0.1) 100%)',
          animation: 'pulse-glow 3s ease-in-out infinite alternate'
        }}
      />
    </div>
  );
};

export default BlackHoleEffect;