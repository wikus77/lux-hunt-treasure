
import { DbClue } from "@/types/clueTypes";

/**
 * Adapts a partial clue object to a complete DbClue
 * Provides fallback values for all required fields
 */
export const adaptToDbClue = (raw: any): DbClue => {
  return {
    id: raw.id || '',
    location_label: raw.location_label || '',
    week: raw.week || 0,
    title_it: raw.title_it || '',
    title_en: raw.title_en || null,
    title_fr: raw.title_fr || null,
    description_it: raw.description_it || '',
    description_en: raw.description_en || null,
    description_fr: raw.description_fr || null,
    region_hint_it: raw.region_hint_it || null,
    region_hint_en: raw.region_hint_en || null,
    region_hint_fr: raw.region_hint_fr || null,
    city_hint_it: raw.city_hint_it || null,
    city_hint_en: raw.city_hint_en || null,
    city_hint_fr: raw.city_hint_fr || null,
    is_final_week: raw.is_final_week || false,
    lat: raw.lat || 0,
    lng: raw.lng || 0,
    created_at: raw.created_at || new Date().toISOString(),
    type: raw.type || 'standard'
  };
};
