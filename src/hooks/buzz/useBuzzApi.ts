
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
  area_id?: string;
  level?: number;
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
  const handleBuzzPress = async ({ userId, generateMap, coordinates, prizeId, sessionId }: BuzzApiParams): Promise<BuzzApiResponse> => {
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

      // Build correct payload for unified backend logic
      const payload: any = { 
        userId, 
        generateMap 
      };

      // Add coordinates if generateMap is true and coordinates provided
      if (generateMap && coordinates) {
        payload.coordinates = coordinates;
        console.log(`🗺️ BUZZ API Call with generateMap=true and coordinates:`, coordinates);
      }

      // Add optional parameters only if they exist
      if (prizeId) payload.prizeId = prizeId;
      if (sessionId) payload.sessionId = sessionId;
      
      console.log(`📡 Calling handle-buzz-press with unified payload:`, payload);
      
      // Check user session before calling edge function
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 SESSION CHECK:', {
        hasSession: !!sessionData?.session,
        hasUser: !!sessionData?.session?.user,
        userId: sessionData?.session?.user?.id,
        sessionError: sessionError?.message,
        hasToken: !!sessionData?.session?.access_token
      });
      
      if (!sessionData?.session?.access_token) {
        console.error('❌ No active session or access token found');
        return { success: false, error: true, errorMessage: "Sessione non valida. Effettua l'accesso nuovamente." };
      }
      
      // Call edge function with verified session and explicit auth header
      console.log('🔐 Calling edge function with authenticated user...');
      const { data, error } = await supabase.functions.invoke("handle-buzz-press", {
        body: payload,
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🚨 EDGE FUNCTION CALL RESULT:', {
        hasData: !!data,
        hasError: !!error,
        dataSuccess: data?.success,
        dataError: data?.error,
        errorMessage: error?.message,
        fullData: data,
        fullError: error
      });
      
      // Handle edge function errors
      if (error) {
        console.warn("⚠️ EDGE FUNCTION ERROR:", error);
        
        // Check specific error types
        if (error.message?.includes('daily_quota_exceeded') || error.message?.includes('429')) {
          toast.error("Hai raggiunto il limite giornaliero di 5 BUZZ. Riprova dopo mezzanotte.");
          return { success: false, error: true, errorMessage: "Limite giornaliero raggiunto. Riprova dopo mezzanotte." };
        }
        
        if (error.details?.includes('daily_quota_exceeded') || error.code === 'daily_quota_exceeded') {
          toast.error("Hai raggiunto il limite giornaliero di 5 BUZZ. Riprova dopo mezzanotte.");
          return { success: false, error: true, errorMessage: "Limite giornaliero raggiunto. Riprova dopo mezzanotte." };
        }
        
        // Generic error handling - show friendly message
        console.warn('BUZZ edge function error:', error.message);
        toast.error('Non sono riuscito a generare l\'indizio, riprova fra poco.');
        return { success: false, error: true, errorMessage: 'Non sono riuscito a generare l\'indizio, riprova fra poco.' };
      }

      // Handle successful response
      if (data?.success) {
        console.log("✅ handle-buzz-press success:", data);
        
        // Show clue toast immediately if available
        if (data.clue_text) {
          toast.success(data.clue_text, {
            duration: 5000,
            position: 'top-center',
            style: { 
              zIndex: 9999,
              background: 'linear-gradient(135deg, #F213A4 0%, #FF4D4D 100%)',
              color: 'white',
              fontWeight: 'bold'
            }
          });
        } else {
          toast.success('BUZZ processed successfully');
        }

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
      }
      
      if (!data) {
        console.error("❌ EDGE FUNCTION RETURNED NULL DATA");
        toast.error('Operazione non riuscita. Riprova tra poco.');
        return { success: false, error: true, errorMessage: "Operazione non riuscita. Riprova tra poco." };
      }
      
      if (!data.success) {
        console.error("❌ EDGE FUNCTION RETURNED FAILURE:", data?.error || "Unknown error");
        
        // Handle specific error codes from the edge function
        if (data?.code === 'daily_quota_exceeded') {
          toast.error("Hai raggiunto il limite giornaliero di 5 BUZZ. Riprova dopo mezzanotte.");
          return { 
            success: false, 
            error: true,
            errorMessage: "Limite giornaliero raggiunto. Riprova dopo mezzanotte."
          };
        }
        
        if (data?.code === 'payment_required') {
          toast.error("Pagamento richiesto per utilizzare BUZZ MAPPA.");
          return { 
            success: false, 
            error: true,
            errorMessage: "Pagamento richiesto per utilizzare BUZZ MAPPA."
          };
        }
        
        toast.error('Operazione non riuscita. Riprova tra poco.');
        return { 
          success: false, 
          error: true,
          errorMessage: 'Operazione non riuscita. Riprova tra poco.' 
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
      toast.error('Operazione non riuscita. Riprova tra poco.');
      return { success: false, error: true, errorMessage: "Operazione non riuscita. Riprova tra poco." };
    }
  };

  return { callBuzzApi: handleBuzzPress };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
