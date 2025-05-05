
// Tipo per i dati di input per la validazione del login
type LoginFormInput = {
  email: string;
  password: string;
};

// Utility di validazione per il form di login
export const validateLogin = (formData: LoginFormInput) => {
  const errors: Record<string, string> = {};

  // Validazione email
  if (!formData.email) {
    errors.email = "L'email è obbligatoria";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Formato email non valido";
  }

  // Validazione password
  if (!formData.password) {
    errors.password = "La password è obbligatoria";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
