// © 2026 M1SSION™ — iOS App Review: single geolocation stack
// On iOS Capacitor use ONLY Capacitor Geolocation (no navigator.geolocation → no "localhost" prompt).
// On web / Android use navigator.geolocation as before.

import { isCapacitorNative, isCapacitorIOS } from './capacitor';

export type WatchHandle = string | number;

function useCapacitorGeo(): boolean {
  const isNative = typeof window !== 'undefined' && isCapacitorNative();
  const isIOS = typeof window !== 'undefined' && isCapacitorIOS();
  const ok = isNative && isIOS;
  if (typeof window !== 'undefined' && (isNative || isIOS)) {
    console.log('[GEO_SAFE] useCapacitorGeo:', ok, { isNative, isIOS });
  }
  return ok;
}

/**
 * Get current position. On iOS native uses Capacitor (native prompt only).
 * On web/Android uses navigator.geolocation.
 */
export function getCurrentPositionSafe(
  options?: PositionOptions
): Promise<GeolocationPosition> {
  if (useCapacitorGeo()) {
    return import('@capacitor/geolocation').then(({ Geolocation }) =>
      Geolocation.getCurrentPosition(options).then((p) => ({
        coords: {
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          accuracy: p.coords.accuracy ?? null,
          altitude: p.coords.altitude ?? null,
          altitudeAccuracy: p.coords.altitudeAccuracy ?? null,
          heading: p.coords.heading ?? null,
          speed: p.coords.speed ?? null,
        },
        timestamp: p.timestamp ?? Date.now(),
      }))
    );
  }
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/** Stored watch id for Capacitor so we can clear it. */
const capacitorWatchIds = new Map<string, string>();

/**
 * Watch position. On iOS native uses Capacitor. On web/Android uses navigator.geolocation.
 * Returns a handle to pass to clearWatchSafe().
 */
export function watchPositionSafe(
  onSuccess: (position: GeolocationPosition) => void,
  onError?: (error: GeolocationPositionError) => void,
  options?: PositionOptions
): WatchHandle {
  if (useCapacitorGeo()) {
    const handle = 'cap_' + Math.random().toString(36).slice(2);
    console.log('[GEO_SAFE] watchPositionSafe: using Capacitor, handle=', handle);
    import('@capacitor/geolocation').then(({ Geolocation }) => {
      Geolocation.watchPosition(options ?? {}, (position, err) => {
        if (err) {
          console.warn('[GEO_SAFE] Capacitor watchPosition error:', err?.code, err?.message);
          onError?.(err as GeolocationPositionError);
          return;
        }
        if (position) {
          console.log('[GEO_SAFE] Capacitor watchPosition success:', position?.coords?.latitude, position?.coords?.longitude);
          onSuccess({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy ?? null,
              altitude: position.coords.altitude ?? null,
              altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
              heading: position.coords.heading ?? null,
              speed: position.coords.speed ?? null,
            },
            timestamp: position.timestamp ?? Date.now(),
          });
        }
      }).then((id) => {
        capacitorWatchIds.set(handle, id);
      });
    });
    return handle;
  }
  return navigator.geolocation.watchPosition(onSuccess, onError ?? (() => {}), options);
}

/**
 * Clear a watch started with watchPositionSafe / watchPositionSafeWithClear.
 */
export function clearWatchSafe(handle: WatchHandle): void {
  if (typeof handle === 'string' && handle.startsWith('cap_')) {
    const id = capacitorWatchIds.get(handle);
    if (id) {
      capacitorWatchIds.delete(handle);
      import('@capacitor/geolocation').then(({ Geolocation }) => {
        Geolocation.clearWatch({ id });
      });
    }
    return;
  }
  if (navigator.geolocation && typeof handle === 'number') {
    navigator.geolocation.clearWatch(handle);
  }
}
