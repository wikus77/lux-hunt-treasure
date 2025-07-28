// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Offline Manager and Queue System

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export const OfflineManager: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connessione ripristinata', {
        description: 'Sincronizzazione dati in corso...'
      });
      processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Modalità offline', {
        description: 'Le azioni verranno sincronizzate al ripristino della connessione'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const newAction: QueuedAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0
    };

    setQueuedActions(prev => [...prev, newAction]);
    
    // Store in localStorage for persistence
    const storedQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    localStorage.setItem('offlineQueue', JSON.stringify([...storedQueue, newAction]));
  };

  const processQueue = async () => {
    if (!isOnline || queuedActions.length === 0) return;

    for (const action of queuedActions) {
      try {
        // Process action based on type
        await processAction(action);
        
        // Remove from queue on success
        setQueuedActions(prev => prev.filter(a => a.id !== action.id));
        
        // Update localStorage
        const remainingQueue = queuedActions.filter(a => a.id !== action.id);
        localStorage.setItem('offlineQueue', JSON.stringify(remainingQueue));
        
      } catch (error) {
        console.error('Failed to process queued action:', error);
        
        // Increment retry count
        if (action.retryCount < 3) {
          setQueuedActions(prev => 
            prev.map(a => 
              a.id === action.id 
                ? { ...a, retryCount: a.retryCount + 1 }
                : a
            )
          );
        } else {
          // Remove from queue after 3 failed attempts
          setQueuedActions(prev => prev.filter(a => a.id !== action.id));
        }
      }
    }
  };

  const processAction = async (action: QueuedAction): Promise<void> => {
    // Implement action processing logic based on action.type
    switch (action.type) {
      case 'api_request':
        // Process API request
        const response = await fetch(action.data.url, action.data.options);
        if (!response.ok) throw new Error('API request failed');
        break;
      
      case 'database_update':
        // Process database update
        // Implementation depends on your data layer
        break;
      
      default:
        console.warn('Unknown action type:', action.type);
    }
  };

  // Load queue from localStorage on mount
  useEffect(() => {
    const storedQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    setQueuedActions(storedQueue);
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Modalità Offline</span>
            {queuedActions.length > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{queuedActions.length} azioni in coda</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for adding actions to offline queue
export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueAction = (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>) => {
    if (!isOnline) {
      // Add to queue
      const newAction: QueuedAction = {
        ...action,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        retryCount: 0
      };

      const storedQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
      localStorage.setItem('offlineQueue', JSON.stringify([...storedQueue, newAction]));
      
      toast.info('Azione salvata', {
        description: 'Verrà eseguita al ripristino della connessione'
      });
      
      return Promise.resolve();
    }

    // Execute immediately if online
    return Promise.resolve();
  };

  return { isOnline, queueAction };
};