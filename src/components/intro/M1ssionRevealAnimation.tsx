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
  const [convergenceStep, setConvergenceStep] = useState(0);

  // Characters for random generation
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const finalText = 'M1SSION';
  
  // Generate progressive convergence text
  const generateConvergingText = (step: number) => {
    const fixedChars = Math.min(step, finalText.length);
    let result = '';
    
    for (let i = 0; i < finalText.length; i++) {
      if (i < fixedChars) {
        // Keep the correct character fixed
        result += finalText[i];
      } else {
        // Random character for remaining positions
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    return result;
  };

  useEffect(() => {
    let animationFrame: number;
    let startTime = Date.now();
    let convergenceInterval: NodeJS.Timeout;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < 1200) {
        // Progressive convergence phase (1.2s)
        const progressStep = Math.floor((elapsed / 1200) * finalText.length);
        setConvergenceStep(progressStep);
        setCurrentText(generateConvergingText(progressStep));
        animationFrame = requestAnimationFrame(animate);
      } else if (elapsed >= 1200 && !showFinal) {
        // Show final M1SSION and stop animation
        setCurrentText('M1SSION');
        setShowFinal(true);
        
        // Show "IT IS POSSIBLE" after 0.8s (cumulative: 2.0s)
        setTimeout(() => setShowSlogan(true), 800);
        
        // Show trademark after 1.3s (cumulative: 2.5s)  
        setTimeout(() => setShowTrademark(true), 1300);
        
        // Auto redirect after 3.5s (cumulative: 4.7s) - longer delay
        setTimeout(() => {
          console.log("🎬 M1SSION ANIMATION COMPLETE - calling onComplete callback");
          onComplete();
        }, 3500);
      }
    };
    
    animate();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (convergenceInterval) {
        clearInterval(convergenceInterval);
      }
    };
  }, [onComplete, showFinal, convergenceStep]);

  return (
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center">
      <div className="text-center">
        {/* M1SSION Text */}
        <motion.h1 
          className="text-6xl md:text-8xl font-technovier font-normal mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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