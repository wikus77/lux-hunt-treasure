
// Email validation utility for registration emails

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  statusCode?: number;
}

export const validateRegistrationEmail = (requestData: any): EmailValidationResult => {
  const { email, name, formType, referral_code } = requestData;

  // 2. EMAIL VALIDATION - Validate email field
  if (!email || typeof email !== 'string') {
    console.error("Missing or invalid email parameter");
    return {
      isValid: false,
      error: "Parametro email mancante o non valido",
      statusCode: 400
    };
  }

  // Validate email format (RFC compliant)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("Invalid email format");
    return {
      isValid: false,
      error: "Formato email non valido",
      statusCode: 400
    };
  }

  // Check email length (max 100 characters)
  if (email.length > 100) {
    console.error("Email too long");
    return {
      isValid: false,
      error: "Email troppo lunga (massimo 100 caratteri)",
      statusCode: 400
    };
  }

  // Check for HTML/script tags in any field
  const htmlScriptRegex = /<[^>]*>/g;
  if (htmlScriptRegex.test(email) || (name && htmlScriptRegex.test(name)) || 
      (formType && htmlScriptRegex.test(formType)) || (referral_code && htmlScriptRegex.test(referral_code))) {
    console.error("HTML/script tags detected in input");
    return {
      isValid: false,
      error: "I campi non possono contenere tag HTML o script",
      statusCode: 400
    };
  }

  // Validate required fields
  if (!formType) {
    return {
      isValid: false,
      error: "Tipo di form mancante",
      statusCode: 400
    };
  }

  return { isValid: true };
};
