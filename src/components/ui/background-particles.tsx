
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ParticleProps {
  count?: number;
}

const BackgroundParticles = ({ count = 15 }: ParticleProps) => {
  const [particles, setParticles] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate random floating particles
    const generatedParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 15 + 10,
      color: i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#FFC300' : '#FF00FF',
      parallaxSpeed: Math.random() * 0.3 + 0.1,
      blur: Math.random() * 2 + 1,
    }));
    
    setParticles(generatedParticles);
  }, [count]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size + 4}px ${particle.color}`,
            filter: `blur(${particle.blur}px)`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 15, 30, 15, 0],
            opacity: [0.4, 0.8, 0.6, 0.9, 0.4],
          }}
          transition={{
            duration: particle.duration,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            delay: particle.delay,
          }}
          data-parallax="background"
          data-parallax-speed={-particle.parallaxSpeed}
        />
      ))}
    </div>
  );
};

export default BackgroundParticles;
