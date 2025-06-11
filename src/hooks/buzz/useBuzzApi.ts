
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BuzzApiParams {
  userId: string;
  generateMap: boolean;
  coordinates?: { lat: number; lng: number };
  prizeId?: string;
  sessionId?: string;
}

interface BuzzApiResponse {
  success: boolean;
  clue_text?: string;
  buzz_cost?: number;
  // New fields for map area response
  radius_km?: number;
  lat?: number;
  lng?: number;
  generation_number?: number;
  errorMessage?: string;
  error?: boolean;
  map_area?: {
    lat: number;
    lng: number;
    radius_km: number;
    week: number;
  };
  precision?: 'high' | 'low';
  canGenerateMap?: boolean;
  remainingMapGenerations?: number;
}

export function useBuzzApi() {
  const callBuzzApi = async ({ userId, generateMap, coordinates, prizeId, sessionId }: BuzzApiParams): Promise<BuzzApiResponse> => {
    try {
      if (!userId) {
        console.error("UserId mancante nella chiamata API");
        return { success: false, error: true, errorMessage: "Devi effettuare l'accesso per utilizzare questa funzione" };
      }

      // Validazione UUID formato
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.error(`UserID non valido: ${userId}`);
        return { success: false, error: true, errorMessage: "ID utente non valido" };
      }

      // CRITICAL: Build correct payload for unified backend logic
      const payload: any = { 
        userId, 
        generateMap 
      };

      // Add coordinates if generateMap is true
      if (generateMap && coordinates) {
        payload.coordinates = coordinates;
        console.log(`🗺️ BUZZ API Call with generateMap=true and coordinates:`, coordinates);
      }

      // Add optional parameters
      if (prizeId) payload.prizeId = prizeId;
      if (sessionId) payload.sessionId = sessionId;
      
      console.log(`📡 Calling handle-buzz-press with unified payload:`, payload);
      
      const { data, error } = await supabase.functions.invoke("handle-buzz-press", {
        body: payload,
      });
      
      if (error) {
        console.error("Errore chiamata funzione buzz:", error);
        return { success: false, error: true, errorMessage: `Errore durante l'elaborazione dell'indizio: ${error.message}` };
      }
      
      if (!data || !data.success) {
        console.error("Risposta negativa dalla funzione:", data?.error || "Errore sconosciuto");
        return { 
          success: false, 
          error: true,
          errorMessage: data?.errorMessage || data?.error || "Errore durante l'elaborazione dell'indizio" 
        };
      }
      
      console.log("✅ Backend response (unified):", data);
      
      return { 
        success: true, 
        clue_text: data.clue_text,
        buzz_cost: data.buzz_cost,
        radius_km: data.radius_km,
        lat: data.lat,
        lng: data.lng,
        generation_number: data.generation_number,
        map_area: data.map_area,
        precision: data.precision,
        canGenerateMap: data.canGenerateMap,
        remainingMapGenerations: data.remainingMapGenerations
      };
    } catch (error) {
      console.error("Errore generale nella chiamata API buzz:", error);
      return { success: false, error: true, errorMessage: "Si è verificato un errore nella comunicazione con il server" };
    }
  };

  return { callBuzzApi };
}
