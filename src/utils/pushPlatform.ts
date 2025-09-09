// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Platform normalization and diagnostics for Web Push

export type PushPlatform = 'web' | 'desktop' | 'ios' | 'android';

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
    return 'web'; // APNs per Safari iOS/standalone
  }
  return (hinted ?? 'desktop');
}