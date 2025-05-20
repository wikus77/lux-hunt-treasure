
import { Clue } from "@/types/Clue";

// Database clue structure
export interface DbClue {
  id: string;
  location_label: string;
  week: number;
  title_it: string;
  title_en: string | null;
  title_fr: string | null;
  description_it: string;
  description_en: string | null;
  description_fr: string | null;
  region_hint_it?: string | null;
  region_hint_en?: string | null;
  region_hint_fr?: string | null;
  city_hint_it?: string | null;
  city_hint_en?: string | null;
  city_hint_fr?: string | null;
  is_final_week: boolean;
  lat: number;
  lng: number;
  created_at: string;
  type: string;
}

// User-facing clue data structure
export interface ClueData {
  id: string;
  title: string;
  description: string;
  region_hint?: string;
  city_hint?: string;
  location: {
    lat: number;
    lng: number;
    label: string;
  };
  week: number;
  is_final_week: boolean;
}

// Database structure for user-clue relationship
export interface UserClue {
  clue_id: string;
}
