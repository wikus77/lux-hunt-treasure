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
      }
      
      // Enhanced mobile detection including Capacitor
      const isCapacitorApp = !!(window as any).Capacitor;
      const userAgent = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
      
      // DISABILITATO: Permetti sempre la visualizzazione della Landing Page
      // La landing deve essere sempre visibile per utenti anonimi
      setShowDeveloperAccess(false);
    };
    
    checkAccess();
  }, []);

  return { showDeveloperAccess };
};