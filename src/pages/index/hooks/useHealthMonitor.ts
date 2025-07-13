/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Health Monitor Hook
 */

import { useEffect } from "react";

export const useHealthMonitor = (
  renderContent: boolean, 
  pageLoaded: boolean, 
  setError: (error: Error) => void
) => {
  // Controllo periodico della salute del componente
  useEffect(() => {
    const healthCheckTimeout = setTimeout(() => {
      if (!renderContent && pageLoaded) {
        console.warn("❌ Health check fallito: contenuto non renderizzato dopo 8 secondi");
        setError(new Error("Timeout di rendering del contenuto"));
      }
    }, 8000);
    
    return () => clearTimeout(healthCheckTimeout);
  }, [renderContent, pageLoaded, setError]);
};