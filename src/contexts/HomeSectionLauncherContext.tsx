/**
 * HomeSectionLauncherContext — programmatic open for Home floating pills (Agent, Battle).
 * Mirrors DclLauncher pattern; owners register open fns. Does not change business logic.
 * © 2026 Joseph MULÉ – M1SSION™
 */

import React, { createContext, useCallback, useRef, useContext, useMemo } from 'react';

type OpenFn = () => boolean;

interface HomeSectionLauncherContextValue {
  openAgent: () => boolean;
  openBattle: () => boolean;
  registerOpenAgent: (fn: OpenFn) => () => void;
  registerOpenBattle: (fn: OpenFn) => () => void;
}

const noop = (): boolean => false;

const defaultValue: HomeSectionLauncherContextValue = {
  openAgent: noop,
  openBattle: noop,
  registerOpenAgent: () => () => {},
  registerOpenBattle: () => () => {},
};

const HomeSectionLauncherContext = createContext<HomeSectionLauncherContextValue>(defaultValue);

export function HomeSectionLauncherProvider({ children }: { children: React.ReactNode }) {
  const openAgentRef = useRef<OpenFn | null>(null);
  const openBattleRef = useRef<OpenFn | null>(null);

  const openAgent = useCallback(() => openAgentRef.current?.() ?? false, []);
  const openBattle = useCallback(() => openBattleRef.current?.() ?? false, []);

  const registerOpenAgent = useCallback((fn: OpenFn) => {
    openAgentRef.current = fn;
    return () => { openAgentRef.current = null; };
  }, []);

  const registerOpenBattle = useCallback((fn: OpenFn) => {
    openBattleRef.current = fn;
    return () => { openBattleRef.current = null; };
  }, []);

  const value = useMemo<HomeSectionLauncherContextValue>(() => ({
    openAgent,
    openBattle,
    registerOpenAgent,
    registerOpenBattle,
  }), [openAgent, openBattle, registerOpenAgent, registerOpenBattle]);

  return (
    <HomeSectionLauncherContext.Provider value={value}>
      {children}
    </HomeSectionLauncherContext.Provider>
  );
}

export function useHomeSectionLauncher(): HomeSectionLauncherContextValue {
  const ctx = useContext(HomeSectionLauncherContext);
  return ctx ?? defaultValue;
}
