/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Error Recovery Hook
 */

import { useState, useEffect } from "react";

export const useErrorRecovery = () => {
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Recovery automatico in caso di problemi
  useEffect(() => {
    if (error && retryCount < 2) {
      const recoveryTimeout = setTimeout(() => {
        console.log(`⚠️ Tentativo di recovery automatico #${retryCount + 1}`);
        setError(null);
        setRetryCount(prev => prev + 1);
      }, 2000);
      
      return () => clearTimeout(recoveryTimeout);
    }
  }, [error, retryCount]);

  return { error, setError, retryCount };
};