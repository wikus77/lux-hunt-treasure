
import { ContactData, EmailType } from "./types.ts";

// Validate contact data based on email type
export function validateContactData(data: ContactData): { isValid: boolean; errorMessage?: string } {
  // Validate required common fields
  if (!data.type) {
    return { isValid: false, errorMessage: 'Il tipo di email è obbligatorio' };
  }

  const emailType: EmailType = data.type;

  if (emailType === 'contact') {
    // Contact form validation
    if (!data.name) {
      return { isValid: false, errorMessage: 'Il nome è obbligatorio' };
    }
    
    if (!data.email) {
      return { isValid: false, errorMessage: "L'email è obbligatoria" };
    }
    
    if (!data.message) {
      return { isValid: false, errorMessage: 'Il messaggio è obbligatorio' };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { isValid: false, errorMessage: "Il formato dell'email non è valido" };
    }
  } else if (['welcome', 'notification', 'marketing', 'pre_registration'].includes(emailType)) {
    // Direct email sending - validate recipients
    if (!data.to || data.to.length === 0) {
      return { isValid: false, errorMessage: 'I destinatari sono obbligatori' };
    }
    
    // Validate that all recipients have valid email addresses
    for (const recipient of data.to) {
      const recipientEmail = 'email' in recipient ? recipient.email : recipient.Email;
      if (!recipientEmail) {
        return { isValid: false, errorMessage: "L'email del destinatario è obbligatoria" };
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientEmail)) {
        return { isValid: false, errorMessage: `Il formato dell'email '${recipientEmail}' non è valido` };
      }
    }
    
    if (!data.subject) {
      return { isValid: false, errorMessage: "L'oggetto dell'email è obbligatorio" };
    }
    
    if (!data.from || !data.from.Email) {
      return { isValid: false, errorMessage: "L'email del mittente è obbligatoria" };
    }
  } else {
    return { isValid: false, errorMessage: `Tipo di email '${emailType}' non supportato` };
  }
  
  return { isValid: true };
}
