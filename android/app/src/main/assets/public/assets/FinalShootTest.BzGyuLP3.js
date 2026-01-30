import { j as jsxRuntimeExports, r as reactExports, m as motion } from './animation-vendor.BiI6PE8T.js';
import { aZ as maplibreGlExports, A as maplibregl, b1 as UnifiedHeader, H as Target, Q as ChevronUp, ag as ChevronDown, a1 as LoaderCircle, aH as CircleCheckBig, M as MapPin, bQ as CircleX, B as Button, z as TriangleAlert, b7 as BottomNavigation, s as supabase } from './index.CUdqZWfi.js';
import { F as FinalShootProvider, u as useFinalShootContext, a as FinalShootOverlay, b as FinalShootPill } from './FinalShootOverlay.5NLi51VT.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

function FinalShootTestContent() {
  const containerRef = reactExports.useRef(null);
  const mapRef = reactExports.useRef(null);
  const [mapLoaded, setMapLoaded] = reactExports.useState(false);
  const [mapError, setMapError] = reactExports.useState(null);
  const [missionInfo, setMissionInfo] = reactExports.useState(null);
  const [loadingMission, setLoadingMission] = reactExports.useState(true);
  const [panelOpen, setPanelOpen] = reactExports.useState(true);
  const finalShootCtx = useFinalShootContext();
  reactExports.useEffect(() => {
    const loadMissionData = async () => {
      try {
        const { data: mission, error } = await supabase.from("current_mission_data").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (error) {
        }
        setMissionInfo(mission);
      } catch (e) {
      } finally {
        setLoadingMission(false);
      }
    };
    loadMissionData();
  }, []);
  reactExports.useEffect(() => {
    if (!containerRef.current) return;
    const devKey = "gw2gQRfg512G0yw3DbWn";
    const prodKey = "M2JlRFvsxjcMvVXw1HN1";
    const hostname = window.location.hostname;
    const isPreview = hostname.includes("lovable") || hostname.includes("pages.dev") || hostname === "localhost";
    const key = isPreview ? devKey : prodKey;
    const initialCenter = missionInfo?.prize_lng && missionInfo?.prize_lat ? [missionInfo.prize_lng, missionInfo.prize_lat] : [12.4964, 41.9028];
    try {
      const map = new maplibreGlExports.Map({
        container: containerRef.current,
        style: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${key}`,
        center: initialCenter,
        zoom: 13,
        pitch: 45,
        bearing: 0,
        attributionControl: false
      });
      mapRef.current = map;
      map.on("error", (e) => {
        setMapError(e?.error?.message || "Errore mappa");
      });
      map.on("load", () => {
        setMapLoaded(true);
        if (missionInfo?.prize_lat && missionInfo?.prize_lng) {
          const prizeLat = missionInfo.prize_lat;
          const prizeLng = missionInfo.prize_lng;
          const WINNING_RADIUS_METERS = 50;
          const createCircle = (centerLng, centerLat, radiusMeters, points = 64) => {
            const coords = [];
            const distanceX = radiusMeters / (111320 * Math.cos(centerLat * Math.PI / 180));
            const distanceY = radiusMeters / 111320;
            for (let i = 0; i < points; i++) {
              const angle = i / points * 2 * Math.PI;
              const x = centerLng + distanceX * Math.cos(angle);
              const y = centerLat + distanceY * Math.sin(angle);
              coords.push([x, y]);
            }
            coords.push(coords[0]);
            return {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [coords]
              }
            };
          };
          const circleGeoJSON = createCircle(prizeLng, prizeLat, WINNING_RADIUS_METERS);
          map.addSource("winning-area", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [circleGeoJSON]
            }
          });
          map.addLayer({
            id: "winning-area-fill",
            type: "fill",
            source: "winning-area",
            paint: {
              "fill-color": "#00ff00",
              "fill-opacity": 0.25
            }
          });
          map.addLayer({
            id: "winning-area-border",
            type: "line",
            source: "winning-area",
            paint: {
              "line-color": "#00ff00",
              "line-width": 3,
              "line-opacity": 0.9
            }
          });
          const el = document.createElement("div");
          el.innerHTML = "🎯";
          el.style.fontSize = "40px";
          el.style.cursor = "pointer";
          el.style.filter = "drop-shadow(0 0 10px rgba(255,165,0,0.8))";
          new maplibregl.Marker({ element: el }).setLngLat([prizeLng, prizeLat]).setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(
            `<div style="color: black; padding: 8px; font-family: sans-serif;">
                <b style="color: #f97316;">📍 POSIZIONE PREMIO</b><br>
                <span style="font-size: 12px;">Lat: ${prizeLat.toFixed(6)}</span><br>
                <span style="font-size: 12px;">Lng: ${prizeLng.toFixed(6)}</span><br>
                <span style="font-size: 11px; color: #22c55e;">⭕ Area vincita: ${WINNING_RADIUS_METERS}m</span>
              </div>`
          )).addTo(map);
        }
      });
      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (e) {
      setMapError(e?.message || "Errore inizializzazione mappa");
    }
  }, [missionInfo]);
  const flyToPrize = () => {
    if (mapRef.current && missionInfo?.prize_lat && missionInfo?.prize_lng) {
      mapRef.current.flyTo({
        center: [missionInfo.prize_lng, missionInfo.prize_lat],
        zoom: 16,
        duration: 2e3
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#070818"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UnifiedHeader, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            ref: containerRef,
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%"
            }
          }
        ),
        mapLoaded && /* @__PURE__ */ jsxRuntimeExports.jsx(FinalShootOverlay, { map: mapRef.current }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: {
              position: "absolute",
              top: "calc(env(safe-area-inset-top, 0px) + 70px)",
              left: "12px",
              right: "12px",
              maxWidth: "380px",
              zIndex: 50,
              background: "rgba(0,0,0,0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              border: "1px solid rgba(0,209,255,0.3)",
              overflow: "hidden"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setPanelOpen(!panelOpen),
                  style: {
                    width: "100%",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { style: { width: "20px", height: "20px", color: "#f97316" } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "16px", fontWeight: "bold", color: "white", fontFamily: "Orbitron, sans-serif" }, children: "FINAL SHOOT TEST" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "10px", padding: "2px 8px", background: "rgba(249,115,22,0.2)", color: "#f97316", borderRadius: "4px" }, children: "UFFICIALE" })
                    ] }),
                    panelOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { style: { width: "20px", height: "20px", color: "white" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { style: { width: "20px", height: "20px", color: "white" } })
                  ]
                }
              ),
              panelOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0 16px 16px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: "12px" }, children: loadingMission ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af", fontSize: "14px" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { style: { width: "16px", height: "16px", animation: "spin 1s linear infinite" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Caricamento dati missione..." })
                ] }) : missionInfo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", color: "#4ade80", fontSize: "14px" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { style: { width: "16px", height: "16px" } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Missione attiva trovata" })
                  ] }),
                  missionInfo.prize_lat && missionInfo.prize_lng ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", color: "#4ade80", fontSize: "14px" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { style: { width: "16px", height: "16px" } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "Premio: ",
                      missionInfo.prize_lat.toFixed(4),
                      ", ",
                      missionInfo.prize_lng.toFixed(4)
                    ] })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", color: "#f87171", fontSize: "14px" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { style: { width: "16px", height: "16px" } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Posizione premio NON impostata!" })
                  ] })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", color: "#f87171", fontSize: "14px" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { style: { width: "16px", height: "16px" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nessuna missione attiva" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                  padding: "12px",
                  background: "rgba(30,30,40,0.8)",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  fontSize: "12px"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "Disponibile:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: finalShootCtx.isAvailable ? "#4ade80" : "#f87171" }, children: finalShootCtx.isAvailable ? "SÌ" : "NO" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "Attivo:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: finalShootCtx.isActive ? "#f97316" : "#6b7280" }, children: finalShootCtx.isActive ? "SÌ" : "NO" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "Tentativi:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#22d3ee" }, children: finalShootCtx.remainingAttempts })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "Giorni:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#fbbf24" }, children: finalShootCtx.daysRemaining })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "Bloccato:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: finalShootCtx.isLocked ? "#f87171" : "#4ade80" }, children: finalShootCtx.isLocked ? "SÌ" : "NO" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "Test Mode:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: finalShootCtx.isTestMode ? "#fbbf24" : "#6b7280" }, children: finalShootCtx.isTestMode ? "SÌ" : "NO" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "8px" }, children: [
                  missionInfo?.prize_lat && missionInfo?.prize_lng && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      onClick: flyToPrize,
                      className: "flex-1 bg-green-600 hover:bg-green-700",
                      size: "sm",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4 mr-1" }),
                        "Vai al Premio"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      onClick: () => window.location.href = "/final-shoot-test?test-final-shoot=true",
                      variant: "outline",
                      className: "flex-1 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10",
                      size: "sm",
                      children: "Test Mode"
                    }
                  )
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, x: 50 },
            animate: { opacity: 1, x: 0 },
            transition: { delay: 0.5 },
            style: {
              position: "fixed",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 100
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(FinalShootPill, {})
          }
        ),
        !mapLoaded && !mapError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070818",
          zIndex: 10
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            width: "48px",
            height: "48px",
            border: "4px solid rgba(0,209,255,0.3)",
            borderTopColor: "#00d1ff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#00d1ff" }, children: "Caricamento mappa..." })
        ] }) }),
        mapError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070818",
          zIndex: 10
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          textAlign: "center",
          padding: "24px",
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "16px",
          maxWidth: "320px"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { style: { width: "48px", height: "48px", color: "#ef4444", margin: "0 auto 16px" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#f87171", marginBottom: "8px" }, children: "Errore caricamento mappa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "12px", color: "#6b7280" }, children: mapError }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => window.location.reload(),
              style: { marginTop: "16px" },
              variant: "outline",
              children: "Ricarica"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNavigation, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      ` })
      ]
    }
  );
}
function FinalShootTest() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FinalShootProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(FinalShootTestContent, {}) });
}

export { FinalShootTest as default };
