// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Audit Log System - Track sensitive actions for security

import { supabase } from '@/integrations/supabase/client';

/**
 * Audit log event types
 */
export type AuditEventType = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUEST'
  | 'ADMIN_ACCESS'
  | 'ADMIN_ACTION'
  | 'MARKER_CREATED'
  | 'MARKER_DELETED'
  | 'REWARD_CLAIMED'
  | 'M1U_CREDITED'
  | 'M1U_SPENT'
  | 'SUBSCRIPTION_CHANGE'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'MISSION_CONFIG_CHANGE'
  | 'PRIZE_LOCATION_CHANGE'
  | 'SECURITY_ALERT';

/**
 * Audit log entry
 */
interface AuditLogEntry {
  event_type: AuditEventType;
  user_id?: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  severity?: 'info' | 'warning' | 'critical';
}

/**
 * Mask sensitive data for logging
 */
const maskData = (data: Record<string, any>): Record<string, any> => {
  const masked = { ...data };
  
  // Mask sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  
  for (const key of Object.keys(masked)) {
    if (sensitiveFields.some(f => key.toLowerCase().includes(f))) {
      masked[key] = '[REDACTED]';
    }
    // Mask emails partially
    if (key.toLowerCase().includes('email') && typeof masked[key] === 'string') {
      const email = masked[key] as string;
      const [local, domain] = email.split('@');
      if (domain) {
        masked[key] = `${local.slice(0, 2)}***@${domain}`;
      }
    }
    // Mask user IDs partially
    if ((key === 'user_id' || key === 'userId') && typeof masked[key] === 'string') {
      masked[key] = `...${(masked[key] as string).slice(-8)}`;
    }
  }
  
  return masked;
};

/**
 * Log an audit event
 * @param entry - Audit log entry
 */
export const logAuditEvent = async (entry: AuditLogEntry): Promise<void> => {
  try {
    // Get client info
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'server';
    
    // Prepare masked details
    const maskedDetails = entry.details ? maskData(entry.details) : {};
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[AUDIT] ${entry.event_type}:`, {
        user: entry.user_email ? `${entry.user_email.slice(0, 2)}***` : entry.user_id?.slice(-8),
        severity: entry.severity || 'info',
        details: maskedDetails,
      });
    }
    
    // Insert into admin_logs table (already exists in your schema)
    const { error } = await supabase
      .from('admin_logs')
      .insert({
        event_type: `audit_${entry.event_type.toLowerCase()}`,
        user_id: entry.user_id || null,
        note: `${entry.event_type}: ${JSON.stringify(maskedDetails).slice(0, 500)}`,
        context: JSON.stringify({
          severity: entry.severity || 'info',
          user_agent: userAgent.slice(0, 200),
          timestamp: new Date().toISOString(),
          ...maskedDetails,
        }).slice(0, 1000),
      });
    
    if (error) {
      // Don't throw - audit logging should never break the app
      console.warn('[AUDIT] Failed to log event:', error.message);
    }
  } catch (err) {
    // Silent fail - audit logging should never break the app
    console.warn('[AUDIT] Exception:', err);
  }
};

/**
 * Log admin access attempt
 */
export const logAdminAccess = async (
  userId: string | undefined,
  email: string | undefined,
  action: string,
  success: boolean
): Promise<void> => {
  await logAuditEvent({
    event_type: 'ADMIN_ACCESS',
    user_id: userId,
    user_email: email,
    severity: success ? 'info' : 'warning',
    details: { action, success },
  });
};

/**
 * Log security alert
 */
export const logSecurityAlert = async (
  message: string,
  details?: Record<string, any>
): Promise<void> => {
  await logAuditEvent({
    event_type: 'SECURITY_ALERT',
    severity: 'critical',
    details: { message, ...details },
  });
};

/**
 * Log M1U transaction
 */
export const logM1UTransaction = async (
  userId: string,
  type: 'credited' | 'spent',
  amount: number,
  source: string
): Promise<void> => {
  await logAuditEvent({
    event_type: type === 'credited' ? 'M1U_CREDITED' : 'M1U_SPENT',
    user_id: userId,
    severity: 'info',
    details: { amount, source },
  });
};

/**
 * Log mission config change
 */
export const logMissionConfigChange = async (
  userId: string,
  field: string,
  oldValue: any,
  newValue: any
): Promise<void> => {
  await logAuditEvent({
    event_type: field.includes('prize') ? 'PRIZE_LOCATION_CHANGE' : 'MISSION_CONFIG_CHANGE',
    user_id: userId,
    severity: field.includes('prize') ? 'critical' : 'warning',
    details: { 
      field, 
      changed: true,
      // Don't log actual coordinates for prize location
      value_changed: field.includes('prize') ? '[REDACTED]' : `${oldValue} -> ${newValue}`,
    },
  });
};

export default {
  logAuditEvent,
  logAdminAccess,
  logSecurityAlert,
  logM1UTransaction,
  logMissionConfigChange,
};

