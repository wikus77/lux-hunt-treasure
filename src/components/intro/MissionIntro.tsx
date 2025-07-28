// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// COMPONENTE MISSION INTRO AUTONOMO - ANIMAZIONE DETERMINISTICA
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA BLINDATA

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

const MissionIntro = () => {
  const [displayText, setDisplayText] = useState('');
  const [showSlogan, setShowSlogan] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  
  const { navigate } = useWouterNavigation();
  
  // 🔒 CRITICAL: Refs per controllo lifecycle determinístico
  const mountedRef = useRef(true);
  const animationInProgressRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const emergencyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const animationSteps = ['M', 'M1', 'M1S', 'M1SS', 'M1SSI', 'M1SSIO', 'M1SSION', 'M1SSION™'];
  
  // 🚀 NAVIGAZIONE DETERMINISTICA FINALE
  const executeNavigation = () => {
    if (hasNavigatedRef.current || !mountedRef.current) {
      console.log('⚠️ Navigation already executed or component unmounted');
      return;
    }
    
    hasNavigatedRef.current = true;
    console.log('🏠 [MISSION COMPLETE] Navigation to /home');
    
    try {
      navigate('/home');
      console.log('✅ [SUCCESS] Navigation executed successfully');
    } catch (error) {
      console.error('❌ [ERROR] Navigation failed:', error);
      // EMERGENCY FALLBACK
      window.location.href = '/home';
    }
  };

  // 🎬 ANIMAZIONE PRINCIPALE BLINDATA
  useEffect(() => {
    console.log('🎬 MissionIntro: Inizializzazione animazione deterministica');
    
    if (animationInProgressRef.current) {
      console.log('⚠️ Animazione già in corso, skip...');
      return;
    }
    
    animationInProgressRef.current = true;
    
    // 🚨 TIMEOUT DI EMERGENZA - Se l'animazione non completa in 6s, forza redirect
    emergencyTimeoutRef.current = setTimeout(() => {
      if (!hasNavigatedRef.current && mountedRef.current) {
        console.log('🚨 [EMERGENCY] Animation timeout - forcing navigation');
        executeNavigation();
      }
    }, 6000);
    
    let currentStep = 0;
    
    const animateStep = () => {
      if (!mountedRef.current || currentStep >= animationSteps.length) {
        return;
      }
      
      console.log(`🔤 Step ${currentStep}: ${animationSteps[currentStep]}`);
      setDisplayText(animationSteps[currentStep]);
      currentStep++;
      
      if (currentStep < animationSteps.length) {
        setTimeout(animateStep, 200);
      } else {
        // 🎯 ANIMAZIONE M1SSION™ COMPLETATA
        console.log('✅ Animazione M1SSION™ completata - starting final sequence');
        
        // SLOGAN "IT IS POSSIBLE"
        setTimeout(() => {
          if (!mountedRef.current) return;
          console.log('💫 Mostra slogan "IT IS POSSIBLE"');
          setShowSlogan(true);
          
          // DATA INIZIO
          setTimeout(() => {
            if (!mountedRef.current) return;
            console.log('📅 Mostra data inizio');
            setShowStartDate(true);
            
            // COMPLETAMENTO E REDIRECT FINALE
            setTimeout(() => {
              if (!mountedRef.current) return;
              console.log('🎯 Animazione completata - executing navigation');
              setIsAnimationComplete(true);
              
              // Salva il flag di completamento
              sessionStorage.setItem('hasSeenPostLoginIntro', 'true');
              
              // NAVIGAZIONE FINALE DETERMINISTICA
              setTimeout(executeNavigation, 300);
              
            }, 1500); // Tempo per vedere la data
          }, 1000); // Tempo per vedere il slogan
        }, 600); // Tempo dopo il completamento di M1SSION™
      }
    };
    
    // Avvia animazione dopo stabilizzazione
    setTimeout(animateStep, 500);
    
    return () => {
      console.log('🧹 Cleanup MissionIntro');
      mountedRef.current = false;
      if (emergencyTimeoutRef.current) {
        clearTimeout(emergencyTimeoutRef.current);
      }
    };
  }, [navigate]);
  
  // 🚨 CRITICAL: Cleanup al unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      animationInProgressRef.current = false;
    };
  }, []);
  
  console.log('🖼️ Render MissionIntro:', { 
    displayText, 
    showSlogan, 
    showStartDate,
    isAnimationComplete 
  });

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden flex items-center justify-center"
         style={{ zIndex: 9999 }}>
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* 🎯 M1SSION™ Text - POSIZIONAMENTO ASSOLUTO CHIRURGICO */}
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

export default MissionIntro;