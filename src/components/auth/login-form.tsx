
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

interface LoginFormProps {
  verificationStatus?: string | null;
  onResendVerification?: (email: string) => Promise<void>;
}

export function LoginForm({ verificationStatus, onResendVerification }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthContext();

  const handleLogin = async (email: string, password?: string) => {
    const isCapacitor = Capacitor.isNativePlatform();

    try {
      if (isCapacitor && email === 'wikus77@hotmail.it') {
        console.log("🔧 Developer login via Capacitor bypass");
        const res = await fetch('https://vkjrqirvdvjbemsfzxof.functions.supabase.co/login-no-captcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (data?.token) {
          window.location.href = data.token;
          return;
        }

        throw new Error('Errore login sviluppatore');
      }

      // Standard login flow
      if (password) {
        await login(email, password);
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin + '/home',
          },
        });

        if (error) throw error;
        
        toast.success("Controlla la tua email", {
          description: "Ti abbiamo inviato un link per accedere"
        });
      }
    } catch (err: any) {
      console.error('Errore login:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await handleLogin(email, showPassword ? password : undefined);
    } catch (error: any) {
      toast.error("Errore durante l'accesso", {
        description: error.message || "Controlla le tue credenziali e riprova"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Inserisci la tua email");
      return;
    }

    if (onResendVerification) {
      await onResendVerification(email);
    }
  };

  return (
    <div className="space-y-6">
      {verificationStatus === 'pending' && (
        <Alert className="border-orange-200 bg-orange-50">
          <Mail className="h-4 w-4" />
          <AlertDescription className="text-orange-800">
            Controlla la tua email per il link di verifica.
            <Button
              variant="link"
              onClick={handleResendVerification}
              className="p-0 h-auto text-orange-600 hover:text-orange-700 ml-1"
            >
              Invia di nuovo
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/50 border-gray-700 text-white placeholder:text-gray-400"
            placeholder="la-tua-email@esempio.com"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="showPassword" className="text-sm text-gray-300">
            Usa password invece di magic link
          </Label>
        </div>

        {showPassword && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border-gray-700 text-white placeholder:text-gray-400"
              placeholder="La tua password"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Accesso in corso...
            </>
          ) : (
            'Accedi'
          )}
        </Button>

        {!showPassword && (
          <p className="text-xs text-gray-400 text-center">
            Ti invieremo un link sicuro via email per accedere
          </p>
        )}

        <div className="text-center space-y-2">
          <Link 
            to="/reset-password" 
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Password dimenticata?
          </Link>
        </div>
      </form>
    </div>
  );
}
