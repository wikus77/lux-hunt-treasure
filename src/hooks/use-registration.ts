
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, FormEvent } from 'react';
import { useWouterNavigation } from './useWouterNavigation';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateRegistration } from '@/utils/form-validation';
import { MAP_FIRST_ENABLED } from '@/config/firstSessionConfig';

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
    console.log('📧 Registration submitted');
    // 🔐 Password length log removed for security
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
        
        // 🚀 OTTIMIZZAZIONE: Toast immediato + redirect veloce
        toast.success("Registrazione completata!", {
          description: "Benvenuto in M1SSION™!"
        });

        // 🎯 MAP-FIRST: Nuovi utenti vanno direttamente alla mappa
        // Controllato da MAP_FIRST_ENABLED in firstSessionConfig.ts
        const targetRoute = MAP_FIRST_ENABLED ? "/map-3d-tiler" : "/home";
        console.log(`🗺️ [Registration] MAP-FIRST=${MAP_FIRST_ENABLED}, redirecting to: ${targetRoute}`);
        
        // 🚀 REDIRECT IMMEDIATO
        setTimeout(() => {
          navigate(targetRoute);
        }, 100);

        // 🔥 NON-BLOCKING: Notifiche inviate in background (no await!)
        // L'utente non deve aspettare l'email
        supabase.functions.invoke('send-registration-notification', {
          body: {
            userId: standardResult.data.user.id,
            email: standardResult.data.user.email,
            agentCode: 'PENDING', // Il vero agent_code è nel DB trigger
            fullName: name
          }
        }).then(() => {
          console.log('📧 Notifiche post-registrazione inviate (background)');
        }).catch((err) => {
          console.warn('⚠️ Notifiche fallite (non-blocking):', err);
        });
        
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
          
          // 🚀 OTTIMIZZAZIONE: Toast immediato + redirect veloce
          toast.success("Registrazione completata!", {
            description: "Scegli il tuo piano per iniziare la missione."
          });
          
          // 🚀 REDIRECT IMMEDIATO (era 1500ms, ora 100ms)
          setTimeout(() => {
            navigate("/choose-plan");
          }, 100);
          
          // 🔥 NON-BLOCKING: Notifiche inviate in background (no await!)
          supabase.functions.invoke('send-registration-notification', {
            body: {
              userId: bypassResult.userId || 'bypass-user',
              email: email,
              agentCode: 'PENDING',
              fullName: name
            }
          }).then(() => {
            console.log('📧 Notifiche bypass inviate (background)');
          }).catch((err) => {
            console.warn('⚠️ Notifiche bypass fallite (non-blocking):', err);
          });
          
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
