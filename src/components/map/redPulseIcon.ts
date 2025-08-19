// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import L from "leaflet";

// M1SSION Professional QR Marker Icon
export const redPulseIcon = L.divIcon({
  className: "qr-marker-icon m1ssion-qr-marker",
  html: `
    <div class="qr-marker-container">
      <div class="qr-marker-pulse"></div>
      <div class="qr-marker-core">
        <div class="qr-marker-symbol">🎁</div>
      </div>
    </div>
  `,
  iconSize: [32, 32], 
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

export default redPulseIcon;