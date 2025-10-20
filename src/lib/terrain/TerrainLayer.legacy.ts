import L from 'leaflet';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface TerrainLayerOptions {
  demUrl?: string;
  token?: string;
  hillshade?: boolean;
  sky?: boolean;
}

class TerrainLayer extends L.Layer {
  private map?: L.Map;
  private glMap?: maplibregl.Map;
  private container?: HTMLElement;
  private terrainOptions: TerrainLayerOptions;
  private isActive = false;

  constructor(options: TerrainLayerOptions = {}) {
    super();
    this.terrainOptions = {
      hillshade: true,
      sky: true,
      ...options
    };
  }

  onAdd(map: L.Map): this {
    this.map = map;
    
    // Create container for MapLibre GL
    this.container = L.DomUtil.create('div', 'terrain-layer-container');
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.zIndex = '0'; // Under Leaflet tiles
    this.container.style.pointerEvents = 'none'; // Let Leaflet handle interactions
    
    map.getPane('mapPane')?.prepend(this.container);

    // Initialize MapLibre GL Map
    this.initGLMap();

    // Sync with Leaflet map movements
    map.on('move', this.syncMapView, this);
    map.on('zoom', this.syncMapView, this);
    map.on('resize', this.resize, this);

    return this;
  }

  onRemove(): this {
    if (this.map) {
      this.map.off('move', this.syncMapView, this);
      this.map.off('zoom', this.syncMapView, this);
      this.map.off('resize', this.resize, this);
    }

    this.destroy();
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    return this;
  }

  private initGLMap() {
    if (!this.container || !this.map) return;

    const center = this.map.getCenter();
    const zoom = this.map.getZoom();

    try {
      this.glMap = new maplibregl.Map({
        container: this.container,
        style: this.buildStyle(),
        center: [center.lng, center.lat],
        zoom: zoom - 1,
        pitch: 0,
        bearing: 0,
        interactive: false, // Leaflet handles interactions
        attributionControl: false,
        logoPosition: 'bottom-left'
      });

      this.glMap.on('load', () => {
        if (this.terrainOptions.demUrl) {
          this.addTerrainSource();
        }
        this.isActive = true;
      });
    } catch (error) {
      console.warn('⚠️ Terrain layer initialization failed:', error);
    }
  }

  private buildStyle(): maplibregl.StyleSpecification {
    const demUrl = this.terrainOptions.demUrl || 
      'https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png';

    return {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        },
        'terrain-dem': {
          type: 'raster-dem',
          url: demUrl,
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'osm-base',
          type: 'raster',
          source: 'osm-tiles',
          paint: {
            'raster-opacity': 0.3 // Semi-transparent to see terrain
          }
        }
      ]
    } as maplibregl.StyleSpecification;
  }

  private addTerrainSource() {
    if (!this.glMap) return;

    try {
      // Add terrain to map
      this.glMap.setTerrain({
        source: 'terrain-dem',
        exaggeration: 1.5
      });

      // Add hillshade layer if enabled
      if (this.terrainOptions.hillshade) {
        this.glMap.addLayer({
          id: 'hillshade',
          type: 'hillshade',
          source: 'terrain-dem',
          paint: {
            'hillshade-exaggeration': 0.8,
            'hillshade-shadow-color': '#000000',
            'hillshade-accent-color': '#ffffff'
          }
        });
      }

      // Sky is not supported in basic MapLibre layer types
      // Removed to fix TypeScript errors
    } catch (error) {
      console.warn('⚠️ Failed to add terrain source:', error);
    }
  }

  private syncMapView = () => {
    if (!this.glMap || !this.map) return;

    const center = this.map.getCenter();
    const zoom = this.map.getZoom();

    this.glMap.setCenter([center.lng, center.lat]);
    this.glMap.setZoom(zoom - 1);
  };

  private resize = () => {
    if (this.glMap) {
      this.glMap.resize();
    }
  };

  show() {
    if (this.container) {
      this.container.style.display = 'block';
      this.syncMapView();
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  setPitch(pitch: number) {
    if (this.glMap) {
      this.glMap.setPitch(pitch);
    }
  }

  destroy() {
    if (this.glMap) {
      this.glMap.remove();
      this.glMap = undefined;
    }
    this.isActive = false;
  }

  isReady(): boolean {
    return this.isActive;
  }
}

export function createTerrainLayer(options: TerrainLayerOptions = {}): TerrainLayer {
  return new TerrainLayer(options);
}

export default TerrainLayer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
