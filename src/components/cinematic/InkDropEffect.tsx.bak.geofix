// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface InkDropEffectProps {
  onComplete: () => void;
}

const InkDropEffect: React.FC<InkDropEffectProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Ink drop animation with Canvas 2D
    let progress = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create ink drop effect
      const maxRadius = Math.max(canvas.width, canvas.height) * 0.8;
      const currentRadius = progress * maxRadius;
      
      // Multiple ripples for organic effect
      for (let i = 0; i < 3; i++) {
        const rippleRadius = currentRadius - (i * 50);
        if (rippleRadius > 0) {
          const alpha = (1 - progress) * (1 - i * 0.3);
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
          ctx.fill();
        }
      }
      
      // Main ink blob
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${0.9})`;
      ctx.fill();
    };
    
    // GSAP animation
    gsap.to({ progress: 0 }, {
      duration: 1.5,
      progress: 1,
      ease: "power2.out",
      onUpdate: function() {
        progress = this.targets()[0].progress;
        animate();
      },
      onComplete: () => {
        setTimeout(onComplete, 200);
      }
    });
    
    // Initial render
    animate();
    
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 pointer-events-none"
    >
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default InkDropEffect;