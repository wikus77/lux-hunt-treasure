import React, { useState } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronDown, ChevronRight, Trash2, Plus } from 'lucide-react';

interface DevAreasPanelProps {
  map: MLMap | null;
  searchAreas: { id: string; lat: number; lng: number; radius: number; label?: string }[];
  onDelete: (id: string) => Promise<boolean> | void;
  onFocus: (id: string | null) => void;
  onAddArea: (radius?: number) => void;
}

const DevAreasPanel: React.FC<DevAreasPanelProps> = ({ map, searchAreas, onDelete, onFocus, onAddArea }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [showRadiusPicker, setShowRadiusPicker] = useState<boolean>(false);
  const [selectedRadius, setSelectedRadius] = useState<number>(500);

  const radiusOptions = [
    { value: 250, label: '250m' },
    { value: 500, label: '500m' },
    { value: 1000, label: '1km' },
    { value: 2000, label: '2km' }
  ];

  const handleAddAreaClick = () => {
    setSelectedRadius(500); // Reset to default
    setShowRadiusPicker(true);
  };

  const handleConfirmRadius = () => {
    setShowRadiusPicker(false);
    onAddArea(selectedRadius); // Pass selected radius to trigger map click mode
  };

  const flyTo = (a: { lat: number; lng: number }) => {
    if (!map) return;
    map.flyTo({ center: [a.lng, a.lat], zoom: Math.max(map.getZoom(), 15), duration: 800 });
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 34px) + 80px)',
          right: 12,
          zIndex: 1002,
          pointerEvents: 'auto',
        }}
      >
        <div
          className="m1x-pill m1x-pill--areas"
          onClick={() => setOpen(o => !o)}
          title="Punti/Aree (DEV)"
        >
          <div className="m1x-pill__icon">
            <MapPin className="h-6 w-6 text-purple-400" />
          </div>
          <div className="m1x-pill__label">
            Punti/Aree ({searchAreas?.length || 0})
          </div>
        </div>

        {open && (
          <div className="mt-2 w-[260px] rounded-xl border border-purple-500/30 bg-black/70 backdrop-blur-md p-2 text-sm text-white/90">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-white/80">Gestisci aree di ricerca</div>
              <Button size="sm" className="h-7 px-2 text-xs bg-black/60 hover:bg-black/80 border border-purple-500/30" onClick={handleAddAreaClick}>
                <Plus className="h-3 w-3 mr-1" /> Nuova
              </Button>
            </div>
          {(!searchAreas || searchAreas.length === 0) ? (
            <div className="text-xs text-white/70 px-2 py-3">Nessuna area. Usa "Nuova" e poi clicca sulla mappa.</div>
          ) : (
            <ul className="max-h-[260px] overflow-auto space-y-2 pr-1">
              {searchAreas.map(a => (
                <li key={a.id} className="rounded-lg border border-white/10 p-2">
                  <div className="font-medium truncate">{a.label || 'Area di ricerca'}</div>
                  <div className="text-xs text-white/70">Raggio: {(a.radius/1000).toFixed(1)} km</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button size="sm" className="h-7 px-2 text-xs bg-black/60 hover:bg-black/80 border border-cyan-500/30" onClick={() => { onFocus(a.id); flyTo(a); }}>
                      Focus
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => onDelete(a.id)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Elimina
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            )}
          </div>
        )}
      </div>

      {/* Radius Picker Modal */}
      {showRadiusPicker && (
        <>
          <div className="m1x-radius-picker-backdrop" onClick={() => setShowRadiusPicker(false)} />
          <div className="m1x-radius-picker">
            <div className="m1x-radius-picker__title">Seleziona il raggio dell'area</div>
            <div className="m1x-radius-picker__options">
              {radiusOptions.map(option => (
                <div
                  key={option.value}
                  className={`m1x-radius-picker__option ${selectedRadius === option.value ? 'm1x-radius-picker__option--selected' : ''}`}
                  onClick={() => setSelectedRadius(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
            <div className="m1x-radius-picker__actions">
              <button
                className="m1x-radius-picker__btn m1x-radius-picker__btn--cancel"
                onClick={() => setShowRadiusPicker(false)}
              >
                Annulla
              </button>
              <button
                className="m1x-radius-picker__btn m1x-radius-picker__btn--confirm"
                onClick={handleConfirmRadius}
              >
                Conferma
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DevAreasPanel;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
