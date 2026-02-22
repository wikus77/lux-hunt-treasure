/**
 * OpenSettingsSectionContext - Apri modale Settings direttamente su una sezione
 * Usato dal modale Profilo per Legal / Security / Privacy (stessi modali di Settings, no duplicati)
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React, { createContext, useContext, useCallback } from 'react';

export type SettingsSectionId = 'legal' | 'security' | 'privacy' | string;

interface OpenSettingsSectionContextValue {
  openSettingsWithSection: (sectionId: SettingsSectionId) => void;
}

const OpenSettingsSectionContext = createContext<OpenSettingsSectionContextValue | null>(null);

export function useOpenSettingsSection(): OpenSettingsSectionContextValue | null {
  return useContext(OpenSettingsSectionContext);
}

interface OpenSettingsSectionProviderProps {
  children: React.ReactNode;
  onRequestOpen: (sectionId: SettingsSectionId) => void;
}

export function OpenSettingsSectionProvider({ children, onRequestOpen }: OpenSettingsSectionProviderProps) {
  const openSettingsWithSection = useCallback((sectionId: SettingsSectionId) => {
    onRequestOpen(sectionId);
  }, [onRequestOpen]);

  return (
    <OpenSettingsSectionContext.Provider value={{ openSettingsWithSection }}>
      {children}
    </OpenSettingsSectionContext.Provider>
  );
}
