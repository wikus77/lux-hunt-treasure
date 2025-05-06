
import React, { useEffect, useState } from 'react';
import './intro-overlay.css';

interface IntroOverlayProps {
  onComplete: () => void;
}

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    console.log("IntroOverlay mounted");
    document.body.style.overflow = "hidden"; // Blocca lo scroll durante l'intro
    
    // Hide overlay after 2 seconds
    const timer = setTimeout(() => {
      console.log("Starting fade out");
      setIsVisible(false);
      // After animation completes, call onComplete
      setTimeout(() => {
        console.log("Animation completed, calling onComplete");
        onComplete();
        document.body.style.overflow = "auto"; // Ripristina lo scroll
      }, 1000);
    }, 3000);

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
      </div>
    </div>
  );
};

export default IntroOverlay;
