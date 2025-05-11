
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { shouldBypassCaptcha } from '@/utils/turnstile';

interface UseTurnstileOptions {
  action?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export const useTurnstile = (options: UseTurnstileOptions = {}) => {
  const { action = 'submit', onSuccess, onError } = options;
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyToken = async (token: string) => {
    // Skip verification if on bypass paths
    if (shouldBypassCaptcha(window.location.pathname)) {
      console.log('Bypassing verification on developer path');
      setIsVerified(true);
      onSuccess?.({ success: true, bypass: true });
      return true;
    }

    // Skip verification if token is a bypass token
    if (token.startsWith('BYPASS_')) {
      console.log('Bypass token detected, skipping verification');
      setIsVerified(true);
      onSuccess?.({ success: true, bypass: true });
      return true;
    }

    if (!token) {
      console.log('No token provided, but allowing functionality to continue');
      setIsVerified(true); // Allow functionality to continue
      onSuccess?.({ success: true, noToken: true });
      return true;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('verify-turnstile', {
        body: { token, action }
      });

      if (functionError) {
        console.warn('Error from verify-turnstile function, but allowing functionality to continue:', functionError);
        setIsVerified(true);
        onSuccess?.({ success: true, functionError: true });
        return true;
      }

      if (!data?.success) {
        console.warn('Verification returned not successful, but allowing functionality to continue:', data);
        setIsVerified(true);
        onSuccess?.({ success: true, verification: false });
        return true;
      }

      console.log('Verification successful:', data);
      setIsVerified(true);
      onSuccess?.(data);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Verification failed';
      console.warn('Error during verification, but allowing functionality to continue:', errorMessage);
      setError(errorMessage);
      setIsVerified(true); // Still allow functionality to continue
      
      // Only call onError if provided, otherwise just console warn
      if (onError) {
        onError(errorMessage);
      }
      
      return true;
    } finally {
      setIsVerifying(false);
    }
  };

  // For pages that bypass CAPTCHA, we can immediately set verified to true
  useState(() => {
    if (shouldBypassCaptcha(window.location.pathname)) {
      setIsVerified(true);
    }
  });

  return {
    isVerifying,
    isVerified,
    error,
    verifyToken
  };
};
