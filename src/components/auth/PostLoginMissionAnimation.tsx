// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

const PostLoginMissionAnimation: React.FC = () => {
  const [, navigate] = useLocation();
  const [currentText, setCurrentText] = useState('');
  const [showSlogan, setShowSlogan] = useState(false);
  const [showTrademark, setShowTrademark] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const targetText = 'M1SSION';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  useEffect(() => {
    console.log("[MissionIntro] Animation started");
    
    let currentIndex = 0;
    let isGeneratingRandomly = true;
    
    const animateText = () => {
      if (currentIndex < targetText.length) {
        if (isGeneratingRandomly) {
          // Generate random characters for current position
          let randomText = '';
          for (let i = 0; i <= currentIndex; i++) {
            if (i < currentIndex) {
              randomText += targetText[i]; // Keep already revealed characters
            } else {
              randomText += chars[Math.floor(Math.random() * chars.length)]; // Random for current
            }
          }
          setCurrentText(randomText);
          
          // Stop randomizing and reveal current character after some iterations
          setTimeout(() => {
            setCurrentText(targetText.substring(0, currentIndex + 1));
            currentIndex++;
            isGeneratingRandomly = true;
            
            if (currentIndex < targetText.length) {
              setTimeout(animateText, 150); // Pause between characters
            } else {
              // All characters revealed
              setTimeout(() => {
                console.log("[MissionIntro] M1SSION text complete - showing slogan");
                setShowSlogan(true);
                
                setTimeout(() => {
                  console.log("[MissionIntro] Slogan shown - showing trademark");
                  setShowTrademark(true);
                  
                  setTimeout(() => {
                    console.log("[MissionIntro] Animation done → redirect to /home");
                    setIsComplete(true);
                    sessionStorage.setItem("hasSeenPostLoginIntro", "true");
                    navigate('/home');
                  }, 1000); // 1 second pause after trademark
                }, 800); // Show trademark after 0.8s
              }, 500); // Pause after M1SSION complete
            }
          }, 300); // Random generation time
        }
      }
    };

    // Start animation
    setTimeout(animateText, 500); // Initial delay

    return () => {
      // Cleanup if component unmounts
    };
  }, [navigate]);

  if (isComplete) {
    return null; // Component completed, should be navigating
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center">
      <div className="text-center">
        {/* M1SSION Text */}
        <motion.h1 
          className="text-6xl md:text-8xl font-technovier mb-4"
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

export default PostLoginMissionAnimation;