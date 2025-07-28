// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Sequenza post-login implementata secondo specifiche ufficiali  
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA COMPLETA

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

const PostLoginMissionIntro = () => {
  console.log('🎬 [PostLoginMissionIntro] ======= COMPONENT MOUNTED =======');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [showSlogan, setShowSlogan] = useState(false);
  const [showTrademark, setShowTrademark] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const { navigate } = useWouterNavigation();

  const finalText = 'M1SSION';
  // Remove unused chars variable - no random generation needed
  
  console.log('🎬 [PostLoginMissionIntro] ======= STARTING ANIMATION SEQUENCE =======');
  
  useEffect(() => {
    console.log('🎬 [PostLoginMissionIntro] Animation useEffect triggered');
    console.log('🎬 [PostLoginMissionIntro] Starting M1SSION numeric reveal animation');
    
    let interval: NodeJS.Timeout;
    let startTimer: NodeJS.Timeout;
    
    const startAnimation = () => {
      console.log('🎬 [PostLoginMissionIntro] Starting reveal animation...');
      
      interval = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const newIndex = prevIndex + 1;
          console.log(`🎬 [PostLoginMissionIntro] Revealing character ${newIndex}/${finalText.length}`);
          
          if (newIndex <= finalText.length) {
            // Rivela un carattere alla volta: M → M1 → M1S → M1SS → M1SSI → M1SSIO → M1SSION
            const revealedText = finalText.slice(0, newIndex);
            setDisplayText(revealedText);
            console.log(`🎬 [PostLoginMissionIntro] Current text: "${revealedText}"`);
            
            if (newIndex === finalText.length) {
              // Animazione completata
              console.log('🎬 [PostLoginMissionIntro] ======= M1SSION REVEAL COMPLETED =======');
              clearInterval(interval);
              
              // Sequenza elementi successivi
              setTimeout(() => {
                console.log('🎬 [PostLoginMissionIntro] Showing IT IS POSSIBLE');
                setShowSlogan(true);
                
                setTimeout(() => {
                  console.log('🎬 [PostLoginMissionIntro] Showing ™');
                  setShowTrademark(true);
                  
                  setTimeout(() => {
                    console.log('🎬 [PostLoginMissionIntro] Showing mission start date');
                    setShowStartDate(true);
                    
                    // Redirect finale dopo 1.5s
                    setTimeout(() => {
                      console.log('🎬 [PostLoginMissionIntro] ======= FINAL REDIRECT TO /home =======');
                      sessionStorage.setItem('hasSeenPostLoginIntro', 'true');
                      navigate('/home');
                    }, 1500);
                  }, 500);
                }, 1000);
              }, 500);
            }
            
            return newIndex;
          } else {
            clearInterval(interval);
            return prevIndex;
          }
        });
      }, 175); // 175ms per carattere per timing ottimale
    };

    // Avvia animazione dopo delay iniziale
    startTimer = setTimeout(startAnimation, 300);

    return () => {
      console.log('🎬 [PostLoginMissionIntro] Cleanup: clearing timers');
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="text-center">
        {/* Debug indicator */}
        <div className="fixed top-4 left-4 text-green-400 text-sm font-mono bg-black/50 p-2 rounded z-50">
          🎬 POST-LOGIN ANIMATION ACTIVE<br/>
          Debug: {displayText} | Index: {currentIndex}
        </div>
        
        {/* SessionStorage debug */}
        <div className="fixed bottom-4 left-4 text-yellow-400 text-xs font-mono bg-black/50 p-2 rounded z-50">
          SessionStorage hasSeenPostLoginIntro: {sessionStorage.getItem('hasSeenPostLoginIntro') || 'null'}
        </div>
        
        {/* M1SSION Text with numeric reveal effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-8xl md:text-9xl font-orbitron text-white tracking-wider mb-6"
          style={{ fontWeight: 'normal', fontFamily: 'Orbitron, monospace' }}
        >
          <span className="text-[#00D1FF]">{displayText.slice(0, 2)}</span>
          <span className="text-white">{displayText.slice(2)}</span>
        </motion.div>
        
        {/* IT IS POSSIBLE */}
        <AnimatePresence>
          {showSlogan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="mt-6 text-3xl md:text-4xl font-orbitron tracking-widest"
              style={{ 
                fontWeight: 'normal',
                color: '#B8860B' // Dark yellow/gold color for better visibility
              }}
            >
              IT IS POSSIBLE
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Trademark ™ */}
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
        
        {/* Data di Inizio */}
        <AnimatePresence>
          {showStartDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-8 text-xl text-yellow-400 font-orbitron tracking-wider"
              style={{ fontWeight: 'normal' }}
            >
              Inizio: 19-06-25
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PostLoginMissionIntro;