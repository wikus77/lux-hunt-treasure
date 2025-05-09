
import { ContactData } from "./types.ts";

/**
 * Validate the contact data
 */
export function validateContactData(data: ContactData): { isValid: boolean; errorMessage?: string } {
  // Validate required fields based on email type
  if (data.type === 'contact') {
    if (!data.email) {
      return { isValid: false, errorMessage: "Email obbligatoria mancante" };
    }
    // Name is optional, message is optional for structured contact forms
  } else {
    // For other email types like marketing or notifications
    if (!data.to || data.to.length === 0) {
      return { isValid: false, errorMessage: "Destinatario email mancante" };
    }
  }

  return { isValid: true };
}
