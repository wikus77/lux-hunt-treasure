
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { validateLogin } from '@/utils/form-validation';

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const validation = validateLogin(formData);
    if (!validation.isValid) {
      setErrors(validation.errors as LoginFormErrors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    const { email, password } = formData;

    try {
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

      // Show success toast and redirect (handled by the auth context)
      toast.success('Accesso effettuato', {
        description: 'Benvenuto!',
        duration: 3000
      });
      
    } catch (error: any) {
      console.error('Errore login:', error);
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
