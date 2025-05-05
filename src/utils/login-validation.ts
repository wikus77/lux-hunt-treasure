
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
