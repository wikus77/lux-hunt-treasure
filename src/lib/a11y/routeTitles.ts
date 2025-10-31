/**
 * M1SSION™ - Route Title Localization
 * Maps routes to human-readable Italian titles for accessibility announcements
 * @accessibility Used by RouteAnnouncer for screen reader announcements
 */

/**
 * Route title mapping for IT locale
 * Provides human-readable titles for common routes
 */
export const ROUTE_TITLES_IT: Record<string, string> = {
  '/': 'Home',
  '/home': 'Home',
  '/map': 'Mappa',
  '/buzz': 'Buzz',
  '/intelligence': 'Intelligence',
  '/notifications': 'Notifiche',
  '/leaderboard': 'Classifica',
  '/profile': 'Profilo',
  '/settings': 'Impostazioni',
  '/subscriptions': 'Abbonamenti',
  '/login': 'Accesso',
  '/register': 'Registrazione',
};

/**
 * Get localized route title
 * @param path - Current route path
 * @param locale - Locale code (default: 'it')
 * @returns Human-readable route title or sanitized path
 */
export function getRouteTitle(path: string, locale: string = 'it'): string {
  // Use Italian titles for now (future: add other locales)
  const title = ROUTE_TITLES_IT[path];
  
  if (title) {
    return title;
  }
  
  // Fallback: sanitize path (remove slashes, replace hyphens with spaces)
  return path
    .replace(/^\//, '')
    .replace(/-/g, ' ')
    .replace(/\//g, ' › ')
    .trim() || 'Home';
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
