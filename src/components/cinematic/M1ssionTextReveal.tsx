// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface M1ssionTextRevealProps {
  isVisible: boolean;
  onTextClick: () => void;
}

const M1ssionTextReveal: React.FC<M1ssionTextRevealProps> = ({ isVisible, onTextClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isVisible && containerRef.current) {
      const tl = gsap.timeline();
      
      // Initial state
      gsap.set([titleRef.current, subtitleRef.current], {
        opacity: 0,
        y: 50,
        scale: 0.8
      });
      
      // Animate title
      tl.to(titleRef.current, {
        duration: 1.5,
        opacity: 1,
        y: 0,
        scale: 1,
        ease: "power3.out"
      })
      // Animate subtitle
      .to(subtitleRef.current, {
        duration: 1,
        opacity: 1,
        y: 0,
        scale: 1,
        ease: "power2.out"
      }, "-=0.5");
      
      // Add glow animation for M and 1
      const glowElements = document.querySelectorAll('.glow-text');
      glowElements.forEach((element) => {
        gsap.to(element, {
          duration: 2,
          textShadow: '0 0 20px #00FFFF, 0 0 40px #00FFFF, 0 0 60px #00FFFF',
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut"
        });
      });
    }
  }, [isVisible]);
  
  if (!isVisible) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-30 flex items-center justify-center cursor-pointer"
      onClick={onTextClick}
    >
      <div className="text-center">
        <div 
          ref={titleRef}
          className="text-8xl md:text-9xl font-bold mb-4 tracking-wider"
          style={{ fontFamily: 'monospace' }}
        >
          <span className="glow-text text-cyan-400" style={{ color: '#00FFFF' }}>M</span>
          <span className="glow-text text-cyan-400" style={{ color: '#00FFFF' }}>1</span>
          <span className="text-white">SSION</span>
        </div>
        
        <div 
          ref={subtitleRef}
          className="text-2xl md:text-3xl text-white/80 tracking-widest"
          style={{ fontFamily: 'monospace' }}
        >
          Mission Starts Here
        </div>
      </div>
      
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-900/20 via-transparent to-black/60 pointer-events-none" />
    </div>
  );
};

export default M1ssionTextReveal;