/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Developer Access Hook
 */

import { useState, useEffect } from "react";

export const useDeveloperAccess = () => {
  const [showDeveloperAccess, setShowDeveloperAccess] = useState(false);
  
  // Check for developer access on mount
  useEffect(() => {
    const checkAccess = () => {
      // Check for URL parameter to reset access
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('resetDevAccess') === 'true') {
        localStorage.removeItem('developer_access');
        console.log('Developer access reset via URL parameter');
      }
      
      const userAgent = navigator.userAgent;
      
      
      if (isMobile) {
        // Mobile users without access need to login
        setShowDeveloperAccess(true);
      } else if (!isMobile) {
        // Web users always see landing page
        setShowDeveloperAccess(false);
      }
    };
    
    checkAccess();
  }, []);

  return { showDeveloperAccess };
};