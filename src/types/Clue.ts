
export interface Clue {
  id: string;
  title: string;
  description: string;
  region_hint: string | null;
  city_hint: string | null;
  location: {
    lat: number;
    lng: number;
    label: string;
  };
  week: number;
  is_final_week: boolean;
  title_it: string;
  title_en: string;
  is_locked: boolean;
  is_premium: boolean;
  parent_id: string | null;
  premium_type: string;
  image_url: string;
  date: string;
  created_at: string;
}
