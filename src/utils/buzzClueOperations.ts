
import { vagueBuzzClues } from "@/data/vagueBuzzClues";
import { displayNewClueNotification, showCluesLimitReachedNotification, showCluesResetNotification } from "@/utils/buzzNotificationUtils";
import { MAX_BUZZ_CLUES } from "@/utils/buzzConstants";

/**
 * Returns a random clue that hasn't been used before
 * @param usedClues Array of clues that have already been used
 * @returns A random clue from available clues
 */
export function getNextVagueClue(usedClues: string[]): string {
  const available = vagueBuzzClues.filter(clue => !usedClues.includes(clue));
  if (available.length === 0) return vagueBuzzClues[0]; // Return first clue if all have been used
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Process clue increment and add notification if needed
 * @param currentCount Current count of unlocked clues
 * @param usedClues Array of used clue strings
 * @param addNotificationFn Function to add notification (optional)
 * @returns Object containing updated count and next clue
 */
export function processClueIncrement(
  currentCount: number,
  usedClues: string[],
  addNotificationFn: ((notification: any) => boolean) | null
): { updatedCount: number; nextClue: string | null } {
  // Check if we've hit the maximum number of clues
  if (currentCount >= MAX_BUZZ_CLUES) {
    showCluesLimitReachedNotification();
    return { updatedCount: currentCount, nextClue: null };
  }

  // Increment count but don't exceed max
  const updatedCount = Math.min(currentCount + 1, MAX_BUZZ_CLUES);

  // Only generate a new clue if we haven't reached the limit
  if (updatedCount <= MAX_BUZZ_CLUES) {
    const nextClue = getNextVagueClue(usedClues);
    
    // Display notification for the new clue
    if (nextClue) {
      displayNewClueNotification(nextClue, addNotificationFn);
    }
    
    return { updatedCount, nextClue };
  }

  return { updatedCount, nextClue: null };
}
