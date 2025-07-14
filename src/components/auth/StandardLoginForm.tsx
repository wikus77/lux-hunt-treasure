
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import FormField from './form-field';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '@/hooks/use-login';

interface StandardLoginFormProps {
  verificationStatus?: string | null;
}

export function StandardLoginForm({ verificationStatus }: StandardLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  // 🔧 CORREZIONE: Usa il hook di login reale che gestisce Supabase
  const { formData, errors, formError, isSubmitting, handleChange, handleSubmit } = useLogin();

  // Internal access control per limitare l'accesso
  const isDeveloperEmail = (email: string) => {
    return email.toLowerCase() === 'wikus77@hotmail.it';
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Controllo accesso limitato
    if (!isDeveloperEmail(formData.email)) {
      toast.error('Accesso temporaneamente limitato', {
        description: 'La registrazione è attualmente disabilitata'
      });
      return;
    }

    // 🔧 CORREZIONE: Usa il vero sistema di login Supabase
    try {
      await handleSubmit(e);
      // Il redirect sarà gestito automaticamente dal AuthProvider dopo login success
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Mostra errori di validazione */}
      {formError && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{formError}</p>
        </div>
      )}

      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="Inserisci la tua email"
        value={formData.email}
        onChange={handleChange}
        icon={<Mail className="h-4 w-4" />}
        required
        disabled={isSubmitting}
        autoComplete="email"
        error={errors.email}
      />

      <div className="space-y-2">
        <FormField
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Inserisci la password"
          value={formData.password}
          onChange={handleChange}
          icon={<Lock className="h-4 w-4" />}
          required
          disabled={isSubmitting}
          autoComplete="current-password"
          error={errors.password}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Autenticazione...' : 'Accedi'}
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
            Registrazione in preparazione
          </p>
        </div>
      </div>
    </form>
  );
}
