
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateRegistration, RegistrationFormData, ValidationResult } from '@/utils/form-validation';

// ✅ Tipizzazione sicura per Supabase Auth metadata
type UserMetaData = {
  full_name: string;
};

export const useRegistration = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    if (errors[id]) {
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
      // ✅ Verifica se l’email è già registrata (semplificato)
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email);

      if (error) {
        console.error("Errore Supabase:", error);
        toast.error("Errore", {
          description: "Errore durante il controllo dell'email.",
          duration: 3000
        });
        setIsSubmitting(false);
        return;
      }

      if (profileData && profileData.length > 0) {
        toast.error("Errore", {
          description: "Email già registrata. Prova un'altra.",
          duration: 3000
        });
        setIsSubmitting(false);
        return;
      }

      // ✅ Registrazione utente + invio email verifica (TIPO CORRETTO)
      const { data: authData, error: authError } = await supabase.auth.signUp<UserMetaData>({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth',
          data: {
            full_name: name,
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast.error("Errore", {
            description: "Email già registrata. Prova con un'altra email o accedi.",
            duration: 3000
          });
        } else {
          toast.error("Errore", {
            description: authError.message || "Si è verificato un errore durante la registrazione.",
            duration: 3000
          });
        }
        setIsSubmitting(false);
        return;
      }

      toast.success("Registrazione completata!", {
        description: "Ti abbiamo inviato una mail di verifica. Controlla la tua casella e conferma il tuo account per accedere."
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
