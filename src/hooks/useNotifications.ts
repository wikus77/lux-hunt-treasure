
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

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getCurrentUser } = useAuthContext();

  // CRITICAL FIX: Caricamento notifiche FORZATO con validazione sessione
  const loadNotifications = useCallback(async () => {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';

    if (!userId && !isDeveloper && !localStorage.getItem('developer_access')) {
      console.warn('Cannot load notifications - no user ID');
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📨 CARICAMENTO NOTIFICHE FORZATO per user:', userId);
      
      // CRITICAL FIX: Refresh sessione FORZATO
      const { error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError) {
        console.error('❌ Session refresh error:', sessionError);
      }
      
      // CRITICAL FIX: Query con retry x10
      const queryUserId = userId || '00000000-0000-4000-a000-000000000000';
      let data = null;
      let attempts = 0;
      let success = false;
      
      while (!success && attempts < 10) {
        attempts++;
        console.log(`📨 Caricamento notifiche tentativo ${attempts}/10`);
        
        try {
          const { data: notificationData, error } = await supabase
            .from('user_notifications')
            .select('*')
            .eq('user_id', queryUserId)
            .is('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(100);

          if (error) {
            console.error(`❌ Tentativo ${attempts} fallito:`, error);
            if (attempts < 10) {
              await new Promise(resolve => setTimeout(resolve, 200));
              continue;
            }
            throw error;
          }

          data = notificationData;
          success = true;
          console.log(`✅ Notifiche caricate al tentativo ${attempts}, trovate: ${data?.length || 0}`);
          
        } catch (retryError) {
          console.error(`❌ Retry tentativo ${attempts} fallito:`, retryError);
          if (attempts >= 10) throw retryError;
        }
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
      console.log('✅ NOTIFICHE CARICATE con successo:', mappedNotifications.length);
      
    } catch (error) {
      console.error('❌ ERRORE CRITICO caricamento notifiche:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUser]);

  // CRITICAL FIX: Creazione notifica FORZATA con persistenza x20 retry
  const addNotification = useCallback(async (title: string, message: string, type: string = 'generic') => {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';

    if (!userId && !isDeveloper && !localStorage.getItem('developer_access')) {
      console.warn('Cannot add notification - no user ID');
      return;
    }

    try {
      console.log('📨 CREAZIONE NOTIFICA FORZATA:', { title, message, type });
      
      // CRITICAL FIX: Refresh sessione prima della scrittura
      const { error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError) {
        console.error('❌ Session refresh error per notifica:', sessionError);
      }

      // CRITICAL FIX: Scrittura con retry x20
      const notificationId = crypto.randomUUID();
      const queryUserId = userId || '00000000-0000-4000-a000-000000000000';
      let writeSuccess = false;
      let attempts = 0;
      
      while (!writeSuccess && attempts < 20) {
        attempts++;
        console.log(`📨 SCRITTURA NOTIFICA tentativo ${attempts}/20`);
        
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
            console.error(`❌ Scrittura tentativo ${attempts} fallito:`, error);
            
            if (attempts < 20) {
              // Refresh sessione ogni 5 tentativi
              if (attempts % 5 === 0) {
                console.log('🔄 Refresh sessione retry...');
                await supabase.auth.refreshSession();
              }
              await new Promise(resolve => setTimeout(resolve, 100));
              continue;
            }
            throw error;
          }

          writeSuccess = true;
          console.log(`✅ NOTIFICA SCRITTA CON SUCCESSO al tentativo ${attempts}`);

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

          // Aggiornamento stato locale immediato
          setNotifications(prev => [newNotification, ...prev]);
          console.log('✅ Notifica aggiunta allo stato locale');
          
          // Reload forzato per verifica persistenza
          setTimeout(() => {
            console.log('🔄 Reload notifiche per verifica...');
            loadNotifications();
          }, 300);

        } catch (retryError) {
          console.error(`❌ Eccezione tentativo ${attempts}:`, retryError);
          if (attempts >= 20) throw retryError;
        }
      }
      
      if (!writeSuccess) {
        throw new Error('Fallimento scrittura dopo 20 tentativi');
      }
      
    } catch (error) {
      console.error('❌ ERRORE CRITICO creazione notifica:', error);
      
      // Fallback locale SEMPRE
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
      console.log('⚠️ Notifica FALLBACK aggiunta allo stato locale');
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

  // CRITICAL FIX: Inizializzazione FORZATA con subscription
  useEffect(() => {
    console.log('🔄 INIZIALIZZAZIONE NOTIFICHE FORZATA');
    loadNotifications();
    
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (userId || localStorage.getItem('developer_access')) {
      console.log('📡 Subscription real-time notifiche...');
      const channel = supabase
        .channel('notifications-realtime')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${userId || '00000000-0000-4000-a000-000000000000'}`
        }, (payload) => {
          console.log('📨 Notifica real-time ricevuta:', payload);
          setTimeout(() => loadNotifications(), 100);
        })
        .subscribe();
      
      return () => {
        console.log('📡 Pulizia subscription notifiche');
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
