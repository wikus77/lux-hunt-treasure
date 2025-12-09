// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Rate Limiting Utility for Edge Functions

import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Rate limit configurations per action type
const RATE_LIMITS: Record<string, { maxRequests: number; windowSeconds: number }> = {
  // Public endpoints
  'claim-marker-reward': { maxRequests: 10, windowSeconds: 60 },     // 10 claims per minute
  'buzz-map': { maxRequests: 5, windowSeconds: 60 },                  // 5 buzz per minute
  'final-shoot': { maxRequests: 2, windowSeconds: 86400 },            // 2 per day
  
  // Auth endpoints
  'login': { maxRequests: 5, windowSeconds: 300 },                    // 5 per 5 minutes
  'password-reset': { maxRequests: 3, windowSeconds: 3600 },          // 3 per hour
  
  // Payment endpoints
  'create-checkout': { maxRequests: 10, windowSeconds: 60 },          // 10 per minute
  'create-payment-intent': { maxRequests: 10, windowSeconds: 60 },    // 10 per minute
  
  // Push notifications
  'push-send': { maxRequests: 100, windowSeconds: 60 },               // 100 per minute (admin)
  
  // Default for unknown actions
  'default': { maxRequests: 30, windowSeconds: 60 },                  // 30 per minute
};

/**
 * Check if a request should be rate limited
 * 
 * @param userId - User ID or IP address for anonymous requests
 * @param action - Action type (e.g., 'claim-marker-reward', 'login')
 * @returns { allowed: boolean, remaining: number, resetAt: Date }
 */
export async function checkRateLimit(
  userId: string,
  action: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date; error?: string }> {
  try {
    const admin = createClient(SB_URL, SERVICE_KEY, {
      auth: { persistSession: false }
    });
    
    const config = RATE_LIMITS[action] || RATE_LIMITS['default'];
    const windowStart = new Date(Date.now() - config.windowSeconds * 1000);
    const resetAt = new Date(Date.now() + config.windowSeconds * 1000);
    
    // Check existing requests in time window
    const { count, error } = await admin
      .from('rate_limit_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', action)
      .gte('created_at', windowStart.toISOString());
    
    if (error) {
      // If table doesn't exist or other error, allow request but log
      console.warn(`[RATE-LIMIT] Check failed for ${action}:`, error.message);
      return { allowed: true, remaining: config.maxRequests, resetAt };
    }
    
    const currentCount = count || 0;
    const remaining = Math.max(0, config.maxRequests - currentCount);
    const allowed = currentCount < config.maxRequests;
    
    // Log this request
    if (allowed) {
      await admin
        .from('rate_limit_log')
        .insert({
          user_id: userId,
          action,
          ip_address: null, // Could be passed from request headers
          created_at: new Date().toISOString()
        })
        .then(() => {})
        .catch((e) => console.warn('[RATE-LIMIT] Log insert failed:', e));
    }
    
    return { allowed, remaining: remaining - (allowed ? 1 : 0), resetAt };
    
  } catch (err) {
    console.error('[RATE-LIMIT] Exception:', err);
    // On error, allow request but log
    return { 
      allowed: true, 
      remaining: 0, 
      resetAt: new Date(Date.now() + 60000),
      error: 'Rate limit check failed'
    };
  }
}

/**
 * Create rate limit response headers
 */
export function rateLimitHeaders(
  remaining: number, 
  resetAt: Date, 
  limit: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset': String(Math.floor(resetAt.getTime() / 1000)),
  };
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitExceeded(resetAt: Date): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Troppe richieste. Riprova più tardi.',
      retry_after: Math.ceil((resetAt.getTime() - Date.now()) / 1000)
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((resetAt.getTime() - Date.now()) / 1000)),
        ...rateLimitHeaders(0, resetAt, 0)
      }
    }
  );
}

/**
 * Wrapper function to apply rate limiting to an Edge Function
 * 
 * Usage:
 * ```
 * const rateLimited = await applyRateLimit(req, 'claim-marker-reward', userId);
 * if (rateLimited) return rateLimited;
 * // Continue with normal function logic
 * ```
 */
export async function applyRateLimit(
  _req: Request,
  action: string,
  userId: string
): Promise<Response | null> {
  const { allowed, remaining, resetAt } = await checkRateLimit(userId, action);
  
  if (!allowed) {
    console.log(`[RATE-LIMIT] Blocked ${action} for user ${userId.slice(-8)}`);
    return rateLimitExceeded(resetAt);
  }
  
  // Add rate limit headers to successful requests
  // This will be handled by the caller
  return null;
}
