
// Explicit type definition for registration form data
export type RegistrationFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Validation result type
export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

// Utility di validazione per il form di registrazione
export const validateRegistration = (formData: RegistrationFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validazione nome
  if (!formData.name) {
    errors.name = "Il nome è obbligatorio";
  }

  // Validazione email
  if (!formData.email) {
    errors.email = "L'email è obbligatoria";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Formato email non valido";
  }

  // Validazione password
  if (!formData.password) {
    errors.password = "La password è obbligatoria";
  } else if (formData.password.length < 6) {
    errors.password = "La password deve contenere almeno 6 caratteri";
  }

  // Validazione conferma password
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Conferma la password";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Le password non coincidono";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
