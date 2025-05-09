
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { EmailServiceHook, SendEmailProps, EmailResult } from './emailTypes';
import { logEmailAttempt, handleEmailSuccess, handleEmailError } from './emailUtils';

/**
 * Hook for sending emails using Supabase Edge Functions
 */
export const useEmailService = (): EmailServiceHook => {
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  /**
   * Send an email using the appropriate edge function
   */
  const sendEmail = async (props: SendEmailProps): Promise<EmailResult> => {
    const { type, email, name, subject, data } = props;
    
    logEmailAttempt(type, email);
    setIsSending(true);
    setLastError(null);
    
    try {
      // Call the Mailjet email function
      const { data: response, error } = await supabase.functions.invoke('send-mailjet-email', {
        body: {
          type,
          email,
          name,
          subject,
          to: [{ email, name }],
          ...data
        }
      });
      
      if (error) {
        const errorMessage = handleEmailError(error);
        setLastError(errorMessage);
        return { success: false, error: errorMessage };
      }
      
      setLastResponse(response);
      handleEmailSuccess(email);
      return { success: true, response };
    } catch (error) {
      const errorMessage = handleEmailError(error);
      setLastError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Send a welcome email
   */
  const sendWelcomeEmail = async (email: string, name?: string): Promise<EmailResult> => {
    return sendEmail({
      type: 'welcome',
      email,
      name: name || email.split('@')[0],
      subject: 'Benvenuto in M1SSION!',
      data: {
        launchDate: '19 Giugno 2025'
      }
    });
  };
  
  /**
   * Send a notification email
   */
  const sendNotificationEmail = async (email: string, subject: string, message: string, name?: string): Promise<EmailResult> => {
    return sendEmail({
      type: 'notification',
      email,
      name,
      subject,
      data: { message }
    });
  };
  
  /**
   * Send a marketing email
   */
  const sendMarketingEmail = async (email: string, subject: string, htmlContent: string, name?: string): Promise<EmailResult> => {
    return sendEmail({
      type: 'marketing',
      email,
      name,
      subject,
      data: { htmlContent }
    });
  };
  
  return {
    isSending,
    lastError,
    lastResponse,
    sendEmail,
    sendWelcomeEmail,
    sendNotificationEmail,
    sendMarketingEmail
  };
};
