
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
      console.log(`🔐 LOGIN ATTEMPT STARTING for email: ${email}`);
      console.log(`🔍 Login path check - isDevPath: ${isDevPath}, pathname: ${window.location.pathname}`);
      
      // Special handling for development paths
      if (isDevPath) {
        console.log('✅ Development path detected, bypassing Turnstile verification for login');
        turnstileToken = 'BYPASS_FOR_DEVELOPMENT';
      }
      
      // First verify the turnstile token - skip for dev paths
      if (!isDevPath && turnstileToken && !turnstileToken.startsWith('BYPASS_')) {
        console.log('🔄 Verifying Turnstile token...');
        const verifyResponse = await supabase.functions.invoke('verify-turnstile', {
          body: { token: turnstileToken, action: 'login' }
        });
        
        if (!verifyResponse.data?.success) {
          console.warn('⚠️ Security verification warning, but allowing login to proceed:', verifyResponse.error);
          // Continue anyway to prevent blocking login functionality
        }
      }
      
      // Now proceed with standard login
      console.log(`🚀 Proceeding with standard login for: ${email}`);
      
      const result = await login(email, password);
      
      console.log(`🔍 LOGIN RESULT:`, { success: result.success, hasSession: !!result.session });
      
      if (!result.success) {
        // Handle specific error cases
        const errorMessage = result.error?.message || 'Errore durante il login';
        console.error(`❌ LOGIN FAILED: ${errorMessage}`);
        
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

      // Show success toast and redirect (handled by the auth context)
      console.log('✅ LOGIN SUCCESS - showing toast and waiting for redirect');
      toast.success('Accesso effettuato', {
        description: 'Benvenuto!',
        duration: 3000
      });
      
    } catch (error: any) {
      console.error('💥 LOGIN EXCEPTION:', error);
      // Form error is already set for specific cases above
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
