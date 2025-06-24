
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LoginFormFields } from './forms/LoginFormFields';
import { RegistrationFormFields } from './forms/RegistrationFormFields';

interface StandardLoginFormProps {
  verificationStatus?: string | null;
}

export const StandardLoginForm: React.FC<StandardLoginFormProps> = ({ 
  verificationStatus 
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-fill developer credentials
  useEffect(() => {
    const isDeveloper = window.location.hostname === 'localhost' || window.location.hostname.includes('lovable');
    if (isDeveloper) {
      setEmail('wikus77@hotmail.it');
      setPassword('Wikus190877!@#');
    }
  }, []);

  // Handle verification status messages
  useEffect(() => {
    if (verificationStatus === 'pending') {
      toast.info("Verifica email", {
        description: "Controlla la tua email per verificare l'account."
      });
    }
  }, [verificationStatus]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('❌ Login error:', error);
        toast.error("Errore di accesso", {
          description: error.message === 'Invalid login credentials' 
            ? "Email o password non corretti" 
            : error.message
        });
        return;
      }

      if (data.user) {
        console.log('✅ Login successful for user:', data.user.id);
        toast.success("Accesso effettuato", {
          description: "Benvenuto in M1SSION™!"
        });
        
        // Navigate to home after short delay
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Login exception:', error);
      toast.error("Errore inaspettato", {
        description: "Riprova tra qualche momento"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('📝 Attempting registration for:', email);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('❌ Registration error:', error);
        toast.error("Errore di registrazione", {
          description: error.message === 'User already registered' 
            ? "Utente già registrato. Prova ad accedere." 
            : error.message
        });
        return;
      }

      if (data.user) {
        console.log('✅ Registration successful for user:', data.user.id);
        
        if (!data.user.email_confirmed_at) {
          toast.success("Registrazione completata", {
            description: "Controlla la tua email per verificare l'account"
          });
        } else {
          toast.success("Registrazione completata", {
            description: "Benvenuto in M1SSION™!"
          });
          setTimeout(() => {
            navigate('/home');
          }, 1000);
        }
      }
    } catch (error) {
      console.error('❌ Registration exception:', error);
      toast.error("Errore inaspettato", {
        description: "Riprova tra qualche momento"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    if (!email.includes('wikus77')) {
      setEmail('');
    }
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex rounded-lg bg-gray-800/30 p-1">
        <button
          onClick={() => { setIsLogin(true); resetForm(); }}
          className={`flex-1 rounded-md py-2 px-4 text-sm font-medium transition-all ${
            isLogin
              ? 'bg-gradient-to-r from-projectx-blue to-projectx-pink text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Accedi
        </button>
        <button
          onClick={() => { setIsLogin(false); resetForm(); }}
          className={`flex-1 rounded-md py-2 px-4 text-sm font-medium transition-all ${
            !isLogin
              ? 'bg-gradient-to-r from-projectx-blue to-projectx-pink text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Registrati
        </button>
      </div>

      <motion.div
        key={isLogin ? 'login' : 'register'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {isLogin ? (
          <LoginFormFields
            email={email}
            password={password}
            showPassword={showPassword}
            isLoading={isLoading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handleLogin}
          />
        ) : (
          <RegistrationFormFields
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            isLoading={isLoading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            onSubmit={handleRegistration}
          />
        )}
      </motion.div>

      <div className="text-center text-sm text-gray-400">
        {isLogin ? (
          <p>
            Non hai un account?{' '}
            <button
              onClick={switchMode}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Registrati qui
            </button>
          </p>
        ) : (
          <p>
            Hai già un account?{' '}
            <button
              onClick={switchMode}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Accedi qui
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
