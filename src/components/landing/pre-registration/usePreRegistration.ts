
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Generate unique agent code
      const newAgentCode = await generateUniqueAgentCode();
      
      // Insert into pre_registered_users table
      const { data, error: insertError } = await supabase
        .from('pre_registered_users')
        .insert({
          name: formData.name,
          email: formData.email,
          agent_code: newAgentCode,
          is_verified: false,
          is_pre_registered: true,
          password_hash: null
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('Email già registrato. Usa un\'altra email.');
        }
        throw new Error(insertError.message);
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
      setNeedsEmailVerification(true);
      setIsSuccess(true);
      toast.success('Pre-registrazione completata! Controlla la tua email per la verifica.');
    } catch (err: any) {
      setError(err.message);
      toast.error('Errore durante la pre-registrazione');
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
  };

  return {
    formData,
    isSubmitting,
    isSuccess,
    error,
    referralCode,
    agentCode,
    needsEmailVerification,
    handleInputChange,
    handleSubmit,
    resetForm
  };
};
