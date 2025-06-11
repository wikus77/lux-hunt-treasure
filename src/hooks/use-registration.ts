
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

    console.log('🚀 STARTING REGISTRATION - NO CAPTCHA');
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
      console.log('🔄 Calling supabase.auth.signUp...');
      
      // Direct signup without ANY captcha verification
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth',
          data: {
            full_name: name,
            mission_preference: missionPreference || null
          }
          // NO captchaToken - completely removed
        }
      });

      console.log('✅ SignUp result:', result);
      console.log('👤 User data:', result.data.user);
      console.log('🔑 Session data:', result.data.session);
      console.log('❌ Error data:', result.error);

      if (result.error) {
        console.error('❌ Registration error:', result.error);
        toast.error("Errore", {
          description: result.error.message || "Errore durante la registrazione.",
          duration: 3000
        });
        setIsSubmitting(false);
        return;
      }

      console.log('🎉 Registration successful!');
      toast.success("Registrazione completata!", {
        description: "Controlla la tua casella email e conferma il tuo account."
      });

      setTimeout(() => {
        navigate("/login?verification=pending");
      }, 2000);

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
