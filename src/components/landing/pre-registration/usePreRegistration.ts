
import { useState } from 'react';
import { FormData } from './types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateUniqueAgentCode } from '@/utils/agentCodeGenerator';

export const usePreRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [agentCode, setAgentCode] = useState('');
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [userCredentials, setUserCredentials] = useState<{email: string, password: string} | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 PRE-REGISTRATION: Form submitted', { formData });
    setIsSubmitting(true);
    setError(null);

    try {
      // Generate unique agent code
      const newAgentCode = await generateUniqueAgentCode();
      console.log('🔥 AGENT CODE GENERATED:', newAgentCode);
      
      // STEP 1: Create Supabase auth account FIRST
      const temporaryPassword = `AG${newAgentCode.slice(-4)}2025!`;
      console.log('🔐 TEMPORARY PASSWORD:', temporaryPassword);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: temporaryPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-complete?agent_code=${newAgentCode}`,
          data: {
            name: formData.name,
            agent_code: newAgentCode,
            is_pre_registered: true
          }
        }
      });

      if (authError) {
        console.error('❌ SUPABASE AUTH ERROR:', authError);
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          // Se l'utente è già registrato, prova a recuperare i suoi dati esistenti
          console.log('🔄 User already exists, checking existing data...');
          
          // Recupera i dati esistenti dell'utente dalla tabella profiles
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('agent_code, plan, email')
            .eq('email', formData.email)
            .single();
            
          if (existingProfile?.agent_code) {
            // Usa il codice agente esistente per generare la password
            const existingPassword = `AG${existingProfile.agent_code.slice(-4)}2025!`;
            console.log('🔐 USING EXISTING PASSWORD:', existingPassword);
            
            // Prova il login con la password esistente
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email: formData.email,
              password: existingPassword
            });
            
            if (!loginError && loginData.user) {
              console.log('✅ DIRECT LOGIN SUCCESS:', loginData.user.id);
              
              setAgentCode(existingProfile.agent_code);
              setReferralCode(`CODE ${existingProfile.agent_code}`);
              setUserCredentials({
                email: formData.email,
                password: existingPassword
              });
              setNeedsEmailVerification(false);
              setIsSuccess(true);
              
              toast.success(`Bentornato Agente ${existingProfile.agent_code}!`, {
                description: `Accesso completato`,
                duration: 5000
              });
              
              // Redirect appropriato
              setTimeout(() => {
                if (!existingProfile.plan || existingProfile.plan === 'Base') {
                  window.location.href = `/choose-plan?agent_code=${existingProfile.agent_code}`;
                } else {
                  window.location.href = '/how-it-works';
                }
              }, 2000);
              
              return; // Esci dalla funzione qui
            }
          }
          
          throw new Error('Email già registrato. Vai al login per accedere con le tue credenziali.');
        }
        throw new Error(authError.message);
      }

      console.log('✅ SUPABASE ACCOUNT CREATED:', authData.user?.id);

      // STEP 2: Insert into pre_registered_users table
      const { error: insertError } = await supabase
        .from('pre_registered_users')
        .insert({
          name: formData.name,
          email: formData.email,
          agent_code: newAgentCode,
          is_verified: false,
          is_pre_registered: true,
          password_hash: null
        });

      if (insertError && insertError.code !== '23505') {
        console.warn('Warning inserting into pre_registered_users:', insertError);
        // Don't fail if this insert fails - auth account is primary
      }

      // STEP 3: Create profile record immediately
      if (authData.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: formData.email,
            name: formData.name,
            agent_code: newAgentCode,
            is_pre_registered: true,
            plan: 'Base',
            credits: 100,
            can_access_app: false
          });
      }

      // Send verification email using edge function
      const { error: emailError } = await supabase.functions.invoke('send-mailjet-email', {
        body: {
          type: 'verification',
          to: formData.email,
          subject: 'M1SSION™ – Conferma la tua identità',
          htmlContent: `
            <div style="background: #000; color: #fff; padding: 20px; font-family: Arial, sans-serif;">
              <h1 style="color: #00E5FF;">M1SSION™ Verifica Email</h1>
              <p>Ciao ${formData.name},</p>
              <p>Il tuo Codice Agente <strong style="color: #00E5FF;">${newAgentCode}</strong> è stato generato!</p>
              <p>Clicca sul link per completare la registrazione e attivare il tuo Codice Agente personale:</p>
              <a href="${window.location.origin}/auth/verify?email=${encodeURIComponent(formData.email)}&agent=${newAgentCode}" 
                 style="background: #00E5FF; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                VERIFICA EMAIL
              </a>
              <p style="margin-top: 20px;">Se non hai richiesto questa registrazione, ignora questa email.</p>
            </div>
          `,
          trackOpens: true,
          trackClicks: true
        }
      });

      if (emailError) {
        console.warn('Email sending failed:', emailError);
        // Don't fail the registration if email fails
      }

      setAgentCode(newAgentCode);
      setReferralCode(`CODE ${newAgentCode}`);
      setNeedsEmailVerification(authData.user?.email_confirmed_at ? false : true);
      
      console.log('🎉 PRE-REGISTRATION SUCCESS! Setting isSuccess=true');
      setIsSuccess(true);
      
      // Store credentials for UI display
      setUserCredentials({
        email: formData.email,
        password: temporaryPassword
      });
      
      // Show credentials to user
      toast.success(`Account creato! Codice Agente: ${newAgentCode}`, {
        description: `Email: ${formData.email} | Password: ${temporaryPassword}`,
        duration: 10000
      });
      
      // If user doesn't need email verification, auto-login and redirect
      if (authData.user?.email_confirmed_at) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: temporaryPassword
        });
        
        if (!loginError) {
          setTimeout(() => {
            window.location.href = `/choose-plan?agent_code=${newAgentCode}`;
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error('💥 PRE-REGISTRATION ERROR:', err);
      setError(err.message);
      toast.error('Errore durante la pre-registrazione');
    } finally {
      console.log('🔄 PRE-REGISTRATION: Setting isSubmitting=false');
      setIsSubmitting(false);
    }
  };

  const handleCreateSupabaseAccount = async (event: CustomEvent) => {
    const { agentCode: eventAgentCode, needsEmailVerification: emailVerification } = event.detail;
    
    try {
      setIsSubmitting(true);
      
      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: agentCode + '2025', // Temporary password
        options: {
          emailRedirectTo: `${window.location.origin}/choose-plan?agent_code=${eventAgentCode}`,
          data: {
            name: formData.name,
            agent_code: eventAgentCode,
            is_pre_registered: true
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Note: pre_registered_users table doesn't have user_id field, skip this update

        // Create profile record
        await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: formData.email,
            name: formData.name,
            agent_code: eventAgentCode,
            is_pre_registered: true,
            plan: 'Base',
            credits: 100
          });

        toast.success('Account creato! Reindirizzamento in corso...');
        
        // Redirect to choose plan
        setTimeout(() => {
          window.location.href = `/choose-plan?agent_code=${eventAgentCode}`;
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error creating Supabase account:', error);
      toast.error('Errore nella creazione account: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '' });
    setIsSuccess(false);
    setError(null);
    setReferralCode('');
    setAgentCode('');
    setNeedsEmailVerification(false);
    
    // Remove event listener
    window.removeEventListener('create-supabase-account', handleCreateSupabaseAccount);
  };

  return {
    formData,
    isSubmitting,
    isSuccess,
    error,
    referralCode,
    agentCode,
    needsEmailVerification,
    userCredentials,
    handleInputChange,
    handleSubmit,
    resetForm
  };
};
