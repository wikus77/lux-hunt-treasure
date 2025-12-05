
import { useState, FormEvent } from 'react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { validateLogin } from '@/utils/form-validation';
import { shouldBypassCaptcha } from '@/utils/turnstile';

type LoginFormData = {
  email: string;
  password: string;
};

type LoginFormErrors = {
  email?: string;
  password?: string;
};

export const useLogin = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { navigate } = useWouterNavigation();
  const { login } = useAuthContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    // Clear error when user starts typing
    if (errors[id as keyof LoginFormErrors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
    
    // Clear form error when user makes changes
    if (formError) {
      setFormError(null);
    }
  };

  const handleSubmit = async (e: FormEvent, turnstileToken?: string) => {
    e.preventDefault();

    // Client-side validation
    const validation = validateLogin(formData);
    if (!validation.isValid) {
      setErrors(validation.errors as LoginFormErrors);
      return;
    }

    // Check if on bypass path and allow login without Turnstile
    const isDevPath = shouldBypassCaptcha(window.location.pathname);

    if (!turnstileToken && !isDevPath) {
      setFormError('Security verification required. Please complete the captcha.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    const { email, password } = formData;

    try {
      console.log('🔐 Login attempt started');
      
      // Special handling for development paths
      if (isDevPath) {
        console.log('Development path detected, bypassing Turnstile');
        turnstileToken = 'BYPASS_FOR_DEVELOPMENT';
      }
      
      // First verify the turnstile token - skip for dev paths
      if (!isDevPath && turnstileToken && !turnstileToken.startsWith('BYPASS_')) {
        const verifyResponse = await supabase.functions.invoke('verify-turnstile', {
          body: { token: turnstileToken, action: 'login' }
        });
        
        if (!verifyResponse.data?.success) {
          console.warn('Security verification warning, proceeding with login');
        }
      }
      
      console.log('🔄 Proceeding with standard login');
      
      const result = await login(email, password);
      
      if (!result.success) {
        // Handle specific error cases
        const errorMessage = result.error?.message || 'Errore durante il login';
        
        if (errorMessage.includes('Invalid login credentials')) {
          setFormError('Credenziali non valide. Verifica email e password.');
        } else if (errorMessage.includes('Email not confirmed')) {
          setFormError('Email non verificata. Controlla la tua casella di posta.');
          navigate('/login?verification=pending');
        } else {
          setFormError(errorMessage);
        }
        throw new Error(errorMessage);
      }

      // Show success toast and force redirect
      toast.success('Accesso effettuato', {
        description: 'Benvenuto!',
        duration: 2000
      });

      console.log('🚀 [use-login] LOGIN SUCCESS - redirect delegated to StandardLoginForm');
      
      // Dispatch auth success event
      const event = new CustomEvent('auth-success');
      window.dispatchEvent(event);
      
    } catch (error: any) {
      console.error('❌ Login error');
      if (!formError) {
        setFormError(error.message || 'Errore imprevisto durante il login.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    formError,
    isSubmitting,
    handleChange,
    handleSubmit
  };
};
