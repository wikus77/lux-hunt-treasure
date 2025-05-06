
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface ParticleProps {
  count?: number;
}

const BackgroundParticles = ({ count = 15 }: ParticleProps) => {
  const [particles, setParticles] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
      parallaxSpeed: Math.random() * 0.4 + 0.1,
      blur: Math.random() * 5 + 5,
    }));
    
    setParticles(generatedParticles);
  }, [count]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const particleElements = container.querySelectorAll('[data-parallax]');
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      particleElements.forEach((element) => {
        const parallaxElement = element as HTMLElement;
        const speed = parseFloat(parallaxElement.getAttribute('data-parallax-speed') || '-0.2');
        const offset = scrollY * speed;
        
        parallaxElement.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial position
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [particles]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full will-change-transform"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.blur}px ${particle.color}`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            willChange: 'transform, opacity',
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
          data-parallax="background"
          data-parallax-speed={-particle.parallaxSpeed}
        />
      ))}
    </div>
  );
};

export default BackgroundParticles;
