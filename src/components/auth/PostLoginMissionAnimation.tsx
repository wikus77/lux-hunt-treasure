// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🔐 Codice blindato – Inserimento animazione solo in fase post-login autorizzata

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

const PostLoginMissionAnimation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [showSlogan, setShowSlogan] = useState(false);
  const [showTrademark, setShowTrademark] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const { navigate } = useWouterNavigation();

  const finalText = 'M1SSION';
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  console.log('🎬 [PostLoginMissionAnimation] Component mounted - Starting numeric reveal');

  useEffect(() => {
    console.log('🎬 [PostLoginMissionAnimation] Starting M1SSION numeric animation sequence');
    
    let interval: NodeJS.Timeout;
    
    const startAnimation = () => {
      interval = setInterval(() => {
        if (currentIndex < finalText.length) {
          // Create scrambled text with current position being revealed
          const scrambledText = finalText.split('').map((char, index) => {
            if (index < currentIndex) {
              return char; // Already revealed
            } else if (index === currentIndex) {
              return char; // Currently being revealed
            } else {
              return chars[Math.floor(Math.random() * chars.length)]; // Still scrambling
            }
          }).join('');
          
          setDisplayText(scrambledText);
          setCurrentIndex(prev => prev + 1);
        } else {
          clearInterval(interval);
          
          // Show complete M1SSION first
          setDisplayText(finalText);
          
          // Show slogan after 500ms
          setTimeout(() => {
            console.log('🎬 [PostLoginMissionAnimation] Showing IT IS POSSIBLE');
            setShowSlogan(true);
            
            // Show trademark after 1s more
            setTimeout(() => {
              console.log('🎬 [PostLoginMissionAnimation] Showing trademark');
              setShowTrademark(true);
              
              // Show start date after 500ms more
              setTimeout(() => {
                console.log('🎬 [PostLoginMissionAnimation] Showing start date');
                setShowStartDate(true);
                
                // Wait 1.5s more, then redirect (total: ~5.5s)
                setTimeout(() => {
                  console.log('🎬 [PostLoginMissionAnimation] Animation complete, setting session storage and redirecting to /home');
                  sessionStorage.setItem('hasSeenPostLoginIntro', 'true');
                  navigate('/home');
                }, 1500);
              }, 500);
            }, 1000);
          }, 500);
        }
      }, 200); // 200ms per character reveal
    };

    // Start animation after small delay
    const startTimer = setTimeout(startAnimation, 300);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="text-center">
        {/* M1SSION Text with numeric reveal effect */}
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
        
        {/* Trademark */}
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
        
        {/* Start Date */}
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

export default PostLoginMissionAnimation;