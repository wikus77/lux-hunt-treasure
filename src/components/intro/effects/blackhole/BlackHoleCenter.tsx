
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface BlackHoleCenterProps {
  stage: number;
}

const BlackHoleCenter: React.FC<BlackHoleCenterProps> = ({ stage }) => {
  const accretionDiskRef = useRef<HTMLDivElement>(null);

  // Effetto per rotazione del disco di accrescimento
  useEffect(() => {
    if (!accretionDiskRef.current || stage < 2) return;
    
    let rotation = 0;
    let animationFrame: number;
    
    const rotateDisk = () => {
      if (accretionDiskRef.current) {
        rotation += 0.2;
        accretionDiskRef.current.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
      }
      animationFrame = requestAnimationFrame(rotateDisk);
    };
    
    animationFrame = requestAnimationFrame(rotateDisk);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [stage, accretionDiskRef]);
  
  return (
    <>
      {/* Central black hole with improved shadow */}
      <motion.div
        style={{
          position: 'absolute',
          width: stage >= 3 ? '40px' : '20px',
          height: stage >= 3 ? '40px' : '20px',
          borderRadius: '50%',
          backgroundColor: '#000',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: stage >= 2 
            ? '0 0 20px 10px rgba(0, 0, 0, 0.95), 0 0 40px 20px rgba(0, 0, 0, 0.8)'
            : '0 0 20px 10px rgba(0, 0, 0, 0.9)',
          zIndex: 4
        }}
        animate={{
          width: stage >= 2 ? '40px' : '20px',
          height: stage >= 2 ? '40px' : '20px',
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Enhanced accretion disk with rotation effect */}
      <motion.div
        ref={accretionDiskRef}
        style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(50, 210, 255, 0.8) 0%, rgba(20, 140, 255, 0.5) 30%, rgba(0, 80, 200, 0.3) 50%, rgba(0, 0, 0, 0) 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(5px)',
          boxShadow: '0 0 30px rgba(0, 191, 255, 0.6), 0 0 60px rgba(0, 191, 255, 0.4), 0 0 90px rgba(0, 191, 255, 0.2)',
          zIndex: 3,
          opacity: stage <= 3 ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />
      
      {/* Nuovi raggi di luce distorta */}
      {stage >= 2 && stage <= 3 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '300px',
            height: '300px',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`light-ray-${i}`}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100%',
                height: '2px',
                background: 'linear-gradient(90deg, rgba(0,160,255,0) 0%, rgba(0,160,255,0.6) 50%, rgba(0,160,255,0) 100%)',
                borderRadius: '50%',
                transformOrigin: 'center',
                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              }}
              animate={{
                scaleX: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
      
      {/* Effetto di distorsione spaziale */}
      {stage >= 2 && stage <= 4 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '200px',
            height: '200px',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="distortionGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.9)" />
                <stop offset="40%" stopColor="rgba(0,0,0,0.5)" />
                <stop offset="70%" stopColor="rgba(0,0,0,0.2)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="url(#distortionGradient)"
              filter="url(#glow)"
            />
          </svg>
        </div>
      )}
    </>
  );
};

export default BlackHoleCenter;
