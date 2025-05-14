
import { supabase } from "@/integrations/supabase/client";

interface ActivityLogData {
  userEmail?: string;
  action: string;
  metadata?: Record<string, any>;
}

/**
 * Logs an activity in the system
 */
export const logActivity = async (data: ActivityLogData): Promise<boolean> => {
  try {
    // Format the data for insertion
    const logData = {
      user_email: data.userEmail?.toLowerCase().trim(),
      action: data.action,
      metadata: data.metadata || {},
    };

    const { error } = await supabase
      .from('activity_logs')
      .insert([logData]);
    
    if (error) {
      console.error("Error logging activity:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception logging activity:", error);
    return false;
  }
};

/**
 * Gets activity logs for a specific user
 */
export const getUserActivityLogs = async (userEmail: string) => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_email', userEmail.toLowerCase().trim())
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error("Error fetching activity logs:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Exception fetching activity logs:", error);
    return [];
  }
};

/**
 * Gets recent system-wide activity logs
 */
export const getRecentActivityLogs = async (limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching recent activity logs:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Exception fetching recent activity logs:", error);
    return [];
  }
};
