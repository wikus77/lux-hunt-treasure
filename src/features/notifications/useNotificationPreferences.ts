// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotificationPreferences } from './types';
import { useToast } from '@/hooks/use-toast';

export const useNotificationPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    buzz: false,
    system: false,
    reward: false,
    map: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_notification_prefs')
        .select('notif_type, muted')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      const prefs: NotificationPreferences = {
        buzz: false,
        system: false,
        reward: false,
        map: false
      };

      data?.forEach(pref => {
        if (pref.notif_type in prefs) {
          prefs[pref.notif_type as keyof NotificationPreferences] = pref.muted;
        }
      });

      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (type: keyof NotificationPreferences, muted: boolean) => {
    try {
      const { error } = await supabase
        .from('user_notification_prefs')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          notif_type: type,
          muted
        });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, [type]: muted }));
      
      toast({
        title: "Preferences updated",
        description: `${type} notifications ${muted ? 'muted' : 'enabled'}`
      });
    } catch (error) {
      console.error('Error updating notification preference:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive"
      });
    }
  };

  return { preferences, loading, updatePreference };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
