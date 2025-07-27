// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import M1ssionRevealAnimation from '@/components/intro/M1ssionRevealAnimation';

interface WouterPostLoginTransitionProps {
  children: React.ReactNode;
}

const WouterPostLoginTransition: React.FC<WouterPostLoginTransitionProps> = ({ children }) => {
  const [location, navigate] = useLocation();
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(true);

  useEffect(() => {
    const checkAndShowAnimation = async () => {
      try {
        if (typeof window !== 'undefined') {
          const hasSeenPostLoginIntro = sessionStorage.getItem("hasSeenPostLoginIntro");
          const isHomePage = location === '/home' || location === '/';
          
          console.log("🎬 POST-LOGIN TRANSITION CHECK:", {
            location,
            hasSeenPostLoginIntro,
            isHomePage
          });
          
          // Only show animation if:
          // 1. We're on the home page or root
          // 2. Animation hasn't been shown in this session after login
          // 3. User just logged in (no session flag)
          if (isHomePage && !hasSeenPostLoginIntro) {
            console.log("🎬 M1SSION post-login animation: Starting intro animation...");
            setShowAnimation(true);
            setAnimationComplete(false);
          } else {
            console.log("🎬 M1SSION post-login animation: Skipping intro - already shown or wrong page", {
              isHomePage,
              hasSeenPostLoginIntro,
              currentPath: location
            });
            setShowAnimation(false);
            setAnimationComplete(true);
          }
        }
      } catch (error) {
        console.error("❌ Error accessing sessionStorage for M1SSION post-login:", error);
        setShowAnimation(false);
        setAnimationComplete(true);
      }
    };

    checkAndShowAnimation();
  }, [location]);

  const handleAnimationComplete = () => {
    try {
      if (typeof window !== 'undefined') {
        console.log("🏁 M1SSION post-login animation completed, navigating to /home");
        sessionStorage.setItem("hasSeenPostLoginIntro", "true");
      }
    } catch (error) {
      console.error("❌ Error setting sessionStorage for M1SSION post-login:", error);
    }
    setShowAnimation(false);
    setAnimationComplete(true);
    navigate('/home');
  };

  // Show animation if needed
  if (showAnimation && !animationComplete) {
    console.log("🎬 Rendering M1SSION post-login animation");
    return <M1ssionRevealAnimation onComplete={handleAnimationComplete} />;
  }

  // Show normal content
  return <>{children}</>;
};

export default WouterPostLoginTransition;