
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

interface RateLimitOptions {
  maxRequests: number;
  windowSeconds: number;
  functionName: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}

export class RateLimiter {
  private supabase;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }

  async checkRateLimit(
    userId: string, 
    ipAddress: string, 
    options: RateLimitOptions
  ): Promise<RateLimitResult> {
    // Developer whitelist - never rate limit wikus77@hotmail.it
    if (userId === 'developer-fake-id' || await this.isDeveloperEmail(userId)) {
      return {
        allowed: true,
        remaining: options.maxRequests,
        resetTime: new Date(Date.now() + options.windowSeconds * 1000)
      };
    }

    const windowStart = new Date(Date.now() - (options.windowSeconds * 1000));
    
    // Check recent events from abuse_logs
    const { data: recentEvents, error } = await this.supabase
      .from('abuse_logs')
      .select('timestamp')
      .eq('user_id', userId)
      .eq('event_type', options.functionName)
      .gte('timestamp', windowStart.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error checking rate limit:', error);
      // In case of error, allow the request but log it
      return {
        allowed: true,
        remaining: options.maxRequests - 1,
        resetTime: new Date(Date.now() + options.windowSeconds * 1000)
      };
    }

    const requestCount = recentEvents?.length || 0;
    const allowed = requestCount < options.maxRequests;

    if (!allowed) {
      // Log rate limit exceeded
      await this.logRateLimitExceeded(userId, ipAddress, options.functionName);
    }

    // Log this request attempt
    await this.logEvent(userId, ipAddress, options.functionName);

    return {
      allowed,
      remaining: Math.max(0, options.maxRequests - requestCount - 1),
      resetTime: new Date(Date.now() + options.windowSeconds * 1000)
    };
  }

  private async isDeveloperEmail(userId: string): Promise<boolean> {
    try {
      const { data: user } = await this.supabase.auth.admin.getUserById(userId);
      return user?.user?.email === 'wikus77@hotmail.it';
    } catch (error) {
      return false;
    }
  }

  private async logEvent(userId: string, ipAddress: string, functionName: string): Promise<void> {
    try {
      await this.supabase
        .from('abuse_logs')
        .insert({
          user_id: userId,
          event_type: functionName,
          timestamp: new Date().toISOString(),
          ip_address: ipAddress,
          meta: { function: functionName, action: 'request' }
        });
    } catch (error) {
      console.error('Error logging event:', error);
    }
  }

  private async logRateLimitExceeded(userId: string, ipAddress: string, functionName: string): Promise<void> {
    try {
      await this.supabase
        .from('abuse_logs')
        .insert({
          user_id: userId,
          event_type: 'rate_limit_exceeded',
          timestamp: new Date().toISOString(),
          ip_address: ipAddress,
          meta: { 
            function: functionName, 
            action: 'blocked',
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error logging rate limit exceeded:', error);
    }
  }
}
