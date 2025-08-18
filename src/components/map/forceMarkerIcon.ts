import L from "leaflet";
import { redPulseIcon } from "./redPulseIcon";

(L.Marker.prototype as any).options.icon = redPulseIcon;