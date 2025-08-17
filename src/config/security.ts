// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Security Configuration

export const SECURITY_CONFIG = {
  // Rate limiting configuration
  RATE_LIMIT_WINDOW_MS: 60000,
  RATE_LIMIT_MAX_ATTEMPTS: 5,

  // Session configuration
  SESSION_TIMEOUT_MS: 1800000,
  AUTO_LOGOUT_ENABLED: true,

  // Input validation settings
  MAX_INPUT_LENGTH: 1000,
  ENABLE_XSS_PROTECTION: true,
  ENABLE_CSRF_PROTECTION: true,

  // Security monitoring
  ENABLE_SECURITY_LOGGING: true,
  LOG_FAILED_ATTEMPTS: true,

  // Content Security Policy
  CSP_ENABLED: true,

  // HTTPS enforcement
  FORCE_HTTPS: true
} as const;

export default SECURITY_CONFIG;