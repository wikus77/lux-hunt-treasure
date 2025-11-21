
import { PreRegistrationFormData, FormErrors } from './types';

export const validateEmail = (email: string): boolean => {
  // Regex migliorata per la validazione delle email
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
};

export const validateForm = (data: PreRegistrationFormData): { isValid: boolean; errors: FormErrors } => {
  const errors = {
    name: "",
    email: ""
  };
  let isValid = true;

  // Validazione del nome con messaggio specifico
  if (!data.name.trim()) {
    errors.name = "Inserisci il tuo nome";
    isValid = false;
  } else if (data.name.trim().length < 2) {
    errors.name = "Il nome deve contenere almeno 2 caratteri";
    isValid = false;
  }
  
  // Validazione dell'email con messaggi specifici
  if (!data.email.trim()) {
    errors.email = "Inserisci il tuo indirizzo email";
    isValid = false;
  } else if (!validateEmail(data.email)) {
    errors.email = "Inserisci un indirizzo email valido";
    isValid = false;
  }

  return { isValid, errors };
};
