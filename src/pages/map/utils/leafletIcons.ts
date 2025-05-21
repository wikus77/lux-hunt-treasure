
import L from 'leaflet';

// Fix for marker icon in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/assets/marker-icon-2x.png',
  iconUrl: '/assets/marker-icon.png',
  shadowUrl: '/assets/marker-shadow.png',
});

// Custom prize icon
export const prizeIcon = new L.Icon({
  iconUrl: '/assets/prize-marker.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Default fallback location (Milano)
export const DEFAULT_LOCATION: [number, number] = [45.4642, 9.19];
