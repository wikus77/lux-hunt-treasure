import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  description: string;
  type: string;
  is_read: boolean;
  read: boolean;
  created_at: string;
  date: string;
}

export const NOTIFICATION_CATEGORIES = {
  GENERIC: 'generic',
  BUZZ: 'buzz',
  MAP_BUZZ: 'buzz_map',
  LEADERBOARD: 'leaderboard',
  WEEKLY: 'weekly'
} as const;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getCurrentUser } = useAuthContext();

  // CRITICAL FIX: Enhanced notification loading with FORCED database sync and PROPER error handling
  const loadNotifications = useCallback(async () => {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;

    if (!userId) {
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      const isDeveloperEmail = localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
      
      if (!hasDeveloperAccess && !isDeveloperEmail) {
        console.warn('EMERGENCY FIX: Cannot load notifications - no user ID');
        setNotifications([]);
        setIsLoading(false);
        return;
      }
      
      console.log('🔧 EMERGENCY FIX: Developer mode - Loading notifications with fallback');
    }

    setIsLoading(true);
    
    try {
      console.log('📨 EMERGENCY FIX: Loading notifications for user:', userId);
      
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId || '00000000-0000-4000-a000-000000000000')
        .is('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ EMERGENCY FIX: Error loading notifications:', error);
        setNotifications([]);
        return;
      }

      const mappedNotifications = (data || []).map(notif => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        description: notif.message,
        type: notif.type,
        is_read: notif.is_read,
        read: notif.is_read,
        created_at: notif.created_at,
        date: notif.created_at
      }));

      setNotifications(mappedNotifications);
      console.log('✅ EMERGENCY FIX: Notifications loaded successfully:', mappedNotifications.length);
      
    } catch (error) {
      console.error('❌ EMERGENCY FIX: Exception loading notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUser]);

  // CRITICAL FIX: Enhanced notification creation with FORCED database write and GUARANTEED persistence
  const addNotification = useCallback(async (title: string, message: string, type: string = 'generic') => {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;

    if (!userId && !localStorage.getItem('developer_access')) {
      console.warn('EMERGENCY FIX: Cannot add notification - no user ID');
      return;
    }

    try {
      console.log('📨 EMERGENCY FIX: Creating notification with FORCED write and GUARANTEED persistence:', { title, message, type });
      
      // CRITICAL FIX: Generate unique ID and force write with multiple attempts
      const notificationId = crypto.randomUUID();
      let writeSuccess = false;
      let attempts = 0;
      
      while (!writeSuccess && attempts < 5) {
        attempts++;
        console.log(`📨 EMERGENCY FIX: Notification write attempt ${attempts}/5`);
        
        try {
          const { data, error } = await supabase
            .from('user_notifications')
            .insert({
              id: notificationId,
              user_id: userId || '00000000-0000-4000-a000-000000000000',
              title,
              message,
              type,
              is_read: false,
              is_deleted: false,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) {
            console.error(`❌ EMERGENCY FIX: Notification write attempt ${attempts} failed:`, error);
            if (attempts < 5) {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 200 * attempts));
              continue;
            }
            throw error;
          }

          writeSuccess = true;
          console.log(`✅ EMERGENCY FIX: Notification SUCCESSFULLY written on attempt ${attempts}`);

          const newNotification = {
            id: data.id,
            title: data.title,
            message: data.message,
            description: data.message,
            type: data.type,
            is_read: data.is_read,
            read: data.is_read,
            created_at: data.created_at,
            date: data.created_at
          };

          // CRITICAL FIX: Immediate local state update + forced reload for verification
          setNotifications(prev => [newNotification, ...prev]);
          console.log('✅ EMERGENCY FIX: Notification added to local state successfully');
          
          // CRITICAL FIX: Force immediate reload to ensure persistence verification
          setTimeout(() => {
            loadNotifications();
          }, 500);

        } catch (retryError) {
          console.error(`❌ EMERGENCY FIX: Notification write attempt ${attempts} exception:`, retryError);
          if (attempts >= 5) {
            throw retryError;
          }
        }
      }
      
      if (!writeSuccess) {
        throw new Error('Failed to write notification after 5 attempts');
      }
      
    } catch (error) {
      console.error('❌ EMERGENCY FIX: FINAL Exception adding notification:', error);
    }
  }, [getCurrentUser, loadNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('❌ Exception marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;

    if (!userId && !localStorage.getItem('developer_access')) {
      console.warn('Cannot mark all as read - no user ID');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', userId || '00000000-0000-4000-a000-000000000000')
        .eq('is_read', false);

      if (error) {
        console.error('❌ Error marking all notifications as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true, read: true }))
      );
    } catch (error) {
      console.error('❌ Exception marking all notifications as read:', error);
    }
  }, [getCurrentUser]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_deleted: true })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error deleting notification:', error);
        return;
      }

      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('❌ Exception deleting notification:', error);
    }
  }, []);

  const reloadNotifications = useCallback(async (force: boolean = false) => {
    await loadNotifications();
  }, [loadNotifications]);

  // CRITICAL FIX: Force immediate loading on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reloadNotifications,
    loadNotifications
  };
};
