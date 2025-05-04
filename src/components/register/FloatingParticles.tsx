
import React from "react";
import { motion } from "framer-motion";

interface ParticleProps {
  count?: number;
}

const FloatingParticles = ({ count = 15 }: ParticleProps) => {
  // Generate random floating particles
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 15 + 10,
    color: i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#FFC300' : '#FF00FF',
  }));

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
            boxShadow: `0 0 8px ${particle.color}`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            filter: "blur(1.5px)"
          }}
          animate={{
            y: [0, -20, 0, 20, 0],
            x: [0, 10, 20, 10, 0],
            opacity: [0.4, 0.8, 0.6, 0.9, 0.4],
          }}
          transition={{
            duration: particle.duration,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
