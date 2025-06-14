
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import FormField from './form-field';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// OFFICIAL DEVELOPER CREDENTIALS - SYNCHRONIZED
const DEVELOPER_EMAIL = 'wikus77@hotmail.it';
const DEVELOPER_PASSWORD = 'Wikus190877!@#';

interface StandardLoginFormProps {
  verificationStatus?: string | null;
}

export function StandardLoginForm({ verificationStatus }: StandardLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  // Auto-fill developer credentials for testing
  const fillDeveloperCredentials = () => {
    setEmail(DEVELOPER_EMAIL);
    setPassword(DEVELOPER_PASSWORD);
    toast.info('Credenziali developer compilate automaticamente');
    console.log('🔧 Developer credentials filled:', { email: DEVELOPER_EMAIL, passwordLength: DEVELOPER_PASSWORD.length });
  };

  // Enhanced login with session forcing capability
  const attemptLoginNoCapcha = async () => {
    console.log('🧪 TENTATIVO LOGIN-NO-CAPTCHA per developer');
    
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
      console.log('🔗 LOGIN-NO-CAPTCHA RESPONSE:', result);

      if (result.success && result.access_token && result.refresh_token) {
        console.log('✅ Tokens ricevuti, forzando sessione...');
        
        // Forza impostazione sessione con i token ricevuti
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token
        });

        if (sessionError) {
          console.error('❌ Errore setSession:', sessionError);
          throw new Error(`Errore setSession: ${sessionError.message}`);
        }

        if (sessionData.session) {
          console.log('✅ SESSIONE FORZATA CON SUCCESSO:', sessionData.session.user?.email);
          
          toast.success('Login developer riuscito', {
            description: 'Sessione forzata tramite login-no-captcha'
          });

          setTimeout(() => {
            navigate('/home', { replace: true });
          }, 1000);
          
          return { success: true, session: sessionData.session };
        }
      }

      throw new Error(result.error || 'Login-no-captcha fallito');

    } catch (error: any) {
      console.error('❌ LOGIN-NO-CAPTCHA FAILED:', error);
      return { success: false, error };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Tutti i campi sono obbligatori');
      return;
    }

    setIsLoading(true);
    console.log('🔐 LOGIN ATTEMPT:', { email, passwordLength: password.length, exactPassword: password });
    
    try {
      if (isRegistering) {
        // Registration flow
        console.log('📝 REGISTRATION FLOW for:', email);
        const result = await register(email, password);
        
        if (result?.success) {
          toast.success('Registrazione completata', {
            description: 'Controlla la tua email per verificare l\'account'
          });
          setIsRegistering(false);
        } else {
          console.error('❌ REGISTRATION FAILED:', result?.error);
          toast.error('Errore di registrazione', {
            description: result?.error?.message || 'Verifica i dati inseriti'
          });
        }
      } else {
        // Login flow - Enhanced for developer
        console.log('🔑 LOGIN FLOW for:', email, 'with password length:', password.length);
        
        // Try standard login first
        const result = await login(email, password);
        
        console.log('📊 LOGIN RESULT:', {
          success: result?.success,
          hasError: !!result?.error,
          hasSession: !!result?.session,
          errorMessage: result?.error?.message
        });
        
        if (result?.success) {
          console.log('✅ STANDARD LOGIN SUCCESS - redirecting to /home');
          toast.success('Login effettuato con successo', {
            description: 'Benvenuto in M1SSION!'
          });
          
          setTimeout(() => {
            navigate('/home', { replace: true });
          }, 1000);
        } else {
          console.error('❌ STANDARD LOGIN FAILED:', result?.error);
          
          // If this is the developer email and standard login failed, try login-no-captcha
          if (email === DEVELOPER_EMAIL && password === DEVELOPER_PASSWORD) {
            console.log('🔄 TENTATIVO FALLBACK LOGIN-NO-CAPTCHA per developer');
            
            toast.info('Tentativo login alternativo...', {
              description: 'Usando login-no-captcha per developer'
            });

            const fallbackResult = await attemptLoginNoCapcha();
            
            if (!fallbackResult?.success) {
              toast.error('Errore di login', {
                description: 'Entrambi i metodi di login sono falliti. Verifica le credenziali.'
              });
            }
          } else {
            toast.error('Errore di login', {
              description: result?.error?.message || 'Verifica le tue credenziali'
            });
          }
        }
      }
    } catch (error: any) {
      console.error('❌ AUTH ERROR:', error);
      toast.error('Errore di sistema', {
        description: error.message || 'Si è verificato un errore imprevisto'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Inserisci la tua email per ricevere il link di verifica');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resendVerificationEmail(email);
      
      if (result?.success) {
        toast.success('Email di verifica inviata', {
          description: 'Controlla la tua casella di posta'
        });
      } else {
        toast.error('Errore invio email', {
          description: result?.error || 'Riprova più tardi'
        });
      }
    } catch (error: any) {
      toast.error('Errore di sistema', {
        description: error.message || 'Riprova più tardi'
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
        placeholder="Inserisci la tua email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail className="h-4 w-4" />}
        required
        disabled={isLoading}
        autoComplete="email"
      />

      <div className="space-y-2">
        <FormField
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder={isRegistering ? "Crea una password sicura" : "Inserisci la tua password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="h-4 w-4" />}
          required
          disabled={isLoading}
          autoComplete={isRegistering ? "new-password" : "current-password"}
        />
        
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPassword ? 'Nascondi password' : 'Mostra password'}
        </button>
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Caricamento...' : isRegistering ? 'Registrati' : 'Accedi'}
        </Button>

        <button
          type="button"
          className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          onClick={() => setIsRegistering(!isRegistering)}
          disabled={isLoading}
        >
          {isRegistering ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
        </button>

        {/* Developer Quick Access Button */}
        <button
          type="button"
          className="w-full text-center text-xs text-green-400 hover:text-green-300 transition-colors border border-green-400/30 rounded py-2"
          onClick={fillDeveloperCredentials}
          disabled={isLoading}
        >
          🔧 Developer: Compila credenziali test
        </button>

        {/* Emergency Developer Login Button */}
        {email === DEVELOPER_EMAIL && password === DEVELOPER_PASSWORD && (
          <button
            type="button"
            className="w-full text-center text-xs text-orange-400 hover:text-orange-300 transition-colors border border-orange-400/30 rounded py-2"
            onClick={attemptLoginNoCapcha}
            disabled={isLoading}
          >
            🚨 Developer: Login Emergency (No-Captcha)
          </button>
        )}
      </div>

      {verificationStatus === 'pending' && (
        <div className="text-center mt-4">
          <p className="text-sm text-yellow-500 mb-2">
            Verifica in sospeso: controlla la tua email per completare la verifica.
          </p>
          <Button
            type="button"
            variant="link"
            onClick={handleResendVerification}
            disabled={isLoading}
            className="text-cyan-400 hover:text-cyan-300"
          >
            {isLoading ? 'Invio in corso...' : 'Invia nuovamente email di verifica'}
          </Button>
        </div>
      )}

      {verificationStatus === 'success' && (
        <div className="text-center mt-4">
          <p className="text-sm text-green-500">
            Email verificata con successo! Ora puoi accedere.
          </p>
        </div>
      )}
    </form>
  );
}
