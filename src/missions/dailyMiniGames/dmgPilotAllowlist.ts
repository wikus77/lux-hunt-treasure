/**
 * Client-side pilot allowlist for daily mini-game tooling (replay / test UX only).
 * Keep aligned with Edge `dailyPinRotatorPilotClaim` default list when DAILY_MINI_GAMES_PILOT_EMAILS is unset.
 * © 2025 Joseph MULÉ – M1SSION™
 */

const DEFAULT_DMG_PILOT_EMAILS = ['wikus77@hotmail.it', 'joseph@m1ssion.io'];

export function isDailyMiniGamePilotUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return DEFAULT_DMG_PILOT_EMAILS.includes(email.trim().toLowerCase());
}
