
import { MapPoint, SearchArea, BuzzMapArea } from '@/types/MapTypes';

export const DEFAULT_MAP_CENTER: [number, number] = [41.9028, 12.4964]; // Rome, Italy
export const DEFAULT_MAP_ZOOM = 6;

export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const isPointInArea = (
  pointLat: number,
  pointLng: number,
  areaLat: number,
  areaLng: number,
  radiusKm: number
): boolean => {
  const distance = calculateDistance(pointLat, pointLng, areaLat, areaLng);
  return distance <= radiusKm;
};

export const formatMapPoint = (point: any): MapPoint => {
  return {
    id: point.id,
    latitude: point.latitude || point.lat,
    longitude: point.longitude || point.lng,
    title: point.title,
    note: point.note || '',
    created_at: point.created_at,
    user_id: point.user_id
  };
};

export const formatBuzzArea = (area: any): BuzzMapArea => {
  return {
    id: area.id,
    lat: area.lat,
    lng: area.lng,
    radius_km: area.radius_km,
    coordinates: { lat: area.lat, lng: area.lng },
    radius: area.radius_km * 1000, // Convert to meters
    color: '#00D1FF',
    colorName: 'cyan',
    week: area.week || 1,
    generation: 1,
    isActive: area.isActive !== false,
    user_id: area.user_id,
    created_at: area.created_at
  };
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const getBoundsForAreas = (areas: BuzzMapArea[]): [[number, number], [number, number]] | null => {
  if (areas.length === 0) return null;

  let minLat = areas[0].lat;
  let maxLat = areas[0].lat;
  let minLng = areas[0].lng;
  let maxLng = areas[0].lng;

  areas.forEach(area => {
    minLat = Math.min(minLat, area.lat);
    maxLat = Math.max(maxLat, area.lat);
    minLng = Math.min(minLng, area.lng);
    maxLng = Math.max(maxLng, area.lng);
  });

  return [[minLat, minLng], [maxLat, maxLng]];
};
