// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1 Logo Animated Splash Screen - 5 seconds duration

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface M1LogoSplashProps {
  onComplete: () => void;
  duration?: number; // Duration in milliseconds, default 7000
}

const M1LogoSplash: React.FC<M1LogoSplashProps> = ({ 
  onComplete, 
  duration = 7000 // 7 secondi come richiesto
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<'enter' | 'glow' | 'exit'>('enter');

  useEffect(() => {
    // Phase 1: Enter animation (0-1.5s)
    const glowTimer = setTimeout(() => setPhase('glow'), 1500);
    
    // Phase 2: Glow/breathing + "IT IS POSSIBLE" (1.5s-6s)
    // Phase 3: Exit animation starts (6s)
    const exitTimer = setTimeout(() => setPhase('exit'), duration - 1200);
    
    // Complete after full duration (7s)
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Background gradient effect */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'glow' ? 0.3 : 0 }}
            transition={{ duration: 1 }}
            style={{
              background: 'radial-gradient(circle at center, rgba(0, 209, 255, 0.15) 0%, transparent 70%)',
            }}
          />

          {/* Animated rings */}
          <motion.div
            className="absolute"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: phase === 'exit' ? 3 : phase === 'glow' ? [1, 1.5, 1] : 0.5,
              opacity: phase === 'exit' ? 0 : phase === 'glow' ? [0.3, 0.1, 0.3] : 0
            }}
            transition={{ 
              duration: phase === 'glow' ? 3 : 1,
              repeat: phase === 'glow' ? Infinity : 0,
              ease: 'easeInOut'
            }}
          >
            <div 
              className="w-[400px] h-[400px] rounded-full border-2 border-[#00D1FF]/30"
              style={{
                boxShadow: '0 0 60px rgba(0, 209, 255, 0.2), inset 0 0 60px rgba(0, 209, 255, 0.1)'
              }}
            />
          </motion.div>

          {/* M1 Logo Container */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: phase === 'exit' ? 0.8 : 1,
              opacity: phase === 'exit' ? 0 : 1
            }}
            transition={{ 
              duration: phase === 'enter' ? 1 : 0.8,
              ease: [0.34, 1.56, 0.64, 1] // Spring-like easing
            }}
          >
            {/* M Letter - Cyan with glow */}
            <motion.svg
              width="180"
              height="180"
              viewBox="0 0 200 200"
              className="relative"
              style={{
                filter: phase === 'glow' 
                  ? 'drop-shadow(0 0 30px rgba(0, 209, 255, 0.8)) drop-shadow(0 0 60px rgba(0, 209, 255, 0.5))'
                  : 'drop-shadow(0 0 15px rgba(0, 209, 255, 0.5))'
              }}
              animate={{
                filter: phase === 'glow' ? [
                  'drop-shadow(0 0 30px rgba(0, 209, 255, 0.8)) drop-shadow(0 0 60px rgba(0, 209, 255, 0.5))',
                  'drop-shadow(0 0 50px rgba(0, 209, 255, 1)) drop-shadow(0 0 100px rgba(0, 209, 255, 0.7))',
                  'drop-shadow(0 0 30px rgba(0, 209, 255, 0.8)) drop-shadow(0 0 60px rgba(0, 209, 255, 0.5))'
                ] : undefined
              }}
              transition={{
                duration: 2,
                repeat: phase === 'glow' ? Infinity : 0,
                ease: 'easeInOut'
              }}
            >
              {/* M Path - Custom M shape similar to the logo */}
              <motion.path
                d="M25 160 L25 50 Q25 40 35 40 L50 40 Q60 40 65 50 L100 115 L135 50 Q140 40 150 40 L165 40 Q175 40 175 50 L175 160 Q175 170 165 170 L155 170 Q145 170 145 160 L145 85 L115 140 Q110 150 100 150 Q90 150 85 140 L55 85 L55 160 Q55 170 45 170 L35 170 Q25 170 25 160 Z"
                fill="none"
                stroke="#00D1FF"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ 
                  duration: 1.5,
                  ease: 'easeOut',
                  delay: 0.2
                }}
              />
              {/* M Fill */}
              <motion.path
                d="M25 160 L25 50 Q25 40 35 40 L50 40 Q60 40 65 50 L100 115 L135 50 Q140 40 150 40 L165 40 Q175 40 175 50 L175 160 Q175 170 165 170 L155 170 Q145 170 145 160 L145 85 L115 140 Q110 150 100 150 Q90 150 85 140 L55 85 L55 160 Q55 170 45 170 L35 170 Q25 170 25 160 Z"
                fill="#00D1FF"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              />
            </motion.svg>

            {/* 1 Number - White */}
            <motion.div
              className="text-white font-bold ml-2"
              style={{
                fontSize: '140px',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 700,
                lineHeight: 1,
                textShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
              }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ 
                opacity: phase === 'exit' ? 0 : 1, 
                x: 0 
              }}
              transition={{ 
                duration: 0.8, 
                delay: 0.8,
                ease: 'easeOut'
              }}
            >
              1
            </motion.div>
          </motion.div>

          {/* Particle effects */}
          {phase === 'glow' && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-[#00D1FF]"
                  initial={{ 
                    opacity: 0,
                    scale: 0,
                    x: 0,
                    y: 0
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                    x: Math.cos((i / 8) * Math.PI * 2) * 150,
                    y: Math.sin((i / 8) * Math.PI * 2) * 150
                  }}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.15,
                    repeat: Infinity,
                    ease: 'easeOut'
                  }}
                  style={{
                    boxShadow: '0 0 10px rgba(0, 209, 255, 0.8)'
                  }}
                />
              ))}
            </>
          )}

          {/* Bottom text - "IT IS POSSIBLE" in dark gold with typewriter effect */}
          <motion.div
            className="absolute bottom-20 text-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: phase === 'glow' ? 1 : 0
            }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <motion.div
              className="flex justify-center"
              initial={{ width: 0 }}
              animate={{ 
                width: phase === 'glow' ? 'auto' : 0
              }}
              transition={{ 
                duration: 1.5, 
                delay: 1.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <motion.p 
                className="text-2xl font-bold tracking-[0.15em] uppercase"
                style={{
                  color: '#B8860B', // Dark goldenrod
                  textShadow: '0 0 20px rgba(184, 134, 11, 0.6), 0 0 40px rgba(184, 134, 11, 0.3)',
                  fontFamily: 'Orbitron, sans-serif'
                }}
                animate={phase === 'glow' ? {
                  textShadow: [
                    '0 0 20px rgba(184, 134, 11, 0.6), 0 0 40px rgba(184, 134, 11, 0.3)',
                    '0 0 30px rgba(184, 134, 11, 0.8), 0 0 60px rgba(184, 134, 11, 0.5)',
                    '0 0 20px rgba(184, 134, 11, 0.6), 0 0 40px rgba(184, 134, 11, 0.3)'
                  ]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                IT IS POSSIBLE
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Copyright */}
          <motion.div
            className="absolute bottom-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'glow' ? 0.5 : 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <p className="text-white/40 text-xs font-light">
              © 2025 NIYVORA KFT™
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default M1LogoSplash;

