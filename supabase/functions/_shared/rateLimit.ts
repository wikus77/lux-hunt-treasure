// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Centralized Rate Limiting Utility for Edge Functions

import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2.49.8";

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSizeSeconds: number;
  /** Identifier type: 'ip', 'user', or 'combined' */
  identifierType?: 'ip' | 'user' | 'combined';
  /** Custom identifier (overrides identifierType) */
  customIdentifier?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  error?: string;
}

// In-memory fallback store (for when DB is unavailable)
const memoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Get client IP from request headers
 */
export function getClientIP(req: Request): string {
  // Try various headers in order of reliability
  const ip = 
    req.headers.get('cf-connecting-ip') ||      // Cloudflare
    req.headers.get('x-real-ip') ||             // Nginx
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || // Proxy
    'unknown';
  return ip;
}

/**
 * Create rate limit identifier
 */
function createIdentifier(
  endpoint: string,
  req: Request,
  userId?: string,
  config?: RateLimitConfig
): string {
  if (config?.customIdentifier) {
    return `${endpoint}:${config.customIdentifier}`;
  }
  
  const ip = getClientIP(req);
  const type = config?.identifierType || 'combined';
  
  switch (type) {
    case 'ip':
      return `${endpoint}:ip:${ip}`;
    case 'user':
      return userId ? `${endpoint}:user:${userId}` : `${endpoint}:ip:${ip}`;
    case 'combined':
    default:
      return userId 
        ? `${endpoint}:user:${userId}:ip:${ip}` 
        : `${endpoint}:ip:${ip}`;
  }
}

/**
 * Check rate limit using in-memory store (fast, but not persistent across instances)
 */
function checkMemoryRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSizeSeconds * 1000;
  
  const entry = memoryStore.get(identifier);
  
  // Clean up expired entries periodically
  if (memoryStore.size > 10000) {
    for (const [key, value] of memoryStore.entries()) {
      if (value.resetAt < now) {
        memoryStore.delete(key);
      }
    }
  }
  
  if (!entry || entry.resetAt < now) {
    // New window
    const resetAt = now + windowMs;
    memoryStore.set(identifier, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: new Date(resetAt)
    };
  }
  
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      error: `Rate limit exceeded. Try again after ${new Date(entry.resetAt).toISOString()}`
    };
  }
  
  // Increment count
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: new Date(entry.resetAt)
  };
}

/**
 * Check rate limit using Supabase database (persistent, distributed)
 */
async function checkDatabaseRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowSizeSeconds * 1000);
    
    // Count requests in current window
    const { count, error: countError } = await supabase
      .from('rate_limit_log')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .gte('created_at', windowStart.toISOString());
    
    if (countError) {
      console.warn('[RATE-LIMIT] Database query failed, falling back to memory:', countError.message);
      return checkMemoryRateLimit(identifier, config);
    }
    
    const currentCount = count || 0;
    const resetAt = new Date(now.getTime() + config.windowSizeSeconds * 1000);
    
    if (currentCount >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        error: `Rate limit exceeded (${currentCount}/${config.maxRequests}). Try again later.`
      };
    }
    
    // Log this request
    await supabase.from('rate_limit_log').insert({
      identifier,
      endpoint: identifier.split(':')[0],
      created_at: now.toISOString()
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - currentCount - 1,
      resetAt
    };
    
  } catch (error) {
    console.warn('[RATE-LIMIT] Database error, falling back to memory:', error);
    return checkMemoryRateLimit(identifier, config);
  }
}

/**
 * Main rate limiting function
 * 
 * @param endpoint - Unique endpoint identifier (e.g., 'pulse-breaker', 'login')
 * @param req - The incoming request
 * @param config - Rate limit configuration
 * @param userId - Optional user ID for user-based limiting
 * @param supabase - Optional Supabase client for database-backed limiting
 * 
 * @example
 * // Simple in-memory rate limiting (10 req/min)
 * const result = await checkRateLimit('my-endpoint', req, { maxRequests: 10, windowSizeSeconds: 60 });
 * if (!result.allowed) return new Response(JSON.stringify({ error: result.error }), { status: 429 });
 * 
 * @example
 * // Database-backed rate limiting with user ID
 * const result = await checkRateLimit('pulse-breaker', req, 
 *   { maxRequests: 30, windowSizeSeconds: 60, identifierType: 'user' }, 
 *   userId, supabase);
 */
export async function checkRateLimit(
  endpoint: string,
  req: Request,
  config: RateLimitConfig,
  userId?: string,
  supabase?: SupabaseClient
): Promise<RateLimitResult> {
  const identifier = createIdentifier(endpoint, req, userId, config);
  
  // Use database if Supabase client provided, otherwise memory
  if (supabase) {
    return checkDatabaseRateLimit(supabase, identifier, config);
  }
  
  return checkMemoryRateLimit(identifier, config);
}

/**
 * Create a rate limit response with proper headers
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: result.error || 'Rate limit exceeded',
      retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetAt.toISOString(),
        'Retry-After': Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString()
      }
    }
  );
}

/**
 * Preset configurations for common use cases
 */
export const RATE_LIMIT_PRESETS = {
  /** Standard API endpoint: 60 requests per minute */
  STANDARD: { maxRequests: 60, windowSizeSeconds: 60 } as RateLimitConfig,
  
  /** Strict endpoint (auth, payments): 10 requests per minute */
  STRICT: { maxRequests: 10, windowSizeSeconds: 60 } as RateLimitConfig,
  
  /** Very strict (password reset, OTP): 3 requests per minute */
  VERY_STRICT: { maxRequests: 3, windowSizeSeconds: 60 } as RateLimitConfig,
  
  /** Gaming endpoint (Pulse Breaker): 30 requests per minute per user */
  GAMING: { maxRequests: 30, windowSizeSeconds: 60, identifierType: 'user' as const },
  
  /** AI/Heavy compute: 5 requests per minute */
  AI_HEAVY: { maxRequests: 5, windowSizeSeconds: 60 } as RateLimitConfig,
  
  /** Burst protection: 100 requests per 10 seconds */
  BURST: { maxRequests: 100, windowSizeSeconds: 10 } as RateLimitConfig,
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

