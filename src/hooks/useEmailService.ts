
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
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  /**
   * Send an email using the email service
   */
  const sendEmail = async ({
    type,
    email,
    name = '',
    subject,
    data = {}
  }: SendEmailProps): Promise<{ success: boolean; error?: string; response?: any }> => {
    if (!email) {
      return { success: false, error: "Email address is required" };
    }

    setIsSending(true);
    setLastError(null);
    setLastResponse(null);
    
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

      // Log the complete response for debugging
      console.log("Complete response from send-email function:", responseData);
      setLastResponse(responseData);

      if (error) {
        console.error("Error invoking send-email function:", error);
        const errorMessage = error.message || "Si è verificato un errore nell'invio dell'email";
        toast.error(`Errore nell'invio dell'email: ${errorMessage}`);
        setLastError(errorMessage);
        return { success: false, error: errorMessage, response: responseData };
      }

      if (responseData?.error) {
        console.error("API error sending email:", responseData.error);
        const errorMessage = responseData.error.message || "Errore dal servizio email";
        toast.error(`Errore: ${errorMessage}`);
        setLastError(errorMessage);
        return { success: false, error: errorMessage, response: responseData };
      }

      console.log("Email sent successfully:", responseData);
      toast.success("Email inviata con successo", {
        description: `L'email è stata inviata a ${email}`
      });
      return { success: true, response: responseData };
    } catch (error: any) {
      console.error("Exception sending email:", error);
      const errorMessage = error.message || "Si è verificato un errore nell'invio dell'email";
      setLastError(errorMessage);
      return { 
        success: false, 
        error: errorMessage,
        response: { exception: error.toString() }
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
    lastError,
    lastResponse,
    sendEmail,
    sendWelcomeEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendNotificationEmail
  };
}
