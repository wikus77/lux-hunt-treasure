
import { useState, useCallback } from 'react';

export const useRetryLogic = (maxRetries: number = 3, retryInterval: number = 5000) => {
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [lastRetryTime, setLastRetryTime] = useState(0);
  
  const shouldRetry = useCallback(() => {
    if (retryAttempts >= maxRetries) {
      return false;
    }
    
    const now = Date.now();
    return now - lastRetryTime > retryInterval;
  }, [retryAttempts, lastRetryTime, maxRetries, retryInterval]);
  
  const incrementRetry = useCallback(() => {
    setRetryAttempts(prev => prev + 1);
    setLastRetryTime(Date.now());
    return retryAttempts + 1;
  }, [retryAttempts]);
  
  const resetRetry = useCallback(() => {
    setRetryAttempts(0);
    setLastRetryTime(0);
  }, []);
  
  return {
    retryAttempts,
    lastRetryTime,
    shouldRetry,
    incrementRetry,
    resetRetry,
    setRetryAttempts
  };
};
