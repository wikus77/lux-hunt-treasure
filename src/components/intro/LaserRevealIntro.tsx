
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './laser-reveal-styles.css';

interface LaserRevealIntroProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const LaserRevealIntro: React.FC<LaserRevealIntroProps> = ({ onComplete, onSkip }) => {
  const [laserPhase, setLaserPhase] = useState(1); // 1: left to right, 2: right to left, 3: left to right again
  const [showLogo, setShowLogo] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Timeline of animations - enhanced with multiple laser passes
    const firstLaserPassTimeout = setTimeout(() => setLaserPhase(2), 1000); // First pass completes
    const secondLaserPassTimeout = setTimeout(() => setLaserPhase(3), 2000); // Second pass completes
    
    // Start showing logo during third pass
    const logoTimeout = setTimeout(() => setShowLogo(true), 2400);
    
    // Show date text after logo
    const dateTimeout = setTimeout(() => setShowDate(true), 4000);
    
    // Begin fade out of the entire intro
    const fadeOutTimeout = setTimeout(() => setFadeOut(true), 7000);
    
    // Complete the intro after fade out
    const completeTimeout = setTimeout(() => onComplete(), 7800);

    return () => {
      clearTimeout(firstLaserPassTimeout);
      clearTimeout(secondLaserPassTimeout);
      clearTimeout(logoTimeout);
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
      {/* First laser pass (left to right) - with star point and cyan to magenta color transition */}
      {laserPhase === 1 && (
        <>
          <motion.div 
            className="laser-star"
            initial={{ left: "-10%", top: "50%", transform: "translate(0, -50%)" }}
            animate={{ left: "105%", top: "50%", transform: "translate(0, -50%)" }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          <motion.div 
            className="laser-line thin-laser"
            initial={{ 
              left: "-10%", 
              width: "5%", 
              opacity: 0,
              background: "linear-gradient(to right, rgba(0, 229, 255, 0) 0%, rgba(0, 229, 255, 1) 50%, rgba(0, 229, 255, 0) 100%)"
            }}
            animate={{ 
              left: "105%", 
              width: "100%", 
              opacity: [0, 1, 1, 0.8],
              background: [
                "linear-gradient(to right, rgba(0, 229, 255, 0) 0%, rgba(0, 229, 255, 1) 50%, rgba(0, 229, 255, 0) 100%)",
                "linear-gradient(to right, rgba(127, 114, 255, 0) 0%, rgba(127, 114, 255, 1) 50%, rgba(127, 114, 255, 0) 100%)",
                "linear-gradient(to right, rgba(255, 0, 255, 0) 0%, rgba(255, 0, 255, 1) 50%, rgba(255, 0, 255, 0) 100%)"
              ]
            }}
            transition={{ 
              left: { duration: 1, ease: "easeInOut" },
              width: { duration: 0.3, ease: "easeOut" },
              opacity: { times: [0, 0.1, 0.7, 1], duration: 1 },
              background: { duration: 1, times: [0, 0.5, 1] }
            }}
          />
        </>
      )}
      
      {/* Second laser pass (right to left) - with star point and magenta to cyan color transition */}
      {laserPhase === 2 && (
        <>
          <motion.div 
            className="laser-star"
            initial={{ left: "105%", top: "50%", transform: "translate(0, -50%)" }}
            animate={{ left: "-10%", top: "50%", transform: "translate(0, -50%)" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{ backgroundColor: "#ff00ff", boxShadow: "0 0 8px 4px rgba(255, 0, 255, 0.8)" }}
          />
          <motion.div 
            className="laser-line thin-laser"
            initial={{ 
              left: "105%", 
              width: "5%", 
              opacity: 0,
              background: "linear-gradient(to right, rgba(255, 0, 255, 0) 0%, rgba(255, 0, 255, 1) 50%, rgba(255, 0, 255, 0) 100%)"
            }}
            animate={{ 
              left: "-10%", 
              width: "100%", 
              opacity: [0, 1, 1, 0.8],
              background: [
                "linear-gradient(to right, rgba(255, 0, 255, 0) 0%, rgba(255, 0, 255, 1) 50%, rgba(255, 0, 255, 0) 100%)",
                "linear-gradient(to right, rgba(127, 114, 255, 0) 0%, rgba(127, 114, 255, 1) 50%, rgba(127, 114, 255, 0) 100%)",
                "linear-gradient(to right, rgba(0, 229, 255, 0) 0%, rgba(0, 229, 255, 1) 50%, rgba(0, 229, 255, 0) 100%)"
              ]
            }}
            transition={{ 
              left: { duration: 1, ease: "easeInOut" },
              width: { duration: 0.3, ease: "easeOut" },
              opacity: { times: [0, 0.1, 0.7, 1], duration: 1 },
              background: { duration: 1, times: [0, 0.5, 1] }
            }}
          />
        </>
      )}
      
      {/* Third laser pass (left to right) - with star point and cyan to magenta color transition */}
      {laserPhase === 3 && (
        <>
          <motion.div 
            className="laser-star"
            initial={{ left: "-10%", top: "50%", transform: "translate(0, -50%)" }}
            animate={{ left: "105%", top: "50%", transform: "translate(0, -50%)" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
          <motion.div 
            className="laser-line thin-laser"
            initial={{ 
              left: "-10%", 
              width: "5%", 
              opacity: 0,
              background: "linear-gradient(to right, rgba(0, 229, 255, 0) 0%, rgba(0, 229, 255, 1) 50%, rgba(0, 229, 255, 0) 100%)"
            }}
            animate={{ 
              left: "105%", 
              width: "100%", 
              opacity: [0, 1, 1, 0.8, 1, 0.7, 0.4, 0.2],
              background: [
                "linear-gradient(to right, rgba(0, 229, 255, 0) 0%, rgba(0, 229, 255, 1) 50%, rgba(0, 229, 255, 0) 100%)",
                "linear-gradient(to right, rgba(127, 114, 255, 0) 0%, rgba(127, 114, 255, 1) 50%, rgba(127, 114, 255, 0) 100%)",
                "linear-gradient(to right, rgba(255, 0, 255, 0) 0%, rgba(255, 0, 255, 1) 50%, rgba(255, 0, 255, 0) 100%)"
              ]
            }}
            transition={{ 
              left: { duration: 1.8, ease: "easeInOut" },
              width: { duration: 0.3, ease: "easeOut" },
              opacity: { times: [0, 0.1, 0.3, 0.5, 0.7, 0.8, 0.9, 1], duration: 1.8 },
              background: { duration: 1.8, times: [0, 0.5, 1] }
            }}
          />
        </>
      )}
      
      {/* M1SSION Logo with enhanced glitch effect - appears during third laser pass */}
      {showLogo && (
        <motion.div 
          className="intro-logo-container"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
        >
          <h1 className="intro-logo glitch-text" data-text="M1SSION">
            <span className="cyan-text">M1</span>SSION
          </h1>
          
          {/* Date text with smooth fade-in */}
          {showDate && (
            <motion.p 
              className="intro-date"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              STARTS ON JULY 19
            </motion.p>
          )}
        </motion.div>
      )}
      
      {/* Digital noise overlay for enhanced tech effect */}
      <div className="digital-noise"></div>
      
      {/* Skip button - maintained from original */}
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
