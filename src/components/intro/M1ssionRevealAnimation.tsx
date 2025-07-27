// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface M1ssionRevealAnimationProps {
  onComplete: () => void;
}

const M1ssionRevealAnimation: React.FC<M1ssionRevealAnimationProps> = ({ onComplete }) => {
  const [currentText, setCurrentText] = useState('M1SSION');
  const [phase, setPhase] = useState<'random' | 'final' | 'slogan' | 'trademark' | 'complete'>('random');
  
  console.log("📺 MissionIntro montata");

  // Characters for random generation
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  // Generate random text keeping M1 prefix
  const generateRandomText = useCallback(() => {
    return 'M1SSION'.split('').map((char, index) => {
      if (index === 0 || index === 1) return char; // Keep M1
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
  }, [chars]);

  useEffect(() => {
    console.log("🎬 Inizializzazione sequenza animazione M1SSION");
    let animationFrame: number;
    let timeouts: NodeJS.Timeout[] = [];

    // Phase 1: Random text animation (1.5 seconds)
    const startRandomPhase = () => {
      console.log("🔄 FASE 1: Generazione lettere random");
      let startTime = Date.now();
      
      const animateRandom = () => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed < 1500) { // 1.5 seconds of random
          setCurrentText(generateRandomText());
          animationFrame = requestAnimationFrame(animateRandom);
        } else {
          // Stop random and move to final
          cancelAnimationFrame(animationFrame);
          setPhase('final');
        }
      };
      
      animateRandom();
    };

    // Phase 2: Show final M1SSION
    const showFinalText = () => {
      console.log("🎯 FASE 2: Generazione finale M1SSION");
      setCurrentText('M1SSION');
      
      // Schedule slogan after 1 second
      const sloganTimeout = setTimeout(() => {
        setPhase('slogan');
      }, 1000);
      timeouts.push(sloganTimeout);
    };

    // Phase 3: Show "IT IS POSSIBLE"
    const showSlogan = () => {
      console.log("💫 FASE 3: Mostrando 'IT IS POSSIBLE'");
      
      // Schedule trademark after 1.5 seconds
      const trademarkTimeout = setTimeout(() => {
        setPhase('trademark');
      }, 1500);
      timeouts.push(trademarkTimeout);
    };

    // Phase 4: Show trademark
    const showTrademark = () => {
      console.log("™️ FASE 4: Mostrando trademark");
      
      // Schedule completion after 1.5 seconds
      const completeTimeout = setTimeout(() => {
        setPhase('complete');
      }, 1500);
      timeouts.push(completeTimeout);
    };

    // Phase 5: Complete and navigate
    const completeAnimation = () => {
      console.log("🏁 FASE 5: Animazione completata, sto andando in Home");
      onComplete();
    };

    // Start the sequence based on current phase
    switch (phase) {
      case 'random':
        startRandomPhase();
        break;
      case 'final':
        showFinalText();
        break;
      case 'slogan':
        showSlogan();
        break;
      case 'trademark':
        showTrademark();
        break;
      case 'complete':
        completeAnimation();
        break;
    }

    // Cleanup function
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [phase, onComplete, generateRandomText]);

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
            {(phase === 'trademark' || phase === 'complete') && (
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
          {(phase === 'slogan' || phase === 'trademark' || phase === 'complete') && (
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
