
import React, { useEffect, useRef, useState } from "react";
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

  // Inizializza le particelle
  useEffect(() => {
    if (!visible) return;
    // Aumentiamo il numero di particelle per un effetto più ricco
    setParticles(generateParticles(300));
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
    if (!svgRef.current || stage < 2) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (stage >= 4) return; // Disattiva l'interattività nelle fasi avanzate
      
      const svg = svgRef.current;
      if (!svg) return;
      
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 200 - 100;
      const y = ((e.clientY - rect.top) / rect.height) * 200 - 100;
      
      // Aggiorniamo la posizione delle particelle in base al movimento del mouse
      updateParticles((prevParticles) => 
        prevParticles.map(particle => {
          // Calcola la distanza dal mouse
          const dx = particle.x - x;
          const dy = particle.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Applica una leggera attrazione verso il mouse
          if (distance < 30) {
            const angle = Math.atan2(dy, dx);
            return {
              ...particle,
              x: particle.x - Math.cos(angle) * (30 - distance) * 0.05,
              y: particle.y - Math.sin(angle) * (30 - distance) * 0.05
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

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 1
      }}
      viewBox="-100 -100 200 200"
    >
      {/* Filtri per effetti di bagliore */}
      <defs>
        <filter id="particle-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {currentParticles.map(particle => (
        <g key={particle.id}>
          {/* Ombra/Bagliore */}
          <circle
            cx={particle.x}
            cy={particle.y}
            r={particle.size * 1.5}
            fill={particle.color.replace('rgb', 'rgba').replace(')', ', 0.3)')}
            opacity={Math.max(0, (stage >= 4 ? 1 - (stage - 4) * 0.3 : 0.8) * 0.3)}
            filter="url(#particle-glow)"
          />
          
          {/* Particella principale */}
          <circle
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={particle.color}
            style={{
              opacity: stage >= 4 ? Math.max(0, 1 - (stage - 4) * 0.3) : 0.8
            }}
          />
          
          {/* Traccia di coda per particelle più grandi */}
          {particle.size > 1.5 && stage === 3 && (
            <line
              x1={particle.x}
              y1={particle.y}
              x2={particle.x - Math.cos(particle.angle) * particle.distance * 0.1}
              y2={particle.y - Math.sin(particle.angle) * particle.distance * 0.1}
              stroke={particle.color}
              strokeWidth={particle.size / 2}
              opacity={0.4}
            />
          )}
        </g>
      ))}
    </svg>
  );
};

export default ParticleSystem;
