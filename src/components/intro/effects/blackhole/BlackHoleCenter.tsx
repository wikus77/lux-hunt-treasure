
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { applyGravitationalLensing } from "./utils";

interface BlackHoleCenterProps {
  stage: number;
}

const BlackHoleCenter: React.FC<BlackHoleCenterProps> = ({ stage }) => {
  const accretionDiskRef = useRef<HTMLDivElement>(null);
  const diskOuterRef = useRef<HTMLDivElement>(null);
  const distortionRef = useRef<HTMLDivElement>(null);
  
  // Effetto per rotazione del disco di accrescimento
  useEffect(() => {
    if (!accretionDiskRef.current || stage < 2) return;
    
    let rotation = 0;
    let animationFrame: number;
    
    const rotateDisk = () => {
      if (accretionDiskRef.current) {
        rotation += 0.2;
        accretionDiskRef.current.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        
        if (diskOuterRef.current) {
          // Rotazione in senso opposto per il disco esterno
          diskOuterRef.current.style.transform = `translate(-50%, -50%) rotate(${-rotation * 0.7}deg)`;
        }
      }
      animationFrame = requestAnimationFrame(rotateDisk);
    };
    
    animationFrame = requestAnimationFrame(rotateDisk);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [stage, accretionDiskRef]);

  // Effetto di distorsione gravitazionale
  useEffect(() => {
    if (!distortionRef.current) return;
    
    let animationFrame: number;
    
    const animateDistortion = () => {
      // Calcola la forza della distorsione in base allo stage
      const distortionStrength = stage >= 3 ? 1.5 : stage >= 2 ? 1.0 : 0.5;
      
      if (distortionRef.current) {
        // Applica effetto gravitazionale
        applyGravitationalLensing(
          distortionRef.current, 
          distortionStrength,
          0.5 + Math.sin(Date.now() * 0.001) * 0.05,
          0.5 + Math.cos(Date.now() * 0.0015) * 0.05
        );
      }
      
      animationFrame = requestAnimationFrame(animateDistortion);
    };
    
    animationFrame = requestAnimationFrame(animateDistortion);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [stage]);
  
  return (
    <>
      {/* Campo di distorsione gravitazionale */}
      <div 
        ref={distortionRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
    
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
          boxShadow: stage >= 5 
            ? '0 0 40px 25px rgba(0, 0, 0, 0.98), 0 0 80px 40px rgba(0, 0, 0, 0.9)'
            : (stage >= 2 
              ? '0 0 20px 10px rgba(0, 0, 0, 0.95), 0 0 40px 20px rgba(0, 0, 0, 0.8)'
              : '0 0 20px 10px rgba(0, 0, 0, 0.9)')
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      
      {/* Disco di accrescimento avanzato con effetto di rotazione */}
      <motion.div
        ref={accretionDiskRef}
        style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(80, 210, 255, 0.8) 0%, rgba(30, 140, 255, 0.6) 30%, rgba(0, 80, 200, 0.4) 50%, rgba(0, 30, 100, 0.2) 70%, rgba(0, 0, 0, 0) 80%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(3px)',
          boxShadow: '0 0 30px rgba(0, 191, 255, 0.6), 0 0 60px rgba(0, 191, 255, 0.4), 0 0 90px rgba(0, 191, 255, 0.2)',
          zIndex: 3,
          opacity: stage <= 3 ? 1 : Math.max(0, 1 - (stage - 3) * 0.4),
          transition: 'opacity 1s ease-in-out'
        }}
        animate={{
          scale: stage >= 5 ? [1, 0.9, 0.8] : [1, 1.05, 1],
          opacity: stage >= 5 ? [1, 0.7, 0] : undefined
        }}
        transition={{
          duration: 2, 
          ease: "easeInOut",
          times: stage >= 5 ? [0, 0.3, 1] : undefined
        }}
      />
      
      {/* Disco di accrescimento esterno (con rotazione opposta) */}
      <motion.div
        ref={diskOuterRef}
        style={{
          position: 'absolute',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 30%, rgba(0, 80, 180, 0.1) 40%, rgba(0, 100, 200, 0.2) 60%, rgba(0, 100, 220, 0.1) 80%, rgba(0, 0, 0, 0) 100%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(5px)',
          zIndex: 2,
          opacity: stage <= 3 ? 1 : Math.max(0, 1 - (stage - 3) * 0.5)
        }}
        animate={{
          scale: stage >= 5 ? [1, 1.1, 1.3] : [1, 1.03, 1],
          opacity: stage >= 5 ? [1, 0.5, 0] : undefined
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: stage >= 5 ? [0, 0.3, 1] : undefined
        }}
      />
      
      {/* Raggi di luce distorta migliorati */}
      {stage >= 2 && stage <= 4 && (
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
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={`light-ray-${i}`}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100%',
                height: '2px',
                background: `linear-gradient(90deg, rgba(0,160,255,0) 0%, rgba(${i % 2 === 0 ? '0,160,255' : '70,130,240'},${0.5 + i % 3 * 0.1}) 50%, rgba(0,160,255,0) 100%)`,
                transformOrigin: 'center',
                transform: `translate(-50%, -50%) rotate(${i * 15}deg)`,
              }}
              animate={{
                scaleX: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: [`${i * 15}deg`, `${i * 15 + 2}deg`, `${i * 15}deg`]
              }}
              transition={{
                duration: 3 + i % 5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
      
      {/* Effetto di distorsione spazio-temporale avanzato */}
      {stage >= 2 && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '220px',
            height: '220px',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            pointerEvents: 'none',
            opacity: stage >= 5 ? Math.max(0, 1 - (stage - 5) * 0.8) : 1
          }}
          animate={{
            scale: stage >= 5 ? [1, 1.2, 1.5] : [1, 1.05, 1],
            opacity: stage >= 5 ? [1, 0.5, 0] : [0.8, 1, 0.8]
          }}
          transition={{
            duration: stage >= 5 ? 2 : 4,
            repeat: stage >= 5 ? 0 : Infinity,
            ease: "easeInOut"
          }}
        >
          <svg width="220" height="220" viewBox="0 0 220 220">
            <defs>
              <radialGradient id="distortionGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.9)" />
                <stop offset="40%" stopColor="rgba(0,0,0,0.6)" />
                <stop offset="70%" stopColor="rgba(0,0,0,0.3)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              
              {/* Nuovi filtri per distorsione avanzata */}
              <filter id="distortion">
                <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" seed="1" />
                <feDisplacementMap in="SourceGraphic" scale="8" />
              </filter>
            </defs>
            <g filter="url(#glow)">
              <circle
                cx="110"
                cy="110"
                r="70"
                fill="url(#distortionGradient)"
              />
              
              {/* Linee di distorsione dello spazio-tempo */}
              {stage >= 3 && Array.from({ length: 8 }).map((_, i) => (
                <motion.circle
                  key={`distortion-circle-${i}`}
                  cx="110"
                  cy="110"
                  r={40 + i * 15}
                  fill="none"
                  stroke={`rgba(0, ${70 + i * 20}, ${150 + i * 10}, ${0.1 - i * 0.01})`}
                  strokeWidth="0.5"
                  strokeDasharray="3,5"
                  animate={{
                    r: [40 + i * 15, 45 + i * 15, 40 + i * 15],
                    opacity: [0.6, 0.8, 0.6]
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </g>
          </svg>
        </motion.div>
      )}
      
      {/* Effetto tunnel gravitazionale (compare solo negli ultimi stadi) */}
      {stage >= 4 && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(10,20,40,0.8) 20%, rgba(20,30,60,0.6) 40%, rgba(20,40,80,0.4) 60%, rgba(0,0,0,0) 80%)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            perspective: '1000px',
            opacity: 0
          }}
          animate={{
            opacity: stage >= 5 ? [0, 0.6, 0.4] : [0, 0.3, 0],
            scale: stage >= 5 ? [0.2, 1, 1.5] : [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 3,
            times: stage >= 5 ? [0, 0.6, 1] : [0, 0.5, 1],
            ease: "easeInOut",
            repeat: stage >= 5 ? 0 : Infinity
          }}
        />
      )}
    </>
  );
};

export default BlackHoleCenter;
