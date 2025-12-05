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
      const { data: profile, error: queryError } = await supabase
        .from('profiles')
        .select('current_streak_days, last_check_in_date')
        .eq('id', user.id)
        .single();

      if (queryError) {
        console.warn('[StreakReminder] Query error (non-fatal):', queryError.message);
        return; // Non-fatal - just skip reminder scheduling
      }

      if (!profile) {
        console.log('[StreakReminder] No profile found, skipping reminder');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const hasCheckedInToday = profile.last_check_in_date === today;
      const hasActiveStreak = (profile.current_streak_days || 0) > 0;

      console.log('[StreakReminder] Status:', { 
        streak: profile.current_streak_days, 
        checkedInToday: hasCheckedInToday 
      });

      // If user has a streak but hasn't checked in today, schedule reminder
      if (hasActiveStreak && !hasCheckedInToday) {
        scheduleLocalReminder(profile.current_streak_days);
      }

    } catch (err) {
      // Non-fatal error - streak reminder is not critical
      console.warn('[StreakReminder] Error checking streak (non-fatal):', err);
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
      const { data: profile, error: queryError } = await supabase
        .from('profiles')
        .select('last_check_in_date')
        .eq('id', user.id)
        .single();

      if (queryError) {
        console.warn('[StreakReminder] Query error when checking reminder:', queryError.message);
        return; // Non-fatal, skip notification
      }

      const today = new Date().toISOString().split('T')[0];
      
      if (profile?.last_check_in_date !== today) {
        // Still hasn't checked in, send notification
        try {
          new Notification('🔥 Non perdere la tua streak!', {
            body: `Hai ${streak} giorni consecutivi! Fai check-in prima di mezzanotte!`,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'streak-reminder',
            requireInteraction: true
          });
          console.log('[StreakReminder] Notification sent successfully');
        } catch (notifError) {
          console.warn('[StreakReminder] Failed to send notification:', notifError);
        }
      } else {
        console.log('[StreakReminder] User already checked in, no reminder needed');
      }
    } catch (err) {
      // Non-fatal error
      console.warn('[StreakReminder] Error in checkIfStillNeedsReminder (non-fatal):', err);
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


