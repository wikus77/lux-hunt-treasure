
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BuzzApiParams {
  userId: string;
  generateMap: boolean;
}

interface BuzzApiResponse {
  success: boolean;
  clue_text?: string;
  buzz_cost?: number;
  error?: string;
}

export function useBuzzApi() {
  const callBuzzApi = async ({ userId, generateMap }: BuzzApiParams): Promise<BuzzApiResponse> => {
    try {
      if (!userId) {
        return { success: false, error: "Devi effettuare l'accesso per utilizzare questa funzione" };
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        return { success: false, error: "ID utente non valido" };
      }
      
      const { data, error } = await supabase.functions.invoke("handle-buzz-press", {
        body: { userId, generateMap },
      });
      
      if (error) {
        console.error("Error calling buzz function:", error);
        return { success: false, error: "Errore durante l'elaborazione dell'indizio" };
      }
      
      if (!data.success) {
        return { success: false, error: data.error || "Errore durante l'elaborazione dell'indizio" };
      }
      
      return { 
        success: true, 
        clue_text: data.clue_text,
        buzz_cost: data.buzz_cost
      };
    } catch (error) {
      console.error("Error in buzz API call:", error);
      return { success: false, error: "Si è verificato un errore" };
    }
  };

  return { callBuzzApi };
}
