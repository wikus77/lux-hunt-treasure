
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBuzzMapNotifications = () => {
  const sendAreaGeneratedNotification = useCallback(async (userId: string, radiusKm: number, generation: number) => {
    try {
      console.log('📬 Sending area generated notification...');
      
      const notificationMessage = `È stata generata una nuova area BUZZ di ricerca: raggio ${radiusKm.toFixed(1)} km.`;
      
      const { data, error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          title: "Nuova Area Generata",
          message: notificationMessage,
          type: "buzz_generated",
          is_read: false
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ Error creating notification:', error);
        console.log("▶️ notification inserted:", false);
        return false;
      }

      console.log('✅ Notification created successfully:', data.id);
      console.log("▶️ notification inserted:", data.id);
      
      toast.success(`✅ Area ${radiusKm.toFixed(1)}km generata - Generazione ${generation}`);
      
      return true;
    } catch (error) {
      console.error('❌ Exception creating notification:', error);
      console.log("▶️ notification inserted:", false);
      return false;
    }
  }, []);

  return {
    sendAreaGeneratedNotification
  };
};
