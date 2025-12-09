// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Production Security Configuration

// CRITICAL: All debug flags DISABLED in production
export const SECURITY_CONFIG = {
  // Debug completely disabled in production builds
  DEBUG_AUTH: false,
  DEBUG_UNIFIED_AUTH: false,
  DEBUG_LOGS: false,
  
  // Production security settings
  ENABLE_AUDIT_LOGGING: true,
  ENABLE_RATE_LIMITING: true,
  SECURE_SESSION_MANAGEMENT: true,
  
  // Rate limiting thresholds
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_RATE_WINDOW_MINUTES: 15,
  MAX_REGISTER_ATTEMPTS: 3,
  REGISTER_RATE_WINDOW_MINUTES: 60,
  
  // Session security
  // DISABLED: L'utente resta loggato finché non fa logout manuale
  SESSION_TIMEOUT_MINUTES: 0, // Disabled
  AUTO_LOGOUT_ON_INACTIVITY: false, // Solo logout manuale
} as const;

/**
 * Secure logging function - only logs in development
 */
export const secureLog = (message: string, data?: any) => {
  // Completely silent in production
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔐 [SECURE] ${message}`, data || '');
  }
};

/**
 * Security alert function - logs security events without exposing sensitive data
 */
export const securityAlert = (event: string, details?: any) => {
  // Always log security events but sanitize in production
  if (process.env.NODE_ENV === 'production') {
    // Only log essential security info in production
    console.warn(`🚨 Security Event: ${event}`);
  } else {
    console.warn(`🚨 Security Event: ${event}`, details);
  }
};

export default SECURITY_CONFIG;