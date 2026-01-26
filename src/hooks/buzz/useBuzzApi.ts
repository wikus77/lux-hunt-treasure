
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
      // 🔧 FIX 26/01/2026: Try multiple methods to get session (native WebView compatibility)
      let jwt = '';
      let sessionUserId = '';
      
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        jwt = sessionData?.session?.access_token || '';
        sessionUserId = sessionData?.session?.user?.id || '';
        
        // 🔍 DIAGNOSTIC TRACE (as requested in task)
        console.debug('BUZZ_MAP_FRONTEND_AUTH', {
          hasSession: !!sessionData?.session,
          hasJwt: !!jwt,
          jwtPrefix: jwt ? jwt.substring(0, 20) : 'none',
          jwtLength: jwt.length,
          userId: sessionUserId,
          sessionError: sessionError?.message
        });
        
        console.log('🔐 SESSION CHECK:', {
          hasSession: !!sessionData?.session,
          hasUser: !!sessionData?.session?.user,
          userId: sessionUserId,
          sessionError: sessionError?.message,
          hasToken: !!jwt
        });
        
        // 🔧 FIX: If session is null, try refreshing
        if (!jwt && !sessionError) {
          console.log('🔄 Attempting session refresh...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshData?.session) {
            jwt = refreshData.session.access_token || '';
            sessionUserId = refreshData.session.user?.id || '';
            console.log('✅ Session refreshed successfully');
          } else {
            console.error('❌ Session refresh failed:', refreshError);
          }
        }
      } catch (authErr) {
        console.error('❌ Auth exception:', authErr);
      }
      
      if (!jwt) {
        console.error('❌ No active session or access token found');
        return { success: false, error: true, errorMessage: "Sessione non valida. Effettua l'accesso nuovamente." };
      }
      
      // 🔥 FIX: Use direct fetch with explicit JWT instead of supabase.functions.invoke
      // to avoid potential AuthSessionMissingError in invoke mechanism
      console.log(`🔐 Calling ${functionName} via direct fetch with explicit JWT...`);
      console.log(`📡 User ID: ${sessionUserId}`);
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
        
        // 🔧 FIX 26/01/2026: Better error handling with specific messages
        const statusCode = error.status || response?.status;
        const errorMsg = error.message || 'Unknown error';
        
        console.error('🔴 [BUZZ-API] Error details:', {
          statusCode,
          errorMsg,
          fullError: error
        });
        
        // Check specific error types
        if (errorMsg.includes('daily_quota_exceeded') || statusCode === 429) {
          toast.error("Hai raggiunto il limite giornaliero di 5 BUZZ. Riprova dopo mezzanotte.");
          return { success: false, error: true, errorMessage: "Limite giornaliero raggiunto. Riprova dopo mezzanotte." };
        }
        
        if (error.details?.includes('daily_quota_exceeded') || error.code === 'daily_quota_exceeded') {
          toast.error("Hai raggiunto il limite giornaliero di 5 BUZZ. Riprova dopo mezzanotte.");
          return { success: false, error: true, errorMessage: "Limite giornaliero raggiunto. Riprova dopo mezzanotte." };
        }
        
        // 🔧 FIX: Handle specific status codes
        if (statusCode === 401) {
          toast.error('Sessione scaduta. Effettua nuovamente l\'accesso.');
          return { success: false, error: true, errorMessage: 'Sessione scaduta' };
        }
        
        if (statusCode === 400) {
          // Try to parse specific error from message
          if (errorMsg.includes('insufficient_balance')) {
            toast.error('Saldo M1U insufficiente per BUZZ MAP');
            return { success: false, error: true, errorMessage: 'Saldo insufficiente' };
          }
          toast.error('Richiesta non valida. Riprova.');
          return { success: false, error: true, errorMessage: errorMsg };
        }
        
        if (statusCode === 500) {
          console.error('🔴 [BUZZ-API] Server error:', errorMsg);
          toast.error('Errore server. I nostri tecnici sono stati avvisati.');
          return { success: false, error: true, errorMessage: `Server error: ${errorMsg}` };
        }
        
        // Generic error handling - show friendly message WITH debug info
        console.warn('BUZZ edge function error:', error.message);
        toast.error(`Operazione non riuscita (${statusCode || 'unknown'}). Riprova fra poco.`);
        return { success: false, error: true, errorMessage: `Operazione non riuscita: ${errorMsg}` };
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
        toast.error('Nessuna risposta dal server. Verifica connessione.');
        return { success: false, error: true, errorMessage: "Nessuna risposta dal server" };
      }
      
      if (!data.success) {
        // 🔧 FIX 26/01/2026: Better error extraction from server response
        const serverError = data?.error || data?.code || 'unknown';
        const serverDetail = data?.detail || data?.message || '';
        
        console.error("❌ EDGE FUNCTION RETURNED FAILURE:", {
          error: serverError,
          detail: serverDetail,
          fullResponse: data
        });
        
        // Handle specific error codes from the edge function
        if (serverError === 'daily_quota_exceeded' || data?.code === 'daily_quota_exceeded') {
          toast.error("Hai raggiunto il limite giornaliero di 5 BUZZ. Riprova dopo mezzanotte.");
          return { success: false, error: true, errorMessage: "Limite giornaliero raggiunto" };
        }
        
        if (serverError === 'payment_required' || data?.code === 'payment_required') {
          toast.error("Pagamento richiesto per utilizzare BUZZ MAPPA.");
          return { success: false, error: true, errorMessage: "Pagamento richiesto" };
        }
        
        if (serverError === 'insufficient_balance') {
          const required = data?.required || '?';
          const current = data?.current_balance || '?';
          toast.error(`Saldo insufficiente. Richiesti: ${required} M1U, Disponibili: ${current} M1U`);
          return { success: false, error: true, errorMessage: "Saldo M1U insufficiente" };
        }
        
        if (serverError === 'unauthorized') {
          toast.error("Sessione scaduta. Effettua nuovamente l'accesso.");
          return { success: false, error: true, errorMessage: "Non autorizzato" };
        }
        
        if (serverError === 'level_error') {
          console.error('🔴 [BUZZ-API] Level RPC error:', serverDetail);
          toast.error(`Errore calcolo livello: ${serverDetail}`);
          return { success: false, error: true, errorMessage: `Level error: ${serverDetail}` };
        }
        
        if (serverError === 'profile_not_found') {
          toast.error("Profilo non trovato. Contatta supporto.");
          return { success: false, error: true, errorMessage: "Profilo non trovato" };
        }
        
        if (serverError === 'area_creation_failed') {
          toast.error("Impossibile creare l'area. Riprova.");
          return { success: false, error: true, errorMessage: "Creazione area fallita" };
        }
        
        // Generic fallback with server error details
        toast.error(`Errore: ${serverError}${serverDetail ? ' - ' + serverDetail : ''}`);
        return { 
          success: false, 
          error: true,
          errorMessage: `${serverError}: ${serverDetail}` 
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
