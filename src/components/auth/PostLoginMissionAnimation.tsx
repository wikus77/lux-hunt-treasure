// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™  
// 🔐 Codice blindato – Inserimento animazione solo in fase post-login autorizzata

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

const PostLoginMissionAnimation = () => {
  const [displayText, setDisplayText] = useState('');
  const [showSlogan, setShowSlogan] = useState(false);
  const [showTrademark, setShowTrademark] = useState(false);
  const { navigate } = useWouterNavigation();

  const finalText = 'M1SSION';
  
  console.log('🎬 [PostLoginMissionAnimation] Component mounted');

  useEffect(() => {
    console.log('🎬 [PostLoginMissionAnimation] Starting animation sequence');
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < finalText.length) {
        setDisplayText(finalText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        
        // Show slogan after M1SSION is complete
        setTimeout(() => {
          console.log('🎬 [PostLoginMissionAnimation] Showing slogan');
          setShowSlogan(true);
          
          // Show trademark after slogan
          setTimeout(() => {
            console.log('🎬 [PostLoginMissionAnimation] Showing trademark');
            setShowTrademark(true);
            
            // Wait 1 second after trademark, then redirect
            setTimeout(() => {
              console.log('🎬 [PostLoginMissionAnimation] Animation complete, redirecting to /home');
              sessionStorage.setItem('hasSeenPostLoginIntro', 'true');
              navigate('/home');
            }, 1000);
          }, 1000);
        }, 500);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-8xl md:text-9xl font-orbitron text-white tracking-wider"
          style={{ fontWeight: 'normal' }}
        >
          {displayText}
        </motion.div>
        
        <AnimatePresence>
          {showSlogan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="mt-6 text-2xl md:text-3xl text-cyan-400 font-orbitron"
              style={{ fontWeight: 'normal' }}
            >
              IT IS POSSIBLE
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showTrademark && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="mt-4 text-4xl text-white font-orbitron"
              style={{ fontWeight: 'normal' }}
            >
              ™
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PostLoginMissionAnimation;