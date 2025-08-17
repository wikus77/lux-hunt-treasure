// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Enhanced Input Validation and Sanitization

import DOMPurify from 'dompurify';

export interface ValidationResult {
  isValid: boolean;
  sanitized?: string;
  errors: string[];
}

export class InputValidator {
  /**
   * Validate and sanitize email input
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email || typeof email !== 'string') {
      errors.push('Email is required');
      return { isValid: false, errors };
    }

    const sanitized = DOMPurify.sanitize(email.trim().toLowerCase());
    
    // Basic email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(sanitized)) {
      errors.push('Invalid email format');
    }

    if (sanitized.length > 254) {
      errors.push('Email too long');
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (password.length > 128) {
      errors.push('Password too long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      sanitized: password, // Don't sanitize passwords
      errors
    };
  }

  /**
   * Validate and sanitize text input
   */
  static validateText(text: string, maxLength: number = 1000): ValidationResult {
    const errors: string[] = [];
    
    if (typeof text !== 'string') {
      errors.push('Invalid input type');
      return { isValid: false, errors };
    }

    const sanitized = DOMPurify.sanitize(text.trim());
    
    if (sanitized.length > maxLength) {
      errors.push(`Text too long (max ${maxLength} characters)`);
    }

    // Check for common injection patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /vbscript:/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(text)) {
        errors.push('Potentially unsafe content detected');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  /**
   * Validate UUID format
   */
  static validateUUID(uuid: string): ValidationResult {
    const errors: string[] = [];
    
    if (!uuid || typeof uuid !== 'string') {
      errors.push('UUID is required');
      return { isValid: false, errors };
    }

    const sanitized = DOMPurify.sanitize(uuid.trim());
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(sanitized)) {
      errors.push('Invalid UUID format');
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  /**
   * Validate coordinates (latitude, longitude)
   */
  static validateCoordinates(lat: number, lng: number): ValidationResult {
    const errors: string[] = [];
    
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      errors.push('Coordinates must be numbers');
      return { isValid: false, errors };
    }

    if (lat < -90 || lat > 90) {
      errors.push('Latitude must be between -90 and 90');
    }

    if (lng < -180 || lng > 180) {
      errors.push('Longitude must be between -180 and 180');
    }

    if (isNaN(lat) || isNaN(lng)) {
      errors.push('Invalid coordinate values');
    }

    return {
      isValid: errors.length === 0,
      sanitized: JSON.stringify({ lat, lng }),
      errors
    };
  }

  /**
   * Rate limiting validator
   */
  static validateRateLimit(
    identifier: string,
    action: string,
    maxAttempts: number = 5,
    windowMs: number = 60000
  ): boolean {
    const key = `rate_limit_${identifier}_${action}`;
    const now = Date.now();
    
    const stored = localStorage.getItem(key);
    let attempts: { timestamp: number; count: number } = stored 
      ? JSON.parse(stored) 
      : { timestamp: now, count: 0 };

    // Reset if window expired
    if (now - attempts.timestamp > windowMs) {
      attempts = { timestamp: now, count: 0 };
    }

    attempts.count++;
    localStorage.setItem(key, JSON.stringify(attempts));

    return attempts.count <= maxAttempts;
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }
}

export default InputValidator;