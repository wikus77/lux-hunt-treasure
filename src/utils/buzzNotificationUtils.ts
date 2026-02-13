import { t } from '@/i18n/i18n';
import { toast } from "sonner";

/**
 * Handles displaying notification for a new clue
 * @param clueText The text of the clue to display
 * @param addNotification Optional notification function from useNotifications
 */
export function displayNewClueNotification(clueText: string, addNotification: ((notification: any) => boolean) | null): void {
  if (addNotification) {
    const success = addNotification({
      title: t('new_clue_extra'),
      description: clueText
    });

    if (!success) {
      // Fall back to toast if notification couldn't be added
      toast(t('new_clue_extra') + " " + clueText, { duration: 5000 });
    }
  } else {
    // If notification function not available, use toast
    toast(t('new_clue_extra') + " " + clueText, { duration: 5000 });
  }
}

/**
 * Shows a toast notification for clue limit reached
 */
export function showCluesLimitReachedNotification(): void {
  toast(t('all_clues_unlocked'), {
    duration: 3000,
    position: "top-center"
  });
}

/**
 * Shows a toast notification for clues reset
 */
export function showCluesResetNotification(): void {
  toast.info(t('clues_counter_reset'), { 
    duration: 3000 
  });
}
