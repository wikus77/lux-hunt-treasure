// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ - Advanced Offline Sync System
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load offline queue from localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem('m1ssion_offline_queue');
    if (savedQueue) {
      try {
        setSyncQueue(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Error loading offline queue:', error);
        localStorage.removeItem('m1ssion_offline_queue');
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('m1ssion_offline_queue', JSON.stringify(syncQueue));
  }, [syncQueue]);

  // Network status handlers
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connessione ripristinata', {
        description: 'Sincronizzazione in corso...'
      });
      processSyncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Modalità offline', {
        description: 'Le modifiche verranno sincronizzate quando tornerai online'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add action to offline queue
  const addToQueue = useCallback((type: string, data: any) => {
    const action: OfflineAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    setSyncQueue(prev => [...prev, action]);

    if (!isOnline) {
      toast.info('Azione salvata offline', {
        description: 'Verrà sincronizzata quando tornerai online'
      });
    }

    return action.id;
  }, [isOnline]);

  // Process the sync queue
  const processSyncQueue = useCallback(async () => {
    if (!isOnline || syncQueue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    console.log(`🔄 Processing ${syncQueue.length} offline actions...`);

    const successfulActions: string[] = [];
    const failedActions: OfflineAction[] = [];

    for (const action of syncQueue) {
      try {
        console.log(`📤 Syncing action: ${action.type}`, action.data);
        
        switch (action.type) {
          case 'profile_update':
            await supabase
              .from('profiles')
              .update(action.data.updates)
              .eq('id', action.data.userId);
            break;
            
          case 'notification_read':
            await supabase
              .from('user_notifications')
              .update({ is_read: true })
              .eq('id', action.data.notificationId);
            break;
            
          case 'buzz_action':
            await supabase
              .from('user_buzz_counter')
              .insert(action.data);
            break;
            
          case 'map_interaction':
            await supabase
              .from('map_click_events')
              .insert(action.data);
            break;
            
          default:
            console.warn(`Unknown action type: ${action.type}`);
        }
        
        successfulActions.push(action.id);
        console.log(`✅ Successfully synced: ${action.type}`);
        
      } catch (error) {
        console.error(`❌ Failed to sync action ${action.type}:`, error);
        
        if (action.retryCount < 3) {
          failedActions.push({
            ...action,
            retryCount: action.retryCount + 1
          });
        } else {
          console.error(`❌ Action ${action.type} failed after 3 retries, dropping`);
        }
      }
    }

    // Update queue: remove successful actions, keep failed ones for retry
    setSyncQueue(failedActions);
    
    if (successfulActions.length > 0) {
      toast.success('Sincronizzazione completata', {
        description: `${successfulActions.length} azioni sincronizzate`
      });
    }

    if (failedActions.length > 0) {
      toast.warning('Alcune azioni non sincronizzate', {
        description: `${failedActions.length} azioni verranno riprovate`
      });
    }

    setIsSyncing(false);
  }, [isOnline, syncQueue, isSyncing]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      const timer = setTimeout(processSyncQueue, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, syncQueue.length, processSyncQueue]);

  // Clear queue manually
  const clearQueue = useCallback(() => {
    setSyncQueue([]);
    localStorage.removeItem('m1ssion_offline_queue');
    toast.success('Coda di sincronizzazione pulita');
  }, []);

  return {
    isOnline,
    syncQueue,
    isSyncing,
    queueLength: syncQueue.length,
    addToQueue,
    processSyncQueue,
    clearQueue
  };
};

export default useOfflineSync;
