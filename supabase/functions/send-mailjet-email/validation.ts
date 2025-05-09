
import { ContactData } from "./types.ts";

/**
 * Validate the contact data
 */
export function validateContactData(data: ContactData): { isValid: boolean; errorMessage?: string } {
  console.log("Validating email data for type:", data.type);
  
  // Check if type is provided
  if (!data.type) {
    return { isValid: false, errorMessage: "Tipo di email non specificato" };
  }
  
  // Validate required fields based on email type
  if (data.type === 'contact') {
    if (!data.email) {
      return { isValid: false, errorMessage: "Email mittente obbligatoria mancante" };
    }
    // Name is optional, message is optional for structured contact forms
  } else if (data.type === 'welcome' || data.type === 'notification' || data.type === 'transactional') {
    // For welcome, notification or transactional emails
    if (!data.to || (Array.isArray(data.to) && data.to.length === 0)) {
      return { isValid: false, errorMessage: "Destinatario email mancante" };
    }
    
    // Check each recipient email
    if (Array.isArray(data.to)) {
      for (const recipient of data.to) {
        if (!recipient.email && !recipient.Email) {
          return { isValid: false, errorMessage: "Indirizzo email destinatario mancante" };
        }
      }
    }
  } else if (data.type === 'marketing') {
    // For marketing emails
    if (!data.to || (Array.isArray(data.to) && data.to.length === 0)) {
      return { isValid: false, errorMessage: "Destinatario email mancante" };
    }
    
    if (!data.subject) {
      return { isValid: false, errorMessage: "Oggetto obbligatorio per email di marketing" };
    }
  }

  // All validations passed
  return { isValid: true };
}

/**
 * Validate email format
 */
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
