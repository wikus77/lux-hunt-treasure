const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/map-vendor.DP0KRNIP.js","assets/react-vendor.CAU3V3le.js","assets/ui-vendor.CkkPodTS.js"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from './three-vendor.B3e0mz6d.js';
import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { e as ue } from './index.BEQCqgv7.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

const SimpleClickMap = ({
  initialLat = 41.9028,
  initialLng = 12.4964,
  onLocationSelect,
  existingMarkers = []
}) => {
  const mapContainerRef = reactExports.useRef(null);
  const mapRef = reactExports.useRef(null);
  const markerRef = reactExports.useRef(null);
  const existingMarkersLayerRef = reactExports.useRef([]);
  const [ready, setReady] = reactExports.useState(false);
  const LRef = reactExports.useRef(null);
  const initMap = reactExports.useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) return;
    try {
      const L = await __vitePreload(() => import('./map-vendor.DP0KRNIP.js').then(n => n.l),true?__vite__mapDeps([0,1,2]):void 0);
      LRef.current = L;
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
      });
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        // ~75m altitude view
        zoomControl: true,
        attributionControl: false
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19
      }).addTo(map);
      const newMarkerIcon = L.divIcon({
        className: "custom-marker-icon",
        html: `<div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00D1FF, #0099CC);
          border: 3px solid white;
          box-shadow: 0 0 12px rgba(0,209,255,0.8);
          cursor: move;
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        autoPan: true,
        icon: newMarkerIcon
      }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onLocationSelect(pos.lat, pos.lng);
        ue.success(`📍 ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
      });
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onLocationSelect(lat, lng);
        ue.success(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      });
      mapRef.current = map;
      markerRef.current = marker;
      setReady(true);
      setTimeout(() => map.invalidateSize(), 100);
    } catch (err) {
    }
  }, [initialLat, initialLng, onLocationSelect]);
  reactExports.useEffect(() => {
    if (!mapRef.current || !LRef.current || !ready) return;
    const L = LRef.current;
    const map = mapRef.current;
    existingMarkersLayerRef.current.forEach((m) => {
      try {
        map.removeLayer(m);
      } catch {
      }
    });
    existingMarkersLayerRef.current = [];
    existingMarkers.forEach((m) => {
      const greenIcon = L.divIcon({
        className: "existing-marker-icon",
        html: `<div style="
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 0 10px rgba(16,185,129,0.7);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      const leafletMarker = L.marker([m.lat, m.lng], { icon: greenIcon }).bindTooltip(`${m.title || "Marker"} (${m.reward_type || "reward"})`, {
        permanent: false,
        direction: "top",
        className: "marker-tooltip"
      }).addTo(map);
      existingMarkersLayerRef.current.push(leafletMarker);
    });
  }, [existingMarkers, ready]);
  reactExports.useEffect(() => {
    if (!document.getElementById("leaflet-css-admin")) {
      const link = document.createElement("link");
      link.id = "leaflet-css-admin";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("marker-tooltip-style")) {
      const style = document.createElement("style");
      style.id = "marker-tooltip-style";
      style.textContent = `
        .marker-tooltip {
          background: rgba(0,0,0,0.85) !important;
          border: 1px solid rgba(0,209,255,0.5) !important;
          color: #fff !important;
          font-size: 11px !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
        }
        .marker-tooltip::before {
          border-top-color: rgba(0,0,0,0.85) !important;
        }
      `;
      document.head.appendChild(style);
    }
    const timer = setTimeout(initMap, 150);
    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        existingMarkersLayerRef.current = [];
      }
    };
  }, [initMap]);
  reactExports.useEffect(() => {
    if (markerRef.current && mapRef.current && ready) {
      markerRef.current.setLatLng([initialLat, initialLng]);
      mapRef.current.setView([initialLat, initialLng], mapRef.current.getZoom());
    }
  }, [initialLat, initialLng, ready]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: mapContainerRef,
        className: "absolute inset-0",
        style: { background: "#1a1a2e", zIndex: 1 }
      }
    ),
    !ready && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400", children: "Caricamento..." })
    ] }) }),
    ready && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 left-2 right-2 flex justify-between items-center z-[1000]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-black/80 px-2 py-1 rounded text-xs text-cyan-400", children: "👆 Clicca per posizionare il marker" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-black/80 px-2 py-1 rounded text-xs flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "#00D1FF", display: "inline-block" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400", children: "Nuovo" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-400", children: [
            "Esistenti (",
            existingMarkers.length,
            ")"
          ] })
        ] })
      ] })
    ] })
  ] });
};

export { SimpleClickMap as default };
