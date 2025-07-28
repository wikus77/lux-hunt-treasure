// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// MISSION INTRO RICREATA DA ZERO - SAFARI iOS ULTRA COMPATIBILE
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA COMPLETA

import { useState, useEffect, useRef } from 'react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

const MissionIntro = () => {
  console.log('🎬 [MISSION INTRO] Component initialized - VERSIONE RICREATA');
  
  const [displayText, setDisplayText] = useState('');
  const [showSlogan, setShowSlogan] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  const { navigate } = useWouterNavigation();
  const mountedRef = useRef(true);
  const animationInProgressRef = useRef(false);
  
  const animationSteps = ['M', 'M1', 'M1S', 'M1SS', 'M1SSI', 'M1SSIO', 'M1SSION', 'M1SSION™'];
  
  useEffect(() => {
    console.log('🚀 [MISSION INTRO] useEffect triggered - DOM READY CHECK');
    console.log('🔍 [MISSION INTRO] DOM ready:', !!document.body);
    console.log('🔍 [MISSION INTRO] Animation in progress:', animationInProgressRef.current);
    
    if (animationInProgressRef.current) {
      console.log('⚠️ [MISSION INTRO] Animation already started, skipping');
      return;
    }
    
    animationInProgressRef.current = true;
    console.log('✅ [MISSION INTRO] ANIMAZIONE START');
    
    // Step 1: Animate M1SSION™ text with explicit timeouts
    let stepIndex = 0;
    
    const animateTextStep = () => {
      if (!mountedRef.current || stepIndex >= animationSteps.length) {
        console.log('⚠️ [MISSION INTRO] Animation stopped - component unmounted or finished');
        return;
      }
      
      const currentText = animationSteps[stepIndex];
      console.log(`🔤 [MISSION INTRO] Step ${stepIndex}: "${currentText}"`);
      setDisplayText(currentText);
      stepIndex++;
      
      if (stepIndex < animationSteps.length) {
        setTimeout(animateTextStep, 300); // Slower for Safari iOS
      } else {
        console.log('✅ [MISSION INTRO] Text animation complete');
        // Step 2: Show slogan
        setTimeout(() => {
          if (!mountedRef.current) return;
          console.log('💫 [MISSION INTRO] Showing slogan "IT IS POSSIBLE"');
          setShowSlogan(true);
          
          // Step 3: Show start date
          setTimeout(() => {
            if (!mountedRef.current) return;
            console.log('📅 [MISSION INTRO] Showing start date');
            setShowStartDate(true);
            
            // Step 4: Complete and navigate
            setTimeout(() => {
              if (!mountedRef.current) return;
              console.log('🏁 [MISSION INTRO] ANIMAZIONE END - Starting navigation');
              setAnimationComplete(true);
              
              // Save completion flag
              sessionStorage.setItem('hasSeenPostLoginIntro', 'true');
              
              // Navigate to home
              setTimeout(() => {
                if (!mountedRef.current) return;
                console.log('🏠 [MISSION INTRO] NAVIGATE /home');
                
                try {
                  navigate('/home');
                  console.log('✅ [MISSION INTRO] Navigation successful');
                } catch (error) {
                  console.error('❌ [MISSION INTRO] Navigation failed:', error);
                  window.location.href = '/home';
                }
              }, 500);
              
            }, 2000); // Time to see the date
          }, 1500); // Time to see the slogan
        }, 1000); // Time after M1SSION™ completes
      }
    };
    
    // Start animation immediately after small delay for DOM stability
    setTimeout(() => {
      console.log('🎯 [MISSION INTRO] Starting text animation');
      animateTextStep();
    }, 500); // Longer delay for Safari iOS
    
    // Emergency fallback - redirect after 8 seconds no matter what
    const emergencyFallback = setTimeout(() => {
      if (mountedRef.current && !animationComplete) {
        console.log('🚨 [MISSION INTRO] EMERGENCY FALLBACK - forcing navigation');
        try {
          navigate('/home');
        } catch (error) {
          window.location.href = '/home';
        }
      }
    }, 8000);
    
    return () => {
      console.log('🧹 [MISSION INTRO] Cleanup');
      mountedRef.current = false;
      clearTimeout(emergencyFallback);
    };
  }, [navigate]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  console.log('🖼️ [MISSION INTRO] Render:', { 
    displayText, 
    showSlogan, 
    showStartDate, 
    animationComplete 
  });

  return (
    <div 
      className="fixed inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden"
      style={{ 
        zIndex: 9999,
        minHeight: '100vh',
        minWidth: '100vw'
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* M1SSION™ Text */}
        <div
          className="absolute text-6xl md:text-7xl lg:text-8xl font-orbitron tracking-wider"
          style={{ 
            fontWeight: 'normal', 
            fontFamily: 'Orbitron, monospace',
            top: '35%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            opacity: displayText ? 1 : 0,
            transition: 'opacity 0.5s ease'
          }}
        >
          <span 
            style={{
              color: '#00D1FF',
              textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
            }}
          >
            {displayText.slice(0, 2)}
          </span>
          <span 
            style={{
              color: 'white',
              textShadow: "0 0 5px rgba(255, 255, 255, 0.3)"
            }}
          >
            {displayText.slice(2)}
          </span>
        </div>
        
        {/* IT IS POSSIBLE */}
        {showSlogan && (
          <div
            className="absolute text-lg md:text-xl lg:text-2xl font-orbitron tracking-widest"
            style={{ 
              fontWeight: 'normal',
              color: '#BFA342',
              top: '52%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              textShadow: "0 0 8px rgba(191, 163, 66, 0.4)",
              opacity: showSlogan ? 1 : 0,
              transition: 'opacity 0.8s ease'
            }}
          >
            IT IS POSSIBLE
          </div>
        )}
        
        {/* Start Date */}
        {showStartDate && (
          <div
            className="absolute text-sm md:text-base lg:text-lg font-orbitron tracking-wider"
            style={{ 
              fontWeight: 'normal',
              color: '#FFD700',
              top: '65%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              textShadow: "0 0 6px rgba(255, 215, 0, 0.4)",
              opacity: showStartDate ? 1 : 0,
              transition: 'opacity 0.6s ease'
            }}
          >
            Inizio: 19-06-25
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionIntro;