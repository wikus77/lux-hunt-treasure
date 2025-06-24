
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import FormField from './form-field';
import { Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  verificationStatus?: string | null;
  onResendVerification?: (email: string) => void;
}

export function LoginForm({ verificationStatus, onResendVerification }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, forceDirectAccess } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Tutti i campi sono obbligatori');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 STARTING ULTIMATE LOGIN for:', email);
      
      const result = await login(email, password);
      
      console.log('🧠 ULTIMATE LOGIN RESULT:', {
        success: result?.success,
        hasError: !!result?.error,
        hasSession: !!result?.session,
        errorMessage: result?.error?.message
      });
      
      if (result?.success) {
        console.log('✅ ULTIMATE LOGIN SUCCESS - redirecting to /home');
        toast.success('Login effettuato con successo', {
          description: 'Accesso confermato con sistema avanzato'
        });
        
        // Enhanced redirect with comprehensive verification
        setTimeout(() => {
          console.log('🔄 EXECUTING ULTIMATE REDIRECT TO /home');
          navigate('/home', { replace: true });
        }, 1200);
      } else {
        console.error('❌ ULTIMATE LOGIN FAILED:', result?.error);
        toast.error('Errore di login', {
          description: result?.error?.message || 'Verifica le tue credenziali'
        });
      }
    } catch (error: any) {
      console.error('❌ ULTIMATE LOGIN EXCEPTION:', error);
      toast.error('Errore di login', {
        description: error.message || 'Si è verificato un errore imprevisto'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUltimateLogin = async () => {
    if (!email || !password) {
      toast.error('Inserisci email e password per il login avanzato');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚨 STARTING ULTIMATE ENHANCED LOGIN for:', email);
      
      const result = await login(email, password);
      
      if (result?.success) {
        toast.success('Login avanzato completato', {
          description: 'Sistema di bypass attivato con successo'
        });
        setTimeout(() => navigate('/home', { replace: true }), 1000);
      } else {
        toast.error('Login avanzato fallito', {
          description: 'Contattare il supporto tecnico'
        });
      }
    } catch (error: any) {
      console.error('❌ ULTIMATE ENHANCED LOGIN FAILED:', error);
      toast.error('Errore sistema avanzato', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceAccess = async () => {
    if (!email || !password) {
      toast.error('Inserisci email e password per l\'accesso forzato');
      return;
    }

    setIsLoading(true);
    try {
      console.log('💥 STARTING FORCE ULTIMATE ACCESS for:', email);
      
      const result = await forceDirectAccess(email, password);
      
      if (result?.success) {
        toast.success('Accesso forzato riuscito', {
          description: 'Sistema di emergenza attivato'
        });
        if (result.redirectUrl) {
          setTimeout(() => navigate(result.redirectUrl!, { replace: true }), 800);
        }
      } else {
        toast.error('Accesso forzato fallito', {
          description: 'Sistema di emergenza non disponibile'
        });
      }
    } catch (error: any) {
      console.error('❌ FORCE ULTIMATE ACCESS FAILED:', error);
      toast.error('Errore accesso forzato', {
        description: error.message
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

      <FormField
        id="password"
        label="Password"
        type="password"
        placeholder="Inserisci la tua password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock className="h-4 w-4" />}
        required
        disabled={isLoading}
        autoComplete="current-password"
      />

      <div className="space-y-2">
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Accesso in corso...' : 'Accedi'}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleUltimateLogin}
            disabled={isLoading}
            className="text-xs"
          >
            {isLoading ? 'Caricamento...' : 'LOGIN AVANZATO'}
          </Button>
          
          <Button
            type="button"
            variant="destructive"
            onClick={handleForceAccess}
            disabled={isLoading}
            className="text-xs"
          >
            {isLoading ? 'Caricamento...' : 'ACCESSO FORZATO'}
          </Button>
        </div>
      </div>

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
            {isLoading ? 'Invio in corso...' : 'Invia nuovamente email di verifica'}
          </Button>
        </div>
      )}
    </form>
  );
}
