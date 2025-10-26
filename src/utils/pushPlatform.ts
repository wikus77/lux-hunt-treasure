// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Platform normalization and diagnostics for Web Push

export type PushPlatform = 'web' | 'desktop' | 'ios' | 'android';

/**
 * Safe iOS detection that works even with "Request Desktop Site" enabled.
 * Uses maxTouchPoints to detect iOS masquerading as macOS.
 */
export function detectPlatformSafe(): PushPlatform {
  const ua = navigator.userAgent.toLowerCase();
  
  // Check for iOS - including iPads pretending to be macOS
  const isIOS =
    /iphone|ipad|ipod/.test(ua) ||
    (/macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  
  const isAndroid = /android/.test(ua);
  
  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  return 'desktop';
}

/**
 * Extract host from endpoint URL safely
 */
export function endpointHost(endpoint?: string): string {
  try { 
    return new URL(endpoint ?? '').host; 
  } catch { 
    return ''; 
  }
}

/**
 * Normalize platform based on endpoint characteristics
 * APNs endpoints should use 'web' platform for consistency
 */
export function normalizePlatform(endpoint?: string, hinted?: PushPlatform): PushPlatform {
  const host = endpointHost(endpoint);
  if (host === 'web.push.apple.com') {
    return 'ios'; // APNs per Safari iOS/standalone
  }
  return (hinted ?? detectPlatformSafe());
}