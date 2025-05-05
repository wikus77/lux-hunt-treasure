
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth'; // Fixed import path
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    if (errors[id as keyof LoginFormErrors]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validazione client-side
    const validation = validateLogin(formData);
    if (!validation.isValid) {
      setErrors(validation.errors as LoginFormErrors);
      return;
    }

    setIsSubmitting(true);
    const { email, password } = formData;

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Errore durante il login');
      }

      // La gestione del reindirizzamento è all'interno del contesto di autenticazione
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (error: any) {
      console.error('Errore login:', error);
      toast.error('Errore', {
        description: error.message || 'Errore imprevisto durante il login.',
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit
  };
};
