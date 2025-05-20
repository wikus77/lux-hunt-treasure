
import { supabase } from "@/integrations/supabase/client";
import { PrizeFormValues } from "../hooks/usePrizeForm";

interface GeocodeResult {
  lat: string;
  lon: string;
  display_name?: string;
  error?: string;
}

interface ClueGenerationParams {
  prizeId: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
}

interface ClueGenerationResult {
  clues: any[];
  error?: string;
}

/**
 * Geocodes an address using the geocode-address edge function
 */
export async function geocodeAddress(city: string, address: string): Promise<GeocodeResult> {
  const geocodeResponse = await fetch(
    "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/geocode-address", 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, city })
    }
  );
  
  return await geocodeResponse.json();
}

/**
 * Creates a new prize in the database
 */
export async function createPrize(values: PrizeFormValues, lat: number, lon: number) {
  return await supabase
    .from("prizes")
    .insert({
      title: `Premio in ${values.city}`,
      location_address: `${values.address}, ${values.city}`,
      lat: lat,
      lng: lon,
      area_radius_m: values.area_radius_m,
      start_date: values.start_date,
      end_date: values.end_date || null,
      is_active: true
    })
    .select();
}

/**
 * Generates clues for a prize using the generate-prize-clues edge function
 */
export async function generatePrizeClues(params: ClueGenerationParams): Promise<ClueGenerationResult> {
  const clueResponse = await fetch(
    "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/generate-prize-clues", 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    }
  );
  
  return await clueResponse.json();
}

/**
 * Inserts clues into the database using the insert-prize-clues edge function
 */
export async function insertPrizeClues(clues: any[], prizeId: string) {
  // Format clues for database insertion
  const formattedClues = clues.map((clue: any) => ({
    prize_id: prizeId,
    week: clue.week,
    clue_type: "regular",
    title_it: clue.title_it,
    title_en: clue.title_en,
    title_fr: clue.title_fr,
    description_it: clue.description_it,
    description_en: clue.description_en,
    description_fr: clue.description_fr
  }));
  
  const insertResponse = await fetch(
    "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/insert-prize-clues", 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clues_data: formattedClues })
    }
  );
  
  return await insertResponse.json();
}
