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
    
    const startAnimation = () => {
      interval = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const newIndex = prevIndex + 1;
          
          if (newIndex <= finalText.length) {
            // Rivela un carattere alla volta: M → M1 → M1S → M1SS → M1SSI → M1SSIO → M1SSION™
            const revealedText = finalText.slice(0, newIndex);
            setDisplayText(revealedText);
            
            if (newIndex === finalText.length) {
              // Animazione M1SSION™ completata
              clearInterval(interval);
              
              // Sequenza elementi successivi
              setTimeout(() => {
                setShowSlogan(true);
                
                setTimeout(() => {
                  setShowTrademark(true);
                  
                  setTimeout(() => {
                    setShowStartDate(true);
                    
                    // Redirect finale dopo 1.5s
                    setTimeout(() => {
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
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [navigate, finalText.length]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="text-center">
        {/* M1SSION™ Text with numeric reveal effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-8xl md:text-9xl font-orbitron tracking-wider mb-6"
          style={{ 
            fontWeight: 'normal', 
            fontFamily: 'Orbitron, monospace',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            whiteSpace: 'nowrap'
          }}
        >
          <span className="text-[#00D1FF]">{displayText.slice(0, 2)}</span>
          <span className="text-white">{displayText.slice(2)}</span>
        </motion.div>
        
        {/* IT IS POSSIBLE */}
        <AnimatePresence>
          {showSlogan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-4xl font-orbitron tracking-widest"
              style={{ 
                fontWeight: 'normal',
                color: '#BFA342', // Exact color requested
                position: 'fixed',
                top: '60%',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap'
              }}
            >
              IT IS POSSIBLE
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Data di Inizio */}
        <AnimatePresence>
          {showStartDate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-xl font-orbitron tracking-wider"
              style={{ 
                fontWeight: 'normal',
                color: '#FFD700',
                position: 'fixed',
                top: '70%',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap'
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