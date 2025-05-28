
import { validateRegistrationEmail } from '../validateRegistrationEmail';

describe('validateRegistrationEmail', () => {
  it('should return valid for correct email and data', () => {
    const validData = {
      email: 'test@example.com',
      name: 'Test User',
      formType: 'preregistrazione',
      referral_code: 'ABC123'
    };

    const result = validateRegistrationEmail(validData);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return invalid for missing email', () => {
    const invalidData = {
      name: 'Test User',
      formType: 'preregistrazione'
    };

    const result = validateRegistrationEmail(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Parametro email mancante o non valido');
    expect(result.statusCode).toBe(400);
  });

  it('should return invalid for malformed email', () => {
    const invalidData = {
      email: 'invalid-email',
      name: 'Test User',
      formType: 'preregistrazione'
    };

    const result = validateRegistrationEmail(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Formato email non valido');
    expect(result.statusCode).toBe(400);
  });

  it('should return invalid for email too long', () => {
    const invalidData = {
      email: 'a'.repeat(95) + '@test.com', // Over 100 characters
      name: 'Test User',
      formType: 'preregistrazione'
    };

    const result = validateRegistrationEmail(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Email troppo lunga (massimo 100 caratteri)');
    expect(result.statusCode).toBe(400);
  });

  it('should return invalid for HTML/script tags in fields', () => {
    const invalidData = {
      email: 'test@example.com',
      name: '<script>alert("hack")</script>',
      formType: 'preregistrazione'
    };

    const result = validateRegistrationEmail(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('I campi non possono contenere tag HTML o script');
    expect(result.statusCode).toBe(400);
  });

  it('should return invalid for missing formType', () => {
    const invalidData = {
      email: 'test@example.com',
      name: 'Test User'
    };

    const result = validateRegistrationEmail(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Tipo di form mancante');
    expect(result.statusCode).toBe(400);
  });
});
