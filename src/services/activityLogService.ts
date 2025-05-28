
import { supabase } from '@/integrations/supabase/client';

interface ActivityLogEntry {
  user_email: string;
  action: string;
  metadata: Record<string, any>;
}

export class ActivityLogService {
  private static instance: ActivityLogService;
  private logQueue: ActivityLogEntry[] = [];
  private isProcessing = false;

  private constructor() {}

  public static getInstance(): ActivityLogService {
    if (!ActivityLogService.instance) {
      ActivityLogService.instance = new ActivityLogService();
    }
    return ActivityLogService.instance;
  }

  public async logActivity(userEmail: string, action: string, metadata: Record<string, any> = {}) {
    // Store activity in local storage for now
    const logEntry = {
      user_email: userEmail,
      action,
      metadata,
      timestamp: new Date().toISOString()
    };

    try {
      const existingLogs = localStorage.getItem('activity_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logEntry);
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('activity_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  public async getActivityLogs(userEmail: string, limit: number = 50): Promise<ActivityLogEntry[]> {
    try {
      const existingLogs = localStorage.getItem('activity_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      return logs
        .filter((log: any) => log.user_email === userEmail)
        .slice(-limit)
        .reverse();
    } catch (error) {
      console.error('Failed to get activity logs:', error);
      return [];
    }
  }

  public async clearLogs(userEmail: string): Promise<void> {
    try {
      const existingLogs = localStorage.getItem('activity_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      const filteredLogs = logs.filter((log: any) => log.user_email !== userEmail);
      localStorage.setItem('activity_logs', JSON.stringify(filteredLogs));
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }
}

export const activityLogger = ActivityLogService.getInstance();

// Export the logActivity function for backward compatibility
export const logActivity = async (params: { 
  userEmail: string; 
  action: string; 
  metadata?: Record<string, any> 
}) => {
  return activityLogger.logActivity(params.userEmail, params.action, params.metadata || {});
};
