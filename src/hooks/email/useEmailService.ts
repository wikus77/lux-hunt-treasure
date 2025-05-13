
import { useState } from "react";
import { toast } from "sonner";
import { 
  EmailServiceHook, 
  EmailType,
  SendEmailProps, 
  EmailResult 
} from "./emailTypes";
import { sendEmail } from "@/services/email/mailjetClient";
import { handleEmailSuccess, handleEmailError, logEmailAttempt } from "./emailUtils";

/**
 * Hook per gestire l'invio di email tramite Mailjet
 */
export const useEmailService = (): EmailServiceHook => {
  const [isSending, setIsSending] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  /**
   * Invia una email generica
   */
  const sendEmailWithType = async (props: SendEmailProps): Promise<EmailResult> => {
    setIsSending(true);
    setLastError(null);
    
    try {
      logEmailAttempt(props.type, props.email);
      
      // Aggiungi metadati per tracciamento e debug
      const metadata = {
        trackOpens: true,
        trackClicks: true,
        customId: `${props.type}_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      // Transform the props to match SendEmailOptions structure required by the service layer
      const emailServiceOptions = {
        to: [{ email: props.email, name: props.name }],
        subject: props.subject || getDefaultSubject(props.type),
        htmlContent: generateHtmlContent(props),
        textContent: props.data?.textContent,
        templateId: getTemplateIdForType(props.type),
        variables: {
          ...props.data,
          name: props.name,
          email: props.email,
          type: props.type,
          // Pass the referral_code explicitly if it exists in props.data
          referral_code: props.data?.referral_code || ""
        },
        ...metadata
      };
      
      console.log(`Sending ${props.type} email with data:`, JSON.stringify({
        to: emailServiceOptions.to,
        subject: emailServiceOptions.subject,
        variables: emailServiceOptions.variables
      }, null, 2));
      
      // Map between email types in hooks/email and services/email
      // This ensures compatibility between the two type systems
      const serviceEmailType = mapEmailType(props.type);
      
      const result = await sendEmail(serviceEmailType, emailServiceOptions);
      
      if (result.success) {
        handleEmailSuccess(props.email);
        setLastResponse(result.data);
      } else {
        const errorMsg = handleEmailError(result.error);
        setLastError(errorMsg);
      }
      
      return result;
    } catch (error) {
      const errorMsg = handleEmailError(error);
      setLastError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Invia un'email di benvenuto
   */
  const sendWelcomeEmail = async (email: string, name?: string): Promise<EmailResult> => {
    return sendEmailWithType({
      type: 'welcome',
      email,
      name,
      subject: 'Benvenuto in M1SSION'
    });
  };

  /**
   * Invia un'email di notifica
   */
  const sendNotificationEmail = async (
    email: string, 
    subject: string, 
    message: string,
    name?: string
  ): Promise<EmailResult> => {
    return sendEmailWithType({
      type: 'notification',
      email,
      name,
      subject,
      data: { message }
    });
  };

  /**
   * Invia un'email di marketing
   */
  const sendMarketingEmail = async (
    email: string, 
    subject: string, 
    htmlContent: string,
    name?: string
  ): Promise<EmailResult> => {
    return sendEmailWithType({
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
    sendEmail: sendEmailWithType,
    sendWelcomeEmail,
    sendNotificationEmail,
    sendMarketingEmail
  };
};

// Helper functions for email content generation
const getDefaultSubject = (type: EmailType): string => {
  switch (type) {
    case 'welcome':
      return 'Benvenuto in M1SSION';
    case 'notification':
      return 'Aggiornamento importante da M1SSION';
    case 'verification':
      return 'Verifica il tuo indirizzo email';
    case 'password_reset':
      return 'Ripristino della password';
    case 'marketing':
      return 'Novità da M1SSION';
    default:
      return 'Messaggio da M1SSION';
  }
};

const getTemplateIdForType = (type: EmailType): number | undefined => {
  switch (type) {
    case 'welcome':
      return 6974914; // Template ID for welcome emails
    case 'verification':
      return 6974920; // Example template ID for verification emails
    case 'notification':
      return 6974918; // Example template ID for notification emails
    default:
      return undefined; // Use dynamic content when no template is specified
  }
};

// Map the email types between hooks and services
const mapEmailType = (hookType: EmailType): any => {
  switch (hookType) {
    case 'welcome':
      return 'welcome';
    case 'notification':
      return 'notification';
    case 'verification':
      return 'verification';
    case 'password_reset':
      return 'password_reset';
    case 'marketing':
      return 'marketing';
    default:
      return hookType;
  }
};

const generateHtmlContent = (props: SendEmailProps): string => {
  // Use the data.htmlContent if provided (for marketing emails or custom content)
  if (props.data?.htmlContent) {
    return props.data.htmlContent;
  }
  
  // Otherwise, generate default content based on type
  // This is a fallback in case template rendering fails
  switch (props.type) {
    case 'welcome':
      return `<html><body><h1>Benvenuto in M1SSION, ${props.name || 'utente'}!</h1><p>Grazie per esserti unito a noi.</p></body></html>`;
    case 'notification':
      return `<html><body><h1>Notifica da M1SSION</h1><p>${props.data?.message || 'Hai una nuova notifica'}</p></body></html>`;
    case 'verification':
      return `<html><body><h1>Verifica il tuo indirizzo email</h1><p>Clicca sul link per verificare il tuo account.</p></body></html>`;
    default:
      return `<html><body><h1>M1SSION</h1><p>Grazie per essere parte della nostra community.</p></body></html>`;
  }
};

export * from "./emailTypes";
