import * as L from 'leaflet';
import { toast } from 'sonner';
import { TerrainLayer } from '@/lib/terrain/TerrainLayer';

export type EnableTerrainOptions = {
  exaggeration?: number;
  hillshade?: boolean;
};

/**
 * Abilita il terreno 3D (DEM) usando TerrainLayer (MapLibre overlay sopra Leaflet)
 * - Richiede VITE_TERRAIN_URL (TileJSON raster-dem)
 * - Opzionale: VITE_CONTOUR_URL per isoipse
 */
export function enableTerrain(map: L.Map, opts: EnableTerrainOptions = {}) {
  const demUrl = import.meta.env.VITE_TERRAIN_URL as string | undefined;
  const contoursUrl = import.meta.env.VITE_CONTOUR_URL as string | undefined;
  const exaggeration = opts.exaggeration ?? 1.5;
  const hillshade = opts.hillshade ?? true;

  if (!demUrl) {
    (window as any).__M1_DEBUG = Object.assign((window as any).__M1_DEBUG ?? {}, {
      terrain3D: { available: false, active: false, terrainUrl: null, error: 'MISSING_DEM_URL' }
    });
    throw new Error('MISSING_TERRAIN_URL');
  }

  if (!/tiles\.json/i.test(demUrl)) {
    console.warn('[Terrain] URL DEM non sembra TileJSON (manca tiles.json)');
  }

  const layer = new TerrainLayer({ demUrl, contoursUrl, exaggeration, hillshade });
  layer.addTo(map);

  (window as any).__M1_DEBUG = Object.assign((window as any).__M1_DEBUG ?? {}, {
    terrain3DAvailable: true,
    terrain3D: { available: true, active: true, terrainUrl: demUrl, error: null }
  });

  toast.success('Modalità 3D Terrain attivata', { duration: 2000 });
  return layer;
}

/** Disattiva il terreno 3D */
export function disableTerrain(map: L.Map, layer?: TerrainLayer | null) {
  try {
    if (layer) {
      map.removeLayer(layer);
    }
  } catch {}

  const demUrl = import.meta.env.VITE_TERRAIN_URL as string | undefined;
  (window as any).__M1_DEBUG = Object.assign((window as any).__M1_DEBUG ?? {}, {
    terrain3D: { available: !!demUrl, active: false, terrainUrl: demUrl || null, error: null }
  });
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
