import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

/** Play-surface floating pill ids — matches `data-pill-info-anchor` values. */
export type PillInfoPillId = 'action' | 'timer' | 'agent' | 'commit' | 'battle';

export type PillInfoOverlayContextValue = {
  activePillId: PillInfoPillId | null;
  openPill: (id: PillInfoPillId) => void;
  closePill: () => void;
  togglePill: (id: PillInfoPillId) => void;
};

const PillInfoOverlayContext = createContext<PillInfoOverlayContextValue | null>(null);

export function PillInfoOverlayProvider({ children }: { children: React.ReactNode }) {
  const [activePillId, setActivePillId] = useState<PillInfoPillId | null>(null);

  const openPill = useCallback((id: PillInfoPillId) => {
    setActivePillId(id);
  }, []);

  const closePill = useCallback(() => {
    setActivePillId(null);
  }, []);

  const togglePill = useCallback((id: PillInfoPillId) => {
    setActivePillId((a) => (a === id ? null : id));
  }, []);

  const value = useMemo<PillInfoOverlayContextValue>(
    () => ({ activePillId, openPill, closePill, togglePill }),
    [activePillId, openPill, closePill, togglePill]
  );

  return <PillInfoOverlayContext.Provider value={value}>{children}</PillInfoOverlayContext.Provider>;
}

export function usePillInfoOverlay(): PillInfoOverlayContextValue {
  const ctx = useContext(PillInfoOverlayContext);
  if (!ctx) {
    throw new Error('usePillInfoOverlay must be used within PillInfoOverlayProvider');
  }
  return ctx;
}
