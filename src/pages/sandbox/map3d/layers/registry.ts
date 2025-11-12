// Layer Registry for MapLibre 3D - Manages all overlay layers
import type { Map as MLMap } from 'maplibre-gl';

export interface Layer {
  name: string;
  enabled: boolean;
  mount: (map: MLMap) => void;
  unmount: () => void;
  setData?: (data: any) => void;
}

class LayerRegistry {
  private layers: Map<string, Layer> = new Map();
  private map: MLMap | null = null;

  init(map: MLMap) {
    this.map = map;
    console.log('🗺️ LayerRegistry initialized');
  }

  register(layer: Layer) {
    this.layers.set(layer.name, layer);
    console.log(`📍 Layer registered: ${layer.name}`);
  }

  enable(name: string) {
    const layer = this.layers.get(name);
    if (layer && this.map && !layer.enabled) {
      layer.mount(this.map);
      layer.enabled = true;
      console.log(`✅ Layer enabled: ${name}`);
    }
  }

  disable(name: string) {
    const layer = this.layers.get(name);
    if (layer && layer.enabled) {
      layer.unmount();
      layer.enabled = false;
      console.log(`❌ Layer disabled: ${name}`);
    }
  }

  toggle(name: string) {
    const layer = this.layers.get(name);
    if (layer) {
      if (layer.enabled) {
        this.disable(name);
      } else {
        this.enable(name);
      }
    }
  }

  setData(name: string, data: any) {
    const layer = this.layers.get(name);
    if (layer?.setData) {
      layer.setData(data);
    }
  }

  unmountAll() {
    this.layers.forEach(layer => {
      if (layer.enabled) {
        layer.unmount();
      }
    });
    console.log('🧹 All layers unmounted');
  }

  getLayer(name: string): Layer | undefined {
    return this.layers.get(name);
  }

  isEnabled(name: string): boolean {
    return this.layers.get(name)?.enabled || false;
  }
}

export const layerRegistry = new LayerRegistry();

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
