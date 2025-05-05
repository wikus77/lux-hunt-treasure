
// Explicitly define the input type for validation
type RegistrationFormInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Validation utility for registration form
export const validateRegistration = (formData: RegistrationFormInput) => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!formData.name) {
    errors.name = "Il nome è obbligatorio";
  }

  // Email validation
  if (!formData.email) {
    errors.email = "L'email è obbligatoria";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Formato email non valido";
  }

  // Password validation
  if (!formData.password) {
    errors.password = "La password è obbligatoria";
  } else if (formData.password.length < 6) {
    errors.password = "La password deve contenere almeno 6 caratteri";
  }

  // Confirm password validation
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
