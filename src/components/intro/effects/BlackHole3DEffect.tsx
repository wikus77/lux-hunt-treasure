
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface BlackHole3DEffectProps {
  stage: number;
  visible: boolean;
}

const BlackHole3DEffect: React.FC<BlackHole3DEffectProps> = ({ stage, visible }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; color: string; speed: number; angle: number; distance: number }[]>([]);

  // Inizializza le particelle
  useEffect(() => {
    if (!visible) return;
    
    // Crea particelle per simulare un effetto 3D
    const particleCount = 200;
    const newParticles = Array.from({ length: particleCount }, (_, i) => {
      const distance = 30 + Math.random() * 20;
      const angle = Math.random() * Math.PI * 2;
      const size = 1 + Math.random() * 2;
      
      // Colore delle particelle (blu/ciano/bianco)
      const blueValue = Math.floor(128 + Math.random() * 127);
      const greenValue = Math.floor(180 + Math.random() * 75);
      const color = `rgb(${blueValue > 200 ? blueValue : 50}, ${greenValue}, 255)`;
      
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size,
        color,
        speed: 0.02 + Math.random() * 0.03,
        angle,
        distance
      };
    });
    
    setParticles(newParticles);
  }, [visible]);

  // Animazione delle particelle
  useEffect(() => {
    if (!visible || particles.length === 0) return;
    
    let animationFrame: number;
    let rotation = 0;
    
    const animate = () => {
      rotation += 0.001;
      
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Diversi comportamenti in base allo stage dell'animazione
          if (stage === 2) {
            // Effetto orbita
            const newAngle = particle.angle + particle.speed * 0.5;
            const spiralFactor = 0.998;
            return {
              ...particle,
              angle: newAngle,
              distance: particle.distance * spiralFactor,
              x: Math.cos(newAngle) * particle.distance * spiralFactor,
              y: Math.sin(newAngle) * particle.distance * spiralFactor
            };
          } else if (stage === 3) {
            // Effetto implosione
            const attractFactor = 0.98;
            return {
              ...particle,
              angle: particle.angle + particle.speed,
              distance: particle.distance * attractFactor,
              x: particle.x * attractFactor,
              y: particle.y * attractFactor
            };
          } else if (stage >= 4) {
            // Effetto esplosione
            const explodeFactor = 1.015;
            return {
              ...particle,
              angle: particle.angle + particle.speed * 0.3,
              distance: particle.distance * explodeFactor,
              x: particle.x * explodeFactor,
              y: particle.y * explodeFactor
            };
          }
          
          // Rotazione standard
          const newAngle = particle.angle + particle.speed * 0.2;
          return {
            ...particle,
            angle: newAngle,
            x: Math.cos(newAngle) * particle.distance,
            y: Math.sin(newAngle) * particle.distance
          };
        })
      );
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [particles, stage, visible]);

  if (!visible) return null;

  return (
    <div 
      className="black-hole-3d-effect"
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: stage >= 5 ? 0 : 1,
        transition: 'opacity 1.5s ease-out',
        overflow: 'hidden'
      }}
    >
      {/* Sfondo stellato */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.7 + 0.3,
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
          }}
        />
      ))}
      
      {/* Buco nero centrale */}
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
          boxShadow: '0 0 20px 10px rgba(0, 0, 0, 0.9)',
          zIndex: 4
        }}
        animate={{
          width: stage >= 2 ? '40px' : '20px',
          height: stage >= 2 ? '40px' : '20px',
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Disco di accrescimento */}
      <motion.div
        style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 191, 255, 0.7) 0%, rgba(0, 191, 255, 0.3) 40%, rgba(0, 0, 0, 0) 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(5px)',
          boxShadow: '0 0 30px rgba(0, 191, 255, 0.5), 0 0 60px rgba(0, 191, 255, 0.3), 0 0 90px rgba(0, 191, 255, 0.2)',
          zIndex: 3,
          opacity: stage <= 3 ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />
      
      {/* Particelle */}
      <svg
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
        {particles.map(particle => (
          <motion.circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={particle.color}
            style={{
              filter: 'blur(1px)',
              opacity: stage >= 4 ? Math.max(0, 1 - (stage - 4) * 0.3) : 0.8
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default BlackHole3DEffect;
