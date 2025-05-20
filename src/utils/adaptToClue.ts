
import { Clue } from "@/types/Clue";

export function adaptToClue(raw: any): Clue {
  return {
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    region_hint: raw.region_hint ?? null,
    city_hint: raw.city_hint ?? null,
    location: {
      lat: raw.location?.lat ?? 0,
      lng: raw.location?.lng ?? 0,
      label: raw.location?.label ?? '',
    },
    week: raw.week ?? 1,
    is_final_week: raw.is_final_week ?? false,
    title_it: raw.title_it ?? raw.title ?? '',
    title_en: raw.title_en ?? raw.title ?? '',
    is_locked: raw.is_locked ?? false,
    is_premium: raw.is_premium ?? false,
    parent_id: raw.parent_id ?? null,
    premium_type: raw.premium_type ?? 'free',
    image_url: raw.image_url ?? '',
    date: raw.date ?? '',
    created_at: raw.created_at ?? new Date().toISOString()
  };
}
