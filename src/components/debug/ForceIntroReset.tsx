// EMERGENCY RESET COMPONENT - Force clear all intro flags
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect } from 'react';

const ForceIntroReset: React.FC = () => {
  useEffect(() => {
    console.log("🔄 EMERGENCY RESET: Clearing all intro flags");
    
    try {
      if (typeof window !== 'undefined') {
        // Clear all intro-related flags
        localStorage.removeItem("hasSeenLaserIntro");
        localStorage.removeItem("hasSeenIntro");
        localStorage.removeItem("skipIntro");
        localStorage.removeItem("introStep");
        localStorage.removeItem("introShown");
        sessionStorage.removeItem("hasSeenIntro");
        sessionStorage.removeItem("hasSeenPostLoginIntro");
        
        console.log("✅ ALL INTRO FLAGS CLEARED - Refresh page to see laser intro");
        
        // Add a visual indicator
        const resetDiv = document.createElement('div');
        resetDiv.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #00E5FF;
          color: black;
          padding: 10px;
          border-radius: 5px;
          z-index: 10000;
          font-weight: bold;
        `;
        resetDiv.textContent = '✅ INTRO FLAGS RESET - Refresh to see laser intro';
        document.body.appendChild(resetDiv);
        
        setTimeout(() => {
          document.body.removeChild(resetDiv);
        }, 5000);
      }
    } catch (error) {
      console.error("Error in reset:", error);
    }
  }, []);

  return null;
};

export default ForceIntroReset;