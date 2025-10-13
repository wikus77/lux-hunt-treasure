// Guard-safe config: niente VAPID, niente helper, solo feature flags.

export interface PushFeatureConfig {
  /** abilita/disabilita UI e flussi push lato client */
  enabled: boolean;
  /** logging verboso lato client per debug */
  debug: boolean;
}

export const PUSH_CONFIG: PushFeatureConfig = {
  enabled: true,
  debug: false,
};

export const isPushFeatureEnabled = () => PUSH_CONFIG.enabled;
export const isPushDebug = () => PUSH_CONFIG.debug;

/**
 * Nota: qualunque chiave VAPID o conversione di chiavi
 * DEVE passare esclusivamente da '@/lib/vapid-loader'.
 * Questo file NON deve mai conoscere chiavi, loader, o helper VAPID.
 */
