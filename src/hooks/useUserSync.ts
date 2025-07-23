/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * M1SSION™ User Synchronization Hook
 * Comprehensive user state, permissions, and notifications management
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';

interface UserSyncState {
  plan: string;
  canAccessApp: boolean;
  earlyAccessHours: number;
  lastPlanChange: string | null;
  permissions: Array<{
    type: string;
    value: boolean;
    granted_at: string;
  }>;
  recentLogs: Array<{
    action: string;
    details: any;
    created_at: string;
  }>;
  isLoading: boolean;
  lastSyncAt: string | null;
}

interface UserNotification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  metadata: any;
  sent_at: string;
  read_at: string | null;
  delivery_status: string;
}

export const useUserSync = () => {
  const { getCurrentUser, isAuthenticated } = useUnifiedAuth();
  const [syncState, setSyncState] = useState<UserSyncState>({
    plan: 'base',
    canAccessApp: false,
    earlyAccessHours: 0,
    lastPlanChange: null,
    permissions: [],
    recentLogs: [],
    isLoading: true,
    lastSyncAt: null,
  });
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  // Log user action
  const logAction = useCallback(async (
    action: string, 
    details?: any, 
    ipAddress?: string, 
    userAgent?: string
  ) => {
    const user = getCurrentUser();
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('log_user_action', {
        p_user_id: user.id,
        p_action: action,
        p_details: details || null,
        p_ip_address: ipAddress || null,
        p_user_agent: userAgent || navigator.userAgent
      });

      if (error) {
        console.error('❌ M1SSION™ Log action error:', error);
        return null;
      }

      console.log('✅ M1SSION™ Action logged:', action, data);
      return data;
    } catch (error) {
      console.error('❌ M1SSION™ Log action failed:', error);
      return null;
    }
  }, [getCurrentUser]);

  // Sync user permissions
  const syncPermissions = useCallback(async () => {
    const user = getCurrentUser();
    if (!user) return false;

    try {
      const { error } = await supabase.rpc('sync_user_permissions', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ M1SSION™ Sync permissions error:', error);
        return false;
      }

      console.log('✅ M1SSION™ Permissions synced');
      await loadSyncStatus();
      return true;
    } catch (error) {
      console.error('❌ M1SSION™ Sync permissions failed:', error);
      return false;
    }
  }, [getCurrentUser]);

  // Send notification
  const sendNotification = useCallback(async (
    type: 'email' | 'push' | 'in_app',
    title: string,
    message: string,
    metadata?: any
  ) => {
    const user = getCurrentUser();
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('send_user_notification', {
        p_user_id: user.id,
        p_notification_type: type,
        p_title: title,
        p_message: message,
        p_metadata: metadata || null
      });

      if (error) {
        console.error('❌ M1SSION™ Send notification error:', error);
        return null;
      }

      console.log('✅ M1SSION™ Notification sent:', type, title);
      await loadNotifications();
      return data;
    } catch (error) {
      console.error('❌ M1SSION™ Send notification failed:', error);
      return null;
    }
  }, [getCurrentUser]);

  // Load complete sync status
  const loadSyncStatus = useCallback(async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      setSyncState(prev => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.rpc('get_user_sync_status', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ M1SSION™ Load sync status error:', error);
        return;
      }

      if (data) {
        setSyncState({
          plan: (data as any).plan || 'base',
          canAccessApp: (data as any).can_access_app || false,
          earlyAccessHours: (data as any).early_access_hours || 0,
          lastPlanChange: (data as any).last_plan_change,
          permissions: (data as any).permissions || [],
          recentLogs: (data as any).recent_logs || [],
          isLoading: false,
          lastSyncAt: (data as any).sync_timestamp,
        });

        console.log('✅ M1SSION™ Sync status loaded:', data);
      }
    } catch (error) {
      console.error('❌ M1SSION™ Load sync status failed:', error);
      setSyncState(prev => ({ ...prev, isLoading: false }));
    }
  }, [getCurrentUser]);

  // Load user notifications
  const loadNotifications = useCallback(async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ M1SSION™ Load notifications error:', error);
        return;
      }

      setNotifications((data || []) as unknown as UserNotification[]);
      console.log('✅ M1SSION™ Notifications loaded:', data?.length);
    } catch (error) {
      console.error('❌ M1SSION™ Load notifications failed:', error);
    }
  }, [getCurrentUser]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    const user = getCurrentUser();
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read_at: new Date().toISOString() } as any)
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ M1SSION™ Mark notification read error:', error);
        return false;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );

      return true;
    } catch (error) {
      console.error('❌ M1SSION™ Mark notification read failed:', error);
      return false;
    }
  }, [getCurrentUser]);

  // Handle plan upgrade with full sync using edge function
  const handlePlanUpgrade = useCallback(async (newPlan: string, paymentIntentId?: string, amount?: number) => {
    const user = getCurrentUser();
    if (!user) return false;

    try {
      console.log(`🔄 M1SSION™ Plan upgrade starting: ${newPlan}`);

      // Call the comprehensive plan update edge function
      const { data, error } = await supabase.functions.invoke('handle-plan-update', {
        body: {
          user_id: user.id,
          new_plan: newPlan,
          event_type: newPlan === 'base' ? 'downgrade' : 'upgrade',
          old_plan: syncState.plan,
          amount: amount,
          payment_intent_id: paymentIntentId
        }
      });

      if (error) {
        console.error('❌ M1SSION™ Plan update edge function error:', error);
        await logAction('plan_upgrade_failed', { 
          error: error.message, 
          new_plan: newPlan,
          edge_function_error: true 
        });
        return false;
      }

      if (!data?.success) {
        console.error('❌ M1SSION™ Plan update failed:', data);
        await logAction('plan_upgrade_failed', { 
          error: data?.error || 'Unknown error', 
          new_plan: newPlan 
        });
        return false;
      }

      console.log('✅ M1SSION™ Plan upgrade completed:', data);

      // Reload sync status to get the latest data
      await loadSyncStatus();
      
      return true;
    } catch (error) {
      console.error('❌ M1SSION™ Plan upgrade exception:', error);
      await logAction('plan_upgrade_failed', { 
        error: error.message, 
        new_plan: newPlan,
        exception: true 
      });
      return false;
    }
  }, [getCurrentUser, syncState.plan, logAction, loadSyncStatus]);

  // Check if user can access app based on plan and timing
  const canUserAccessApp = useCallback(() => {
    if (!syncState.canAccessApp) return false;
    
    // For now, always allow access if user has access permission
    // In the future, add mission timing logic here
    return true;
  }, [syncState.canAccessApp]);

  // Get user permission value
  const hasPermission = useCallback((permissionType: string) => {
    const permission = syncState.permissions.find(p => p.type === permissionType);
    return permission?.value || false;
  }, [syncState.permissions]);

  // Initialize sync on authentication
  useEffect(() => {
    if (isAuthenticated && getCurrentUser()) {
      loadSyncStatus();
      loadNotifications();
      
      // Log session started
      logAction('session_started', {
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      });
    }
  }, [isAuthenticated, getCurrentUser, loadSyncStatus, loadNotifications, logAction]);

  // Listen for profile changes (realtime)
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const channel = supabase
      .channel('user-profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 M1SSION™ Profile updated:', payload);
          loadSyncStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getCurrentUser, loadSyncStatus]);

  return {
    // State
    syncState,
    notifications,
    
    // Computed values
    canUserAccessApp: canUserAccessApp(),
    hasEarlyAccess: hasPermission('early_access'),
    hasPremiumFeatures: hasPermission('premium_features'),
    unreadNotifications: notifications.filter(n => !n.read_at).length,
    
    // Actions
    logAction,
    syncPermissions,
    sendNotification,
    handlePlanUpgrade,
    markNotificationRead,
    hasPermission,
    
    // Manual refresh
    refreshSync: loadSyncStatus,
    refreshNotifications: loadNotifications,
  };
};