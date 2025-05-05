
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateLogin, LoginFormData } from '@/utils/login-validation';

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
    
    // Pulisco gli errori quando l'utente digita
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validazione form
    const validation = validateLogin(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsLoading(true);

    try {
      // Autenticazione reale con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error) throw error;
      
      // Verifica se l'email è stata verificata
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
      
      // Reindirizzamento al componente Auth che gestirà ulteriori reindirizzamenti
      navigate("/auth");
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Gestione di casi di errore specifici
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
