/**
 * DclLauncherContext — M1SSION DAILY CONTROL LOOP™ Phase A
 * Allows DCL card to open Commit / Streak / Mission flows directly (no scroll-only).
 * Components that own the modals register their open function; card calls open* on CTA tap.
 * © 2026 Joseph MULÉ – M1SSION™
 */

import React, { createContext, useCallback, useRef, useContext, useMemo } from 'react';

type OpenFn = () => boolean;

interface DclLauncherContextValue {
  openCommit: () => boolean;
  openStreak: () => boolean;
  openMission: () => boolean;
  registerOpenCommit: (fn: OpenFn) => () => void;
  registerOpenStreak: (fn: OpenFn) => () => void;
  registerOpenMission: (fn: OpenFn) => () => void;
}

const noop = (): boolean => false;

const defaultValue: DclLauncherContextValue = {
  openCommit: noop,
  openStreak: noop,
  openMission: noop,
  registerOpenCommit: () => () => {},
  registerOpenStreak: () => () => {},
  registerOpenMission: () => () => {},
};

const DclLauncherContext = createContext<DclLauncherContextValue>(defaultValue);

export function DclLauncherProvider({ children }: { children: React.ReactNode }) {
  const openCommitRef = useRef<OpenFn | null>(null);
  const openStreakRef = useRef<OpenFn | null>(null);
  const openMissionRef = useRef<OpenFn | null>(null);

  const openCommit = useCallback(() => openCommitRef.current?.() ?? false, []);
  const openStreak = useCallback(() => openStreakRef.current?.() ?? false, []);
  const openMission = useCallback(() => openMissionRef.current?.() ?? false, []);

  const registerOpenCommit = useCallback((fn: OpenFn) => {
    openCommitRef.current = fn;
    return () => { openCommitRef.current = null; };
  }, []);
  const registerOpenStreak = useCallback((fn: OpenFn) => {
    openStreakRef.current = fn;
    return () => { openStreakRef.current = null; };
  }, []);
  const registerOpenMission = useCallback((fn: OpenFn) => {
    openMissionRef.current = fn;
    return () => { openMissionRef.current = null; };
  }, []);

  const value = useMemo<DclLauncherContextValue>(() => ({
    openCommit,
    openStreak,
    openMission,
    registerOpenCommit,
    registerOpenStreak,
    registerOpenMission,
  }), [openCommit, openStreak, openMission, registerOpenCommit, registerOpenStreak, registerOpenMission]);

  return (
    <DclLauncherContext.Provider value={value}>
      {children}
    </DclLauncherContext.Provider>
  );
}

export function useDclLauncher(): DclLauncherContextValue {
  const ctx = useContext(DclLauncherContext);
  return ctx ?? defaultValue;
}
