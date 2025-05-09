
import { useState } from 'react';
import { sendEmail } from '@/services/email';
import { toast } from 'sonner';

// Import types and utilities
import { EmailType, SendEmailProps, EmailResult, EmailServiceHook } from './emailTypes';
import { 
  generateWelcomeEmailHtml,
  generateNotificationEmailHtml, 
  generateDefaultMarketingEmailHtml 
} from './emailTemplates';
import { logEmailAttempt, handleEmailSuccess, handleEmailError } from './emailUtils';

/**
 * Hook for sending emails through the Mailjet service
 */
export function useEmailService(): EmailServiceHook {
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  /**
   * Send an email using the Mailjet service
   */
  const sendEmailService = async ({
    type,
    email,
    name = '',
    subject,
    data = {}
  }: SendEmailProps): Promise<EmailResult> => {
    if (!email) {
      return { success: false, error: "Email address is required" };
    }

    setIsSending(true);
    setLastError(null);
    setLastResponse(null);
    
    try {
      logEmailAttempt(type, email);
      
      let htmlContent = '';
      let emailSubject = subject || '';
      
      // Generate content based on email type
      switch (type) {
        case 'welcome':
          emailSubject = emailSubject || "Benvenuto in M1SSION";
          htmlContent = generateWelcomeEmailHtml(name, data?.launchDate || "19 Giugno 2025");
          break;
          
        case 'notification':
          emailSubject = emailSubject || "Aggiornamento importante";
          htmlContent = generateNotificationEmailHtml(name, data?.message || "");
          break;
          
        case 'marketing':
          emailSubject = emailSubject || "Novità da M1SSION";
          htmlContent = data.htmlContent || generateDefaultMarketingEmailHtml(name);
          break;
          
        default:
          return { 
            success: false, 
            error: `Unsupported email type: ${type}`
          };
      }

      const result = await sendEmail(type as EmailType, {
        to: [{ email, name }],
        subject: emailSubject,
        htmlContent: htmlContent,
        trackOpens: true,
        trackClicks: true,
        customCampaign: `${type}_email`,
        consent: {
          given: true,
          date: new Date().toISOString(), 
          method: 'web_app'
        }
      });

      setLastResponse(result);

      if (!result.success) {
        const errorMessage = result.error?.toString() || "Si è verificato un errore nell'invio dell'email";
        toast.error(`Errore nell'invio dell'email: ${errorMessage}`);
        setLastError(errorMessage);
        return { 
          success: false, 
          error: errorMessage,
          response: result 
        };
      }

      handleEmailSuccess(email);
      
      return { success: true, response: result };
    } catch (error: any) {
      const errorMessage = handleEmailError(error);
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
    return sendEmailService({
      type: 'welcome',
      email,
      name
    });
  };

  /**
   * Send a notification email with a custom message
   */
  const sendNotificationEmail = async (email: string, subject: string, message: string, name: string = '') => {
    return sendEmailService({
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
  const sendMarketingEmail = async (email: string, subject: string, htmlContent: string, name: string = '') => {
    return sendEmailService({
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
    sendEmail: sendEmailService,
    sendWelcomeEmail,
    sendNotificationEmail,
    sendMarketingEmail
  };
}
