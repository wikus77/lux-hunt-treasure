
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

  const isDeveloperEmail = email === 'wikus77@hotmail.it';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Tutti i campi sono obbligatori');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Starting login process for:', email);
      console.log('🧠 DEBUG - Is developer email:', email === 'wikus77@hotmail.it');
      
      const result = await login(email, password);
      
      console.log('🧠 DEBUG - Login result:', {
        success: result?.success,
        hasError: !!result?.error,
        hasSession: !!result?.session,
        errorMessage: result?.error?.message
      });
      
      if (result?.success) {
        console.log('✅ Login successful - redirecting to /home');
        toast.success('Login effettuato con successo');
        
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 100);
      } else {
        console.error('❌ Login failed:', result?.error);
        toast.error('Errore di login', {
          description: result?.error?.message || 'Verifica le tue credenziali'
        });
      }
    } catch (error: any) {
      console.error('❌ Login exception:', error);
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
        autoComplete="off"
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
        autoComplete="off"
      />

      {isDeveloperEmail && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md">
          <p className="text-sm text-red-400">
            🚨 EMERGENCY ACCESS: Direct session creation bypassing all validation
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Emergency Access...' : 'Accedi'}
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
            {isLoading ? 'Invio in corso...' : 'Invia nuovamente email di verifica'}
          </Button>
        </div>
      )}
    </form>
  );
}
