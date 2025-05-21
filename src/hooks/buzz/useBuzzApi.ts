
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
        console.error("UserId mancante nella chiamata API");
        return { success: false, error: "Devi effettuare l'accesso per utilizzare questa funzione" };
      }

      // Validazione UUID formato
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.error(`UserID non valido: ${userId}`);
        return { success: false, error: "ID utente non valido" };
      }
      
      console.log(`Chiamata a handle-buzz-press con userId: ${userId}, generateMap: ${generateMap}`);
      const { data, error } = await supabase.functions.invoke("handle-buzz-press", {
        body: { userId, generateMap },
      });
      
      if (error) {
        console.error("Errore chiamata funzione buzz:", error);
        return { success: false, error: `Errore durante l'elaborazione dell'indizio: ${error.message}` };
      }
      
      if (!data || !data.success) {
        console.error("Risposta negativa dalla funzione:", data?.error || "Errore sconosciuto");
        return { 
          success: false, 
          error: data?.error || "Errore durante l'elaborazione dell'indizio" 
        };
      }
      
      console.log("Risposta positiva dalla funzione:", data);
      return { 
        success: true, 
        clue_text: data.clue_text,
        buzz_cost: data.buzz_cost
      };
    } catch (error) {
      console.error("Errore generale nella chiamata API buzz:", error);
      return { success: false, error: "Si è verificato un errore nella comunicazione con il server" };
    }
  };

  return { callBuzzApi };
}
