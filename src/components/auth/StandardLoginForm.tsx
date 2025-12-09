
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import React, { useState } from 'react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import FormField from './form-field';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth';

interface StandardLoginFormProps {
  verificationStatus?: string | null;
}

export function StandardLoginForm({ verificationStatus }: StandardLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useWouterNavigation();
  const { login } = useAuthContext();

  // Input sanitization and validation utilities
  const sanitizeEmail = (email: string) => {
    return email.toLowerCase().trim().replace(/[^\w@.-]/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation and sanitization
    const cleanEmail = sanitizeEmail(email);
    const cleanPassword = password.trim();
    
    if (!cleanEmail || !cleanPassword) {
      toast.error('Tutti i campi sono obbligatori');
      return;
    }

    // Email format validation
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      toast.error('Formato email non valido');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔐 SECURE LOGIN ATTEMPT');
      
      // Use DIRECT AuthContext login method with cleaned inputs
      const result = await login(cleanEmail, cleanPassword);

      if (!result.success) {
        console.error('❌ LOGIN ERROR');
        toast.error('Errore di login', {
          description: result.error?.message || 'Credenziali non valide'
        });
        return;
      }

      console.log('✅ LOGIN SUCCESS - Emitting auth-success event');
      toast.success('Login effettuato con successo', {
        description: 'Benvenuto in M1SSION™!'
      });
      
      // Emit custom auth success event for PWA compatibility
      window.dispatchEvent(new CustomEvent('auth-success', { 
        detail: { timestamp: Date.now() } 
      }));
      
      // POST-LOGIN REDIRECT: Handle redirect params and localStorage
      const params = new URLSearchParams(window.location.search);
      const qRedirect = params.get('redirect');
      let target = qRedirect || '';
      if (!target) {
        try { 
          target = localStorage.getItem('post_login_redirect') || ''; 
          if (target) localStorage.removeItem('post_login_redirect'); 
        } catch {}
      }
      
      // If no specific redirect, go to home
      const finalTarget = target || '/home';
      console.log('🚀 [StandardLoginForm] REDIRECTING TO:', finalTarget);
      
      navigate(finalTarget);
      
      // PWA iOS Safari fallback
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        console.log('📱 PWA DETECTED - Setting up fallback redirect');
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            console.log('🔄 PRIMARY REDIRECT FAILED - Using window.location.href');
            window.location.href = finalTarget;
          }
        }, 800);
      }
    } catch (error: any) {
      console.error('💥 LOGIN EXCEPTION');
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

        {/* Pulsante Registrati - ATTIVATO */}
        <Button
          type="button"
          onClick={() => navigate('/register')}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-bold text-lg py-3 rounded-xl transition-all duration-300"
          disabled={isLoading}
        >
          Registrati - Accesso limitato
        </Button>
      </div>
    </form>
  );
}

// 🔐 FIRMATO: BY JOSEPH MULÈ – CEO M1SSION KFT™
export default StandardLoginForm;
