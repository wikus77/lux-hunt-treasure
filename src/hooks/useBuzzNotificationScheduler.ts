/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Push Notifications Scheduler Hook
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBuzzNotificationScheduler = () => {
  const scheduleBuzzNotification = useCallback(async (
    buzzType: 'buzz' | 'buzz_mappa',
    cooldownHours: number = 3
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('❌ No authenticated user for notification scheduling');
        return false;
      }

      // Calculate scheduled time (current time + cooldown)
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + cooldownHours);

      console.log(`📅 Scheduling ${buzzType} notification for ${scheduledTime.toISOString()}`);

      // Call the scheduling edge function
      const { error } = await supabase.functions.invoke('schedule-buzz-notification', {
        body: {
          user_id: user.id,
          buzz_type: buzzType,
          scheduled_time: scheduledTime.toISOString()
        }
      });

      if (error) {
        console.error('❌ Failed to schedule notification:', error);
        return false;
      }

      const notificationText = buzzType === 'buzz_mappa' 
        ? 'BUZZ MAPPA™' 
        : 'BUZZ';

      console.log(`✅ ${notificationText} notification scheduled successfully`);
      
      // 🔇 MUTED: Toast notifica programmata - solo indizio visibile per ora
      // toast.success(`🔔 Notifica programmata`, {
      //   description: `Riceverai un avviso quando ${notificationText} sarà disponibile tra ${cooldownHours} ore`,
      //   duration: 4000,
      // });

      return true;
    } catch (error) {
      console.error('❌ Error scheduling buzz notification:', error);
      return false;
    }
  }, []);

  const scheduleBuzzMappaNotification = useCallback(() => {
    return scheduleBuzzNotification('buzz_mappa', 3);
  }, [scheduleBuzzNotification]);

  const scheduleBuzzAvailableNotification = useCallback(() => {
    return scheduleBuzzNotification('buzz', 3);
  }, [scheduleBuzzNotification]);

  return {
    scheduleBuzzNotification,
    scheduleBuzzMappaNotification,
    scheduleBuzzAvailableNotification
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */