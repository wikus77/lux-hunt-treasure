// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import L from "leaflet";
import { redPulseIcon } from "./redPulseIcon";

// Force all Leaflet markers to use our red pulse icon by default
(L.Marker.prototype as any).options.icon = redPulseIcon;

console.log('M1QR-RENDER', 'Force marker icon applied globally');