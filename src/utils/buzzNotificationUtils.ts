
import { toast } from "sonner";

/**
 * Handles displaying notification for a new clue
 * @param clueText The text of the clue to display
 * @param addNotification Optional notification function from useNotifications
 */
export function displayNewClueNotification(clueText: string, addNotification: ((notification: any) => boolean) | null): void {
  if (addNotification) {
    const success = addNotification({
      title: "Nuovo indizio extra!",
      description: clueText
    });

    if (!success) {
      // Fall back to toast if notification couldn't be added
      toast("Nuovo indizio extra! " + clueText, { duration: 5000 });
    }
  } else {
    // If notification function not available, use toast
    toast("Nuovo indizio extra! " + clueText, { duration: 5000 });
  }
}

/**
 * Shows a toast notification for clue limit reached
 */
export function showCluesLimitReachedNotification(): void {
  toast("Hai già sbloccato tutti gli indizi disponibili!", {
    duration: 3000,
    position: "top-center"
  });
}

/**
 * Shows a toast notification for clues reset
 */
export function showCluesResetNotification(): void {
  toast.info("Contatore degli indizi azzerato", { 
    duration: 3000 
  });
}
