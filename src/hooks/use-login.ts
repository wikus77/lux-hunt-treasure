
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false as boolean);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    if (errors[id as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { email, password } = formData;

    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Inserisci un’email valida';
    if (!password) newErrors.password = 'Inserisci una password';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error('Errore', {
          description: error.message || 'Email o password non corretti.',
          duration: 3000
        });
        setIsSubmitting(false);
        return;
      }

      if (!data.user?.email_confirmed_at) {
        toast.error('Email non verificata', {
          description: 'Controlla la tua casella email e conferma l’indirizzo.',
          duration: 3000
        });
        setIsSubmitting(false);
        return;
      }

      toast.success('Login riuscito!', {
        description: 'Benvenuto nella tua M1SSION.'
      });

      setTimeout(() => {
        navigate('/home'); // oppure la tua dashboard iniziale
      }, 1500);

    } catch (err: any) {
      console.error('Errore login:', err);
      toast.error('Errore', {
        description: 'Errore imprevisto durante il login.',
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
