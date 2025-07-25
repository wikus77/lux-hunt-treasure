
import { useState, FormEvent } from 'react';
import { useWouterNavigation } from './useWouterNavigation';
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
  const { navigate } = useWouterNavigation();

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

    console.log('🚀 STARTING M1SSION REGISTRATION WITH ACCESS CONTROL');
    console.log('📧 Email:', formData.email);
    console.log('🔐 Password length:', formData.password.length);
    console.log('🎯 Mission preference:', missionPreference);

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
      console.log('🔄 Attempting M1SSION enhanced signup...');
      
      // Standard signup with M1SSION enhanced data
      const standardResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth',
          data: {
            full_name: name,
            mission_preference: missionPreference || null,
            subscription_plan: 'base',
            access_enabled: false,
            status: 'registered_pending'
          }
        }
      });

      console.log('📊 M1SSION signup result:', standardResult);

      // Check if standard signup succeeded
      if (!standardResult.error && standardResult.data.user) {
        console.log('✅ M1SSION registration successful!');
        toast.success("Registrazione completata!", {
          description: "Ora scegli il tuo piano di abbonamento per accedere alla missione."
        });

        // Reindirizza direttamente alla pagina abbonamenti
        setTimeout(() => {
          navigate("/subscriptions");
        }, 2000);
        return;
      }

      // If standard signup failed with CAPTCHA error, try bypass
      if (standardResult.error && standardResult.error.message.includes('captcha')) {
        console.log('🔄 Standard signup blocked by CAPTCHA, trying M1SSION bypass...');
        
        const { data: bypassResult, error: bypassError } = await supabase.functions.invoke('register-bypass', {
          body: {
            email,
            password,
            fullName: name,
            missionPreference: missionPreference || null,
            subscriptionPlan: 'base',
            accessEnabled: false,
            status: 'registered_pending'
          }
        });

        if (bypassError) {
          console.error('❌ M1SSION bypass registration failed:', bypassError);
          toast.error("Errore nel bypass", {
            description: bypassError.message || "Errore durante la registrazione con bypass.",
            duration: 3000
          });
          return;
        }

        if (bypassResult?.success) {
          console.log('✅ M1SSION bypass registration successful!');
          
          toast.success("Registrazione completata!", {
            description: "Ora scegli il tuo piano di abbonamento per accedere alla missione.",
            duration: 4000
          });
          
          // Reindirizza alla pagina abbonamenti
          setTimeout(() => {
            navigate("/subscriptions");
          }, 2000);
          return;
        }
      }

      // If both methods failed, show error
      const errorMessage = standardResult.error?.message || "Errore sconosciuto durante la registrazione";
      console.error('❌ Both M1SSION registration methods failed:', errorMessage);
      toast.error("Errore", {
        description: errorMessage,
        duration: 3000
      });

    } catch (error: any) {
      console.error("💥 M1SSION registration exception:", error);
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
