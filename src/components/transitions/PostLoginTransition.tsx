// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import M1ssionRevealAnimation from '@/components/intro/M1ssionRevealAnimation';

interface PostLoginTransitionProps {
  children: React.ReactNode;
}

const PostLoginTransition: React.FC<PostLoginTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(true);

  useEffect(() => {
    const checkAndShowAnimation = async () => {
      try {
        if (typeof window !== 'undefined') {
          const m1ssionPostLoginShown = sessionStorage.getItem("m1ssionPostLoginShown");
          const isHomePage = location.pathname === '/home';
          
          // Only show animation if:
          // 1. We're on the home page
          // 2. Animation hasn't been shown in this session
          // 3. User just logged in (no session flag)
          if (isHomePage && !m1ssionPostLoginShown) {
            console.log("M1SSION post-login animation: First time after login in this session, showing animation...");
            setShowAnimation(true);
            setAnimationComplete(false);
          } else {
            console.log("M1SSION post-login animation: Already shown or not home page, skipping...", {
              isHomePage,
              m1ssionPostLoginShown,
              currentPath: location.pathname
            });
            setShowAnimation(false);
            setAnimationComplete(true);
          }
        }
      } catch (error) {
        console.error("Error accessing sessionStorage for M1SSION post-login:", error);
        setShowAnimation(false);
        setAnimationComplete(true);
      }
    };

    checkAndShowAnimation();
  }, [location.pathname]);

  const handleAnimationComplete = () => {
    try {
      if (typeof window !== 'undefined') {
        // Use sessionStorage instead of localStorage so animation shows on each login
        sessionStorage.setItem("m1ssionPostLoginShown", "true");
      }
    } catch (error) {
      console.error("Error setting sessionStorage for M1SSION post-login:", error);
    }
    setShowAnimation(false);
    setAnimationComplete(true);
  };

  // Show animation if needed
  if (showAnimation && !animationComplete) {
    return <M1ssionRevealAnimation onComplete={handleAnimationComplete} />;
  }

  // Show normal content
  return <>{children}</>;
};

export default PostLoginTransition;