
import { supabase } from "@/integrations/supabase/client";
import { PrizeFormValues } from "../hooks/usePrizeForm";

export interface GeocodeResult {
  lat?: string;
  lon?: string;
  display_name?: string;
  error?: string;
  statusCode?: number;
  errorType?: 'rate_limit' | 'not_found' | 'service_error' | 'network_error' | 'format_error';
  debug?: any;
  suggestions?: string[];
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

async function getAuthToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

export async function geocodeAddress(city: string, address: string): Promise<GeocodeResult> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const geocodeResponse = await fetch(
      `${supabaseUrl}/functions/v1/geocode-address`, 
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ address, city })
      }
    );
    
    if (!geocodeResponse.ok) {
      const errorInfo = await geocodeResponse.json().catch(() => ({ error: "Parsing error" }));
      return { 
        error: errorInfo.error || `Errore geocoding: ${geocodeResponse.statusText}`, 
        statusCode: geocodeResponse.status,
        errorType: errorInfo.errorType || 'service_error',
        lat: "", 
        lon: "",
        suggestions: errorInfo.suggestions || [],
        debug: errorInfo.debug
      };
    }
    
    return await geocodeResponse.json();
  } catch (error) {
    return { 
      error: `Errore durante la geocodifica: ${error.message}`, 
      errorType: 'network_error',
      lat: "", 
      lon: "" 
    };
  }
}

export async function logAuthDebugInfo() {
  const { data: sessionData } = await supabase.auth.getSession();
  const { data: userData } = await supabase.auth.getUser();
  
  return {
    isAuthenticated: !!userData?.user,
    userId: userData?.user?.id,
    userEmail: userData?.user?.email,
    isAdmin: userData?.user?.email === 'wikus77@hotmail.it'
  };
}

export async function createPrize(values: PrizeFormValues, lat: number, lon: number) {
  const result = await supabase
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
  
  if (result.error?.message.includes("policy")) {
    throw new Error(`Errore di autorizzazione: solo gli admin possono inserire premi.`);
  }
  
  return result;
}

export async function generatePrizeClues(params: ClueGenerationParams): Promise<ClueGenerationResult> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const clueResponse = await fetch(
      `${supabaseUrl}/functions/v1/generate-prize-clues`, 
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify(params)
      }
    );
    
    if (!clueResponse.ok) {
      return { clues: [], error: `Errore generazione indizi: ${clueResponse.statusText}` };
    }
    
    return await clueResponse.json();
  } catch (error) {
    return { clues: [], error: `Errore: ${error.message}` };
  }
}

export async function insertPrizeClues(clues: any[], prizeId: string) {
  try {
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
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const insertResponse = await fetch(
      `${supabaseUrl}/functions/v1/insert-prize-clues`, 
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ clues_data: formattedClues })
      }
    );
    
    if (!insertResponse.ok) {
      return { error: `Errore salvataggio indizi: ${insertResponse.statusText}` };
    }
    
    return await insertResponse.json();
  } catch (error) {
    return { error: `Errore: ${error.message}` };
  }
}
