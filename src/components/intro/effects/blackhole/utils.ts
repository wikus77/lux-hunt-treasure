
import { useCallback, useState } from "react";

// Particle types
export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  angle: number;
  distance: number;
}

// Helper function to generate particles for the black hole effect
export const generateParticles = (count: number = 200): Particle[] => {
  return Array.from({ length: count }, (_, i) => {
    const distance = 30 + Math.random() * 20;
    const angle = Math.random() * Math.PI * 2;
    const size = 1 + Math.random() * 2;
    
    // Color of the particles (blue/cyan/white)
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
};

// Custom hook for particle animation based on stage
export const useParticleAnimation = (
  particles: Particle[], 
  stage: number, 
  visible: boolean
) => {
  const [currentParticles, setCurrentParticles] = useState<Particle[]>(particles);
  
  const updateParticles = useCallback(() => {
    setCurrentParticles(prevParticles => 
      prevParticles.map(particle => {
        // Different behaviors based on the animation stage
        if (stage === 2) {
          // Orbit effect
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
          // Implosion effect
          const attractFactor = 0.98;
          return {
            ...particle,
            angle: particle.angle + particle.speed,
            distance: particle.distance * attractFactor,
            x: particle.x * attractFactor,
            y: particle.y * attractFactor
          };
        } else if (stage >= 4) {
          // Explosion effect
          const explodeFactor = 1.015;
          return {
            ...particle,
            angle: particle.angle + particle.speed * 0.3,
            distance: particle.distance * explodeFactor,
            x: particle.x * explodeFactor,
            y: particle.y * explodeFactor
          };
        }
        
        // Standard rotation
        const newAngle = particle.angle + particle.speed * 0.2;
        return {
          ...particle,
          angle: newAngle,
          x: Math.cos(newAngle) * particle.distance,
          y: Math.sin(newAngle) * particle.distance
        };
      })
    );
  }, [stage]);
  
  return { currentParticles, updateParticles };
};
