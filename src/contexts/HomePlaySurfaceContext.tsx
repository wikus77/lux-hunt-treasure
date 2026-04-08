/**
 * Home "GIOCA" gate — hides play-rail pills until user taps CTA; reuses same dim/blur as ActionRadialHubPill.
 * Scope: Floating V3 + matching scroll anchors only. Rollback: disable gate in AppHome (enabled={false}).
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type HomePlaySurfaceContextValue = {
  /** When false, pills behave as before (always visible, no CTA). */
  playGateEnabled: boolean;
  /** User has tapped GIOCA; play pills visible + dim backdrop active. */
  surfaceActive: boolean;
  openSurface: () => void;
  closeSurface: () => void;
};

const HomePlaySurfaceContext = createContext<HomePlaySurfaceContextValue | null>(null);

export function HomePlaySurfaceProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  const [surfaceActive, setSurfaceActive] = useState(() => !enabled);

  const openSurface = useCallback(() => {
    if (!enabled) return;
    setSurfaceActive(true);
  }, [enabled]);

  const closeSurface = useCallback(() => {
    if (!enabled) return;
    setSurfaceActive(false);
  }, [enabled]);

  const value = useMemo<HomePlaySurfaceContextValue>(
    () => ({
      playGateEnabled: enabled,
      surfaceActive: enabled ? surfaceActive : true,
      openSurface,
      closeSurface,
    }),
    [enabled, surfaceActive, openSurface, closeSurface]
  );

  return <HomePlaySurfaceContext.Provider value={value}>{children}</HomePlaySurfaceContext.Provider>;
}

export function useHomePlaySurface(): HomePlaySurfaceContextValue {
  const ctx = useContext(HomePlaySurfaceContext);
  if (!ctx) {
    return {
      playGateEnabled: false,
      surfaceActive: true,
      openSurface: () => {},
      closeSurface: () => {},
    };
  }
  return ctx;
}

/** Same backdrop recipe as ActionRadialHubPill (fixed full-screen dim + light blur). */
export const HOME_PLAY_SURFACE_BACKDROP_CLASS =
  'pointer-events-auto fixed inset-0 cursor-default border-0 bg-black/35 backdrop-blur-[2px]';
