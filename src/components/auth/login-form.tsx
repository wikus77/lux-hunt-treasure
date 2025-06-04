import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { FormField } from './form-field';
import TurnstileWidget from '@/components/security/TurnstileWidget';
import { useTurnstile } from '@/hooks/useTurnstile';
import { shouldBypassCaptchaForUser } from '@/utils/turnstile';

interface LoginFormProps {
  verificationStatus?: string | null;
  onResendVerification?: (email: string) => void;
}

export function LoginForm({ verificationStatus, onResendVerification }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  // ✅ CONTROLLO EMAIL SVILUPPATORE per Turnstile
  const isDeveloperEmail = email === 'wikus77@hotmail.it';
  const shouldBypassCaptcha = shouldBypassCaptchaForUser(email);

  const { 
    isVerifying, 
    isVerified, 
    error: turnstileError, 
    token,
    setTurnstileToken 
  } = useTurnstile({
    action: 'login',
    userEmail: email, // ✅ Passa email per controllo sviluppatore
    onSuccess: (result) => {
      if (result.bypass || result.developer) {
        console.log('🔑 CAPTCHA bypassed for login:', result);
      }
    },
    onError: (error) => {
      if (!isDeveloperEmail) {
        toast.error('Verifica di sicurezza fallita', {
          description: error
        });
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Tutti i campi sono obbligatori');
      return;
    }

    // ✅ BYPASS COMPLETO per sviluppatore
    if (isDeveloperEmail) {
      console.log('🔑 DEVELOPER BYPASS: Login form submission - NESSUN CAPTCHA richiesto');
      console.warn('⚠️ Form login chiamato con account sviluppatore - CAPTCHA disattivato');
      
      setIsLoading(true);
      try {
        const result = await login(email, password);
        if (result?.success) {
          console.log('✅ Login sviluppatore completato dal form');
          // Il redirect è gestito automaticamente dalla funzione login
        } else {
          toast.error('Errore login sviluppatore', {
            description: result?.error?.message || 'Errore imprevisto'
          });
        }
      } catch (error: any) {
        toast.error('Errore login', {
          description: error.message || 'Errore imprevisto durante il login'
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Per altri utenti, richiedi CAPTCHA
    if (!isVerified && !shouldBypassCaptcha) {
      toast.error('Completa la verifica di sicurezza');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password, token || undefined);
      
      if (result?.success) {
        toast.success('Login effettuato con successo');
        navigate('/home');
      } else {
        toast.error('Errore durante il login', {
          description: result?.error?.message || 'Controlla le tue credenziali'
        });
      }
    } catch (error: any) {
      toast.error('Errore durante il login', {
        description: error.message || 'Si è verificato un errore imprevisto'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
      />

      {/* ✅ CONTROLLO: Mostra Turnstile solo se NON è sviluppatore */}
      {!isDeveloperEmail && !shouldBypassCaptcha && (
        <div className="mt-4">
          <TurnstileWidget 
            onVerify={setTurnstileToken}
            action="login"
          />
          {turnstileError && (
            <p className="text-sm text-red-500 mt-1">{turnstileError}</p>
          )}
        </div>
      )}

      {/* ✅ MESSAGGIO per sviluppatore */}
      {isDeveloperEmail && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-md">
          <p className="text-sm text-green-400">
            🔑 Developer Access: CAPTCHA disattivato
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || (isVerifying && !isDeveloperEmail) || (!isVerified && !shouldBypassCaptcha && !isDeveloperEmail)}
      >
        {isLoading ? 'Accesso in corso...' : 'Accedi'}
      </Button>

      {verificationStatus === 'pending' && (
        <div className="text-center mt-4">
          <p className="text-sm text-yellow-500">
            Verifica in sospeso: controlla la tua email per completare la verifica.
          </p>
        </div>
      )}

      {verificationStatus === 'success' && (
        <div className="text-center mt-4">
          <p className="text-sm text-green-500">
            Email verificata con successo!
          </p>
        </div>
      )}

      {verificationStatus === 'pending' && onResendVerification && (
        <div className="text-center mt-4">
          <Button
            type="button"
            variant="link"
            onClick={() => onResendVerification(email)}
            disabled={isLoading}
          >
            {isLoading ? 'Invio in corso...' : 'Reinvia email di verifica'}
          </Button>
        </div>
      )}
    </form>
  );
}
