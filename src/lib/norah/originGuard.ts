/**
 * © 2025 Joseph MULÉ – M1SSION™ – Norah AI 2.0
 * Origin allowlist validation for Functions calls
 */

const ALLOWLIST = [
  /\.m1ssion\.pages\.dev$/i,
  /^localhost$/i,
  /^127\.0\.0\.1$/i,
];

export function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  
  try {
    const host = new URL(origin).hostname;
    return ALLOWLIST.some(pattern => pattern.test(host));
  } catch {
    return false;
  }
}

export function assertAllowedOrHint(origin: string): void {
  if (!isOriginAllowed(origin)) {
    console.warn(
      '[Norah] Origin not allowlisted for Functions calls:',
      origin,
      '\nPlease use the app from https://*.m1ssion.pages.dev'
    );
  }
}

export function getCurrentOrigin(): string {
  return typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://m1ssion.pages.dev';
}
