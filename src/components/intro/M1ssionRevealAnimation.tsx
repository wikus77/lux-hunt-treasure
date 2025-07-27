// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface M1ssionRevealAnimationProps {
  onComplete: () => void;
}

const M1ssionRevealAnimation: React.FC<M1ssionRevealAnimationProps> = ({ onComplete }) => {
  const [currentText, setCurrentText] = useState('M1SSION');
  const [showFinal, setShowFinal] = useState(false);
  const [showSlogan, setShowSlogan] = useState(false);
  const [showTrademark, setShowTrademark] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  console.log("📺 MissionIntro montata");

  // Characters for random generation
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  // Generate random text
  const generateRandomText = () => {
    return 'M1SSION'.split('').map((char, index) => {
      if (index === 0 || index === 1) return char; // Keep M1
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
  };

  useEffect(() => {
    console.log("🎬 Inizializzazione sequenza animazione M1SSION");
    let animationFrame: number;
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < 1000) {
        // Random text phase (1s)
        setCurrentText(generateRandomText());
        animationFrame = requestAnimationFrame(animate);
      } else if (elapsed >= 1000 && !showFinal) {
        // Show final M1SSION
        console.log("🎯 Generazione finale M1SSION");
        setCurrentText('M1SSION');
        setShowFinal(true);
        
        // Show "IT IS POSSIBLE" after 1s (cumulative: 2s)
        setTimeout(() => {
          console.log("💫 Mostrando 'IT IS POSSIBLE'");
          setShowSlogan(true);
        }, 1000);
        
        // Show trademark after 1.8s (cumulative: 2.8s)  
        setTimeout(() => {
          console.log("™️ Mostrando trademark");
          setShowTrademark(true);
        }, 1800);
        
        // Mark animation as complete after 3.5s (cumulative: 4.5s)
        setTimeout(() => {
          console.log("🏁 Animazione completata, sto andando in Home");
          setIsAnimationComplete(true);
          onComplete();
        }, 3500);
      }
    };
    
    animate();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [onComplete, showFinal, isAnimationComplete]);

  return (
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center">
      <div className="text-center">
        {/* M1SSION Text */}
        <motion.h1 
          className="text-6xl md:text-8xl font-technovier font-normal mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-cyan-400">M1</span>
          <span className="text-white">
            {currentText.slice(2)}
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
          </span>
        </motion.h1>

        {/* IT IS POSSIBLE */}
        <AnimatePresence>
          {showSlogan && (
            <motion.p 
              className="text-yellow-600 text-xl md:text-2xl font-technovier tracking-wider"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
              exit={{ opacity: 0, y: -20 }}
            >
              IT IS POSSIBLE
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default M1ssionRevealAnimation;