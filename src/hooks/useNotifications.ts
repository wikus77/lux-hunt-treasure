
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getCurrentUser } = useAuthContext();

  const loadNotifications = useCallback(async () => {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;

    // CRITICAL: Support developer mode
    if (!userId) {
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      const isDeveloperEmail = localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
      
      if (!hasDeveloperAccess && !isDeveloperEmail) {
        console.warn('Cannot load notifications - no user ID');
        return;
      }
      
      console.log('🔧 Developer mode: Loading notifications with fallback');
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId || '00000000-0000-4000-a000-000000000000')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Error loading notifications:', error);
        return;
      }

      setNotifications(data || []);
      console.log('✅ Notifications loaded:', data?.length || 0);
    } catch (error) {
      console.error('❌ Exception loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUser]);

  const addNotification = useCallback(async (title: string, message: string, type: string = 'generic') => {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;

    if (!userId && !localStorage.getItem('developer_access')) {
      console.warn('Cannot add notification - no user ID');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId || '00000000-0000-4000-a000-000000000000',
          title,
          message,
          type,
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding notification:', error);
        return;
      }

      // Add to local state
      setNotifications(prev => [data, ...prev]);
      console.log('✅ Notification added locally');
    } catch (error) {
      console.error('❌ Exception adding notification:', error);
    }
  }, [getCurrentUser]);

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

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('❌ Exception marking notification as read:', error);
    }
  }, []);

  const reloadNotifications = useCallback(async (force: boolean = false) => {
    await loadNotifications();
  }, [loadNotifications]);

  // Load notifications on mount
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
    reloadNotifications,
    loadNotifications
  };
};
