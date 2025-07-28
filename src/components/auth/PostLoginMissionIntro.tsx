// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Sequenza post-login implementata secondo specifiche ufficiali  
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA COMPLETA

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import testMissionSequence from '@/utils/mission-sequence-tester';

const PostLoginMissionIntro = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [showSlogan, setShowSlogan] = useState(false);
  const [showTrademark, setShowTrademark] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const { navigate } = useWouterNavigation();

  const finalText = 'M1SSION';
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  console.log('🎬 [PostLoginMissionIntro] Iniziando animazione numerica M1SSION™');
  
  // Test the current sequence state
  useEffect(() => {
    testMissionSequence();
  }, []);

  useEffect(() => {
    console.log('🎬 [PostLoginMissionIntro] ======= STARTING POST-LOGIN ANIMATION =======');
    console.log('🎬 [PostLoginMissionIntro] Current route: /mission-intro');
    console.log('🎬 [PostLoginMissionIntro] Starting M1SSION numeric reveal');
    
    let interval: NodeJS.Timeout;
    
    const startAnimation = () => {
      interval = setInterval(() => {
        if (currentIndex < finalText.length) {
          // Crea testo con effetto scramble fino alla posizione corrente
          const scrambledText = finalText.split('').map((char, index) => {
            if (index < currentIndex) {
              return char; // Già rivelato
            } else if (index === currentIndex) {
              return char; // Attualmente in rivelazione
            } else {
              return chars[Math.floor(Math.random() * chars.length)]; // Ancora in scramble
            }
          }).join('');
          
          setDisplayText(scrambledText);
          setCurrentIndex(prev => prev + 1);
        } else {
          clearInterval(interval);
          
          // Mostra M1SSION completo
          setDisplayText(finalText);
          
          // Mostra slogan dopo 500ms
          setTimeout(() => {
            console.log('🎬 [PostLoginMissionIntro] Mostrando IT IS POSSIBLE');
            setShowSlogan(true);
            
            // Mostra trademark dopo 1s
            setTimeout(() => {
              console.log('🎬 [PostLoginMissionIntro] Mostrando ™');
              setShowTrademark(true);
              
              // Mostra data di inizio dopo 500ms
              setTimeout(() => {
                console.log('🎬 [PostLoginMissionIntro] Mostrando data inizio');
                setShowStartDate(true);
                
                // Pausa finale 1.5s e redirect a /home
                setTimeout(() => {
                  console.log('🎬 [PostLoginMissionIntro] ======= ANIMATION COMPLETED =======');
                  console.log('🎬 [PostLoginMissionIntro] Setting sessionStorage and redirecting to /home');
                  sessionStorage.setItem('hasSeenPostLoginIntro', 'true');
                  navigate('/home');
                }, 1500);
              }, 500);
            }, 1000);
          }, 500);
        }
      }, 200); // 200ms per carattere
    };

    // Avvia animazione dopo piccolo delay
    const startTimer = setTimeout(startAnimation, 300);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="text-center">
        {/* Testo M1SSION con effetto numerico */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-8xl md:text-9xl font-orbitron text-white tracking-wider mb-6"
          style={{ fontWeight: 'normal', fontFamily: 'Orbitron, monospace' }}
        >
          <span className="text-[#00D1FF]">M1</span>
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
              className="mt-6 text-3xl md:text-4xl text-cyan-400 font-orbitron tracking-widest"
              style={{ fontWeight: 'normal' }}
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