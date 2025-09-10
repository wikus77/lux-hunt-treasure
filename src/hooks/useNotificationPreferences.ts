/**
 * © 2025 Joseph MULÉ – M1SSION™ Notification Preferences Hook
 * Hook React per gestire preferenze categorie notifiche
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getCurrentPreferencesState, 
  updateCategoryPreference, 
  resolveTagsForCurrentUser,
  invalidateTagsCache 
} from '@/interest/resolveUserInterests';
import { AVAILABLE_CATEGORIES } from '@/interest/categoryTagMap';

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedTags, setResolvedTags] = useState<string[]>([]);

  // Load initial preferences
  const loadPreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prefs, tags] = await Promise.all([
        getCurrentPreferencesState(),
        resolveTagsForCurrentUser()
      ]);
      
      setPreferences(prefs);
      setResolvedTags(tags);
      
      console.log('🔍 PREFS: Loaded preferences:', prefs);
      console.log('🔍 PREFS: Resolved tags:', tags);
    } catch (error) {
      console.error('🔍 PREFS: Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update single preference
  const updatePreference = useCallback(async (category: string, enabled: boolean) => {
    try {
      const success = await updateCategoryPreference(category, enabled);
      
      if (success) {
        // Update local state
        setPreferences(prev => ({
          ...prev,
          [category]: enabled
        }));

        // Re-resolve tags
        const newTags = await resolveTagsForCurrentUser();
        setResolvedTags(newTags);
        
        console.log('🔍 PREFS: Updated preference:', category, enabled);
        console.log('🔍 PREFS: New resolved tags:', newTags);
      }
      
      return success;
    } catch (error) {
      console.error('🔍 PREFS: Error updating preference:', error);
      return false;
    }
  }, []);

  // Toggle preference
  const togglePreference = useCallback(async (category: string) => {
    const currentValue = preferences[category] || false;
    return updatePreference(category, !currentValue);
  }, [preferences, updatePreference]);

  // Refresh cache and reload
  const refreshPreferences = useCallback(async () => {
    invalidateTagsCache();
    await loadPreferences();
  }, [loadPreferences]);

  // Get active categories
  const getActiveCategories = useCallback(() => {
    return Object.entries(preferences)
      .filter(([_, enabled]) => enabled)
      .map(([category, _]) => category);
  }, [preferences]);

  // Initial load
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    resolvedTags,
    isLoading,
    availableCategories: AVAILABLE_CATEGORIES,
    updatePreference,
    togglePreference,
    refreshPreferences,
    getActiveCategories,
    hasActivePreferences: resolvedTags.length > 0
  };
}