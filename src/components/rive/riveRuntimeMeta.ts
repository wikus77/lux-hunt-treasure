/**
 * Versioni Rive effettive attese nel bundle (allinea a package.json + overrides).
 * Forensic: verificare con `npm ls @rive-app/canvas @rive-app/react-canvas`.
 */
export const RIVE_RUNTIME_META = {
  '@rive-app/react-canvas': '4.27.3',
  '@rive-app/canvas': '2.37.0',
} as const;
