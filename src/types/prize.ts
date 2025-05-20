
export interface Prize {
  id: string;
  title: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  
  // Optional properties from original prize schema
  acceleration?: string | null;
  area_radius_m?: number | null;
  description?: string | null;
  engine?: string | null;
  image_url?: string | null;
  lat?: number | null;
  lng?: number | null;
  location_address?: string | null;
  name?: string | null;
  power?: string | null;
  traction?: string | null;
}

export interface PrizeClue {
  id?: string;
  prize_id: string;
  week: number;
  description_it: string;
  description_en: string;
  description_fr: string;
  clue_type: string;
}

export interface PrizeFormData {
  title: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}
