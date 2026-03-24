
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import FormField from './form-field';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth';
import { saveFaceIDCredentials } from '@/hooks/useFaceIDLogin';
import { isFirstLoginDone } from '@/utils/postLoginRedirectFixed';

interface StandardLoginFormProps {
  verificationStatus?: string | null;
}

export function StandardLoginForm({ verificationStatus }: StandardLoginFormProps) {
  const { t } = useTranslation();
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
      toast.error(t('auth_all_fields_required'));
      return;
    }

    // Email format validation
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      toast.error(t('auth_invalid_email_format'));
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔐 SECURE LOGIN ATTEMPT');
      
      // Use DIRECT AuthContext login method with cleaned inputs
      const result = await login(cleanEmail, cleanPassword);

      if (!result.success) {
        console.error('❌ LOGIN ERROR');
        toast.error(t('auth_login_error'), {
          description: result.error?.message || t('auth_invalid_credentials'),
        });
        return;
      }

      console.log('✅ LOGIN SUCCESS - Emitting auth-success event');
      toast.success(t('auth_login_success'), {
        description: t('auth_welcome_m1ssion'),
      });

      // 🔐 FACE ID: Save BOTH tokens for future Face ID login (iOS native only)
      // This is NON-INVASIVE: only saves if on iOS native, no-op otherwise
      if (result.session?.access_token && result.session?.refresh_token) {
        saveFaceIDCredentials(result.session.access_token, result.session.refresh_token);
      }
      
      // Emit custom auth success event for PWA compatibility
      window.dispatchEvent(new CustomEvent('auth-success', { 
        detail: { timestamp: Date.now() } 
      }));
      
      // POST-LOGIN REDIRECT: First login (clean install) → mission-intro; else map/home
      let finalTarget: string;
      if (!isFirstLoginDone()) {
        finalTarget = '/mission-intro';
        console.log('🚀 [StandardLoginForm] REDIRECTING TO:', finalTarget, '(first login)');
        navigate(finalTarget);
      } else {
        const params = new URLSearchParams(window.location.search);
        const qRedirect = params.get('redirect');
        let target = qRedirect || '';
        if (!target) {
          try {
            target = localStorage.getItem('post_login_redirect') || '';
            if (target) localStorage.removeItem('post_login_redirect');
          } catch {}
        }
        finalTarget = target || '/map-3d-tiler';
        console.log('🚀 [StandardLoginForm] REDIRECTING TO:', finalTarget);
        navigate(finalTarget);
      }

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
      toast.error(t('auth_system_error'), {
        description: error.message || t('auth_unexpected_error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="email"
        label={t('auth_label_email')}
        type="email"
        placeholder={t('auth_placeholder_email')}
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
          label={t('auth_label_password')}
          type={showPassword ? "text" : "password"}
          placeholder={t('auth_placeholder_password')}
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
          {showPassword ? t('hide_password') : t('show_password')}
        </button>
      </div>

      <div className="space-y-3">
        {/* Pulsante Accedi */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-bold text-lg py-3 rounded-xl neon-button-cyan"
          disabled={isLoading}
        >
          {isLoading ? t('auth_loading') : t('auth_button_submit')}
        </Button>

        {/* Pulsante Registrati - ATTIVATO */}
        <Button
          type="button"
          onClick={() => navigate('/register')}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-bold text-lg py-3 rounded-xl transition-all duration-300"
          disabled={isLoading}
        >
          {t('auth_register_cta')}
        </Button>
      </div>
    </form>
  );
}

// 🔐 FIRMATO: BY JOSEPH MULÈ – CEO M1SSION KFT™
export default StandardLoginForm;
