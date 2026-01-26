
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isCapacitorNative, getCapacitorPlatform } from "@/utils/capacitor";

// 🔧 FIX 26/01/2026: Native-safe HTTP transport for Capacitor iOS
// WKWebView has issues with CORS preflight and session storage
// This wrapper ensures proper JWT handling in native context

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

// 🔧 FIX 26/01/2026: Native-safe HTTP fetch wrapper
// Handles WKWebView quirks: CORS, session, credentials
async function nativeSafeFetch(
  url: string,
  options: RequestInit & { 
    headers: Record<string, string>;
    body: string;
  }
): Promise<Response> {
  const isNative = isCapacitorNative();
  const platform = getCapacitorPlatform();
  
  console.log(`🌐 [NATIVE-FETCH] Platform: ${platform}, isNative: ${isNative}`);
  console.log(`🌐 [NATIVE-FETCH] URL: ${url}`);
  console.log(`🌐 [NATIVE-FETCH] Headers present:`, Object.keys(options.headers));
  
  // In native, try using CapacitorHttp if available (Capacitor v4+)
  if (isNative) {
    try {
      const CapacitorHttp = (window as any).Capacitor?.Plugins?.CapacitorHttp;
      
      if (CapacitorHttp) {
        console.log('🌐 [NATIVE-FETCH] Using CapacitorHttp plugin');
        
        const httpResponse = await CapacitorHttp.request({
          url,
          method: 'POST',
          headers: options.headers,
          data: JSON.parse(options.body),
        });
        
        console.log(`🌐 [NATIVE-FETCH] CapacitorHttp response status: ${httpResponse.status}`);
        
        // Convert CapacitorHttp response to fetch Response-like object
        return {
          ok: httpResponse.status >= 200 && httpResponse.status < 300,
          status: httpResponse.status,
          statusText: httpResponse.status.toString(),
          headers: new Headers(httpResponse.headers || {}),
          json: async () => httpResponse.data,
          text: async () => typeof httpResponse.data === 'string' 
            ? httpResponse.data 
            : JSON.stringify(httpResponse.data),
        } as unknown as Response;
      }
    } catch (capErr) {
      console.warn('🌐 [NATIVE-FETCH] CapacitorHttp not available or failed:', capErr);
    }
    
    // Native fallback: enhanced fetch with explicit settings for WKWebView
    console.log('🌐 [NATIVE-FETCH] Using enhanced fetch for native');
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...options.headers,
          'Accept': 'application/json',
        },
        body: options.body,
        // 🔧 FIX: WKWebView specific settings
        credentials: 'omit', // Don't send cookies - use JWT only
        mode: 'cors',
        cache: 'no-cache',
      });
      
      console.log(`🌐 [NATIVE-FETCH] Native fetch response status: ${response.status}`);
      return response;
    } catch (fetchErr: any) {
      console.error('🌐 [NATIVE-FETCH] Native fetch failed:', {
        error: fetchErr.message,
        name: fetchErr.name,
        stack: fetchErr.stack?.substring(0, 200)
      });
      throw fetchErr;
    }
  }
  
  // PWA/Web: standard fetch
  console.log('🌐 [NATIVE-FETCH] Using standard fetch for web');
  return fetch(url, options);
}

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
      // 🔧 FIX 26/01/2026: Native-robust session retrieval for Capacitor iOS
      // WKWebView can have timing issues with session storage
      const isNative = isCapacitorNative();
      let jwt = '';
      let sessionUserId = '';
      
      console.log(`🔐 [SESSION] Starting session retrieval, isNative: ${isNative}`);
      
      try {
        // Method 1: Try getSession first (fast, from cache)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        jwt = sessionData?.session?.access_token || '';
        sessionUserId = sessionData?.session?.user?.id || '';
        
        // 🔍 DIAGNOSTIC TRACE
        console.log('🔐 [SESSION] getSession result:', {
          hasSession: !!sessionData?.session,
          hasJwt: !!jwt,
          jwtLength: jwt.length,
          userId: sessionUserId,
          sessionError: sessionError?.message,
          isNative
        });
        
        // Method 2: If no JWT, try refreshSession (forces token refresh)
        if (!jwt) {
          console.log('🔄 [SESSION] No JWT from getSession, trying refreshSession...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshData?.session) {
            jwt = refreshData.session.access_token || '';
            sessionUserId = refreshData.session.user?.id || '';
            console.log('✅ [SESSION] refreshSession succeeded');
          } else {
            console.warn('⚠️ [SESSION] refreshSession failed:', refreshError?.message);
          }
        }
        
        // Method 3: Native-specific - Try getUser as last resort (makes API call)
        if (!jwt && isNative) {
          console.log('🔄 [SESSION] Native: Trying getUser as last resort...');
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userData?.user && !userError) {
            // User exists, try to get session again
            const { data: retrySession } = await supabase.auth.getSession();
            if (retrySession?.session?.access_token) {
              jwt = retrySession.session.access_token;
              sessionUserId = retrySession.session.user?.id || '';
              console.log('✅ [SESSION] Native retry succeeded');
            }
          } else {
            console.error('❌ [SESSION] Native getUser failed:', userError?.message);
          }
        }
      } catch (authErr: any) {
        console.error('❌ [SESSION] Auth exception:', authErr?.message);
      }
      
      // Final check
      if (!jwt) {
        console.error('❌ [SESSION] All methods failed - no JWT available');
        toast.error(isNative 
          ? 'Sessione scaduta in app nativa. Effettua nuovamente il login.' 
          : 'Sessione non valida. Effettua l\'accesso nuovamente.');
        return { success: false, error: true, errorMessage: "session_missing" };
      }
      
      console.log(`✅ [SESSION] JWT obtained successfully, length: ${jwt.length}`);
      
      // 🔥 FIX 26/01/2026: Native-safe fetch with explicit JWT
      // Uses CapacitorHttp in native or enhanced fetch for WKWebView compatibility
      const platform = getCapacitorPlatform();
      
      console.log(`🔐 Calling ${functionName} via native-safe fetch...`);
      console.log(`📱 Platform: ${platform}, isNative: ${isNative}`);
      console.log(`📡 User ID: ${sessionUserId}`);
      console.log(`🔑 JWT Length: ${jwt.length}, Prefix: ${jwt.substring(0, 20)}`);
      
      const supabaseUrl = (supabase as any).supabaseUrl || 'https://vkjrqirvdvjbemsfzxof.supabase.co';
      const functionUrl = `${supabaseUrl}/functions/v1/${functionName}`;
      const apiKey = (supabase as any).supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      
      console.log(`📡 Function URL: ${functionUrl}`);
      console.log(`📦 Payload:`, JSON.stringify(payload));
      console.log(`🔑 API Key present: ${!!apiKey}, length: ${apiKey.length}`);
      
      // 🔥 FIX: Use native-safe fetch wrapper
      let response: Response;
      try {
        response = await nativeSafeFetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
            'apikey': apiKey,
          },
          body: JSON.stringify(payload)
        });
      } catch (fetchError: any) {
        // 🔧 FIX: Handle fetch-level errors (network, CORS, etc.)
        console.error('❌ [BUZZ-API] Fetch-level error:', {
          name: fetchError.name,
          message: fetchError.message,
          isNative,
          platform
        });
        
        // Specific error messages for common issues
        if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
          toast.error(isNative 
            ? 'Errore di rete in app nativa. Verifica connessione.' 
            : 'Errore di connessione. Verifica la rete.');
          return { success: false, error: true, errorMessage: 'Network fetch failed' };
        }
        
        if (fetchError.message?.includes('CORS') || fetchError.message?.includes('blocked')) {
          toast.error('Errore CORS. Riprova o contatta supporto.');
          return { success: false, error: true, errorMessage: 'CORS blocked' };
        }
        
        toast.error(`Errore rete: ${fetchError.message || 'unknown'}`);
        return { success: false, error: true, errorMessage: `Fetch error: ${fetchError.message}` };
      }
      
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
