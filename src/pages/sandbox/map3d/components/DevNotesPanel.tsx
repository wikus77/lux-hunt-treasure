import React, { useMemo, useState, useEffect } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { Button } from '@/components/ui/button';
import { FileText, ChevronDown, ChevronRight, Crosshair } from 'lucide-react';

interface DevNotesPanelProps {
  map: MLMap | null;
}

interface DevNoteItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  note: string;
}

const NOTES_KEY = 'map3d-notes';

const DevNotesPanel: React.FC<DevNotesPanelProps> = ({ map }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [notes, setNotes] = useState<DevNoteItem[]>([]);

  // Load notes from localStorage when panel opens
  useEffect(() => {
    if (!open) return;
    try {
      const saved = localStorage.getItem(NOTES_KEY);
      setNotes(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.warn('[DevNotesPanel] localStorage read error', e);
      setNotes([]);
    }
  }, [open]);

  const count = notes.length;

  const flyTo = (n: DevNoteItem) => {
    if (!map) return;
    map.flyTo({ center: [n.lng, n.lat], zoom: Math.max(map.getZoom(), 15), duration: 800 });
  };

  const remove = (id: string) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    localStorage.setItem(NOTES_KEY, JSON.stringify(next));
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 34px) + 80px)',
        left: 12,
        zIndex: 1002,
        pointerEvents: 'auto',
      }}
    >
      <div
        className="m1x-pill m1x-pill--note"
        onClick={() => setOpen(o => !o)}
        title="Note (DEV)"
        style={{ transform: 'scale(0.75)' }}
      >
        <div className="m1x-pill__icon">
          <FileText className="h-5 w-5 text-cyan-400" />
        </div>
        <div className="m1x-pill__label">
          Note ({count})
        </div>
      </div>

      {open && (
        <div className="mt-2 w-[195px] rounded-xl border border-cyan-500/30 bg-black/70 backdrop-blur-md p-1.5 text-xs text-white/90">
          {notes.length === 0 ? (
            <div className="text-[10px] text-white/70 px-1.5 py-2">Nessuna nota. Tocca un marker per modificare.</div>
          ) : (
            <ul className="max-h-[195px] overflow-auto space-y-1.5 pr-1">
              {notes.map(n => (
                <li key={n.id} className="rounded-lg border border-white/10 p-1.5">
                  <div className="font-medium text-[11px] truncate">{n.title || 'Senza titolo'}</div>
                  {n.note && <div className="text-[10px] text-white/70 line-clamp-2">{n.note}</div>}
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Button size="sm" className="h-6 px-1.5 text-[10px] bg-black/60 hover:bg-black/80 border border-cyan-500/30" onClick={() => flyTo(n)}>
                      <Crosshair className="h-2.5 w-2.5 mr-0.5" /> Centra
                    </Button>
                    <Button size="sm" variant="destructive" className="h-6 px-1.5 text-[10px]" onClick={() => remove(n.id)}>
                      Elimina
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default DevNotesPanel;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
