// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// MISSION INTRO DA ZERO - SAFARI iOS COMPATIBILE
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA COMPLETA

import { useState, useEffect, useRef } from 'react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

const MissionIntro = () => {
  console.log('🎬 [MISSION INTRO] Component initialized');
  
  const [displayText, setDisplayText] = useState('');
  const [showSlogan, setShowSlogan] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  const { navigate } = useWouterNavigation();
  const hasAnimatedOnce = useRef(false);
  const isMounted = useRef(true);
  
  const animationSteps = ['M', 'M1', 'M1S', 'M1SS', 'M1SSI', 'M1SSIO', 'M1SSION', 'M1SSION™'];
  
  useEffect(() => {
    console.log('🚀 [MISSION INTRO] useEffect triggered');
    console.log('🔍 [MISSION INTRO] DOM ready check:', !!document.body);
    console.log('🔍 [MISSION INTRO] hasAnimatedOnce:', hasAnimatedOnce.current);
    
    if (hasAnimatedOnce.current) {
      console.log('⚠️ [MISSION INTRO] Animation already started, skipping');
      return;
    }
    
    hasAnimatedOnce.current = true;
    console.log('✅ [MISSION INTRO] ANIMAZIONE START');
    
    // Step 1: Animate M1SSION™ text
    let stepIndex = 0;
    
    const animateText = () => {
      if (!isMounted.current || stepIndex >= animationSteps.length) {
        console.log('⚠️ [MISSION INTRO] Animation stopped - component unmounted or finished');
        return;
      }
      
      const currentText = animationSteps[stepIndex];
      console.log(`🔤 [MISSION INTRO] Step ${stepIndex}: "${currentText}"`);
      setDisplayText(currentText);
      stepIndex++;
      
      if (stepIndex < animationSteps.length) {
        setTimeout(animateText, 200);
      } else {
        console.log('✅ [MISSION INTRO] Text animation complete');
        // Step 2: Show slogan
        setTimeout(() => {
          if (!isMounted.current) return;
          console.log('💫 [MISSION INTRO] Showing slogan "IT IS POSSIBLE"');
          setShowSlogan(true);
          
          // Step 3: Show start date
          setTimeout(() => {
            if (!isMounted.current) return;
            console.log('📅 [MISSION INTRO] Showing start date');
            setShowStartDate(true);
            
            // Step 4: Complete and navigate
            setTimeout(() => {
              if (!isMounted.current) return;
              console.log('🏁 [MISSION INTRO] ANIMAZIONE END - Starting navigation');
              setAnimationComplete(true);
              
              // Save completion flag
              sessionStorage.setItem('hasSeenPostLoginIntro', 'true');
              
              // Navigate to home
              setTimeout(() => {
                if (!isMounted.current) return;
                console.log('🏠 [MISSION INTRO] NAVIGATE /home');
                
                try {
                  navigate('/home');
                  console.log('✅ [MISSION INTRO] Navigation successful');
                } catch (error) {
                  console.error('❌ [MISSION INTRO] Navigation failed:', error);
                  window.location.href = '/home';
                }
              }, 500);
              
            }, 1500); // Time to see the date
          }, 1000); // Time to see the slogan
        }, 800); // Time after M1SSION™ completes
      }
    };
    
    // Start animation after small delay for DOM stability
    setTimeout(() => {
      console.log('🎯 [MISSION INTRO] Starting text animation');
      animateText();
    }, 300);
    
    return () => {
      console.log('🧹 [MISSION INTRO] Cleanup');
      isMounted.current = false;
    };
  }, [navigate]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
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
          className="absolute text-7xl md:text-8xl lg:text-9xl font-orbitron tracking-wider"
          style={{ 
            fontWeight: 'normal', 
            fontFamily: 'Orbitron, monospace',
            top: '35%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            opacity: displayText ? 1 : 0,
            transition: 'opacity 0.3s ease'
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
            className="absolute text-xl md:text-2xl lg:text-3xl font-orbitron tracking-widest"
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
            className="absolute text-base md:text-lg lg:text-xl font-orbitron tracking-wider"
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