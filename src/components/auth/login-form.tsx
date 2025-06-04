
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
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
  const { login } = useAuthContext();
  const navigate = useNavigate();

  // ✅ CONTROLLO EMAIL SVILUPPATORE - CAPTCHA COMPLETAMENTE DISATTIVATO
  const isDeveloperEmail = email === 'wikus77@hotmail.it';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Tutti i campi sono obbligatori');
      return;
    }

    // ✅ BYPASS COMPLETO per sviluppatore - NESSUN CAPTCHA
    if (isDeveloperEmail) {
      console.log('🔑 DEVELOPER BYPASS: Login form submission - CAPTCHA COMPLETAMENTE DISATTIVATO');
      console.warn('⚠️ Form login chiamato con account sviluppatore - CAPTCHA RIMOSSO');
      
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

    // Per altri utenti, procedi senza CAPTCHA
    setIsLoading(true);
    try {
      const result = await login(email, password);
      
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
        placeholder="Inserisci la tua email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail className="h-4 w-4" />}
        required
        disabled={isLoading}
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
      />

      {/* ✅ MESSAGGIO per sviluppatore - NESSUN CAPTCHA */}
      {isDeveloperEmail && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-md">
          <p className="text-sm text-green-400">
            🔑 Developer Access: CAPTCHA completamente disattivato
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
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
