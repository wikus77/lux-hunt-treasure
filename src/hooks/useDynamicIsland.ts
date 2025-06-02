
import { useState, useCallback } from 'react';
import { DynamicIsland } from '@/plugins/dynamic-island';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MissionActivity {
  missionId: string;
  title: string;
  status: string;
  progress: number;
  timeLeft?: number;
}

export const useDynamicIsland = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<MissionActivity | null>(null);
  const { user } = useAuth();

  const startActivity = useCallback(async (activity: MissionActivity) => {
    try {
      console.log('🟢 Starting Dynamic Island activity:', activity);
      
      // Save activity state to Supabase
      if (user?.id) {
        const { error } = await supabase
          .from('live_activity_state')
          .upsert({
            user_id: user.id,
            mission: activity.title, // Use activity.title for mission field
            status: activity.status,
            progress: activity.progress,
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.error('❌ Error saving live activity state:', error);
        } else {
          console.log('✅ Live activity state saved to Supabase');
        }
      }

      // Start native Dynamic Island activity
      const result = await DynamicIsland.startActivity({
        type: 'mission',
        data: {
          missionId: activity.missionId,
          timeLeft: activity.timeLeft || 0,
          progress: activity.progress,
          status: activity.status,
        },
      });

      if (result.success) {
        setIsActive(true);
        setCurrentActivity(activity);
        console.log('✅ Dynamic Island activity started successfully');
      } else {
        console.error('❌ Failed to start Dynamic Island activity');
      }

      return result.success;
    } catch (error) {
      console.error('❌ Error starting Dynamic Island activity:', error);
      return false;
    }
  }, [user?.id]);

  const updateActivity = useCallback(async (updates: Partial<MissionActivity>) => {
    if (!currentActivity) {
      console.warn('⚠️ No active Dynamic Island activity to update');
      return false;
    }

    try {
      const updatedActivity = { ...currentActivity, ...updates };
      
      // Update activity state in Supabase
      if (user?.id) {
        const { error } = await supabase
          .from('live_activity_state')
          .update({
            mission: updatedActivity.title, // Use updatedActivity.title for mission field
            status: updatedActivity.status,
            progress: updatedActivity.progress,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ Error updating live activity state:', error);
        } else {
          console.log('🔄 Live activity state updated in Supabase');
        }
      }

      // Update native Dynamic Island activity
      const result = await DynamicIsland.updateActivity({
        missionId: updatedActivity.missionId,
        timeLeft: updatedActivity.timeLeft || 0,
        progress: updatedActivity.progress,
        status: updatedActivity.status,
      });

      if (result.success) {
        setCurrentActivity(updatedActivity);
        console.log('🔄 Dynamic Island activity updated successfully');
      } else {
        console.error('❌ Failed to update Dynamic Island activity');
      }

      return result.success;
    } catch (error) {
      console.error('❌ Error updating Dynamic Island activity:', error);
      return false;
    }
  }, [currentActivity, user?.id]);

  const endActivity = useCallback(async () => {
    if (!currentActivity) {
      console.warn('⚠️ No active Dynamic Island activity to end');
      return false;
    }

    try {
      // Remove activity state from Supabase
      if (user?.id) {
        const { error } = await supabase
          .from('live_activity_state')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ Error removing live activity state:', error);
        } else {
          console.log('🛑 Live activity state removed from Supabase');
        }
      }

      // End native Dynamic Island activity
      const result = await DynamicIsland.endActivity({
        missionId: currentActivity.missionId,
      });

      if (result.success) {
        setIsActive(false);
        setCurrentActivity(null);
        console.log('🛑 Dynamic Island activity ended successfully');
      } else {
        console.error('❌ Failed to end Dynamic Island activity');
      }

      return result.success;
    } catch (error) {
      console.error('❌ Error ending Dynamic Island activity:', error);
      return false;
    }
  }, [currentActivity, user?.id]);

  return {
    isActive,
    currentActivity,
    startActivity,
    updateActivity,
    endActivity,
  };
};
