
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
      const { data, error: functionError } = await supabase.functions.invoke('verify-turnstile', {
        body: { token, action }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to verify token');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Verification failed');
      }

      setIsVerified(true);
      onSuccess?.(data);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Verification failed';
      setError(errorMessage);
      setIsVerified(false);
      onError?.(errorMessage);
      return false;
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
