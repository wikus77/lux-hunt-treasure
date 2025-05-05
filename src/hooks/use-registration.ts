
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateRegistration } from '@/utils/form-validation';

// Simple type for form data
export type RegistrationFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Simple type for profile check results
type ProfileCheckResult = {
  id: string;
}[];

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
    
    // Clear error when user types
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateRegistration(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsSubmitting(true);
    const { name, email, password } = formData;

    try {
      // Check if email already exists
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email);
      
      // Simple type assertion without deep inference
      const profiles = data as any[];
      
      if (error) {
        console.error("Error checking existing email:", error);
        toast.error("Errore", {
          description: "Si è verificato un errore durante la verifica dell'email.",
          duration: 3000
        });
        setIsSubmitting(false);
        return;
      }
      
      // Check if any results were returned (meaning email exists)
      if (profiles && profiles.length > 0) {
        toast.error("Errore", {
          description: "Email già registrata. Prova con un'altra email o accedi.",
          duration: 3000
        });
        setIsSubmitting(false);
        return;
      }

      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
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
      
      // Registration successful
      toast.success("Registrazione completata!", {
        description: "Ti abbiamo inviato una mail di verifica. Controlla la tua casella e conferma il tuo account per accedere."
      });
      
      // Redirect to verification pending page
      setTimeout(() => {
        navigate("/login?verification=pending");
      }, 2000);
      
    } catch (error: any) {
      console.error("Registration error:", error);
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
