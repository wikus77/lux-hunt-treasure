
import { useState, useEffect } from 'react';
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
    // Skip verification if on bypass paths or in development mode
    if (shouldBypassCaptcha(window.location.pathname) || 
        process.env.NODE_ENV === 'development' || 
        window.location.hostname === 'localhost') {
      console.log("Bypassing Turnstile verification in development environment");
      setIsVerified(true);
      onSuccess?.({ success: true, bypass: true });
      return true;
    }

    if (!token) {
      setError('No token provided');
      onError?.('No token provided');
      return false;
    }

    setIsVerifying(true);
    setError(null);

    try {
      console.log("Verifying Turnstile token...");
      const { data, error: functionError } = await supabase.functions.invoke('verify-turnstile', {
        body: { token, action }
      });

      if (functionError) {
        console.error("Function error:", functionError);
        throw new Error(functionError.message || 'Failed to verify token');
      }

      if (!data?.success) {
        console.error("Verification failed:", data?.error || "Unknown error");
        throw new Error(data?.error || 'Verification failed');
      }

      console.log("Token verified successfully!");
      setIsVerified(true);
      onSuccess?.(data);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Verification failed';
      console.error("Error during verification:", errorMessage);
      setError(errorMessage);
      setIsVerified(false);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  // Per pagine che bypassano CAPTCHA, impostiamo immediatamente verified a true
  useEffect(() => {
    if (shouldBypassCaptcha(window.location.pathname) || 
        process.env.NODE_ENV === 'development' || 
        window.location.hostname === 'localhost') {
      console.log("Setting immediate verification bypass");
      setIsVerified(true);
    }
  }, []);

  return {
    isVerifying,
    isVerified,
    error,
    verifyToken
  };
};
