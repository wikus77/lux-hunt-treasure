
import { PreRegistrationFormData, FormErrors } from './types';

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateForm = (data: PreRegistrationFormData): { isValid: boolean; errors: FormErrors } => {
  const errors = {
    name: "",
    email: ""
  };
  let isValid = true;

  // Validate name
  if (!data.name.trim()) {
    errors.name = "Inserisci il tuo nome";
    isValid = false;
  }
  
  // Validate email
  if (!data.email.trim()) {
    errors.email = "Inserisci il tuo indirizzo email";
    isValid = false;
  } else if (!validateEmail(data.email)) {
    errors.email = "Inserisci un indirizzo email valido";
    isValid = false;
  }

  return { isValid, errors };
};
