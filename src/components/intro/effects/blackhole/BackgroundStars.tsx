
import React from "react";
import { motion } from "framer-motion";

const BackgroundStars: React.FC = () => {
  // Creiamo stelle di varie dimensioni e luminosità
  const smallStars = Array.from({ length: 80 }).map((_, i) => ({
    id: `small-star-${i}`,
    size: Math.random() * 1.5 + 0.5,
    posX: Math.random() * 100,
    posY: Math.random() * 100,
    opacity: Math.random() * 0.5 + 0.3,
    delay: Math.random() * 5
  }));
  
  const mediumStars = Array.from({ length: 30 }).map((_, i) => ({
    id: `medium-star-${i}`,
    size: Math.random() * 1 + 1.5,
    posX: Math.random() * 100,
    posY: Math.random() * 100,
    opacity: Math.random() * 0.4 + 0.5,
    delay: Math.random() * 5
  }));
  
  const brightStars = Array.from({ length: 10 }).map((_, i) => ({
    id: `bright-star-${i}`,
    size: Math.random() * 1 + 2,
    posX: Math.random() * 100,
    posY: Math.random() * 100,
    opacity: Math.random() * 0.2 + 0.7,
    delay: Math.random() * 5
  }));
  
  const allStars = [...smallStars, ...mediumStars, ...brightStars];

  return (
    <>
      {/* Nebulosa di sfondo */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(5, 15, 45, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
          zIndex: 0
        }}
      />
      
      {/* Stelle con effetto twinkle */}
      {allStars.map(star => (
        <motion.div
          key={star.id}
          animate={{
            opacity: [star.opacity, star.opacity + 0.2, star.opacity],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            top: `${star.posY}%`,
            left: `${star.posX}%`,
            boxShadow: `0 0 ${star.size + 2}px rgba(255, 255, 255, ${star.opacity + 0.1})`
          }}
        />
      ))}
      
      {/* Stelle cadenti occasionali */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`shooting-star-${i}`}
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            backgroundColor: 'white',
            borderRadius: '50%',
            zIndex: 1,
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(255, 255, 255, 0.5)',
          }}
          initial={{
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 30}%`,
            opacity: 0,
          }}
          animate={{
            top: [`${Math.random() * 50}%`, `${50 + Math.random() * 50}%`],
            left: [`${Math.random() * 30}%`, `${30 + Math.random() * 70}%`],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1.5,
            delay: 2 + i * 3 + Math.random() * 5,
            ease: "easeOut",
            times: [0, 0.1, 1],
            repeat: Infinity,
            repeatDelay: 10 + Math.random() * 15
          }}
        />
      ))}
    </>
  );
};

export default BackgroundStars;
