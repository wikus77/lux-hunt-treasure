
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';

// OFFICIAL DEVELOPER CREDENTIALS - SYNCHRONIZED
const DEVELOPER_EMAIL = 'wikus77@hotmail.it';
const DEVELOPER_PASSWORD = 'Wikus190877!@#';

interface LoginControllerProps {
  onCredentialsFill: (email: string, password: string) => void;
  email: string;
  password: string;
}

export function LoginController({ onCredentialsFill, email, password }: LoginControllerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login, forceSessionFromTokens } = useUnifiedAuth();
  const navigate = useNavigate();

  const fillDeveloperCredentials = () => {
    onCredentialsFill(DEVELOPER_EMAIL, DEVELOPER_PASSWORD);
    toast.info('Credenziali developer compilate automaticamente');
    console.log('🔧 Developer credentials filled:', { email: DEVELOPER_EMAIL, passwordLength: DEVELOPER_PASSWORD.length });
  };

  const testCredenzialiDeveloper = async () => {
    console.log('🧪 TEST CREDENZIALI DEVELOPER...');
    setIsLoading(true);
    
    try {
      const result = await login(DEVELOPER_EMAIL, DEVELOPER_PASSWORD);
      
      if (result.success && result.session) {
        console.log('✅ TEST DEVELOPER LOGIN SUCCESS');
        toast.success('Test developer riuscito!', {
          description: 'Login completato con successo'
        });
        
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 1000);
        
        return true;
      } else {
        console.error('❌ TEST DEVELOPER LOGIN FAILED:', result.error);
        toast.error('Test developer fallito', { 
          description: result.error?.message || 'Credenziali non valide' 
        });
        return false;
      }
    } catch (error: any) {
      console.error('💥 TEST DEVELOPER EXCEPTION:', error);
      toast.error('Errore test developer', { description: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testEmergencyLogin = async () => {
    console.log('🚨 TEST EMERGENCY LOGIN...');
    setIsLoading(true);
    
    try {
      const response = await fetch(`https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/login-no-captcha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk`
        },
        body: JSON.stringify({ email: DEVELOPER_EMAIL })
      });

      const result = await response.json();
      console.log('🔗 EMERGENCY LOGIN RESULT:', result);

      if (result.success && result.access_token && result.refresh_token) {
        console.log('✅ EMERGENCY LOGIN: Tokens received, setting session...');
        
        const sessionSet = await forceSessionFromTokens(result.access_token, result.refresh_token);
        
        if (sessionSet) {
          console.log('✅ EMERGENCY LOGIN: Session set successfully');
          toast.success('Emergency login riuscito!', {
            description: 'Sessione forzata tramite edge function'
          });

          setTimeout(() => {
            navigate('/home', { replace: true });
          }, 1000);
          
          return true;
        }
      }

      throw new Error(result.error || 'Emergency login fallito');

    } catch (error: any) {
      console.error('❌ EMERGENCY LOGIN FAILED:', error);
      toast.error('Emergency login fallito', { description: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testSetSessionPersistente = async () => {
    console.log('💾 TEST SET SESSION PERSISTENTE...');
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session) {
        const persistentSet = await forceSessionFromTokens(
          sessionData.session.access_token,
          sessionData.session.refresh_token
        );
        
        if (persistentSet) {
          // Verify localStorage
          const stored = localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token');
          const hasToken = !!stored && stored.includes('access_token');
          
          console.log('💾 SESSION PERSISTENCE TEST:', { 
            sessionSet: persistentSet,
            hasLocalStorage: hasToken 
          });
          
          toast.success('Test persistenza completato', {
            description: `LocalStorage: ${hasToken ? 'OK' : 'MANCANTE'}`
          });
          
          return hasToken;
        }
      } else {
        toast.warning('Nessuna sessione attiva per test persistenza');
        return false;
      }
    } catch (error: any) {
      console.error('💥 TEST PERSISTENCE EXCEPTION:', error);
      toast.error('Errore test persistenza', { description: error.message });
      return false;
    }
  };

  const testRedirectHome = () => {
    console.log('🔄 TEST REDIRECT HOME...');
    const currentPath = window.location.pathname;
    
    if (currentPath === '/home') {
      toast.success('Test redirect: già su /home');
      return true;
    } else {
      console.log('🔄 EXECUTING REDIRECT TO /home from:', currentPath);
      navigate('/home', { replace: true });
      
      setTimeout(() => {
        const newPath = window.location.pathname;
        toast.info(`Redirect eseguito: ${currentPath} → ${newPath}`);
      }, 500);
      
      return true;
    }
  };

  return {
    fillDeveloperCredentials,
    testCredenzialiDeveloper,
    testEmergencyLogin,
    testSetSessionPersistente,
    testRedirectHome,
    isLoading
  };
}
