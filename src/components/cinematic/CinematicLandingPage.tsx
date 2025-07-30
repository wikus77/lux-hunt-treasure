// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from "react";
import InkDropEffect from "./InkDropEffect";
import BlackHoleReveal from "./BlackHoleReveal";
import M1ssionTextReveal from "./M1ssionTextReveal";
import M1ssionInfoModal from "./M1ssionInfoModal";

const CinematicLandingPage: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<'loading' | 'inkDrop' | 'blackHole' | 'textReveal'>('loading');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Start the ink drop effect after a brief delay
    const timer = setTimeout(() => {
      setCurrentStage('inkDrop');
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleInkDropComplete = () => {
    console.log("🎬 Ink drop complete, starting black hole");
    setCurrentStage('blackHole');
  };

  const handleBlackHoleComplete = () => {
    console.log("🎬 Black hole complete, revealing text");
    setCurrentStage('textReveal');
  };

  const handleTextClick = () => {
    console.log("🎬 Text clicked, opening modal");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      {/* Initial state - white background */}
      {currentStage === 'loading' && (
        <div className="absolute inset-0 bg-white" />
      )}

      {/* Ink Drop Effect */}
      {currentStage === 'inkDrop' && (
        <InkDropEffect onComplete={handleInkDropComplete} />
      )}

      {/* Black Hole Effect */}
      {(currentStage === 'blackHole' || currentStage === 'textReveal') && (
        <div className="absolute inset-0 bg-black">
          <BlackHoleReveal onComplete={handleBlackHoleComplete} />
        </div>
      )}

      {/* Text Reveal */}
      {currentStage === 'textReveal' && (
        <div className="absolute inset-0 bg-black">
          {/* Keep black hole visible but less prominent */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div
              className="w-64 h-64 rounded-full"
              style={{
                background: "radial-gradient(circle, transparent 30%, rgba(0,0,0,0.9) 35%, black 40%)",
                boxShadow: "0 0 50px rgba(0,229,255,0.2)"
              }}
            />
          </div>
          <M1ssionTextReveal onTextClick={handleTextClick} />
        </div>
      )}

      {/* Info Modal */}
      <M1ssionInfoModal isOpen={showModal} onClose={handleCloseModal} />
    </div>
  );
};

export default CinematicLandingPage;
