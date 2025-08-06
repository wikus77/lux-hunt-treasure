// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Advanced Retry Mechanism for Payment Processing

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  backoffMultiplier: number;
  maxDelay: number;
}

const defaultConfig: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000
};

export const useRetryMechanism = (config: Partial<RetryConfig> = {}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  
  const finalConfig = { ...defaultConfig, ...config };

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Operation'
  ): Promise<T> => {
    setIsRetrying(true);
    setAttemptCount(0);

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        setAttemptCount(attempt);
        const result = await operation();
        setIsRetrying(false);
        setAttemptCount(0);
        return result;
      } catch (error) {
        console.error(`${operationName} attempt ${attempt} failed:`, error);
        
        if (attempt === finalConfig.maxAttempts) {
          setIsRetrying(false);
          setAttemptCount(0);
          toast.error(`${operationName} failed after ${finalConfig.maxAttempts} attempts`);
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          finalConfig.initialDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
          finalConfig.maxDelay
        );

        toast.info(`${operationName} failed, retrying in ${delay / 1000}s...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error(`${operationName} failed after maximum attempts`);
  }, [finalConfig]);

  return {
    executeWithRetry,
    isRetrying,
    attemptCount,
    maxAttempts: finalConfig.maxAttempts
  };
};

export default useRetryMechanism;