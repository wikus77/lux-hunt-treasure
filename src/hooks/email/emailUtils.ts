
import { toast } from 'sonner';

/**
 * Handle email sending success
 */
export const handleEmailSuccess = (email: string) => {
  console.log("Email sent successfully to:", email);
  toast.success("Email inviata con successo", {
    description: `L'email è stata inviata a ${email}`
  });
};

/**
 * Handle email sending error
 */
export const handleEmailError = (error: any) => {
  const errorMessage = error?.toString() || "Si è verificato un errore nell'invio dell'email";
  console.error("Error sending email:", error);
  toast.error(`Errore nell'invio dell'email: ${errorMessage}`);
  return errorMessage;
};

/**
 * Log email sending attempt
 */
export const logEmailAttempt = (type: string, email: string) => {
  console.log(`Attempting to send ${type} email to ${email}`);
};
