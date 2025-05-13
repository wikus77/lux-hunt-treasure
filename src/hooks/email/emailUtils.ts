
import { toast } from "sonner";
import { EmailType } from "./emailTypes";

/**
 * Logs an email sending attempt
 */
export const logEmailAttempt = (type: EmailType, email: string): void => {
  console.log(`Attempting to send ${type} email to ${email}`);
};

/**
 * Handles success for email sending
 */
export const handleEmailSuccess = (email: string): void => {
  console.log(`Email sent successfully to ${email}`);
};

/**
 * Handles errors for email sending
 */
export const handleEmailError = (error: any): string => {
  let errorMessage = "Errore nell'invio dell'email.";
  
  if (error) {
    console.error("Email sending failed:", error);
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.error) {
      errorMessage = typeof error.error === 'string' 
        ? error.error 
        : JSON.stringify(error.error);
    }
  }
  
  return errorMessage;
};
