/**
 * Daily Control Loop™ — single evening reminder when 3/3 not done.
 * Uses same pattern as useStreakReminder: localStorage + setTimeout + Web Notification.
 * One notification per day at 19:45 to avoid same-minute as streak (20:00).
 * © 2026 Joseph MULÉ – M1SSION™
 */

const DCL_REMINDER_SCHEDULED_KEY = 'm1_dcl_reminder_scheduled';
const DCL_REMINDER_DATE_KEY = 'm1_dcl_reminder_date';
const DCL_REMINDER_COUNT_KEY = 'm1_dcl_reminder_count';

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getReminderBody(count: number): string {
  if (count === 2) return 'Manca solo 1 azione per completare la giornata.';
  if (count === 1) return 'Hai completato 1 azione. Completa le altre due.';
  return 'Commit, Streak e Missione ti aspettano. Completa le 3 azioni di oggi.';
}

/** Persist count and optionally schedule evening reminder. Call from DailyControlLoopCard. */
export function persistDclReminderState(count: number): void {
  try {
    const today = getTodayKey();
    if (count >= 3) {
      localStorage.removeItem(DCL_REMINDER_DATE_KEY);
      localStorage.removeItem(DCL_REMINDER_COUNT_KEY);
      return;
    }
    localStorage.setItem(DCL_REMINDER_DATE_KEY, today);
    localStorage.setItem(DCL_REMINDER_COUNT_KEY, String(count));
  } catch {
    // ignore
  }
}

/** Schedule a single evening (19:45) reminder if not already sent today. Returns cleanup function. Never throws (fail-safe for iOS WKWebView). */
export function scheduleDclEveningReminder(count: number): (() => void) | void {
  try {
    if (typeof window === 'undefined' || !('Notification' in window) || count >= 3) return;
    const today = getTodayKey();
    if (localStorage.getItem(DCL_REMINDER_SCHEDULED_KEY) === today) return;

    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(19, 45, 0, 0);
    if (now >= reminderTime) return;

    const delay = reminderTime.getTime() - now.getTime();
    const id = setTimeout(() => {
      try {
        const todayNow = getTodayKey();
        if (localStorage.getItem(DCL_REMINDER_SCHEDULED_KEY) === todayNow) return;
        const c = localStorage.getItem(DCL_REMINDER_COUNT_KEY);
        const cnt = c ? parseInt(c, 10) : 0;
        if (cnt >= 3) return;
        if (Notification.permission === 'granted') {
          new Notification('M1SSION — Completa la tua giornata', {
            body: getReminderBody(cnt),
            icon: '/icons/icon-192x192.png',
            tag: 'dcl-reminder',
          });
          localStorage.setItem(DCL_REMINDER_SCHEDULED_KEY, todayNow);
        }
      } catch {
        // ignore — iOS WKWebView / storage restrictions
      }
    }, delay);

    return () => clearTimeout(id);
  } catch {
    return undefined;
  }
}
