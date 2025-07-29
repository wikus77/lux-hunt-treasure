// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Enhanced Form Validation with Security

import { sanitizeText, sanitizeEmail, sanitizePassword } from './input-sanitizer';

export interface EnhancedFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  cleanData: Partial<EnhancedFormData>;
}

/**
 * Enhanced validation with input sanitization and security checks
 */
export const validateEnhancedRegistration = (formData: EnhancedFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  const cleanData: Partial<EnhancedFormData> = {};

  // Sanitize and validate name
  const cleanName = sanitizeText(formData.name);
  if (!cleanName) {
    errors.name = "Il nome è obbligatorio";
  } else if (cleanName.length < 2) {
    errors.name = "Il nome deve contenere almeno 2 caratteri";
  } else if (cleanName.length > 50) {
    errors.name = "Il nome non può superare i 50 caratteri";
  } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(cleanName)) {
    errors.name = "Il nome può contenere solo lettere, spazi, apostrofi e trattini";
  }
  cleanData.name = cleanName;

  // Sanitize and validate email
  const cleanEmail = sanitizeEmail(formData.email);
  if (!cleanEmail) {
    errors.email = "L'email è obbligatoria";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    errors.email = "Formato email non valido";
  } else if (cleanEmail.length > 100) {
    errors.email = "L'email non può superare i 100 caratteri";
  }
  cleanData.email = cleanEmail;

  // Sanitize and validate password
  const cleanPassword = sanitizePassword(formData.password);
  if (!cleanPassword) {
    errors.password = "La password è obbligatoria";
  } else if (cleanPassword.length < 8) {
    errors.password = "La password deve contenere almeno 8 caratteri";
  } else if (cleanPassword.length > 100) {
    errors.password = "La password non può superare i 100 caratteri";
  } else if (
    !/[A-Z]/.test(cleanPassword) || 
    !/[a-z]/.test(cleanPassword) || 
    !/[0-9]/.test(cleanPassword)
  ) {
    errors.password = "La password deve contenere almeno una lettera maiuscola, una minuscola e un numero";
  } else if (/[<>'"&]/.test(cleanPassword)) {
    errors.password = "La password contiene caratteri non consentiti";
  }
  cleanData.password = cleanPassword;

  // Validate password confirmation
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Conferma la password";
  } else if (cleanPassword !== formData.confirmPassword) {
    errors.confirmPassword = "Le password non coincidono";
  }
  cleanData.confirmPassword = formData.confirmPassword;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanData
  };
};

/**
 * Enhanced login validation
 */
export const validateEnhancedLogin = (email: string, password: string): ValidationResult => {
  const errors: Record<string, string> = {};
  const cleanData: Partial<EnhancedFormData> = {};

  // Sanitize and validate email
  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail) {
    errors.email = "L'email è obbligatoria";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    errors.email = "Formato email non valido";
  }
  cleanData.email = cleanEmail;

  // Sanitize and validate password
  const cleanPassword = sanitizePassword(password);
  if (!cleanPassword) {
    errors.password = "La password è obbligatoria";
  } else if (cleanPassword.length > 100) {
    errors.password = "Password troppo lunga";
  }
  cleanData.password = cleanPassword;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanData
  };
};

/**
 * Check for common password vulnerabilities
 */
export const checkPasswordSecurity = (password: string): string[] => {
  const warnings: string[] = [];
  
  // Check for common patterns
  const commonPatterns = /123|abc|password|qwerty/i;
  if (commonPatterns.test(password)) {
    warnings.push("Evita sequenze comuni come '123' o 'password'");
  }
  
  if (password.length < 12) {
    warnings.push("Considera di usare almeno 12 caratteri per maggiore sicurezza");
  }
  
  // Check for special characters
  const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
  if (!specialChars.test(password)) {
    warnings.push("Aggiungi caratteri speciali per maggiore sicurezza");
  }
  
  return warnings;
};