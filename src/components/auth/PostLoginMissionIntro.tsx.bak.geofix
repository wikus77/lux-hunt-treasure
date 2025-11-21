// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// SEQUENZA POST-LOGIN CHIRURGICA - ANIMAZIONE PERFETTA SENZA ERRORI
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA COMPLETA

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const PostLoginMissionIntro = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [showSlogan, setShowSlogan] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const { navigate } = useWouterNavigation();
  const { getCurrentUser } = useUnifiedAuth();

  // 🚀 ADMIN BYPASS - Skip intro immediately for admin
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.email === 'wikus77@hotmail.it') {
      console.log('🚀 ADMIN DETECTED in PostLoginMissionIntro - Skip intro, go to /home');
      navigate('/home');
      return;
    }
  }, [getCurrentUser, navigate]);

  const finalText = 'M1SSION™';
  const animationSteps = ['M', 'M1', 'M1S', 'M1SS', 'M1SSI', 'M1SSIO', 'M1SSION', 'M1SSION™'];
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let startTimer: NodeJS.Timeout;
    
    const startAnimation = () => {
      let stepIndex = 0;
      
      interval = setInterval(() => {
        if (stepIndex < animationSteps.length) {
          setDisplayText(animationSteps[stepIndex]);
          stepIndex++;
          
          // Quando raggiungiamo l'ultimo step (M1SSION™)
          if (stepIndex === animationSteps.length) {
            clearInterval(interval);
            
            // 🔄 SEQUENZA ELEMENTI SUCCESSIVI
            setTimeout(() => {
              setShowSlogan(true);
              
              setTimeout(() => {
                setShowStartDate(true);
                
                // 🎯 REDIRECT FINALE DOPO 1.5s
                setTimeout(() => {
                  sessionStorage.setItem('hasSeenPostLoginIntro', 'true');
                  navigate('/home');
                }, 1500);
              }, 1000);
            }, 500);
          }
        } else {
          clearInterval(interval);
        }
      }, 175);
    };

    // Avvia animazione dopo delay iniziale
    startTimer = setTimeout(startAnimation, 300);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 🎯 M1SSION™ Text with PERFECT center positioning */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-7xl md:text-8xl lg:text-9xl font-orbitron tracking-wider"
          style={{ 
            fontWeight: 'normal', 
            fontFamily: 'Orbitron, monospace',
            position: 'absolute',
            top: '35%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            whiteSpace: 'nowrap',
            zIndex: 50,
            textAlign: 'center'
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
        
        {/* 🎯 IT IS POSSIBLE - PERFECT CENTER EXACT COLOR #BFA342 */}
        <AnimatePresence>
          {showSlogan && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-xl md:text-2xl lg:text-3xl font-orbitron tracking-widest"
              style={{ 
                fontWeight: 'normal',
                color: '#BFA342',
                position: 'absolute',
                top: '52%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                whiteSpace: 'nowrap',
                zIndex: 40,
                textShadow: "0 0 8px rgba(191, 163, 66, 0.4)",
                textAlign: 'center'
              }}
            >
              IT IS POSSIBLE
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 🎯 Data di Inizio - PERFECT CENTER */}
        <AnimatePresence>
          {showStartDate && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-base md:text-lg lg:text-xl font-orbitron tracking-wider"
              style={{ 
                fontWeight: 'normal',
                color: '#FFD700',
                position: 'absolute',
                top: '65%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                whiteSpace: 'nowrap',
                zIndex: 30,
                textShadow: "0 0 6px rgba(255, 215, 0, 0.4)",
                textAlign: 'center'
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