/**
 * GeoGuards — Validazione robusta coordinate e layer React-Leaflet
 * Previene crash "Cannot read properties of undefined (reading 'x')"
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

/**
 * Verifica se un valore è un numero finito valido
 */
export function isValidNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

/**
 * Verifica se lat/lng sono coordinate valide
 * @param lat Latitudine (-90 a 90)
 * @param lng Longitudine (-180 a 180)
 */
export function isValidLatLng(lat?: unknown, lng?: unknown): boolean {
  if (!isValidNumber(lat) || !isValidNumber(lng)) {
    return false;
  }
  
  // Range geografici validi
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  
  // Esclude (0,0) che spesso indica dati mancanti
  if (lat === 0 && lng === 0) return false;
  
  return true;
}

/**
 * Verifica se il radius è valido per Circle
 * @param radius Raggio in metri (deve essere > 0)
 */
export function isValidRadius(radius?: unknown): boolean {
  if (!isValidNumber(radius)) return false;
  return radius > 0 && radius < 10000000; // Max 10,000 km
}

/**
 * Verifica se un Circle può essere renderizzato in sicurezza
 */
export function canRenderCircle(params: {
  lat?: unknown;
  lng?: unknown;
  radius?: unknown;
}): boolean {
  return (
    isValidLatLng(params.lat, params.lng) &&
    isValidRadius(params.radius)
  );
}

/**
 * Verifica se un Marker può essere renderizzato in sicurezza
 */
export function canRenderMarker(params: {
  lat?: unknown;
  lng?: unknown;
}): boolean {
  return isValidLatLng(params.lat, params.lng);
}

/**
 * Log diagnostico guard (solo in dev o sempre se necessario)
 */
export function logGuard(context: string, payload: Record<string, unknown>): void {
  // Log sempre per diagnostica
  console.warn(`[MAP-GUARD] ${context}`, payload);
}

/**
 * Normalizza center da vari formati a {lat, lng}
 */
export function normalizeCenter(center: unknown): { lat: number; lng: number } | null {
  // Array [lat, lng]
  if (Array.isArray(center) && center.length === 2) {
    const [lat, lng] = center;
    if (isValidLatLng(lat, lng)) {
      return { lat: lat as number, lng: lng as number };
    }
  }
  
  // Oggetto {lat, lng}
  if (center && typeof center === 'object') {
    const obj = center as any;
    if ('lat' in obj && 'lng' in obj) {
      const lat = obj.lat;
      const lng = obj.lng;
      if (isValidLatLng(lat, lng)) {
        return { lat: lat as number, lng: lng as number };
      }
    }
  }
  
  return null;
}

/**
 * Normalizza radius forzando numero
 */
export function normalizeRadius(radius: unknown): number | null {
  if (typeof radius === 'string') {
    const parsed = Number(radius);
    if (isValidRadius(parsed)) return parsed;
  }
  
  if (isValidRadius(radius)) {
    return radius as number;
  }
  
  return null;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
