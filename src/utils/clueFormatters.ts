
import { DbClue, ClueData } from "@/types/clueTypes";

/**
 * Formats a DbClue into ClueData based on the user's language
 */
export const formatClueForDisplay = (dbClue: DbClue, language: string = 'it'): ClueData => {
  return {
    id: dbClue.id,
    title: dbClue[`title_${language}` as keyof DbClue] as string || dbClue.title_it || '',
    description: dbClue[`description_${language}` as keyof DbClue] as string || dbClue.description_it || '',
    region_hint: dbClue[`region_hint_${language}` as keyof DbClue] as string | undefined || dbClue.region_hint_it || undefined,
    city_hint: dbClue[`city_hint_${language}` as keyof DbClue] as string | undefined || dbClue.city_hint_it || undefined,
    location: {
      lat: dbClue.lat,
      lng: dbClue.lng,
      label: dbClue.location_label
    },
    week: dbClue.week,
    is_final_week: dbClue.is_final_week
  };
};
