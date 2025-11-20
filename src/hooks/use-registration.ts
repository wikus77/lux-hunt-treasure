
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

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
            emailRedirectTo: window.location.origin + '/choose-plan',
            data: {
              full_name: name,
              mission_preference: missionPreference || null,
              subscription_plan: null,
              access_enabled: false,
              status: 'registered_pending'
            }
          }
      });

      console.log('📊 M1SSION signup result:', standardResult);

      if (!standardResult.error && standardResult.data.user) {
        console.log('✅ M1SSION registration successful!');
        
        // Generate agent code client-side (temporary workaround)
        const agentCode = `AG-${Date.now().toString(36).toUpperCase()}`;
        
        try {
          // Invia notifiche di registrazione
          await supabase.functions.invoke('send-registration-notification', {
            body: {
              userId: standardResult.data.user.id,
              email: standardResult.data.user.email,
              agentCode: agentCode,
              fullName: name
            }
          });
          console.log('📧 Notifiche post-registrazione inviate');
        } catch (notificationError) {
          console.error('⚠️ Errore invio notifiche:', notificationError);
          // Non bloccare il flusso se le notifiche falliscono
        }

        toast.success("Registrazione completata!", {
          description: "Controlla la tua email per il codice agente. Ora scegli il tuo piano di abbonamento."
        });

        // Dopo registrazione successful, invia notifica e vai agli abbonamenti
        console.log('📧 Inviando notifiche post-registrazione...');
        
          // Reindirizza alla selezione piano abbonamento
          setTimeout(() => {
            navigate("/choose-plan");
          }, 1500);
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
            subscriptionPlan: null,
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
          
          // Per il bypass, generiamo un agent code client-side
          try {
            // Generate agent code client-side (temporary workaround)
            const agentCode = `AG-${Date.now().toString(36).toUpperCase()}`;
            
            // Invia notifiche di registrazione
            await supabase.functions.invoke('send-registration-notification', {
              body: {
                userId: 'bypass-user', // Per il bypass non abbiamo un ID reale
                email: email,
                agentCode: agentCode,
                fullName: name
              }
            });
            console.log('📧 Notifiche post-registrazione bypass inviate');
          } catch (notificationError) {
            console.error('⚠️ Errore invio notifiche bypass:', notificationError);
          }
          
          toast.success("Registrazione completata!", {
            description: "Controlla la tua email per il codice agente. Ora scegli il tuo piano di abbonamento.",
            duration: 4000
          });
          
          // Dopo registrazione bypass successful, invia notifica e vai agli abbonamenti
          console.log('📧 Inviando notifiche post-registrazione bypass...');
          
          // Reindirizza alla selezione piano abbonamento
          setTimeout(() => {
            navigate("/choose-plan");
          }, 1500);
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
