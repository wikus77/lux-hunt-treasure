
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

export const useNotificationManager = () => {
  const { getCurrentUser } = useAuthContext();

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

  const reloadNotifications = useCallback(async (force: boolean = false) => {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;

    if (!userId && !localStorage.getItem('developer_access')) {
      console.warn('Cannot reload notifications - no user ID');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId || '00000000-0000-4000-a000-000000000000')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error reloading notifications:', error);
        return [];
      }

      console.log('✅ Notifications reloaded:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Exception reloading notifications:', error);
      return [];
    }
  }, [getCurrentUser]);

  return {
    createNotification,
    createBuzzNotification,
    createMapBuzzNotification,
    reloadNotifications
  };
};
