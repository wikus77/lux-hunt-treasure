// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// SEQUENZA POST-LOGIN CHIRURGICA BLINDATA - ANIMAZIONE PERFETTA SENZA ERRORI
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA COMPLETA

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

const PostLoginMissionIntro = () => {
  const [displayText, setDisplayText] = useState('');
  const [showSlogan, setShowSlogan] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  
  // 🔒 CRITICAL: Wouter navigation hook
  const [location, setLocation] = useLocation();
  
  // 🔒 CRITICAL: Refs per evitare re-render e race conditions
  const mountedRef = useRef(true);
  const animationInProgressRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  
  const animationSteps = ['M', 'M1', 'M1S', 'M1SS', 'M1SSI', 'M1SSIO', 'M1SSION', 'M1SSION™'];
  
  // 🎬 ANIMAZIONE PRINCIPALE - BLINDATA E STABILE
  useEffect(() => {
    console.log('🎬 PostLoginMissionIntro: Inizializzazione animazione');
    
    // Previeni multiple esecuzioni
    if (animationInProgressRef.current) {
      console.log('⚠️ Animazione già in corso, skip...');
      return;
    }
    
    animationInProgressRef.current = true;
    
    let animationTimer: NodeJS.Timeout;
    let sloganTimer: NodeJS.Timeout;
    let dateTimer: NodeJS.Timeout;
    let redirectTimer: NodeJS.Timeout;
    
    const executeAnimation = () => {
      console.log('🎯 Esecuzione animazione M1SSION');
      
      let currentStep = 0;
      const animateStep = () => {
        if (!mountedRef.current || currentStep >= animationSteps.length) {
          return;
        }
        
        console.log(`🔤 Step ${currentStep}: ${animationSteps[currentStep]}`);
        setDisplayText(animationSteps[currentStep]);
        currentStep++;
        
        if (currentStep < animationSteps.length) {
          animationTimer = setTimeout(animateStep, 175);
        } else {
          // Animazione completata
          console.log('✅ Animazione M1SSION™ completata');
          
          // SLOGAN "IT IS POSSIBLE"
          sloganTimer = setTimeout(() => {
            if (!mountedRef.current) return;
            console.log('💫 Mostra slogan "IT IS POSSIBLE"');
            setShowSlogan(true);
            
            // DATA INIZIO
            dateTimer = setTimeout(() => {
              if (!mountedRef.current) return;
              console.log('📅 Mostra data inizio');
              setShowStartDate(true);
              
              // REDIRECT FINALE
              redirectTimer = setTimeout(() => {
                if (!mountedRef.current || hasRedirectedRef.current) return;
                
                console.log('🏠 Completamento animazione, redirect React Router to /home');
                hasRedirectedRef.current = true;
                setIsAnimationComplete(true);
                
                // Sicurezza sessionStorage
                sessionStorage.setItem('hasSeenPostLoginIntro', 'true');
                
                // 🚨 WOUTER DETERMINISTIC NAVIGATION
                console.log('🔥 [MISSION COMPLETE] Starting navigation to /home');
                setIsAnimationComplete(true);
                
                // DETERMINISTIC WOUTER NAVIGATION
                setTimeout(() => {
                  if (!mountedRef.current || hasRedirectedRef.current) {
                    console.log('⚠️ Navigation blocked - component unmounted or already redirected');
                    return;
                  }
                  
                  try {
                    console.log('🏠 [FINAL STEP] Wouter setLocation → /home');
                    setLocation('/home');
                    console.log('✅ [SUCCESS] Wouter navigation executed - App should show /home now');
                  } catch (error) {
                    console.error('❌ [ERROR] Wouter setLocation failed:', error);
                    // EMERGENCY FALLBACK - Force window navigation as last resort
                    console.log('🚨 [EMERGENCY] Using window.location as final fallback');
                    window.location.href = '/home';
                  }
                }, 200); // Slight delay to ensure DOM is ready
              }, 1500);
            }, 1000);
          }, 500);
        }
      };
      
      // Avvia la prima step
      animateStep();
    };
    
    // Delay iniziale per stabilità
    const startTimer = setTimeout(executeAnimation, 300);
    
    // Cleanup function
    return () => {
      console.log('🧹 Cleanup animazione M1SSION');
      mountedRef.current = false;
      clearTimeout(startTimer);
      clearTimeout(animationTimer);
      clearTimeout(sloganTimer);
      clearTimeout(dateTimer);
      clearTimeout(redirectTimer);
    };
  }, []);
  
  // 🚨 CRITICAL: Cleanup al unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      animationInProgressRef.current = false;
    };
  }, []);
  
  console.log('🖼️ Render PostLoginMissionIntro:', { 
    displayText, 
    showSlogan, 
    showStartDate,
    isAnimationComplete 
  });

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 🎯 M1SSION™ Text - POSIZIONAMENTO FISSO CHIRURGICO */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
          <span 
            className="text-[#00D1FF]" 
            style={{
              textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
            }}
          >
            {displayText.slice(0, 2)}
          </span>
          <span 
            className="text-white" 
            style={{
              textShadow: "0 0 5px rgba(255, 255, 255, 0.3)"
            }}
          >
            {displayText.slice(2)}
          </span>
        </motion.div>
        
        {/* 🎯 IT IS POSSIBLE - CENTRATO PERFETTO COLOR #BFA342 */}
        <AnimatePresence mode="wait">
          {showSlogan && (
            <motion.div
              key="slogan"
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
        
        {/* 🎯 Data di Inizio - CENTRATO PERFETTO */}
        <AnimatePresence mode="wait">
          {showStartDate && (
            <motion.div
              key="date"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
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