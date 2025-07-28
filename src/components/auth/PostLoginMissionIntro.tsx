// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Sequenza post-login implementata secondo specifiche ufficiali  
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA COMPLETA

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

const PostLoginMissionIntro = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [showSlogan, setShowSlogan] = useState(false);
  const [showTrademark, setShowTrademark] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const { navigate } = useWouterNavigation();

  const finalText = 'M1SSION™';
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let startTimer: NodeJS.Timeout;
    
    console.log('🎬 [PostLoginMissionIntro] ======= COMPONENT MOUNTED =======');
    console.log('🎬 [PostLoginMissionIntro] ======= STARTING ANIMATION SEQUENCE =======');
    
    const startAnimation = () => {
      interval = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const newIndex = prevIndex + 1;
          
          if (newIndex <= finalText.length) {
            // 🎯 SEQUENZA NUMERICA RIVELAZIONE: M → M1 → M1S → M1SS → M1SSI → M1SSIO → M1SSION™
            const revealedText = finalText.slice(0, newIndex);
            setDisplayText(revealedText);
            console.log(`🎬 [PostLoginMissionIntro] Revealing: "${revealedText}" (${newIndex}/${finalText.length})`);
            
            if (newIndex === finalText.length) {
              console.log('🎬 [PostLoginMissionIntro] M1SSION™ ANIMATION COMPLETED');
              clearInterval(interval);
              
              // 🔄 SEQUENZA ELEMENTI SUCCESSIVI
              setTimeout(() => {
                console.log('🎬 [PostLoginMissionIntro] Mostrando IT IS POSSIBLE');
                setShowSlogan(true);
                
                setTimeout(() => {
                  console.log('🎬 [PostLoginMissionIntro] Mostrando ™');
                  setShowTrademark(true);
                  
                  setTimeout(() => {
                    console.log('🎬 [PostLoginMissionIntro] Mostrando data inizio');
                    setShowStartDate(true);
                    
                    // 🎯 REDIRECT FINALE DOPO 1.5s
                    setTimeout(() => {
                      console.log('🎬 [PostLoginMissionIntro] ======= ANIMATION SEQUENCE COMPLETED =======');
                      console.log('🎬 [PostLoginMissionIntro] Setting sessionStorage hasSeenPostLoginIntro = true');
                      sessionStorage.setItem('hasSeenPostLoginIntro', 'true');
                      console.log('🎬 [PostLoginMissionIntro] ======= EXECUTING NAVIGATE TO /home =======');
                      navigate('/home');
                      console.log('🎬 [PostLoginMissionIntro] ======= REDIRECT TO HOME EXECUTED =======');
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
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [navigate, finalText.length]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="text-center">
        {/* 🎯 M1SSION™ Text with EXACT numeric reveal effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-8xl md:text-9xl font-orbitron tracking-wider"
          style={{ 
            fontWeight: 'normal', 
            fontFamily: 'Orbitron, monospace',
            position: 'fixed',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            whiteSpace: 'nowrap',
            zIndex: 50
          }}
        >
          <span className="text-[#00D1FF]" style={{
            textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
          }}>
            {displayText.slice(0, 2)}
          </span>
          <span className="text-white" style={{
            textShadow: "0 0 5px rgba(255, 255, 255, 0.3)"
          }}>
            {displayText.slice(2)}
          </span>
        </motion.div>
        
        {/* 🎯 IT IS POSSIBLE - EXACT COLOR #BFA342 */}
        <AnimatePresence>
          {showSlogan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="text-2xl md:text-3xl font-orbitron tracking-widest"
              style={{ 
                fontWeight: 'normal',
                color: '#BFA342',
                position: 'fixed',
                top: '55%',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                zIndex: 40,
                textShadow: "0 0 8px rgba(191, 163, 66, 0.4)"
              }}
            >
              IT IS POSSIBLE
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 🎯 Data di Inizio */}
        <AnimatePresence>
          {showStartDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl font-orbitron tracking-wider"
              style={{ 
                fontWeight: 'normal',
                color: '#FFD700',
                position: 'fixed',
                top: '65%',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                zIndex: 30,
                textShadow: "0 0 6px rgba(255, 215, 0, 0.4)"
              }}
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