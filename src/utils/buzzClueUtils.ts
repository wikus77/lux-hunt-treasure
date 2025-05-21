
import { vagueBuzzClues } from "@/data/vagueBuzzClues";

/**
 * Returns a random clue that hasn't been used before
 * @param usedClues Array of clues that have already been used
 * @returns A random clue from available clues
 */
export function getNextVagueClue(usedClues: string[]) {
  const available = vagueBuzzClues.filter(clue => !usedClues.includes(clue));
  if (available.length === 0) return vagueBuzzClues[0]; // Return first clue if all have been used
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Loads previously unlocked clue count from localStorage
 * @returns The number of unlocked clues or 0 if none
 */
export function loadUnlockedCluesCount(): number {
  try {
    const saved = localStorage.getItem('unlockedCluesCount');
    return saved ? parseInt(saved, 10) : 0;
  } catch (e) {
    console.error("Error loading unlocked clues count:", e);
    return 0;
  }
}

/**
 * Loads previously used vague clues from localStorage
 * @returns Array of used clue strings or empty array if none
 */
export function loadUsedVagueClues(): string[] {
  try {
    const saved = localStorage.getItem('usedVagueBuzzClues');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Error loading used clues:", e);
    return [];
  }
}

/**
 * Saves unlocked clues count to localStorage
 * @param count The number of unlocked clues to save
 */
export function saveUnlockedCluesCount(count: number): void {
  try {
    localStorage.setItem('unlockedCluesCount', count.toString());
  } catch (e) {
    console.error("Failed to save unlockedCluesCount to localStorage", e);
  }
}

/**
 * Saves used vague clues to localStorage
 * @param usedClues Array of used clue strings to save
 */
export function saveUsedVagueClues(usedClues: string[]): void {
  try {
    localStorage.setItem('usedVagueBuzzClues', JSON.stringify(usedClues));
  } catch (e) {
    console.error("Failed to save usedVagueBuzzClues to localStorage", e);
  }
}
