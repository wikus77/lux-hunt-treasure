
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BuzzApiParams {
  userId: string;
  mode?: 'map' | 'clue'; // 🔥 FIX: Explicit mode parameter
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

// 🔍 Debug switch (controlled by ENV)
const DEBUG_BUZZ = import.meta.env.VITE_DEBUG_BUZZ_MAP === '1';
const dlog = (...args: any[]) => { if (DEBUG_BUZZ) console.log(...args); };

export function useBuzzApi() {
  const handleBuzzPress = async ({ userId, mode, generateMap, coordinates, prizeId, sessionId }: BuzzApiParams): Promise<BuzzApiResponse> => {
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

      // 🔥 FIX: Add explicit mode parameter
      if (mode) {
        payload.mode = mode;
      }

      // Add coordinates if generateMap is true and coordinates provided
      if (generateMap && coordinates) {
        payload.coordinates = coordinates;
        console.log(`🗺️ BUZZ API Call with generateMap=true and coordinates:`, coordinates);
      }

      // Add optional parameters only if they exist
      if (prizeId) payload.prizeId = prizeId;
      if (sessionId) payload.sessionId = sessionId;
      
      dlog('📡 [DBG] PAYLOAD', {
        generateMap: payload.generateMap,
        typeGenerateMap: typeof payload.generateMap,
        coords: payload.coordinates
      });
      
      // 🎯 Determine which edge function to call based on generateMap flag
      const functionName = generateMap ? 'handle-buzz-map' : 'handle-buzz-press';
      console.log(`📡 Calling ${functionName} with unified payload:`, payload);
      
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
      console.log(`🔐 Calling ${functionName} edge function with authenticated user...`);
      const { data, error } = await supabase.functions.invoke(functionName, {
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
      
      dlog('🛰️ [DBG] EDGE RESP', {
        ok: !!data?.success,
        mode: data?.mode,
        hasAreaId: !!data?.area_id,
        level: data?.level,
        radius_km: data?.radius_km
      });
      
      // 🔥 FIX: Validate MAP mode response has area_id
      if (DEBUG_BUZZ && data?.mode === 'map' && !data?.area_id) {
        console.warn('⚠️ [DBG] CLUE path taken instead of MAP (missing area_id)');
      }
      
      // Strict validation: if we requested MAP mode, we MUST get area_id
      if (generateMap && data?.success && data?.mode === 'map' && !data?.area_id) {
        console.error('⚠️ Edge returned MAP success but missing area_id (server error)', { data });
        return {
          success: false,
          error: true,
          errorMessage: 'Errore server: area non creata correttamente'
        };
      }
      
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
        toast.error('Operazione non riuscita, riprova fra poco.');
        return { success: false, error: true, errorMessage: 'Operazione non riuscita, riprova fra poco.' };
      }

      // Handle successful response
      if (data?.success) {
        console.log(`✅ ${functionName} success:`, data);
        
        // Gestione biforcata basata su mode
        if (data.mode === 'buzz') {
          // BUZZ normale: mostra indizio
          if (data.clue?.text) {
            toast.success(data.clue.text, {
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
            toast.success('Indizio ricevuto!');
          }
        } else if (data.mode === 'map') {
          // BUZZ MAP: valida area
          if (data.area) {
            console.log('🗺️ Area generata:', data.area);
            toast.success('Area di ricerca creata!', {
              duration: 4000,
              style: {
                background: 'linear-gradient(135deg, #9333EA 0%, #EF4444 100%)',
                color: 'white',
                fontWeight: 'bold'
              }
            });
          } else {
            toast.error('Area non generata, riprova tra poco.');
            return { success: false, error: true, errorMessage: 'Area non generata' };
          }
        } else {
          toast.success('BUZZ processed successfully');
        }

        return { 
          success: true, 
          clue_text: data.clue?.text || data.clue_text, // Backward compat
          buzz_cost: data.buzz_cost,
          radius_km: data.area?.radius_km || data.radius_km,
          lat: data.area?.center_lat || data.lat,
          lng: data.area?.center_lng || data.lng,
          area_id: data.area?.id || data.area_id,
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
        clue_text: data.clue?.text || data.clue_text, // Backward compat
        buzz_cost: data.buzz_cost,
        radius_km: data.area?.radius_km || data.radius_km,
        lat: data.area?.center_lat || data.lat,
        lng: data.area?.center_lng || data.lng,
        area_id: data.area?.id || data.area_id,
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
