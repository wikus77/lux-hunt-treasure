/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Push Notifications Processor Worker
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// This hook runs a background process to check for due notifications
export const usePushNotificationProcessor = () => {
  useEffect(() => {
    console.log('🔄 Starting push notification processor...');

    const processScheduledNotifications = async () => {
      try {
        // Only run if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log('🔍 Checking for due notifications...');
        
        // Call the edge function to process notifications
        const { data, error } = await supabase.functions.invoke('process-scheduled-notifications');
        
        if (error) {
          console.error('❌ Error processing notifications:', error);
          return;
        }
        
        if (data?.processed > 0) {
          console.log(`✅ Processed ${data.processed} notifications`);
        }
      } catch (error) {
        console.error('❌ Notification processor error:', error);
      }
    };

    // Run immediately
    processScheduledNotifications();

    // Set up interval to check every 5 minutes (300,000ms)
    // This is more than enough for 3-hour cooldowns
    const intervalId = setInterval(processScheduledNotifications, 5 * 60 * 1000);

    return () => {
      console.log('🛑 Stopping push notification processor...');
      clearInterval(intervalId);
    };
  }, []);
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */