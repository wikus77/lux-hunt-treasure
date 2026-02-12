/**
 * M1SSION™ Rate Limiting & Replay Defense
 * Shared helpers for Edge Functions
 * 
 * © 2026 Joseph MULÉ – NIYVORA KFT™ – ALL RIGHTS RESERVED
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  maxRequests: number;
  remaining: number;
  resetAt: string;
}

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
}

// Default configurations
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // User-based endpoints
  'verify-iap-purchase': { maxRequests: 5, windowSeconds: 60 },
  'restore-iap-subscription': { maxRequests: 3, windowSeconds: 60 },
  
  // User hourly limits
  'verify-iap-purchase-hourly': { maxRequests: 20, windowSeconds: 3600 },
  'restore-iap-subscription-hourly': { maxRequests: 10, windowSeconds: 3600 },
  
  // Webhook endpoints (IP-based, more lenient)
  'iap-apple-notifications': { maxRequests: 60, windowSeconds: 60 },
  'iap-google-rtdn': { maxRequests: 60, windowSeconds: 60 },
  
  // Sync endpoint (service/cron only)
  'sync-subscription-status': { maxRequests: 10, windowSeconds: 60 },
};

/**
 * Check rate limit via Supabase RPC
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  limitKey: string,
  limitType: 'user' | 'ip' | 'endpoint' | 'transaction',
  endpoint: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const cfg = config || RATE_LIMIT_CONFIGS[endpoint] || { maxRequests: 10, windowSeconds: 60 };
  
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_limit_key: limitKey,
    p_limit_type: limitType,
    p_endpoint: endpoint,
    p_max_requests: cfg.maxRequests,
    p_window_seconds: cfg.windowSeconds,
  });
  
  if (error) {
    console.error('[RateLimit] Error checking rate limit:', error);
    // Fail open - allow request if rate limit check fails
    return {
      allowed: true,
      currentCount: 0,
      maxRequests: cfg.maxRequests,
      remaining: cfg.maxRequests,
      resetAt: new Date(Date.now() + cfg.windowSeconds * 1000).toISOString(),
    };
  }
  
  return {
    allowed: data.allowed,
    currentCount: data.current_count,
    maxRequests: data.max_requests,
    remaining: data.remaining,
    resetAt: data.reset_at,
  };
}

/**
 * Generate rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): RateLimitHeaders {
  return {
    'X-RateLimit-Limit': result.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt,
  };
}

/**
 * Check for replay attack via Supabase RPC
 */
export async function checkReplay(
  supabase: SupabaseClient,
  userId: string | null,
  transactionId: string | null,
  purchaseToken: string | null,
  endpoint: string,
  ttlMinutes: number = 10
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_replay', {
    p_user_id: userId,
    p_transaction_id: transactionId,
    p_purchase_token: purchaseToken,
    p_endpoint: endpoint,
    p_ttl_minutes: ttlMinutes,
  });
  
  if (error) {
    console.error('[ReplayDefense] Error checking replay:', error);
    // 🔧 [IAP_FIX_V12] Changed to FAIL OPEN - don't block legitimate purchases
    // The idempotency check in verify-iap-purchase will catch true duplicates
    // Previously "fail closed" was blocking all transactions when DB check failed
    return false;
  }
  
  return data === true;  // True means it's a replay
}

/**
 * Create 429 Too Many Requests response
 */
export function rateLimitResponse(result: RateLimitResult, correlationId: string): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Rate limit exceeded',
      retry_after_seconds: Math.ceil((new Date(result.resetAt).getTime() - Date.now()) / 1000),
      correlation_id: correlationId,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(result),
        'Retry-After': Math.ceil((new Date(result.resetAt).getTime() - Date.now()) / 1000).toString(),
      },
    }
  );
}

/**
 * Create 409 Conflict response for replay detection
 */
export function replayResponse(correlationId: string): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Duplicate request detected',
      correlation_id: correlationId,
    }),
    {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Generate correlation ID for request tracking
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Structured log helper
 */
export function structuredLog(
  level: 'info' | 'warn' | 'error',
  message: string,
  correlationId: string,
  data?: Record<string, any>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlation_id: correlationId,
    ...data,
  };
  
  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Simple rate limit wrapper for marker-claim endpoints
 * Returns Response if rate limited, null if allowed
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */
export async function applyRateLimit(
  req: Request,
  endpoint: string,
  userId: string
): Promise<Response | null> {
  // For marker claims: 10 claims per minute per user
  const config: RateLimitConfig = { maxRequests: 10, windowSeconds: 60 };
  
  // Create admin client for rate limit check
  const url = Deno.env.get("SUPABASE_URL");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!url || !service) {
    console.warn('[RateLimit] Missing env vars, skipping rate limit');
    return null; // Fail open
  }
  
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const supabase = createClient(url, service);
  
  const result = await checkRateLimit(supabase, userId, 'user', endpoint, config);
  
  if (!result.allowed) {
    const correlationId = generateCorrelationId();
    console.warn(`[RateLimit] User ${userId.slice(-8)} rate limited on ${endpoint}`);
    return rateLimitResponse(result, correlationId);
  }
  
  return null; // Allowed
}
