// @ts-nocheck
/**
 * © 2025 Joseph MULÉ – M1SSION™ User Interest Resolver
 * Risolve tag feed basati su preferenze categorie utente
 * NON TOCCA PUSH CHAIN - Solo resolver client-side
 */

import { supabase } from '@/integrations/supabase/client';
import { CATEGORY_TAGS, getTagsForCategories } from './categoryTagMap';

// Interface per preferenze utente da DB
interface NotificationPreference {
  id: string;
  user_id: string;
  category: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Cache in memoria per performance
let _cachedTags: string[] | null = null;
let _cacheExpiry: number = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minuti

/**
 * Legge le preferenze categoriali dell'utente corrente da Supabase
 */
async function getUserPreferences(): Promise<NotificationPreference[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('🔍 RESOLVE: No authenticated user');
      return [];
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('enabled', true);

    if (error) {
      console.error('🔍 RESOLVE: Error fetching preferences:', error);
      return [];
    }

    console.log('🔍 RESOLVE: Found', data?.length || 0, 'active preferences');
    return data || [];
  } catch (error) {
    console.error('🔍 RESOLVE: Exception in getUserPreferences:', error);
    return [];
  }
}

/**
 * Risolve i tag feed basati sulle preferenze categoriali attive dell'utente
 * Usa cache per performance (5min TTL)
 */
export async function resolveTagsForCurrentUser(): Promise<string[]> {
  const now = Date.now();
  
  // Check cache first
  if (_cachedTags && now < _cacheExpiry) {
    console.log('🔍 RESOLVE: Using cached tags:', _cachedTags);
    return _cachedTags;
  }

  try {
    // Fetch user preferences
    const preferences = await getUserPreferences();
    
    // Extract enabled categories
    const enabledCategories = preferences.map(pref => pref.category);
    
    // Resolve to feed tags
    const resolvedTags = getTagsForCategories(enabledCategories);
    
    // Update cache
    _cachedTags = resolvedTags;
    _cacheExpiry = now + CACHE_DURATION_MS;
    
    console.log('🔍 RESOLVE: Categories:', enabledCategories);
    console.log('🔍 RESOLVE: Resolved tags:', resolvedTags);
    
    return resolvedTags;
  } catch (error) {
    console.error('🔍 RESOLVE: Error resolving tags:', error);
    return [];
  }
}

/**
 * Forza refresh cache - utile dopo cambio preferenze
 */
export function invalidateTagsCache(): void {
  _cachedTags = null;
  _cacheExpiry = 0;
  console.log('🔍 RESOLVE: Cache invalidated');
}

/**
 * Salva/aggiorna preferenza categoria per l'utente corrente
 */
export async function updateCategoryPreference(category: string, enabled: boolean): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('🔍 RESOLVE: No authenticated user for preference update');
      return false;
    }

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        category,
        enabled,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,category'
      });

    if (error) {
      console.error('🔍 RESOLVE: Error updating preference:', error);
      return false;
    }

    // Invalidate cache after update
    invalidateTagsCache();
    
    console.log('🔍 RESOLVE: Updated preference:', category, enabled);
    return true;
  } catch (error) {
    console.error('🔍 RESOLVE: Exception updating preference:', error);
    return false;
  }
}

/**
 * Ottiene lo stato corrente delle preferenze (per UI)
 */
export async function getCurrentPreferencesState(): Promise<Record<string, boolean>> {
  try {
    const preferences = await getUserPreferences();
    const state: Record<string, boolean> = {};
    
    // Default tutte le categorie a false
    Object.keys(CATEGORY_TAGS).forEach(category => {
      state[category] = false;
    });
    
    // Set enabled categories to true
    preferences.forEach(pref => {
      if (pref.enabled) {
        state[pref.category] = true;
      }
    });
    
    return state;
  } catch (error) {
    console.error('🔍 RESOLVE: Error getting preferences state:', error);
    return {};
  }
}