
import React, { useEffect, useState } from 'react';
import './intro-overlay.css';

interface IntroOverlayProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete, onSkip }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    console.log("IntroOverlay mounted");
    document.body.style.overflow = "hidden"; // Blocca lo scroll durante l'intro
    
    // Extended the visibility time from 3 to 5 seconds
    const timer = setTimeout(() => {
      console.log("Starting fade out");
      setIsVisible(false);
      // Extended the fade out animation from 1 to 2 seconds
      setTimeout(() => {
        console.log("Animation completed, calling onComplete");
        onComplete();
        document.body.style.overflow = "auto"; // Ripristina lo scroll
      }, 2000); // Increased from 1000ms to 2000ms for fade out duration
    }, 5000); // Increased from 3000ms to 5000ms for display duration

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto"; // Ripristina lo scroll in caso di unmount
    };
  }, [onComplete]);

  return (
    <div className={`intro-overlay ${!isVisible ? 'fade-out' : ''}`}>
      <div className="intro-overlay-content">
        <div className="loading-spinner"></div>
        <h1 className="intro-logo">
          <span className="m1">M1</span><span className="ssion">SSION</span>
        </h1>
        <p className="intro-slogan glitch" data-text="IT IS POSSIBLE">IT IS POSSIBLE</p>
        <p className="intro-date">Inizio: 19-06-25</p>
        
        {/* Skip button */}
        {onSkip && (
          <button 
            onClick={onSkip} 
            className="absolute bottom-8 right-8 px-4 py-2 text-sm text-white/70 border border-white/30 
                      rounded-md hover:bg-white/10 transition-colors"
          >
            Salta intro
          </button>
        )}
      </div>
    </div>
  );
};

export default IntroOverlay;
