// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import L from "leaflet";

export const redPulseIcon = L.divIcon({
  className: "m1-red-pulse",
  html: '<div class="dot"></div>',
  iconSize: [20, 20], 
  iconAnchor: [10, 10]
});

export default redPulseIcon;