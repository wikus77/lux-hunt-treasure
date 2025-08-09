// © 2025 Joseph MULÉ – M1SSION™
// DivIcon rosso lampeggiante per QR discovered

import L from 'leaflet';

export function getQrBlinkIcon() {
  return L.divIcon({
    className: 'qr-pulse',
    html: '<span class="pulse-dot"></span>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}
