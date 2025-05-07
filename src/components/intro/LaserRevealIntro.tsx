
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './laser-reveal-styles.css';

interface LaserRevealIntroProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const LaserRevealIntro: React.FC<LaserRevealIntroProps> = ({ onComplete, onSkip }) => {
  const [showLogo, setShowLogo] = useState(false);
  const [showDate, setShowDate] = useState(false);

  useEffect(() => {
    // Timeline of animations
    const laserTimeout = setTimeout(() => setShowLogo(true), 1000); // Show logo after laser scan
    const dateTimeout = setTimeout(() => setShowDate(true), 1500); // Show date text 0.5s after logo
    const completeTimeout = setTimeout(() => {
      // Complete the intro after 3 seconds total
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(laserTimeout);
      clearTimeout(dateTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="laser-reveal-container">
      {/* Laser line animation */}
      <motion.div 
        className="laser-line"
        initial={{ left: "-100%", opacity: 1 }}
        animate={{ left: "100%", opacity: [1, 0.8, 1, 0.9, 1] }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      
      {/* M1SSION Logo with glitch effect */}
      {showLogo && (
        <div className="intro-logo-container">
          <h1 className="intro-logo glitch-text" data-text="M1SSION">
            <span className="cyan-text">M1</span>SSION
          </h1>
          
          {/* Date text with fade-in */}
          {showDate && (
            <motion.p 
              className="intro-date"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              STARTS ON JUNE 19
            </motion.p>
          )}
        </div>
      )}
      
      {/* Skip button */}
      {onSkip && (
        <button 
          onClick={onSkip} 
          className="skip-button"
        >
          Skip intro
        </button>
      )}
    </div>
  );
};

export default LaserRevealIntro;
