// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import InkDropEffect from './InkDropEffect';
import BlackHoleEffect from './BlackHoleEffect';
import M1ssionTextReveal from './M1ssionTextReveal';
import M1ssionInfoModal from './M1ssionInfoModal';

const CinematicLandingPage: React.FC = () => {
  const [phase, setPhase] = useState<'loading' | 'inkdrop' | 'blackhole' | 'reveal' | 'interactive'>('loading');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  console.log('🎬 CINEMATIC LANDING: Component mounted, phase:', phase);
  
  useEffect(() => {
    // Start the cinematic sequence
    const timer = setTimeout(() => {
      console.log('🎬 CINEMATIC LANDING: Starting ink drop phase');
      setPhase('inkdrop');
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleInkDropComplete = () => {
    console.log('🎬 CINEMATIC LANDING: Ink drop complete, starting black hole');
    setPhase('blackhole');
  };
  
  const handleBlackHoleComplete = () => {
    console.log('🎬 CINEMATIC LANDING: Black hole complete, revealing text');
    setPhase('reveal');
    
    // Auto transition to interactive
    setTimeout(() => {
      console.log('🎬 CINEMATIC LANDING: Entering interactive phase');
      setPhase('interactive');
    }, 1000);
  };
  
  const handleTextClick = () => {
    console.log('🎬 CINEMATIC LANDING: Text clicked, opening modal');
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    console.log('🎬 CINEMATIC LANDING: Modal closed');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-radial from-gray-900 via-black to-black" />
      
      {/* Ink Drop Effect */}
      {phase === 'inkdrop' && (
        <InkDropEffect onComplete={handleInkDropComplete} />
      )}
      
      {/* Black Hole Effect */}
      <BlackHoleEffect 
        isVisible={phase === 'blackhole'} 
        onComplete={handleBlackHoleComplete} 
      />
      
      {/* Text Reveal */}
      <M1ssionTextReveal 
        isVisible={phase === 'reveal' || phase === 'interactive'} 
        onTextClick={handleTextClick}
      />
      
      {/* Info Modal */}
      <M1ssionInfoModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
      />
      
      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 text-white text-sm bg-black/50 p-2 rounded z-50">
          Phase: {phase}
        </div>
      )}
    </div>
  );
};

export default CinematicLandingPage;