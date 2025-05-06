
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type EmailType = 'welcome' | 'verification' | 'password_reset' | 'notification';

interface SendEmailProps {
  type: EmailType;
  email: string;
  name?: string;
  subject?: string;
  data?: Record<string, any>;
}

export function useEmailService() {
  const [isSending, setIsSending] = useState(false);

  /**
   * Send an email using the email service
   */
  const sendEmail = async ({
    type,
    email,
    name = '',
    subject,
    data = {}
  }: SendEmailProps): Promise<{ success: boolean; error?: string }> => {
    if (!email) {
      return { success: false, error: "Email address is required" };
    }

    setIsSending(true);
    try {
      console.log(`Attempting to send ${type} email to ${email}`);
      
      const { data: responseData, error } = await supabase.functions.invoke('send-email', {
        body: {
          type,
          email,
          name,
          subject,
          data
        }
      });

      if (error) {
        console.error("Error sending email:", error);
        toast.error(`Errore nell'invio dell'email: ${error.message}`);
        return { success: false, error: error.message };
      }

      console.log("Email sent successfully:", responseData);
      return { success: true };
    } catch (error: any) {
      console.error("Exception sending email:", error);
      return { 
        success: false, 
        error: error.message || "Si è verificato un errore nell'invio dell'email" 
      };
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Send a welcome email to a new user
   */
  const sendWelcomeEmail = async (email: string, name: string = '') => {
    return sendEmail({
      type: 'welcome',
      email,
      name
    });
  };

  /**
   * Send a verification email with a verification link
   */
  const sendVerificationEmail = async (email: string, name: string = '', verificationLink: string) => {
    return sendEmail({
      type: 'verification',
      email,
      name,
      data: { verificationLink }
    });
  };

  /**
   * Send a password reset email with a reset link
   */
  const sendPasswordResetEmail = async (email: string, resetLink: string) => {
    return sendEmail({
      type: 'password_reset',
      email,
      data: { resetLink }
    });
  };

  /**
   * Send a notification email with a custom message
   */
  const sendNotificationEmail = async (email: string, name: string = '', subject: string, message: string) => {
    return sendEmail({
      type: 'notification',
      email,
      name,
      subject,
      data: { message }
    });
  };

  return {
    isSending,
    sendEmail,
    sendWelcomeEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendNotificationEmail
  };
}
