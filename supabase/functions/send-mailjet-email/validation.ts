
import { ContactData } from "./types.ts";

// Function to validate email format
export function isValidEmail(email: string): boolean {
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

// Function to validate contact form data
export function validateContactData(data: ContactData): {isValid: boolean, errorMessage?: string} {
  const { name, email, message, type = 'contact', to, from } = data;
  
  // Check required fields for contact form
  if (type === 'contact' && (!name || !email || !message)) {
    return {
      isValid: false,
      errorMessage: 'Campi obbligatori mancanti per email di contatto'
    };
  }
  
  // Validate sender email format
  if (email && !isValidEmail(email)) {
    return {
      isValid: false,
      errorMessage: `Formato email mittente non valido: ${email}`
    };
  }
  
  // Validate 'from' email if provided
  if (from?.email && !isValidEmail(from.email)) {
    return {
      isValid: false,
      errorMessage: `Formato email "from" non valido: ${from.email}`
    };
  }
  
  // Validate all recipient emails if provided
  if (to && Array.isArray(to)) {
    for (const recipient of to) {
      if (!isValidEmail(recipient.email)) {
        return {
          isValid: false,
          errorMessage: `Formato email destinatario non valido: ${recipient.email}`
        };
      }
    }
  }
  
  return { isValid: true };
}
