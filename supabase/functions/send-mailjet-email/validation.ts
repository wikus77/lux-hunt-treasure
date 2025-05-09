
import { ContactData } from "./types.ts";

// Function to validate email contact data
export function validateContactData(data: ContactData): { isValid: boolean; errorMessage?: string } {
  if (!data) {
    return { isValid: false, errorMessage: 'Nessun dato fornito' };
  }
  
  console.log("Validating email data for type:", data.type);
  
  // Validate based on email type
  switch (data.type) {
    case 'contact':
      // For contact form emails
      if (!data.email) {
        return { isValid: false, errorMessage: "L'email del mittente è obbligatoria" };
      }
      break;
      
    case 'welcome':
    case 'notification':
    case 'marketing':
      // For transactional emails
      if (!data.to || data.to.length === 0) {
        return { isValid: false, errorMessage: "Almeno un destinatario è obbligatorio" };
      }
      
      // Check that all recipients have valid email addresses
      const invalidRecipients = data.to.filter(
        recipient => !recipient.email && !recipient.Email
      );
      
      if (invalidRecipients.length > 0) {
        return { 
          isValid: false, 
          errorMessage: "Alcuni destinatari non hanno un indirizzo email valido" 
        };
      }
      break;
      
    default:
      return { 
        isValid: false, 
        errorMessage: `Tipo di email non supportato: ${data.type}` 
      };
  }
  
  return { isValid: true };
}
