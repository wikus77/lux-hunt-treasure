
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateRegistration, RegistrationFormData, ValidationResult } from '@/utils/form-validation';

// Define an interface for the profile data to avoid deep type inference
interface ProfileData {
  id: string;
  [key: string]: any;
}

// Use a simple function with explicit typing
async function checkIfEmailExists(email: string): Promise<boolean> {
  try {
    const response = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email);
      
    // Use explicit type assertion to prevent deep type inference
    const data = response.data as ProfileData[] | null;
    const error = response.error;

    if (error) {
      console.error("Errore nel controllo email:", error);
      throw error;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error("Errore durante il controllo dell'email:", error);
    return false;
  }
}

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
      // Check if email exists
      const emailEsiste = await checkIfEmailExists(email);

      if (emailEsiste) {
        toast.error("Errore", {
          description: "Email già registrata. Prova un'altra.",
          duration: 3000
        });
        setIsSubmitting(false);
        return;
      }

      // Supabase Registration
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
