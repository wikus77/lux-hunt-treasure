// © 2025 NIYVORA KFT –Joseph MULÉ – M1SSION™
import L from 'leaflet';

export const redPulseIcon = new L.DivIcon({
  className: 'qr-divicon',
  html: '<div class="qr-pulse"><span class="pulse-dot"></span></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});
