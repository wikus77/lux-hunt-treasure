/**
 * Content Security Policy Configuration
 * M1SSION™ - Centralized Security Headers
 */

export interface CSPConfig {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  connectSrc: string[];
  fontSrc: string[];
  frameSrc: string[];
  objectSrc: string[];
  mediaSrc: string[];
  workerSrc: string[];
}

// Base CSP configuration
export const BASE_CSP: CSPConfig = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
    "https://js.stripe.com",
    "https://maps.googleapis.com"
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind and component libraries
    "https://fonts.googleapis.com"
  ],
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "https://*.stripe.com",
    "https://maps.googleapis.com",
    "https://maps.gstatic.com"
  ],
  connectSrc: [
    "'self'",
    "https://*.supabase.co",
    "https://api.stripe.com",
    "https://maps.googleapis.com",
    "https://*.sentry.io",
    "https://*.ingest.sentry.io",
    "wss://*.supabase.co", // WebSocket for realtime
    process.env.NODE_ENV === 'development' ? 'ws://localhost:*' : null
  ].filter(Boolean) as string[],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  frameSrc: [
    "https://js.stripe.com"
  ],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  workerSrc: ["'self'", "blob:"]
};

// Production CSP (stricter)
export const PRODUCTION_CSP: CSPConfig = {
  ...BASE_CSP,
  scriptSrc: BASE_CSP.scriptSrc.filter(src => src !== "'unsafe-inline'").concat([
    "'unsafe-eval'" // Only if absolutely necessary
  ])
};

/**
 * Generate CSP string from configuration
 */
export function generateCSP(config: CSPConfig): string {
  return Object.entries(config)
    .map(([directive, sources]) => {
      const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabDirective} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Additional security headers
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
} as const;

/**
 * Get appropriate CSP for current environment
 */
export function getEnvironmentCSP(): string {
  const config = import.meta.env.PROD ? PRODUCTION_CSP : BASE_CSP;
  return generateCSP(config);
}

/**
 * Apply security headers to meta tags (client-side fallback)
 */
export function applySecurityHeaders(): void {
  // CSP
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = getEnvironmentCSP();
  document.head.appendChild(cspMeta);

  // Other security headers as meta tags (fallback)
  Object.entries(SECURITY_HEADERS).forEach(([name, value]) => {
    const existingMeta = document.querySelector(`meta[http-equiv="${name}"]`);
    if (!existingMeta) {
      const meta = document.createElement('meta');
      meta.httpEquiv = name;
      meta.content = value;
      document.head.appendChild(meta);
    }
  });
}
