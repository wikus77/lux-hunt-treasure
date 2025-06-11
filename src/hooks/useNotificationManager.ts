
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { useNotifications } from './useNotifications';
import { toast } from 'sonner';

export const useNotificationManager = () => {
  const { getCurrentUser } = useAuthContext();
  const [notificationsBannerOpen, setNotificationsBannerOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  
  const {
    notifications,
    isLoading,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reloadNotifications
  } = useNotifications();

  const createNotification = useCallback(async (title: string, message: string, type: string = 'generic') => {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;

    // CRITICAL: Support developer mode
    if (!userId) {
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      const isDeveloperEmail = localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
      
      if (!hasDeveloperAccess && !isDeveloperEmail) {
        console.warn('Cannot create notification - no user ID');
        return false;
      }
      
      console.log('🔧 Developer mode: Creating notification with fallback');
    }

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId || '00000000-0000-4000-a000-000000000000',
          title,
          message,
          type,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating notification:', error);
        return false;
      }

      console.log('✅ Notification created successfully:', data.id);
      return true;
    } catch (error) {
      console.error('❌ Exception creating notification:', error);
      return false;
    }
  }, [getCurrentUser]);

  const createBuzzNotification = useCallback(async (title: string, message: string) => {
    return await createNotification(title, message, 'buzz');
  }, [createNotification]);

  const createMapBuzzNotification = useCallback(async (title: string, message: string) => {
    return await createNotification(title, message, 'buzz_map');
  }, [createNotification]);

  const createLeaderboardNotification = useCallback(async (title: string, message: string) => {
    return await createNotification(title, message, 'leaderboard');
  }, [createNotification]);

  const createWeeklyNotification = useCallback(async (title: string, message: string) => {
    return await createNotification(title, message, 'weekly');
  }, [createNotification]);

  const openNotificationsBanner = useCallback(() => {
    setNotificationsBannerOpen(true);
  }, []);

  const closeNotificationsBanner = useCallback(() => {
    setNotificationsBannerOpen(false);
  }, []);

  const openNotificationsDrawer = useCallback(() => {
    setNotificationsDrawerOpen(true);
  }, []);

  const closeNotificationsDrawer = useCallback(() => {
    setNotificationsDrawerOpen(false);
  }, []);

  return {
    notifications,
    isLoading,
    unreadCount,
    notificationsBannerOpen,
    notificationsDrawerOpen,
    createNotification,
    createBuzzNotification,
    createMapBuzzNotification,
    createLeaderboardNotification,
    createWeeklyNotification,
    markAllAsRead,
    deleteNotification,
    openNotificationsBanner,
    closeNotificationsBanner,
    openNotificationsDrawer,
    closeNotificationsDrawer,
    reloadNotifications
  };
};
