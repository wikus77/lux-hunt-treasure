// Type definitions
export type RegistrationFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Explicit type definition for login form data
export type LoginFormData = {
  email: string;
  password: string;
};

// Validation result type
export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

/**
 * Validates registration form data
 * @param formData Data from registration form
 * @returns Validation result with isValid flag and any errors
 */
export const validateRegistration = (formData: RegistrationFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validazione nome
  if (!formData.name) {
    errors.name = "Il nome è obbligatorio";
  }

  // Validazione email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    errors.email = "L'email è obbligatoria";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Formato email non valido";
  }

  // Validazione password
  if (!formData.password) {
    errors.password = "La password è obbligatoria";
  } else if (formData.password.length < 8) {
    errors.password = "La password deve contenere almeno 8 caratteri";
  } else if (
    !/[A-Z]/.test(formData.password) || 
    !/[a-z]/.test(formData.password) || 
    !/[0-9]/.test(formData.password)
  ) {
    errors.password = "La password deve contenere almeno una lettera maiuscola, una minuscola e un numero";
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

// Validation utility for login form
export const validateLogin = (formData: LoginFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Email validation
  if (!formData.email) {
    errors.email = "L'email è obbligatoria";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Formato email non valido";
  }

  // Password validation
  if (!formData.password) {
    errors.password = "La password è obbligatoria";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
