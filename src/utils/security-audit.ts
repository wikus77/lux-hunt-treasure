// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Security Audit and Monitoring Functions

import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  event_type: string;
  event_details?: Record<string, any>;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  ip_address?: string;
  user_agent?: string;
}

export class SecurityAudit {
  /**
   * Log a security event
   */
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const eventData = {
        user_id: user?.user?.id || null,
        event_type: event.event_type,
        event_details: event.event_details || {},
        risk_level: event.risk_level || 'low',
        ip_address: event.ip_address || null,
        user_agent: event.user_agent || navigator.userAgent,
        created_at: new Date().toISOString()
      };

      await supabase.from('security_events').insert([eventData]);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Log authentication attempt
   */
  static async logAuthAttempt(
    success: boolean, 
    email: string, 
    details?: Record<string, any>
  ): Promise<void> {
    await this.logSecurityEvent({
      event_type: success ? 'auth_success' : 'auth_failure',
      event_details: {
        email: email,
        timestamp: Date.now(),
        ...details
      },
      risk_level: success ? 'low' : 'medium'
    });
  }

  /**
   * Log privilege escalation attempt
   */
  static async logPrivilegeEscalation(
    attempted_action: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logSecurityEvent({
      event_type: 'privilege_escalation_attempt',
      event_details: {
        attempted_action,
        timestamp: Date.now(),
        ...details
      },
      risk_level: 'critical'
    });
  }

  /**
   * Log suspicious API usage
   */
  static async logSuspiciousApiUsage(
    endpoint: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logSecurityEvent({
      event_type: 'suspicious_api_usage',
      event_details: {
        endpoint,
        timestamp: Date.now(),
        ...details
      },
      risk_level: 'high'
    });
  }

  /**
   * Log input validation failure
   */
  static async logInputValidationFailure(
    input_type: string,
    errors: string[]
  ): Promise<void> {
    await this.logSecurityEvent({
      event_type: 'input_validation_failure',
      event_details: {
        input_type,
        errors,
        timestamp: Date.now()
      },
      risk_level: 'medium'
    });
  }

  /**
   * Check for admin role security
   */
  static async checkAdminAccess(): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.user.id)
        .single();

      const isAdmin = profile?.role === 'admin';
      
      // Log admin access check
      await this.logSecurityEvent({
        event_type: 'admin_access_check',
        event_details: {
          user_id: user.user.id,
          is_admin: isAdmin,
          timestamp: Date.now()
        },
        risk_level: 'low'
      });

      return isAdmin;
    } catch (error) {
      console.error('Admin access check failed:', error);
      return false;
    }
  }

  /**
   * Monitor rate limiting violations
   */
  static async logRateLimitViolation(
    action: string,
    attempts: number
  ): Promise<void> {
    await this.logSecurityEvent({
      event_type: 'rate_limit_violation',
      event_details: {
        action,
        attempts,
        timestamp: Date.now()
      },
      risk_level: 'high'
    });
  }

  /**
   * Log marker claim attempt with validation
   */
  static async logMarkerClaimAttempt(
    marker_id: string,
    success: boolean,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logSecurityEvent({
      event_type: 'marker_claim_attempt',
      event_details: {
        marker_id,
        success,
        timestamp: Date.now(),
        ...details
      },
      risk_level: success ? 'low' : 'medium'
    });
  }

  /**
   * Validate session security
   */
  static async validateSession(): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        return false;
      }

      // Check if session is expired
      const expiresAt = session.session.expires_at;
      if (expiresAt && Date.now() / 1000 > expiresAt) {
        await this.logSecurityEvent({
          event_type: 'expired_session_usage',
          event_details: {
            expires_at: expiresAt,
            current_time: Date.now() / 1000
          },
          risk_level: 'medium'
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  /**
   * Clean up expired events (client-side cleanup)
   */
  static cleanupExpiredData(): void {
    try {
      // Clean up localStorage rate limit data older than 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('rate_limit_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.timestamp && data.timestamp < oneDayAgo) {
              localStorage.removeItem(key);
            }
          } catch {
            // Remove invalid data
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

export default SecurityAudit;