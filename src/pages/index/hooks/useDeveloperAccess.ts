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
      
      // Enhanced mobile detection including Capacitor
      const isCapacitorApp = !!(window as any).Capacitor;
      const userAgent = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
      
      console.log('Index access check:', { isMobile, isCapacitorApp });
      
      // CORREZIONE CRITICA: Non mostrare developer access per mobile
      // L'app funziona sia su mobile che web
      console.log('🔄 Developer access redirecting to standard login');
      setShowDeveloperAccess(false);
    };
    
    checkAccess();
  }, []);

  return { showDeveloperAccess };
};