// © 2025 Joseph MULÉ – M1SSION™
import L from 'leaflet';

export const userDotIcon = new L.DivIcon({
  className: 'user-divicon',
  html: '<div class="user-dot"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
