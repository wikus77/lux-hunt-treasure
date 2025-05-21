
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

/**
 * Geocodes an address using the geocode-address edge function
 */
export async function geocodeAddress(city: string, address: string): Promise<GeocodeResult> {
  try {
    console.log(`Geocoding address: ${address}, ${city}`);
    
    // Use the full URL with project ID for direct access without auth headers
    const geocodeResponse = await fetch(
      "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/geocode-address", 
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ address, city })
      }
    );
    
    // Log detailed response status
    console.log(`Geocode response status: ${geocodeResponse.status} ${geocodeResponse.statusText}`);
    
    if (!geocodeResponse.ok) {
      console.error(`Geocode error: ${geocodeResponse.status} ${geocodeResponse.statusText}`);
      
      let errorInfo;
      try {
        errorInfo = await geocodeResponse.json();
      } catch (e) {
        errorInfo = { 
          error: `Response parsing failed: ${e.message}` 
        };
      }
      
      // Return full error details including suggestions
      return { 
        error: errorInfo.error || `Errore geocoding: ${geocodeResponse.statusText}`, 
        statusCode: geocodeResponse.status,
        errorType: errorInfo.errorType || (geocodeResponse.status === 429 ? 'rate_limit' : 'service_error'),
        lat: "", 
        lon: "",
        suggestions: errorInfo.suggestions || [],
        debug: errorInfo.debug
      };
    }
    
    const result = await geocodeResponse.json();
    console.log("Geocode response:", result);
    
    if (result.error) {
      return {
        error: result.error,
        statusCode: result.statusCode || 400,
        errorType: result.errorType || 'not_found',
        lat: "",
        lon: "",
        suggestions: result.suggestions || [],
        debug: result.debug
      };
    }
    
    return result;
  } catch (error) {
    console.error("Geocode error:", error);
    return { 
      error: `Errore durante la geocodifica: ${error.message}`, 
      errorType: 'network_error',
      lat: "", 
      lon: "" 
    };
  }
}

/**
 * Helper function to get the current auth token
 */
async function getAuthToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

/**
 * Logs the current user and session information for debugging
 */
export async function logAuthDebugInfo() {
  const { data: sessionData } = await supabase.auth.getSession();
  const { data: userData } = await supabase.auth.getUser();
  
  console.group("🔐 Auth Debug Info");
  console.log("Session:", sessionData);
  console.log("User ID:", userData?.user?.id);
  console.log("User Data:", userData);
  console.log("Access Token:", sessionData.session?.access_token ? "Present" : "Missing");
  
  // Check admin status in profiles
  if (userData?.user?.id) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", userData.user.id)
      .single();
    
    console.log("Profile Data:", profile);
    console.log("Profile Error:", profileError);
    console.log("Is Admin:", profile?.role === 'admin');
  }
  console.groupEnd();
  
  return {
    isAuthenticated: !!userData?.user,
    userId: userData?.user?.id,
    userEmail: userData?.user?.email,
    isAdmin: userData?.user?.email === 'wikus77@hotmail.it' || userData?.user?.email === 'admin@example.com'
  };
}

/**
 * Creates a new prize in the database
 */
export async function createPrize(values: PrizeFormValues, lat: number, lon: number) {
  try {
    console.log(`Creating prize at coordinates: ${lat}, ${lon}`);
    
    // Log auth debug info before insert
    await logAuthDebugInfo();
    
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
    
    console.log("Prize insert response:", result);
    
    if (result.error) {
      if (result.error.message.includes("policy")) {
        console.error("RLS policy error:", result.error);
        throw new Error(`Errore di autorizzazione: solo gli admin possono inserire premi. ${result.error.message}`);
      }
      throw result.error;
    }
    
    return result;
  } catch (error) {
    console.error("Error creating prize:", error);
    throw error;
  }
}

/**
 * Generates clues for a prize using the generate-prize-clues edge function
 */
export async function generatePrizeClues(params: ClueGenerationParams): Promise<ClueGenerationResult> {
  try {
    console.log(`Generating clues for prize ID: ${params.prizeId}`);
    const clueResponse = await fetch(
      "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/generate-prize-clues", 
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
      console.error(`Clue generation error: ${clueResponse.status} ${clueResponse.statusText}`);
      return { clues: [], error: `Errore generazione indizi: ${clueResponse.statusText}` };
    }
    
    return await clueResponse.json();
  } catch (error) {
    console.error("Clue generation error:", error);
    return { clues: [], error: `Errore durante la generazione degli indizi: ${error.message}` };
  }
}

/**
 * Inserts clues into the database using the insert-prize-clues edge function
 */
export async function insertPrizeClues(clues: any[], prizeId: string) {
  try {
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
    
    console.log(`Inserting ${formattedClues.length} clues for prize ID: ${prizeId}`);
    console.log("Clue data sample:", formattedClues[0]);
    
    const insertResponse = await fetch(
      "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/insert-prize-clues", 
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ clues_data: formattedClues })
      }
    );
    
    console.log(`Clue insertion response status: ${insertResponse.status} ${insertResponse.statusText}`);
    
    if (!insertResponse.ok) {
      console.error(`Clue insertion error: ${insertResponse.status} ${insertResponse.statusText}`);
      let errorDetails;
      try {
        errorDetails = await insertResponse.text();
        console.error("Error response body:", errorDetails);
      } catch (e) {
        console.error("Could not parse error response:", e);
      }
      
      return { 
        error: `Errore salvataggio indizi: ${insertResponse.statusText}`,
        statusCode: insertResponse.status,
        details: errorDetails
      };
    }
    
    const responseData = await insertResponse.json();
    console.log("Clue insertion success:", responseData);
    return responseData;
  } catch (error) {
    console.error("Clue insertion error:", error);
    return { error: `Errore durante il salvataggio degli indizi: ${error.message}` };
  }
}

/**
 * Saves clues data for a prize
 * @param cluesData Array of clue objects to save
 * @returns Promise resolving to success status
 */
export const savePrizeClues = async (cluesData: any[]) => {
  try {
    console.log("🔄 Saving prize clues:", cluesData);
    
    // Get the current session
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    
    if (!session) {
      console.error("❌ No active session found");
      throw new Error("Authentication required to save clues");
    }
    
    // Call the Edge Function to insert clues
    const response = await fetch(
      "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/insert-prize-clues",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          clues_data: cluesData,
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Edge function error:", errorData);
      throw new Error(`Failed to save clues: ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    console.log("✅ Clues saved successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Error saving clues:", error);
    throw error;
  }
};
