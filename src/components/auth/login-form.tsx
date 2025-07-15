
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
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Tutti i campi sono obbligatori');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 STANDARD LOGIN for:', email);
      
      const result = await login(email, password);
      
      console.log('🧠 LOGIN RESULT:', {
        success: result?.success,
        hasError: !!result?.error,
        hasSession: !!result?.session,
        errorMessage: result?.error?.message
      });
      
      if (result?.success) {
        console.log('✅ LOGIN SUCCESS - redirecting to /home');
        toast.success('Login effettuato con successo', {
          description: 'Benvenuto in M1SSION!'
        });
        
        setTimeout(() => {
          console.log('🔄 EXECUTING REDIRECT TO /home');
          navigate('/home', { replace: true });
        }, 1000);
      } else {
        console.error('❌ LOGIN FAILED:', result?.error);
        toast.error('Errore di login', {
          description: result?.error?.message || 'Verifica le tue credenziali'
        });
      }
    } catch (error: any) {
      console.error('❌ LOGIN EXCEPTION:', error);
      toast.error('Errore di login', {
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
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Accesso in corso...' : 'Accedi'}
        </Button>
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
            className="text-cyan-400 hover:text-cyan-300"
          >
            {isLoading ? 'Invio in corso...' : 'Invia nuovamente email di verifica'}
          </Button>
        </div>
      )}
    </form>
  );
}
