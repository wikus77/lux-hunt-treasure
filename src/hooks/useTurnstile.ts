
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { shouldBypassCaptcha } from '@/utils/turnstile';

interface UseTurnstileOptions {
  action?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  autoVerify?: boolean;
}

export const useTurnstile = (options: UseTurnstileOptions = {}) => {
  const { action = 'submit', onSuccess, onError, autoVerify = false } = options;
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // For pages that bypass CAPTCHA, automatically set verified to true
  useEffect(() => {
    if (shouldBypassCaptcha(window.location.pathname)) {
      console.log('Auto-bypassing Turnstile on developer path');
      setIsVerified(true);
      setToken('BYPASS_FOR_DEVELOPMENT');
      onSuccess?.({ success: true, bypass: true });
    }
  }, [onSuccess]);

  // Auto-verify if requested and token is available
  useEffect(() => {
    if (autoVerify && token && !isVerified && !isVerifying) {
      verifyToken(token).catch(console.error);
    }
  }, [token, autoVerify, isVerified, isVerifying]);

  const verifyToken = async (turnstileToken: string) => {
    // Skip verification if on bypass paths
    if (shouldBypassCaptcha(window.location.pathname)) {
      console.log('Bypassing verification on developer path');
      setIsVerified(true);
      onSuccess?.({ success: true, bypass: true });
      return true;
    }

    // Skip verification if token is a bypass token
    if (turnstileToken.startsWith('BYPASS_')) {
      console.log('Bypass token detected, skipping verification');
      setIsVerified(true);
      onSuccess?.({ success: true, bypass: true });
      return true;
    }

    // Without a token, allow functionality to continue as a failsafe
    if (!turnstileToken) {
      console.log('No token provided, but allowing functionality to continue');
      setIsVerified(true); // Allow functionality to continue
      onSuccess?.({ success: true, noToken: true });
      return true;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('verify-turnstile', {
        body: { token: turnstileToken, action }
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

  const setTurnstileToken = (newToken: string) => {
    setToken(newToken);
    return newToken;
  };

  return {
    isVerifying,
    isVerified,
    error,
    token,
    verifyToken,
    setTurnstileToken
  };
};
