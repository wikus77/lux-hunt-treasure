
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateLogin } from '@/utils/login-validation';

// Explicit type definition for login form data
export type LoginFormData = {
  email: string;
  password: string;
};

export const useLogin = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
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
    const validation = validateLogin(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsLoading(true);

    try {
      // Real authentication with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error) throw error;
      
      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        toast.error("Email non verificata", {
          description: "Per favore, verifica la tua email prima di accedere. Controlla la tua casella di posta."
        });
        setIsLoading(false);
        return;
      }
      
      toast.success("Login completato!", {
        description: "Accesso effettuato con successo."
      });
      
      // Redirect to Auth component which will handle further redirections
      navigate("/auth");
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle specific error cases
      if (error.message.includes("Email not confirmed")) {
        toast.error("Email non verificata", {
          description: "Per favore, verifica la tua email prima di accedere."
        });
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Credenziali non valide", {
          description: "Email o password errati. Riprova."
        });
      } else {
        toast.error("Errore di accesso", {
          description: error.message || "Impossibile effettuare il login. Verifica le tue credenziali."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit
  };
};
