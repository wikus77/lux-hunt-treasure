
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./black-hole-styles.css";

// Import dei componenti rifattorizzati
import SpaceDust from "./effects/SpaceDust";
import GravitationalRings from "./effects/GravitationalRings";
import BlackHoleFormation from "./effects/BlackHoleFormation";
import GravitationalLensing from "./effects/GravitationalLensing";
import EnergyFlash from "./effects/EnergyFlash";
import ParticleConvergence from "./effects/ParticleConvergence";
import LogoReveal from "./effects/LogoReveal";
import SkipButton from "./effects/SkipButton";
import BlackHole3DEffect from "./effects/BlackHole3DEffect";

interface BlackHoleRevealIntroProps {
  onComplete: () => void;
}

const BlackHoleRevealIntro: React.FC<BlackHoleRevealIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<number>(0);
  const [show3DEffect, setShow3DEffect] = useState<boolean>(false);
  const [isTransitioningOut, setIsTransitioningOut] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Control animation stages
  useEffect(() => {
    console.log("BlackHoleRevealIntro - montato");
    
    // Initialize sound if supported by browser
    try {
      audioRef.current = new Audio("/sounds/buzz.mp3");
      audioRef.current.volume = 0.4;
    } catch (err) {
      console.log("Audio initialization failed:", err);
    }
    
    // Initial black state
    const initialTimeout = setTimeout(() => {
      console.log("BlackHoleRevealIntro - avvio stage 1");
      setStage(1); // Start gravitational distortion
      setShow3DEffect(true); // Show 3D effect
      
      // Play sound effect
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log("Audio play error:", err));
      }
    }, 1000);
    
    // Auto-complete the entire animation after 9 seconds maximum
    const maxDurationTimeout = setTimeout(() => {
      console.log("BlackHoleRevealIntro - timeout massimo raggiunto");
      handleAnimationComplete();
    }, 9000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(maxDurationTimeout);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      console.log("BlackHoleRevealIntro - cleanup effect");
    };
  }, []);
  
  // Control animation sequence stages
  useEffect(() => {
    console.log("BlackHoleRevealIntro - stage corrente:", stage);
    
    if (stage === 0) {
      return; // Initial black stage, wait for the first timeout
    }
    
    if (stage === 1) {
      // Gravitational distortion phase
      const timeout = setTimeout(() => {
        console.log("BlackHoleRevealIntro - avvio stage 2");
        setStage(2); // Black hole formation
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 2) {
      // Black hole formation and implosion
      const timeout = setTimeout(() => {
        console.log("BlackHoleRevealIntro - avvio stage 3");
        setStage(3); // Implosion and flash
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 3) {
      // Flash and energy burst
      const timeout = setTimeout(() => {
        console.log("BlackHoleRevealIntro - avvio stage 4");
        setStage(4); // Logo emergence
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 4) {
      // Logo emergence and particles
      const timeout = setTimeout(() => {
        console.log("BlackHoleRevealIntro - avvio stage 5");
        setStage(5); // Final stabilization with glow
      }, 1200);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 5) {
      // Final glow and transition out
      const completeTimeout = setTimeout(() => {
        console.log("BlackHoleRevealIntro - avvio stage 6");
        setStage(6); // Start fade out
        setIsTransitioningOut(true); // Inizia transizione in uscita
      }, 1200);
      
      return () => clearTimeout(completeTimeout);
    }
    
    if (stage === 6) {
      // Fade out transition to landing page
      const fadeOutTimeout = setTimeout(() => {
        console.log("BlackHoleRevealIntro - animazione completata");
        handleAnimationComplete();
      }, 2000); // Aumentato per consentire l'effetto di dissolvenza
      
      return () => clearTimeout(fadeOutTimeout);
    }
  }, [stage]);

  // Gestione completa dell'animazione
  const handleAnimationComplete = () => {
    onComplete();
  };

  // Forza il debug per vedere su quale stage siamo
  useEffect(() => {
    const debugInterval = setInterval(() => {
      console.log("DEBUG - Current stage:", stage, "show3D:", show3DEffect);
    }, 2000);
    
    return () => clearInterval(debugInterval);
  }, [stage, show3DEffect]);

  return (
    <motion.div 
      className="black-hole-container"
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: isTransitioningOut ? 0 : 1 
      }}
      transition={{ 
        duration: isTransitioningOut ? 2.0 : 0, 
        ease: "easeInOut"
      }}
    >
      {/* Background space dust */}
      <SpaceDust />
      
      {/* 3D Black Hole Effect */}
      {show3DEffect && <BlackHole3DEffect stage={stage} visible={show3DEffect} />}
      
      {/* Effetti del buco nero e della distorsione gravitazionale */}
      <GravitationalRings stage={stage} />
      <BlackHoleFormation stage={stage} />
      <GravitationalLensing stage={stage} />
      <EnergyFlash stage={stage} />
      <ParticleConvergence stage={stage} />
      
      {/* Logo reveal with enhanced transition */}
      <motion.div
        animate={{
          y: isTransitioningOut ? [0, 20] : 0,
          scale: isTransitioningOut ? [1, 0.9] : 1,
          opacity: isTransitioningOut ? [1, 0] : 1
        }}
        transition={{
          duration: 2.0,
          ease: "easeInOut"
        }}
      >
        <LogoReveal stage={stage} />
      </motion.div>
      
      {/* Skip button with fade out */}
      <motion.div
        animate={{
          opacity: isTransitioningOut ? 0 : 1
        }}
        transition={{
          duration: 0.5
        }}
      >
        <SkipButton onClick={handleAnimationComplete} />
      </motion.div>
      
      {/* Debug info */}
      <div style={{ 
        position: 'absolute', 
        bottom: '10px', 
        left: '10px', 
        color: 'white', 
        fontSize: '10px',
        zIndex: 100,
        opacity: 0.5
      }}>
        Stage: {stage}
      </div>
      
      {/* Background transition gradient */}
      {isTransitioningOut && (
        <motion.div
          className="transition-gradient"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,1) 100%)',
            zIndex: 50,
            pointerEvents: 'none'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.0, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
};

export default BlackHoleRevealIntro;
