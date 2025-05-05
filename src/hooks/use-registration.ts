
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateRegistration, ValidationResult } from '@/utils/form-validation';

// Tipo per i dati del form
export type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Tipo per gli errori del form
export type FormErrors = {
  [key in keyof FormData]?: string;
};

// Funzione separata per evitare inferenza profonda con Supabase
async function checkIfEmailExists(email: string): Promise<boolean> {
  // Eseguiamo la query con tipizzazione più semplice
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .limit(1) as { data: any[]; error: any };

  if (error) {
    console.error("Errore nel controllo email:", error);
    throw error;
  }

  return data && data.length > 0;
}

export const useRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    if (errors[id as keyof FormData]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validation: ValidationResult = validateRegistration(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    const { name, email, password } = formData;

    try {
      const emailEsiste = await checkIfEmailExists(email);

      if (emailEsiste) {
        toast.error("Errore", {
          description: "Email già registrata. Prova un'altra.",
          duration: 3000
        });
        setIsSubmitting(false);
        return;
      }

      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth',
          data: {
            full_name: name,
          }
        }
      });

      const authError = result.error;

      if (authError) {
        toast.error("Errore", {
          description: authError.message || "Errore durante la registrazione.",
          duration: 3000
        });
        setIsSubmitting(false);
        return;
      }

      toast.success("Registrazione completata!", {
        description: "Controlla la tua casella email e conferma il tuo account."
      });

      setTimeout(() => {
        navigate("/login?verification=pending");
      }, 2000);

    } catch (error: any) {
      console.error("Errore di registrazione:", error);
      toast.error("Errore", {
        description: "Si è verificato un errore. Riprova più tardi.",
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
