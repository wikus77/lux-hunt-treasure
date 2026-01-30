// Pagina di autenticazione (Login/Register)
// 🔧 FIX v12: Converted to Dialog Modal style with neon glass container
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Shield, ArrowRight } from 'lucide-react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useAuth } from '@/hooks/use-auth';
import { usePWAHardwareStub } from '@/hooks/usePWAHardwareStub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  email: string;
  password: string;
  fullName: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  general?: string;
}

const LoginPage: React.FC = () => {
  const { navigate } = useWouterNavigation();
  const searchParams = new URLSearchParams(window.location.search);
  const { login, register, user, isLoading: authLoading } = useAuth();
  const { vibrate } = usePWAHardwareStub();
  const { toast } = useToast();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  // Redirect se già autenticato
  useEffect(() => {
    if (user && !authLoading) {
      const redirectTo = searchParams.get('redirect') || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [user, authLoading, navigate, searchParams]);

  // Validazione form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email
    if (!formData.email) {
      newErrors.email = 'Email richiesta';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password richiesta';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password di almeno 6 caratteri';
    }

    // Campi registrazione
    if (!isLoginMode) {
      if (!formData.fullName) {
        newErrors.fullName = 'Nome richiesto';
      } else if (formData.fullName.length < 2) {
        newErrors.fullName = 'Nome di almeno 2 caratteri';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Conferma password richiesta';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Le password non corrispondono';
      }

      // ToS acceptance (solo registrazione)
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Devi accettare i Termini di Servizio e Privacy Policy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestione submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      vibrate(200);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (isLoginMode) {
        // Login
        const { error } = await login(formData.email, formData.password);
        
        if (error) {
          setErrors({ general: getErrorMessage(error.message) });
          vibrate(300);
          return;
        }

        toast({
          title: 'Accesso Effettuato',
          description: 'Benvenuto in M1SSION™'
        });
        
        vibrate(100);
        
      } else {
        // Registrazione
        const { error } = await register(formData.email, formData.password);
        
        if (error) {
          setErrors({ general: getErrorMessage(error.message) });
          vibrate(300);
          return;
        }

        toast({
          title: 'Registrazione Completata',
          description: 'Benvenuto Agente! Accesso automatico in corso...'
        });
        
        vibrate(100);
      }
      
    } catch (error: any) {
      console.error('Errore autenticazione:', error);
      setErrors({ general: 'Errore di connessione. Riprova.' });
      vibrate(300);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestione input - supporta sia string che boolean
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Rimuovi errore del campo quando l'utente inizia a digitare
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Switch login/register
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: '',
      acceptTerms: false
    });
    setErrors({});
    vibrate(50);
  };

  // Genera codice agente
  const generateAgentCode = (): string => {
    const prefix = 'AG-';
    const randomNum = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `${prefix}${randomNum}`;
  };

  // Messaggi errore user-friendly
  const getErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Email o password non corretti';
    }
    if (errorMessage.includes('User already registered')) {
      return 'Email già registrata. Prova ad accedere.';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'Email non verificata. Controlla la tua casella email.';
    }
    return 'Errore imprevisto. Riprova.';
  };

  if (authLoading) {
    // 🔧 FIX v11: Use createPortal for loading state too
    return createPortal(
      <div className="fixed inset-0 bg-background z-[100] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>,
      document.body
    );
  }

  // 🔧 FIX v12: Dialog Modal Style - Centered card with backdrop
  // Matches M1UnitsShopModal visual style with neon glass container
  return createPortal(
    <div 
      className="fixed inset-0 z-[100]"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 16px), 16px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)',
        paddingLeft: '16px',
        paddingRight: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,209,255,0.08),transparent_60%)] pointer-events-none" />
      
      {/* Modal Card with entrance animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md my-auto"
      >
        {/* Neon glass container */}
        <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-[#00D1FF] via-[#7C3AED] to-[#00D1FF] shadow-[0_0_30px_rgba(124,58,237,0.35)]">
          <div className="rounded-2xl bg-black/95 backdrop-blur-xl p-6">
            
            {/* Logo/Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#00D1FF]/20 to-[#7C3AED]/20 border border-[#00D1FF]/30 mb-4">
                <Shield className="w-8 h-8 text-[#00D1FF]" />
              </div>
              <h1 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-[#00D1FF] to-[#7C3AED] bg-clip-text text-transparent mb-1">
                M1SSION™
              </h1>
              <p className="text-white/60 text-sm">
                {isLoginMode ? 'Accedi alla missione' : 'Unisciti agli agenti'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="agente@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00D1FF]/50 ${errors.email ? 'border-red-500/50' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Nome (solo registrazione) */}
              <AnimatePresence>
                {!isLoginMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <Label htmlFor="fullName" className="text-white/80">Nome Agente</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Il tuo nome"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00D1FF]/50 ${errors.fullName ? 'border-red-500/50' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-red-400">{errors.fullName}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00D1FF]/50 ${errors.password ? 'border-red-500/50' : ''}`}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-white/40 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Conferma Password (solo registrazione) */}
              <AnimatePresence>
                {!isLoginMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <Label htmlFor="confirmPassword" className="text-white/80">Conferma Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00D1FF]/50 ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-white/40 hover:text-white"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ToS Checkbox (solo registrazione) */}
              <AnimatePresence>
                {!isLoginMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        id="acceptTerms"
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-white/30 bg-white/5 focus:ring-[#00D1FF]"
                        disabled={isLoading}
                      />
                      <Label htmlFor="acceptTerms" className="text-sm leading-relaxed cursor-pointer text-white/70">
                        Accetto i{' '}
                        <button type="button" className="text-[#00D1FF] hover:underline" onClick={() => window.open('/terms', '_blank')}>
                          Termini di Servizio
                        </button>
                        {' '}e la{' '}
                        <button type="button" className="text-[#00D1FF] hover:underline" onClick={() => window.open('/privacy-policy', '_blank')}>
                          Privacy Policy
                        </button>
                      </Label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-sm text-red-400">{errors.acceptTerms}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Errore generale */}
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <p className="text-sm text-red-400">{errors.general}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#00D1FF] to-[#7C3AED] hover:opacity-90 text-white font-bold text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                  />
                ) : (
                  <ArrowRight className="w-5 h-5 mr-2" />
                )}
                {isLoading 
                  ? 'Elaborazione...' 
                  : isLoginMode 
                    ? 'Accedi' 
                    : 'Registrati'
                }
              </Button>

              {/* Toggle Mode */}
              <div className="text-center pt-2">
                <Button
                  type="button"
                  variant="link"
                  onClick={toggleMode}
                  disabled={isLoading}
                  className="text-white/50 hover:text-[#00D1FF]"
                >
                  {isLoginMode 
                    ? 'Non hai un account? Registrati' 
                    : 'Hai già un account? Accedi'
                  }
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="text-center mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40">
                M1SSION™ è un'esperienza immersiva di realtà aumentata
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default LoginPage;