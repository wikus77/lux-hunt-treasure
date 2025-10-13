import { functionsBaseUrl } from '@/lib/supabase/functionsBase';

/**
 * Distribution of random markers around a center point.
 */
export type Distribution = {
  lat: number;          // center latitude
  lng: number;          // center longitude
  radiusMeters: number; // radius for random scatter
  count: number;        // how many markers to create
};

/**
 * Create bulk random markers via Supabase Edge Function.
 * Uses the canonical functionsBaseUrl to avoid hardcoded project refs.
 *
 * The server is expected to accept:
 *   { lat, lng, radiusMeters, count, debug?: boolean, dryRun?: boolean }
 */
export async function createBulkMarkers(
  dist: Distribution,
  opts?: { debug?: boolean; dryRun?: boolean }
): Promise<{ created?: number; message?: string; ok: boolean }> {
  const payload = {
    lat: dist.lat,
    lng: dist.lng,
    radiusMeters: dist.radiusMeters,
    count: dist.count,
    debug: opts?.debug ?? false,
    dryRun: opts?.dryRun ?? false,
  };

  const res = await fetch(`${functionsBaseUrl}/create-random-markers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res
    .json()
    .catch(() => ({ message: 'Invalid JSON response from function' }));

  if (!res.ok) {
    return {
      ok: false,
      message:
        (data && (data.error || data.message)) ||
        `Edge function error (${res.status})`,
    };
  }

  return {
    ok: true,
    created: typeof data?.created === 'number' ? data.created : undefined,
    message:
      data?.message ??
      (payload.dryRun
        ? 'Dry run completed'
        : 'Markers created successfully'),
  };
}
