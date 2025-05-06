
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotificationManager } from './useNotificationManager';

export function useRealTimeNotifications() {
  const [isConnected, setIsConnected] = useState(false);
  const { createNotification, reloadNotifications } = useNotificationManager();

  useEffect(() => {
    console.log("Setting up real-time notifications channel");
    
    // Create a channel for real-time notifications
    const channel = supabase
      .channel('notification-updates')
      .on('broadcast', { event: 'new-notification' }, (payload) => {
        console.log('Received real-time notification:', payload);
        
        if (payload.payload && typeof payload.payload === 'object') {
          const { title, description } = payload.payload as { title: string; description: string };
          
          if (title && description) {
            createNotification(title, description);
            
            // Show a toast notification
            toast.info(title, {
              description: description,
              duration: 5000,
            });
          }
        }
      })
      .subscribe((status) => {
        console.log('Real-time notification subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Clean up on unmount
    return () => {
      console.log("Cleaning up real-time notifications channel");
      supabase.removeChannel(channel);
    };
  }, [createNotification]);

  // Function to broadcast a notification to all connected clients
  const broadcastNotification = async (title: string, description: string) => {
    try {
      console.log("Broadcasting notification:", { title, description });
      
      // Instead of accessing error directly, check the response status
      const response = await supabase.channel('notification-updates').send({
        type: 'broadcast',
        event: 'new-notification',
        payload: { title, description }
      });

      // Check if the response is successful (checking for null/undefined instead of error property)
      if (!response) {
        console.error("Error broadcasting notification: No response");
        return false;
      }
      
      // Also create a local notification to ensure it's saved
      createNotification(title, description);
      
      return true;
    } catch (error) {
      console.error("Exception when broadcasting notification:", error);
      return false;
    }
  };

  return {
    isConnected,
    broadcastNotification
  };
}
