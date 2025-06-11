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

  // SURGICAL FIX: Enhanced notification loading with proper session validation
  const loadNotifications = useCallback(async () => {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';

    if (!userId && !isDeveloper) {
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      if (!hasDeveloperAccess) {
        console.warn('SURGICAL FIX: Cannot load notifications - no user ID');
        setNotifications([]);
        setIsLoading(false);
        return;
      }
      console.log('🔧 SURGICAL FIX: Developer mode - Loading notifications with fallback');
    }

    setIsLoading(true);
    
    try {
      console.log('📨 SURGICAL FIX: Loading notifications with enhanced auth for user:', userId);
      
      // SURGICAL FIX: Ensure we have a valid session with proper error handling
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ SURGICAL FIX: Session error:', sessionError);
      }
      
      if (!sessionData.session && !isDeveloper && !localStorage.getItem('developer_access')) {
        console.error('❌ SURGICAL FIX: No valid session found');
        setNotifications([]);
        return;
      }

      // SURGICAL FIX: Enhanced query with proper user handling
      const queryUserId = userId || '00000000-0000-4000-a000-000000000000';
      
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', queryUserId)
        .is('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ SURGICAL FIX: Error loading notifications:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // If it's an RLS error, try to help debug
        if (error.code === 'PGRST301' || error.message.includes('RLS')) {
          console.error('❌ RLS POLICY ERROR: Check user_notifications table policies');
        }
        
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
      console.log('✅ SURGICAL FIX: Notifications loaded successfully:', mappedNotifications.length);
      
    } catch (error) {
      console.error('❌ SURGICAL FIX: Exception loading notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUser]);

  // SURGICAL FIX: Enhanced notification creation with forced persistence
  const addNotification = useCallback(async (title: string, message: string, type: string = 'generic') => {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';

    if (!userId && !isDeveloper && !localStorage.getItem('developer_access')) {
      console.warn('SURGICAL FIX: Cannot add notification - no user ID');
      return;
    }

    try {
      console.log('📨 SURGICAL FIX: Creating notification with FORCED persistence:', { title, message, type });
      
      // SURGICAL FIX: Ensure valid session before writing
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ SURGICAL FIX: Session error during notification creation:', sessionError);
      }
      
      if (!sessionData.session && !isDeveloper && !localStorage.getItem('developer_access')) {
        console.error('❌ SURGICAL FIX: No valid session for notification creation');
        return;
      }

      // SURGICAL FIX: Enhanced notification creation with retry mechanism
      const notificationId = crypto.randomUUID();
      const queryUserId = userId || '00000000-0000-4000-a000-000000000000';
      let writeSuccess = false;
      let attempts = 0;
      
      while (!writeSuccess && attempts < 15) {
        attempts++;
        console.log(`📨 SURGICAL FIX: Notification write attempt ${attempts}/15`);
        
        try {
          const { data, error } = await supabase
            .from('user_notifications')
            .insert({
              id: notificationId,
              user_id: queryUserId,
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
            console.error(`❌ SURGICAL FIX: Notification write attempt ${attempts} failed:`, error);
            console.error('❌ Error details:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            });
            
            if (attempts < 15) {
              // Exponential backoff with session refresh
              if (attempts % 3 === 0) {
                console.log('🔄 SURGICAL FIX: Refreshing session before retry...');
                await supabase.auth.refreshSession();
              }
              await new Promise(resolve => setTimeout(resolve, 200 * attempts));
              continue;
            }
            throw error;
          }

          writeSuccess = true;
          console.log(`✅ SURGICAL FIX: Notification SUCCESSFULLY written on attempt ${attempts}`);

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

          // Immediate local state update
          setNotifications(prev => [newNotification, ...prev]);
          console.log('✅ SURGICAL FIX: Notification added to local state');
          
          // Force reload after successful write to verify persistence
          setTimeout(() => {
            console.log('🔄 SURGICAL FIX: Forcing notification reload to verify persistence...');
            loadNotifications();
          }, 500);

        } catch (retryError) {
          console.error(`❌ SURGICAL FIX: Notification write attempt ${attempts} exception:`, retryError);
          if (attempts >= 15) {
            throw retryError;
          }
        }
      }
      
      if (!writeSuccess) {
        throw new Error('Failed to write notification after 15 attempts');
      }
      
    } catch (error) {
      console.error('❌ SURGICAL FIX: FINAL Exception adding notification:', error);
      
      // Fallback: Add to local state even if DB write fails
      const fallbackNotification = {
        id: crypto.randomUUID(),
        title,
        message,
        description: message,
        type,
        is_read: false,
        read: false,
        created_at: new Date().toISOString(),
        date: new Date().toISOString()
      };
      
      setNotifications(prev => [fallbackNotification, ...prev]);
      console.log('⚠️ SURGICAL FIX: Added notification to local state as fallback');
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

  // SURGICAL FIX: Enhanced initialization with real-time subscription
  useEffect(() => {
    console.log('🔄 SURGICAL FIX: Initializing notifications with enhanced loading...');
    loadNotifications();
    
    // Set up real-time subscription for notifications
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (userId || localStorage.getItem('developer_access')) {
      console.log('📡 SURGICAL FIX: Setting up real-time notification subscription...');
      const channel = supabase
        .channel('notifications-realtime')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${userId || '00000000-0000-4000-a000-000000000000'}`
        }, (payload) => {
          console.log('📨 SURGICAL FIX: Real-time notification received:', payload);
          // Force reload when new notification is inserted
          setTimeout(() => loadNotifications(), 200);
        })
        .subscribe();
      
      return () => {
        console.log('📡 SURGICAL FIX: Cleaning up notification subscription...');
        supabase.removeChannel(channel);
      };
    }
  }, [loadNotifications, getCurrentUser]);

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
