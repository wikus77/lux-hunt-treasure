/**
 * LIVE TARGET™ — great-circle distance in meters (WGS84 sphere).
 */

const EARTH_RADIUS_M = 6_371_000;

export function haversineMeters(
  lat1Deg: number,
  lng1Deg: number,
  lat2Deg: number,
  lng2Deg: number
): number {
  const φ1 = (lat1Deg * Math.PI) / 180;
  const φ2 = (lat2Deg * Math.PI) / 180;
  const Δφ = ((lat2Deg - lat1Deg) * Math.PI) / 180;
  const Δλ = ((lng2Deg - lng1Deg) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}
