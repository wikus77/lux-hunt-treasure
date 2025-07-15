
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

    console.log('🚀 STARTING REGISTRATION WITH BYPASS OPTION');
    console.log('📧 Email:', formData.email);
    console.log('🔐 Password length:', formData.password.length);

    // Validazione client-side
    const validation = validateRegistration(formData);
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.errors);
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    const { name, email, password } = formData;

    try {
      console.log('🔄 Attempting standard Supabase signUp first...');
      
      // First try standard signup (in case CAPTCHA was disabled)
      const standardResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth',
          data: {
            full_name: name,
            mission_preference: missionPreference || null
          }
        }
      });

      console.log('📊 Standard signup result:', standardResult);

      // Check if standard signup succeeded
      if (!standardResult.error && standardResult.data.user) {
        console.log('✅ Standard registration successful!');
        toast.success("Registrazione completata!", {
          description: "Controlla la tua casella email e conferma il tuo account."
        });

        setTimeout(() => {
          navigate("/login?verification=pending");
        }, 2000);
        return;
      }

      // If standard signup failed with CAPTCHA error, try bypass
      if (standardResult.error && standardResult.error.message.includes('captcha')) {
        console.log('🔄 Standard signup blocked by CAPTCHA, trying bypass...');
        
        const { data: bypassResult, error: bypassError } = await supabase.functions.invoke('register-bypass', {
          body: {
            email,
            password,
            fullName: name,
            missionPreference: missionPreference || null
          }
        });

        if (bypassError) {
          console.error('❌ Bypass registration failed:', bypassError);
          toast.error("Errore nel bypass", {
            description: bypassError.message || "Errore durante la registrazione con bypass.",
            duration: 3000
          });
          return;
        }

        if (bypassResult?.success) {
          console.log('✅ Bypass registration successful!');
          
          if (bypassResult.requireManualLogin) {
            toast.success("Registrazione completata!", {
              description: "Account creato con successo. Ora puoi effettuare il login.",
              duration: 4000
            });
            setTimeout(() => {
              navigate(`/login?email=${encodeURIComponent(email)}`);
            }, 2000);
          } else {
            toast.success("Registrazione e login completati!", {
              description: "Sei stato registrato e connesso automaticamente.",
              duration: 3000
            });
            setTimeout(() => {
              navigate("/home");
            }, 2000);
          }
          return;
        }
      }

      // If both methods failed, show error
      const errorMessage = standardResult.error?.message || "Errore sconosciuto durante la registrazione";
      console.error('❌ Both registration methods failed:', errorMessage);
      toast.error("Errore", {
        description: errorMessage,
        duration: 3000
      });

    } catch (error: any) {
      console.error("💥 Registration exception:", error);
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
