// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';

export const useM1ssionIntroAnimation = () => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const m1ssionIntroShown = localStorage.getItem("m1ssionIntroShown");
        if (!m1ssionIntroShown) {
          console.log("M1SSION intro animation: First time, showing animation...");
          setShowAnimation(true);
        } else {
          console.log("M1SSION intro animation: Already shown, skipping...");
          setShowAnimation(false);
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage for M1SSION intro:", error);
      setShowAnimation(false);
    }
  }, []);

  const completeAnimation = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem("m1ssionIntroShown", "true");
      }
    } catch (error) {
      console.error("Error setting localStorage for M1SSION intro:", error);
    }
    setShowAnimation(false);
  };

  return { showAnimation, completeAnimation };
};