import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { shouldBypassCaptcha } from '@/utils/turnstile';

interface UseTurnstileOptions {
  action?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  autoVerify?: boolean;
  userEmail?: string; // ✅ AGGIUNTO per bypass sviluppatore
}

export const useTurnstile = (options: UseTurnstileOptions = {}) => {
  const { action = 'submit', onSuccess, onError, autoVerify = false, userEmail } = options;
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Percorsi di debug o sviluppo per cui bypassa automaticamente Turnstile
  const debugPaths = ['/auth-debug', '/test-admin-ui'];

  // ✅ BYPASS SVILUPPATORE: Per email sviluppatore, automaticamente bypassiamo Turnstile
  useEffect(() => {
    // Verifichiamo se siamo su un percorso di debug o se dovremmo bypassare per qualche altro motivo
    const currentPath = window.location.pathname;
    const shouldBypass = debugPaths.includes(currentPath) || shouldBypassCaptcha(currentPath);
    
    // ✅ CONTROLLO EMAIL SVILUPPATORE
    const isDeveloper = userEmail === 'wikus77@hotmail.it';
    
    if (shouldBypass || isDeveloper) {
      if (isDeveloper) {
        console.log('🔑 DEVELOPER BYPASS: Auto-bypassing Turnstile for developer email:', userEmail);
        console.warn('⚠️ CAPTCHA/Turnstile neutralizzato per sviluppatore');
      } else {
        console.log('🔑 Auto-bypassing Turnstile on path:', currentPath);
      }
      setIsVerified(true);
      setToken('BYPASS_FOR_DEVELOPMENT');
      if (onSuccess) {
        onSuccess({ success: true, bypass: true, developer: isDeveloper });
      }
    }
  }, [onSuccess, userEmail]);

  // Auto-verify if requested and token is available
  useEffect(() => {
    if (autoVerify && token && !isVerified && !isVerifying && token !== 'BYPASS_FOR_DEVELOPMENT') {
      verifyToken(token).catch(err => {
        console.error('❌ Error auto-verifying token:', err);
        // Continuiamo anche con errori
        setIsVerified(true);
      });
    }
  }, [token, autoVerify, isVerified, isVerifying]);

  const verifyToken = async (turnstileToken: string) => {
    // ✅ CONTROLLO EMAIL SVILUPPATORE
    const isDeveloper = userEmail === 'wikus77@hotmail.it';
    if (isDeveloper) {
      console.log('🔑 DEVELOPER BYPASS: Skipping Turnstile verification for developer');
      console.warn('⚠️ Un\'altra funzione ha tentato di usare CAPTCHA con account sviluppatore - BLOCCATO');
      setIsVerified(true);
      if (onSuccess) {
        onSuccess({ success: true, bypass: true, developer: true });
      }
      return true;
    }

    // Controlla se siamo su un percorso di debug
    const currentPath = window.location.pathname;
    const shouldBypass = debugPaths.includes(currentPath) || shouldBypassCaptcha(currentPath);
    
    // Skip verification if on bypass paths
    if (shouldBypass) {
      console.log('🔑 Bypassing verification on path:', currentPath);
      setIsVerified(true);
      if (onSuccess) {
        onSuccess({ success: true, bypass: true });
      }
      return true;
    }

    // Skip verification if token is a bypass token
    if (turnstileToken && turnstileToken.startsWith('BYPASS_')) {
      console.log('🔑 Bypass token detected, skipping verification');
      setIsVerified(true);
      if (onSuccess) {
        onSuccess({ success: true, bypass: true });
      }
      return true;
    }

    // Without a token, allow functionality to continue as a failsafe
    if (!turnstileToken) {
      console.log('⚠️ No token provided, but allowing functionality to continue');
      setIsVerified(true); // Allow functionality to continue
      if (onSuccess) {
        onSuccess({ success: true, noToken: true });
      }
      return true;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('verify-turnstile', {
        body: { token: turnstileToken, action }
      });

      if (functionError) {
        console.warn('⚠️ Error from verify-turnstile function, but allowing functionality to continue:', functionError);
        setIsVerified(true);
        if (onSuccess) {
          onSuccess({ success: true, functionError: true });
        }
        return true;
      }

      if (!data?.success) {
        console.warn('⚠️ Verification returned not successful, but allowing functionality to continue:', data);
        setIsVerified(true);
        if (onSuccess) {
          onSuccess({ success: true, verification: false });
        }
        return true;
      }

      console.log('✅ Verification successful:', data);
      setIsVerified(true);
      if (onSuccess) {
        onSuccess(data);
      }
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Verification failed';
      console.warn('⚠️ Error during verification, but allowing functionality to continue:', errorMessage);
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
    // ✅ CONTROLLO EMAIL SVILUPPATORE
    const isDeveloper = userEmail === 'wikus77@hotmail.it';
    if (isDeveloper) {
      console.log("🔑 DEVELOPER BYPASS: Turnstile token ignored for developer");
      setToken('BYPASS_FOR_DEVELOPMENT');
      return 'BYPASS_FOR_DEVELOPMENT';
    }

    console.log("🔑 Turnstile token received:", newToken.substring(0, 10) + "...");
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
