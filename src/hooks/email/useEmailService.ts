
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
      const enhancedProps = {
        ...props,
        trackOpens: true,
        trackClicks: true,
        customId: `${props.type}_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      const result = await sendEmail(props.type, enhancedProps);
      
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

export * from "./emailTypes";
