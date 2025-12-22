
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BuzzApiParams {
  userId: string;
  mode?: 'map' | 'clue'; // 🔥 FIX: Explicit mode parameter
  generateMap: boolean;
  coordinates?: { lat: number; lng: number };
  prizeId?: string;
  sessionId?: string;
  // 🔍 OBSERVABILITY: Audit metadata for FREE/PAID tracking
  buzzType?: 'TIER_FREE' | 'GRANT_FREE' | 'M1U_PAID';
  m1uCost?: number;
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
  const handleBuzzPress = async ({ userId, mode, generateMap, coordinates, prizeId, sessionId, buzzType, m1uCost }: BuzzApiParams): Promise<BuzzApiResponse> => {
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

      // 🎯 Route to buzz-map-resolve when generateMap is true, otherwise handle-buzz-press
      const functionName = generateMap ? 'buzz-map-resolve-v2' : 'handle-buzz-press';
      
      // Build correct payload based on which function we're calling
      const payload: any = {};
      
      if (functionName === 'buzz-map-resolve-v2') {
        // 🗺️ BUZZ MAP RESOLVE: expects { lat, lng } directly in body
        if (!coordinates) {
          console.error('❌ buzz-map-resolve requires coordinates');
          return { success: false, error: true, errorMessage: "Coordinate mancanti per BUZZ MAP" };
        }
        payload.lat = coordinates.lat;
        payload.lng = coordinates.lng;
        if (DEBUG_BUZZ) payload.debug = true;
        console.log(`🗺️ BUZZ MAP RESOLVE payload:`, payload);
      } else {
        // 🎯 HANDLE-BUZZ-PRESS: uses unified payload with userId/generateMap/coordinates
        payload.userId = userId;
        payload.generateMap = generateMap;
        
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
        
        // 🔍 OBSERVABILITY: Include audit metadata for FREE/PAID tracking
        if (buzzType) payload.buzz_type = buzzType;
        if (m1uCost !== undefined) payload.m1u_cost = m1uCost;
        
        console.log(`🎯 HANDLE-BUZZ-PRESS payload:`, payload);
      }
      
      dlog('📡 [DBG] PAYLOAD', {
        functionName,
        generateMap: payload.generateMap,
        hasLat: 'lat' in payload,
        hasLng: 'lng' in payload,
        hasCoordinates: 'coordinates' in payload
      });
      
      // Get user session for API call
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token || '';
      
      // 🔍 DIAGNOSTIC TRACE (as requested in task)
      console.debug('BUZZ_MAP_FRONTEND_AUTH', {
        hasSession: !!sessionData?.session,
        hasJwt: !!jwt,
        jwtPrefix: jwt ? jwt.substring(0, 20) : 'none',
        jwtLength: jwt.length,
        userId: sessionData?.session?.user?.id,
        sessionError: sessionError?.message
      });
      
      console.log('🔐 SESSION CHECK:', {
        hasSession: !!sessionData?.session,
        hasUser: !!sessionData?.session?.user,
        userId: sessionData?.session?.user?.id,
        sessionError: sessionError?.message,
        hasToken: !!jwt
      });
      
      if (!jwt) {
        console.error('❌ No active session or access token found');
        return { success: false, error: true, errorMessage: "Sessione non valida. Effettua l'accesso nuovamente." };
      }
      
      // 🔥 FIX: Use direct fetch with explicit JWT instead of supabase.functions.invoke
      // to avoid potential AuthSessionMissingError in invoke mechanism
      console.log(`🔐 Calling ${functionName} via direct fetch with explicit JWT...`);
      console.log(`📡 User ID: ${sessionData.session.user.id}`);
      console.log(`🔑 JWT Length: ${jwt.length}, Prefix: ${jwt.substring(0, 20)}`);
      
      const supabaseUrl = (supabase as any).supabaseUrl || 'https://vkjrqirvdvjbemsfzxof.supabase.co';
      const functionUrl = `${supabaseUrl}/functions/v1/${functionName}`;
      
      console.log(`📡 Function URL: ${functionUrl}`);
      console.log(`📦 Payload:`, JSON.stringify(payload));
      
      // 🔥 FIX: Simple direct call - no retry, clean request
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          'apikey': (supabase as any).supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify(payload)
      });
      
      console.log(`📡 Response status: ${response.status}`);
      
      let data: any = null;
      let error: any = null;
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Edge function error (${response.status}):`, errorText);
        error = {
          message: `Edge function returned ${response.status}: ${errorText}`,
          status: response.status
        };
      } else {
        data = await response.json();
      }
      
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
        
        // 🔥 FIX: NO TOAST HERE - Toast is handled by useBuzzHandler to avoid duplicates
        // Only validate MAP mode response
        if (data.mode === 'map') {
          if (!data.area) {
            console.error('❌ MAP mode but no area returned');
            return { success: false, error: true, errorMessage: 'Area non generata' };
          }
          console.log('🗺️ Area generata:', data.area);
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
