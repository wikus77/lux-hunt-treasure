import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Layers, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface LayerConfig {
  id: string;
  label: string;
  count?: number;
  enabled: boolean;
}

interface MapLayerToggleProps {
  onLayerChange?: (layerId: string, enabled: boolean) => void;
}

const MapLayerToggle = ({ onLayerChange }: MapLayerToggleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [layers, setLayers] = useState<LayerConfig[]>([
    { id: 'portals', label: 'PORTALS', count: 4, enabled: true },
    { id: 'events', label: 'EVENTS', count: 3, enabled: true },
    { id: 'agents', label: 'AGENTS', count: 18, enabled: true },
    { id: 'zones', label: 'ZONES', count: 2, enabled: true },
  ]);

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newEnabled = !layer.enabled;
        onLayerChange?.(layerId, newEnabled);
        
        // Toggle CSS class on DOM elements with data-layer attribute
        const elements = document.querySelectorAll(`[data-layer="${layerId}"]`);
        elements.forEach(el => {
          if (newEnabled) {
            el.classList.remove('is-hidden');
          } else {
            el.classList.add('is-hidden');
          }
        });
        
        // Dispatch custom event for Living Map integration (P1 FIX: use 'layer' key for consistency)
        const event = new CustomEvent('M1_LAYER_TOGGLE', {
          detail: { layer: layerId, enabled: newEnabled }
        });
        window.dispatchEvent(event);
        
        return { ...layer, enabled: newEnabled };
      }
      return layer;
    }));
  };

  return (
    <div className="living-layers-container">
      {/* Pill - Collapsed State */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="living-layers-pill"
          aria-label="Open LIVING LAYERS"
        >
          <Layers className="w-4 h-4" />
          <span className="living-layers-pill-label">LIVING LAYERS</span>
        </button>
      )}

      {/* Panel - Expanded State */}
      {isOpen && (
        <div className="living-layers-panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-orbitron font-bold text-cyan-400">
              LIVING LAYERS
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {layers.map(layer => (
              <div 
                key={layer.id}
                className="flex items-center justify-between p-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white/90">
                    {layer.label}
                  </span>
                  {layer.count !== undefined && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                      {layer.count}
                    </span>
                  )}
                </div>
                <Switch
                  checked={layer.enabled}
                  onCheckedChange={() => toggleLayer(layer.id)}
                  className="scale-75"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLayerToggle;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
