
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useParticleAnimation, generateParticles, Particle } from "./utils";

interface ParticleSystemProps {
  stage: number;
  visible: boolean;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ stage, visible }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const { currentParticles, updateParticles } = useParticleAnimation(particles, stage, visible);
  const animationRef = useRef<number>();
  const svgRef = useRef<SVGSVGElement>(null);
  const particleGroupRef = useRef<SVGGElement>(null);

  // Inizializza le particelle
  useEffect(() => {
    if (!visible) return;
    // Aumentiamo il numero di particelle per un effetto più ricco
    setParticles(generateParticles(400));
  }, [visible]);

  // Ciclo di animazione
  useEffect(() => {
    if (!visible || currentParticles.length === 0) return;
    
    const animate = () => {
      updateParticles();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visible, currentParticles.length, updateParticles]);

  // Aggiungiamo un effetto per gestire l'interattività quando il mouse si muove
  useEffect(() => {
    if (!svgRef.current || stage >= 4) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 200 - 100;
      const y = ((e.clientY - rect.top) / rect.height) * 200 - 100;
      
      // Forza di attrazione verso il mouse basata sullo stage
      const attractionStrength = stage <= 1 ? 0.08 : stage <= 2 ? 0.05 : 0.02;
      
      // Aggiorniamo la posizione delle particelle in base al movimento del mouse
      updateParticles((prevParticles) => 
        prevParticles.map(particle => {
          // Calcola la distanza dal mouse
          const dx = particle.x - x;
          const dy = particle.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Applica una leggera attrazione verso il mouse
          if (distance < 40) {
            const angle = Math.atan2(dy, dx);
            return {
              ...particle,
              x: particle.x - Math.cos(angle) * (40 - distance) * attractionStrength,
              y: particle.y - Math.sin(angle) * (40 - distance) * attractionStrength,
              opacity: Math.min(1, particle.opacity * 1.05)
            };
          }
          return particle;
        })
      );
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [stage, updateParticles]);

  // Effetto di transizione finale verso la landing page
  useEffect(() => {
    if (stage >= 5 && particleGroupRef.current) {
      // Effetto di dissoluzione
      const transitionTime = 2000;
      const startTime = Date.now();
      
      const animateTransition = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / transitionTime);
        
        if (particleGroupRef.current) {
          // Scale e dissolvenza
          particleGroupRef.current.style.transform = `scale(${1 + progress * 0.5})`;
          particleGroupRef.current.style.opacity = `${1 - progress * 0.8}`;
        }
        
        if (progress < 1) {
          requestAnimationFrame(animateTransition);
        }
      };
      
      requestAnimationFrame(animateTransition);
    }
  }, [stage]);

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 1,
        opacity: stage >= 6 ? 0 : 1,
        transition: 'opacity 1s ease-out'
      }}
      viewBox="-100 -100 200 200"
    >
      {/* Filtri per effetti di bagliore */}
      <defs>
        <filter id="particle-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Trail effect filter */}
        <filter id="trail-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feColorMatrix 
            in="blur" 
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 18 -7"
            result="glow" 
          />
          <feBlend in="SourceGraphic" in2="glow" mode="screen" />
        </filter>
        
        {/* Filtro per effetto lensing gravitazionale */}
        <filter id="gravitational-lens">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="1" seed="5" />
          <feDisplacementMap in="SourceGraphic" scale="5" />
        </filter>
      </defs>
      
      <g ref={particleGroupRef}>
        {/* Gruppo particelle con effetto di transizione globale */}
        {currentParticles.map(particle => (
          <g key={particle.id}>
            {/* Ombra/Bagliore */}
            <circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size * 1.8}
              fill={particle.color.replace('rgb', 'rgba').replace(')', ', 0.3)')}
              opacity={Math.max(0, (stage >= 5 ? particle.opacity * 0.6 : particle.opacity * 0.4))}
              filter="url(#particle-glow)"
            />
            
            {/* Particella principale */}
            <circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill={particle.color}
              style={{
                opacity: particle.opacity,
                transition: stage >= 5 ? 'all 0.3s ease-out' : 'none'
              }}
            />
            
            {/* Traccia di coda per particelle con effetti avanzati */}
            {(stage === 3 || (stage >= 4 && particle.trailLength > 1)) && (
              <motion.path
                d={`M${particle.x} ${particle.y} L${particle.x - Math.cos(particle.angle) * (particle.distance * 0.05 * particle.trailLength)} ${particle.y - Math.sin(particle.angle) * (particle.distance * 0.05 * particle.trailLength)}`}
                stroke={particle.color}
                strokeWidth={particle.size / (stage >= 5 ? 3 : 2)}
                strokeLinecap="round"
                opacity={particle.opacity * 0.6}
                filter={stage >= 4 ? "url(#trail-blur)" : undefined}
              />
            )}
            
            {/* Effetto speciale per particelle più grandi negli stadi avanzati */}
            {stage >= 4 && particle.size > 1.8 && (
              <motion.circle
                cx={particle.x}
                cy={particle.y}
                r={particle.size * 2.5}
                fill="transparent"
                stroke={particle.color}
                strokeWidth="0.5"
                strokeDasharray="1,2"
                opacity={particle.opacity * 0.3}
                animate={{
                  r: [particle.size * 2.5, particle.size * 3, particle.size * 2.5],
                  opacity: [particle.opacity * 0.3, particle.opacity * 0.5, particle.opacity * 0.3]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </g>
        ))}
        
        {/* Effetto di distorsione gravitazionale sulle particelle vicine al centro */}
        {stage >= 2 && (
          <motion.circle
            cx={0}
            cy={0}
            r={20}
            fill="transparent"
            filter="url(#gravitational-lens)"
            opacity={0.6}
            animate={{
              r: stage >= 5 ? [20, 50, 100] : [20, 25, 20],
              opacity: stage >= 5 ? [0.6, 0.3, 0] : [0.6, 0.7, 0.6]
            }}
            transition={{
              duration: stage >= 5 ? 2 : 4,
              repeat: stage >= 5 ? 0 : Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </g>
    </svg>
  );
};

export default ParticleSystem;
