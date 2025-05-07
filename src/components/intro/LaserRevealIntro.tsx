
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
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Timeline of animations
    const laserTimeout = setTimeout(() => setShowLogo(true), 1500); // Show logo after laser scan (1.5s)
    const dateTimeout = setTimeout(() => setShowDate(true), 3500); // Show date text 2s after logo
    const fadeOutTimeout = setTimeout(() => setFadeOut(true), 6500); // Begin fade out after 6.5s
    const completeTimeout = setTimeout(() => {
      // Complete the intro after 7 seconds total
      onComplete();
    }, 7000);

    return () => {
      clearTimeout(laserTimeout);
      clearTimeout(dateTimeout);
      clearTimeout(fadeOutTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="laser-reveal-container"
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Laser line animation */}
      <motion.div 
        className="laser-line"
        initial={{ left: "-5%", opacity: 0 }}
        animate={{ 
          left: "105%", 
          opacity: [0, 1, 1, 0.8, 1, 0.9, 1],
          boxShadow: [
            "0 0 10px 2px rgba(0,229,255,0.7), 0 0 20px 5px rgba(0,229,255,0.5)", 
            "0 0 15px 3px rgba(0,229,255,0.9), 0 0 30px 8px rgba(0,229,255,0.7)",
            "0 0 10px 2px rgba(0,229,255,0.7), 0 0 20px 5px rgba(0,229,255,0.5)"
          ]
        }}
        transition={{ 
          duration: 3, 
          ease: "easeInOut",
          times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1],
        }}
      />
      
      {/* M1SSION Logo with glitch effect */}
      {showLogo && (
        <motion.div 
          className="intro-logo-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="intro-logo glitch-text" data-text="M1SSION">
            <span className="cyan-text">M1</span>SSION
          </h1>
          
          {/* Date text with fade-in */}
          {showDate && (
            <motion.p 
              className="intro-date"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              STARTS ON JULY 19
            </motion.p>
          )}
        </motion.div>
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
    </motion.div>
  );
};

export default LaserRevealIntro;
