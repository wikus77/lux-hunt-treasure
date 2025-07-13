
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import FormField from './form-field';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface StandardLoginFormProps {
  verificationStatus?: string | null;
}

export function StandardLoginForm({ verificationStatus }: StandardLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Developer Access Override - Solo per wikus77@hotmail.it
  const isDeveloperEmail = (email: string) => {
    return email.toLowerCase() === 'wikus77@hotmail.it';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Tutti i campi sono obbligatori');
      return;
    }

    setIsLoading(true);
    console.log('🔐 M1SSION™ LOGIN ATTEMPT:', { email, isDeveloper: isDeveloperEmail(email) });
    
    try {
      // Controllo accesso sviluppatore
      if (isDeveloperEmail(email)) {
        console.log('✅ DEVELOPER ACCESS GRANTED for:', email);
        toast.success('Accesso sviluppatore autorizzato', {
          description: 'Benvenuto in M1SSION™!'
        });
        
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 1000);
      } else {
        // Blocco accesso per tutti gli altri utenti
        console.log('❌ ACCESS DENIED for:', email);
        toast.error('Accesso temporaneamente limitato', {
          description: 'La registrazione è attualmente disabilitata'
        });
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
          placeholder="Inserisci la password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="h-4 w-4" />}
          required
          disabled={isLoading}
          autoComplete="current-password"
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
        {/* Pulsante Accedi */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-bold text-lg py-3 rounded-xl neon-button-cyan"
          disabled={isLoading}
        >
          {isLoading ? 'Caricamento...' : 'Accedi'}
        </Button>

        {/* Pulsante Registrati - DISABILITATO */}
        <Button
          type="button"
          className="w-full bg-gray-600/30 text-gray-400 font-bold text-lg py-3 rounded-xl cursor-not-allowed"
          disabled={true}
        >
          Registrati - Accesso limitato
        </Button>

        {/* Messaggio di accesso limitato */}
        <div className="text-center p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            🔒 Accesso temporaneamente limitato
          </p>
          <p className="text-yellow-300 text-xs mt-1">
            Solo accesso sviluppatore autorizzato
          </p>
        </div>
      </div>
    </form>
  );
}
