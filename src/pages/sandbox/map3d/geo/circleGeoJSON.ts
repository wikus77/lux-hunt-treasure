// Geodetic circle generator for MapLibre GeoJSON layers
// Pure TypeScript implementation, no external dependencies

interface CircleFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: {
    center: [number, number];
    radiusKm: number;
  };
}

const EARTH_RADIUS_KM = 6371;

/**
 * Creates a GeoJSON Polygon Feature representing a geodetic circle
 * @param centerLng - Center longitude in degrees
 * @param centerLat - Center latitude in degrees
 * @param radiusKm - Radius in kilometers
 * @param steps - Number of points to generate (default: 128 for smooth circles)
 * @returns GeoJSON Feature with Polygon geometry
 */
export function makeCircle(
  centerLng: number,
  centerLat: number,
  radiusKm: number,
  steps: number = 128
): CircleFeature {
  // Guard: validate radius
  if (!Number.isFinite(radiusKm) || radiusKm <= 0) {
    console.warn('🗺️ M1-3D guard: invalid radiusKm', { radiusKm, centerLng, centerLat });
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[]]
      },
      properties: {
        center: [centerLng, centerLat],
        radiusKm: 0
      }
    };
  }

  const coords: number[][] = [];
  const distRatio = radiusKm / EARTH_RADIUS_KM;
  const centerLatRad = (centerLat * Math.PI) / 180;
  const centerLngRad = (centerLng * Math.PI) / 180;

  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 2 * Math.PI;
    
    // Haversine-based geodetic calculation
    const lat2 = Math.asin(
      Math.sin(centerLatRad) * Math.cos(distRatio) +
      Math.cos(centerLatRad) * Math.sin(distRatio) * Math.cos(bearing)
    );
    
    const lng2 = centerLngRad + Math.atan2(
      Math.sin(bearing) * Math.sin(distRatio) * Math.cos(centerLatRad),
      Math.cos(distRatio) - Math.sin(centerLatRad) * Math.sin(lat2)
    );
    
    coords.push([
      (lng2 * 180) / Math.PI,
      (lat2 * 180) / Math.PI
    ]);
  }

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    },
    properties: {
      center: [centerLng, centerLat],
      radiusKm
    }
  };
}

/**
 * Calculate bounding box for a circle
 * @param centerLng - Center longitude
 * @param centerLat - Center latitude
 * @param radiusKm - Radius in kilometers
 * @returns [minLng, minLat, maxLng, maxLat]
 */
export function getCircleBounds(
  centerLng: number,
  centerLat: number,
  radiusKm: number
): [number, number, number, number] {
  const latOffset = (radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI);
  const lngOffset = latOffset / Math.cos((centerLat * Math.PI) / 180);
  
  return [
    centerLng - lngOffset,
    centerLat - latOffset,
    centerLng + lngOffset,
    centerLat + latOffset
  ];
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
