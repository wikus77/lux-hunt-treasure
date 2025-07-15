// Pagina di autenticazione (Login/Register)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Shield, ArrowRight } from 'lucide-react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useAuth } from '@/hooks/use-auth';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';

interface FormData {
  email: string;
  password: string;
  fullName: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  confirmPassword?: string;
  general?: string;
}

const LoginPage: React.FC = () => {
  const { navigate } = useWouterNavigation();
  const searchParams = new URLSearchParams(window.location.search);
  const { login, register, user, isLoading: authLoading } = useAuth();
  const { vibrate } = useCapacitorHardware();
  const { toast } = useToast();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
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

  // Gestione input
  const handleInputChange = (field: keyof FormData, value: string) => {
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
      confirmPassword: ''
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (authLoading) {
    return (
      <SafeAreaWrapper className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,209,255,0.1),transparent)]" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 min-h-screen flex items-center justify-center p-4"
      >
        <motion.div variants={itemVariants} className="w-full max-w-md">
          {/* Logo/Title */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-orbitron font-bold text-foreground mb-2">
              M1SSION™
            </h1>
            <p className="text-muted-foreground">
              {isLoginMode ? 'Accedi alla missione' : 'Unisciti agli agenti'}
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card neon-border">
              <CardHeader>
                <CardTitle className="text-center font-orbitron">
                  {isLoginMode ? 'Accesso Agente' : 'Registrazione Agente'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="agente@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`glass-input pl-10 ${errors.email ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
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
                        className="space-y-2"
                      >
                        <Label htmlFor="fullName">Nome Agente</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="Il tuo nome"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className={`glass-input pl-10 ${errors.fullName ? 'border-destructive' : ''}`}
                            disabled={isLoading}
                          />
                        </div>
                        {errors.fullName && (
                          <p className="text-sm text-destructive">{errors.fullName}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`glass-input pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
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
                        className="space-y-2"
                      >
                        <Label htmlFor="confirmPassword">Conferma Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className={`glass-input pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Errore generale */}
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                    >
                      <p className="text-sm text-destructive">{errors.general}</p>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full neon-border"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    {isLoading 
                      ? 'Elaborazione...' 
                      : isLoginMode 
                        ? 'Accedi' 
                        : 'Registrati'
                    }
                  </Button>

                  {/* Toggle Mode */}
                  <div className="text-center pt-4">
                    <Button
                      type="button"
                      variant="link"
                      onClick={toggleMode}
                      disabled={isLoading}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {isLoginMode 
                        ? 'Non hai un account? Registrati' 
                        : 'Hai già un account? Accedi'
                      }
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              M1SSION™ è un'esperienza immersiva di realtà aumentata
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </SafeAreaWrapper>
  );
};

export default LoginPage;