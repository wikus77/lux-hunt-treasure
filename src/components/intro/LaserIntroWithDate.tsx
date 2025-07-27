// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🔐 Codice blindato – Laser Intro + Start Date Reveal per primo accesso assoluto

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LaserIntroWithDateProps {
  onComplete: () => void;
}

const LaserIntroWithDate: React.FC<LaserIntroWithDateProps> = ({ onComplete }) => {
  const [currentText, setCurrentText] = useState('');
  const [showFinal, setShowFinal] = useState(false);
  const [showSlogan, setShowSlogan] = useState(false);
  const [showTrademark, setShowTrademark] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const finalText = 'M1SSION';
  
  console.log('🚀 [LaserIntroWithDate] Component mounted - First time intro with start date');

  useEffect(() => {
    let animationFrame: number;
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < 1200) {
        // Laser scrambling phase (1.2s)
        const scrambledText = finalText.split('').map((char, index) => {
          if (index === 0 || index === 1) return char; // Keep M1
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        setCurrentText(scrambledText);
        animationFrame = requestAnimationFrame(animate);
      } else if (!showFinal) {
        // Show final M1SSION
        setCurrentText(finalText);
        setShowFinal(true);
        
        // Show "IT IS POSSIBLE" after 800ms
        setTimeout(() => {
          console.log('🚀 [LaserIntroWithDate] Showing IT IS POSSIBLE');
          setShowSlogan(true);
        }, 800);
        
        // Show trademark after 1300ms
        setTimeout(() => {
          console.log('🚀 [LaserIntroWithDate] Showing trademark');
          setShowTrademark(true);
        }, 1300);
        
        // Show start date after 1800ms
        setTimeout(() => {
          console.log('🚀 [LaserIntroWithDate] Showing start date');
          setShowStartDate(true);
        }, 1800);
        
        // Complete animation after 3000ms
        setTimeout(() => {
          console.log('🚀 [LaserIntroWithDate] Laser intro complete, proceeding to landing');
          onComplete();
        }, 3000);
      }
    };
    
    animate();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [onComplete, showFinal]);

  return (
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center">
      <div className="text-center">
        {/* M1SSION Text with laser effect */}
        <motion.h1 
          className="text-6xl md:text-8xl font-orbitron font-bold mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-cyan-400">M1</span>
          <span className="text-white">
            {currentText.slice(2)}
          </span>
        </motion.h1>

        {/* Trademark */}
        <AnimatePresence>
          {showTrademark && (
            <motion.span 
              className="text-white text-2xl align-top ml-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              ™
            </motion.span>
          )}
        </AnimatePresence>

        {/* IT IS POSSIBLE */}
        <AnimatePresence>
          {showSlogan && (
            <motion.p 
              className="text-yellow-600 text-xl md:text-2xl font-orbitron tracking-wider mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
              exit={{ opacity: 0, y: -20 }}
            >
              IT IS POSSIBLE
            </motion.p>
          )}
        </AnimatePresence>

        {/* Start Date */}
        <AnimatePresence>
          {showStartDate && (
            <motion.p 
              className="text-cyan-300 text-lg md:text-xl font-orbitron tracking-wider mt-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Inizio: 19-06-25
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LaserIntroWithDate;