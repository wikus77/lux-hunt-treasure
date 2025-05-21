
import { BUZZ_STORAGE_KEYS } from "@/utils/buzzConstants";

/**
 * Loads previously unlocked clue count from localStorage
 * @returns The number of unlocked clues or 0 if none
 */
export function loadUnlockedCluesCount(): number {
  try {
    const saved = localStorage.getItem(BUZZ_STORAGE_KEYS.UNLOCKED_CLUES_COUNT);
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
    const saved = localStorage.getItem(BUZZ_STORAGE_KEYS.USED_VAGUE_CLUES);
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
    localStorage.setItem(BUZZ_STORAGE_KEYS.UNLOCKED_CLUES_COUNT, count.toString());
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
    localStorage.setItem(BUZZ_STORAGE_KEYS.USED_VAGUE_CLUES, JSON.stringify(usedClues));
  } catch (e) {
    console.error("Failed to save usedVagueBuzzClues to localStorage", e);
  }
}
