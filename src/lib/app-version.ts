/**
 * © 2025 Joseph MULÉ – M1SSION™ – APP VERSION SYSTEM
 * Centralized version management for PWA cache-bust
 */

export const APP_BUILD = {
  version: '2.1.0',
  build: Date.now(),
  env: import.meta.env.MODE
} as const;

export function getAppVersion(): string {
  return `${APP_BUILD.version}+${APP_BUILD.build}`;
}

export function shouldUpdate(currentVersion: string, newVersion: string): boolean {
  return currentVersion !== newVersion;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
