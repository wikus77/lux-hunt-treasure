/**
 * MapTiler Cloud Configuration for M1SSION™
 * Handles API keys, style selection, and environment-based routing
 */

// Environment detection
const isDev = import.meta.env.DEV || window.location.hostname.includes('lovableproject.com') || window.location.hostname.includes('lovable.app');
const isProd = window.location.hostname === 'm1ssion.eu' || window.location.hostname === 'www.m1ssion.eu';

// API Keys (from env)
const DEV_KEY = import.meta.env.VITE_MAPTILER_KEY_DEV as string;
const PROD_KEY = import.meta.env.VITE_MAPTILER_KEY_PROD as string;

// Style ID (customizable)
const STYLE_ID = (import.meta.env.VITE_MAPTILER_STYLE_ID as string) || 'basic-v2-dark';

/**
 * Get the appropriate MapTiler API key based on environment
 */
export function getMapTilerKey(): string {
  const key = isProd ? PROD_KEY : DEV_KEY;
  
  if (!key) {
    console.warn('[MapTiler] ⚠️ No API key found for environment:', { 
      isDev, 
      isProd, 
      hostname: window.location.hostname,
      hasDev: !!DEV_KEY,
      hasProd: !!PROD_KEY
    });
    console.warn('[MapTiler] 💡 Set VITE_MAPTILER_KEY_DEV or VITE_MAPTILER_KEY_PROD in env');
    return '';
  }
  
  console.log('[MapTiler] ✅ Using', isProd ? 'PROD' : 'DEV', 'key for', window.location.hostname);
  return key;
}

/**
 * Get MapTiler style URL
 */
export function getMapTilerStyleUrl(): string {
  const key = getMapTilerKey();
  if (!key) {
    // Fallback to basic OSM style if no key
    return 'https://demotiles.maplibre.org/style.json';
  }
  
  return `https://api.maptiler.com/maps/${STYLE_ID}/style.json?key=${key}`;
}

/**
 * Get MapTiler terrain source configuration
 */
export function getTerrainSource() {
  const key = getMapTilerKey();
  if (!key) return null;
  
  return {
    type: 'raster-dem' as const,
    url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${key}`,
    tileSize: 512
  };
}

/**
 * Get MapTiler glyphs URL for fonts
 */
export function getGlyphsUrl(): string {
  const key = getMapTilerKey();
  if (!key) return '';
  
  return `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${key}`;
}

/**
 * Check if MapTiler is available (has valid key)
 */
export function isMapTilerAvailable(): boolean {
  return !!getMapTilerKey();
}

/**
 * MapTiler configuration object
 */
export const mapTilerConfig = {
  getKey: getMapTilerKey,
  getStyleUrl: getMapTilerStyleUrl,
  getTerrainSource,
  getGlyphsUrl,
  isAvailable: isMapTilerAvailable,
  styleId: STYLE_ID,
  isDev,
  isProd
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
