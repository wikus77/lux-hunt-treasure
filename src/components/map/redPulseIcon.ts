// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import L from 'leaflet';

export const redPulseIcon = new L.DivIcon({
  className: 'm1-red-pulse',
  html: '<div class="dot"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});
