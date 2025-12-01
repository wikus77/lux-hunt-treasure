// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Streak Reminder Hook - Sends notifications to maintain streak

import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

const REMINDER_KEY = 'm1_streak_reminder_scheduled';

export function useStreakReminder() {
  const { user } = useAuthContext();

  // Check if user needs a reminder (hasn't checked in today but has an active streak)
  const checkAndScheduleReminder = useCallback(async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak_days, last_check_in_date')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const today = new Date().toISOString().split('T')[0];
      const hasCheckedInToday = profile.last_check_in_date === today;
      const hasActiveStreak = (profile.current_streak_days || 0) > 0;

      // If user has a streak but hasn't checked in today, schedule reminder
      if (hasActiveStreak && !hasCheckedInToday) {
        scheduleLocalReminder(profile.current_streak_days);
      }

    } catch (err) {
      console.error('[StreakReminder] Error checking streak:', err);
    }
  }, [user]);

  // Schedule a local notification reminder
  const scheduleLocalReminder = (currentStreak: number) => {
    // Check if already scheduled today
    const lastScheduled = localStorage.getItem(REMINDER_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    if (lastScheduled === today) return;

    // Check if browser supports notifications
    if (!('Notification' in window)) return;

    // Request permission if needed
    if (Notification.permission === 'default') {
      Notification.requestPermission();
      return;
    }

    if (Notification.permission !== 'granted') return;

    // Schedule notification for evening (20:00)
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(20, 0, 0, 0);

    // If it's already past 20:00, don't schedule
    if (now >= reminderTime) return;

    const delay = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      // Double check they still haven't checked in
      checkIfStillNeedsReminder(currentStreak);
    }, delay);

    localStorage.setItem(REMINDER_KEY, today);
    console.log('[StreakReminder] Reminder scheduled for 20:00');
  };

  const checkIfStillNeedsReminder = async (streak: number) => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_check_in_date')
        .eq('id', user.id)
        .single();

      const today = new Date().toISOString().split('T')[0];
      
      if (profile?.last_check_in_date !== today) {
        // Still hasn't checked in, send notification
        new Notification('🔥 Non perdere la tua streak!', {
          body: `Hai ${streak} giorni consecutivi! Fai check-in prima di mezzanotte!`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'streak-reminder',
          requireInteraction: true
        });
      }
    } catch (err) {
      console.error('[StreakReminder] Error sending reminder:', err);
    }
  };

  // Clear scheduled reminder on check-in
  const clearReminder = useCallback(() => {
    localStorage.removeItem(REMINDER_KEY);
  }, []);

  // Run check on mount and when user changes
  useEffect(() => {
    if (user) {
      // Small delay to avoid running on initial load
      const timer = setTimeout(checkAndScheduleReminder, 5000);
      return () => clearTimeout(timer);
    }
  }, [user, checkAndScheduleReminder]);

  return { checkAndScheduleReminder, clearReminder };
}

export default useStreakReminder;


