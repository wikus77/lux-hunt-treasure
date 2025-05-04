
import React, { useEffect, useRef } from "react";
import { useParticleAnimation, generateParticles, Particle } from "./utils";

interface ParticleSystemProps {
  stage: number;
  visible: boolean;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ stage, visible }) => {
  const [particles, setParticles] = React.useState<Particle[]>([]);
  const { currentParticles, updateParticles } = useParticleAnimation(particles, stage, visible);
  const animationRef = useRef<number>();

  // Initialize particles
  useEffect(() => {
    if (!visible) return;
    setParticles(generateParticles(200));
  }, [visible]);

  // Animation loop
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

  return (
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
      {currentParticles.map(particle => (
        <circle
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
  );
};

export default ParticleSystem;
