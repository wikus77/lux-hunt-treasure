
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './laser-reveal-styles.css';

interface LaserRevealIntroProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const LaserRevealIntro: React.FC<LaserRevealIntroProps> = ({ onComplete, onSkip }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("LaserReveal intro mounted");
    
    const timer = setTimeout(() => {
      console.log("LaserReveal intro timeout - completing");
      onComplete();
    }, 4000); // Total duration 4s (reduced from original)
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="laser-reveal-container" ref={containerRef}>
      {/* Background */}
      <div className="laser-reveal-bg"></div>
      
      {/* Grid lines */}
      <div className="laser-grid-lines"></div>
      
      {/* Horizontal laser beam */}
      <motion.div 
        className="laser-beam horizontal"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
      
      {/* Vertical laser beam */}
      <motion.div 
        className="laser-beam vertical"
        initial={{ height: 0 }}
        animate={{ height: '100%' }}
        transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
      />
      
      {/* Revealed text */}
      <motion.div 
        className="revealed-text"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 2, ease: 'easeOut' }}
      >
        <span className="m1">M1</span>
        <span className="ssion">SSION</span>
      </motion.div>
      
      {/* Skip button */}
      {onSkip && (
        <button 
          onClick={onSkip} 
          className="absolute bottom-8 right-8 px-4 py-2 text-sm text-white/70 border border-white/30 
                    rounded-md hover:bg-white/10 transition-colors"
        >
          Salta intro
        </button>
      )}
    </div>
  );
};

export default LaserRevealIntro;
