import * as L from 'leaflet';
import maplibregl, { Map as GLMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type TerrainOptions = {
  demUrl: string;
  exaggeration?: number;
  hillshade?: boolean;
  contoursUrl?: string;
};

export class TerrainLayer extends L.Layer {
  private _container?: HTMLDivElement;
  private _gl?: GLMap;
  private _ready = false;
  private _opts: TerrainOptions;
  private _leafletMap?: L.Map;

  constructor(opts: TerrainOptions) {
    super();
    this._opts = { exaggeration: 1.5, hillshade: true, ...opts };
  }

  onAdd(map: L.Map) {
    this._leafletMap = map;

    // container WebGL in overlayPane for better visibility
    const pane = map.getPane('overlayPane')!;
    this._container = L.DomUtil.create('div', 'm1-terrain-container', pane);
    Object.assign(this._container.style, {
      position: 'absolute',
      inset: '0',
      zIndex: '350',
      pointerEvents: 'none',
      mixBlendMode: 'multiply',
    });

    // istanzia MapLibre
    this._gl = new maplibregl.Map({
      container: this._container,
      style: { version: 8, sources: {}, layers: [] },
      interactive: false,
      attributionControl: false,
    });

    this._gl.on('load', () => {
      if (import.meta.env.DEV) {
        console.log('🗺️ MapLibre GL loaded, adding terrain source...');
      }

      // DEM source - use TileJSON URL for robust loading
      this._gl!.addSource('terrain-dem', {
        type: 'raster-dem',
        url: this._opts.demUrl, // TileJSON endpoint (not tiles array)
        encoding: 'mapbox',
        maxzoom: 14,
      } as any);

      this._gl!.setTerrain({ source: 'terrain-dem', exaggeration: this._opts.exaggeration });
      
      if (import.meta.env.DEV) {
        console.log('✅ Terrain source added with exaggeration:', this._opts.exaggeration);
      }

      if (this._opts.hillshade) {
        this._gl!.addLayer({
          id: 'hillshade',
          type: 'hillshade',
          source: 'terrain-dem',
          layout: {},
          paint: {
            'hillshade-exaggeration': 0.8,
            'hillshade-shadow-color': '#000000',
          },
        });
        
        if (import.meta.env.DEV) {
          console.log('✅ Hillshade layer added');
        }
      }

      if (this._opts.contoursUrl) {
        this._gl!.addSource('contours', {
          type: 'vector',
          tiles: [this._opts.contoursUrl],
          minzoom: 0,
          maxzoom: 14,
        });
        this._gl!.addLayer({
          id: 'contours-line',
          type: 'line',
          source: 'contours',
          'source-layer': 'contour',
          paint: { 'line-color': '#ffffff', 'line-opacity': 0.3, 'line-width': 1 },
        });
      }

      this._ready = true;
      this._syncFromLeaflet();
    });

    // Error handling for DEM loading failures
    this._gl.on('error', (e) => {
      if (import.meta.env.DEV) {
        console.error('❌ MapLibre GL error:', e);
      }
    });

    // sync move/zoom
    map.on('move zoom zoomend', this._syncFromLeaflet, this);

    // primo sync
    this._syncFromLeaflet();

    return this;
  }

  onRemove(map: L.Map) {
    map.off('move zoom zoomend', this._syncFromLeaflet, this);
    if (this._gl) this._gl.remove();
    if (this._container?.parentNode) this._container.parentNode.removeChild(this._container);
    this._gl = undefined;
    this._container = undefined;
    this._ready = false;
    return this;
  }

  private _syncFromLeaflet = () => {
    if (!this._leafletMap || !this._gl || !this._ready) return;
    const center = this._leafletMap.getCenter();
    const zoom = this._leafletMap.getZoom();
    // CRITICAL: pitch 55° for true 3D perception
    this._gl.jumpTo({ center: [center.lng, center.lat], zoom, pitch: 55, bearing: 0 });
  };

  /** API publiche opzionali */
  setPitch(pitch: number) { 
    if (this._gl) this._gl.setPitch(pitch); 
  }
  
  show() { 
    if (this._container) this._container.style.display = 'block'; 
  }
  
  hide() { 
    if (this._container) this._container.style.display = 'none'; 
  }
  
  isReady() { 
    return this._ready; 
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
