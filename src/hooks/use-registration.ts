
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateRegistration } from '@/utils/form-validation';

// Tipo per i dati del form
export type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const useRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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

  const handleSubmit = async (e: FormEvent, turnstileToken?: string, missionPreference?: 'uomo' | 'donna' | null) => {
    e.preventDefault();

    // Validazione client-side
    const validation = validateRegistration(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    const { name, email, password } = formData;

    try {
      // First verify the turnstile token if provided
      if (turnstileToken) {
        const verifyResponse = await supabase.functions.invoke('verify-turnstile', {
          body: { token: turnstileToken, action: 'registration' }
        });
        
        if (!verifyResponse.data?.success) {
          throw new Error('Security verification failed');
        }
      }

      // Check if email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', email)
        .limit(1);

      if (checkError) {
        console.error("Error checking email:", checkError);
        throw new Error("Si è verificato un errore nel controllo dell'email.");
      }

      if (existingUsers && existingUsers.length > 0) {
        toast.error("Errore", {
          description: "Email già registrata. Prova un'altra.",
          duration: 3000
        });
        setIsSubmitting(false);
        return;
      }

      // Register user with fix CAPTCHA per iOS WebView
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth',
          data: {
            full_name: name,
            mission_preference: missionPreference || null
          },
          // Fix CAPTCHA: Passa sempre captchaToken, anche stringa vuota per iOS WebView
          captchaToken: turnstileToken || ""
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

      // Fix sessione iOS Capacitor WebView
      if (result.data.session) {
        try {
          await supabase.auth.setSession({
            access_token: result.data.session.access_token,
            refresh_token: result.data.session.refresh_token,
          });
          console.log("✅ Sessione esplicitamente salvata per iOS Capacitor");
        } catch (sessionError) {
          console.warn("⚠️ Errore salvataggio sessione esplicita:", sessionError);
        }
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
        description: error.message || "Si è verificato un errore. Riprova più tardi.",
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
