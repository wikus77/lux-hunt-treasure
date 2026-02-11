const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index.CUdqZWfi.js","assets/animation-vendor.BiI6PE8T.js","assets/supabase-vendor.CPRn8nK0.js","assets/map-vendor.uCr1tAyj.js","assets/ui-vendor.C69ET9UU.js","assets/stripe-vendor.baQ46ET6.js","assets/router-vendor.DUjmXt3z.js","assets/index.CnkXYqkZ.css","assets/index.Cg7E-QY6.js"])))=>i.map(i=>d[i]);
import { r as reactExports, j as jsxRuntimeExports, A as AnimatePresence, m as motion } from './animation-vendor.BiI6PE8T.js';
import { c as createLucideIcon, a as useEntityOverlayStore, i as isFirstSession, b as isHudDismissed, T as TIMING, d as dismissHud, C as COPY, L as Lock, e as CircleAlert, f as useAuthContext, g as useCashbackWallet, h as usePulseContribute, j as useAwardPE, k as useActiveMissionEnrollment, l as useM1UnitsRealtime, s as supabase, m as ue, n as showInsufficientM1UToast, o as useBuzzApi, p as emitGameEvent, q as notifyShadowContext, r as emitSubscribed, t as emitError, v as getCurrentWeekOfYear, w as useUnifiedAuth, _ as __vitePreload, x as useLocalStorage, X, R as Radio, Z as Zap, E as Eye, S as Sparkles, G as Gift, y as Shield, z as TriangleAlert, A as maplibregl, B as Button, D as track, F as confetti, H as Target, I as useDebugFlag, J as useBuzzMapPricingNew, M as MapPin, K as Input, N as Textarea, U as Users, O as Circle, P as FileText, Q as ChevronUp, V as Map$1, W as Card, Y as Settings, $ as RefreshCw, a0 as Search, a1 as LoaderCircle, a2 as GlassModal, a3 as Plus, a4 as Save, a5 as Trash2, a6 as Tabs, a7 as TabsList, a8 as TabsTrigger, a9 as TabsContent, aa as ChevronLeft, ab as Crosshair, ac as CardHeader, ad as Swords, ae as CardTitle, af as Clock, ag as ChevronDown, ah as CardDescription, ai as CardContent, aj as Activity, ak as ScrollArea, al as Select, am as SelectTrigger, an as SelectValue, ao as SelectContent, ap as SelectItem, aq as clamp, ar as usePrevious, as as cn, at as ShoppingBag, au as Badge, av as useToast, aw as Label, ax as User, ay as Coins, az as ShoppingCart, aA as VolumeX, aB as Volume2, aC as Trophy, aD as Globe, aE as Crown, aF as Flag, aG as Progress, aH as CircleCheckBig, aI as CopyJsonButton, aJ as useAuth, aK as getMissionOfTheDay, aL as calculatePhaseRewards, aM as getMissionState, aN as isPhase2Available, aO as Play, aP as startMission, aQ as markBriefingShown, aR as completePhase1, aS as creditM1USafe, aT as markPhase1Credited, aU as completePhase2, aV as markPhase2Credited, aW as useMapGlitchEffect, aX as useGeolocation, aY as neonStyleTemplate, aZ as maplibreGlExports, a_ as useProfileImage, a$ as useNotificationManager, b0 as usePerformanceSettings, b1 as UnifiedHeader, b2 as NotificationsBanner, b3 as Compass, b4 as Navigation, b5 as RotateCcw, b6 as M1UPill, b7 as BottomNavigation, b8 as MotivationalPopup } from './index.CUdqZWfi.js';
import { r as reactDomExports } from './map-vendor.uCr1tAyj.js';
import { R as Rocket } from './rocket.gRhSzu0b.js';
import { f as useControllableState, g as createContextScope, i as createCollection, l as composeEventHandlers, k as Primitive, j as useComposedRefs, e as useDirection, y as useSize } from './ui-vendor.C69ET9UU.js';
import { P as Package } from './package.k0BF2QT_.js';
import { F as FinalShootProvider, a as FinalShootOverlay, b as FinalShootPill } from './FinalShootOverlay.5NLi51VT.js';
import './supabase-vendor.CPRn8nK0.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Layers = createLucideIcon("Layers", [
  [
    "path",
    {
      d: "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",
      key: "8b97xw"
    }
  ],
  ["path", { d: "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65", key: "dd6zsq" }],
  ["path", { d: "m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65", key: "ep9fru" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const LockOpen = createLucideIcon("LockOpen", [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 9.9-1", key: "1mm8w8" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Navigation2 = createLucideIcon("Navigation2", [
  ["polygon", { points: "12 2 19 21 12 17 5 21 12 2", key: "x8c0qg" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Pen = createLucideIcon("Pen", [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Skull = createLucideIcon("Skull", [
  ["path", { d: "m12.5 17-.5-1-.5 1h1z", key: "3me087" }],
  [
    "path",
    {
      d: "M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z",
      key: "1o5pge"
    }
  ],
  ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }],
  ["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }]
]);

const POPUP_ID = "map-hud";
function MapHUD({ mapContainerId = "ml-sandbox", onDismiss }) {
  const [isVisible, setIsVisible] = reactExports.useState(false);
  const registerActivePopup = useEntityOverlayStore((s) => s.registerActivePopup);
  const unregisterActivePopup = useEntityOverlayStore((s) => s.unregisterActivePopup);
  reactExports.useEffect(() => {
    if (isVisible) {
      registerActivePopup(POPUP_ID);
    } else {
      unregisterActivePopup(POPUP_ID);
    }
    return () => {
      unregisterActivePopup(POPUP_ID);
    };
  }, [isVisible, registerActivePopup, unregisterActivePopup]);
  reactExports.useEffect(() => {
    if (!isFirstSession()) return;
    if (isHudDismissed()) return;
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(showTimer);
  }, []);
  reactExports.useEffect(() => {
    if (!isVisible) return;
    const hideTimer = setTimeout(() => {
      handleDismiss();
    }, TIMING.HUD_AUTO_HIDE_MS);
    return () => clearTimeout(hideTimer);
  }, [isVisible]);
  reactExports.useEffect(() => {
    if (!isVisible) return;
    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) return;
    const handleInteraction = () => {
      handleDismiss();
    };
    mapContainer.addEventListener("touchstart", handleInteraction, { once: true });
    mapContainer.addEventListener("mousedown", handleInteraction, { once: true });
    mapContainer.addEventListener("wheel", handleInteraction, { once: true });
    return () => {
      mapContainer.removeEventListener("touchstart", handleInteraction);
      mapContainer.removeEventListener("mousedown", handleInteraction);
      mapContainer.removeEventListener("wheel", handleInteraction);
    };
  }, [isVisible, mapContainerId]);
  const handleDismiss = reactExports.useCallback(() => {
    setIsVisible(false);
    dismissHud();
    onDismiss?.();
  }, [onDismiss]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isVisible && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.4, ease: "easeOut" },
      onClick: handleDismiss,
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 800,
        // Sotto i popup esistenti (10003)
        pointerEvents: "none"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0.95 },
          animate: { scale: 1 },
          exit: { scale: 0.95 },
          style: {
            width: "100%",
            maxWidth: "340px",
            background: "linear-gradient(145deg, rgba(0, 20, 40, 0.95), rgba(0, 40, 60, 0.9))",
            borderRadius: "20px",
            border: "1px solid rgba(0, 209, 255, 0.3)",
            boxShadow: "0 0 40px rgba(0, 209, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.4)",
            padding: "clamp(16px, 4vw, 24px)",
            textAlign: "center",
            pointerEvents: "auto",
            cursor: "pointer"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                style: {
                  fontSize: "clamp(32px, 8vw, 48px)",
                  marginBottom: "12px",
                  filter: "drop-shadow(0 0 8px rgba(0, 209, 255, 0.5))"
                },
                children: "🎯"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                style: {
                  fontSize: "clamp(14px, 3.5vw, 18px)",
                  fontWeight: 600,
                  color: "#00D1FF",
                  marginBottom: "8px",
                  textShadow: "0 0 10px rgba(0, 209, 255, 0.5)"
                },
                children: COPY.HUD.line1
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                style: {
                  fontSize: "clamp(12px, 3vw, 14px)",
                  color: "rgba(255, 255, 255, 0.8)",
                  marginBottom: "12px"
                },
                children: COPY.HUD.line2
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "p",
              {
                style: {
                  fontSize: "clamp(11px, 2.5vw, 13px)",
                  color: "rgba(0, 209, 255, 0.7)",
                  fontStyle: "italic"
                },
                children: [
                  "👆 ",
                  COPY.HUD.line3
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.p,
              {
                animate: { opacity: [0.4, 0.7, 0.4] },
                transition: { duration: 2, repeat: Infinity },
                style: {
                  fontSize: "10px",
                  color: "rgba(255, 255, 255, 0.4)",
                  marginTop: "16px"
                },
                children: "Tap anywhere to start"
              }
            )
          ]
        }
      )
    }
  ) });
}

const BuzzMapLockedModal = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  const handleGoHome = () => {
    window.location.href = "/home";
  };
  if (!mounted) return null;
  const modalContent = /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      className: "fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm",
      style: {
        paddingTop: "calc(119px + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(80px + env(safe-area-inset-bottom, 34px))"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          className: "text-center p-8 mx-4 rounded-3xl max-w-sm",
          style: {
            background: "linear-gradient(135deg, rgba(0,30,60,0.95) 0%, rgba(0,15,30,0.98) 100%)",
            border: "1px solid rgba(0, 209, 255, 0.3)",
            boxShadow: "0 0 60px rgba(0, 209, 255, 0.2), inset 0 0 30px rgba(0, 209, 255, 0.05)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                animate: {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                },
                transition: { duration: 2, repeat: Infinity },
                className: "mb-6",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-20 h-20 mx-auto rounded-full flex items-center justify-center",
                    style: {
                      background: "linear-gradient(135deg, rgba(255,100,100,0.2) 0%, rgba(255,50,50,0.1) 100%)",
                      border: "2px solid rgba(255,100,100,0.4)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-10 h-10 text-red-400" })
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-orbitron font-bold text-white mb-3", children: "MISSIONE NON AVVIATA" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/70 mb-6 text-sm leading-relaxed", children: [
              "Per utilizzare ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 font-semibold", children: "BUZZ" }),
              " devi prima avviare la missione del mese.",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "Torna alla Home e premi ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 font-semibold", children: "START M1SSION" }),
              "."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.button,
              {
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 },
                onClick: handleGoHome,
                className: "w-full py-4 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3",
                style: {
                  background: "linear-gradient(135deg, #00D1FF 0%, #0099CC 100%)",
                  boxShadow: "0 0 30px rgba(0, 209, 255, 0.4)"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Rocket, { className: "w-5 h-5" }),
                  "VAI ALLA HOME"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-center gap-2 text-white/40 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3 h-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Il BUZZ sarà disponibile dopo l'avvio" })
            ] })
          ]
        }
      )
    }
  ) });
  return reactDomExports.createPortal(modalContent, document.body);
};

const BUZZ_MAP_SOUND = "/assets/audio/BUZZMAP.mp3";
const BuzzMapButtonSecure = ({
  onBuzzPress,
  mapCenter,
  onAreaGenerated
}) => {
  const { isAuthenticated, user } = useAuthContext();
  const audioRef = reactExports.useRef(null);
  const playBuzzMapSound = reactExports.useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(BUZZ_MAP_SOUND);
      audioRef.current.volume = 0.7;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => {
    });
  }, []);
  const { callBuzzApi } = useBuzzApi();
  const { accrueFromBuzzMap } = useCashbackWallet();
  const { contribute: contributeToPulse } = usePulseContribute();
  const { awardPE } = useAwardPE();
  useActiveMissionEnrollment();
  const [showGateModal, setShowGateModal] = reactExports.useState(false);
  const [serverPricing, setServerPricing] = reactExports.useState(null);
  const [pricingLoading, setPricingLoading] = reactExports.useState(true);
  const { unitsData } = useM1UnitsRealtime(user?.id);
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [currentLocation, setCurrentLocation] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const loadServerPricing = async () => {
      if (!user?.id) {
        setPricingLoading(false);
        return;
      }
      try {
        setPricingLoading(true);
        const { data, error } = await supabase.rpc("m1_get_next_buzz_level", {
          p_user_id: user.id
        });
        if (error) {
          setPricingLoading(false);
          return;
        }
        const pricing = Array.isArray(data) ? data[0] : data;
        setServerPricing(pricing);
      } catch (err) {
      } finally {
        setPricingLoading(false);
      }
    };
    loadServerPricing();
    const handleBuzzCreated = () => {
      loadServerPricing();
    };
    window.addEventListener("buzzAreaCreated", handleBuzzCreated);
    return () => window.removeEventListener("buzzAreaCreated", handleBuzzCreated);
  }, [user?.id]);
  reactExports.useEffect(() => {
    if (!navigator.geolocation) {
      if (mapCenter) {
        setCurrentLocation(mapCenter);
      } else {
        setCurrentLocation([41.9028, 12.4964]);
      }
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        if (mapCenter) {
          setCurrentLocation(mapCenter);
        } else {
          setCurrentLocation([41.9028, 12.4964]);
        }
      },
      { enableHighAccuracy: true, timeout: 1e4, maximumAge: 6e4 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [mapCenter]);
  const getCoordinates = () => {
    if (currentLocation) return currentLocation;
    if (mapCenter && mapCenter[0] && mapCenter[1]) return mapCenter;
    const lastPos = localStorage.getItem("lastKnownPosition");
    if (lastPos) {
      try {
        const parsed = JSON.parse(lastPos);
        if (parsed.lat && parsed.lng) return [parsed.lat, parsed.lng];
      } catch (e) {
      }
    }
    return [41.9028, 12.4964];
  };
  const handleBuzzMapPress = async () => {
    playBuzzMapSound();
    if (!isAuthenticated || !user) {
      ue.error("Devi accedere per usare BUZZ MAP.");
      return;
    }
    const coordinates = getCoordinates();
    if (!coordinates || !coordinates[0] || !coordinates[1]) {
      ue.error("Posizione necessaria per BUZZ MAP");
      return;
    }
    localStorage.setItem("lastKnownPosition", JSON.stringify({
      lat: coordinates[0],
      lng: coordinates[1],
      timestamp: Date.now()
    }));
    if (!serverPricing) {
      ue.error("Errore nel caricamento dei prezzi. Riprova.");
      return;
    }
    const costM1U = serverPricing.m1u;
    const currentBalance = unitsData?.balance || 0;
    if (currentBalance < costM1U) {
      showInsufficientM1UToast(costM1U, currentBalance);
      return;
    }
    setIsProcessing(true);
    try {
      const edgeResult = await callBuzzApi({
        userId: user.id,
        mode: "map",
        // 🔥 FIX: Explicit mode to force MAP branch
        generateMap: true,
        coordinates: { lat: coordinates[0], lng: coordinates[1] },
        sessionId: Date.now().toString()
      });
      if (!edgeResult?.area_id) {
      }
      if (!edgeResult) {
        ue.error("Errore di connessione. Verifica la tua connessione e riprova.");
        return;
      }
      if (!edgeResult.success) {
        ue.error(edgeResult.errorMessage || "Errore durante la creazione dell'area. Riprova.");
        return;
      }
      const actualLevel = edgeResult.level || serverPricing.level;
      const actualRadius = edgeResult.radius_km || serverPricing.radius_km;
      emitGameEvent("BUZZ_MAP_AREA_CREATED", {
        level: actualLevel,
        radius: actualRadius,
        costM1U,
        areaId: edgeResult.area_id,
        coordinates: { lat: coordinates[0], lng: coordinates[1] }
      });
      ue.success(
        `BUZZ MAP creato · Livello ${actualLevel} · ${Math.round(actualRadius)}km · ${costM1U} M1U`,
        {
          duration: 4e3,
          style: {
            background: "linear-gradient(135deg, #9333EA 0%, #EF4444 100%)",
            color: "white",
            fontWeight: "bold"
          }
        }
      );
      try {
        const costEur = costM1U / 10;
        await accrueFromBuzzMap({ costEur });
      } catch (cashbackErr) {
      }
      contributeToPulse("BUZZ_MAP_COMPLETED", {
        level: actualLevel,
        radius_km: actualRadius,
        cost_m1u: costM1U
      }).catch((err) => {
      });
      awardPE("BUZZ_MAP_CLICK", void 0, {
        level: actualLevel,
        radius_km: actualRadius,
        cost_m1u: costM1U
      }).catch((err) => {
      });
      try {
        const { error: locationError } = await supabase.rpc("set_my_agent_location", {
          p_lat: coordinates[0],
          p_lng: coordinates[1],
          p_accuracy: null,
          p_status: "online"
        });
        if (locationError) {
        } else {
        }
      } catch (e) {
      }
      onAreaGenerated?.(coordinates[0], coordinates[1], actualRadius);
      onBuzzPress();
      await new Promise((resolve) => setTimeout(resolve, 800));
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve();
        }, 3e3);
        const handler = () => {
          clearTimeout(timeout);
          window.removeEventListener("areasReloaded", handler);
          resolve();
        };
        window.addEventListener("areasReloaded", handler);
      });
      window.dispatchEvent(new CustomEvent("buzzAreaCreated", {
        detail: {
          level: actualLevel,
          radiusKm: actualRadius,
          costM1U,
          lat: coordinates[0],
          lng: coordinates[1],
          areaId: edgeResult.area_id
        }
      }));
      notifyShadowContext("map");
    } catch (error) {
      if (error.message?.includes("429")) {
        ue.error("Hai raggiunto il limite giornaliero. Riprova dopo mezzanotte.");
      } else {
        ue.error("Errore durante la creazione della BUZZ MAP");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  const BUZZ_MAP_BOOTSTRAP_COUNT = 10;
  const BUZZ_MAP_BOOTSTRAP_MULTIPLIER = 2;
  const getEffectiveRadiusKm = () => {
    if (!serverPricing) return 0;
    const currentCount = serverPricing.current_count ?? 0;
    const isBootstrapEligible = currentCount < BUZZ_MAP_BOOTSTRAP_COUNT;
    return isBootstrapEligible ? serverPricing.radius_km * BUZZ_MAP_BOOTSTRAP_MULTIPLIER : serverPricing.radius_km;
  };
  const effectiveRadiusKm = getEffectiveRadiusKm();
  const priceDisplay = serverPricing ? `${Math.round(effectiveRadiusKm)}km · ${serverPricing.m1u} M1U` : "Loading...";
  const isDisabled = !isAuthenticated || isProcessing || pricingLoading;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BuzzMapLockedModal, { isOpen: showGateModal }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "fixed left-1/2 transform -translate-x-1/2 z-50",
        style: {
          bottom: "clamp(16px, 3vh, 28px)",
          transform: "translateX(-50%)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.button,
          {
            "data-onboarding": "buzz-map-button",
            whileTap: { scale: isAuthenticated ? 0.97 : 1 },
            disabled: isDisabled,
            onClick: handleBuzzMapPress,
            className: "relative border-0 bg-transparent p-0 z-20",
            style: { cursor: isDisabled ? "not-allowed" : "pointer" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `tron-disc tron-disc-red ${isDisabled ? "opacity-50" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tron-disc-rotating", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `tron-led-ring ${isProcessing ? "loading" : ""}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tron-disc-dots" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tron-disc-dots-sides" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tron-disc-content", children: isProcessing || pricingLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tron-loading-spinner", style: { inset: "30%" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-white/80", style: {
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "clamp(8px, 2vw, 10px)",
                  letterSpacing: "0.05em"
                }, children: "PROCESSING" })
              ] }) : !isAuthenticated ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-6 h-6 text-white/60" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-white/60", style: {
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "clamp(8px, 2vw, 10px)",
                  letterSpacing: "0.05em"
                }, children: "LOGIN" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white", style: {
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "clamp(12px, 3vw, 16px)",
                  letterSpacing: "0.05em",
                  textShadow: "0 0 10px rgba(255, 51, 51, 0.8), 0 0 20px rgba(255, 51, 51, 0.4)"
                }, children: "BUZZ MAP" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/90 mt-0.5", style: {
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "clamp(8px, 2vw, 11px)",
                  letterSpacing: "0.03em"
                }, children: priceDisplay })
              ] }) })
            ] })
          }
        )
      }
    )
  ] });
};

const useBuzzMapLogic = () => {
  const { user } = useAuthContext();
  const [currentWeekAreas, setCurrentWeekAreas] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const fetchCurrentWeekAreas = async () => {
    if (!user?.id) {
      setCurrentWeekAreas([]);
      return;
    }
    setLoading(true);
    try {
      const { data: gameTargets, error: targetError } = await supabase.from("buzz_game_targets").select("*").eq("is_active", true);
      if (targetError) {
        setError(targetError);
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }
      const validTargets = gameTargets?.filter(
        (target) => target.lat && target.lon && target.lat !== 0 && target.lon !== 0 && Math.abs(target.lat) <= 90 && Math.abs(target.lon) <= 180
      ) || [];
      if (validTargets.length === 0) {
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }
      const currentWeek = getCurrentWeekOfYear();
      const { data: userAreas, error: userAreasError } = await supabase.from("user_map_areas").select("*").eq("user_id", user.id).eq("source", "buzz_map").eq("week", currentWeek).order("created_at", { ascending: false }).limit(1);
      if (userAreasError) {
        setError(userAreasError);
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }
      if (!userAreas || userAreas.length === 0) {
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }
      const transformedAreas = userAreas.map((area, index) => {
        const lat = area.center_lat ?? area.lat;
        const lng = area.center_lng ?? area.lng;
        if ((area.lat === null || area.lat === void 0) && area.center_lat !== null && area.center_lat !== void 0) {
        }
        if ((area.lng === null || area.lng === void 0) && area.center_lng !== null && area.center_lng !== void 0) {
        }
        return {
          id: area.id,
          lat,
          lng,
          radius_km: area.radius_km,
          level: area.level,
          // 🔍 M1-3D VERIFY: Track level from DB
          coordinates: { lat, lng },
          radius: area.radius_km * 1e3,
          // Convert to meters for map display
          color: "#00FFFF",
          colorName: "cyan",
          week: area.week || currentWeek,
          generation: index + 1,
          isActive: true,
          user_id: area.user_id,
          created_at: area.created_at || (/* @__PURE__ */ new Date()).toISOString()
        };
      });
      setCurrentWeekAreas(transformedAreas);
      setError(null);
    } catch (err) {
      setError(err);
      setCurrentWeekAreas([]);
    } finally {
      setLoading(false);
    }
  };
  const reloadAreas = async () => {
    await fetchCurrentWeekAreas();
  };
  reactExports.useEffect(() => {
    const handleMissionReset = () => {
      setCurrentWeekAreas([]);
      try {
        localStorage.removeItem("map-search-areas");
        localStorage.removeItem("map-markers");
        localStorage.removeItem("dev-map-points");
        localStorage.removeItem("buzz_map_5km_warning_shown");
      } catch (e) {
      }
      setTimeout(() => fetchCurrentWeekAreas(), 500);
    };
    window.addEventListener("missionLaunched", handleMissionReset);
    window.addEventListener("missionReset", handleMissionReset);
    window.addEventListener("mission:reset", handleMissionReset);
    return () => {
      window.removeEventListener("missionLaunched", handleMissionReset);
      window.removeEventListener("missionReset", handleMissionReset);
      window.removeEventListener("mission:reset", handleMissionReset);
    };
  }, []);
  reactExports.useEffect(() => {
    fetchCurrentWeekAreas();
    if (user?.id) {
      const channel = supabase.channel("user_map_areas_changes").on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_map_areas",
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          fetchCurrentWeekAreas();
          if (payload.new) {
            const lat = payload.new.center_lat ?? payload.new.lat;
            const lng = payload.new.center_lng ?? payload.new.lng;
            window.dispatchEvent(new CustomEvent("buzzAreaCreated", {
              detail: {
                lat,
                lng,
                radius_km: payload.new.radius_km
              }
            }));
          }
        }
      ).subscribe((status) => {
        if (status === "SUBSCRIBED") {
          emitSubscribed("user_map_areas_changes");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          emitError(String(status), "user_map_areas_changes");
        }
      });
      return () => {
        channel.unsubscribe();
      };
    }
  }, [user?.id]);
  return {
    areas: currentWeekAreas,
    loading,
    error: error || new Error("No error"),
    currentWeekAreas,
    reloadAreas
  };
};

const UPDATE_INTERVAL_MS = 3e4;
const MIN_DISTANCE_METERS = 10;
function calculateDistance(pos1, pos2) {
  const R = 6371e3;
  const φ1 = pos1.lat * Math.PI / 180;
  const φ2 = pos2.lat * Math.PI / 180;
  const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
  const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
async function upsertAgentLocation(userId, position) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return;
    }
    const { error } = await supabase.rpc("set_my_agent_location", {
      p_lat: position.lat,
      p_lng: position.lng,
      p_accuracy: position.acc,
      p_status: "online"
    });
    if (error) {
      if (error.code === "406" || error.message?.includes("406") || error.message?.includes("Not Acceptable")) {
        return;
      }
      if (error.code === "PGRST202" || error.message?.includes("Could not find the function")) {
        return;
      }
      if (error.code === "PGRST116" || error.code === "42P01" || error.code === "PGRST301") {
        return;
      }
    } else {
    }
  } catch (e) {
  }
}
function useAgentLocationUpdater(position, enabled) {
  const { user } = useUnifiedAuth();
  const lastPositionRef = reactExports.useRef(null);
  const lastUpdateRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    if (!user?.id || !enabled || !position) {
      return;
    }
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    let shouldUpdate = timeSinceLastUpdate >= UPDATE_INTERVAL_MS;
    if (lastPositionRef.current && timeSinceLastUpdate < UPDATE_INTERVAL_MS) {
      const distance = calculateDistance(lastPositionRef.current, position);
      if (distance >= MIN_DISTANCE_METERS) {
        shouldUpdate = true;
      }
    } else if (!lastPositionRef.current) {
      shouldUpdate = true;
    }
    if (shouldUpdate) {
      upsertAgentLocation(user.id, position);
      lastPositionRef.current = position;
      lastUpdateRef.current = now;
    }
  }, [user?.id, position, enabled]);
  reactExports.useEffect(() => {
    if (!user?.id) return;
    return () => {
      (async () => {
        try {
          await supabase.rpc("set_my_agent_location", {
            p_lat: lastPositionRef.current?.lat || 0,
            p_lng: lastPositionRef.current?.lng || 0,
            p_accuracy: null,
            p_status: "offline"
          });
        } catch (e) {
        }
      })();
    };
  }, [user?.id]);
}

const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Casey",
  "Riley",
  "Morgan",
  "Taylor",
  "Quinn",
  "Avery",
  "Parker",
  "Sage",
  "Phoenix",
  "River",
  "Sky",
  "Storm",
  "Blake",
  "Drew",
  "Charlie",
  "Jamie",
  "Reese",
  "Dakota",
  "Marco",
  "Luca",
  "Emma",
  "Sofia",
  "Hans",
  "Klaus",
  "Pierre",
  "Marie",
  "Yuki",
  "Kenji",
  "Chen",
  "Wei",
  "Raj",
  "Priya",
  "Carlos",
  "Isabella",
  "Miguel",
  "Luna",
  "Kai",
  "Mika",
  "Leon",
  "Nina",
  "Oscar",
  "Eva",
  "Felix",
  "Zoe",
  "Max",
  "Lily",
  "Noah",
  "Aria",
  "Ethan",
  "Mia",
  "Lucas",
  "Chloe",
  "Mason",
  "Ella",
  "Oliver",
  "Ava",
  "Elijah",
  "Sophie",
  "James",
  "Amelia",
  "Benjamin",
  "Harper",
  "Jack",
  "Evelyn",
  "Henry",
  "Abigail",
  "Leo",
  "Emily"
];
function generateAgentName(index) {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const suffix = Math.floor(index / FIRST_NAMES.length);
  return suffix > 0 ? `${firstName}${suffix}` : firstName;
}
function generateNPCCode(index) {
  return `AG-NPC-${String(index).padStart(4, "0")}`;
}
function getRandomStatus(seed) {
  const rand = (seed * 9301 + 49297) % 233280 / 233280;
  if (rand < 0.3) return "online";
  if (rand < 0.6) return "idle";
  return "offline";
}
const EUROPE_COORDS = [
  // UK (30)
  [51.5074, -0.1278],
  [51.4545, -2.5879],
  [53.4808, -2.2426],
  [52.4862, -1.8904],
  [55.9533, -3.1883],
  [53.8008, -1.5491],
  [54.9783, -1.6178],
  [51.4816, -3.1791],
  [52.6309, 1.2974],
  [50.8225, -0.1372],
  [51.752, -1.2577],
  [52.2053, 0.1218],
  [53.4084, -2.9916],
  [51.8787, -2.0875],
  [53.3811, -1.4701],
  [54.5973, -5.9301],
  [57.1497, -2.0943],
  [56.462, -2.9707],
  [55.8642, -4.2518],
  [54, -2.5],
  [52, 0],
  [53, -1],
  [51, -2],
  [54.5, -1],
  [52.5, -2.5],
  [55, -3],
  [51.3, -0.5],
  [53.2, -2],
  [52.8, -1.5],
  [54.2, -2.2],
  // France (25)
  [48.8566, 2.3522],
  [43.2965, 5.3698],
  [45.764, 4.8357],
  [43.6047, 1.4442],
  [44.8378, -0.5792],
  [47.2184, -1.5536],
  [48.5734, 7.7521],
  [43.7102, 7.262],
  [49.4432, 1.0993],
  [47.322, 5.0415],
  [46.58, 0.34],
  [43.1242, 5.928],
  [48.1173, -1.6778],
  [45.4334, 4.39],
  [44.4, 2.5],
  [46, 2],
  [47.5, 1.5],
  [49, 2],
  [43.5, 3.5],
  [45, 5],
  [48, 3],
  [46.5, 0],
  [44, 1],
  [47, 4],
  [49.5, 1],
  // Germany (25)
  [52.52, 13.405],
  [48.1351, 11.582],
  [50.1109, 8.6821],
  [53.5511, 9.9937],
  [51.2277, 6.7735],
  [50.9375, 6.9603],
  [51.4556, 7.0116],
  [49.4521, 11.0767],
  [48.7758, 9.1829],
  [51.0504, 13.7373],
  [52.3759, 9.732],
  [50.0755, 14.4378],
  [49.0069, 8.4037],
  [51.9607, 7.6261],
  [50.5, 12],
  [53, 10],
  [49.5, 7],
  [52, 11],
  [48.5, 10],
  [51, 9],
  [54, 10.5],
  [50, 11.5],
  [52.5, 12],
  [49, 9.5],
  [51.5, 8],
  // Italy (25)
  [41.9028, 12.4964],
  [45.4642, 9.19],
  [40.8518, 14.2681],
  [43.7696, 11.2558],
  [45.0703, 7.6869],
  [44.4949, 11.3426],
  [38.1157, 13.3615],
  [40.3516, 18.1718],
  [45.4384, 10.9916],
  [41.1171, 16.8719],
  [44, 12.5],
  [42.5, 14],
  [46, 11],
  [43, 10.5],
  [39, 16],
  [37.5, 14],
  [44.5, 8.5],
  [41.5, 15],
  [45.5, 12.5],
  [42, 11],
  [40, 17],
  [43.5, 13.5],
  [46.5, 13],
  [38.5, 16],
  [44.2, 9],
  // Spain (25)
  [40.4168, -3.7038],
  [41.3851, 2.1734],
  [37.3891, -5.9845],
  [39.4699, -0.3763],
  [43.263, -2.935],
  [36.7213, -4.4214],
  [41.6488, -0.8891],
  [42.8782, -8.5448],
  [39.8628, -4.0273],
  [38.3452, -0.481],
  [37.9922, -1.1307],
  [40, -3],
  [42.5, -8],
  [38.5, -0.5],
  [36.5, -5],
  [41, 0.5],
  [43, -3.5],
  [39, -1],
  [37, -4],
  [40.5, -4.5],
  [42, -2],
  [38, -1.5],
  [36.8, -2.5],
  [41.5, 1],
  [39.5, -3.5],
  // Poland (20)
  [52.2297, 21.0122],
  [51.1079, 17.0385],
  [50.0647, 19.945],
  [54.352, 18.6466],
  [51.7592, 19.456],
  [53.1235, 18.0084],
  [50.2649, 19.0238],
  [52.4064, 16.9252],
  [51.4, 21.15],
  [50.8, 16.5],
  [53.5, 14.5],
  [52, 20],
  [51.5, 18],
  [54, 19.5],
  [50.5, 18.5],
  [53, 17.5],
  [52.5, 19],
  [51, 20.5],
  [50, 17],
  [54.5, 18],
  // Netherlands (15)
  [52.3676, 4.9041],
  [51.9225, 4.4792],
  [52.0907, 5.1214],
  [51.4416, 5.4697],
  [53.2194, 6.5665],
  [52.1601, 4.497],
  [51.8126, 4.6901],
  [52.5, 6],
  [51.5, 5],
  [53, 5.5],
  [52, 4.5],
  [51.6, 4],
  [52.8, 5.5],
  [51.3, 6],
  [52.2, 5.5],
  // Belgium (10)
  [50.8503, 4.3517],
  [51.2194, 4.4025],
  [50.6326, 5.5797],
  [51.0543, 3.7174],
  [50.4108, 4.4446],
  [50.9, 3.5],
  [51, 5],
  [50.5, 4],
  [50.7, 5],
  [51.1, 4],
  // Switzerland (10)
  [47.3769, 8.5417],
  [46.2044, 6.1432],
  [46.948, 7.4474],
  [47.5596, 7.5886],
  [46.0037, 8.9511],
  [47, 8],
  [46.5, 6.5],
  [47.2, 9],
  [46.8, 7],
  [47.4, 7.5],
  // Austria (10)
  [48.2082, 16.3738],
  [47.2692, 11.4041],
  [47.0707, 15.4395],
  [48.3069, 14.2858],
  [47.8095, 13.055],
  [47.5, 14],
  [48, 15],
  [47.3, 12],
  [48.5, 16],
  [47.8, 14.5],
  // Portugal (10)
  [38.7223, -9.1393],
  [41.1579, -8.6291],
  [37.0179, -7.9304],
  [40.2033, -8.4103],
  [39.4, -8],
  [38.5, -9],
  [41.5, -8],
  [37.5, -8.5],
  [40.5, -7.5],
  [39, -7],
  // Sweden (10)
  [59.3293, 18.0686],
  [57.7089, 11.9746],
  [55.605, 13.0038],
  [63.8258, 20.263],
  [59.8586, 17.6389],
  [58.4108, 15.6214],
  [56, 14],
  [60, 17],
  [62, 17.5],
  [57, 12.5],
  // Norway (10)
  [59.9139, 10.7522],
  [60.3913, 5.3221],
  [63.4305, 10.3951],
  [58.97, 5.7331],
  [69.6496, 18.956],
  [62, 9],
  [61, 7],
  [59, 6],
  [66, 14],
  [64, 11],
  // Denmark (10)
  [55.6761, 12.5683],
  [56.1629, 10.2039],
  [55.4038, 10.4024],
  [57.0488, 9.9217],
  [55, 9.5],
  [56.5, 9],
  [55.5, 11],
  [56, 11.5],
  [54.8, 10],
  [56.8, 10.5],
  // Czech Republic (10)
  [50.0755, 14.4378],
  [49.1951, 16.6068],
  [49.8209, 18.2625],
  [50.2092, 15.8328],
  [49.5955, 17.2518],
  [50.5, 14],
  [49, 17],
  [50, 16],
  [49.5, 18],
  [50.3, 15],
  // Greece (10)
  [37.9838, 23.7275],
  [40.6401, 22.9444],
  [35.3387, 25.1442],
  [38.2466, 21.7346],
  [39.6243, 19.9217],
  [38, 22],
  [40, 24],
  [36, 23],
  [39, 21],
  [41, 25],
  // Ireland (5)
  [53.3498, -6.2603],
  [51.8969, -8.4863],
  [53.2707, -9.0568],
  [54.5973, -5.9301],
  [52.6638, -8.6267]
];
const USA_COORDS = [
  // Northeast (70)
  [40.7128, -74.006],
  [40.758, -73.9855],
  [40.6892, -74.0445],
  [40.8448, -73.8648],
  [41.0534, -73.5387],
  [42.3601, -71.0589],
  [42.3314, -71.0475],
  [42.2626, -71.8023],
  [41.824, -71.4128],
  [41.7658, -72.6734],
  [39.9526, -75.1652],
  [40.4406, -79.9959],
  [40.7608, -111.891],
  [39.2904, -76.6122],
  [38.9072, -77.0369],
  [40.0583, -74.4057],
  [40.2206, -74.7597],
  [41.122, -73.7949],
  [41.3083, -72.9279],
  [42.8864, -78.8784],
  [43.161, -77.6109],
  [42.6526, -73.7562],
  [43.0481, -76.1474],
  [42.444, -76.5019],
  [44.4759, -73.2121],
  [44.0012, -71.5799],
  [43.6591, -70.2568],
  [45.2538, -69.4455],
  [41.2033, -77.1945],
  [39.7391, -75.5398],
  [40.0379, -76.3055],
  [41.4901, -81.6944],
  [39.9612, -82.9988],
  [41.0814, -81.519],
  [39.7589, -84.1916],
  [42.9849, -71.444],
  [43.2081, -71.5376],
  [44.428, -71.163],
  [42.1015, -72.5898],
  [41.5868, -72.7495],
  [41.9001, -71.0898],
  [40.4774, -74.2591],
  [40.9176, -74.1719],
  [40.1164, -75.2835],
  [39.084, -77.1528],
  [39.4566, -76.1727],
  [38.8951, -77.0364],
  [39.1031, -76.8028],
  [38.7849, -76.8721],
  [39.5168, -76.6413],
  [40.015, -75.1327],
  [40.4315, -75.3499],
  [41.409, -75.6624],
  [40.6331, -75.4407],
  [40.7794, -77.86],
  [40.2737, -76.8867],
  [42.1292, -80.0851],
  [41.2565, -80.767],
  [40.0992, -80.695],
  [40.3573, -80.0018],
  [39.1582, -78.1628],
  [37.5407, -77.436],
  [36.8508, -75.9779],
  [37.4316, -79.1422],
  [38.4496, -78.8689],
  [37.2296, -80.4139],
  [36.6488, -78.3747],
  [36.0726, -79.792],
  [35.2271, -80.8431],
  [35.9606, -83.9207],
  // Midwest (70)
  [41.8781, -87.6298],
  [41.85, -87.6501],
  [41.9742, -87.9073],
  [42.0451, -87.6877],
  [41.7508, -88.1535],
  [42.3314, -83.0458],
  [42.443, -83.0201],
  [42.7325, -84.5555],
  [42.2919, -85.5872],
  [43.0125, -83.6875],
  [44.9778, -93.265],
  [44.9537, -93.09],
  [44.8897, -93.3499],
  [46.7867, -92.1005],
  [44.0121, -92.4802],
  [43.0389, -87.9065],
  [43.0747, -89.3837],
  [44.5192, -88.0198],
  [42.5006, -90.6643],
  [43.7844, -88.7879],
  [39.7684, -86.1581],
  [39.1031, -84.512],
  [39.9612, -82.9988],
  [41.4993, -81.6944],
  [40.4173, -82.9071],
  [41.5868, -93.625],
  [42.0308, -93.6319],
  [41.2565, -95.9345],
  [41.6005, -93.6091],
  [42.4999, -96.4003],
  [39.0997, -94.5786],
  [38.627, -90.1994],
  [39.1174, -94.6055],
  [38.5767, -92.1735],
  [37.6879, -97.3375],
  [46.8772, -96.7898],
  [48.2325, -101.2963],
  [43.5446, -96.7311],
  [44.3668, -100.3538],
  [41.2524, -95.998],
  [40.8136, -96.7026],
  [41.14, -100.7601],
  [39.0473, -95.6752],
  [37.2167, -93.292],
  [35.4676, -97.5164],
  [35.2226, -97.4395],
  [36.154, -95.9928],
  [35.0844, -106.6504],
  [33.4484, -112.074],
  [35.1983, -111.6513],
  [46.5891, -112.0391],
  [47.5053, -111.3008],
  [46.8721, -113.994],
  [45.7833, -108.5007],
  [43.615, -116.2023],
  [42.8713, -112.4455],
  [40.7608, -111.891],
  [38.5733, -109.5498],
  [39.5501, -107.3248],
  [39.7392, -104.9903],
  [38.8339, -104.8214],
  [39.0639, -108.5506],
  [40.5853, -105.0844],
  [37.2753, -107.8801],
  [33.5102, -112.3858],
  [32.2217, -110.9265],
  [34.5199, -105.8701],
  [36.9741, -109.0452],
  [35.687, -105.9378],
  [32.3199, -106.7637],
  // South (70)
  [33.749, -84.388],
  [33.4484, -112.074],
  [30.2672, -97.7431],
  [29.7604, -95.3698],
  [32.7767, -96.797],
  [29.4241, -98.4936],
  [32.7157, -117.1611],
  [37.7749, -122.4194],
  [34.0522, -118.2437],
  [38.5816, -121.4944],
  [36.1699, -115.1398],
  [33.4484, -112.074],
  [35.1495, -90.049],
  [36.1627, -86.7816],
  [35.9606, -83.9207],
  [32.3546, -86.2662],
  [33.5207, -86.8025],
  [30.4383, -84.2807],
  [27.9506, -82.4572],
  [25.7617, -80.1918],
  [26.1224, -80.1373],
  [28.5383, -81.3792],
  [30.3322, -81.6557],
  [27.4989, -82.5748],
  [26.6406, -81.8723],
  [30.6954, -88.0399],
  [32.2988, -90.1848],
  [29.9511, -90.0715],
  [30.4583, -91.1403],
  [32.0809, -81.0912],
  [34.0007, -81.0348],
  [35.2271, -80.8431],
  [35.7796, -78.6382],
  [33.8361, -78.6801],
  [34.8526, -82.394],
  [36.1627, -86.7816],
  [35.9606, -83.9207],
  [38.2527, -85.7585],
  [36.8508, -75.9779],
  [37.5407, -77.436],
  [38.3498, -81.6326],
  [39.3292, -76.6206],
  [34.7465, -92.2896],
  [35.1495, -90.049],
  [36.3729, -94.2088],
  [35.4676, -97.5164],
  [36.154, -95.9928],
  [35.2226, -97.4395],
  [29.7604, -95.3698],
  [30.2672, -97.7431],
  [32.7767, -96.797],
  [31.7619, -106.485],
  [35.0844, -106.6504],
  [32.2217, -110.9265],
  [33.4484, -112.074],
  [31.3271, -89.2903],
  [33.5186, -86.8104],
  [34.7304, -86.5861],
  [33.7488, -84.3894],
  [33.0062, -80.2277],
  [32.4609, -84.9877],
  [30.3322, -81.6557],
  [26.7153, -80.0534],
  [25.4687, -80.4776],
  [28.0836, -80.6081],
  [30.4507, -91.1545],
  [31.3113, -92.4451],
  [32.5149, -93.7503],
  [33.5842, -92.184],
  [34.7373, -92.3311],
  // West (70)
  [37.7749, -122.4194],
  [34.0522, -118.2437],
  [32.7157, -117.1611],
  [38.5816, -121.4944],
  [36.7783, -119.4179],
  [33.4484, -112.074],
  [36.1699, -115.1398],
  [47.6062, -122.3321],
  [45.5051, -122.675],
  [44.9429, -123.0351],
  [40.7608, -111.891],
  [39.7392, -104.9903],
  [35.687, -105.9378],
  [46.8772, -96.7898],
  [43.615, -116.2023],
  [36.1156, -115.1739],
  [35.222, -114.9951],
  [33.415, -117.6013],
  [34.4208, -119.6982],
  [37.3382, -121.8863],
  [37.5485, -122.059],
  [38.2544, -122.04],
  [39.5296, -119.8138],
  [41.2524, -122.3866],
  [42.2865, -122.8756],
  [44.0521, -123.0868],
  [43.7534, -122.2315],
  [45.5051, -122.675],
  [46.2087, -119.1372],
  [47.0379, -122.9007],
  [48.7519, -122.4787],
  [47.2529, -122.4443],
  [46.7324, -117.0002],
  [44.8021, -117.8326],
  [43.6007, -116.2312],
  [45.5235, -122.6762],
  [42.3265, -122.8756],
  [40.5865, -122.3917],
  [41.878, -123.3879],
  [39.1638, -119.7674],
  [40.2338, -111.6585],
  [37.0965, -113.5684],
  [39.0997, -108.5609],
  [38.0336, -107.6735],
  [37.2753, -107.8801],
  [38.8339, -104.8214],
  [40.5853, -105.0844],
  [41.14, -104.8202],
  [42.8666, -106.3131],
  [44.0805, -103.231],
  [46.8083, -100.7837],
  [47.9253, -97.0329],
  [48.5499, -109.6801],
  [47.5053, -111.3008],
  [46.5891, -112.0391],
  [48.2125, -114.3637],
  [45.677, -111.0429],
  [44.5263, -109.0565],
  [43.4799, -110.7624],
  [42.8501, -106.3228],
  [41.14, -100.7601],
  [39.7789, -100.445],
  [38.9717, -95.2353],
  [37.6872, -97.3301],
  [36.1156, -97.0584],
  [35.4676, -97.5164],
  [33.4484, -112.074],
  [32.7555, -117.0727],
  [33.1959, -117.3795],
  [33.8366, -116.5453],
  // Alaska & Hawaii (10)
  [61.2181, -149.9003],
  [64.8378, -147.7164],
  [58.3019, -134.4197],
  [59.4545, -135.3139],
  [60.7884, -161.7558],
  [21.3069, -157.8583],
  [20.7984, -156.3319],
  [19.8968, -155.5828],
  [21.4389, -158.0001],
  [20.8911, -156.5047]
];
const SOUTH_AMERICA_COORDS = [
  // Brazil (80)
  [-23.5505, -46.6333],
  [-22.9068, -43.1729],
  [-19.9167, -43.9345],
  [-25.4284, -49.2733],
  [-30.0346, -51.2177],
  [-12.9714, -38.5014],
  [-3.119, -60.0217],
  [-8.0476, -34.877],
  [-15.7942, -47.8822],
  [-1.4558, -48.4902],
  [-16.6869, -49.2648],
  [-3.7172, -38.5433],
  [-5.7945, -35.211],
  [-27.5954, -48.548],
  [-20.4697, -54.6201],
  [-22.2269, -49.9481],
  [-21.1767, -47.8208],
  [-10.9472, -37.0731],
  [-2.5191, -44.2829],
  [-9.6658, -35.735],
  [-7.1195, -34.845],
  [-23, -45],
  [-21, -44],
  [-20, -42],
  [-24, -47],
  [-26, -48.5],
  [-28, -49.5],
  [-22.5, -41.5],
  [-17, -49],
  [-14, -46],
  [-18.5, -44],
  [-23.5, -51],
  [-25, -50],
  [-29, -51.5],
  [-30.5, -52.5],
  [-6, -35],
  [-4, -38],
  [-2, -44],
  [-5, -42],
  [-8.5, -37],
  [-11, -40],
  [-13, -41],
  [-15, -43],
  [-16, -48],
  [-18, -50],
  [-19, -47],
  [-20.5, -45],
  [-21.5, -43.5],
  [-22, -48],
  [-23, -52],
  [-24.5, -46],
  [-25.5, -54],
  [-26.5, -50.5],
  [-27, -52],
  [-28.5, -50],
  [-7.5, -39],
  [-9, -38],
  [-10, -36.5],
  [-12, -42],
  [-14.5, -39],
  [-17.5, -46],
  [-19.5, -40.5],
  [-21, -50],
  [-22.8, -47],
  [-24.2, -48.5],
  [-26.2, -53],
  [-27.8, -49],
  [-29.5, -50.5],
  [-10.5, -55],
  [-8, -50],
  [-5.5, -48],
  [-3.5, -52],
  [-1, -50],
  [0.5, -51],
  [-4.5, -56],
  [-6.5, -58],
  [-12.5, -56],
  [-15.5, -58],
  [-18, -56],
  [-20, -57],
  // Argentina (40)
  [-34.6037, -58.3816],
  [-31.4201, -64.1888],
  [-32.8908, -68.8272],
  [-38.7196, -62.2724],
  [-27.4692, -58.8306],
  [-34.9215, -57.9545],
  [-33, -60.5],
  [-35, -59],
  [-36.5, -60],
  [-38, -57.5],
  [-40, -63],
  [-42, -65],
  [-44, -67],
  [-46, -68],
  [-48, -70],
  [-50, -69],
  [-52, -68.5],
  [-29, -59],
  [-30.5, -62],
  [-32, -66],
  [-33.5, -68],
  [-35.5, -63],
  [-37, -66],
  [-39.5, -68.5],
  [-41.5, -71],
  [-43.5, -66],
  [-45.5, -69],
  [-47.5, -67.5],
  [-49.5, -68],
  [-51.5, -72],
  [-28, -65.5],
  [-26.5, -64],
  [-25, -65],
  [-27, -60.5],
  [-29.5, -67],
  [-31, -68.5],
  [-34, -61],
  [-36, -64.5],
  [-38.5, -61],
  [-40.5, -66],
  // Colombia (25)
  [4.711, -74.0721],
  [6.2518, -75.5636],
  [10.9639, -74.7964],
  [3.4516, -76.532],
  [7.8891, -76.6356],
  [5, -73],
  [6.5, -73.5],
  [8, -75],
  [9.5, -75.5],
  [11, -73],
  [4, -75.5],
  [5.5, -76],
  [7, -74],
  [8.5, -76.5],
  [10, -74.5],
  [3, -77],
  [4.5, -72],
  [6, -77.5],
  [7.5, -72.5],
  [9, -74],
  [2.5, -75],
  [3.5, -73.5],
  [5, -74.5],
  [6.5, -76],
  [8, -73],
  // Chile (25)
  [-33.4489, -70.6693],
  [-35.8261, -71.6281],
  [-39.8196, -73.2454],
  [-41.4693, -72.9424],
  [-45.5752, -72.0662],
  [-30, -71],
  [-32, -71.5],
  [-34, -70.5],
  [-36.5, -72.5],
  [-38, -73],
  [-40, -72.5],
  [-43, -73],
  [-47, -72.5],
  [-50, -73.5],
  [-53, -71],
  [-28, -70.5],
  [-31, -70.8],
  [-33, -71.2],
  [-35, -71],
  [-37.5, -72],
  [-39, -72.8],
  [-42, -73.5],
  [-44.5, -72],
  [-48.5, -73],
  [-51.5, -72.5],
  // Peru (20)
  [-12.0464, -77.0428],
  [-13.5319, -71.9675],
  [-16.409, -71.5375],
  [-8.1116, -79.0288],
  [-6.7701, -79.8409],
  [-10, -76],
  [-11.5, -77.5],
  [-13, -75.5],
  [-14.5, -73],
  [-15.5, -70],
  [-9, -78.5],
  [-7.5, -75],
  [-5.5, -80.5],
  [-4, -79],
  [-3.5, -75],
  [-11, -78],
  [-12.5, -74],
  [-14, -76],
  [-15, -71.5],
  [-6, -76.5],
  // Venezuela, Ecuador, others (10)
  [10.4806, -66.9036],
  [10, -67.5],
  [8.5, -71],
  [9.5, -69],
  [7, -70],
  [-0.1807, -78.4678],
  [-1, -79],
  [-2.5, -79.5],
  [0.5, -77],
  [-1.5, -80]
];
const JAPAN_COORDS = [
  [35.6762, 139.6503],
  [35.6895, 139.6917],
  [35.709, 139.7319],
  [35.6585, 139.7454],
  [35.6284, 139.7387],
  [34.6937, 135.5023],
  [34.6851, 135.5263],
  [34.7025, 135.4959],
  [35.0116, 135.7681],
  [35, 135.75],
  [43.0618, 141.3545],
  [42.9849, 141.3469],
  [43.0825, 141.3405],
  [42.85, 140.5],
  [43.2, 141],
  [35.1815, 136.9066],
  [35.15, 137],
  [35.1, 136.85],
  [35.4437, 139.638],
  [35.4, 139.55],
  [34.3853, 132.4553],
  [34.4, 132.5],
  [34.35, 132.4],
  [33.5904, 130.4017],
  [33.6, 130.45],
  [26.2124, 127.6809],
  [26.3, 127.8],
  [26.15, 127.6],
  [38.2682, 140.8694],
  [38.3, 141],
  [36.5611, 136.6562],
  [36.6, 136.75],
  [36.5, 136.6],
  [33.8416, 132.7656],
  [33.9, 132.85],
  [39.7036, 141.1527],
  [39.8, 141.25],
  [39.6, 141],
  [34.0658, 134.5593],
  [34.15, 134.6],
  [31.5969, 130.5571],
  [31.7, 130.65],
  [31.5, 130.5],
  [32.7503, 129.8779],
  [32.8, 130],
  [35.36, 138.7274],
  [35.4, 138.8],
  [35.3, 138.65],
  [36.2048, 138.2529],
  [36.3, 138.35],
  [35.8617, 139.6455],
  [35.9, 139.7],
  [35.8, 139.6],
  [34.9871, 138.3831],
  [35.05, 138.45],
  [33.2249, 131.6069],
  [33.3, 131.7],
  [33.15, 131.55],
  [40.8244, 140.74],
  [40.9, 140.8],
  [37.9026, 139.0233],
  [38, 139.1],
  [37.8, 138.95],
  [34.2289, 135.1675],
  [34.3, 135.25],
  [35.5, 139.5],
  [34.5, 136],
  [33.5, 131.5],
  [36, 137.5],
  [37, 140],
  [38.5, 139.5],
  [39, 141.5],
  [40.5, 140.5],
  [42, 140],
  [35.25, 137]
];
const INDIA_COORDS = [
  [28.6139, 77.209],
  [28.7041, 77.1025],
  [28.5355, 77.391],
  [19.076, 72.8777],
  [19.1136, 72.8697],
  [18.5204, 73.8567],
  [18.55, 73.9],
  [18.48, 73.8],
  [12.9716, 77.5946],
  [13, 77.65],
  [13.0827, 80.2707],
  [13.1, 80.3],
  [13.05, 80.22],
  [22.5726, 88.3639],
  [22.6, 88.4],
  [17.385, 78.4867],
  [17.45, 78.55],
  [17.32, 78.42],
  [23.0225, 72.5714],
  [23.1, 72.6],
  [26.9124, 75.7873],
  [27, 75.85],
  [26.85, 75.72],
  [21.1702, 72.8311],
  [21.25, 72.9],
  [25.5941, 85.1376],
  [25.65, 85.2],
  [25.52, 85.05],
  [11.0168, 76.9558],
  [11.1, 77.05],
  [22.7196, 75.8577],
  [22.8, 75.95],
  [22.65, 75.8],
  [9.9312, 76.2673],
  [10, 76.35],
  [26.8467, 80.9462],
  [26.95, 81.05],
  [26.75, 80.85],
  [30.7333, 76.7794],
  [30.8, 76.85],
  [15.2993, 74.124],
  [15.4, 74.2],
  [15.2, 74.05],
  [23.2599, 77.4126],
  [23.35, 77.5],
  [20, 73],
  [21.5, 79],
  [24, 83],
  [25, 87],
  [27, 78],
  [28, 80],
  [29, 76],
  [30, 79],
  [31, 77.5],
  [32, 75],
  [15, 75],
  [16.5, 80.5],
  [18, 76.5],
  [19.5, 85],
  [22, 70],
  [24.5, 74.5],
  [26, 81.5],
  [27.5, 84],
  [29.5, 78.5],
  [31.5, 74.5],
  [14, 77.5],
  [16, 78],
  [17.5, 83],
  [20.5, 78.5],
  [23.5, 85.5],
  [25.5, 82.5],
  [28.5, 79],
  [30.5, 77],
  [13.5, 79.5],
  [12, 75.5]
];
const CHINA_COORDS = [
  [31.2304, 121.4737],
  [31.1, 121.5],
  [31.35, 121.4],
  [39.9042, 116.4074],
  [39.8, 116.5],
  [40, 116.35],
  [22.3193, 114.1694],
  [22.4, 114.25],
  [22.25, 114.1],
  [23.1291, 113.2644],
  [23.2, 113.35],
  [23.05, 113.2],
  [30.5728, 104.0668],
  [30.65, 104.15],
  [30.5, 103.95],
  [22.5431, 114.0579],
  [22.6, 114.15],
  [22.48, 113.95],
  [29.563, 106.5516],
  [29.65, 106.65],
  [34.2658, 108.9541],
  [34.35, 109.05],
  [34.2, 108.85],
  [38.0428, 114.5149],
  [38.15, 114.6],
  [36.0611, 120.3826],
  [36.15, 120.45],
  [36, 120.3],
  [28.228, 112.9388],
  [28.3, 113.05],
  [30.2741, 120.1551],
  [30.35, 120.25],
  [30.2, 120.05],
  [32.0603, 118.7969],
  [32.15, 118.9],
  [25.0389, 102.7183],
  [25.15, 102.85],
  [25, 102.6],
  [43.8171, 125.3235],
  [43.9, 125.4],
  [45.75, 126.65],
  [45.85, 126.75],
  [45.65, 126.55],
  [41.8057, 123.4315],
  [41.9, 123.55],
  [39, 117.5],
  [37.5, 118],
  [35.5, 119],
  [33.5, 117],
  [32, 119.5],
  [30, 121],
  [28.5, 115],
  [27, 114],
  [25.5, 110.5],
  [24, 113.5],
  [22, 110],
  [20.5, 110.5],
  [26, 106],
  [28, 104],
  [30.5, 103],
  [33, 105],
  [35, 107],
  [37, 112],
  [40.5, 111.5],
  [42, 117],
  [44, 123],
  [46, 125],
  [48, 122],
  [29, 108]
];
function generateFictitiousAgents() {
  const agents = [];
  let globalIndex = 0;
  const addAgentsFromCoords = (coords, count) => {
    for (let i = 0; i < count && i < coords.length; i++) {
      const [lat, lng] = coords[i];
      agents.push({
        id: `npc-${globalIndex}`,
        lat: lat + (Math.random() - 0.5) * 0.02,
        // Small random offset
        lng: lng + (Math.random() - 0.5) * 0.02,
        username: generateAgentName(globalIndex),
        agent_code: generateNPCCode(globalIndex),
        status: getRandomStatus(globalIndex),
        lastSeen: new Date(Date.now() - Math.random() * 864e5).toISOString(),
        // Random time in last 24h
        rank_id: Math.floor(Math.random() * 5) + 1
      });
      globalIndex++;
    }
  };
  addAgentsFromCoords(EUROPE_COORDS, 250);
  addAgentsFromCoords(USA_COORDS, 350);
  addAgentsFromCoords(SOUTH_AMERICA_COORDS, 200);
  addAgentsFromCoords(JAPAN_COORDS, 75);
  addAgentsFromCoords(INDIA_COORDS, 75);
  addAgentsFromCoords(CHINA_COORDS, 69);
  return agents;
}
function generateCityPoints(centerLat, centerLng, count, spread = 0.08) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = i / count * Math.PI * 2 + Math.random() * 0.5;
    const distance = Math.random() * spread;
    points.push([
      centerLat + Math.sin(angle) * distance + (Math.random() - 0.5) * 0.02,
      centerLng + Math.cos(angle) * distance + (Math.random() - 0.5) * 0.02
    ]);
  }
  return points;
}
const ITALY_CITIES = [
  ...generateCityPoints(45.4642, 9.19, 10, 0.08),
  // Milano
  ...generateCityPoints(45.0703, 7.6869, 7, 0.06),
  // Torino
  ...generateCityPoints(41.9028, 12.4964, 10, 0.1),
  // Roma
  ...generateCityPoints(40.8518, 14.2681, 8, 0.07),
  // Napoli
  ...generateCityPoints(45.4408, 12.3155, 5, 0.04),
  // Venezia
  ...generateCityPoints(44.4056, 8.9463, 6, 0.05),
  // Genova
  ...generateCityPoints(43.7696, 11.2558, 7, 0.06),
  // Firenze
  ...generateCityPoints(44.6471, 10.9252, 5, 0.04),
  // Modena
  ...generateCityPoints(45.1564, 10.7914, 5, 0.04),
  // Mantova
  ...generateCityPoints(44.8378, 11.6196, 5, 0.04),
  // Ferrara
  ...generateCityPoints(45.6495, 13.7768, 6, 0.05),
  // Trieste
  ...generateCityPoints(40.6664, 16.6043, 5, 0.04),
  // Matera
  ...generateCityPoints(40.6327, 17.9419, 5, 0.04),
  // Brindisi
  ...generateCityPoints(38.1113, 15.6475, 5, 0.04),
  // Reggio Calabria
  ...generateCityPoints(38.1157, 13.3615, 6, 0.05),
  // Palermo
  ...generateCityPoints(37.5079, 15.083, 4, 0.04)
  // Catania
];
const FRANCE_CITIES = [
  ...generateCityPoints(48.8566, 2.3522, 35, 0.12),
  // Parigi
  ...generateCityPoints(43.2965, 5.3698, 25, 0.08),
  // Marsiglia
  ...generateCityPoints(43.7102, 7.262, 20, 0.06),
  // Nizza
  ...generateCityPoints(45.764, 4.8357, 25, 0.08),
  // Lione
  ...generateCityPoints(44.8378, -0.5792, 20, 0.07)
  // Bordeaux
];
const UK_IRELAND_CITIES = [
  ...generateCityPoints(51.5074, -0.1278, 70, 0.15),
  // Londra
  ...generateCityPoints(52.4862, -1.8904, 45, 0.1),
  // Birmingham
  ...generateCityPoints(53.3498, -6.2603, 35, 0.08)
  // Dublino
];
const SPAIN_CITIES = [
  ...generateCityPoints(40.4168, -3.7038, 35, 0.12),
  // Madrid
  ...generateCityPoints(41.3851, 2.1734, 35, 0.1),
  // Barcellona
  ...generateCityPoints(37.8882, -4.7794, 20, 0.06),
  // Cordoba
  ...generateCityPoints(36.7213, -4.4217, 21, 0.07),
  // Malaga
  ...generateCityPoints(41.6488, -0.8891, 20, 0.08)
  // Aragona (Zaragoza)
];
const GERMANY_CITIES = [
  ...generateCityPoints(52.52, 13.405, 45, 0.12),
  // Berlino
  ...generateCityPoints(50.1109, 8.6821, 37, 0.1),
  // Francoforte
  ...generateCityPoints(48.1351, 11.582, 37, 0.1)
  // Monaco di Baviera
];
const NETHERLANDS_CROATIA_CITIES = [
  ...generateCityPoints(51.9244, 4.4777, 29, 0.08),
  // Rotterdam
  ...generateCityPoints(52.3676, 4.9041, 29, 0.08),
  // Amsterdam
  ...generateCityPoints(45.815, 15.9819, 29, 0.08)
  // Zagabria
];
const BUDAPEST_CITIES = [
  ...generateCityPoints(47.4979, 19.0402, 203, 0.15)
  // Budapest
];
const NEW_YORK_CITIES = [
  ...generateCityPoints(40.7128, -74.006, 327, 0.2)
  // New York
];
const MIAMI_CITIES = [
  ...generateCityPoints(25.7617, -80.1918, 50, 0.1)
  // Miami
];
const USA_OTHER_CITIES = [
  ...generateCityPoints(34.0522, -118.2437, 20, 0.15),
  // Los Angeles
  ...generateCityPoints(32.7767, -96.797, 18, 0.1),
  // Dallas
  ...generateCityPoints(29.7604, -95.3698, 18, 0.1),
  // Houston
  ...generateCityPoints(37.7749, -122.4194, 18, 0.1),
  // San Francisco
  ...generateCityPoints(41.8781, -87.6298, 18, 0.12),
  // Chicago
  ...generateCityPoints(42.3314, -83.0458, 15, 0.08),
  // Detroit
  ...generateCityPoints(42.3601, -71.0589, 16, 0.08)
  // Boston
];
const MEXICO_RIO_CITIES = [
  ...generateCityPoints(19.4326, -99.1332, 96, 0.15),
  // Città del Messico
  ...generateCityPoints(-22.9068, -43.1729, 95, 0.12)
  // Rio de Janeiro
];
const LATAM_OTHER_CITIES = [
  ...generateCityPoints(-23.5505, -46.6333, 26, 0.1),
  // San Paolo
  ...generateCityPoints(-34.6037, -58.3816, 25, 0.08)
  // Buenos Aires
];
const CANADA_CITIES = [
  ...generateCityPoints(49.2827, -123.1207, 24, 0.08),
  // Vancouver
  ...generateCityPoints(43.6532, -79.3832, 24, 0.08),
  // Toronto
  ...generateCityPoints(45.5017, -73.5673, 23, 0.07)
  // Montreal
];
const SCANDINAVIA_CITIES = [
  ...generateCityPoints(59.3293, 18.0686, 44, 0.1),
  // Stoccolma
  ...generateCityPoints(59.9139, 10.7522, 43, 0.1)
  // Oslo
];
const MUMBAI_CITIES = [
  ...generateCityPoints(19.076, 72.8777, 127, 0.15)
  // Mumbai
];
const ASIA_CITIES = [
  ...generateCityPoints(22.3193, 114.1694, 91, 0.1),
  // Hong Kong
  ...generateCityPoints(39.9042, 116.4074, 91, 0.15),
  // Pechino
  ...generateCityPoints(31.2304, 121.4737, 90, 0.12)
  // Shanghai
];
const SPECIFIC_CITIES_COORDS = [
  ...ITALY_CITIES,
  // 99
  ...FRANCE_CITIES,
  // 125
  ...UK_IRELAND_CITIES,
  // 150
  ...SPAIN_CITIES,
  // 131
  ...GERMANY_CITIES,
  // 119
  ...NETHERLANDS_CROATIA_CITIES,
  // 87
  ...BUDAPEST_CITIES,
  // 203
  ...NEW_YORK_CITIES,
  // 327
  ...MIAMI_CITIES,
  // 50
  ...USA_OTHER_CITIES,
  // 123
  ...MEXICO_RIO_CITIES,
  // 191
  ...LATAM_OTHER_CITIES,
  // 51
  ...CANADA_CITIES,
  // 71
  ...SCANDINAVIA_CITIES,
  // 87
  ...MUMBAI_CITIES,
  // 127
  ...ASIA_CITIES
  // 272
];
const FICTITIOUS_AGENTS = generateFictitiousAgents();
function generateCityAgents() {
  const agents = [];
  const startIndex = 1019;
  SPECIFIC_CITIES_COORDS.forEach((coords, i) => {
    const [lat, lng] = coords;
    const globalIndex = startIndex + i;
    agents.push({
      id: `npc-city-${globalIndex}`,
      lat,
      lng,
      username: generateAgentName(globalIndex),
      agent_code: generateNPCCode(globalIndex),
      status: getRandomStatus(globalIndex),
      lastSeen: new Date(Date.now() - Math.random() * 864e5).toISOString(),
      rank_id: Math.floor(Math.random() * 5) + 1
    });
  });
  return agents;
}
const CITY_AGENTS = generateCityAgents();
const TOTAL_NPC_COUNT = FICTITIOUS_AGENTS.length + CITY_AGENTS.length;

const ALL_NPC_AGENTS = [...FICTITIOUS_AGENTS, ...CITY_AGENTS];
async function getLivePortals() {
  return [];
}
async function getLiveEvents() {
  return [];
}
async function getLiveAgents() {
  try {
    const { supabase } = await __vitePreload(async () => { const { supabase } = await import('./index.CUdqZWfi.js').then(n => n.cF);return { supabase }},true?__vite__mapDeps([0,1,2,3,4,5,6,7]):void 0);
    const { data: { session } } = await supabase.auth.getSession();
    const { data: locations, error: locError } = await supabase.from("user_locations").select("user_id, lat, lng, accuracy, status, updated_at").not("lat", "is", null).not("lng", "is", null).order("updated_at", { ascending: false }).limit(100);
    let realAgents = [];
    if (!locError && locations && locations.length > 0) {
      const userIds = locations.map((l) => l.user_id);
      let profiles = null;
      let profileError = null;
      const { data: viewData, error: viewError } = await supabase.from("public_profiles").select("id, agent_code, nickname, rank_id").in("id", userIds);
      if (viewError) {
        const { data: tableData, error: tableError } = await supabase.from("profiles").select("id, agent_code, nickname, full_name, rank_id").in("id", userIds);
        if (tableError) {
        } else {
          profiles = tableData;
        }
      } else {
        profiles = viewData;
      }
      const profileMap = new Map(
        profiles?.map((p) => [
          p.id,
          {
            // 🔧 FIX: Use nickname OR full_name from profiles
            nickname: p.nickname || p.full_name,
            agent_code: p.agent_code,
            rank_id: p.rank_id
          }
        ]) || []
      );
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1e3).toISOString();
      realAgents = locations.map((row) => {
        const profile = profileMap.get(row.user_id);
        const isRecent = row.updated_at && row.updated_at > fifteenMinutesAgo;
        const finalUsername = profile?.nickname || profile?.agent_code || "Agent";
        return {
          id: row.user_id,
          lat: row.lat,
          lng: row.lng,
          // 🔧 FIX: Use nickname from public_profiles (full_name not exposed in VIEW)
          username: finalUsername,
          status: isRecent ? "online" : "offline",
          lastSeen: row.updated_at,
          agent_code: profile?.agent_code,
          rank_id: profile?.rank_id
        };
      });
    }
    const allAgents = [...realAgents, ...ALL_NPC_AGENTS];
    return allAgents;
  } catch (e) {
    return [...ALL_NPC_AGENTS];
  }
}
async function getControlZones() {
  return [];
}
function onPortalsChanged(callback) {
  return () => {
  };
}
function onEventsChanged(callback) {
  return () => {
  };
}
function onAgentsChanged(callback) {
  let channelCleanup = null;
  (async () => {
    try {
      const { supabase } = await __vitePreload(async () => { const { supabase } = await import('./index.CUdqZWfi.js').then(n => n.cF);return { supabase }},true?__vite__mapDeps([0,1,2,3,4,5,6,7]):void 0);
      const channel = supabase.channel("user-locations-live").on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "user_locations"
      }, async () => {
        const agents = await getLiveAgents();
        callback(agents);
      }).subscribe();
      channelCleanup = () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
    }
  })();
  return () => {
    if (channelCleanup) {
      channelCleanup();
    }
  };
}

function useLiveLayers(enabled = true) {
  const [state, setState] = reactExports.useState({
    portals: [],
    events: [],
    agents: [],
    zones: [],
    loading: true
  });
  const throttleRef = reactExports.useRef({});
  const throttledUpdate = reactExports.useCallback((key, updateFn) => {
    const now = Date.now();
    const lastUpdate = throttleRef.current[key] || 0;
    if (now - lastUpdate > 250) {
      throttleRef.current[key] = now;
      updateFn();
    }
  }, []);
  reactExports.useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    Promise.all([
      getLivePortals(),
      getLiveEvents(),
      getLiveAgents(),
      getControlZones()
    ]).then(([portals, events, agents, zones]) => {
      if (mounted) {
        setState({
          portals,
          events,
          agents,
          zones,
          loading: false
        });
      }
    });
    const unsubPortals = onPortalsChanged();
    const unsubEvents = onEventsChanged();
    const unsubAgents = onAgentsChanged((agents) => {
      if (mounted) {
        throttledUpdate("agents", () => {
          setState((prev) => ({ ...prev, agents }));
        });
      }
    });
    return () => {
      mounted = false;
      unsubPortals();
      unsubEvents();
      unsubAgents();
    };
  }, [enabled, throttledUpdate]);
  return state;
}

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] +
        '-' +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] +
        '-' +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] +
        '-' +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] +
        '-' +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]).toLowerCase();
}

let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
    if (!getRandomValues) {
        if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
            throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
        }
        getRandomValues = crypto.getRandomValues.bind(crypto);
    }
    return getRandomValues(rnds8);
}

const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
const native = { randomUUID };

function v4(options, buf, offset) {
    if (native.randomUUID && true && !options) {
        return native.randomUUID();
    }
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    return unsafeStringify(rnds);
}

function safeLatLng(e) {
  try {
    const ll = e?.latlng;
    if (ll && Number.isFinite(ll.lat) && Number.isFinite(ll.lng)) {
      return { lat: ll.lat, lng: ll.lng };
    }
  } catch {
  }
  return null;
}

function useSearchAreasLogic(defaultLocation) {
  const DEV_MOCKS = false;
  const [storageAreas, setStorageAreas] = useLocalStorage("map-search-areas", []);
  const [searchAreas, setSearchAreas] = reactExports.useState([]);
  const [activeSearchArea, setActiveSearchArea] = reactExports.useState(null);
  const [isAddingSearchArea, setIsAddingSearchArea] = reactExports.useState(false);
  const pendingRadiusRef = reactExports.useRef(500);
  const [searchAreasThisWeek, setSearchAreasThisWeek] = reactExports.useState(0);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const forceReloadAreas = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id) {
        setSearchAreas(storageAreas || []);
        setIsLoading(false);
        return;
      }
      const { data: areasData, error } = await supabase.from("search_areas").select("*").eq("user_id", sessionData.session.user.id).order("created_at", { ascending: false });
      if (error) {
        setSearchAreas(storageAreas || []);
        setIsLoading(false);
        return;
      }
      if (areasData && areasData.length > 0) {
        const areas = areasData.map((area) => ({
          id: area.id,
          lat: area.lat,
          lng: area.lng,
          radius: area.radius,
          label: area.label || `Area di ricerca`,
          position: { lat: area.lat, lng: area.lng },
          color: "#00f0ff"
        }));
        setSearchAreas(areas);
        setSearchAreasThisWeek(areasData.length);
      } else {
        setSearchAreas([]);
      }
    } catch (error) {
      setSearchAreas(storageAreas || []);
    } finally {
      setIsLoading(false);
    }
  };
  reactExports.useEffect(() => {
    forceReloadAreas();
  }, []);
  reactExports.useEffect(() => {
    const handleMissionReset = () => {
      setSearchAreas([]);
      setStorageAreas([]);
      setActiveSearchArea(null);
      setSearchAreasThisWeek(0);
      try {
        localStorage.removeItem("map-search-areas");
      } catch (e) {
      }
    };
    window.addEventListener("missionLaunched", handleMissionReset);
    window.addEventListener("missionReset", handleMissionReset);
    window.addEventListener("mission:reset", handleMissionReset);
    return () => {
      window.removeEventListener("missionLaunched", handleMissionReset);
      window.removeEventListener("missionReset", handleMissionReset);
      window.removeEventListener("mission:reset", handleMissionReset);
    };
  }, [setStorageAreas]);
  reactExports.useEffect(() => {
    if (!isLoading && searchAreas.length >= 0) {
      setStorageAreas(searchAreas);
    }
  }, [searchAreas, setStorageAreas, isLoading]);
  const calculateRadius = () => {
    const baseRadius = 1e5;
    const decreaseFactor = Math.pow(0.95, searchAreasThisWeek);
    const calculatedRadius = Math.max(5e3, baseRadius * decreaseFactor);
    return calculatedRadius;
  };
  const handleAddArea = (radius) => {
    const calculatedRadius = radius || calculateRadius();
    pendingRadiusRef.current = calculatedRadius;
    setIsAddingSearchArea(true);
    ue.info("Clicca sulla mappa per aggiungere una nuova area di ricerca", {
      description: `L'area sarà creata con il raggio di ${(pendingRadiusRef.current / 1e3).toFixed(1)} km`
    });
  };
  const handleMapClickArea = async (e) => {
    if (!isAddingSearchArea) {
      return;
    }
    const ll = safeLatLng(e);
    if (!ll) {
      return;
    }
    try {
      const lat = ll.lat;
      const lng = ll.lng;
      const radius = pendingRadiusRef.current;
      if (false) ;
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        if (DEV_MOCKS) ;
        ue.error("Utente non autenticato");
        setIsAddingSearchArea(false);
        return;
      }
      const userId = sessionData.session.user.id;
      const newArea = {
        id: v4(),
        lat,
        lng,
        radius,
        label: `Area di ricerca ${searchAreasThisWeek + 1}`,
        color: "#00f0ff",
        position: { lat, lng }
      };
      const { data, error } = await supabase.from("search_areas").insert({
        user_id: userId,
        lat,
        lng,
        radius,
        label: newArea.label
      }).select().single();
      if (error) {
        if (DEV_MOCKS) ;
        ue.error("Si è verificato un errore nel salvare l'area di ricerca");
        setIsAddingSearchArea(false);
        return;
      }
      if (data) newArea.id = data.id;
      setSearchAreasThisWeek((prev) => prev + 1);
      setSearchAreas((prevAreas) => [...prevAreas, newArea]);
      setActiveSearchArea(newArea.id);
      setIsAddingSearchArea(false);
      ue.success("Area di ricerca aggiunta alla mappa", { description: `Raggio: ${(radius / 1e3).toFixed(1)} km` });
      setTimeout(() => {
        forceReloadAreas();
      }, 500);
    } catch (error) {
      setIsAddingSearchArea(false);
      ue.error("Si è verificato un errore nell'aggiunta dell'area");
    }
  };
  const saveSearchArea = (id, label, radius) => {
    setSearchAreas(searchAreas.map(
      (area) => area.id === id ? { ...area, label, radius } : area
    ));
    ue.success("Area di ricerca aggiornata");
  };
  const deleteSearchArea = async (id) => {
    try {
      const { error } = await supabase.from("search_areas").delete().eq("id", id);
      if (error) {
        if (DEV_MOCKS) ;
        ue.error("Errore nell'eliminare l'area di ricerca");
        return false;
      }
      setSearchAreas((prevAreas) => {
        const filteredAreas = prevAreas.filter((area) => area.id !== id);
        return filteredAreas;
      });
      if (activeSearchArea === id) {
        setActiveSearchArea(null);
      }
      ue.success("Area di ricerca rimossa");
      setTimeout(() => {
        forceReloadAreas();
      }, 300);
      return true;
    } catch (error) {
      ue.error("Errore nell'eliminare l'area di ricerca");
      return false;
    }
  };
  const clearAllSearchAreas = () => {
    setSearchAreas([]);
    setActiveSearchArea(null);
    ue.success("Tutte le aree di ricerca sono state rimosse");
  };
  const toggleAddingSearchArea = () => {
    setIsAddingSearchArea((prev) => !prev);
    if (!isAddingSearchArea) {
      const radius = calculateRadius();
      pendingRadiusRef.current = radius;
      ue.info(`Clicca sulla mappa per creare un'area di ricerca (raggio: ${(radius / 1e3).toFixed(1)}km)`);
    }
  };
  const createAreaDirect = async (radius, lat, lng) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        if (DEV_MOCKS) ;
        ue.error("Utente non autenticato");
        return;
      }
      const userId = sessionData.session.user.id;
      const newArea = {
        id: v4(),
        lat,
        lng,
        radius,
        label: `Area di ricerca ${searchAreasThisWeek + 1}`,
        color: "#00f0ff",
        position: { lat, lng }
      };
      const { data, error } = await supabase.from("search_areas").insert({
        user_id: userId,
        lat,
        lng,
        radius,
        label: newArea.label
      }).select().single();
      if (error) {
        if (DEV_MOCKS) ;
        ue.error("Si è verificato un errore nel salvare l'area di ricerca");
        return;
      }
      if (data) newArea.id = data.id;
      setSearchAreasThisWeek((prev) => prev + 1);
      setSearchAreas((prevAreas) => [...prevAreas, newArea]);
      setActiveSearchArea(newArea.id);
      setTimeout(() => {
        forceReloadAreas();
      }, 500);
    } catch (error) {
      ue.error("Si è verificato un errore nell'aggiunta dell'area");
    }
  };
  return {
    searchAreas,
    setSearchAreas,
    activeSearchArea,
    setActiveSearchArea,
    isAddingSearchArea,
    setIsAddingSearchArea,
    handleAddArea,
    handleMapClickArea,
    saveSearchArea,
    deleteSearchArea,
    clearAllSearchAreas,
    toggleAddingSearchArea,
    isLoading,
    forceReloadAreas,
    // Export for manual refresh
    createAreaDirect,
    // 🔥 NEW: Direct creation to prevent double area bug
    setPendingRadius: (radius) => {
      pendingRadiusRef.current = radius;
    }
  };
}

function useMapMarkersLogic() {
  const [storageMarkers, setStorageMarkers] = useLocalStorage("map-markers", []);
  const [markers, setMarkers] = reactExports.useState(storageMarkers || []);
  const [activeMarker, setActiveMarker] = reactExports.useState(null);
  const [isAddingMarker, setIsAddingMarker] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setStorageMarkers(markers);
  }, [markers, setStorageMarkers]);
  const handleAddMarker = () => {
    setIsAddingMarker(true);
    ue.info("Clicca sulla mappa per aggiungere un nuovo punto", {
      description: "Potrai aggiungere una nota al punto dopo averlo creato"
    });
  };
  const handleMapClickMarker = (e) => {
    if (isAddingMarker && e.latLng) {
      try {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const newMarker = {
          id: v4(),
          lat,
          lng,
          title: "",
          // Add the title property
          note: "",
          position: { lat, lng },
          createdAt: /* @__PURE__ */ new Date()
        };
        setMarkers((prev) => [...prev, newMarker]);
        setActiveMarker(newMarker.id);
        setIsAddingMarker(false);
        ue.success("Punto aggiunto alla mappa", {
          description: "Clicca sul punto per aggiungere una nota"
        });
      } catch (error) {
        setIsAddingMarker(false);
        ue.error("Si è verificato un errore durante l'aggiunta del punto");
      }
    }
  };
  const saveMarkerNote = (id, note) => {
    setMarkers(markers.map(
      (marker) => marker.id === id ? { ...marker, note, editing: false } : marker
    ));
    ue.success("Nota salvata");
  };
  const deleteMarker = (id) => {
    setMarkers(markers.filter((marker) => marker.id !== id));
    if (activeMarker === id) setActiveMarker(null);
    ue.success("Punto rimosso dalla mappa");
  };
  const editMarker = (id) => {
    setMarkers(markers.map(
      (marker) => marker.id === id ? { ...marker, editing: true } : marker
    ));
    setActiveMarker(id);
  };
  const clearAllMarkers = () => {
    if (confirm("Sei sicuro di voler eliminare tutti i punti?")) {
      setMarkers([]);
      setActiveMarker(null);
      ue.success("Tutti i punti sono stati rimossi");
    }
  };
  return {
    markers,
    setMarkers,
    activeMarker,
    setActiveMarker,
    isAddingMarker,
    setIsAddingMarker,
    handleAddMarker,
    handleMapClickMarker,
    saveMarkerNote,
    deleteMarker,
    editMarker,
    clearAllMarkers
  };
}

const AGENTS_SOURCE_ID = "m1-agents-source";
const AGENTS_GLOW_LAYER_ID = "m1-agents-glow-layer";
const AGENTS_LAYER_ID = "m1-agents-layer";
const ME_GLOW_LAYER_ID = "m1-me-glow-layer";
const ME_LAYER_ID = "m1-me-layer";
const ME_LABEL_LAYER_ID = "m1-me-label-layer";
const AgentsLayer3D = ({
  map,
  enabled,
  agents: agentsProp,
  mePosition,
  currentUserId,
  onAgentClick
}) => {
  const [agents, setAgents] = reactExports.useState([]);
  const sourceAddedRef = reactExports.useRef(false);
  const agentsMapRef = reactExports.useRef(/* @__PURE__ */ new Map());
  const augmentedAgents = reactExports.useMemo(() => {
    const result = [...agents];
    if (mePosition) {
      const myAgentIndex = currentUserId ? result.findIndex((a) => a.id === currentUserId) : -1;
      if (myAgentIndex >= 0) {
        result[myAgentIndex] = {
          ...result[myAgentIndex],
          lat: mePosition.lat,
          lng: mePosition.lng,
          status: "online",
          lastSeen: (/* @__PURE__ */ new Date()).toISOString()
        };
      } else {
        const existingMeIndex = result.findIndex((a) => a.id === "me-local");
        if (existingMeIndex >= 0) {
          result[existingMeIndex] = {
            ...result[existingMeIndex],
            lat: mePosition.lat,
            lng: mePosition.lng,
            status: "online",
            lastSeen: (/* @__PURE__ */ new Date()).toISOString()
          };
        } else {
          result.push({
            id: "me-local",
            lat: mePosition.lat,
            lng: mePosition.lng,
            username: "Tu",
            status: "online",
            lastSeen: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
    }
    return result;
  }, [agents, mePosition?.lat, mePosition?.lng, currentUserId]);
  reactExports.useEffect(() => {
    if (!enabled) return;
    if (agentsProp) {
      setAgents(agentsProp);
    } else {
      getLiveAgents().then(setAgents);
      const unsubscribe = onAgentsChanged(setAgents);
      return () => unsubscribe();
    }
  }, [enabled, agentsProp]);
  reactExports.useEffect(() => {
    agentsMapRef.current.clear();
    augmentedAgents.forEach((agent) => {
      agentsMapRef.current.set(agent.id, agent);
    });
  }, [augmentedAgents]);
  reactExports.useEffect(() => {
    if (!map || !enabled) return;
    const addLayers = () => {
      if (!map.isStyleLoaded()) {
        map.once("load", addLayers);
        return;
      }
      setupLayers();
    };
    const setupLayers = () => {
      const meId = currentUserId || "me-local";
      const otherAgents = augmentedAgents.filter((a) => a.id !== meId && a.id !== "me-local");
      const meAgent = augmentedAgents.find((a) => a.id === meId || a.id === "me-local");
      const otherAgentsGeoJSON = {
        type: "FeatureCollection",
        features: otherAgents.map((agent) => ({
          type: "Feature",
          id: agent.id,
          properties: {
            id: agent.id,
            username: agent.username || "Agent",
            status: agent.status,
            agent_code: agent.agent_code || ""
          },
          geometry: {
            type: "Point",
            coordinates: [agent.lng, agent.lat]
          }
        }))
      };
      const meGeoJSON = {
        type: "FeatureCollection",
        features: meAgent ? [{
          type: "Feature",
          id: meAgent.id,
          properties: {
            id: meAgent.id,
            username: "Tu",
            status: "online"
          },
          geometry: {
            type: "Point",
            coordinates: [meAgent.lng, meAgent.lat]
          }
        }] : []
      };
      const existingSource = map.getSource(AGENTS_SOURCE_ID);
      if (existingSource) {
        existingSource.setData(otherAgentsGeoJSON);
      } else {
        map.addSource(AGENTS_SOURCE_ID, {
          type: "geojson",
          data: otherAgentsGeoJSON
        });
      }
      const meSourceId = "m1-me-source";
      const existingMeSource = map.getSource(meSourceId);
      if (existingMeSource) {
        existingMeSource.setData(meGeoJSON);
      } else {
        map.addSource(meSourceId, {
          type: "geojson",
          data: meGeoJSON
        });
      }
      if (!map.getLayer(AGENTS_GLOW_LAYER_ID)) {
        map.addLayer({
          id: AGENTS_GLOW_LAYER_ID,
          type: "circle",
          source: AGENTS_SOURCE_ID,
          paint: {
            "circle-radius": 20,
            // Large touch area for mobile (invisible)
            "circle-color": "#FF3B30",
            "circle-opacity": 0.2,
            // Semi-transparent glow
            "circle-blur": 0.8
          }
        });
        map.addLayer({
          id: AGENTS_LAYER_ID,
          type: "circle",
          source: AGENTS_SOURCE_ID,
          paint: {
            "circle-radius": 5,
            // Small visual size (original)
            "circle-color": "#FF3B30",
            "circle-opacity": 1,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#FF6B60"
          }
        });
        map.addLayer({
          id: ME_GLOW_LAYER_ID,
          type: "circle",
          source: meSourceId,
          paint: {
            "circle-radius": 16,
            "circle-color": "#00E5FF",
            "circle-opacity": 0.4,
            "circle-blur": 1
          }
        });
        map.addLayer({
          id: ME_LAYER_ID,
          type: "circle",
          source: meSourceId,
          paint: {
            "circle-radius": 8,
            "circle-color": "#00E5FF",
            "circle-opacity": 1,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#FFFFFF"
          }
        });
        map.addLayer({
          id: ME_LABEL_LAYER_ID,
          type: "symbol",
          source: meSourceId,
          layout: {
            "text-field": "TU",
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 10,
            "text-offset": [0, 1.5],
            "text-anchor": "top"
          },
          paint: {
            "text-color": "#00E5FF",
            "text-halo-color": "#000000",
            "text-halo-width": 2
          }
        });
        sourceAddedRef.current = true;
      }
      const handleClick = (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const agentId = feature.properties?.id;
          if (agentId) {
            const agent = agentsMapRef.current.get(agentId);
            if (agent && onAgentClick) {
              onAgentClick(agent);
            }
          }
        }
      };
      const handleMouseEnter = () => {
        map.getCanvas().style.cursor = "pointer";
      };
      const handleMouseLeave = () => {
        map.getCanvas().style.cursor = "";
      };
      map.on("click", AGENTS_GLOW_LAYER_ID, handleClick);
      map.on("click", ME_GLOW_LAYER_ID, handleClick);
      map.on("click", AGENTS_LAYER_ID, handleClick);
      map.on("click", ME_LAYER_ID, handleClick);
      map.on("mouseenter", AGENTS_GLOW_LAYER_ID, handleMouseEnter);
      map.on("mouseleave", AGENTS_GLOW_LAYER_ID, handleMouseLeave);
      map.on("mouseenter", AGENTS_LAYER_ID, handleMouseEnter);
      map.on("mouseleave", AGENTS_LAYER_ID, handleMouseLeave);
      map.on("mouseenter", ME_LAYER_ID, handleMouseEnter);
      map.on("mouseleave", ME_LAYER_ID, handleMouseLeave);
    };
    addLayers();
    return () => {
      try {
        if (map && typeof map.off === "function") {
          map.off("load", addLayers);
          try {
            if (map.getLayer && map.getLayer(AGENTS_GLOW_LAYER_ID)) {
              map.off("click", AGENTS_GLOW_LAYER_ID);
              map.off("mouseenter", AGENTS_GLOW_LAYER_ID);
              map.off("mouseleave", AGENTS_GLOW_LAYER_ID);
            }
            if (map.getLayer && map.getLayer(ME_GLOW_LAYER_ID)) {
              map.off("click", ME_GLOW_LAYER_ID);
            }
            if (map.getLayer && map.getLayer(AGENTS_LAYER_ID)) {
              map.off("click", AGENTS_LAYER_ID);
              map.off("mouseenter", AGENTS_LAYER_ID);
              map.off("mouseleave", AGENTS_LAYER_ID);
            }
            if (map.getLayer && map.getLayer(ME_LAYER_ID)) {
              map.off("click", ME_LAYER_ID);
              map.off("mouseenter", ME_LAYER_ID);
              map.off("mouseleave", ME_LAYER_ID);
            }
          } catch (e) {
          }
        }
      } catch (e) {
      }
    };
  }, [map, augmentedAgents, enabled, currentUserId, onAgentClick]);
  reactExports.useEffect(() => {
    if (!map) return;
    return () => {
      try {
        if (!map || typeof map.getLayer !== "function") return;
        [ME_LABEL_LAYER_ID, ME_LAYER_ID, ME_GLOW_LAYER_ID, AGENTS_LAYER_ID, AGENTS_GLOW_LAYER_ID].forEach((layerId) => {
          try {
            if (map.getLayer(layerId)) {
              map.removeLayer(layerId);
            }
          } catch (e) {
          }
        });
        [AGENTS_SOURCE_ID, "m1-me-source"].forEach((sourceId) => {
          try {
            if (map.getSource(sourceId)) {
              map.removeSource(sourceId);
            }
          } catch (e) {
          }
        });
        sourceAddedRef.current = false;
      } catch (e) {
      }
    };
  }, [map]);
  reactExports.useEffect(() => {
    if (!map || !sourceAddedRef.current) return;
    const visibility = enabled ? "visible" : "none";
    [AGENTS_GLOW_LAYER_ID, AGENTS_LAYER_ID, ME_GLOW_LAYER_ID, ME_LAYER_ID, ME_LABEL_LAYER_ID].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visibility);
      }
    });
  }, [map, enabled]);
  return null;
};

const PORTALS_SEED = [
  { id: "p_tokyo", name: "Portal – Tokyo", lat: 35.6762, lng: 139.6503 },
  { id: "p_osaka", name: "Portal – Osaka", lat: 34.6937, lng: 135.5023 },
  { id: "p_hk", name: "Portal – Hong Kong", lat: 22.3193, lng: 114.1694 },
  { id: "p_bali", name: "Portal – Bali", lat: -8.3405, lng: 115.092 },
  { id: "p_png", name: "Portal – PNG", lat: -6.314993, lng: 143.95555 },
  { id: "p_madrid", name: "Portal – Madrid", lat: 40.4168, lng: -3.7038 },
  { id: "p_milan", name: "Portal – Milan", lat: 45.4642, lng: 9.19 },
  { id: "p_nice", name: "Portal – Nice", lat: 43.7102, lng: 7.262 },
  { id: "p_tripoli", name: "Portal – Tripoli", lat: 32.8872, lng: 13.1913 },
  { id: "p_dubai", name: "Portal – Dubai", lat: 25.2048, lng: 55.2708 },
  { id: "p_la", name: "Portal – LA", lat: 34.0522, lng: -118.2437 },
  { id: "p_reyk", name: "Portal – Reykjavik", lat: 64.1466, lng: -21.9426 }
];

const ECHO_LORE_FRAGMENTS = [
  '"The map remembers what you forgot."',
  '"Signal 7.26 was never decoded."',
  '"They built the grid before the city."',
  '"One prize was hidden twice."',
  '"The coordinates shift at midnight."'
];
const LOST_FREQUENCY_PUZZLES = [
  '"Decode this frequency." — Signal: 7.26.M1',
  '"What has keys but opens no locks?" — An old signal from ECHO.',
  '"I speak without a mouth. I hear without ears." — Interference pattern detected.',
  '"The more you take, the more you leave behind." — Shadow trace incomplete.'
];
const PORTAL_BEHAVIORS = [
  // ━━━━━━━━ 1. NICE — MCP PROTECTED ACCESS ━━━━━━━━
  {
    id: "p_nice",
    cityLabel: "Portal – Nice",
    type: "MCP_PROTECTED",
    requirement: {
      type: "buzz_count",
      minBuzz: 5,
      minBuzzMap: 1,
      label: "ACCESS LEVEL 04 REQUIRED"
    },
    dialogueUnlocked: [
      { entity: "MCP", lines: ["ACCESS LEVEL 04 CONFIRMED.", "Classified reward unlocked."] }
    ],
    dialogueLocked: [
      { entity: "MCP", lines: ["ACCESS LEVEL 04 REQUIRED.", "Only agents with sufficient activity may enter."] }
    ],
    reward: {
      type: "random",
      // +100 M1U OR 1 free clue
      amount: 100,
      label: "+100 M1U or 1 FREE CLUE",
      visualOnly: true
    },
    effects: { glitch: "light" }
  },
  // ━━━━━━━━ 2. MILAN — SHADOW RED ZONE ━━━━━━━━
  {
    id: "p_milan",
    cityLabel: "Portal – Milan",
    type: "SHADOW_RED_ZONE",
    dialogueUnlocked: [
      { entity: "SHADOW", lines: ["You should not be here, Agent."] }
    ],
    reward: {
      type: "hint",
      label: "+1 clue fragment detected...",
      visualOnly: true
    },
    effects: { glitch: "heavy" }
  },
  // ━━━━━━━━ 3. TRIPOLI — GEOGRAPHIC VORTEX ━━━━━━━━
  {
    id: "p_tripoli",
    cityLabel: "Portal – Tripoli",
    type: "GEO_VORTEX",
    dialogueUnlocked: [
      { entity: "MCP", lines: ["Geospatial anomaly detected.", "Re-aligning coordinates..."] }
    ],
    effects: { cameraSwirl: true, glitch: "light" }
  },
  // ━━━━━━━━ 4. MADRID — PULSE BREAKER (PLACEHOLDER) ━━━━━━━━
  {
    id: "p_madrid",
    cityLabel: "Portal – Madrid",
    type: "PULSE_BREAKER",
    dialogueUnlocked: [
      { entity: "MCP", lines: ["Pulse Breaker prototype.", "Full module coming soon."] }
    ],
    effects: { glitch: "light" }
  },
  // ━━━━━━━━ 5. REYKJAVIK — ECHO ARCHIVE ━━━━━━━━
  {
    id: "p_reyk",
    cityLabel: "Portal – Reykjavik",
    type: "ECHO_ARCHIVE",
    dialogueUnlocked: [
      { entity: "ECHO", lines: ["Accessing discontinued data fragments…"] }
    ],
    loreFragments: ECHO_LORE_FRAGMENTS,
    effects: { glitch: "light", audio: "static" }
  },
  // ━━━━━━━━ 6. DUBAI — SHADOW INTERFERENCE FIELD ━━━━━━━━
  {
    id: "p_dubai",
    cityLabel: "Portal – Dubai",
    type: "SHADOW_INTERFERENCE",
    dialogueUnlocked: [
      { entity: "SHADOW", lines: ["Signal compromised.", "Compensation granted."] }
    ],
    reward: {
      type: "m1u",
      amount: 20,
      label: "+20 M1U",
      visualOnly: true
    },
    effects: { glitch: "heavy" }
  },
  // ━━━━━━━━ 7. HONG KONG — GLOBAL GLITCH LOCKDOWN ━━━━━━━━
  {
    id: "p_hk",
    cityLabel: "Portal – Hong Kong",
    type: "GLOBAL_GLITCH_LOCKDOWN",
    dialogueUnlocked: [
      { entity: "SHADOW", lines: ["System lockdown initiated."] }
    ],
    effects: { glitch: "global", lockdown: 60 }
  },
  // ━━━━━━━━ 8. BALI — AGENT MIRROR ━━━━━━━━
  {
    id: "p_bali",
    cityLabel: "Portal – Bali",
    type: "AGENT_MIRROR",
    dialogueUnlocked: [
      { entity: "MCP", lines: ["Your path is unfolding.", "Observe carefully."] }
    ],
    effects: {}
  },
  // ━━━━━━━━ 9. OSAKA — THE LOST FREQUENCY ━━━━━━━━
  {
    id: "p_osaka",
    cityLabel: "Portal – Osaka",
    type: "LOST_FREQUENCY",
    dialogueUnlocked: [
      { entity: "SHADOW", lines: ["You shouldn't have tuned this frequency."] }
    ],
    puzzles: LOST_FREQUENCY_PUZZLES,
    effects: { glitch: "heavy", audio: "radio" }
  },
  // ━━━━━━━━ 10. PNG — GATEWAY TO MISSION ZERO ━━━━━━━━
  {
    id: "p_png",
    cityLabel: "Portal – Papua New Guinea",
    type: "GATEWAY_ZERO",
    dialogueUnlocked: [
      { entity: "MCP", lines: ["Gateway sealed. Protocol Zero pending."] },
      { entity: "SHADOW", lines: ["You're not ready."] }
    ],
    effects: { glitch: "heavy" }
  },
  // ━━━━━━━━ 11. LA — HOLLYWOOD GATE ━━━━━━━━
  {
    id: "p_la",
    cityLabel: "Portal – Los Angeles",
    type: "HOLLYWOOD_GATE",
    requirement: {
      type: "buzz_map_count",
      minBuzzMap: 19,
      label: "ACCESS LEVEL 19 REQUIRED"
    },
    dialogueUnlocked: [
      { entity: "MCP", lines: ["Hollywood Gate — Coming Soon."] }
    ],
    dialogueLocked: [
      { entity: "MCP", lines: ["ACCESS DENIED — Level 19 required.", "Create more BUZZ MAP areas to unlock."] }
    ],
    effects: { glitch: "light" }
  },
  // ━━━━━━━━ 12. TOKYO — SHADOW NEXUS ━━━━━━━━
  {
    id: "p_tokyo",
    cityLabel: "Portal – Tokyo",
    type: "SHADOW_NEXUS",
    dialogueUnlocked: [
      { entity: "SHADOW", lines: ["Convergence point detected."] },
      { entity: "ECHO", lines: ["...signals converge here...", "...be careful what you seek..."] }
    ],
    effects: { glitch: "heavy", audio: "static" }
  }
];
function getPortalBehavior(portalId) {
  return PORTAL_BEHAVIORS.find((p) => p.id === portalId);
}
function getRandomLoreFragment(portalId) {
  const config = getPortalBehavior(portalId);
  if (!config?.loreFragments?.length) return "";
  return config.loreFragments[Math.floor(Math.random() * config.loreFragments.length)];
}
function getRandomPuzzle(portalId) {
  const config = getPortalBehavior(portalId);
  if (!config?.puzzles?.length) return "";
  return config.puzzles[Math.floor(Math.random() * config.puzzles.length)];
}
function getRandomNiceReward() {
  const random = Math.random();
  if (random > 0.5) {
    return { type: "m1u", label: "+100 M1U" };
  }
  return { type: "clue", label: "1 FREE CLUE" };
}

const STORAGE_KEY_BUZZ_COUNT = "m1ssion_portal_buzz_count";
const STORAGE_KEY_BUZZ_MAP_COUNT = "m1ssion_portal_buzz_map_count";
function useActivityTracker() {
  const [buzzCount, setBuzzCount] = reactExports.useState(0);
  const [buzzMapCount, setBuzzMapCount] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const storedBuzz = localStorage.getItem(STORAGE_KEY_BUZZ_COUNT);
    const storedBuzzMap = localStorage.getItem(STORAGE_KEY_BUZZ_MAP_COUNT);
    if (storedBuzz) setBuzzCount(parseInt(storedBuzz, 10) || 0);
    if (storedBuzzMap) setBuzzMapCount(parseInt(storedBuzzMap, 10) || 0);
    const handleBuzz = () => {
      setBuzzCount((prev) => {
        const newVal = prev + 1;
        localStorage.setItem(STORAGE_KEY_BUZZ_COUNT, String(newVal));
        return newVal;
      });
    };
    const handleBuzzMap = () => {
      setBuzzMapCount((prev) => {
        const newVal = prev + 1;
        localStorage.setItem(STORAGE_KEY_BUZZ_MAP_COUNT, String(newVal));
        return newVal;
      });
    };
    window.addEventListener("buzzCompleted", handleBuzz);
    window.addEventListener("buzzAreaCreated", handleBuzzMap);
    return () => {
      window.removeEventListener("buzzCompleted", handleBuzz);
      window.removeEventListener("buzzAreaCreated", handleBuzzMap);
    };
  }, []);
  return { buzzCount, buzzMapCount };
}
const EntitySymbol = ({ entity }) => {
  const colors = {
    MCP: "#00E5FF",
    SHADOW: "#FF3366",
    ECHO: "#9966FF"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "portal-entity-symbol",
      style: {
        color: colors[entity],
        textShadow: `0 0 20px ${colors[entity]}`
      },
      children: [
        entity === "MCP" && /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 24 }),
        entity === "SHADOW" && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 24 }),
        entity === "ECHO" && /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { size: 24 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 font-mono text-sm", children: [
          entity,
          "://PORTAL"
        ] })
      ]
    }
  );
};
const DialogueDisplay = ({ dialogues, onComplete }) => {
  const [currentIndex, setCurrentIndex] = reactExports.useState(0);
  const [displayedText, setDisplayedText] = reactExports.useState("");
  const [isTyping, setIsTyping] = reactExports.useState(true);
  const currentDialogue = dialogues[currentIndex];
  const fullText = currentDialogue?.lines.join("\n") || "";
  reactExports.useEffect(() => {
    let index = 0;
    setDisplayedText("");
    setIsTyping(true);
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        if (currentIndex < dialogues.length - 1) {
          setTimeout(() => setCurrentIndex((prev) => prev + 1), 1200);
        } else if (onComplete) {
          setTimeout(onComplete, 400);
        }
      }
    }, 25);
    return () => clearInterval(timer);
  }, [currentIndex, fullText, dialogues.length, onComplete]);
  if (!currentDialogue) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-dialogue", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(EntitySymbol, { entity: currentDialogue.entity }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("pre", { className: "portal-dialogue-text", children: [
      displayedText,
      isTyping && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "portal-cursor", children: "▌" })
    ] })
  ] });
};
const LockdownTimer = ({ seconds, onComplete }) => {
  const [remaining, setRemaining] = reactExports.useState(seconds);
  reactExports.useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setRemaining((prev) => prev - 1), 1e3);
    return () => clearTimeout(timer);
  }, [remaining, onComplete]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-lockdown-timer", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "portal-lockdown-number", children: remaining }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "portal-lockdown-label", children: "SYSTEM LOCKDOWN" })
  ] });
};
const AgentMirrorPanel = ({ buzzCount, buzzMapCount }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-mirror-panel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-mirror-title", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 20, className: "mr-2" }),
      "AGENT MIRROR"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-mirror-stats", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-mirror-stat", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "portal-mirror-label", children: "BUZZ Actions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "portal-mirror-value", children: buzzCount })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-mirror-stat", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "portal-mirror-label", children: "BUZZ MAP Areas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "portal-mirror-value", children: buzzMapCount })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-mirror-stat", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "portal-mirror-label", children: "Estimated Rank" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "portal-mirror-value", children: [
          "Top ",
          Math.max(5, 100 - (buzzCount * 3 + buzzMapCount * 10)),
          "%"
        ] })
      ] })
    ] })
  ] });
};
const RewardDisplay = ({ reward, isRandom }) => {
  const [randomReward] = reactExports.useState(() => isRandom ? getRandomNiceReward() : null);
  const displayLabel = isRandom && randomReward ? randomReward.label : reward.label;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      className: "portal-reward",
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { delay: 0.3 },
      children: [
        isRandom ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 24, className: "portal-reward-icon" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { size: 24, className: "portal-reward-icon" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "portal-reward-label", children: displayLabel }),
        reward.visualOnly && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "portal-reward-note", children: "(Visual preview)" })
      ]
    }
  );
};
const PulseBreakerPlaceholder = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-placeholder", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "portal-placeholder-icon", children: "⚡" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "portal-placeholder-title", children: "PULSE BREAKER" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "portal-placeholder-text", children: "Prototype module detected." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "portal-placeholder-sub", children: "Full feature coming soon." })
  ] });
};
const HollywoodGatePlaceholder = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-placeholder hollywood", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "portal-placeholder-icon", children: "🎬" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "portal-placeholder-title", children: "HOLLYWOOD GATE" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "portal-placeholder-text", children: "Coming Soon." })
  ] });
};
const PortalBehaviorOverlay = ({
  portal,
  isVisible,
  onClose,
  mapRef
}) => {
  const { buzzCount, buzzMapCount } = useActivityTracker();
  const [phase, setPhase] = reactExports.useState("dialogue");
  const [isLocked, setIsLocked] = reactExports.useState(false);
  const [showReward, setShowReward] = reactExports.useState(false);
  const [loreFragment, setLoreFragment] = reactExports.useState("");
  const [puzzle, setPuzzle] = reactExports.useState("");
  const behavior = reactExports.useMemo(() => {
    if (!portal) return void 0;
    return getPortalBehavior(portal.id);
  }, [portal]);
  reactExports.useEffect(() => {
    if (isVisible && portal) {
      setPhase("dialogue");
      setShowReward(false);
    }
  }, [isVisible, portal]);
  reactExports.useEffect(() => {
    if (!behavior?.requirement) {
      setIsLocked(false);
      return;
    }
    const req = behavior.requirement;
    if (req.type === "buzz_count") {
      const needsBuzz = req.minBuzz || 5;
      const needsBuzzMap = req.minBuzzMap || 1;
      setIsLocked(buzzCount < needsBuzz || buzzMapCount < needsBuzzMap);
    } else if (req.type === "buzz_map_count") {
      const needsBuzzMap = req.minBuzzMap || 19;
      setIsLocked(buzzMapCount < needsBuzzMap);
    } else {
      setIsLocked(false);
    }
  }, [behavior, buzzCount, buzzMapCount]);
  reactExports.useEffect(() => {
    if (!portal || !isVisible) return;
    if (behavior?.type === "ECHO_ARCHIVE") {
      setLoreFragment(getRandomLoreFragment(portal.id));
    }
    if (behavior?.type === "LOST_FREQUENCY") {
      setPuzzle(getRandomPuzzle(portal.id));
    }
  }, [portal, behavior, isVisible]);
  reactExports.useEffect(() => {
    if (!isVisible || !behavior) return;
    if (behavior.effects.glitch === "heavy" || behavior.effects.glitch === "global") {
      document.body.classList.add("shadow-glitch-active");
      setTimeout(() => document.body.classList.remove("shadow-glitch-active"), 1500);
    }
    if (behavior.effects.cameraSwirl && mapRef?.current) {
      const map = mapRef.current;
      try {
        map.easeTo({
          bearing: 360,
          duration: 2e3,
          easing: (t) => t * (2 - t)
        });
        setTimeout(() => {
          map.easeTo({
            bearing: 0,
            duration: 1e3
          });
        }, 2e3);
      } catch (e) {
      }
    }
    if (behavior.effects.lockdown && behavior.type === "GLOBAL_GLITCH_LOCKDOWN") {
      setPhase("lockdown");
      document.body.classList.add("portal-lockdown-active");
    }
    return () => {
      document.body.classList.remove("shadow-glitch-active");
      document.body.classList.remove("portal-lockdown-active");
    };
  }, [isVisible, behavior, mapRef]);
  const handleDialogueComplete = reactExports.useCallback(() => {
    setPhase("content");
    if (behavior?.reward && !isLocked) {
      setTimeout(() => setShowReward(true), 400);
    }
  }, [behavior, isLocked]);
  const handleLockdownComplete = reactExports.useCallback(() => {
    document.body.classList.remove("portal-lockdown-active");
    setPhase("content");
    onClose();
  }, [onClose]);
  if (!isVisible || !portal || !behavior) return null;
  const dialogues = isLocked ? behavior.dialogueLocked : behavior.dialogueUnlocked;
  const portalColor = behavior.type.includes("SHADOW") || behavior.type === "GATEWAY_ZERO" ? "#FF3366" : behavior.type === "ECHO_ARCHIVE" ? "#9966FF" : "#00E5FF";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      className: "portal-behavior-overlay",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "portal-behavior-backdrop",
            onClick: phase !== "lockdown" ? onClose : void 0
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            className: "portal-behavior-modal",
            initial: { scale: 0.9, opacity: 0, y: 20 },
            animate: { scale: 1, opacity: 1, y: 0 },
            exit: { scale: 0.9, opacity: 0, y: 20 },
            transition: { duration: 0.3 },
            style: { borderColor: `${portalColor}40` },
            children: [
              phase !== "lockdown" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "portal-behavior-close", onClick: onClose, "aria-label": "Close", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-behavior-header", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "portal-behavior-icon", style: { borderColor: `${portalColor}50`, color: portalColor }, children: isLocked ? /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 24 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { size: 24 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "portal-behavior-title", style: { color: portalColor }, children: behavior.cityLabel }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "portal-behavior-type", children: behavior.type.replace(/_/g, " ") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-behavior-content", children: [
                phase === "lockdown" && behavior.effects.lockdown && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  LockdownTimer,
                  {
                    seconds: behavior.effects.lockdown,
                    onComplete: handleLockdownComplete
                  }
                ),
                phase === "dialogue" && dialogues && dialogues.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  DialogueDisplay,
                  {
                    dialogues,
                    onComplete: handleDialogueComplete
                  }
                ),
                phase === "content" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  behavior.type === "AGENT_MIRROR" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AgentMirrorPanel,
                    {
                      buzzCount,
                      buzzMapCount
                    }
                  ),
                  behavior.type === "ECHO_ARCHIVE" && loreFragment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-lore", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { size: 20, className: "portal-lore-icon" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "portal-lore-text", children: loreFragment })
                  ] }),
                  behavior.type === "LOST_FREQUENCY" && puzzle && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-puzzle", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 20, className: "portal-puzzle-icon" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "portal-puzzle-text", children: puzzle })
                  ] }),
                  behavior.type === "PULSE_BREAKER" && /* @__PURE__ */ jsxRuntimeExports.jsx(PulseBreakerPlaceholder, {}),
                  behavior.type === "HOLLYWOOD_GATE" && !isLocked && /* @__PURE__ */ jsxRuntimeExports.jsx(HollywoodGatePlaceholder, {}),
                  behavior.type === "GATEWAY_ZERO" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-sealed", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 28, className: "portal-sealed-icon" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Gateway remains sealed until Protocol Zero." })
                  ] }),
                  showReward && behavior.reward && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    RewardDisplay,
                    {
                      reward: behavior.reward,
                      isRandom: behavior.reward.type === "random"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "portal-behavior-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "portal-coords", children: [
                portal.lat.toFixed(4),
                ", ",
                portal.lng.toFixed(4)
              ] }) })
            ]
          }
        )
      ]
    }
  ) });
};

const MIN_ZOOM_FOR_PORTALS = 10;
const PortalsLayer3D = ({ map, enabled }) => {
  const [portals, setPortals] = reactExports.useState([]);
  const [selectedPortal, setSelectedPortal] = reactExports.useState(null);
  const [isZoomSufficient, setIsZoomSufficient] = reactExports.useState(false);
  const mapRef = reactExports.useRef(null);
  const markersRef = reactExports.useRef(/* @__PURE__ */ new Map());
  reactExports.useEffect(() => {
    mapRef.current = map;
  }, [map]);
  reactExports.useEffect(() => {
    if (!map) return;
    const checkZoom = () => {
      const zoom = map.getZoom();
      setIsZoomSufficient(zoom >= MIN_ZOOM_FOR_PORTALS);
    };
    checkZoom();
    map.on("zoom", checkZoom);
    return () => {
      try {
        map.off("zoom", checkZoom);
      } catch (e) {
      }
    };
  }, [map]);
  reactExports.useEffect(() => {
    if (!enabled) return;
    getLivePortals().then((livePortals) => {
      const seedPortals = PORTALS_SEED.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        name: p.name,
        status: "active",
        intensity: 75,
        lastUpdate: (/* @__PURE__ */ new Date()).toISOString()
      }));
      setPortals([...livePortals, ...seedPortals]);
    });
    const unsubscribe = onPortalsChanged();
    return () => unsubscribe();
  }, [enabled]);
  reactExports.useEffect(() => {
    if (!map || !enabled) return;
    if (!isZoomSufficient) {
      markersRef.current.forEach((marker) => {
        try {
          marker.getElement().style.display = "none";
        } catch (e) {
        }
      });
      return;
    }
    const currentPortalIds = new Set(portals.map((p) => p.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentPortalIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });
    portals.forEach((portal) => {
      const existingMarker = markersRef.current.get(portal.id);
      const behavior = getPortalBehavior(portal.id);
      const portalColor = behavior?.type === "SHADOW_RED_ZONE" || behavior?.type === "SHADOW_INTERFERENCE" || behavior?.type === "GATEWAY_ZERO" || behavior?.type === "LOST_FREQUENCY" ? "#FF3366" : behavior?.type === "ECHO_ARCHIVE" ? "#9966FF" : "#00f0ff";
      if (existingMarker) {
        existingMarker.setLngLat([portal.lng, portal.lat]);
        existingMarker.getElement().style.display = "block";
      } else {
        const el = document.createElement("div");
        el.className = "maplibre-portal-marker";
        el.style.cssText = `
          cursor: pointer;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${portalColor};
          box-shadow: 0 0 14px ${portalColor};
          border: 2px solid ${portalColor}40;
        `;
        el.title = portal.name;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedPortal(portal);
        });
        const marker = new maplibregl.Marker({
          element: el,
          anchor: "center"
        }).setLngLat([portal.lng, portal.lat]).addTo(map);
        markersRef.current.set(portal.id, marker);
      }
    });
    return () => {
      try {
        markersRef.current.forEach((marker) => {
          try {
            marker.remove();
          } catch (e) {
          }
        });
        markersRef.current.clear();
      } catch (e) {
      }
    };
  }, [map, portals, enabled, isZoomSufficient]);
  reactExports.useEffect(() => {
    const handlePortalEvent = (e) => {
      const { type, enabled: filterEnabled } = e.detail;
    };
    window.addEventListener("M1_PORTAL_FILTER", handlePortalEvent);
    return () => window.removeEventListener("M1_PORTAL_FILTER", handlePortalEvent);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    PortalBehaviorOverlay,
    {
      portal: selectedPortal,
      isVisible: !!selectedPortal,
      onClose: () => setSelectedPortal(null),
      mapRef
    }
  );
};

const useMarkerRewards = (markerId) => {
  const [rewards, setRewards] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!markerId) {
      setRewards([]);
      return;
    }
    const fetchRewards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: error2 } = await supabase.from("marker_rewards").select("reward_type, payload, description").eq("marker_id", markerId);
        if (error2) {
          throw error2;
        }
        setRewards(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setRewards([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRewards();
  }, [markerId]);
  return { rewards: Array.isArray(rewards) ? rewards : [], isLoading, error };
};

const ClaimRewardModal = ({
  isOpen,
  onClose,
  markerId,
  rewards: rawRewards,
  onSuccess
}) => {
  const rewards = Array.isArray(rawRewards) ? rawRewards : [];
  const [isClaiming, setIsClaiming] = reactExports.useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = reactExports.useState(false);
  const [claimedRewardType, setClaimedRewardType] = reactExports.useState("");
  const [claimedAmount, setClaimedAmount] = reactExports.useState(0);
  const triggerCelebration = (rewardType) => {
    const colors = rewardType === "m1u" ? ["#FFD700", "#FFA500"] : rewardType === "physical_prize" ? ["#FF1493", "#00D1FF"] : ["#00D1FF", "#FF1493"];
    confetti({
      particleCount: 50,
      // Ridotto da 100
      spread: 60,
      origin: { y: 0.6 },
      colors,
      disableForReducedMotion: true,
      // Rispetta preferenze utente
      gravity: 1.2,
      // Caduta più veloce
      decay: 0.95
      // Dissolvenza più rapida
    });
  };
  const getRewardIcon = (rewardType) => {
    switch (rewardType) {
      case "buzz_free":
        return "⚡";
      case "xp_points":
        return "🏆";
      case "message":
        return "📩";
      case "event_ticket":
        return "🎫";
      case "badge":
        return "🏅";
      case "m1u":
        return "💰";
      case "clue":
        return "🔍";
      case "physical_prize":
        return "🎁";
      default:
        return "🎁";
    }
  };
  const handleClaim = async () => {
    if (!markerId) {
      ue.error("Errore: marker non identificato");
      return;
    }
    setIsClaiming(true);
    try {
      const { data, error } = await supabase.functions.invoke("claim-marker-reward", { body: { markerId } });
      if (error?.status === 401) {
        setIsClaiming(false);
        ue.error("Sessione scaduta, effettua nuovamente il login");
        setTimeout(() => window.location.href = "/login", 1e3);
        return;
      }
      if (data?.ok === true) {
        const m1uEntry = data?.summary?.find((s) => s.type === "m1u");
        const serverM1U = m1uEntry?.info?.amount;
        const rewardType = data?.summary?.[0]?.type || rewards[0]?.reward_type?.toLowerCase() || "unknown";
        if (m1uEntry?.info?.error) {
          ue.error(`Errore M1U: ${m1uEntry.info.error}`);
        }
        setClaimedRewardType(rewardType);
        setClaimedAmount(serverM1U || rewards[0]?.payload?.amount || 50);
        setShowSuccessAnimation(true);
        triggerCelebration(rewardType);
        __vitePreload(async () => { const {trackMarkerRewardClaimed} = await import('./index.CUdqZWfi.js').then(n => n.cJ);return { trackMarkerRewardClaimed }},true?__vite__mapDeps([0,1,2,3,4,5,6,7]):void 0).then(({ trackMarkerRewardClaimed }) => {
          trackMarkerRewardClaimed(markerId, rewardType);
        }).catch(() => {
        });
        track("secondary_reward_won", {
          marker_id: markerId,
          reward_type: rewardType,
          amount: serverM1U || rewards[0]?.payload?.amount
        }, { immediate: true });
        setTimeout(() => {
          setShowSuccessAnimation(false);
          setIsClaiming(false);
          onClose?.();
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("m1u-balance-updated"));
          }, 100);
          if (rewardType === "buzz_free") {
            setTimeout(() => {
              window.location.href = "/buzz";
            }, 300);
          }
          notifyShadowContext("reward");
          onSuccess?.();
        }, 2500);
        return;
      }
      setIsClaiming(false);
      if (data?.code === "ALREADY_CLAIMED") {
        ue.info("Premio già riscattato in precedenza");
        onClose?.();
        return;
      }
      if (data?.code === "NO_REWARD") {
        ue.error("Nessuna ricompensa trovata per questo marker");
        return;
      }
      ue.error("Errore nel riscatto del premio");
    } catch (apiError) {
      setIsClaiming(false);
      ue.error("Errore di connessione, riprova");
    }
  };
  const SuccessAnimation = () => {
    const icon = claimedRewardType === "m1u" ? "💰" : claimedRewardType === "physical_prize" ? "🎁" : claimedRewardType === "buzz_free" ? "⚡" : claimedRewardType === "clue" ? "🔍" : claimedRewardType === "xp_points" ? "🏆" : "🎉";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-[10000] flex items-center justify-center bg-black",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center px-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-8xl mb-6", children: icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-4xl font-bold text-white mb-4", children: "PREMIO SBLOCCATO!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            claimedRewardType === "m1u" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-3xl font-bold text-[#FFD700]", children: [
              "+",
              claimedAmount,
              " M1U"
            ] }),
            claimedRewardType === "buzz_free" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-[#00D1FF]", children: "BUZZ Gratuito Sbloccato!" }),
            claimedRewardType === "physical_prize" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-[#FF1493]", children: "PREMIO SBLOCCATO!" }),
            claimedRewardType === "clue" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-[#00D1FF]", children: "Nuovo Indizio Trovato!" }),
            claimedRewardType === "xp_points" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-[#F59E0B]", children: [
              "+",
              claimedAmount || 10,
              " XP Guadagnati!"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 mt-6 text-sm", children: "Controlla le notifiche per i dettagli" })
          ] })
        ] })
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    showSuccessAnimation && /* @__PURE__ */ jsxRuntimeExports.jsx(SuccessAnimation, {}),
    isOpen && !showSuccessAnimation && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm",
          style: {
            pointerEvents: "auto",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh"
          },
          onClick: onClose
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "fixed inset-4 z-[9999] flex items-center justify-center",
          style: {
            pointerEvents: "auto",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "env(safe-area-inset-top, 16px) env(safe-area-inset-right, 16px) env(safe-area-inset-bottom, 16px) env(safe-area-inset-left, 16px)"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] border border-[#00D1FF]/30 rounded-2xl shadow-[0_0_50px_rgba(0,209,255,0.4)] backdrop-blur-xl relative overflow-hidden w-full max-w-md max-h-full overflow-y-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-[#00D1FF]/5 via-transparent to-[#FF1493]/5 rounded-2xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 text-center py-6 px-6 border-b border-[#00D1FF]/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl mb-2", children: "🛡️" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-white", children: "Premio Trovato!" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00D1FF] text-sm font-medium mt-1", children: "Hai scoperto un marker con premi speciali" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 space-y-6 p-6 max-h-[60vh] overflow-y-auto", children: [
              rewards.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl mb-4", children: "🔍" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/70 text-lg", children: "Caricamento premi in corso..." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/50 text-sm mt-2", children: "Se il problema persiste, prova a ricaricare la pagina" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: rewards.length > 0 && rewards.filter((reward) => {
                if (!reward.reward_type) {
                  return false;
                }
                if (reward.reward_type === "message") {
                  const message = reward.payload?.text || reward.description || "";
                  const cleanMessage = message.trim();
                  const isCorrupted = cleanMessage.length === 0 || cleanMessage.length === 1 || /^[^\w\s]*$/.test(cleanMessage) || ["", ",", "è", "Pè", "dsdf", "ciao", "M1", "m1"].includes(cleanMessage.toLowerCase());
                  if (isCorrupted) {
                    return false;
                  }
                }
                return true;
              }).slice(0, 3).map((reward, index) => {
                let displayDescription = reward.description;
                if (reward.reward_type === "message") {
                  const message = reward.payload?.text || reward.description || "";
                  const cleanMessage = message.trim();
                  if (!cleanMessage || cleanMessage.length < 2 || /^[^\w\s]*$/.test(cleanMessage)) {
                    displayDescription = "Premio messaggio speciale!";
                  } else {
                    displayDescription = cleanMessage;
                  }
                }
                return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative overflow-hidden rounded-xl bg-gradient-to-r from-[#00D1FF]/10 via-[#FF1493]/10 to-[#00D1FF]/10 border border-[#00D1FF]/30 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-gradient-to-br from-[#00D1FF]/30 to-[#FF1493]/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,209,255,0.3)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl filter drop-shadow-[0_0_8px_rgba(0,209,255,0.8)]", children: getRewardIcon(reward.reward_type) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white font-bold text-lg", children: reward.reward_type === "buzz_free" ? "BUZZ GRATUITO" : reward.reward_type === "xp_points" ? "PUNTI ESPERIENZA" : reward.reward_type === "message" ? "PREMIO MESSAGGIO" : reward.reward_type === "event_ticket" ? "BIGLIETTO EVENTO" : reward.reward_type === "badge" ? "DISTINTIVO" : reward.reward_type === "m1u" ? "CREDITI M1U" : reward.reward_type === "clue" ? "INDIZIO SEGRETO" : reward.reward_type === "physical_prize" ? "PREMIO FISICO" : displayDescription || `Premio ${reward.reward_type}` }),
                    reward.reward_type === "buzz_free" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#00D1FF] text-sm font-semibold", children: [
                      "+",
                      reward.payload?.buzzCount || 1,
                      " BUZZ gratuiti"
                    ] }),
                    reward.reward_type === "xp_points" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#00D1FF] text-sm font-semibold", children: [
                      "+",
                      reward.payload?.xp || 10,
                      " XP"
                    ] }),
                    reward.reward_type === "message" && displayDescription && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-300 text-sm", children: displayDescription }),
                    reward.reward_type === "event_ticket" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#00D1FF] text-sm font-semibold", children: [
                      "Tipo: ",
                      reward.payload?.ticket_type || "Standard"
                    ] }),
                    reward.reward_type === "badge" && displayDescription && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-300 text-sm", children: displayDescription }),
                    reward.reward_type === "m1u" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#FFD700] text-sm font-semibold", children: [
                      "+",
                      reward.payload?.amount || 50,
                      " M1U sul tuo conto"
                    ] }),
                    reward.reward_type === "clue" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00D1FF] text-sm font-semibold", children: "Indizio per la missione attiva" }),
                    reward.reward_type === "physical_prize" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#FF1493] text-sm font-semibold", children: [
                      "🎁 ",
                      reward.payload?.prize_name || "Premio speciale"
                    ] })
                  ] })
                ] }) }, index);
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 pt-6 border-t border-[#00D1FF]/20", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    onClick: onClose,
                    disabled: isClaiming,
                    className: "flex-1 border-gray-600 text-gray-300 hover:bg-gray-800/50 transition-all duration-300",
                    children: "Annulla"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: handleClaim,
                    disabled: isClaiming || rewards.length === 0,
                    className: "flex-1 bg-gradient-to-r from-[#00D1FF] to-[#FF1493] text-white font-bold hover:shadow-[0_0_30px_rgba(0,209,255,0.6)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
                    "data-testid": "claim-reward-cta",
                    children: isClaiming ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }),
                      "Riscattando..."
                    ] }) : rewards.length === 0 ? "Caricamento..." : "Riscatta subito"
                  }
                )
              ] })
            ] })
          ] })
        }
      )
    ] })
  ] });
};

const DEFAULT_MIN_ZOOM = 17;
const RewardsLayer3D = ({ map, enabled, markers = [], userPosition, isAdmin = false }) => {
  const [selectedMarker, setSelectedMarker] = reactExports.useState(null);
  const [currentZoom, setCurrentZoom] = reactExports.useState(0);
  const { rewards } = useMarkerRewards(selectedMarker);
  const markersRef = reactExports.useRef(/* @__PURE__ */ new Map());
  reactExports.useEffect(() => {
    if (!map) return;
    const updateZoom = () => {
      setCurrentZoom(map.getZoom());
    };
    updateZoom();
    map.on("zoom", updateZoom);
    return () => {
      try {
        map.off("zoom", updateZoom);
      } catch (e) {
      }
    };
  }, [map]);
  reactExports.useEffect(() => {
    if (!map || !enabled) return;
    const currentMarkerIds = new Set(markers.map((m) => m.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentMarkerIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });
    markers.forEach((rewardMarker) => {
      const markerMinZoom = rewardMarker.min_zoom || DEFAULT_MIN_ZOOM;
      const isVisible = rewardMarker.claimed || currentZoom >= markerMinZoom;
      const existingMarker = markersRef.current.get(rewardMarker.id);
      const markerColor = rewardMarker.claimed ? "#8B5CF6" : "#10b981";
      const markerSize = rewardMarker.claimed ? 18 : 22;
      if (existingMarker) {
        existingMarker.setLngLat([rewardMarker.lng, rewardMarker.lat]);
        const wrapper = existingMarker.getElement();
        const el = wrapper.querySelector(".maplibre-reward-marker");
        if (el) {
          el.style.width = `${markerSize}px`;
          el.style.height = `${markerSize}px`;
          el.style.background = markerColor;
          el.style.boxShadow = `0 0 12px 4px ${markerColor}ee, 0 0 24px 8px ${markerColor}88`;
          el.style.animation = rewardMarker.claimed ? "none" : "rewardPulse 1.5s ease-in-out infinite";
          el.title = rewardMarker.claimed ? `${rewardMarker.title || "Reward"} (Riscattato)` : rewardMarker.title || "Reward";
        }
        wrapper.style.display = isVisible ? "flex" : "none";
      } else {
        const el = document.createElement("div");
        el.className = "maplibre-reward-marker";
        el.style.cssText = `
          cursor: pointer;
          width: ${markerSize}px;
          height: ${markerSize}px;
          border-radius: 50%;
          background: ${markerColor};
          border: 3px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 12px 4px ${markerColor}ee, 0 0 24px 8px ${markerColor}88;
          display: ${isVisible ? "block" : "none"};
          ${!rewardMarker.claimed ? "animation: rewardPulse 1.5s ease-in-out infinite;" : ""}
        `;
        el.title = rewardMarker.claimed ? `${rewardMarker.title || "Reward"} (Riscattato)` : rewardMarker.title || "Reward";
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: manipulation;
        `;
        wrapper.appendChild(el);
        wrapper.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedMarker(rewardMarker.id);
        });
        wrapper.addEventListener("touchend", (e) => {
          e.stopPropagation();
          setSelectedMarker(rewardMarker.id);
        });
        const marker = new maplibregl.Marker({
          element: wrapper,
          anchor: "center"
        }).setLngLat([rewardMarker.lng, rewardMarker.lat]).addTo(map);
        markersRef.current.set(rewardMarker.id, marker);
      }
    });
    markersRef.current.forEach((marker, id) => {
      const rewardMarker = markers.find((m) => m.id === id);
      if (rewardMarker) {
        const markerMinZoom = rewardMarker.min_zoom || DEFAULT_MIN_ZOOM;
        const isVisible = rewardMarker.claimed || currentZoom >= markerMinZoom;
        marker.getElement().style.display = isVisible ? "block" : "none";
      }
    });
  }, [map, markers, enabled, currentZoom]);
  reactExports.useEffect(() => {
    return () => {
      try {
        markersRef.current.forEach((marker) => {
          try {
            marker.remove();
          } catch (e) {
          }
        });
        markersRef.current.clear();
      } catch (e) {
      }
    };
  }, []);
  if (!enabled) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes rewardPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      ` }),
    selectedMarker && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ClaimRewardModal,
      {
        isOpen: true,
        onClose: () => setSelectedMarker(null),
        markerId: selectedMarker,
        rewards: rewards || []
      }
    )
  ] });
};

const EARTH_RADIUS_KM = 6371;
function makeCircle(centerLng, centerLat, radiusKm, steps = 128) {
  const coords = [];
  const distRatio = radiusKm / EARTH_RADIUS_KM;
  const centerLatRad = centerLat * Math.PI / 180;
  const centerLngRad = centerLng * Math.PI / 180;
  for (let i = 0; i <= steps; i++) {
    const bearing = i / steps * 2 * Math.PI;
    const lat2 = Math.asin(
      Math.sin(centerLatRad) * Math.cos(distRatio) + Math.cos(centerLatRad) * Math.sin(distRatio) * Math.cos(bearing)
    );
    const lng2 = centerLngRad + Math.atan2(
      Math.sin(bearing) * Math.sin(distRatio) * Math.cos(centerLatRad),
      Math.cos(distRatio) - Math.sin(centerLatRad) * Math.sin(lat2)
    );
    coords.push([
      lng2 * 180 / Math.PI,
      lat2 * 180 / Math.PI
    ]);
  }
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coords]
    },
    properties: {
      center: [centerLng, centerLat],
      radiusKm
    }
  };
}

const AreasLayer3D = ({
  map,
  enabled,
  userAreas = [],
  searchAreas = [],
  onDeleteSearchArea,
  currentAreaVersion = "none"
}) => {
  const [tooltip, setTooltip] = reactExports.useState(null);
  const rafRef = reactExports.useRef(null);
  const initializedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    setTooltip(null);
  }, [userAreas]);
  reactExports.useEffect(() => {
    const handleBuzzCreated = () => {
      setTooltip(null);
    };
    window.addEventListener("buzzAreaCreated", handleBuzzCreated);
    return () => window.removeEventListener("buzzAreaCreated", handleBuzzCreated);
  }, []);
  reactExports.useEffect(() => {
    if (!map || !tooltip) return;
    const updateTooltipPosition = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const point = map.project([tooltip.lng, tooltip.lat]);
        setTooltip((prev) => prev ? { ...prev, screenX: point.x, screenY: point.y } : null);
      });
    };
    updateTooltipPosition();
    map.on("move", updateTooltipPosition);
    map.on("zoom", updateTooltipPosition);
    map.on("rotate", updateTooltipPosition);
    map.on("pitch", updateTooltipPosition);
    map.on("render", updateTooltipPosition);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      map.off("move", updateTooltipPosition);
      map.off("zoom", updateTooltipPosition);
      map.off("rotate", updateTooltipPosition);
      map.off("pitch", updateTooltipPosition);
      map.off("render", updateTooltipPosition);
    };
  }, [map, tooltip?.lat, tooltip?.lng]);
  reactExports.useEffect(() => {
    if (!map || !enabled || initializedRef.current) return;
    const initLayers = () => {
      if (!map.getSource("user-areas")) {
        map.addSource("user-areas", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] }
        });
      }
      if (!map.getLayer("user-areas-fill")) {
        map.addLayer({
          id: "user-areas-fill",
          type: "fill",
          source: "user-areas",
          paint: {
            "fill-color": "rgba(0,209,255,0.15)",
            "fill-opacity": 0.8
          }
        });
      }
      if (!map.getLayer("user-areas-border")) {
        map.addLayer({
          id: "user-areas-border",
          type: "line",
          source: "user-areas",
          paint: {
            "line-color": "#00D1FF",
            "line-width": 3,
            "line-opacity": 0.8
          }
        });
      }
      if (!map.getSource("search-areas")) {
        map.addSource("search-areas", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] }
        });
      }
      if (!map.getLayer("search-areas-fill")) {
        map.addLayer({
          id: "search-areas-fill",
          type: "fill",
          source: "search-areas",
          paint: {
            "fill-color": "rgba(123, 46, 255, 0.25)",
            // 🔥 FIX: More visible purple fill
            "fill-opacity": 0.8
          }
        });
      }
      if (!map.getLayer("search-areas-border")) {
        map.addLayer({
          id: "search-areas-border",
          type: "line",
          source: "search-areas",
          paint: {
            "line-color": "#7B2EFF",
            // 🔥 FIX: Bright purple border matching UI
            "line-width": 3,
            "line-opacity": 0.9
          }
        });
      }
      const urlParams = new URLSearchParams(window.location.search);
      const uaOnly = urlParams.has("uaOnly");
      if (uaOnly) {
        if (map.getLayer("search-areas-fill")) {
          map.setLayoutProperty("search-areas-fill", "visibility", "none");
        }
        if (map.getLayer("search-areas-border")) {
          map.setLayoutProperty("search-areas-border", "visibility", "none");
        }
      }
      if (map.getLayer("search-areas-fill")) {
        map.moveLayer("search-areas-fill");
      }
      if (map.getLayer("search-areas-border")) {
        map.moveLayer("search-areas-border");
      }
      if (map.getLayer("user-areas-fill")) {
        map.moveLayer("user-areas-fill");
      }
      if (map.getLayer("user-areas-border")) {
        map.moveLayer("user-areas-border");
      }
      if (urlParams.has("debug")) ;
      const handleUserAreaClick = (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties;
        const coords = feature.geometry.coordinates[0][0];
        const point = map.project(coords);
        setTooltip({
          id: props.id,
          type: "user",
          label: props.label || "Buzz Area",
          radius: props.radiusKm * 1e3,
          level: props.level,
          radius_km: props.radius_km,
          screenX: point.x,
          screenY: point.y,
          lat: coords[1],
          lng: coords[0]
        });
      };
      const handleSearchAreaClick = (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties;
        const coords = feature.geometry.coordinates[0][0];
        const point = map.project(coords);
        setTooltip({
          id: props.id,
          type: "search",
          label: props.label || "Search Area",
          radius: props.radiusKm * 1e3,
          screenX: point.x,
          screenY: point.y,
          lat: coords[1],
          lng: coords[0]
        });
      };
      map.on("click", "user-areas-fill", handleUserAreaClick);
      map.on("click", "search-areas-fill", handleSearchAreaClick);
      map.on("mouseenter", "user-areas-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "user-areas-fill", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", "search-areas-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "search-areas-fill", () => {
        map.getCanvas().style.cursor = "";
      });
      initializedRef.current = true;
    };
    if (map.loaded()) {
      initLayers();
    } else {
      map.once("load", initLayers);
    }
    return () => {
      initializedRef.current = false;
    };
  }, [map, enabled]);
  reactExports.useEffect(() => {
    if (!map || !initializedRef.current) {
      return;
    }
    const source = map.getSource("user-areas");
    if (!source) {
      return;
    }
    const features = userAreas.filter((area) => {
      const isValidLat = typeof area.lat === "number" && isFinite(area.lat) && Math.abs(area.lat) <= 90;
      const isValidLng = typeof area.lng === "number" && isFinite(area.lng) && Math.abs(area.lng) <= 180;
      if (!isValidLat || !isValidLng) {
        return false;
      }
      return true;
    }).map((area) => {
      const radiusMeters = Number.isFinite(area.radius) ? area.radius : Number.isFinite(area.radius_km) ? area.radius_km * 1e3 : NaN;
      if (!Number.isFinite(radiusMeters)) {
        return null;
      }
      const radiusKm = Number.isFinite(area.radius_km) ? area.radius_km : radiusMeters / 1e3;
      const circle = makeCircle(area.lng, area.lat, radiusKm);
      return {
        ...circle,
        properties: {
          ...circle.properties,
          id: area.id,
          label: area.label || "Buzz Area",
          radiusKm,
          // 🔥 Exact DB value
          radius_km: radiusKm,
          // 🔥 Exact DB value
          radiusMeters,
          // 🔥 Derived value
          level: area.level
        }
      };
    }).filter((feature) => feature !== null);
    if (features.length > 0) ;
    source.setData({ type: "FeatureCollection", features });
    if (features.length > 0) ;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("debug")) {
      const searchSource = map.getSource("search-areas");
      if (searchSource) {
        const searchData = searchSource._data || searchSource.serialize && searchSource.serialize().data;
        const searchFeats = searchData?.features || [];
        if (searchFeats.length > 0) ;
      }
    }
    if (features.length > 0) {
      try {
        if (map.getLayer("user-areas-fill")) {
          map.moveLayer("user-areas-fill");
        }
        if (map.getLayer("user-areas-border")) {
          map.moveLayer("user-areas-border");
        }
      } catch (e) {
      }
    }
  }, [map, currentAreaVersion]);
  reactExports.useEffect(() => {
    if (!map || !initializedRef.current) {
      return;
    }
    const source = map.getSource("search-areas");
    if (!source) {
      return;
    }
    const features = searchAreas.filter((area) => {
      const isValidLat = typeof area.lat === "number" && isFinite(area.lat) && Math.abs(area.lat) <= 90;
      const isValidLng = typeof area.lng === "number" && isFinite(area.lng) && Math.abs(area.lng) <= 180;
      const isValidRadius = typeof area.radius === "number" && isFinite(area.radius) && area.radius > 0;
      if (!isValidLat || !isValidLng || !isValidRadius) {
        return false;
      }
      return true;
    }).map((area) => {
      const radiusKm = area.radius / 1e3;
      const circle = makeCircle(area.lng, area.lat, radiusKm);
      return {
        ...circle,
        properties: {
          ...circle.properties,
          id: area.id,
          label: area.label || "Search Area",
          radiusKm,
          color: area.color || "#ff00ff"
        }
      };
    });
    source.setData({ type: "FeatureCollection", features });
    if (features.length > 0) {
      try {
        if (map.getLayer("search-areas-fill")) {
          map.setLayoutProperty("search-areas-fill", "visibility", "visible");
          map.moveLayer("search-areas-fill");
        }
        if (map.getLayer("search-areas-border")) {
          map.setLayoutProperty("search-areas-border", "visibility", "visible");
          map.moveLayer("search-areas-border");
        }
      } catch (e) {
      }
    }
  }, [map, searchAreas]);
  if (!enabled) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: tooltip && /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      style: {
        position: "absolute",
        left: tooltip.screenX,
        top: tooltip.screenY,
        transform: "translate(-50%, -120%)",
        background: "rgba(0, 0, 0, 0.85)",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.2)"
      },
      children: [
        tooltip.type === "user" && tooltip.level !== void 0 && tooltip.radius_km !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontWeight: "bold" }, children: [
          "Livello ",
          tooltip.level,
          " · ",
          Math.round(tooltip.radius_km),
          " km"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: "bold", marginBottom: "4px" }, children: tooltip.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "11px", opacity: 0.9 }, children: [
            "Radius: ",
            Math.round(tooltip.radius / 1e3),
            "km"
          ] })
        ] }),
        tooltip.type === "search" && onDeleteSearchArea && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              onDeleteSearchArea(tooltip.id);
              setTooltip(null);
            },
            style: {
              marginTop: "6px",
              padding: "4px 8px",
              background: "rgba(255, 0, 0, 0.8)",
              border: "none",
              borderRadius: "4px",
              color: "#fff",
              fontSize: "10px",
              cursor: "pointer",
              pointerEvents: "auto"
            },
            children: "Delete"
          }
        )
      ]
    }
  ) });
};

const RewardZoneLayer3D = ({ map, rewardZone, onDelete }) => {
  const [position, setPosition] = reactExports.useState(null);
  const sourceAdded = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!map || !rewardZone) {
      if (map && sourceAdded.current) {
        try {
          if (map.getLayer("reward-zone-fill")) map.removeLayer("reward-zone-fill");
          if (map.getLayer("reward-zone-outline")) map.removeLayer("reward-zone-outline");
          if (map.getLayer("reward-zone-pulse")) map.removeLayer("reward-zone-pulse");
          if (map.getSource("reward-zone-source")) map.removeSource("reward-zone-source");
          sourceAdded.current = false;
        } catch (e) {
        }
      }
      return;
    }
    const { lat, lng, radius } = rewardZone;
    const generateCircle = (centerLng, centerLat, radiusMeters, points = 64) => {
      const coords = [];
      for (let i = 0; i <= points; i++) {
        const angle = i / points * 2 * Math.PI;
        const dx = radiusMeters * Math.cos(angle);
        const dy = radiusMeters * Math.sin(angle);
        const newLat = centerLat + dy / 111320;
        const newLng = centerLng + dx / (111320 * Math.cos(centerLat * Math.PI / 180));
        coords.push([newLng, newLat]);
      }
      return coords;
    };
    const circleCoords = generateCircle(lng, lat, radius);
    const addLayers = () => {
      try {
        if (map.getLayer("reward-zone-fill")) map.removeLayer("reward-zone-fill");
        if (map.getLayer("reward-zone-outline")) map.removeLayer("reward-zone-outline");
        if (map.getLayer("reward-zone-pulse")) map.removeLayer("reward-zone-pulse");
        if (map.getSource("reward-zone-source")) map.removeSource("reward-zone-source");
        map.addSource("reward-zone-source", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [circleCoords]
            }
          }
        });
        map.addLayer({
          id: "reward-zone-fill",
          type: "fill",
          source: "reward-zone-source",
          paint: {
            "fill-color": "#10b981",
            "fill-opacity": 0.15
          }
        });
        map.addLayer({
          id: "reward-zone-outline",
          type: "line",
          source: "reward-zone-source",
          paint: {
            "line-color": "#10b981",
            "line-width": 3,
            "line-opacity": 0.8,
            "line-dasharray": [3, 2]
          }
        });
        sourceAdded.current = true;
      } catch (e) {
      }
    };
    if (map.isStyleLoaded()) {
      addLayers();
    } else {
      map.once("styledata", addLayers);
    }
    const updatePosition = () => {
      const point = map.project([lng, lat]);
      setPosition({ x: point.x, y: point.y });
    };
    updatePosition();
    map.on("move", updatePosition);
    map.on("zoom", updatePosition);
    return () => {
      map.off("move", updatePosition);
      map.off("zoom", updatePosition);
    };
  }, [map, rewardZone]);
  if (!rewardZone || !position) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "absolute z-[700] pointer-events-auto",
        style: {
          left: `${position.x}px`,
          top: `${position.y - 60}px`,
          transform: "translateX(-50%)"
        },
        initial: { opacity: 0, y: 20, scale: 0.8 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -20, scale: 0.8 },
        transition: { duration: 0.3, delay: 0.5 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-2 px-3 py-2 rounded-full",
            style: {
              background: "rgba(16, 185, 129, 0.9)",
              boxShadow: "0 4px 20px rgba(16, 185, 129, 0.5)",
              backdropFilter: "blur(8px)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-4 h-4 text-white" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white text-xs font-bold", children: "REWARD ZONE" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    onDelete();
                  },
                  className: "ml-1 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors",
                  title: "Rimuovi zona",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3 text-white" })
                }
              )
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "fixed bottom-32 left-4 right-4 z-[700] pointer-events-auto",
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
        transition: { duration: 0.3, delay: 1 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "max-w-sm mx-auto p-3 rounded-xl flex items-center gap-3",
            style: {
              background: "rgba(0, 0, 0, 0.85)",
              border: "1px solid rgba(16, 185, 129, 0.5)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  style: { background: "rgba(16, 185, 129, 0.2)" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-5 h-5 text-emerald-400" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white text-sm font-medium", children: "Il marker si trova in questa zona!" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/60 text-xs", children: [
                  "Zoom a 17+ per vederlo • Area ",
                  rewardZone.radius * 2,
                  "m"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onDelete,
                  className: "p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-white/70" })
                }
              )
            ]
          }
        )
      }
    )
  ] });
};

function useCountryDomination() {
  const [dominationStates, setDominationStates] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const fetchDominationStates = reactExports.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: rpcError } = await supabase.rpc("get_country_domination_state");
      if (rpcError) {
        const { data: fallbackData, error: fallbackError } = await supabase.from("country_domination").select(`
            country_code,
            owner_id,
            win_progress,
            conquest_threshold,
            status,
            conquered_at
          `).in("status", ["contested", "conquered"]);
        if (fallbackError) {
          throw fallbackError;
        }
        const ownerIds = (fallbackData || []).filter((d) => d.owner_id).map((d) => d.owner_id);
        let ownerMap = {};
        if (ownerIds.length > 0) {
          const { data: profiles } = await supabase.from("public_profiles").select("id, full_name, agent_code, nickname").in("id", ownerIds);
          profiles?.forEach((p) => {
            ownerMap[p.id] = {
              full_name: p.full_name || p.nickname || "Unknown",
              agent_code: p.agent_code
            };
          });
        }
        const mappedData = (fallbackData || []).map((d) => ({
          country_code: d.country_code,
          owner_id: d.owner_id,
          owner_name: d.owner_id ? ownerMap[d.owner_id]?.full_name || "Unknown" : null,
          owner_agent_code: d.owner_id ? ownerMap[d.owner_id]?.agent_code || null : null,
          win_progress: d.win_progress,
          conquest_threshold: d.conquest_threshold,
          status: d.status,
          conquered_at: d.conquered_at
        }));
        setDominationStates(mappedData);
      } else {
        setDominationStates(data || []);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch domination state");
      setDominationStates([]);
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchDominationStates();
  }, [fetchDominationStates]);
  reactExports.useEffect(() => {
    const channel = supabase.channel("country-domination-changes").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "country_domination"
    }, () => {
      fetchDominationStates();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDominationStates]);
  const conqueredCountries = dominationStates.filter((s) => s.status === "conquered").map((s) => s.country_code);
  const contestedCountries = dominationStates.filter((s) => s.status === "contested").map((s) => s.country_code);
  return {
    dominationStates,
    conqueredCountries,
    contestedCountries,
    loading,
    error,
    refresh: fetchDominationStates
  };
}

const SOURCE_ID = "country-domination-source";
const LABEL_SOURCE_ID = "domination-labels-source";
const CONTESTED_FILL_LAYER = "country-domination-contested-fill";
const LABEL_LAYER = "country-domination-label";
const ADMIN_OWNER_ID = "495246c1-9154-4f01-a428-7f37fe230180";
const COUNTRY_CENTROIDS = {
  // MICROSTATI
  MC: [7.4, 43.7],
  VA: [12.5, 41.9],
  SM: [12.4, 43.9],
  LI: [9.5, 47.2],
  AD: [1.5, 42.5],
  MT: [14.4, 35.9],
  LU: [6.1, 49.8],
  SG: [103.8, 1.4],
  HK: [114.2, 22.3],
  MO: [113.5, 22.2],
  // EUROPA
  IT: [12.5, 42.5],
  FR: [2.2, 46.2],
  DE: [10.4, 51.2],
  ES: [-3.7, 40.4],
  PT: [-8.2, 39.4],
  GB: [-1.2, 52.4],
  NL: [5.3, 52.1],
  BE: [4.5, 50.5],
  AT: [14.6, 47.5],
  CH: [8.2, 46.8],
  PL: [19.1, 51.9],
  CZ: [15.5, 49.8],
  HU: [19.5, 47.2],
  RO: [25, 46],
  GR: [21.8, 39.1],
  SE: [18.6, 60.1],
  NO: [8.5, 60.5],
  DK: [9.5, 56.3],
  FI: [26, 64],
  IE: [-8.2, 53.4],
  SI: [14.8, 46.1],
  HR: [15.5, 45.2],
  BA: [17.8, 43.9],
  RS: [21, 44],
  ME: [19.3, 42.7],
  XK: [20.9, 42.6],
  AL: [20, 41],
  MK: [21.7, 41.5],
  EE: [25, 59],
  LV: [24.6, 57],
  LT: [24, 55.2],
  CY: [33.4, 35.1],
  SK: [19.5, 48.7],
  IS: [-19, 65],
  MD: [28.8, 47],
  BY: [27.9, 53.7],
  BG: [25.5, 42.7],
  UA: [31.2, 48.4],
  RU: [105.3, 61.5],
  // AMERICHE
  US: [-98.6, 39.8],
  CA: [-106.3, 56.1],
  MX: [-102.5, 23.6],
  BR: [-51.9, -14.2],
  AR: [-63.6, -38.4],
  CL: [-71.5, -35.7],
  CO: [-74.3, 4.6],
  VE: [-66.6, 6.4],
  PE: [-75, -9.2],
  EC: [-78.2, -1.8],
  BO: [-65, -17],
  PY: [-58.4, -23.4],
  UY: [-55.8, -32.5],
  CU: [-77.8, 21.5],
  DO: [-70.2, 18.7],
  HT: [-72.3, 19],
  JM: [-77.3, 18.1],
  PR: [-66.6, 18.2],
  GT: [-90.2, 15.8],
  BZ: [-88.5, 17.2],
  HN: [-86.2, 15],
  SV: [-88.9, 13.8],
  NI: [-85.2, 12.9],
  CR: [-84, 9.7],
  PA: [-80.8, 8.4],
  // ASIA
  CN: [104.2, 35.9],
  JP: [138.3, 36.2],
  KR: [128, 36],
  KP: [127.5, 40.3],
  TW: [121, 23.7],
  IN: [78.9, 20.6],
  PK: [69.3, 30.4],
  BD: [90.4, 23.7],
  NP: [84.1, 28.4],
  LK: [80.8, 7.9],
  MM: [96, 21.9],
  TH: [100.5, 15.9],
  VN: [108.3, 14.1],
  MY: [101.7, 4.2],
  ID: [113.9, -0.8],
  PH: [121.8, 12.9],
  MN: [103.8, 46.9],
  KZ: [66.9, 48],
  // MEDIO ORIENTE
  IL: [35, 31.5],
  LB: [35.8, 33.9],
  JO: [36.2, 31.2],
  QA: [51.2, 25.4],
  KW: [47.5, 29.3],
  AE: [53.8, 23.4],
  OM: [55.9, 21.5],
  SA: [45.1, 23.9],
  IR: [53.7, 32.4],
  IQ: [43.7, 33.2],
  SY: [38.9, 35],
  YE: [48.5, 15.6],
  AF: [67.7, 33.9],
  TR: [35.2, 38.9],
  // AFRICA
  MA: [-7.1, 31.8],
  DZ: [1.7, 28],
  TN: [9.5, 34],
  LY: [17.2, 26.3],
  EG: [30.8, 26.8],
  ZA: [22.9, -30.6],
  NG: [8.7, 9.1],
  KE: [38, -0],
  ET: [40.5, 9.1],
  TZ: [34.9, -6.4],
  GH: [-1, 7.9],
  SN: [-14.5, 14.5],
  CI: [-5.5, 7.5],
  CM: [12.4, 6],
  // OCEANIA
  AU: [133.8, -25.3],
  NZ: [174.9, -40.9]
};
function generateOwnerColor(ownerId) {
  if (!ownerId || ownerId === ADMIN_OWNER_ID) {
    return "#00FF00";
  }
  let hash = 0;
  for (let i = 0; i < ownerId.length; i++) {
    hash = (hash << 5) - hash + ownerId.charCodeAt(i);
    hash = hash & hash;
  }
  let hue = Math.abs(hash) % 320;
  if (hue >= 100) hue += 40;
  return `hsl(${hue}, 100%, 50%)`;
}
const CountryDominationLayer3D = ({
  map,
  enabled = true,
  minZoom = 4
}) => {
  const { dominationStates, contestedCountries } = useCountryDomination();
  const geoJsonCacheRef = reactExports.useRef(null);
  const checkIntervalRef = reactExports.useRef(null);
  const addedLayersRef = reactExports.useRef(/* @__PURE__ */ new Set());
  const conqueredByOwner = reactExports.useMemo(() => {
    const grouped = {};
    dominationStates.filter((s) => s.status === "conquered").forEach((s) => {
      const ownerId = s.owner_id || "unknown";
      if (!grouped[ownerId]) {
        grouped[ownerId] = {
          countries: [],
          color: generateOwnerColor(s.owner_id)
        };
      }
      grouped[ownerId].countries.push(s.country_code);
    });
    return grouped;
  }, [dominationStates]);
  const createCountryFilter = reactExports.useCallback((countryCodes) => {
    if (countryCodes.length === 0) {
      return ["==", ["get", "ISO_A2"], "__NONE__"];
    }
    const countryNames = {
      // MICROSTATI
      "MC": ["Monaco"],
      "VA": ["Vatican", "Holy See"],
      "SM": ["San Marino"],
      "LI": ["Liechtenstein"],
      "AD": ["Andorra"],
      "MT": ["Malta"],
      "LU": ["Luxembourg"],
      "SG": ["Singapore"],
      "HK": ["Hong Kong"],
      // EUROPA
      "IT": ["Italy"],
      "FR": ["France"],
      "DE": ["Germany"],
      "ES": ["Spain"],
      "PT": ["Portugal"],
      "GB": ["United Kingdom"],
      "NL": ["Netherlands"],
      "BE": ["Belgium"],
      "AT": ["Austria"],
      "CH": ["Switzerland"],
      "PL": ["Poland"],
      "CZ": ["Czech Republic", "Czechia"],
      "HU": ["Hungary"],
      "RO": ["Romania"],
      "GR": ["Greece"],
      "SE": ["Sweden"],
      "NO": ["Norway"],
      "DK": ["Denmark"],
      "FI": ["Finland"],
      "IE": ["Ireland"],
      "SI": ["Slovenia"],
      "HR": ["Croatia"],
      "BA": ["Bosnia and Herzegovina", "Bosnia"],
      "RS": ["Serbia"],
      "ME": ["Montenegro"],
      "XK": ["Kosovo"],
      "AL": ["Albania"],
      "MK": ["North Macedonia", "Macedonia"],
      "EE": ["Estonia"],
      "LV": ["Latvia"],
      "LT": ["Lithuania"],
      "CY": ["Cyprus"],
      "SK": ["Slovakia"],
      "IS": ["Iceland"],
      "MD": ["Moldova"],
      "BY": ["Belarus"],
      "BG": ["Bulgaria"],
      "UA": ["Ukraine"],
      "RU": ["Russia", "Russian Federation"],
      // AMERICHE
      "US": ["United States of America", "United States"],
      "CA": ["Canada"],
      "MX": ["Mexico"],
      "BR": ["Brazil"],
      "AR": ["Argentina"],
      "CL": ["Chile"],
      "CO": ["Colombia"],
      "VE": ["Venezuela"],
      "PE": ["Peru"],
      "EC": ["Ecuador"],
      "BO": ["Bolivia"],
      "PY": ["Paraguay"],
      "UY": ["Uruguay"],
      "CU": ["Cuba"],
      "DO": ["Dominican Republic"],
      "HT": ["Haiti"],
      "JM": ["Jamaica"],
      "PR": ["Puerto Rico"],
      "GT": ["Guatemala"],
      "BZ": ["Belize"],
      "HN": ["Honduras"],
      "SV": ["El Salvador"],
      "NI": ["Nicaragua"],
      "CR": ["Costa Rica"],
      "PA": ["Panama"],
      // ASIA
      "CN": ["China"],
      "JP": ["Japan"],
      "KR": ["South Korea", "Korea, Republic of"],
      "KP": ["North Korea", "Korea, Dem. Rep."],
      "TW": ["Taiwan"],
      "IN": ["India"],
      "PK": ["Pakistan"],
      "BD": ["Bangladesh"],
      "NP": ["Nepal"],
      "LK": ["Sri Lanka"],
      "MM": ["Myanmar", "Burma"],
      "TH": ["Thailand"],
      "VN": ["Vietnam", "Viet Nam"],
      "MY": ["Malaysia"],
      "ID": ["Indonesia"],
      "PH": ["Philippines"],
      "MN": ["Mongolia"],
      "KZ": ["Kazakhstan"],
      // MEDIO ORIENTE
      "IL": ["Israel"],
      "LB": ["Lebanon"],
      "JO": ["Jordan"],
      "QA": ["Qatar"],
      "KW": ["Kuwait"],
      "AE": ["United Arab Emirates"],
      "OM": ["Oman"],
      "SA": ["Saudi Arabia"],
      "IR": ["Iran"],
      "IQ": ["Iraq"],
      "SY": ["Syria", "Syrian Arab Republic"],
      "YE": ["Yemen"],
      "AF": ["Afghanistan"],
      "TR": ["Turkey"],
      // AFRICA
      "MA": ["Morocco"],
      "DZ": ["Algeria"],
      "TN": ["Tunisia"],
      "LY": ["Libya"],
      "EG": ["Egypt"],
      "ZA": ["South Africa"],
      "NG": ["Nigeria"],
      "KE": ["Kenya"],
      "ET": ["Ethiopia"],
      "TZ": ["Tanzania", "United Republic of Tanzania"],
      "GH": ["Ghana"],
      "SN": ["Senegal"],
      "CI": ["Côte d'Ivoire", "Ivory Coast"],
      "CM": ["Cameroon"],
      // OCEANIA
      "AU": ["Australia"],
      "NZ": ["New Zealand"]
    };
    const filters = [
      ["in", ["get", "ISO_A2"], ["literal", countryCodes]],
      ["in", ["get", "ISO_A2_EH"], ["literal", countryCodes]],
      ["in", ["get", "iso_a2"], ["literal", countryCodes]],
      ["in", ["get", "ISO"], ["literal", countryCodes]]
    ];
    countryCodes.forEach((code) => {
      const names = countryNames[code] || [];
      names.forEach((name) => {
        filters.push(["==", ["get", "ADMIN"], name]);
        filters.push(["==", ["get", "name"], name]);
        filters.push(["==", ["get", "NAME"], name]);
      });
    });
    return ["any", ...filters];
  }, []);
  const cleanupOwnerLayers = reactExports.useCallback((mapInstance) => {
    addedLayersRef.current.forEach((layerId) => {
      try {
        if (mapInstance.getLayer(layerId)) {
          mapInstance.removeLayer(layerId);
        }
      } catch (e) {
      }
    });
    addedLayersRef.current.clear();
  }, []);
  const addDominationLayers = reactExports.useCallback(async (mapInstance) => {
    try {
      let geoJson = geoJsonCacheRef.current;
      if (!geoJson) {
        const response = await fetch(
          "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
        );
        if (!response.ok) throw new Error("Failed to fetch GeoJSON");
        geoJson = await response.json();
        geoJsonCacheRef.current = geoJson;
      }
      if (!mapInstance.isStyleLoaded()) {
        return false;
      }
      if (!mapInstance.getSource(SOURCE_ID)) {
        mapInstance.addSource(SOURCE_ID, {
          type: "geojson",
          data: geoJson
        });
      }
      cleanupOwnerLayers(mapInstance);
      Object.entries(conqueredByOwner).forEach(([ownerId, data]) => {
        const fillLayerId = `country-domination-fill-${ownerId.slice(0, 8)}`;
        const lineLayerId = `country-domination-line-${ownerId.slice(0, 8)}`;
        if (!mapInstance.getLayer(fillLayerId)) {
          mapInstance.addLayer({
            id: fillLayerId,
            type: "fill",
            source: SOURCE_ID,
            minzoom: minZoom,
            paint: {
              "fill-color": data.color,
              "fill-opacity": 0.15
            },
            filter: createCountryFilter(data.countries)
          });
          addedLayersRef.current.add(fillLayerId);
        }
        if (!mapInstance.getLayer(lineLayerId)) {
          mapInstance.addLayer({
            id: lineLayerId,
            type: "line",
            source: SOURCE_ID,
            minzoom: minZoom,
            paint: {
              "line-color": data.color,
              "line-width": 3,
              "line-opacity": 0.8
            },
            filter: createCountryFilter(data.countries)
          });
          addedLayersRef.current.add(lineLayerId);
        }
      });
      if (!mapInstance.getLayer(CONTESTED_FILL_LAYER) && contestedCountries.length > 0) {
        mapInstance.addLayer({
          id: CONTESTED_FILL_LAYER,
          type: "fill",
          source: SOURCE_ID,
          minzoom: minZoom,
          paint: {
            "fill-color": "#FFAA00",
            "fill-opacity": 0.25
          },
          filter: createCountryFilter(contestedCountries)
        });
      }
      const labelFeatures = dominationStates.filter((s) => s.status === "conquered" && s.owner_name && COUNTRY_CENTROIDS[s.country_code]).map((s) => ({
        type: "Feature",
        properties: {
          owner_name: s.owner_name,
          color: generateOwnerColor(s.owner_id)
        },
        geometry: { type: "Point", coordinates: COUNTRY_CENTROIDS[s.country_code] }
      }));
      if (labelFeatures.length > 0) {
        if (mapInstance.getSource(LABEL_SOURCE_ID)) {
          mapInstance.getSource(LABEL_SOURCE_ID).setData({
            type: "FeatureCollection",
            features: labelFeatures
          });
        } else {
          mapInstance.addSource(LABEL_SOURCE_ID, {
            type: "geojson",
            data: { type: "FeatureCollection", features: labelFeatures }
          });
        }
        if (!mapInstance.getLayer(LABEL_LAYER)) {
          mapInstance.addLayer({
            id: LABEL_LAYER,
            type: "symbol",
            source: LABEL_SOURCE_ID,
            minzoom: minZoom,
            layout: {
              "text-field": ["concat", "👑 ", ["get", "owner_name"]],
              "text-size": 12,
              "text-anchor": "center",
              "text-allow-overlap": true
            },
            paint: {
              "text-color": ["get", "color"],
              "text-halo-color": "#000000",
              "text-halo-width": 2
            }
          });
        }
      }
      return true;
    } catch (err) {
      return false;
    }
  }, [minZoom, conqueredByOwner, contestedCountries, dominationStates, createCountryFilter, cleanupOwnerLayers]);
  reactExports.useEffect(() => {
    if (!map || !enabled) return;
    const checkAndAddLayers = () => {
      if (!map || !map.isStyleLoaded()) return;
      const sourceExists = map.getSource(SOURCE_ID);
      if (!sourceExists) {
        addDominationLayers(map);
      }
    };
    if (map.isStyleLoaded()) {
      addDominationLayers(map);
    } else {
      map.once("load", () => addDominationLayers(map));
    }
    checkIntervalRef.current = setInterval(checkAndAddLayers, 500);
    const handleStyleLoad = () => {
      setTimeout(() => addDominationLayers(map), 200);
    };
    map.on("style.load", handleStyleLoad);
    const handleIdle = () => {
      checkAndAddLayers();
    };
    map.on("idle", handleIdle);
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      map.off("style.load", handleStyleLoad);
      map.off("idle", handleIdle);
    };
  }, [map, enabled, addDominationLayers]);
  reactExports.useEffect(() => {
    if (!map || !enabled || !map.isStyleLoaded()) return;
    addDominationLayers(map);
  }, [map, enabled, conqueredByOwner, addDominationLayers]);
  return null;
};

const BuzzDiagnosticPanel = () => {
  const { user } = useAuthContext();
  const isDebugEnabled = useDebugFlag();
  const [areas, setAreas] = reactExports.useState([]);
  const [isCollapsed, setIsCollapsed] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!user?.id || !isDebugEnabled) return;
    const loadAreas = async () => {
      const { data, error } = await supabase.from("user_map_areas").select("id, week, radius_km, level, created_at, source, center_lat, center_lng").eq("user_id", user.id).eq("source", "buzz_map").order("created_at", { ascending: false }).limit(10);
      if (error) {
        return;
      }
      setAreas(data || []);
    };
    loadAreas();
    const channel = supabase.channel("buzz_diagnostic").on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "user_map_areas",
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        loadAreas();
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isDebugEnabled]);
  if (!isDebugEnabled) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-20 left-2 z-[9999] bg-black/90 border border-cyan-500/30 rounded-lg shadow-xl max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-white/5",
        onClick: () => setIsCollapsed(!isCollapsed),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-bold text-cyan-400", children: [
            "🔍 BUZZ DIAGNOSTIC (",
            areas.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 text-xs", children: isCollapsed ? "▼" : "▲" })
        ]
      }
    ),
    !isCollapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pb-3 max-h-96 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-xs", children: [
      areas.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 py-2", children: "No BUZZ areas yet" }),
      areas.map((area, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "border-t border-cyan-500/20 pt-2 space-y-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-cyan-300 font-semibold", children: [
                "#",
                idx + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-[10px]", children: new Date(area.created_at).toLocaleString("it-IT", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Week:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-mono", children: area.week })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Level:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 font-bold", children: area.level })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Radius:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-yellow-400 font-mono", children: [
                  area.radius_km,
                  " km"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Cost:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-400 font-mono", children: [
                  area.cost_m1u || 0,
                  " M1U"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Center:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-300 font-mono", children: [
                  area.center_lat?.toFixed(5) || "N/A",
                  ", ",
                  area.center_lng?.toFixed(5) || "N/A"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Source:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-400", children: area.source })
              ] })
            ] })
          ]
        },
        area.id
      ))
    ] }) })
  ] });
};

const BuzzDebugBadge = ({ latestArea }) => {
  const { user } = useAuthContext();
  const isDebugEnabled = useDebugFlag();
  const { nextLevel, nextRadiusKm } = useBuzzMapPricingNew(user?.id);
  const [dbCurrentRadiusKm, setDbCurrentRadiusKm] = reactExports.useState(null);
  const [dbCurrentLevel, setDbCurrentLevel] = reactExports.useState(null);
  const [geoJsonRadiusKm, setGeoJsonRadiusKm] = reactExports.useState(null);
  const [geoJsonLevel, setGeoJsonLevel] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!user?.id || !isDebugEnabled) return;
    const loadLatestFromDB = async () => {
      const currentWeek = getCurrentWeekOfYear();
      const { data, error } = await supabase.from("user_map_areas").select("id, radius_km, level, created_at").eq("user_id", user.id).eq("source", "buzz_map").eq("week", currentWeek).order("created_at", { ascending: false }).limit(1).single();
      if (error && error.code !== "PGRST116") {
        return;
      }
      if (data) {
        setDbCurrentRadiusKm(data.radius_km);
        setDbCurrentLevel(data.level);
      } else {
        setDbCurrentRadiusKm(null);
        setDbCurrentLevel(null);
      }
    };
    loadLatestFromDB();
    const handleBuzzCreated = () => {
      setTimeout(() => loadLatestFromDB(), 500);
    };
    window.addEventListener("buzzAreaCreated", handleBuzzCreated);
    return () => {
      window.removeEventListener("buzzAreaCreated", handleBuzzCreated);
    };
  }, [user?.id, isDebugEnabled]);
  reactExports.useEffect(() => {
    if (!isDebugEnabled) return;
    const readGeoJson = () => {
      try {
        const map2 = window.M1_MAP;
        if (!map2) return;
        const source = map2.getSource?.("user-areas");
        const data = source && (source._data || source.serialize?.().data);
        const props = data?.features?.[0]?.properties;
        if (props) {
          setGeoJsonRadiusKm(props.radiusKm || null);
          setGeoJsonLevel(props.level || null);
        } else {
          setGeoJsonRadiusKm(null);
          setGeoJsonLevel(null);
        }
      } catch (e) {
      }
    };
    readGeoJson();
    const map = window.M1_MAP;
    if (!map) return;
    const handleSourceData = (e) => {
      if (e.sourceId === "user-areas" && e.isSourceLoaded) {
        setTimeout(readGeoJson, 100);
      }
    };
    const handleBuzzUpdate = () => {
      setTimeout(readGeoJson, 500);
    };
    map.on("sourcedata", handleSourceData);
    window.addEventListener("buzzAreaCreated", handleBuzzUpdate);
    return () => {
      map.off("sourcedata", handleSourceData);
      window.removeEventListener("buzzAreaCreated", handleBuzzUpdate);
    };
  }, [isDebugEnabled]);
  if (!isDebugEnabled) return null;
  const uiRadiusKm = geoJsonRadiusKm;
  const uiLevel = geoJsonLevel;
  const radiusMismatch = dbCurrentRadiusKm !== null && uiRadiusKm !== null && Math.abs(dbCurrentRadiusKm - uiRadiusKm) > 0.01;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "fixed top-20 right-2 z-[9999] bg-black/90 border rounded-lg shadow-xl text-xs p-3 space-y-1 min-w-[280px]",
      style: {
        borderColor: radiusMismatch ? "#ef4444" : "#06b6d4"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-cyan-400 border-b border-cyan-500/30 pb-1 mb-2", children: "🔍 BUZZ VERIFY MODE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-400", children: "Source:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-cyan-300 font-mono", children: "user-areas GeoJSON" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-400", children: "DB current:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-mono ${radiusMismatch ? "text-red-400 font-bold" : "text-cyan-300"}`, children: dbCurrentRadiusKm !== null ? `L${dbCurrentLevel || "?"} • ${dbCurrentRadiusKm.toFixed(1)} km` : "N/A" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-400", children: "GeoJSON live:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-mono ${radiusMismatch ? "text-red-400 font-bold" : "text-green-400"}`, children: uiRadiusKm !== null ? `L${uiLevel || "?"} • ${uiRadiusKm.toFixed(1)} km` : "N/A" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-400", children: "Next:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-purple-400 font-mono", children: [
            "L",
            nextLevel,
            " • ",
            nextRadiusKm.toFixed(1),
            " km"
          ] })
        ] }),
        latestArea && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-gray-500 pt-1 border-t border-gray-700/50", children: [
          "Center: ",
          latestArea.lat.toFixed(4),
          ", ",
          latestArea.lng.toFixed(4)
        ] }),
        radiusMismatch && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-400 text-[10px] pt-1 border-t border-red-500/30 font-bold", children: "⚠️ MISMATCH DETECTED" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-gray-600 pt-1 space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "✓ buzzAreaCreated" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "✓ realtime" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "✓ render" })
        ] })
      ]
    }
  );
};

const MapVerificationPanel = () => {
  const [results, setResults] = reactExports.useState([]);
  const [isRunning, setIsRunning] = reactExports.useState(false);
  const runVerification = async () => {
    setIsRunning(true);
    const newResults = [];
    const step1 = {
      step: "1. Debug Helpers",
      status: "pending",
      details: ""
    };
    const helpers = ["M1_MAP", "__inventoryLayers", "__whoDrawsHere", "__onlyUserAreas", "__killOverlay"];
    const missing = helpers.filter((h) => !window[h]);
    step1.status = missing.length === 0 ? "pass" : "fail";
    step1.details = missing.length === 0 ? "✅ All helpers available" : `❌ Missing: ${missing.join(", ")}`;
    newResults.push(step1);
    setResults([...newResults]);
    if (step1.status === "fail") {
      setIsRunning(false);
      return;
    }
    await new Promise((r) => setTimeout(r, 500));
    const step2 = {
      step: "2. Layer Inventory",
      status: "pending",
      details: ""
    };
    try {
      const inventory = window.__inventoryLayers?.();
      const circleLayers = inventory?.filter(
        (l) => l.id.includes("user-areas") || l.id.includes("search-areas")
      ) || [];
      step2.status = "pass";
      step2.details = `Found ${circleLayers.length} circle layers`;
      step2.data = circleLayers;
    } catch (e) {
      step2.status = "fail";
      step2.details = `❌ Error: ${e}`;
    }
    newResults.push(step2);
    setResults([...newResults]);
    await new Promise((r) => setTimeout(r, 500));
    const step3 = {
      step: "3. Who Draws Here",
      status: "pending",
      details: ""
    };
    try {
      const map = window.M1_MAP;
      const center = map.getCenter();
      const drawers = window.__whoDrawsHere?.(center.lng, center.lat);
      const circleDrawers = drawers?.filter(
        (d) => typeof d.layer === "string" && (d.layer.includes("fill") || d.layer.includes("border"))
      ) || [];
      step3.status = "pass";
      step3.details = circleDrawers.length > 0 ? `Drawing: ${circleDrawers.map((d) => d.layer).join(", ")}` : "⚠️ No circles at center";
      step3.data = circleDrawers;
    } catch (e) {
      step3.status = "fail";
      step3.details = `❌ Error: ${e}`;
    }
    newResults.push(step3);
    setResults([...newResults]);
    await new Promise((r) => setTimeout(r, 500));
    const step4 = {
      step: "4. User-Areas Props (GeoJSON)",
      status: "pending",
      details: ""
    };
    try {
      const map = window.M1_MAP;
      const source = map.getSource("user-areas");
      const data = source?._data || source?.serialize?.().data;
      const props = data?.features?.[0]?.properties;
      if (!props) {
        step4.status = "fail";
        step4.details = "❌ No user-areas data";
      } else {
        step4.status = "pass";
        step4.details = `L${props.level} · ${props.radius_km || props.radiusKm}km`;
        step4.data = props;
      }
    } catch (e) {
      step4.status = "fail";
      step4.details = `❌ Error: ${e}`;
    }
    newResults.push(step4);
    setResults([...newResults]);
    await new Promise((r) => setTimeout(r, 500));
    const step5 = {
      step: "5. DB User Map Areas",
      status: "pending",
      details: ""
    };
    try {
      const supabase = window.supabase;
      if (!supabase) {
        step5.status = "fail";
        step5.details = "❌ Supabase not available";
      } else {
        const getIsoWeekUTC = () => {
          const now = /* @__PURE__ */ new Date();
          const dt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
          const day = dt.getUTCDay() || 7;
          dt.setUTCDate(dt.getUTCDate() + 4 - day);
          const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
          return Math.ceil(((dt.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
        };
        const currentWeek = getIsoWeekUTC();
        const { data: dbData, error } = await supabase.from("user_map_areas").select("*").eq("source", "buzz_map").eq("week", currentWeek).order("created_at", { ascending: false }).limit(1).single();
        if (error || !dbData) {
          step5.status = "fail";
          step5.details = `❌ No DB data: ${error?.message || "empty"}`;
        } else {
          step5.status = "pass";
          step5.details = `Level ${dbData.level} · ${dbData.radius_km}km (DB)`;
          step5.data = dbData;
          const uaProps = newResults[3]?.data;
          if (uaProps && (uaProps.level !== dbData.level || uaProps.radiusKm !== dbData.radius_km)) {
            step5.details += " ⚠️ MISMATCH with GeoJSON!";
          }
        }
      }
    } catch (e) {
      step5.status = "fail";
      step5.details = `❌ Error: ${e}`;
    }
    newResults.push(step5);
    setResults([...newResults]);
    setIsRunning(false);
  };
  const clearUserAreas = () => {
    try {
      const map = window.M1_MAP;
      const source = map.getSource("user-areas");
      source.setData({ type: "FeatureCollection", features: [] });
    } catch (e) {
    }
  };
  const killOverlay = () => {
    try {
      window.__killOverlay?.();
    } catch (e) {
    }
  };
  const onlyUserAreas = () => {
    try {
      window.__onlyUserAreas?.();
    } catch (e) {
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed top-20 right-4 z-[9999] bg-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 max-w-md max-h-[70vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-cyan-400 font-bold text-sm", children: "MAP VERIFICATION" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          onClick: runVerification,
          disabled: isRunning,
          className: "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs",
          children: isRunning ? "⏳ Running..." : "▶ Run Test"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 mb-4", children: results.map((result, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-black/50 rounded p-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: result.status === "pass" ? "text-green-400" : result.status === "fail" ? "text-red-400" : "text-yellow-400", children: result.status === "pass" ? "✅" : result.status === "fail" ? "❌" : "⏳" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-medium", children: result.step })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-400 ml-6", children: result.details })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          onClick: onlyUserAreas,
          className: "bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs flex-1",
          children: "🎯 Only UA"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          onClick: clearUserAreas,
          className: "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs flex-1",
          children: "🧹 Clear UA"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          onClick: killOverlay,
          className: "bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs flex-1",
          children: "🔪 Kill Overlay"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 pt-4 border-t border-cyan-500/20 text-[10px] text-gray-500", children: "Auto-verification panel • Press BUZZ MAP then re-run test to verify shrink" })
  ] });
};

const NOTES_KEY = "map3d-notes";
const NotesLayer3D = ({ map, enabled }) => {
  const [notes, setNotes] = reactExports.useState(() => {
    try {
      const saved = localStorage.getItem(NOTES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch (e) {
      return [];
    }
  });
  const [positions, setPositions] = reactExports.useState(/* @__PURE__ */ new Map());
  const [selectedNote, setSelectedNote] = reactExports.useState(null);
  const [editingNote, setEditingNote] = reactExports.useState(null);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (e) {
    }
  }, [notes]);
  reactExports.useEffect(() => {
    if (!map || !enabled) return;
    const updatePositions = () => {
      const newPositions = /* @__PURE__ */ new Map();
      notes.forEach((note) => {
        const point = map.project([note.lng, note.lat]);
        newPositions.set(note.id, { x: point.x, y: point.y });
      });
      setPositions(newPositions);
    };
    updatePositions();
    map.on("move", updatePositions);
    map.on("zoom", updatePositions);
    map.on("resize", updatePositions);
    return () => {
      map.off("move", updatePositions);
      map.off("zoom", updatePositions);
      map.off("resize", updatePositions);
    };
  }, [map, notes, enabled]);
  const handleSave = () => {
    if (!editingNote || !selectedNote) return;
    setNotes((prev) => prev.map(
      (n) => n.id === selectedNote ? { ...n, title: editingNote.title, note: editingNote.note } : n
    ));
    setSelectedNote(null);
    setEditingNote(null);
    ue.success("Nota salvata");
  };
  const handleDelete = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNote === id) {
      setSelectedNote(null);
      setEditingNote(null);
    }
    ue.success("Nota rimossa");
  };
  if (!enabled) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none", style: { zIndex: 670 }, children: notes.map((note) => {
      const pos = positions.get(note.id);
      if (!pos) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute pointer-events-auto cursor-pointer",
          style: {
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: "translate(-50%, -50%)"
          },
          onClick: () => {
            setSelectedNote(note.id);
            setEditingNote({ title: note.title, note: note.note });
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            MapPin,
            {
              className: "text-purple-500",
              size: 24,
              fill: note.note ? "#a855f7" : "transparent",
              style: { filter: "drop-shadow(0 0 4px rgba(168, 85, 247, 0.8))" }
            }
          )
        },
        note.id
      );
    }) }),
    selectedNote && editingNote && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md p-4",
        style: { pointerEvents: "auto" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-black/90 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-white font-bold text-lg", children: "Modifica Nota" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                onClick: () => {
                  setSelectedNote(null);
                  setEditingNote(null);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: editingNote.title,
                onChange: (e) => setEditingNote({ ...editingNote, title: e.target.value }),
                placeholder: "Titolo",
                className: "bg-black/50 border-purple-500/30"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: editingNote.note,
                onChange: (e) => setEditingNote({ ...editingNote, note: e.target.value }),
                placeholder: "Descrizione...",
                rows: 3,
                className: "bg-black/50 border-purple-500/30"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "destructive",
                  size: "sm",
                  onClick: () => handleDelete(selectedNote),
                  className: "flex-1",
                  children: "Elimina"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  onClick: handleSave,
                  className: "flex-1 bg-purple-600 hover:bg-purple-700",
                  children: "Salva"
                }
              )
            ] })
          ] })
        ] })
      }
    )
  ] });
};

const LayerTogglePanel = ({ layers, onToggle, mapStyle = "neon", onMapStyleChange }) => {
  const [isExpanded, setIsExpanded] = reactExports.useState(false);
  const layerConfigs = [
    { key: "agents", label: "Agents", icon: Users, color: "#FF3366" },
    { key: "portals", label: "Portals", icon: Hexagon, color: "#00f0ff" },
    { key: "rewards", label: "Rewards", icon: Gift, color: "#FFD700" },
    { key: "areas", label: "Aree", icon: Circle, color: "#00D1FF" },
    { key: "notes", label: "Note", icon: FileText, color: "#a855f7" }
  ];
  const styleConfigs = [
    { key: "neon", label: "Neon", color: "#00D1FF" },
    { key: "streets", label: "Standard", color: "#4CAF50" },
    { key: "satellite", label: "Satellite", color: "#FF9800" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "fixed right-4",
      style: {
        top: "calc(env(safe-area-inset-top, 0px) + 96px)",
        pointerEvents: "auto",
        zIndex: 1500
        // 🔧 FIX 26/01/2026: Was 50000, lowered to allow FinalShoot INFO BAR (z-1600) to appear above
      },
      children: [
        !isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setIsExpanded(true),
            className: "flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-xl rounded-full border border-cyan-500/20 hover:border-cyan-500/40 transition-all",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-4 h-4 text-cyan-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white font-bold font-orbitron", children: "LAYERS" })
            ]
          }
        ),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 bg-black/80 backdrop-blur-xl rounded-2xl p-3 border border-cyan-500/20 min-w-[160px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between mb-2 pb-2 border-b border-white/10 cursor-pointer",
              onClick: () => setIsExpanded(false),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-4 h-4 text-cyan-400" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white font-bold font-orbitron", children: "LAYERS" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4 text-cyan-400" })
              ]
            }
          ),
          layerConfigs.map(({ key, label, icon: Icon, color }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => onToggle(key),
              className: `justify-start gap-2 transition-all ${layers[key] ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`,
              style: {
                borderLeft: layers[key] ? `3px solid ${color}` : "3px solid transparent"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4", style: { color: layers[key] ? color : void 0 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `ml-auto w-2 h-2 rounded-full ${layers[key] ? "bg-green-500" : "bg-gray-600"}` })
              ]
            },
            key
          )),
          onMapStyleChange && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 pt-2 border-t border-white/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2 px-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Map$1, { className: "w-4 h-4 text-cyan-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white font-bold font-orbitron", children: "MAP STYLE" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: styleConfigs.map(({ key, label, color }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => onMapStyleChange(key),
                className: `px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${mapStyle === key ? "bg-white/20 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`,
                style: {
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: mapStyle === key ? color : "transparent",
                  boxShadow: mapStyle === key ? `0 0 8px ${color}40` : "none"
                },
                children: label
              },
              key
            )) })
          ] }) })
        ] })
      ]
    }
  );
};
function Hexagon(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" })
    }
  );
}

const BASE_PLAYER_OFFSET = TOTAL_NPC_COUNT;
const CHANNEL_NAME = "presence:map-3d-tiler";
const RealtimePlayersPill = ({ className = "" }) => {
  const { user } = useUnifiedAuth();
  const [realtimeCount, setRealtimeCount] = reactExports.useState(1);
  const [isConnected, setIsConnected] = reactExports.useState(false);
  const channelRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const getSessionId = () => {
      if (user?.id) return user.id;
      let anonId = sessionStorage.getItem("m1_anon_session");
      if (!anonId) {
        anonId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem("m1_anon_session", anonId);
      }
      return anonId;
    };
    const sessionId = getSessionId();
    const channel = supabase.channel(CHANNEL_NAME, {
      config: {
        presence: {
          key: sessionId
        }
      }
    });
    channelRef.current = channel;
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const uniqueUsers = Object.keys(state).length;
      setRealtimeCount(uniqueUsers);
      setIsConnected(true);
    }).on("presence", { event: "join" }, ({ key, newPresences }) => {
      const state = channel.presenceState();
      setRealtimeCount(Object.keys(state).length);
    }).on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      const state = channel.presenceState();
      setRealtimeCount(Object.keys(state).length);
    }).subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: sessionId,
          online_at: (/* @__PURE__ */ new Date()).toISOString(),
          page: "/map-3d-tiler"
        });
        setIsConnected(true);
      }
    });
    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [user?.id]);
  const displayCount = realtimeCount + BASE_PLAYER_OFFSET;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      className: `flex items-center gap-2 ${className}`,
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          className: "flex items-center gap-2 px-4 py-2 rounded-full cursor-default",
          style: {
            background: "radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,.08), rgba(0,0,0,.2) 58%)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: "0 2px 12px rgba(0,0,0,.35), 0 0 20px rgba(255, 50, 50, 0.12) inset",
            backdropFilter: "blur(12px)",
            minHeight: 40
          },
          whileHover: { scale: 1.02 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "w-5 h-5 rounded-full flex items-center justify-center",
                style: {
                  background: "linear-gradient(135deg, #FF3366 0%, #FF0033 100%)",
                  boxShadow: "0 0 10px rgba(255, 51, 102, 0.7)"
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3 h-3 text-white" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "text-sm font-bold font-orbitron tracking-wide",
                style: {
                  color: "#FF3366",
                  textShadow: "0 0 10px rgba(255, 51, 102, 0.9), 0 0 20px rgba(255, 51, 102, 0.5)"
                },
                children: displayCount.toLocaleString("it-IT")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500"}`,
                style: {
                  boxShadow: isConnected ? "0 0 6px rgba(34, 197, 94, 0.8)" : "0 0 6px rgba(234, 179, 8, 0.8)"
                }
              }
            )
          ]
        }
      )
    }
  );
};

async function openAppSettings() {
  const isCapacitor = !!window.Capacitor?.isNativePlatform?.();
  if (isCapacitor) {
    try {
      const { App } = await __vitePreload(async () => { const { App } = await import('./index.Cg7E-QY6.js');return { App }},true?__vite__mapDeps([8,0,1,2,3,4,5,6,7]):void 0);
      const platform = window.Capacitor.getPlatform();
      if (platform === "ios") {
        await App.openUrl({ url: "app-settings:" });
        return true;
      } else if (platform === "android") {
        const appInfo = await App.getInfo();
        await App.openUrl({
          url: `package:${appInfo.id}`
        });
        return true;
      }
    } catch (error) {
    }
  }
  return false;
}
function isNativeApp() {
  return !!window.Capacitor?.isNativePlatform?.();
}

const GeolocationPermissionGuide = ({
  isIOS = false,
  isPWA = false,
  onRetry
}) => {
  const openSettings = async () => {
    if (isNativeApp()) {
      const opened = await openAppSettings();
      if (opened) return;
    }
    if (isIOS) {
      alert("Apri Impostazioni > Privacy e Sicurezza > Localizzazione");
    } else {
      alert("Apri le impostazioni del browser e abilita la geolocalizzazione per questo sito");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "glass-card bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/30 p-6 m-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/30 to-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-8 h-8 text-amber-400" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-white", children: "Geolocalizzazione Bloccata" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-300 text-sm leading-relaxed", children: isIOS && isPWA ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "La geolocalizzazione è stata bloccata per questa app. Per utilizzare le funzioni di mappa e localizzazione, devi abilitarla manualmente nelle impostazioni." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "La geolocalizzazione è bloccata per questo sito. Abilita l'accesso alla posizione nelle impostazioni del browser." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-[#00D1FF]/10 to-[#FF1493]/10 rounded-lg p-4 border border-[#00D1FF]/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-5 h-5 text-[#00D1FF] mt-0.5 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-300 space-y-2", children: isIOS ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-white", children: "Istruzioni per iOS:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal list-inside space-y-1 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Apri l'app ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Impostazioni" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Vai su ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Privacy e Sicurezza" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Seleziona ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Localizzazione" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            'Assicurati che "Servizi di localizzazione" sia ',
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "attivo" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Scorri fino a ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Safari" }),
            " e selezionalo"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Scegli ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: `"Durante l'uso dell'app"` })
          ] }),
          isPWA && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Riavvia l'app M1SSION™ dal tuo schermo home" })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-white", children: "Istruzioni per il browser:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal list-inside space-y-1 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Clicca sull'icona del ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "lucchetto" }),
            " nella barra degli indirizzi"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Seleziona ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Autorizzazioni del sito"' })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            'Cambia "Posizione" da ',
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Blocca"' }),
            " a ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Consenti"' })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Ricarica la pagina" })
        ] })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          onClick: openSettings,
          className: "flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-4 h-4 mr-2" }),
            "Apri Impostazioni"
          ]
        }
      ),
      onRetry && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: onRetry,
          className: "flex-1 bg-gradient-to-r from-[#00D1FF] to-[#FF1493] text-white font-medium hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2" }),
            "Riprova"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "💡 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Suggerimento:" }),
        " Dopo aver modificato le impostazioni,",
        isPWA ? " riavvia l'app" : " ricarica la pagina",
        " per applicare le modifiche."
      ] }),
      isIOS && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "📱 Su iOS, potresti dover chiudere completamente Safari e riaprirlo." })
    ] })
  ] }) });
};

const getMapTilerKey = () => {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isPreview = hostname.includes("lovable") || hostname.includes("pages.dev") || hostname === "localhost" || hostname === "127.0.0.1";
  return isPreview ? "gw2gQRfg512G0yw3DbWn" : "M2JlRFvsxjcMvVXw1HN1";
};
const SearchLocationPill = ({ map }) => {
  const mapTilerKey = getMapTilerKey();
  const [isExpanded, setIsExpanded] = reactExports.useState(false);
  const [query, setQuery] = reactExports.useState("");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const inputRef = reactExports.useRef(null);
  const handleSearch = async () => {
    if (!query.trim() || !map) return;
    setIsLoading(true);
    setError(null);
    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const url = `https://api.maptiler.com/geocoding/${encodedQuery}.json?key=${mapTilerKey}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const placeName = data.features[0].place_name || query;
        map.flyTo({
          center: [lng, lat],
          zoom: 12,
          pitch: 45,
          bearing: 0,
          essential: true,
          duration: 2500
        });
        setQuery("");
        setIsExpanded(false);
      } else {
        setError("Luogo non trovato");
      }
    } catch (err) {
      setError("Errore di ricerca");
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setIsExpanded(false);
      setQuery("");
    }
  };
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    setError(null);
    if (!isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };
  const stopAllPropagation = (e) => {
    e.stopPropagation();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      className: "relative",
      initial: false,
      animate: { width: isExpanded ? 260 : 48 },
      transition: { type: "spring", stiffness: 400, damping: 30 },
      onClick: stopAllPropagation,
      onTouchStart: stopAllPropagation,
      onTouchEnd: stopAllPropagation,
      onMouseDown: stopAllPropagation,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-1 rounded-full overflow-visible",
            style: {
              background: "rgba(10, 15, 25, 0.95)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(0, 209, 255, 0.4)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 209, 255, 0.15)",
              height: 48,
              padding: isExpanded ? "0 6px 0 8px" : "0",
              width: "100%"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.button,
                {
                  onClick: toggleExpanded,
                  className: "flex items-center justify-center flex-shrink-0",
                  style: {
                    width: isExpanded ? 28 : 48,
                    height: 48,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0
                  },
                  whileHover: { scale: 1.05 },
                  whileTap: { scale: 0.95 },
                  children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-5 h-5 text-cyan-400" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  className: "flex items-center gap-1 flex-1",
                  initial: { opacity: 0, width: 0 },
                  animate: { opacity: 1, width: "auto" },
                  exit: { opacity: 0, width: 0 },
                  transition: { duration: 0.2 },
                  style: { minWidth: 0 },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        ref: inputRef,
                        type: "text",
                        value: query,
                        onChange: (e) => setQuery(e.target.value),
                        onKeyDown: handleKeyDown,
                        onClick: (e) => e.stopPropagation(),
                        onTouchStart: (e) => e.stopPropagation(),
                        onMouseDown: (e) => e.stopPropagation(),
                        onFocus: (e) => e.stopPropagation(),
                        placeholder: "Cerca...",
                        className: "flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-500",
                        style: { minWidth: 80, width: "100%" },
                        disabled: isLoading,
                        autoComplete: "off",
                        autoCorrect: "off",
                        autoCapitalize: "off",
                        spellCheck: "false"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.button,
                      {
                        onClick: handleSearch,
                        disabled: isLoading || !query.trim(),
                        className: "flex items-center justify-center rounded-full flex-shrink-0",
                        style: {
                          width: 36,
                          height: 36,
                          minWidth: 36,
                          background: query.trim() ? "linear-gradient(135deg, #00D1FF 0%, #0099CC 100%)" : "rgba(255,255,255,0.15)",
                          border: "none",
                          cursor: query.trim() ? "pointer" : "not-allowed",
                          opacity: query.trim() ? 1 : 0.5,
                          boxShadow: query.trim() ? "0 0 10px rgba(0, 209, 255, 0.4)" : "none"
                        },
                        whileHover: query.trim() ? { scale: 1.1 } : {},
                        whileTap: query.trim() ? { scale: 0.9 } : {},
                        children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 text-white animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation2, { className: "w-4 h-4 text-white" })
                      }
                    )
                  ]
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: error && isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: -10 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -10 },
            className: "absolute top-full left-0 right-0 mt-2 px-3 py-2 rounded-lg text-xs text-red-400",
            style: {
              background: "rgba(255, 50, 50, 0.2)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 50, 50, 0.3)"
            },
            children: error
          }
        ) })
      ]
    }
  );
};

function use3DDevMocks() {
  {
    return {
      agents: [],
      rewards: [],
      notesSeed: [],
      userAreas: [],
      searchAreas: []
    };
  }
}

const DevNotesPanel = ({ map }) => {
  const [open, setOpen] = reactExports.useState(false);
  const [notes, setNotes] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [newNoteText, setNewNoteText] = reactExports.useState("");
  const [editingId, setEditingId] = reactExports.useState(null);
  const [editText, setEditText] = reactExports.useState("");
  const { user, isAuthenticated } = useUnifiedAuth();
  const loadNotes = reactExports.useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("map_notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      setNotes((data || []).map((note) => ({
        id: note.id,
        text: note.text,
        importance: note.importance,
        created_at: note.created_at,
        updated_at: note.updated_at
      })));
    } catch (error) {
      ue.error("Errore nel caricare le note");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  reactExports.useEffect(() => {
    if (open && user?.id) {
      loadNotes();
    }
  }, [open, user?.id, loadNotes]);
  const handleAddNote = async () => {
    if (!newNoteText.trim() || !user?.id) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("map_notes").insert({
        user_id: user.id,
        text: newNoteText.trim(),
        importance: "medium"
      }).select().single();
      if (error) throw error;
      if (data) {
        setNotes((prev) => [{
          id: data.id,
          text: data.text,
          importance: data.importance,
          created_at: data.created_at,
          updated_at: data.updated_at
        }, ...prev]);
        setNewNoteText("");
        ue.success("Nota aggiunta");
      }
    } catch (error) {
      ue.error("Errore nell'aggiungere la nota");
    } finally {
      setSaving(false);
    }
  };
  const handleUpdateNote = async (id) => {
    if (!editText.trim() || !user?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("map_notes").update({
        text: editText.trim(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      setNotes((prev) => prev.map(
        (note) => note.id === id ? { ...note, text: editText.trim() } : note
      ));
      setEditingId(null);
      setEditText("");
      ue.success("Nota aggiornata");
    } catch (error) {
      ue.error("Errore nell'aggiornare la nota");
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteNote = async (id) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase.from("map_notes").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      setNotes((prev) => prev.filter((note) => note.id !== id));
      ue.success("Nota eliminata");
    } catch (error) {
      ue.error("Errore nell'eliminare la nota");
    }
  };
  const handleToggleImportance = async (id) => {
    if (!user?.id) return;
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const order = ["high", "medium", "low"];
    const currentIdx = order.indexOf(note.importance);
    const nextImportance = order[(currentIdx + 1) % order.length];
    try {
      const { error } = await supabase.from("map_notes").update({ importance: nextImportance }).eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      setNotes((prev) => prev.map(
        (n) => n.id === id ? { ...n, importance: nextImportance } : n
      ));
    } catch (error) {
    }
  };
  const getImportanceColor = (importance) => {
    switch (importance) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };
  const count = notes.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom, 34px) + 80px)",
          left: 12,
          zIndex: 1002,
          pointerEvents: "auto"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "m1x-pill m1x-pill--note",
            onClick: () => setOpen(true),
            title: "Note",
            style: { transform: "scale(0.75)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1x-pill__icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-cyan-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m1x-pill__label", children: [
                "Note (",
                count,
                ")"
              ] })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      GlassModal,
      {
        isOpen: open,
        onClose: () => setOpen(false),
        title: "NOTE",
        subtitle: "Salva appunti sulla tua ricerca",
        accentColor: "#00D1FF",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                className: "w-full h-20 p-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm resize-none focus:outline-none focus:border-[#00D1FF]/50 placeholder:text-white/40 transition-colors",
                placeholder: "Scrivi una nuova nota...",
                value: newNoteText,
                onChange: (e) => setNewNoteText(e.target.value),
                disabled: !isAuthenticated
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: handleAddNote,
                disabled: !newNoteText.trim() || saving || !isAuthenticated,
                className: "w-full bg-[#00D1FF] hover:bg-[#00D1FF]/80 text-black font-semibold rounded-xl h-11",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
                  saving ? "Salvataggio..." : "Aggiungi nota"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: !isAuthenticated ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-white/50 py-6 text-sm", children: "Accedi per salvare le tue note." }) : loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-white/50 py-6 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block w-5 h-5 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Caricamento..." })
          ] }) : notes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-white/50 py-6 text-sm", children: "Nessuna nota. Aggiungi la tua prima nota sopra." }) : notes.map((note) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "p-3 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10 transition-colors",
              children: editingId === note.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    className: "w-full h-20 p-3 bg-black/50 border border-[#00D1FF]/30 rounded-xl text-white text-sm resize-none focus:outline-none focus:border-[#00D1FF]/60",
                    value: editText,
                    onChange: (e) => setEditText(e.target.value),
                    autoFocus: true
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      onClick: () => handleUpdateNote(note.id),
                      disabled: saving || !editText.trim(),
                      className: "flex-1 bg-[#00D1FF] hover:bg-[#00D1FF]/80 text-black font-semibold rounded-lg h-9",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3 w-3 mr-1" }),
                        "Salva"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      variant: "outline",
                      onClick: () => {
                        setEditingId(null);
                        setEditText("");
                      },
                      className: "flex-1 border-white/20 text-white hover:bg-white/10 rounded-lg h-9",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3 mr-1" }),
                        "Annulla"
                      ]
                    }
                  )
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/90 flex-1 leading-relaxed", children: note.text }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => handleToggleImportance(note.id),
                      className: `w-3 h-3 rounded-full ${getImportanceColor(note.importance)} flex-shrink-0 mt-1 cursor-pointer hover:ring-2 hover:ring-white/30 transition-all`,
                      title: `Priorità: ${note.importance}`
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-3 pt-3 border-t border-white/5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      variant: "ghost",
                      onClick: () => {
                        setEditingId(note.id);
                        setEditText(note.text);
                      },
                      className: "h-8 px-3 text-[#00D1FF] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 rounded-lg text-xs font-medium",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-3 w-3 mr-1.5" }),
                        "Modifica"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      variant: "ghost",
                      onClick: () => handleDeleteNote(note.id),
                      className: "h-8 px-3 text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 mr-1.5" }),
                        "Elimina"
                      ]
                    }
                  )
                ] })
              ] })
            },
            note.id
          )) })
        ] })
      }
    )
  ] });
};

const DevAreasPanel = ({
  map,
  searchAreas,
  onDelete,
  onFocus,
  onAddArea,
  onCreateAreaDirect
}) => {
  const [open, setOpen] = reactExports.useState(false);
  const [activeTab, setActiveTab] = reactExports.useState("aree");
  const [showRadiusPickerInline, setShowRadiusPickerInline] = reactExports.useState(false);
  const [selectedRadius, setSelectedRadius] = reactExports.useState(500);
  const [radiusMode, setRadiusMode] = reactExports.useState("radius");
  const [isWaitingForMapClick, setIsWaitingForMapClick] = reactExports.useState(false);
  const [showCustomInput, setShowCustomInput] = reactExports.useState(false);
  const [customRadiusValue, setCustomRadiusValue] = reactExports.useState("");
  const [mapPoints, setMapPoints] = reactExports.useState([]);
  const [loadingPoints, setLoadingPoints] = reactExports.useState(false);
  const [isAddingPoint, setIsAddingPoint] = reactExports.useState(false);
  const [editingPointId, setEditingPointId] = reactExports.useState(null);
  const [editPointTitle, setEditPointTitle] = reactExports.useState("");
  const [editPointNote, setEditPointNote] = reactExports.useState("");
  const markersRef = reactExports.useRef([]);
  const areaOverlaysRef = reactExports.useRef([]);
  const { user, isAuthenticated } = useUnifiedAuth();
  const radiusOptions = [
    { value: 250, label: "250m" },
    { value: 500, label: "500m" },
    { value: 1e3, label: "1km" },
    { value: 2e3, label: "2km" },
    { value: 5e3, label: "5km" }
  ];
  const loadMapPoints = reactExports.useCallback(async () => {
    if (!user?.id) return;
    setLoadingPoints(true);
    try {
      const { data, error } = await supabase.from("map_points").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      setMapPoints((data || []).map((point) => ({
        id: point.id,
        lat: point.latitude,
        lng: point.longitude,
        title: point.title || "",
        note: point.note || "",
        created_at: point.created_at
      })));
    } catch (error) {
      ue.error("Errore nel caricare i punti");
    } finally {
      setLoadingPoints(false);
    }
  }, [user?.id]);
  reactExports.useEffect(() => {
    if (user?.id) {
      loadMapPoints();
    }
  }, [user?.id, loadMapPoints]);
  reactExports.useEffect(() => {
    if (open && activeTab === "punti" && user?.id) {
      loadMapPoints();
    }
  }, [open, activeTab, user?.id, loadMapPoints]);
  reactExports.useEffect(() => {
    if (!map) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    mapPoints.forEach((point) => {
      const el = document.createElement("div");
      el.className = "m1-point-marker";
      el.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #00D1FF 0%, #7B2EFF 100%);
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 209, 255, 0.5), 0 0 16px rgba(123, 46, 255, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;
      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        className: "m1-point-popup"
      }).setHTML(`
        <div style="padding: 8px; max-width: 200px;">
          <div style="font-weight: 600; color: #00D1FF; margin-bottom: 4px;">
            ${point.title || "Punto senza titolo"}
          </div>
          ${point.note ? `<div style="font-size: 12px; color: #888;">${point.note}</div>` : ""}
        </div>
      `);
      const marker = new maplibregl.Marker({ element: el }).setLngLat([point.lng, point.lat]).setPopup(popup).addTo(map);
      markersRef.current.push(marker);
    });
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, mapPoints]);
  reactExports.useEffect(() => {
    if (!map) return;
    areaOverlaysRef.current.forEach((el) => el.remove());
    areaOverlaysRef.current = [];
    const updateOverlayPositions = () => {
      searchAreas.forEach((area, index) => {
        const el = areaOverlaysRef.current[index];
        if (!el) return;
        const center = map.project([area.lng, area.lat]);
        const radiusKm = area.radius / 1e3;
        const latRad = area.lat * Math.PI / 180;
        const metersPerPixel = 156543.03392 * Math.cos(latRad) / Math.pow(2, map.getZoom());
        const pixelRadius = radiusKm * 1e3 / metersPerPixel;
        el.style.left = `${center.x - pixelRadius}px`;
        el.style.top = `${center.y - pixelRadius}px`;
        el.style.width = `${pixelRadius * 2}px`;
        el.style.height = `${pixelRadius * 2}px`;
      });
    };
    searchAreas.forEach((area, index) => {
      const el = document.createElement("div");
      el.className = "m1-search-area-circle";
      el.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(123, 46, 255, 0.15);
        border: 3px solid #7B2EFF;
        box-shadow: 0 0 20px rgba(123, 46, 255, 0.4), inset 0 0 30px rgba(123, 46, 255, 0.1);
        pointer-events: none;
        transition: transform 0.1s ease-out;
        z-index: 1;
      `;
      const mapContainer = map.getCanvasContainer();
      mapContainer.appendChild(el);
      areaOverlaysRef.current.push(el);
    });
    updateOverlayPositions();
    map.on("move", updateOverlayPositions);
    map.on("zoom", updateOverlayPositions);
    map.on("pitch", updateOverlayPositions);
    map.on("rotate", updateOverlayPositions);
    return () => {
      map.off("move", updateOverlayPositions);
      map.off("zoom", updateOverlayPositions);
      map.off("pitch", updateOverlayPositions);
      map.off("rotate", updateOverlayPositions);
      areaOverlaysRef.current.forEach((el) => el.remove());
      areaOverlaysRef.current = [];
    };
  }, [map, searchAreas]);
  reactExports.useEffect(() => {
    if (!map || !isAddingPoint) return;
    const handleMapClick = async (e) => {
      if (!isAddingPoint || !user?.id) return;
      const { lng, lat } = e.lngLat;
      try {
        const { data, error } = await supabase.from("map_points").insert({
          user_id: user.id,
          latitude: lat,
          longitude: lng,
          title: "Nuovo punto",
          note: ""
        }).select().single();
        if (error) throw error;
        if (data) {
          const newPoint = {
            id: data.id,
            lat: data.latitude,
            lng: data.longitude,
            title: data.title || "",
            note: data.note || "",
            created_at: data.created_at
          };
          setMapPoints((prev) => [newPoint, ...prev]);
          setOpen(true);
          setActiveTab("punti");
          setEditingPointId(data.id);
          setEditPointTitle(data.title || "Nuovo punto");
          setEditPointNote("");
          ue.success("Punto aggiunto! Modifica titolo e nota.");
        }
      } catch (error) {
        ue.error("Errore nell'aggiungere il punto");
      }
      setIsAddingPoint(false);
    };
    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, isAddingPoint, user?.id]);
  reactExports.useEffect(() => {
    if (!map || !isWaitingForMapClick) return;
    const handleMapClick = (e) => {
      if (!isWaitingForMapClick) return;
      let radiusValue = selectedRadius;
      if (showCustomInput && customRadiusValue) {
        const customVal = parseInt(customRadiusValue, 10);
        if (!isNaN(customVal) && customVal >= 50) {
          radiusValue = customVal;
        }
      }
      const finalRadius = radiusMode === "diameter" ? Math.round(radiusValue / 2) : radiusValue;
      const { lng, lat } = e.lngLat;
      if (onCreateAreaDirect) {
        onCreateAreaDirect(finalRadius, lat, lng);
      } else {
        onAddArea(finalRadius);
      }
      setIsWaitingForMapClick(false);
      setShowCustomInput(false);
      setCustomRadiusValue("");
      ue.success(`Area creata! Raggio: ${(finalRadius / 1e3).toFixed(1)} km`);
    };
    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, isWaitingForMapClick, selectedRadius, radiusMode, onAddArea, onCreateAreaDirect, showCustomInput, customRadiusValue]);
  const handleStartAddPoint = () => {
    setIsAddingPoint(true);
    setOpen(false);
    ue.info("Clicca sulla mappa per aggiungere un punto", { duration: 5e3 });
  };
  const handleUpdatePoint = async (id) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase.from("map_points").update({
        title: editPointTitle.trim() || "Punto senza titolo",
        note: editPointNote.trim()
      }).eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      setMapPoints((prev) => prev.map(
        (point) => point.id === id ? { ...point, title: editPointTitle.trim() || "Punto senza titolo", note: editPointNote.trim() } : point
      ));
      setEditingPointId(null);
      setEditPointTitle("");
      setEditPointNote("");
      ue.success("Punto aggiornato");
    } catch (error) {
      ue.error("Errore nell'aggiornare il punto");
    }
  };
  const handleDeletePoint = async (id) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase.from("map_points").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      setMapPoints((prev) => prev.filter((point) => point.id !== id));
      ue.success("Punto eliminato");
    } catch (error) {
      ue.error("Errore nell'eliminare il punto");
    }
  };
  const flyToPoint = (point) => {
    if (!map) return;
    map.flyTo({ center: [point.lng, point.lat], zoom: Math.max(map.getZoom(), 16), duration: 800 });
  };
  const handleAddAreaClick = () => {
    setSelectedRadius(500);
    setRadiusMode("radius");
    setShowRadiusPickerInline(true);
  };
  const handleConfirmRadiusInline = () => {
    setShowRadiusPickerInline(false);
    setIsWaitingForMapClick(true);
    setOpen(false);
    ue.info("Tocca sulla mappa per posizionare il centro dell'area", { duration: 5e3 });
  };
  const handleCancelRadiusPicker = () => {
    setShowRadiusPickerInline(false);
  };
  const flyToArea = (a) => {
    if (!map) return;
    map.flyTo({ center: [a.lng, a.lat], zoom: Math.max(map.getZoom(), 15), duration: 800 });
  };
  const totalCount = (searchAreas?.length || 0) + mapPoints.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom, 34px) + 80px)",
          right: 12,
          zIndex: 1002,
          pointerEvents: "auto"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "m1x-pill m1x-pill--areas",
            onClick: () => setOpen(true),
            title: "Punti/Aree",
            style: { transform: "scale(0.75)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1x-pill__icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-5 w-5 text-purple-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m1x-pill__label", children: [
                "Punti/Aree (",
                totalCount,
                ")"
              ] })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      GlassModal,
      {
        isOpen: open,
        onClose: () => {
          setOpen(false);
          setShowRadiusPickerInline(false);
        },
        title: "PUNTI E AREE",
        subtitle: "Gestisci i tuoi punti di interesse",
        accentColor: "#7B2EFF",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2 bg-[#0a0a0a] border border-white/10 rounded-xl p-1 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TabsTrigger,
              {
                value: "aree",
                className: "rounded-lg data-[state=active]:bg-[#7B2EFF] data-[state=active]:text-white text-white/60 font-medium transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4 mr-2" }),
                  "Aree (",
                  searchAreas?.length || 0,
                  ")"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TabsTrigger,
              {
                value: "punti",
                className: "rounded-lg data-[state=active]:bg-[#00D1FF] data-[state=active]:text-black text-white/60 font-medium transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 mr-2" }),
                  "Punti (",
                  mapPoints.length,
                  ")"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "aree", className: "mt-0 space-y-4", children: showRadiusPickerInline ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-4 bg-[#0a0a0a] border border-white/10 rounded-xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleCancelRadiusPicker,
                  className: "p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4 text-white" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-medium", children: "Seleziona dimensione area" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-black/50 border border-white/10 rounded-xl p-1 flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: `px-4 py-2 rounded-lg text-sm font-medium transition-all ${radiusMode === "radius" ? "bg-[#7B2EFF] text-white" : "text-white/50 hover:text-white"}`,
                  onClick: () => setRadiusMode("radius"),
                  children: "Raggio"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: `px-4 py-2 rounded-lg text-sm font-medium transition-all ${radiusMode === "diameter" ? "bg-[#7B2EFF] text-white" : "text-white/50 hover:text-white"}`,
                  onClick: () => setRadiusMode("diameter"),
                  children: "Diametro"
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
              radiusOptions.map((option) => {
                const displayValue = radiusMode === "diameter" ? option.value * 2 : option.value;
                const displayLabel = displayValue >= 1e3 ? `${(displayValue / 1e3).toFixed(displayValue % 1e3 === 0 ? 0 : 1)}km` : `${displayValue}m`;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: `p-3 rounded-xl text-center transition-all font-medium text-sm ${selectedRadius === option.value && !showCustomInput ? "bg-[#7B2EFF] text-white shadow-lg shadow-[#7B2EFF]/30" : "bg-black/30 border border-white/10 text-white/60 hover:bg-white/5 hover:text-white"}`,
                    onClick: () => {
                      setSelectedRadius(option.value);
                      setShowCustomInput(false);
                      setCustomRadiusValue("");
                    },
                    children: displayLabel
                  },
                  option.value
                );
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: `p-3 rounded-xl text-center transition-all font-medium text-sm ${showCustomInput ? "bg-[#7B2EFF] text-white shadow-lg shadow-[#7B2EFF]/30" : "bg-black/30 border border-white/10 text-white/60 hover:bg-white/5 hover:text-white"}`,
                  onClick: () => setShowCustomInput(true),
                  children: "✏️ Custom"
                }
              )
            ] }),
            showCustomInput && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 p-3 bg-black/40 border border-[#7B2EFF]/30 rounded-xl", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    min: "50",
                    step: "100",
                    className: "flex-1 p-3 bg-black/50 border border-[#7B2EFF]/40 rounded-xl text-white text-sm font-medium text-center focus:outline-none focus:border-[#7B2EFF] transition-colors",
                    placeholder: radiusMode === "diameter" ? "Diametro in metri" : "Raggio in metri",
                    value: customRadiusValue,
                    onChange: (e) => {
                      setCustomRadiusValue(e.target.value);
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 50) {
                        setSelectedRadius(radiusMode === "diameter" ? Math.round(val / 2) : val);
                      }
                    },
                    autoFocus: true
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50 text-sm font-medium min-w-[20px]", children: "m" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-white/40 mt-2 text-center", children: "Min: 50m • Es: 5000m = 5km, 50000m = 50km" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  onClick: handleCancelRadiusPicker,
                  className: "flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl h-10",
                  children: "Annulla"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  onClick: handleConfirmRadiusInline,
                  className: "flex-1 bg-[#7B2EFF] hover:bg-[#7B2EFF]/80 text-white font-semibold rounded-xl h-10",
                  children: "Conferma"
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: handleAddAreaClick,
                className: "w-full bg-[#7B2EFF] hover:bg-[#7B2EFF]/80 text-white font-semibold rounded-xl h-11",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
                  "Nuova area di ricerca"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: !searchAreas || searchAreas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-white/50 py-6 text-sm", children: 'Nessuna area. Clicca "Nuova" e poi tocca sulla mappa.' }) : searchAreas.map((area) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "p-3 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10 transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-white text-sm", children: area.label || "Area di ricerca" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-white/50 mt-0.5", children: [
                      "Raggio: ",
                      (area.radius / 1e3).toFixed(1),
                      " km"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        size: "sm",
                        variant: "ghost",
                        onClick: () => {
                          onFocus(area.id);
                          flyToArea(area);
                        },
                        className: "h-8 px-3 text-[#7B2EFF] hover:text-[#7B2EFF] hover:bg-[#7B2EFF]/10 rounded-lg text-xs font-medium",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Crosshair, { className: "h-3 w-3 mr-1" }),
                          "Focus"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "sm",
                        variant: "ghost",
                        onClick: () => onDelete(area.id),
                        className: "h-8 px-3 text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                      }
                    )
                  ] })
                ] })
              },
              area.id
            )) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "punti", className: "mt-0 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: handleStartAddPoint,
                disabled: !isAuthenticated,
                className: "w-full bg-[#00D1FF] hover:bg-[#00D1FF]/80 text-black font-semibold rounded-xl h-11",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
                  "Aggiungi punto sulla mappa"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: !isAuthenticated ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-white/50 py-6 text-sm", children: "Accedi per salvare i tuoi punti." }) : loadingPoints ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-white/50 py-6 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block w-5 h-5 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin mb-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Caricamento..." })
            ] }) : mapPoints.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-white/50 py-6 text-sm", children: 'Nessun punto salvato. Clicca "Aggiungi" e poi tocca sulla mappa.' }) : mapPoints.map((point) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "p-3 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10 transition-colors",
                children: editingPointId === point.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      className: "w-full p-3 bg-black/50 border border-[#00D1FF]/30 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D1FF]/60 transition-colors",
                      placeholder: "Titolo del punto",
                      value: editPointTitle,
                      onChange: (e) => setEditPointTitle(e.target.value),
                      autoFocus: true
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      className: "w-full h-20 p-3 bg-black/50 border border-[#00D1FF]/30 rounded-xl text-white text-sm resize-none focus:outline-none focus:border-[#00D1FF]/60 transition-colors",
                      placeholder: "Note sul punto...",
                      value: editPointNote,
                      onChange: (e) => setEditPointNote(e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        size: "sm",
                        onClick: () => handleUpdatePoint(point.id),
                        className: "flex-1 bg-[#00D1FF] hover:bg-[#00D1FF]/80 text-black font-semibold rounded-lg h-9",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3 w-3 mr-1" }),
                          "Salva"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        size: "sm",
                        variant: "outline",
                        onClick: () => {
                          setEditingPointId(null);
                          setEditPointTitle("");
                          setEditPointNote("");
                        },
                        className: "flex-1 border-white/20 text-white hover:bg-white/10 rounded-lg h-9",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3 mr-1" }),
                          "Annulla"
                        ]
                      }
                    )
                  ] })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-white text-sm", children: point.title || "Punto senza titolo" }),
                    point.note && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-white/50 mt-1 line-clamp-2", children: point.note }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-white/30 mt-1 font-mono", children: [
                      point.lat.toFixed(5),
                      ", ",
                      point.lng.toFixed(5)
                    ] })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-3 pt-3 border-t border-white/5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        size: "sm",
                        variant: "ghost",
                        onClick: () => flyToPoint(point),
                        className: "h-8 px-3 text-[#00D1FF] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 rounded-lg text-xs font-medium",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Crosshair, { className: "h-3 w-3 mr-1" }),
                          "Focus"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        size: "sm",
                        variant: "ghost",
                        onClick: () => {
                          setEditingPointId(point.id);
                          setEditPointTitle(point.title);
                          setEditPointNote(point.note || "");
                        },
                        className: "h-8 px-3 text-[#00D1FF] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 rounded-lg text-xs font-medium",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-3 w-3 mr-1" }),
                          "Modifica"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "sm",
                        variant: "ghost",
                        onClick: () => handleDeletePoint(point.id),
                        className: "h-8 px-3 text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                      }
                    )
                  ] })
                ] })
              },
              point.id
            )) })
          ] })
        ] })
      }
    ),
    isAddingPoint && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1003,
          pointerEvents: "none"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: {
              background: "linear-gradient(180deg, rgba(28, 32, 52, 0.95) 0%, rgba(20, 24, 44, 0.98) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(0, 209, 255, 0.3)",
              borderRadius: "16px",
              padding: "12px 24px",
              boxShadow: "0 8px 32px rgba(0, 209, 255, 0.2)"
            },
            className: "text-[#00D1FF] text-sm font-medium animate-pulse",
            children: "Tocca sulla mappa per piazzare il punto"
          }
        )
      }
    ),
    isWaitingForMapClick && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1003,
          pointerEvents: "none"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: {
              background: "linear-gradient(180deg, rgba(28, 32, 52, 0.95) 0%, rgba(20, 24, 44, 0.98) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(123, 46, 255, 0.3)",
              borderRadius: "16px",
              padding: "12px 24px",
              boxShadow: "0 8px 32px rgba(123, 46, 255, 0.2)"
            },
            className: "text-[#7B2EFF] text-sm font-medium animate-pulse",
            children: "Tocca sulla mappa per posizionare l'area"
          }
        )
      }
    )
  ] });
};

function useBattleRealtimeSubscription(battleId) {
  const [state, setState] = reactExports.useState({
    status: "await_defense"
  });
  const [channel, setChannel] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!battleId) {
      setChannel(null);
      return;
    }
    const battleChannel = supabase.channel(`battle:${battleId}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "battles",
        // TRON Battle canonical table
        filter: `id=eq.${battleId}`
      },
      (payload) => {
        const newData = payload.new;
        let mappedStatus = "await_defense";
        if (newData.status === "resolved" || newData.status === "expired") {
          mappedStatus = "resolved";
        } else if (newData.status === "cancelled") {
          mappedStatus = "cancelled";
        } else if (newData.status === "pending" || newData.status === "accepted") {
          mappedStatus = "await_defense";
        }
        setState((prev) => ({
          ...prev,
          status: mappedStatus,
          winnerId: newData.winner_id,
          until: newData.expires_at ? new Date(newData.expires_at).getTime() : void 0
        }));
      }
    ).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "battle_audit",
        // TRON audit events
        filter: `battle_id=eq.${battleId}`
      },
      (payload) => {
        const audit = payload.new;
        setState((prev) => ({
          ...prev,
          lastEvent: {
            type: audit.event_type,
            payload: audit.payload
          }
        }));
      }
    ).subscribe((status) => {
    });
    setChannel(battleChannel);
    return () => {
      battleChannel.unsubscribe();
    };
  }, [battleId]);
  return { state, channel };
}

function MissileTrail2D({ fromLatLng, toLatLng, onEnd }) {
  const [phase, setPhase] = reactExports.useState("flying");
  const [missilePos, setMissilePos] = reactExports.useState({ x: 20, y: 80 });
  const [particles, setParticles] = reactExports.useState([]);
  const [impactParticles, setImpactParticles] = reactExports.useState([]);
  reactExports.useRef(null);
  const rafRef = reactExports.useRef(0);
  const targetX = 80;
  const targetY = 20;
  const startX = 20;
  const startY = 80;
  reactExports.useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();
    let particleId = 0;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const currentX = startX + (targetX - startX) * eased;
      const currentY = startY + (targetY - startY) * eased;
      setMissilePos({ x: currentX, y: currentY });
      if (progress < 1) {
        const newParticles = [];
        for (let i = 0; i < 3; i++) {
          newParticles.push({
            id: particleId++,
            x: currentX + (Math.random() - 0.5) * 2,
            y: currentY + (Math.random() - 0.5) * 2,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 0.3 + 0.1,
            life: 1,
            size: Math.random() * 4 + 2,
            color: Math.random() > 0.5 ? "#ff4444" : "#ffaa00"
          });
        }
        setParticles((prev) => [...prev.slice(-50), ...newParticles]);
      }
      setParticles(
        (prev) => prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.03,
          size: p.size * 0.95
        })).filter((p) => p.life > 0)
      );
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setPhase("impact");
        triggerExplosion();
      }
    };
    animate();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
  const triggerExplosion = () => {
    const explosionParticles = [];
    let id = 0;
    for (let i = 0; i < 30; i++) {
      const angle = i / 30 * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      explosionParticles.push({
        id: id++,
        x: targetX,
        y: targetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: Math.random() * 8 + 4,
        color: ["#ff0000", "#ff4400", "#ff8800", "#ffcc00"][Math.floor(Math.random() * 4)]
      });
    }
    setImpactParticles(explosionParticles);
    let frame = 0;
    const animateExplosion = () => {
      frame++;
      setImpactParticles(
        (prev) => prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vx: p.vx * 0.95,
          vy: p.vy * 0.95,
          life: p.life - 0.04,
          size: p.size * 0.97
        })).filter((p) => p.life > 0)
      );
      if (frame < 40) {
        requestAnimationFrame(animateExplosion);
      } else {
        setPhase("done");
        onEnd?.();
      }
    };
    setTimeout(() => requestAnimationFrame(animateExplosion), 50);
  };
  if (phase === "done") return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "fixed inset-0 pointer-events-none overflow-hidden",
      style: { zIndex: 2e3 },
      children: [
        particles.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute rounded-full",
            style: {
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: p.life,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              transform: "translate(-50%, -50%)"
            }
          },
          p.id
        )),
        phase === "flying" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "absolute",
            style: {
              left: `${missilePos.x}%`,
              top: `${missilePos.y}%`,
              transform: "translate(-50%, -50%) rotate(-45deg)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "relative",
                style: {
                  width: 24,
                  height: 8,
                  background: "linear-gradient(90deg, #333 0%, #666 50%, #ff4444 100%)",
                  borderRadius: "0 4px 4px 0",
                  boxShadow: "0 0 20px #ff4444, 0 0 40px #ff0000"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      style: {
                        position: "absolute",
                        right: -6,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "8px solid #ff4444",
                        borderTop: "5px solid transparent",
                        borderBottom: "5px solid transparent"
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      animate: { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] },
                      transition: { duration: 0.1, repeat: Infinity },
                      style: {
                        position: "absolute",
                        left: -12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 16,
                        height: 6,
                        background: "linear-gradient(90deg, transparent, #ffaa00, #ff4400)",
                        borderRadius: "4px 0 0 4px",
                        filter: "blur(2px)"
                      }
                    }
                  )
                ]
              }
            )
          }
        ),
        phase === "impact" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute",
              initial: { scale: 0, opacity: 1 },
              animate: { scale: 3, opacity: 0 },
              transition: { duration: 0.4 },
              style: {
                left: `${targetX}%`,
                top: `${targetY}%`,
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "radial-gradient(circle, #fff 0%, #ff4400 50%, transparent 100%)",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 60px #ff4400, 0 0 100px #ff0000"
              }
            }
          ),
          impactParticles.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute rounded-full",
              style: {
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity: p.life,
                boxShadow: `0 0 ${p.size}px ${p.color}`,
                transform: "translate(-50%, -50%)"
              }
            },
            p.id
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute",
              initial: { scale: 0, opacity: 0.8 },
              animate: { scale: 4, opacity: 0 },
              transition: { duration: 0.6 },
              style: {
                left: `${targetX}%`,
                top: `${targetY}%`,
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "3px solid #ff4400",
                transform: "translate(-50%, -50%)"
              }
            }
          )
        ] })
      ]
    }
  );
}

function EMPWave2D({ centerLatLng, onEnd }) {
  const [lightnings, setLightnings] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const bolts = [];
    for (let i = 0; i < 12; i++) {
      bolts.push({
        id: i,
        angle: i / 12 * 360 + Math.random() * 15,
        length: 80 + Math.random() * 60,
        delay: Math.random() * 0.5
      });
    }
    setLightnings(bolts);
    const timer = setTimeout(() => {
      onEnd?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onEnd]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "fixed inset-0 pointer-events-none overflow-hidden",
      style: { zIndex: 2e3 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "absolute left-1/2 top-1/2",
            style: { transform: "translate(-50%, -50%)" },
            initial: { scale: 0, opacity: 1 },
            animate: { scale: [0, 1.5, 0.8], opacity: [1, 0.9, 0] },
            transition: { duration: 0.8 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "rounded-full",
                style: {
                  width: 100,
                  height: 100,
                  background: "radial-gradient(circle, #00d4ff 0%, #8b5cf6 50%, transparent 100%)",
                  boxShadow: "0 0 80px #00d4ff, 0 0 120px #8b5cf6"
                }
              }
            )
          }
        ),
        [0, 0.15, 0.3].map((delay, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "absolute left-1/2 top-1/2 rounded-full",
            style: { transform: "translate(-50%, -50%)" },
            initial: { width: 20, height: 20, opacity: 0.9 },
            animate: {
              width: [20, 300 + i * 100],
              height: [20, 300 + i * 100],
              opacity: [0.9, 0]
            },
            transition: { duration: 1.5, delay, ease: "easeOut" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-full h-full rounded-full",
                style: {
                  border: `${3 - i}px solid`,
                  borderColor: i === 0 ? "#00d4ff" : i === 1 ? "#8b5cf6" : "#00ff88",
                  boxShadow: `0 0 20px ${i === 0 ? "#00d4ff" : i === 1 ? "#8b5cf6" : "#00ff88"}`
                }
              }
            )
          },
          i
        )),
        lightnings.map((bolt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "absolute left-1/2 top-1/2",
            style: {
              transform: `translate(-50%, -50%) rotate(${bolt.angle}deg)`,
              transformOrigin: "center center"
            },
            initial: { opacity: 0, scaleY: 0 },
            animate: {
              opacity: [0, 1, 1, 0],
              scaleY: [0, 1, 1, 0.5]
            },
            transition: {
              duration: 0.6,
              delay: bolt.delay,
              times: [0, 0.2, 0.7, 1]
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                style: {
                  width: 3,
                  height: bolt.length,
                  background: `linear-gradient(to top, transparent, ${bolt.id % 3 === 0 ? "#00d4ff" : bolt.id % 3 === 1 ? "#8b5cf6" : "#00ff88"})`,
                  boxShadow: `0 0 10px ${bolt.id % 3 === 0 ? "#00d4ff" : bolt.id % 3 === 1 ? "#8b5cf6" : "#00ff88"}`,
                  marginTop: 30
                }
              }
            )
          },
          bolt.id
        )),
        Array.from({ length: 20 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "absolute left-1/2 top-1/2 rounded-full",
            initial: {
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1
            },
            animate: {
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 400,
              opacity: 0,
              scale: 0
            },
            transition: {
              duration: 1.5,
              delay: Math.random() * 0.3,
              ease: "easeOut"
            },
            style: {
              width: 6 + Math.random() * 6,
              height: 6 + Math.random() * 6,
              backgroundColor: ["#00d4ff", "#8b5cf6", "#00ff88"][Math.floor(Math.random() * 3)],
              boxShadow: "0 0 10px currentColor",
              transform: "translate(-50%, -50%)"
            }
          },
          `particle-${i}`
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "absolute left-1/2 top-1/2 text-center",
            style: { transform: "translate(-50%, -50%)" },
            initial: { opacity: 0, scale: 0.5 },
            animate: { opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.8] },
            transition: { duration: 2, delay: 0.3 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "text-4xl font-bold font-orbitron",
                style: {
                  color: "#00d4ff",
                  textShadow: "0 0 20px #00d4ff, 0 0 40px #8b5cf6"
                },
                children: "⚡ VICTORY ⚡"
              }
            )
          }
        )
      ]
    }
  );
}

function ShieldBubble2D({ targetLatLng, onEnd }) {
  const [hexagons, setHexagons] = reactExports.useState([]);
  reactExports.useEffect(() => {
    setHexagons(Array.from({ length: 6 }, (_, i) => i));
    const timer = setTimeout(() => {
      onEnd?.();
    }, 3e3);
    return () => clearTimeout(timer);
  }, [onEnd]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "fixed inset-0 pointer-events-none overflow-hidden",
      style: { zIndex: 2e3 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            className: "absolute left-1/2 top-1/2",
            style: { transform: "translate(-50%, -50%)" },
            initial: { scale: 0, opacity: 0 },
            animate: {
              scale: [0, 1.3, 1],
              opacity: [0, 0.9, 0.7]
            },
            transition: { duration: 0.5, ease: "easeOut" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "absolute rounded-full",
                  style: {
                    width: 180,
                    height: 180,
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    border: "3px solid #00d4ff",
                    boxShadow: "0 0 30px #00d4ff, 0 0 60px #00d4ff40, inset 0 0 30px #00d4ff40"
                  },
                  animate: {
                    boxShadow: [
                      "0 0 30px #00d4ff, 0 0 60px #00d4ff40, inset 0 0 30px #00d4ff40",
                      "0 0 50px #00d4ff, 0 0 80px #00d4ff60, inset 0 0 50px #00d4ff60",
                      "0 0 30px #00d4ff, 0 0 60px #00d4ff40, inset 0 0 30px #00d4ff40"
                    ]
                  },
                  transition: { duration: 1, repeat: 2 }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "rounded-full",
                  style: {
                    width: 160,
                    height: 160,
                    background: "radial-gradient(circle, rgba(0,212,255,0.3) 0%, rgba(0,212,255,0.1) 50%, transparent 100%)",
                    backdropFilter: "blur(4px)"
                  },
                  animate: {
                    scale: [1, 1.05, 1]
                  },
                  transition: { duration: 0.8, repeat: 3 }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute left-1/2 top-1/2",
                  style: { transform: "translate(-50%, -50%)" },
                  children: hexagons.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      className: "absolute",
                      style: {
                        width: 40,
                        height: 46,
                        left: "50%",
                        top: "50%",
                        transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-50px)`
                      },
                      initial: { opacity: 0, scale: 0 },
                      animate: {
                        opacity: [0, 0.8, 0.6, 0.8, 0],
                        scale: [0, 1, 1, 1, 0]
                      },
                      transition: {
                        duration: 2.5,
                        delay: i * 0.1,
                        times: [0, 0.2, 0.5, 0.8, 1]
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 40 46", className: "w-full h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "polygon",
                        {
                          points: "20,0 40,11.5 40,34.5 20,46 0,34.5 0,11.5",
                          fill: "none",
                          stroke: "#00d4ff",
                          strokeWidth: "2",
                          style: { filter: "drop-shadow(0 0 5px #00d4ff)" }
                        }
                      ) })
                    },
                    i
                  ))
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "absolute left-1/2 top-1/2",
                  style: { transform: "translate(-50%, -50%)" },
                  initial: { opacity: 0, scale: 0.5 },
                  animate: {
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1, 1, 0.8]
                  },
                  transition: { duration: 2.5 },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "text-5xl",
                      style: {
                        filter: "drop-shadow(0 0 10px #00d4ff)"
                      },
                      children: "🛡️"
                    }
                  )
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "absolute left-1/2 top-[60%]",
            style: { transform: "translateX(-50%)" },
            initial: { opacity: 0, y: 20 },
            animate: {
              opacity: [0, 1, 1, 0],
              y: [20, 0, 0, -10]
            },
            transition: { duration: 2.5, times: [0, 0.2, 0.8, 1] },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "text-xl font-bold font-orbitron tracking-wider",
                style: {
                  color: "#00d4ff",
                  textShadow: "0 0 10px #00d4ff, 0 0 20px #00d4ff60"
                },
                children: "DEFENDING"
              }
            )
          }
        ),
        [0, 0.3, 0.6].map((delay, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "absolute left-1/2 top-1/2 rounded-full",
            style: {
              transform: "translate(-50%, -50%)",
              border: "2px solid #00d4ff40"
            },
            initial: { width: 160, height: 160, opacity: 0.6 },
            animate: {
              width: [160, 300],
              height: [160, 300],
              opacity: [0.6, 0]
            },
            transition: {
              duration: 1.5,
              delay: delay + 0.5,
              ease: "easeOut"
            }
          },
          i
        ))
      ]
    }
  );
}

const __vite_import_meta_env__ = {};
function shouldUse3D(requestedMode = "3d-auto") {
  if (requestedMode === "2d") return false;
  const envMode = __vite_import_meta_env__?.VITE_BATTLE_FX_MODE;
  if (envMode === "2d") {
    return false;
  }
  if (requestedMode === "3d-auto") {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      const available = !!gl;
      return available;
    } catch (e) {
      return false;
    }
  }
  return true;
}
function renderBattleFX(config) {
  const use3D = shouldUse3D(config.mode);
  if (use3D) {
    try {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: render2DFallback(config), children: render3DFX(config) });
    } catch (error) {
      return render2DFallback(config);
    }
  }
  return render2DFallback(config);
}
function render2DFallback(config) {
  switch (config.type) {
    case "missile":
      if (!config.from || !config.to) {
        return null;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(MissileTrail2D, { fromLatLng: config.from, toLatLng: config.to, onEnd: config.onEnd });
    case "emp":
      if (!config.center) {
        return null;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EMPWave2D, { centerLatLng: config.center, onEnd: config.onEnd });
    case "shield":
      if (!config.center) {
        return null;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldBubble2D, { targetLatLng: config.center, onEnd: config.onEnd });
    default:
      return null;
  }
}
function render3DFX(config) {
  const { MissileTrail3D, EMPWave3D, ShieldBubble3D } = require("../battle3d");
  switch (config.type) {
    case "missile":
      if (!config.from || !config.to) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(MissileTrail3D, { fromLatLng: config.from, toLatLng: config.to, onEnd: config.onEnd });
    case "emp":
      if (!config.center) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EMPWave3D, { centerLatLng: config.center, onEnd: config.onEnd });
    case "shield":
      if (!config.center) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldBubble3D, { targetLatLng: config.center, onEnd: config.onEnd });
    default:
      return null;
  }
}

function BattleFxLayer({ map, battleFxMode }) {
  const { user, isAuthenticated } = useUnifiedAuth();
  const [activeFx, setActiveFx] = reactExports.useState([]);
  const [currentBattleSessionId, setCurrentBattleSessionId] = reactExports.useState(null);
  const [agentPositions, setAgentPositions] = reactExports.useState(/* @__PURE__ */ new Map());
  const { state: battleState } = useBattleRealtimeSubscription(currentBattleSessionId);
  reactExports.useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const fetchActiveBattle = async () => {
      try {
        const { data, error } = await supabase.from("battles").select("id, creator_id, opponent_id, status").or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`).in("status", ["pending", "accepted", "countdown", "active"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (error) {
          return;
        }
        if (data) {
          const activeBattle = data;
          setCurrentBattleSessionId(activeBattle.id);
        } else {
          setCurrentBattleSessionId(null);
        }
      } catch (e) {
      }
    };
    fetchActiveBattle();
    const interval = setInterval(fetchActiveBattle, 1e4);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);
  reactExports.useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAgentPositions = async () => {
      try {
        const { data, error } = await supabase.from("agent_locations").select("agent_id, lat, lng, updated_at").order("updated_at", { ascending: false, nullsFirst: false }).limit(100);
        if (error) {
          return;
        }
        if (data) {
          const posMap = /* @__PURE__ */ new Map();
          data.forEach((loc) => {
            if (!posMap.has(loc.agent_id)) {
              posMap.set(loc.agent_id, { lat: loc.lat, lng: loc.lng });
            }
          });
          setAgentPositions(posMap);
        }
      } catch (e) {
      }
    };
    fetchAgentPositions();
    const channel = supabase.channel("agent-locations-fx").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "agent_locations"
    }, () => {
      fetchAgentPositions();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);
  reactExports.useEffect(() => {
    if (!battleState || !map) return;
    const handleBattleEvent = async () => {
      const event = battleState.lastEvent;
      if (!event) return;
      try {
        if (!currentBattleSessionId) return;
        const { data: session, error } = await supabase.from("battles").select("creator_id, opponent_id, stake_type, stake_amount").eq("id", currentBattleSessionId).maybeSingle();
        if (error || !session) {
          return;
        }
        const sessionData = session;
        const attackerPos = agentPositions.get(sessionData.creator_id);
        const defenderPos = agentPositions.get(sessionData.opponent_id);
        if (!attackerPos || !defenderPos) {
          return;
        }
        const fxMode = battleFxMode === "high" ? "3d-auto" : "2d";
        switch (event.type) {
          case "attack_started": {
            const fxId = `attack-${Date.now()}`;
            const fxNode = renderBattleFX({
              type: "missile",
              from: [attackerPos.lat, attackerPos.lng],
              to: [defenderPos.lat, defenderPos.lng],
              mode: fxMode,
              onEnd: () => removeFx(fxId)
            });
            setActiveFx((prev) => [...prev, {
              id: fxId,
              node: fxNode,
              createdAt: Date.now()
            }]);
            break;
          }
          case "defense_needed": {
            const fxId = `defense-${Date.now()}`;
            const fxNode = renderBattleFX({
              type: "shield",
              center: [defenderPos.lat, defenderPos.lng],
              mode: fxMode,
              onEnd: () => removeFx(fxId)
            });
            setActiveFx((prev) => [...prev, {
              id: fxId,
              node: fxNode,
              createdAt: Date.now()
            }]);
            break;
          }
          case "battle_resolved": {
            const winnerId = battleState.winnerId;
            if (!winnerId) return;
            const winnerPos = agentPositions.get(winnerId);
            if (!winnerPos) return;
            const fxId = `resolved-${Date.now()}`;
            const fxNode = renderBattleFX({
              type: "emp",
              center: [winnerPos.lat, winnerPos.lng],
              mode: fxMode,
              onEnd: () => {
                removeFx(fxId);
                setCurrentBattleSessionId(null);
              }
            });
            setActiveFx((prev) => [...prev, {
              id: fxId,
              node: fxNode,
              createdAt: Date.now()
            }]);
            break;
          }
        }
      } catch (e) {
      }
    };
    handleBattleEvent();
  }, [battleState, map, battleFxMode, currentBattleSessionId, agentPositions]);
  const removeFx = reactExports.useCallback((id) => {
    setActiveFx((prev) => prev.filter((fx) => fx.id !== id));
  }, []);
  reactExports.useEffect(() => {
    const MAX_FX_DURATION = 5e3;
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveFx((prev) => prev.filter((fx) => now - fx.createdAt < MAX_FX_DURATION));
    }, 1e3);
    return () => clearInterval(interval);
  }, []);
  reactExports.useEffect(() => {
    const MAX_SIMULTANEOUS_FX = battleFxMode === "high" ? 10 : 5;
    if (activeFx.length > MAX_SIMULTANEOUS_FX) {
      setActiveFx((prev) => prev.slice(-MAX_SIMULTANEOUS_FX));
    }
  }, [activeFx.length, battleFxMode]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute inset-0 pointer-events-none",
      style: { zIndex: 999 },
      children: activeFx.map((fx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: fx.node }, fx.id))
    }
  );
}

function MapBattleOverlay({ map, battle, timeLeft, result }) {
  const [attackerScreen, setAttackerScreen] = reactExports.useState(null);
  const [defenderScreen, setDefenderScreen] = reactExports.useState(null);
  const [missilePos, setMissilePos] = reactExports.useState(null);
  const [showExplosion, setShowExplosion] = reactExports.useState(false);
  const [trailParticles, setTrailParticles] = reactExports.useState([]);
  const animationRef = reactExports.useRef(null);
  const particleIdRef = reactExports.useRef(0);
  const updateScreenPositions = () => {
    if (!map || !battle) return;
    try {
      const attackerPoint = map.project([battle.attackerLng, battle.attackerLat]);
      const defenderPoint = map.project([battle.defenderLng, battle.defenderLat]);
      setAttackerScreen({ x: attackerPoint.x, y: attackerPoint.y });
      setDefenderScreen({ x: defenderPoint.x, y: defenderPoint.y });
    } catch (e) {
    }
  };
  reactExports.useEffect(() => {
    if (!map || !battle) return;
    updateScreenPositions();
    map.on("move", updateScreenPositions);
    map.on("zoom", updateScreenPositions);
    return () => {
      map.off("move", updateScreenPositions);
      map.off("zoom", updateScreenPositions);
    };
  }, [map, battle]);
  reactExports.useEffect(() => {
    if (!battle || !attackerScreen || !defenderScreen) return;
    const totalDuration = battle.duration * 1e3;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const x = attackerScreen.x + (defenderScreen.x - attackerScreen.x) * easeProgress;
      const y = attackerScreen.y + (defenderScreen.y - attackerScreen.y) * easeProgress;
      const arcHeight = Math.min(200, Math.abs(defenderScreen.x - attackerScreen.x) * 0.4);
      const arcY = y - Math.sin(progress * Math.PI) * arcHeight;
      setMissilePos({ x, y: arcY });
      if (progress < 1 && elapsed % 50 < 20) {
        particleIdRef.current++;
        setTrailParticles((prev) => [...prev.slice(-30), {
          id: particleIdRef.current,
          x: x + (Math.random() - 0.5) * 10,
          y: arcY + (Math.random() - 0.5) * 10
        }]);
      }
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setShowExplosion(true);
        setTrailParticles([]);
        setTimeout(() => setShowExplosion(false), 2500);
      }
    };
    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [battle, attackerScreen, defenderScreen]);
  if (!battle || !attackerScreen || !defenderScreen) return null;
  const angle = missilePos ? Math.atan2(defenderScreen.y - attackerScreen.y, defenderScreen.x - attackerScreen.x) * (180 / Math.PI) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 pointer-events-none z-[2000]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-24 left-1/2 -translate-x-1/2 z-[2001]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "px-8 py-4 rounded-2xl bg-gradient-to-r from-black/90 via-red-950/80 to-black/90 backdrop-blur-md border border-red-500/50",
        initial: { y: -50, opacity: 0, scale: 0.8 },
        animate: { y: 0, opacity: 1, scale: 1 },
        style: {
          boxShadow: "0 0 40px rgba(255,50,50,0.4), inset 0 0 30px rgba(255,0,0,0.1)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-red-400 uppercase tracking-[0.3em] mb-2 flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.span,
              {
                animate: { opacity: [1, 0.3, 1] },
                transition: { duration: 0.5, repeat: Infinity },
                children: "●"
              }
            ),
            "BATTLE IN PROGRESS",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.span,
              {
                animate: { opacity: [1, 0.3, 1] },
                transition: { duration: 0.5, repeat: Infinity },
                children: "●"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "text-4xl font-bold text-white font-mono",
              style: { textShadow: "0 0 20px rgba(255,100,100,0.8)" },
              children: [
                Math.floor(timeLeft / 60),
                ":",
                String(timeLeft % 60).padStart(2, "0")
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-400 mt-2", children: [
            "Target: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 font-semibold", children: battle.defenderName })
          ] })
        ] })
      }
    ) }),
    missilePos && /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "absolute inset-0 w-full h-full", style: { filter: "url(#glow)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "beamGradient", x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#00ffff", stopOpacity: "0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "30%", stopColor: "#00ffff", stopOpacity: "0.3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "70%", stopColor: "#ff00ff", stopOpacity: "0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#ff4444", stopOpacity: "0.8" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("filter", { id: "glow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("feGaussianBlur", { stdDeviation: "4", result: "coloredBlur" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("feMerge", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "coloredBlur" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "SourceGraphic" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.line,
        {
          x1: attackerScreen.x,
          y1: attackerScreen.y,
          x2: missilePos.x,
          y2: missilePos.y,
          stroke: "url(#beamGradient)",
          strokeWidth: "6",
          initial: { pathLength: 0 },
          animate: { pathLength: 1 }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.line,
        {
          x1: attackerScreen.x,
          y1: attackerScreen.y,
          x2: missilePos.x,
          y2: missilePos.y,
          stroke: "#00ffff",
          strokeWidth: "2",
          strokeDasharray: "15 10",
          opacity: "0.6"
        }
      )
    ] }),
    trailParticles.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "absolute w-2 h-2 rounded-full",
        style: {
          left: p.x,
          top: p.y,
          background: "radial-gradient(circle, #00ffff 0%, #ff00ff 50%, transparent 100%)",
          boxShadow: "0 0 10px #00ffff"
        },
        initial: { scale: 1, opacity: 0.8 },
        animate: { scale: 0, opacity: 0 },
        transition: { duration: 0.8 }
      },
      p.id
    )),
    missilePos && !showExplosion && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "absolute",
        style: {
          left: missilePos.x,
          top: missilePos.y,
          transform: `translate(-50%, -50%) rotate(${angle}deg)`
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute -inset-6 rounded-full",
              style: {
                background: "radial-gradient(circle, rgba(0,255,255,0.3) 0%, rgba(255,0,255,0.2) 50%, transparent 70%)"
              },
              animate: { scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] },
              transition: { duration: 0.3, repeat: Infinity }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", style: { width: "50px", height: "20px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                style: {
                  width: "50px",
                  height: "20px",
                  background: "linear-gradient(180deg, #4a5568 0%, #1a202c 50%, #2d3748 100%)",
                  borderRadius: "10px 4px 4px 10px",
                  border: "1px solid rgba(0,255,255,0.5)",
                  boxShadow: "0 0 20px rgba(0,255,255,0.6), 0 0 40px rgba(255,0,255,0.4), inset 0 2px 4px rgba(255,255,255,0.2)"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/2 left-2 right-4 h-px bg-gradient-to-r from-cyan-400 to-purple-400 opacity-60", style: { transform: "translateY(-50%)" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      className: "absolute top-1 left-3 w-2 h-2 rounded-full bg-cyan-400",
                      animate: { opacity: [1, 0.3, 1] },
                      transition: { duration: 0.2, repeat: Infinity },
                      style: { boxShadow: "0 0 8px #00ffff" }
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute -right-3 top-1/2",
                style: {
                  transform: "translateY(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "16px solid #00ffff",
                  borderTop: "10px solid transparent",
                  borderBottom: "10px solid transparent",
                  filter: "drop-shadow(0 0 8px #00ffff)"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "absolute -left-8 top-1/2",
                style: { transform: "translateY(-50%)" },
                animate: { scaleX: [1, 1.5, 1], opacity: [0.8, 1, 0.8] },
                transition: { duration: 0.08, repeat: Infinity },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                  width: "35px",
                  height: "18px",
                  background: "radial-gradient(ellipse at right, #ff00ff 0%, #ff4444 30%, #ff8800 60%, transparent 100%)",
                  borderRadius: "50%",
                  filter: "blur(3px)"
                } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "absolute -left-4 top-1/2",
                style: { transform: "translateY(-50%)" },
                animate: { scaleX: [1, 1.3, 1] },
                transition: { duration: 0.05, repeat: Infinity },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                  width: "20px",
                  height: "10px",
                  background: "radial-gradient(ellipse at right, #fff 0%, #00ffff 50%, transparent 100%)",
                  borderRadius: "50%",
                  filter: "blur(2px)"
                } })
              }
            ),
            Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "absolute rounded-full",
                style: {
                  left: -12 - i * 3,
                  top: 6 + (Math.random() - 0.5) * 12,
                  width: 3 - i * 0.3,
                  height: 3 - i * 0.3,
                  backgroundColor: ["#00ffff", "#ff00ff", "#fff", "#ff4444"][i % 4]
                },
                animate: {
                  x: [-5, -25],
                  opacity: [1, 0],
                  scale: [1, 0.3]
                },
                transition: {
                  duration: 0.2,
                  repeat: Infinity,
                  delay: i * 0.02
                }
              },
              i
            ))
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showExplosion && defenderScreen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      [0, 1, 2].map((ring) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute rounded-full border-2",
          style: {
            left: defenderScreen.x,
            top: defenderScreen.y,
            transform: "translate(-50%, -50%)",
            borderColor: ["#00ffff", "#ff00ff", "#ff4444"][ring]
          },
          initial: { width: 0, height: 0, opacity: 1 },
          animate: { width: 300 + ring * 50, height: 300 + ring * 50, opacity: 0 },
          transition: { duration: 1.5, delay: ring * 0.1 }
        },
        `ring-${ring}`
      )),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute",
          style: { left: defenderScreen.x, top: defenderScreen.y, transform: "translate(-50%, -50%)" },
          initial: { scale: 0, opacity: 1 },
          animate: { scale: 4, opacity: 0 },
          transition: { duration: 0.8 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-40 h-40 rounded-full",
              style: {
                background: "radial-gradient(circle, #fff 0%, #00ffff 20%, #ff00ff 40%, #ff4444 60%, transparent 80%)",
                boxShadow: "0 0 80px #00ffff, 0 0 120px #ff00ff"
              }
            }
          )
        }
      ),
      Array.from({ length: 30 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute rounded-full",
          style: {
            left: defenderScreen.x,
            top: defenderScreen.y,
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            backgroundColor: ["#00ffff", "#ff00ff", "#fff", "#ff4444", "#ffff00"][i % 5],
            boxShadow: `0 0 10px ${["#00ffff", "#ff00ff", "#fff"][i % 3]}`
          },
          initial: { x: 0, y: 0, scale: 1, opacity: 1 },
          animate: {
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300,
            scale: 0,
            opacity: 0
          },
          transition: { duration: 1.5, delay: i * 0.02, ease: "easeOut" }
        },
        i
      )),
      [1, 2, 3].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute rounded-full",
          style: {
            left: defenderScreen.x + (Math.random() - 0.5) * 80,
            top: defenderScreen.y + (Math.random() - 0.5) * 80,
            transform: "translate(-50%, -50%)"
          },
          initial: { scale: 0, opacity: 1 },
          animate: { scale: 2, opacity: 0 },
          transition: { duration: 0.6, delay: 0.2 + n * 0.15 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-16 h-16 rounded-full",
              style: {
                background: "radial-gradient(circle, #fff 0%, #ff8800 50%, transparent 100%)"
              }
            }
          )
        },
        `sec-${n}`
      ))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: result && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            className: "text-center",
            initial: { scale: 0.3, y: 50, rotateX: 90 },
            animate: { scale: 1, y: 0, rotateX: 0 },
            transition: { type: "spring", damping: 12 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "text-9xl mb-6",
                  animate: {
                    scale: [1, 1.1, 1],
                    rotate: result.won ? [0, 5, -5, 0] : [0, -3, 3, 0]
                  },
                  transition: { duration: 1, repeat: Infinity },
                  children: result.won ? "🏆" : "💀"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: `text-6xl font-bold ${result.won ? "text-green-400" : "text-red-400"}`,
                  style: {
                    textShadow: `0 0 40px ${result.won ? "rgba(74,222,128,0.8)" : "rgba(248,113,113,0.8)"}`,
                    fontFamily: "Orbitron, sans-serif"
                  },
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.3 },
                  children: result.won ? "VICTORY!" : "DEFEATED!"
                }
              )
            ]
          }
        )
      }
    ) }),
    defenderScreen && !showExplosion && !result && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "absolute",
        style: { left: defenderScreen.x, top: defenderScreen.y, transform: "translate(-50%, -50%)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.svg,
            {
              width: "80",
              height: "80",
              viewBox: "0 0 80 80",
              animate: { rotate: 360 },
              transition: { duration: 4, repeat: Infinity, ease: "linear" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "40", cy: "40", r: "35", fill: "none", stroke: "#ff4444", strokeWidth: "2", strokeDasharray: "8 4", opacity: "0.8" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "40", cy: "40", r: "25", fill: "none", stroke: "#00ffff", strokeWidth: "1", opacity: "0.6" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "40", cy: "40", r: "15", fill: "none", stroke: "#ff00ff", strokeWidth: "1", opacity: "0.4" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute inset-0 flex items-center justify-center",
              animate: { scale: [1, 1.2, 1] },
              transition: { duration: 1, repeat: Infinity },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-red-500", style: { boxShadow: "0 0 10px #ff0000" } })
            }
          )
        ]
      }
    )
  ] });
}

function useMyActiveBattles(userId) {
  const [activeBattles, setActiveBattles] = reactExports.useState([]);
  const [pendingChallenges, setPendingChallenges] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const fetchBattles = async () => {
    if (!userId) {
      setActiveBattles([]);
      setPendingChallenges([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: active, error: activeError } = await supabase.from("battles").select("*").or(`creator_id.eq.${userId},opponent_id.eq.${userId}`).in("status", ["accepted", "ready", "countdown", "active"]).order("created_at", { ascending: false });
      if (activeError) throw activeError;
      const { data: pending, error: pendingError } = await supabase.from("battles").select("*").eq("opponent_id", userId).eq("status", "pending").order("created_at", { ascending: false });
      if (pendingError) throw pendingError;
      setActiveBattles(active || []);
      setPendingChallenges(pending || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    fetchBattles();
    const channel = supabase.channel(`my-battles-${userId}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "battles",
        filter: `creator_id=eq.${userId}`
      },
      () => fetchBattles()
    ).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "battles",
        filter: `opponent_id=eq.${userId}`
      },
      () => fetchBattles()
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  return {
    activeBattles,
    pendingChallenges,
    loading,
    error,
    refetch: fetchBattles
  };
}

function useBattleSystem() {
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [currentSession, setCurrentSession] = reactExports.useState(null);
  const startAttack = reactExports.useCallback(async (defenderId, weaponKey) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("start_battle_v2", {
        p_defender_id: defenderId,
        p_weapon_key: weaponKey,
        p_client_nonce: crypto.randomUUID()
      });
      if (error) {
        ue.error("Attack failed", {
          description: error.message
        });
        return null;
      }
      if (!data.success) {
        ue.error("Attack failed", {
          description: data.error || "Unknown error"
        });
        return null;
      }
      setCurrentSession(data.session_id || null);
      ue.success("Attack initiated!", {
        description: `Waiting for defense... (60s)`
      });
      return {
        session_id: data.session_id,
        expires_at: data.expires_at
      };
    } catch (err) {
      ue.error("System error", {
        description: "Failed to start battle"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  const submitDefense = reactExports.useCallback(async (sessionId, defenseKey) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("submit_defense_v2", {
        p_session_id: sessionId,
        p_defense_key: defenseKey
      });
      if (error) {
        ue.error("Defense failed", {
          description: error.message
        });
        return null;
      }
      if (!data.success) {
        ue.error("Defense failed", {
          description: data.error || "Unknown error"
        });
        return null;
      }
      setCurrentSession(null);
      const outcome = data.outcome === "attacker_win" ? "Attacker wins!" : "Defender wins!";
      ue.success("Battle resolved!", {
        description: outcome
      });
      return {
        status: "resolved",
        winner_id: data.winner_id
      };
    } catch (err) {
      ue.error("System error", {
        description: "Failed to submit defense"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  const getMyBattles = reactExports.useCallback(async (status, limit = 20) => {
    try {
      const { data, error } = await supabase.rpc("get_my_battles", {
        p_status: status || null,
        p_limit: limit
      });
      if (error) {
        return [];
      }
      return data || [];
    } catch (err) {
      return [];
    }
  }, []);
  const getMyCooldowns = reactExports.useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_my_cooldowns");
      if (error) {
        return [];
      }
      return data || [];
    } catch (err) {
      return [];
    }
  }, []);
  const getWeaponsCatalog = reactExports.useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_weapons_catalog");
      if (error) {
        return [];
      }
      return data || [];
    } catch (err) {
      return [];
    }
  }, []);
  const getDefenseCatalog = reactExports.useCallback(async () => {
    try {
      const { data, error } = await supabase.from("defense_catalog").select("key, name, description, power, m1u_cost, cooldown_sec, effect_key, min_rank").eq("enabled", true).order("power", { ascending: true });
      if (error) {
        return [];
      }
      return data || [];
    } catch (err) {
      return [];
    }
  }, []);
  const isUserAttackable = reactExports.useCallback(async (userId) => {
    try {
      const { data: agentData, error: agentError } = await supabase.from("agent_locations").select("status, last_seen").eq("user_id", userId).eq("status", "online").gte("last_seen", new Date(Date.now() - 5 * 60 * 1e3).toISOString()).maybeSingle();
      if (agentError || !agentData) {
        return false;
      }
      const { data: battleData, error: battleError } = await supabase.from("battle_sessions").select("id").eq("defender_id", userId).eq("status", "await_defense").maybeSingle();
      if (battleError) {
        return false;
      }
      return !battleData;
    } catch (err) {
      return false;
    }
  }, []);
  const finalizeExpired = reactExports.useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("finalize_expired_battles");
      if (error) {
        return 0;
      }
      const count = data || 0;
      return count;
    } catch (err) {
      return 0;
    }
  }, []);
  return {
    // State
    isLoading,
    currentSession,
    // Actions (FASE 2 completa)
    startAttack,
    submitDefense,
    finalizeExpired,
    // Queries
    getMyBattles,
    getMyCooldowns,
    getWeaponsCatalog,
    getDefenseCatalog,
    isUserAttackable
  };
}

function BattleHUD({ sessionId, onClose }) {
  const [isExpanded, setIsExpanded] = reactExports.useState(true);
  const [selectedDefense, setSelectedDefense] = reactExports.useState("");
  const [timeLeft, setTimeLeft] = reactExports.useState(0);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [actionHistory, setActionHistory] = reactExports.useState([]);
  const { submitDefense, getDefenseCatalog } = useBattleSystem();
  const [defenseCatalog, setDefenseCatalog] = reactExports.useState([]);
  const [catalogLoading, setCatalogLoading] = reactExports.useState(false);
  const { state } = useBattleRealtimeSubscription(sessionId);
  reactExports.useEffect(() => {
    if (!sessionId) return;
    const loadDefenses = async () => {
      setCatalogLoading(true);
      const defenses = await getDefenseCatalog();
      setDefenseCatalog(defenses);
      setCatalogLoading(false);
    };
    loadDefenses();
  }, [sessionId, getDefenseCatalog]);
  reactExports.useEffect(() => {
    if (!state.lastEvent) return;
    const newAction = {
      id: `${state.lastEvent.type}-${Date.now()}`,
      type: state.lastEvent.type,
      timestamp: Date.now(),
      description: formatEventDescription(state.lastEvent.type, state.lastEvent.payload)
    };
    setActionHistory((prev) => [newAction, ...prev].slice(0, 3));
  }, [state.lastEvent]);
  reactExports.useEffect(() => {
    if (!state.until || state.status !== "await_defense") {
      setTimeLeft(0);
      return;
    }
    const updateTimer = () => {
      const remaining = Math.max(0, state.until - Date.now());
      setTimeLeft(Math.floor(remaining / 1e3));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1e3);
    return () => clearInterval(interval);
  }, [state.until, state.status]);
  const handleDefend = async () => {
    if (!sessionId || !selectedDefense || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await submitDefense(sessionId, selectedDefense);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!sessionId) return null;
  const isResolved = state.status === "resolved";
  const isCancelled = state.status === "cancelled";
  const canDefend = state.status === "await_defense" && timeLeft > 0 && !isSubmitting;
  const getStatusColor = () => {
    if (isResolved) return "text-muted-foreground";
    if (isCancelled) return "text-muted-foreground";
    if (timeLeft < 10) return "text-destructive";
    return "text-foreground";
  };
  const getStatusText = () => {
    if (isResolved) return state.winnerId ? `Winner: ${state.winnerId.slice(0, 8)}...` : "Battle concluded";
    if (isCancelled) return "Battle cancelled";
    return "You are under attack!";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "fixed bottom-20 right-4 w-80 z-40 shadow-lg border-primary/20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-5 w-5 text-destructive" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Battle Active" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          state.status === "await_defense" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
              timeLeft,
              "s"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => setIsExpanded(!isExpanded),
              className: "h-8 w-8 p-0",
              children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" })
            }
          )
        ] })
      ] }),
      isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: `text-xs ${getStatusColor()}`, children: getStatusText() })
    ] }),
    isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
      actionHistory.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-medium flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3 w-3" }),
          "Recent Actions"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-16 rounded-md border border-border/50 bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 space-y-1", children: actionHistory.map((action) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px]", children: new Date(action.timestamp).toLocaleTimeString() }),
          " · ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: action.description })
        ] }, action.id)) }) })
      ] }),
      !isResolved && !isCancelled ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-medium flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3" }),
            "Select Defense"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: selectedDefense,
              onValueChange: setSelectedDefense,
              disabled: !canDefend || catalogLoading,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose defense..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: catalogLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "loading", disabled: true, children: "Loading..." }) : defenseCatalog.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", disabled: true, children: "No defenses available" }) : defenseCatalog.map((defense) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: defense.key, children: [
                  defense.name,
                  " (Power: ",
                  defense.power,
                  ")"
                ] }, defense.key)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleDefend,
            disabled: !canDefend || !selectedDefense,
            className: "w-full h-9 text-sm",
            variant: timeLeft < 10 ? "destructive" : "default",
            children: isSubmitting ? "Activating..." : timeLeft < 10 ? "DEFEND NOW!" : "Activate Defense"
          }
        ),
        timeLeft === 0 && state.status === "await_defense" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive text-center", children: "Time expired - awaiting resolution" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: isCancelled ? "Battle Cancelled" : "Battle Concluded" }),
        state.winnerId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Winner: ",
          state.winnerId.slice(0, 12),
          "..."
        ] }),
        onClose && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, variant: "outline", size: "sm", className: "mt-2", children: "Close" })
      ] })
    ] })
  ] });
}
function formatEventDescription(type, payload) {
  switch (type) {
    case "attack_started":
      return `Attack initiated with ${payload?.weapon || "weapon"}`;
    case "defense_needed":
      return "Defense window open";
    case "battle_resolved":
      return `Battle resolved - ${payload?.outcome || "complete"}`;
    default:
      return `Event: ${type}`;
  }
}

function BattleMount({ sessionId, onClose }) {
  if (!sessionId) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BattleHUD, { sessionId, onClose });
}

var PAGE_KEYS = ["PageUp", "PageDown"];
var ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
var BACK_KEYS = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
};
var SLIDER_NAME = "Slider";
var [Collection, useCollection, createCollectionScope] = createCollection(SLIDER_NAME);
var [createSliderContext] = createContextScope(SLIDER_NAME, [
  createCollectionScope
]);
var [SliderProvider, useSliderContext] = createSliderContext(SLIDER_NAME);
var Slider$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      name,
      min = 0,
      max = 100,
      step = 1,
      orientation = "horizontal",
      disabled = false,
      minStepsBetweenThumbs = 0,
      defaultValue = [min],
      value,
      onValueChange = () => {
      },
      onValueCommit = () => {
      },
      inverted = false,
      form,
      ...sliderProps
    } = props;
    const thumbRefs = reactExports.useRef(/* @__PURE__ */ new Set());
    const valueIndexToChangeRef = reactExports.useRef(0);
    const isHorizontal = orientation === "horizontal";
    const SliderOrientation = isHorizontal ? SliderHorizontal : SliderVertical;
    const [values = [], setValues] = useControllableState({
      prop: value,
      defaultProp: defaultValue,
      onChange: (value2) => {
        const thumbs = [...thumbRefs.current];
        thumbs[valueIndexToChangeRef.current]?.focus();
        onValueChange(value2);
      }
    });
    const valuesBeforeSlideStartRef = reactExports.useRef(values);
    function handleSlideStart(value2) {
      const closestIndex = getClosestValueIndex(values, value2);
      updateValues(value2, closestIndex);
    }
    function handleSlideMove(value2) {
      updateValues(value2, valueIndexToChangeRef.current);
    }
    function handleSlideEnd() {
      const prevValue = valuesBeforeSlideStartRef.current[valueIndexToChangeRef.current];
      const nextValue = values[valueIndexToChangeRef.current];
      const hasChanged = nextValue !== prevValue;
      if (hasChanged) onValueCommit(values);
    }
    function updateValues(value2, atIndex, { commit } = { commit: false }) {
      const decimalCount = getDecimalCount(step);
      const snapToStep = roundValue(Math.round((value2 - min) / step) * step + min, decimalCount);
      const nextValue = clamp(snapToStep, [min, max]);
      setValues((prevValues = []) => {
        const nextValues = getNextSortedValues(prevValues, nextValue, atIndex);
        if (hasMinStepsBetweenValues(nextValues, minStepsBetweenThumbs * step)) {
          valueIndexToChangeRef.current = nextValues.indexOf(nextValue);
          const hasChanged = String(nextValues) !== String(prevValues);
          if (hasChanged && commit) onValueCommit(nextValues);
          return hasChanged ? nextValues : prevValues;
        } else {
          return prevValues;
        }
      });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SliderProvider,
      {
        scope: props.__scopeSlider,
        name,
        disabled,
        min,
        max,
        valueIndexToChangeRef,
        thumbs: thumbRefs.current,
        values,
        orientation,
        form,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeSlider, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: props.__scopeSlider, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SliderOrientation,
          {
            "aria-disabled": disabled,
            "data-disabled": disabled ? "" : void 0,
            ...sliderProps,
            ref: forwardedRef,
            onPointerDown: composeEventHandlers(sliderProps.onPointerDown, () => {
              if (!disabled) valuesBeforeSlideStartRef.current = values;
            }),
            min,
            max,
            inverted,
            onSlideStart: disabled ? void 0 : handleSlideStart,
            onSlideMove: disabled ? void 0 : handleSlideMove,
            onSlideEnd: disabled ? void 0 : handleSlideEnd,
            onHomeKeyDown: () => !disabled && updateValues(min, 0, { commit: true }),
            onEndKeyDown: () => !disabled && updateValues(max, values.length - 1, { commit: true }),
            onStepKeyDown: ({ event, direction: stepDirection }) => {
              if (!disabled) {
                const isPageKey = PAGE_KEYS.includes(event.key);
                const isSkipKey = isPageKey || event.shiftKey && ARROW_KEYS.includes(event.key);
                const multiplier = isSkipKey ? 10 : 1;
                const atIndex = valueIndexToChangeRef.current;
                const value2 = values[atIndex];
                const stepInDirection = step * multiplier * stepDirection;
                updateValues(value2 + stepInDirection, atIndex, { commit: true });
              }
            }
          }
        ) }) })
      }
    );
  }
);
Slider$1.displayName = SLIDER_NAME;
var [SliderOrientationProvider, useSliderOrientationContext] = createSliderContext(SLIDER_NAME, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
});
var SliderHorizontal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      min,
      max,
      dir,
      inverted,
      onSlideStart,
      onSlideMove,
      onSlideEnd,
      onStepKeyDown,
      ...sliderProps
    } = props;
    const [slider, setSlider] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setSlider(node));
    const rectRef = reactExports.useRef(void 0);
    const direction = useDirection(dir);
    const isDirectionLTR = direction === "ltr";
    const isSlidingFromLeft = isDirectionLTR && !inverted || !isDirectionLTR && inverted;
    function getValueFromPointer(pointerPosition) {
      const rect = rectRef.current || slider.getBoundingClientRect();
      const input = [0, rect.width];
      const output = isSlidingFromLeft ? [min, max] : [max, min];
      const value = linearScale(input, output);
      rectRef.current = rect;
      return value(pointerPosition - rect.left);
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SliderOrientationProvider,
      {
        scope: props.__scopeSlider,
        startEdge: isSlidingFromLeft ? "left" : "right",
        endEdge: isSlidingFromLeft ? "right" : "left",
        direction: isSlidingFromLeft ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SliderImpl,
          {
            dir: direction,
            "data-orientation": "horizontal",
            ...sliderProps,
            ref: composedRefs,
            style: {
              ...sliderProps.style,
              ["--radix-slider-thumb-transform"]: "translateX(-50%)"
            },
            onSlideStart: (event) => {
              const value = getValueFromPointer(event.clientX);
              onSlideStart?.(value);
            },
            onSlideMove: (event) => {
              const value = getValueFromPointer(event.clientX);
              onSlideMove?.(value);
            },
            onSlideEnd: () => {
              rectRef.current = void 0;
              onSlideEnd?.();
            },
            onStepKeyDown: (event) => {
              const slideDirection = isSlidingFromLeft ? "from-left" : "from-right";
              const isBackKey = BACK_KEYS[slideDirection].includes(event.key);
              onStepKeyDown?.({ event, direction: isBackKey ? -1 : 1 });
            }
          }
        )
      }
    );
  }
);
var SliderVertical = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      min,
      max,
      inverted,
      onSlideStart,
      onSlideMove,
      onSlideEnd,
      onStepKeyDown,
      ...sliderProps
    } = props;
    const sliderRef = reactExports.useRef(null);
    const ref = useComposedRefs(forwardedRef, sliderRef);
    const rectRef = reactExports.useRef(void 0);
    const isSlidingFromBottom = !inverted;
    function getValueFromPointer(pointerPosition) {
      const rect = rectRef.current || sliderRef.current.getBoundingClientRect();
      const input = [0, rect.height];
      const output = isSlidingFromBottom ? [max, min] : [min, max];
      const value = linearScale(input, output);
      rectRef.current = rect;
      return value(pointerPosition - rect.top);
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SliderOrientationProvider,
      {
        scope: props.__scopeSlider,
        startEdge: isSlidingFromBottom ? "bottom" : "top",
        endEdge: isSlidingFromBottom ? "top" : "bottom",
        size: "height",
        direction: isSlidingFromBottom ? 1 : -1,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SliderImpl,
          {
            "data-orientation": "vertical",
            ...sliderProps,
            ref,
            style: {
              ...sliderProps.style,
              ["--radix-slider-thumb-transform"]: "translateY(50%)"
            },
            onSlideStart: (event) => {
              const value = getValueFromPointer(event.clientY);
              onSlideStart?.(value);
            },
            onSlideMove: (event) => {
              const value = getValueFromPointer(event.clientY);
              onSlideMove?.(value);
            },
            onSlideEnd: () => {
              rectRef.current = void 0;
              onSlideEnd?.();
            },
            onStepKeyDown: (event) => {
              const slideDirection = isSlidingFromBottom ? "from-bottom" : "from-top";
              const isBackKey = BACK_KEYS[slideDirection].includes(event.key);
              onStepKeyDown?.({ event, direction: isBackKey ? -1 : 1 });
            }
          }
        )
      }
    );
  }
);
var SliderImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSlider,
      onSlideStart,
      onSlideMove,
      onSlideEnd,
      onHomeKeyDown,
      onEndKeyDown,
      onStepKeyDown,
      ...sliderProps
    } = props;
    const context = useSliderContext(SLIDER_NAME, __scopeSlider);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        ...sliderProps,
        ref: forwardedRef,
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          if (event.key === "Home") {
            onHomeKeyDown(event);
            event.preventDefault();
          } else if (event.key === "End") {
            onEndKeyDown(event);
            event.preventDefault();
          } else if (PAGE_KEYS.concat(ARROW_KEYS).includes(event.key)) {
            onStepKeyDown(event);
            event.preventDefault();
          }
        }),
        onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
          const target = event.target;
          target.setPointerCapture(event.pointerId);
          event.preventDefault();
          if (context.thumbs.has(target)) {
            target.focus();
          } else {
            onSlideStart(event);
          }
        }),
        onPointerMove: composeEventHandlers(props.onPointerMove, (event) => {
          const target = event.target;
          if (target.hasPointerCapture(event.pointerId)) onSlideMove(event);
        }),
        onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
          const target = event.target;
          if (target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);
            onSlideEnd(event);
          }
        })
      }
    );
  }
);
var TRACK_NAME = "SliderTrack";
var SliderTrack = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSlider, ...trackProps } = props;
    const context = useSliderContext(TRACK_NAME, __scopeSlider);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-disabled": context.disabled ? "" : void 0,
        "data-orientation": context.orientation,
        ...trackProps,
        ref: forwardedRef
      }
    );
  }
);
SliderTrack.displayName = TRACK_NAME;
var RANGE_NAME = "SliderRange";
var SliderRange = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSlider, ...rangeProps } = props;
    const context = useSliderContext(RANGE_NAME, __scopeSlider);
    const orientation = useSliderOrientationContext(RANGE_NAME, __scopeSlider);
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const valuesCount = context.values.length;
    const percentages = context.values.map(
      (value) => convertValueToPercentage(value, context.min, context.max)
    );
    const offsetStart = valuesCount > 1 ? Math.min(...percentages) : 0;
    const offsetEnd = 100 - Math.max(...percentages);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-orientation": context.orientation,
        "data-disabled": context.disabled ? "" : void 0,
        ...rangeProps,
        ref: composedRefs,
        style: {
          ...props.style,
          [orientation.startEdge]: offsetStart + "%",
          [orientation.endEdge]: offsetEnd + "%"
        }
      }
    );
  }
);
SliderRange.displayName = RANGE_NAME;
var THUMB_NAME = "SliderThumb";
var SliderThumb = reactExports.forwardRef(
  (props, forwardedRef) => {
    const getItems = useCollection(props.__scopeSlider);
    const [thumb, setThumb] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setThumb(node));
    const index = reactExports.useMemo(
      () => thumb ? getItems().findIndex((item) => item.ref.current === thumb) : -1,
      [getItems, thumb]
    );
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SliderThumbImpl, { ...props, ref: composedRefs, index });
  }
);
var SliderThumbImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSlider, index, name, ...thumbProps } = props;
    const context = useSliderContext(THUMB_NAME, __scopeSlider);
    const orientation = useSliderOrientationContext(THUMB_NAME, __scopeSlider);
    const [thumb, setThumb] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setThumb(node));
    const isFormControl = thumb ? context.form || !!thumb.closest("form") : true;
    const size = useSize(thumb);
    const value = context.values[index];
    const percent = value === void 0 ? 0 : convertValueToPercentage(value, context.min, context.max);
    const label = getLabel(index, context.values.length);
    const orientationSize = size?.[orientation.size];
    const thumbInBoundsOffset = orientationSize ? getThumbInBoundsOffset(orientationSize, percent, orientation.direction) : 0;
    reactExports.useEffect(() => {
      if (thumb) {
        context.thumbs.add(thumb);
        return () => {
          context.thumbs.delete(thumb);
        };
      }
    }, [thumb, context.thumbs]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [orientation.startEdge]: `calc(${percent}% + ${thumbInBoundsOffset}px)`
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.ItemSlot, { scope: props.__scopeSlider, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Primitive.span,
            {
              role: "slider",
              "aria-label": props["aria-label"] || label,
              "aria-valuemin": context.min,
              "aria-valuenow": value,
              "aria-valuemax": context.max,
              "aria-orientation": context.orientation,
              "data-orientation": context.orientation,
              "data-disabled": context.disabled ? "" : void 0,
              tabIndex: context.disabled ? void 0 : 0,
              ...thumbProps,
              ref: composedRefs,
              style: value === void 0 ? { display: "none" } : props.style,
              onFocus: composeEventHandlers(props.onFocus, () => {
                context.valueIndexToChangeRef.current = index;
              })
            }
          ) }),
          isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            SliderBubbleInput,
            {
              name: name ?? (context.name ? context.name + (context.values.length > 1 ? "[]" : "") : void 0),
              form: context.form,
              value
            },
            index
          )
        ]
      }
    );
  }
);
SliderThumb.displayName = THUMB_NAME;
var BUBBLE_INPUT_NAME = "RadioBubbleInput";
var SliderBubbleInput = reactExports.forwardRef(
  ({ __scopeSlider, value, ...props }, forwardedRef) => {
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(ref, forwardedRef);
    const prevValue = usePrevious(value);
    reactExports.useEffect(() => {
      const input = ref.current;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(inputProto, "value");
      const setValue = descriptor.set;
      if (prevValue !== value && setValue) {
        const event = new Event("input", { bubbles: true });
        setValue.call(input, value);
        input.dispatchEvent(event);
      }
    }, [prevValue, value]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.input,
      {
        style: { display: "none" },
        ...props,
        ref: composedRefs,
        defaultValue: value
      }
    );
  }
);
SliderBubbleInput.displayName = BUBBLE_INPUT_NAME;
function getNextSortedValues(prevValues = [], nextValue, atIndex) {
  const nextValues = [...prevValues];
  nextValues[atIndex] = nextValue;
  return nextValues.sort((a, b) => a - b);
}
function convertValueToPercentage(value, min, max) {
  const maxSteps = max - min;
  const percentPerStep = 100 / maxSteps;
  const percentage = percentPerStep * (value - min);
  return clamp(percentage, [0, 100]);
}
function getLabel(index, totalValues) {
  if (totalValues > 2) {
    return `Value ${index + 1} of ${totalValues}`;
  } else if (totalValues === 2) {
    return ["Minimum", "Maximum"][index];
  } else {
    return void 0;
  }
}
function getClosestValueIndex(values, nextValue) {
  if (values.length === 1) return 0;
  const distances = values.map((value) => Math.abs(value - nextValue));
  const closestDistance = Math.min(...distances);
  return distances.indexOf(closestDistance);
}
function getThumbInBoundsOffset(width, left, direction) {
  const halfWidth = width / 2;
  const halfPercent = 50;
  const offset = linearScale([0, halfPercent], [0, halfWidth]);
  return (halfWidth - offset(left) * direction) * direction;
}
function getStepsBetweenValues(values) {
  return values.slice(0, -1).map((value, index) => values[index + 1] - value);
}
function hasMinStepsBetweenValues(values, minStepsBetweenValues) {
  if (minStepsBetweenValues > 0) {
    const stepsBetweenValues = getStepsBetweenValues(values);
    const actualMinStepsBetweenValues = Math.min(...stepsBetweenValues);
    return actualMinStepsBetweenValues >= minStepsBetweenValues;
  }
  return true;
}
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
function getDecimalCount(value) {
  return (String(value).split(".")[1] || "").length;
}
function roundValue(value, decimalCount) {
  const rounder = Math.pow(10, decimalCount);
  return Math.round(value * rounder) / rounder;
}
var Root = Slider$1;
var Track = SliderTrack;
var Range = SliderRange;
var Thumb = SliderThumb;

const Slider = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Root,
  {
    ref,
    className: cn(
      "relative flex w-full touch-none select-none items-center",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Track, { className: "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Range, { className: "absolute h-full bg-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Thumb, { className: "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = Root.displayName;

const STAKE_TYPES = [
  { value: "m1u", label: "M1 Units (M1U)", icon: "💰", description: "Stake your M1U balance" },
  { value: "pulse_energy", label: "Pulse Energy (PE)", icon: "⚡", description: "Stake your Pulse Energy" }
];
const STAKE_PERCENTS = [25, 50, 75];

const RARITY_COLORS$2 = {
  common: "border-gray-500/30",
  rare: "border-blue-500/30",
  epic: "border-purple-500/30",
  legendary: "border-yellow-500/30"
};
function WeaponDefenseSelector({
  userId,
  type,
  selectedItemId,
  onSelect,
  onOpenShop
}) {
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const loadInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_user_battle_inventory");
      if (error) throw error;
      const filtered = (data || []).filter((item) => item.type === type);
      setItems(filtered);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    loadInventory();
    const channel = supabase.channel(`${type}-selector-${userId}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_battle_items",
        filter: `user_id=eq.${userId}`
      },
      () => loadInventory()
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, type]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-cyan-400" }) });
  }
  if (items.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-muted/30 border border-dashed border-border text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "No ",
        type,
        "s in your inventory"
      ] }),
      onOpenShop && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: "ghost",
          onClick: onOpenShop,
          className: "text-cyan-400 hover:text-cyan-300",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-3 w-3 mr-1" }),
            "Open Shop"
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[180px] rounded-lg border border-border/50 p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => onSelect(null, null, 0),
        className: `
            w-full p-2 rounded-lg border text-left transition-all
            ${selectedItemId === null ? "border-cyan-500/50 bg-cyan-500/10" : "border-border/50 hover:border-border"}
          `,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "No ",
          type,
          " (default)"
        ] })
      }
    ),
    items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => onSelect(item.item_id, item.code, item.power),
        className: `
              w-full p-2 rounded-lg border text-left transition-all
              ${RARITY_COLORS$2[item.rarity] || "border-border/50"}
              ${selectedItemId === item.item_id ? "bg-cyan-500/10 border-cyan-500/50" : "hover:bg-muted/50"}
            `,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              type === "weapon" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-3 w-3 text-cyan-400 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3 text-purple-400 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold truncate", children: item.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                "Power: ",
                item.power
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[9px] px-1 py-0 capitalize", children: item.rarity })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0 flex-shrink-0", children: [
            "x",
            item.quantity
          ] })
        ] })
      },
      item.inventory_id
    ))
  ] }) });
}

const playBeep = (frequency = 800, duration = 100, volume = 0.3) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1e3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1e3);
  } catch (e) {
  }
};
function BattleOverlay({
  isActive,
  attackerName,
  defenderName,
  defenderIsFake,
  weaponUsed,
  stakePercent,
  stakeType,
  onCountdownComplete,
  onCancel
}) {
  const [countdown, setCountdown] = reactExports.useState(10);
  const [showLaunchButton, setShowLaunchButton] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (isActive) {
      setCountdown(10);
      setShowLaunchButton(false);
    }
  }, [isActive]);
  reactExports.useEffect(() => {
    if (!isActive) return;
    if (countdown > 0) {
      if (countdown <= 3) {
        playBeep(1200, 150, 0.4);
      } else {
        playBeep(800, 100, 0.3);
      }
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1e3);
      return () => clearTimeout(timer);
    } else {
      playBeep(600, 50, 0.3);
      setTimeout(() => playBeep(900, 50, 0.3), 50);
      setTimeout(() => playBeep(1200, 100, 0.4), 100);
      setShowLaunchButton(true);
    }
  }, [isActive, countdown]);
  const handleLaunchClick = () => {
    playBeep(400, 100, 0.5);
    setTimeout(() => playBeep(600, 100, 0.5), 100);
    setTimeout(() => playBeep(800, 100, 0.5), 200);
    setTimeout(() => playBeep(1e3, 150, 0.6), 300);
    setTimeout(() => playBeep(1400, 200, 0.7), 450);
    onCountdownComplete();
  };
  if (!isActive) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      className: "fixed inset-0 z-[3000] bg-black/95 backdrop-blur-md",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-8 left-0 right-0 p-4 z-[3002]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between max-w-lg mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-cyan-400 uppercase tracking-wider mb-1", children: "Attacker" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-white", children: attackerName }),
            weaponUsed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-orange-400 flex items-center justify-center gap-1 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-3 w-3" }),
              " ",
              weaponUsed
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "text-4xl",
              animate: { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] },
              transition: { duration: 1, repeat: Infinity },
              children: "⚔️"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-red-400 uppercase tracking-wider mb-1", children: "Target" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-white", children: defenderName }),
            defenderIsFake && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-400 mt-1", children: "🤖 Test Agent" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center z-[3002]", children: !showLaunchButton ? (
          // 🔢 COUNTDOWN PHASE
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "text-center",
              initial: { scale: 0.5, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-cyan-400 uppercase tracking-widest mb-6", children: "🚀 Attack launching in..." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    className: "relative",
                    initial: { scale: 2, opacity: 0 },
                    animate: { scale: 1, opacity: 1 },
                    transition: { type: "spring", damping: 10, stiffness: 100 },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          className: "absolute inset-0 rounded-full",
                          style: {
                            width: 200,
                            height: 200,
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            border: "2px solid rgba(0,212,255,0.3)",
                            boxShadow: "0 0 60px rgba(0,212,255,0.4), inset 0 0 60px rgba(0,212,255,0.2)"
                          },
                          animate: {
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          },
                          transition: { duration: 1, repeat: Infinity }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "text-[120px] font-bold text-white leading-none",
                          style: {
                            textShadow: "0 0 40px rgba(0,212,255,0.9), 0 0 80px rgba(255,77,240,0.6), 0 0 120px rgba(0,212,255,0.4)",
                            fontFamily: "Orbitron, monospace"
                          },
                          children: countdown
                        }
                      )
                    ]
                  },
                  countdown
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "text-lg text-white/60 mt-8",
                    animate: { opacity: [0.4, 1, 0.4] },
                    transition: { duration: 1.5, repeat: Infinity },
                    children: "Prepare for combat..."
                  }
                ),
                onCancel && countdown > 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    onClick: onCancel,
                    className: "mt-8 text-red-400 hover:text-red-300 hover:bg-red-500/10",
                    children: "✕ Cancel Attack"
                  }
                )
              ]
            }
          )
        ) : (
          // 🚀 LAUNCH BUTTON PHASE - After countdown
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "text-center",
              initial: { scale: 0.5, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              transition: { type: "spring", damping: 15 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "text-lg text-cyan-400 uppercase tracking-widest mb-6",
                    animate: { opacity: [0.6, 1, 0.6] },
                    transition: { duration: 1, repeat: Infinity },
                    children: "⚡ SISTEMA PRONTO ⚡"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "text-6xl mb-8",
                    animate: {
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    },
                    transition: { duration: 1.5, repeat: Infinity },
                    children: "🚀"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.button,
                  {
                    onClick: handleLaunchClick,
                    className: "relative px-12 py-6 rounded-2xl font-orbitron font-bold text-xl uppercase tracking-wider overflow-hidden",
                    style: {
                      background: "linear-gradient(135deg, #ff3b30 0%, #ff9500 50%, #ff3b30 100%)",
                      backgroundSize: "200% 200%",
                      color: "white",
                      boxShadow: "0 0 40px rgba(255,59,48,0.6), 0 0 80px rgba(255,149,0,0.4), inset 0 0 20px rgba(255,255,255,0.2)",
                      border: "2px solid rgba(255,255,255,0.3)"
                    },
                    animate: {
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    },
                    transition: { duration: 3, repeat: Infinity },
                    whileHover: { scale: 1.05 },
                    whileTap: { scale: 0.95 },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          className: "absolute inset-0 rounded-2xl",
                          style: { border: "2px solid rgba(255,149,0,0.5)" },
                          animate: {
                            scale: [1, 1.3, 1],
                            opacity: [0.8, 0, 0.8]
                          },
                          transition: { duration: 1.5, repeat: Infinity }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative z-10 flex items-center gap-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-6 h-6" }),
                        "ATTIVA ATTACCO",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-6 h-6" })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.p,
                  {
                    className: "text-sm text-white/50 mt-6",
                    animate: { opacity: [0.3, 0.7, 0.3] },
                    transition: { duration: 2, repeat: Infinity },
                    children: "Premi per lanciare l'attacco"
                  }
                ),
                onCancel && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    onClick: onCancel,
                    className: "mt-4 text-red-400/70 hover:text-red-300 hover:bg-red-500/10 text-sm",
                    children: "✕ Annulla"
                  }
                )
              ]
            }
          )
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-8 left-0 right-0 text-center z-[3002]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-block px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-400", children: "Stake: " }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-bold text-cyan-400", children: [
            stakePercent,
            "% ",
            stakeType
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: Array.from({ length: 20 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "absolute w-1 h-1 bg-cyan-400 rounded-full",
            style: {
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            },
            animate: {
              y: [0, -100, 0],
              opacity: [0, 1, 0]
            },
            transition: {
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }
          },
          i
        )) })
      ]
    }
  );
}

async function sendBattleInvite(opponentId, battleId, creatorName, creatorAgentCode, stakeType, stakeAmount, arenaName, attackerWeaponPower = 0) {
  try {
    const { data, error } = await supabase.functions.invoke("battle-push-send", {
      body: {
        defender_id: opponentId,
        battle_id: battleId,
        attacker_agent_code: creatorAgentCode,
        attacker_weapon_power: attackerWeaponPower,
        stake_type: stakeType,
        stake_amount: stakeAmount,
        arena_name: arenaName
      }
    });
    if (error) {
      return { success: false, error: error.message, details: error };
    }
    if (data?.success && data?.sent > 0) {
      return { success: true, sent: data.sent, details: data };
    } else if (data?.sent === 0) {
      return {
        success: false,
        error: "L'avversario non ha notifiche push attive",
        sent: 0,
        details: data
      };
    } else {
      return {
        success: false,
        error: data?.message || "Invio fallito",
        details: data
      };
    }
  } catch (error) {
    return { success: false, error: error.message || "Unknown error" };
  }
}
async function checkUserHasPushSubscription(userId) {
  try {
    const { data, error } = await supabase.from("webpush_subscriptions").select("id").eq("user_id", userId).eq("is_active", true).limit(1);
    if (error) {
      return false;
    }
    return data && data.length > 0;
  } catch (err) {
    return false;
  }
}

function BattleCreationForm({
  userId,
  preSelectedOpponent,
  onShowVideo,
  // 🆕 Callback to show video (managed by parent)
  onSuccess,
  onCancel
}) {
  const [stakeType, setStakeType] = reactExports.useState("energy");
  const [stakePercent, setStakePercent] = reactExports.useState(50);
  const [opponentSearch, setOpponentSearch] = reactExports.useState("");
  const [arenaName, setArenaName] = reactExports.useState("");
  const [isCreating, setIsCreating] = reactExports.useState(false);
  const [selectedWeaponId, setSelectedWeaponId] = reactExports.useState(null);
  const [selectedWeaponCode, setSelectedWeaponCode] = reactExports.useState(null);
  const [selectedWeaponPower, setSelectedWeaponPower] = reactExports.useState(0);
  const [selectedDefenseId, setSelectedDefenseId] = reactExports.useState(null);
  const [selectedDefenseCode, setSelectedDefenseCode] = reactExports.useState(null);
  const [searchResults, setSearchResults] = reactExports.useState([]);
  const [isSearching, setIsSearching] = reactExports.useState(false);
  const [selectedOpponent, setSelectedOpponent] = reactExports.useState(
    preSelectedOpponent ? { id: preSelectedOpponent.id, name: preSelectedOpponent.name } : null
  );
  const searchTimeoutRef = reactExports.useRef(null);
  const [opponentHasPush, setOpponentHasPush] = reactExports.useState(null);
  const [checkingPush, setCheckingPush] = reactExports.useState(false);
  const [showCountdown, setShowCountdown] = reactExports.useState(false);
  const [showVideo, setShowVideo] = reactExports.useState(false);
  const [battleResult, setBattleResult] = reactExports.useState(null);
  const [currentBattleId, setCurrentBattleId] = reactExports.useState(null);
  const { toast } = useToast();
  const { awardPE } = useAwardPE();
  reactExports.useEffect(() => {
    if (preSelectedOpponent || selectedOpponent) {
      setSearchResults([]);
      return;
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (!opponentSearch || opponentSearch.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const searchTerm = opponentSearch.trim();
        const { data, error } = await supabase.rpc("search_agents_for_battle", {
          search_term: searchTerm,
          exclude_user_id: userId,
          max_results: 5
        });
        if (error) {
          const { data: fallbackData, error: fallbackError } = await supabase.from("public_profiles").select("id, nickname, agent_code").or(`nickname.ilike.%${searchTerm}%,agent_code.ilike.%${searchTerm}%`).limit(5);
          if (fallbackError) {
            setSearchResults([]);
          } else {
            const mapped = (fallbackData || []).map((r) => ({
              id: r.id,
              username: r.nickname || r.agent_code,
              agent_code: r.agent_code
            }));
            setSearchResults(mapped);
          }
        } else {
          setSearchResults(data || []);
        }
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [opponentSearch, userId, preSelectedOpponent, selectedOpponent]);
  const handleSelectAgent = (agent) => {
    const displayName = agent.username || agent.agent_code || `Agent ${agent.id.slice(0, 6)}`;
    setSelectedOpponent({ id: agent.id, name: displayName });
    setOpponentSearch("");
    setSearchResults([]);
  };
  const handleClearSelection = () => {
    setSelectedOpponent(null);
    setOpponentSearch("");
  };
  const effectiveOpponent = preSelectedOpponent || selectedOpponent;
  const isFakeAgent = effectiveOpponent?.id?.startsWith("fake-agent-") || effectiveOpponent?.id?.startsWith("AG-NPC-") || effectiveOpponent?.id?.startsWith("npc-");
  reactExports.useEffect(() => {
    const checkPush = async () => {
      if (!effectiveOpponent?.id || isFakeAgent) {
        setOpponentHasPush(null);
        return;
      }
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveOpponent.id);
      if (!isUUID) {
        setOpponentHasPush(null);
        return;
      }
      setCheckingPush(true);
      try {
        const hasPush = await checkUserHasPushSubscription(effectiveOpponent.id);
        setOpponentHasPush(hasPush);
      } catch (err) {
        setOpponentHasPush(null);
      } finally {
        setCheckingPush(false);
      }
    };
    checkPush();
  }, [effectiveOpponent?.id, isFakeAgent]);
  const handleCreate = async () => {
    if (!effectiveOpponent) {
      toast({
        title: "Opponent Required",
        description: "Please search and select an opponent",
        variant: "destructive"
      });
      return;
    }
    const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const isRealAgent = effectiveOpponent.id && !effectiveOpponent.id.startsWith("fake-agent-") && !effectiveOpponent.id.startsWith("AG-NPC-") && !effectiveOpponent.id.startsWith("npc-") && isUUID(effectiveOpponent.id);
    const battleId = crypto.randomUUID();
    setCurrentBattleId(battleId);
    if (isRealAgent && effectiveOpponent.id) {
      try {
        const { data: attackerProfile } = await supabase.from("profiles").select("agent_code, nickname, full_name").eq("id", userId).single();
        const attackerName = attackerProfile?.nickname || attackerProfile?.full_name || "Unknown";
        const attackerAgentCode = attackerProfile?.agent_code || attackerName;
        const pushResult = await sendBattleInvite(
          effectiveOpponent.id,
          battleId,
          attackerName,
          attackerAgentCode,
          stakeType,
          stakePercent,
          arenaName || void 0,
          selectedWeaponPower
        );
        if (pushResult.success && pushResult.sent && pushResult.sent > 0) {
          toast({
            title: "📤 Notifica Inviata!",
            description: `${effectiveOpponent.name} è stato avvisato dell'attacco`,
            duration: 2e3
          });
        } else {
          toast({
            title: "⚠️ Notifica non consegnata",
            description: pushResult.error || `${effectiveOpponent.name} non ha le notifiche push attive. L'attacco procede comunque.`,
            duration: 4e3,
            variant: "destructive"
          });
        }
      } catch (err) {
      }
    }
    if (isRealAgent) {
      try {
        const { error: insertError } = await supabase.from("battle_sessions").insert({
          id: battleId,
          creator_id: userId,
          defender_id: effectiveOpponent.id,
          status: "pending",
          stake_type: stakeType,
          stake_amount: stakePercent,
          arena_name: arenaName || null,
          attacker_weapon_power: selectedWeaponPower,
          attacker_weapon_id: selectedWeaponId,
          arena_lat: preSelectedOpponent?.lat || null,
          arena_lng: preSelectedOpponent?.lng || null
        });
        if (insertError) {
        } else {
        }
      } catch (err) {
      }
    }
    setShowCountdown(true);
  };
  const handleCountdownComplete = reactExports.useCallback(async () => {
    setShowCountdown(false);
    let winChance;
    if (isFakeAgent) {
      const weaponBonus = Math.min(selectedWeaponPower, 15);
      winChance = 67 + weaponBonus;
    } else {
      const weaponBonus = Math.min(selectedWeaponPower * 2, 40);
      winChance = 50 + weaponBonus;
    }
    const won = Math.random() * 100 < winChance;
    setBattleResult({ won });
    if (onShowVideo) {
      onShowVideo(won);
    } else {
      setShowVideo(true);
    }
    try {
      const peAmount = stakePercent;
      const { data: profile, error: fetchError } = await supabase.from("profiles").select("pulse_energy").eq("id", userId).single();
      if (fetchError) {
      } else {
        const currentPE = profile?.pulse_energy || 0;
        const newPE = won ? Math.max(0, currentPE + peAmount) : Math.max(0, currentPE - peAmount);
        const { error: updateError } = await supabase.from("profiles").update({ pulse_energy: newPE }).eq("id", userId);
        if (updateError) {
        } else {
        }
      }
      if (currentBattleId && !isFakeAgent) {
        await supabase.from("battle_sessions").update({
          status: "resolved",
          winner_id: won ? userId : effectiveOpponent?.id,
          resolved_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", currentBattleId);
      }
    } catch (err) {
    }
    toast({
      title: won ? "⚔️ +" + stakePercent + " PE" : "🛡️ -" + stakePercent + " PE",
      description: won ? "Vittoria!" : "Sconfitta!",
      duration: 2e3
    });
    if (preSelectedOpponent?.lat && preSelectedOpponent?.lng) {
      try {
        const rpcParams = {
          p_user_id: userId,
          p_opponent_id: effectiveOpponent?.id || "unknown",
          p_lat: preSelectedOpponent.lat,
          p_lng: preSelectedOpponent.lng,
          p_is_pvp: !isFakeAgent,
          p_won: won
        };
        const { data: logResult, error: logError } = await supabase.rpc("log_battle_result", rpcParams);
        if (logError) {
          alert(`❌ ERRORE RPC: ${JSON.stringify(logError)}`);
          toast({
            title: "⚠️ Errore registrazione",
            description: logError.message || "Battaglia non registrata",
            duration: 4e3,
            variant: "destructive"
          });
        } else {
          const result = logResult;
          if (result?.success === true) {
          } else if (result?.success === false) {
            alert(`❌ RPC success=false: ${result.error}`);
          }
          if (result?.success === false) {
            toast({
              title: "⚠️ Errore DB",
              description: result.error || "Errore sconosciuto",
              duration: 4e3,
              variant: "destructive"
            });
          } else if (result?.country_name) {
            toast({
              title: result.is_win ? `🏴 ${result.country_name}` : `⚔️ ${result.country_name}`,
              description: result.is_win ? "+1 conquista!" : "Sconfitta registrata",
              duration: 3e3
            });
          }
        }
      } catch (err) {
        toast({
          title: "⚠️ Errore",
          description: err?.message || "Eccezione durante registrazione",
          duration: 4e3,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "⚠️ Coordinate mancanti",
        description: "Battaglia non registrata per dominio",
        duration: 4e3,
        variant: "destructive"
      });
    }
    if (won) {
      awardPE("BATTLE_WIN", void 0, {
        battleId: currentBattleId,
        opponentId: effectiveOpponent?.id,
        weaponPower: selectedWeaponPower
      }).catch((err) => void 0);
    } else {
      awardPE("BATTLE_LOSE", void 0, {
        battleId: currentBattleId,
        opponentId: effectiveOpponent?.id,
        weaponPower: selectedWeaponPower
      }).catch((err) => void 0);
    }
  }, [stakePercent, selectedWeaponPower, toast, onShowVideo, userId, effectiveOpponent, currentBattleId, awardPE, isFakeAgent, preSelectedOpponent]);
  reactExports.useCallback(() => {
    setShowVideo(false);
    setBattleResult(null);
    onSuccess?.();
  }, [onSuccess]);
  const handleCountdownCancel = () => {
    setShowCountdown(false);
    toast({
      title: "Attack Cancelled",
      description: "Battle aborted"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BattleOverlay,
      {
        isActive: showCountdown,
        attackerName: "You",
        defenderName: effectiveOpponent?.name || "Unknown",
        defenderIsFake: isFakeAgent,
        weaponUsed: selectedWeaponCode || void 0,
        stakePercent,
        stakeType,
        onCountdownComplete: handleCountdownComplete,
        onCancel: handleCountdownCancel
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "arena-name", children: "Arena Name (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "arena-name",
              placeholder: "e.g., Downtown Showdown",
              value: arenaName,
              onChange: (e) => {
                e.stopPropagation();
                setArenaName(e.target.value);
              },
              className: "bg-background/50",
              onClick: (e) => e.stopPropagation(),
              onMouseDown: (e) => e.stopPropagation(),
              onTouchStart: (e) => e.stopPropagation(),
              onFocus: (e) => e.stopPropagation(),
              onKeyDown: (e) => e.stopPropagation(),
              onKeyUp: (e) => e.stopPropagation(),
              onKeyPress: (e) => e.stopPropagation(),
              autoComplete: "off",
              autoCorrect: "off",
              autoCapitalize: "off",
              spellCheck: false
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "opponent", children: "Target" }),
          effectiveOpponent ? (
            /* Mostra l'opponent selezionato (da marker O da ricerca) */
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 rounded-lg border ${isFakeAgent ? "bg-red-500/10 border-red-500/30" : "bg-cyan-500/10 border-cyan-500/30"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: `h-4 w-4 ${isFakeAgent ? "text-red-400" : "text-cyan-400"}` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-semibold ${isFakeAgent ? "text-red-400" : "text-cyan-400"}`, children: effectiveOpponent.name })
                ] }),
                !preSelectedOpponent && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleClearSelection,
                    className: "p-1 rounded hover:bg-white/10 transition-colors",
                    title: "Cambia target",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 text-muted-foreground" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: isFakeAgent ? "🤖 Test Agent - 10s countdown → missile on map!" : preSelectedOpponent ? "Pre-selected agent" : "✅ Target selezionato" }),
              !isFakeAgent && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5", children: checkingPush ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }),
                " Verifica notifiche..."
              ] }) : opponentHasPush === true ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-green-400 flex items-center gap-1", children: "🔔 Notifiche attive - riceverà l'attacco" }) : opponentHasPush === false ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-amber-400 flex items-center gap-1", children: "⚠️ Notifiche disattivate - potrebbe non ricevere l'avviso" }) : null })
            ] })
          ) : (
            /* Campo di ricerca */
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", onClick: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(), onKeyDown: (e) => e.stopPropagation(), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "opponent",
                  placeholder: "Cerca per nome o codice agente...",
                  value: opponentSearch,
                  onChange: (e) => {
                    e.stopPropagation();
                    setOpponentSearch(e.target.value);
                  },
                  className: "pl-10 bg-background/50",
                  onClick: (e) => e.stopPropagation(),
                  onMouseDown: (e) => e.stopPropagation(),
                  onTouchStart: (e) => e.stopPropagation(),
                  onFocus: (e) => e.stopPropagation(),
                  onKeyDown: (e) => e.stopPropagation(),
                  onKeyUp: (e) => e.stopPropagation(),
                  onKeyPress: (e) => e.stopPropagation(),
                  autoComplete: "off",
                  autoCorrect: "off",
                  autoCapitalize: "off",
                  spellCheck: false,
                  enterKeyHint: "search"
                }
              ),
              isSearching && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "absolute right-3 top-3 h-4 w-4 text-muted-foreground animate-spin" }),
              searchResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden", children: searchResults.map((agent) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => handleSelectAgent(agent),
                  className: "w-full px-3 py-2 flex items-center gap-3 hover:bg-cyan-500/10 transition-colors text-left",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-cyan-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: agent.username || agent.agent_code || `Agent ${agent.id.slice(0, 6)}` }),
                      agent.agent_code && agent.username && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: agent.agent_code })
                    ] })
                  ]
                },
                agent.id
              )) }),
              opponentSearch.length >= 2 && !isSearching && searchResults.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: [
                'Nessun agente trovato per "',
                opponentSearch,
                '"'
              ] })
            ] })
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", onClick: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "stake-type", children: "Stake Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stakeType, onValueChange: setStakeType, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "stake-type", className: "bg-background/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STAKE_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: type.value, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: type.icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: type.label })
            ] }) }, type.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", onClick: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(), onTouchStart: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Stake: ",
            stakePercent,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Slider,
            {
              value: [stakePercent],
              onValueChange: (vals) => setStakePercent(vals[0]),
              min: 25,
              max: 75,
              step: 25,
              className: "w-full"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between text-xs text-muted-foreground", children: STAKE_PERCENTS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setStakePercent(p),
              className: `px-2 py-1 rounded ${stakePercent === p ? "bg-cyan-500/20 text-cyan-400" : "hover:bg-muted"}`,
              children: [
                p,
                "%"
              ]
            },
            p
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "inline h-3 w-3 mr-1" }),
              "Weapon (optional)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              WeaponDefenseSelector,
              {
                userId,
                type: "weapon",
                selectedItemId: selectedWeaponId,
                onSelect: (id, code, power) => {
                  setSelectedWeaponId(id);
                  setSelectedWeaponCode(code);
                  setSelectedWeaponPower(power || 0);
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "inline h-3 w-3 mr-1" }),
              "Defense (optional)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              WeaponDefenseSelector,
              {
                userId,
                type: "defense",
                selectedItemId: selectedDefenseId,
                onSelect: (id, code) => {
                  setSelectedDefenseId(id);
                  setSelectedDefenseCode(code);
                }
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        onCancel && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            onClick: onCancel,
            disabled: isCreating || showCountdown,
            className: "flex-1",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleCreate,
            disabled: isCreating || showCountdown || !effectiveOpponent,
            className: "flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600",
            children: isCreating ? "Creating..." : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 h-4 w-4" }),
              "LAUNCH ATTACK!"
            ] })
          }
        )
      ] })
    ] })
  ] });
}

const RARITY_COLORS$1 = {
  common: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  rare: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  legendary: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
};
const RARITY_GLOW = {
  common: "shadow-gray-500/20",
  rare: "shadow-blue-500/30",
  epic: "shadow-purple-500/40",
  legendary: "shadow-yellow-500/50"
};
function BattleShop({ userId }) {
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [purchasing, setPurchasing] = reactExports.useState(null);
  const { toast } = useToast();
  const { unitsData, isLoading: m1uLoading, refetch: refetchM1U } = useM1UnitsRealtime(userId);
  const balance = unitsData?.balance || 0;
  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("list_available_battle_items");
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      toast({
        title: "Failed to load shop",
        description: error?.message || "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    loadItems();
    const channel = supabase.channel(`battle-shop-${userId}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_battle_items",
        filter: `user_id=eq.${userId}`
      },
      () => loadItems()
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  const handlePurchase = async (item) => {
    if (balance < item.base_price_m1u) {
      toast({
        title: "Insufficient M1U",
        description: `You need ${item.base_price_m1u} M1U but only have ${balance} M1U`,
        variant: "destructive"
      });
      return;
    }
    setPurchasing(item.item_id);
    try {
      const { data, error } = await supabase.rpc("purchase_battle_item", {
        p_item_id: item.item_id,
        p_quantity: 1
      });
      if (error) {
        const { error: updateError } = await supabase.from("profiles").update({
          m1_units: balance - item.base_price_m1u,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", userId);
        if (updateError) {
          throw updateError;
        }
        const { error: inventoryError } = await supabase.from("user_battle_items").upsert({
          user_id: userId,
          item_id: item.item_id,
          quantity: (item.owned_quantity || 0) + 1,
          purchased_at: (/* @__PURE__ */ new Date()).toISOString()
        }, {
          onConflict: "user_id,item_id"
        });
        if (inventoryError) {
          await supabase.from("profiles").update({ m1_units: balance }).eq("id", userId);
          throw inventoryError;
        }
        const newBalance = balance - item.base_price_m1u;
        window.dispatchEvent(new CustomEvent("m1u-spent", {
          detail: {
            amount: item.base_price_m1u,
            newBalance,
            reason: "battle_item_purchase_fallback"
          }
        }));
        toast({
          title: "✅ Purchase Complete!",
          description: `${item.name} added to your inventory (-${item.base_price_m1u} M1U)`
        });
        await Promise.all([loadItems(), refetchM1U()]);
        return;
      }
      const result = data;
      if (!result?.success) {
        throw new Error(result?.error || "Purchase failed");
      }
      toast({
        title: "✅ Purchase Complete!",
        description: `${item.name} added to your inventory (-${result.total_cost || item.base_price_m1u} M1U)`
      });
      window.dispatchEvent(new CustomEvent("m1u-spent", {
        detail: {
          amount: result.total_cost || item.base_price_m1u,
          newBalance: result.new_balance,
          reason: "battle_item_purchase"
        }
      }));
      await Promise.all([loadItems(), refetchM1U()]);
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: error?.message || "Unknown error",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
    }
  };
  const weapons = items.filter((i) => i.type === "weapon");
  const defenses = items.filter((i) => i.type === "defense");
  const renderItem = (item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `
        p-4 rounded-lg border bg-gradient-to-br from-background to-background/50
        ${RARITY_COLORS$1[item.rarity]}
        ${RARITY_GLOW[item.rarity]}
        shadow-lg
      `,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-sm", children: item.name }),
            item.is_owned && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] px-1 py-0 border-green-500/50 text-green-400", children: [
              "Owned ",
              item.owned_quantity,
              "x"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: item.description })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-3 w-3 text-cyan-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Power:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: item.power })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0 capitalize", children: item.rarity }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-cyan-400 font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              item.base_price_m1u,
              " M1U"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              onClick: () => handlePurchase(item),
              disabled: purchasing === item.item_id || balance < item.base_price_m1u || item.is_owned && item.owned_quantity >= item.max_stack,
              className: "h-7 px-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600",
              children: purchasing === item.item_id ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 mr-1 animate-spin" }),
                "Buying..."
              ] }) : item.is_owned && item.owned_quantity >= item.max_stack ? "Max Stack" : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-3 w-3 mr-1" }),
                "Buy"
              ] })
            }
          )
        ] })
      ]
    },
    item.item_id
  );
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-cyan-400" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 rounded-lg bg-gradient-to-r from-cyan-950/30 to-purple-950/30 border border-cyan-500/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Your Balance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: m1uLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-cyan-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-5 w-5 text-cyan-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold text-cyan-400", children: balance }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "M1U" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "weapons", className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full grid grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "weapons", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-4 w-4 mr-2" }),
          "Weapons (",
          weapons.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "defenses", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 mr-2" }),
          "Defenses (",
          defenses.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "weapons", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[400px] pr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: weapons.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-sm text-muted-foreground", children: "No weapons available" }) : weapons.map(renderItem) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "defenses", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[400px] pr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: defenses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-sm text-muted-foreground", children: "No defenses available" }) : defenses.map(renderItem) }) }) })
    ] })
  ] });
}

const WIN_VIDEO = "/assets/video/M1SSION-BATTLE-WIN-v3.mp4";
const LOSE_VIDEO = "/assets/video/M1SSION-BATTLE-LOSE-v3.mp4";
function BattleVideoModal({
  isOpen,
  won,
  onClose
}) {
  const videoRef = reactExports.useRef(null);
  const [videoAudioEnabled, setVideoAudioEnabled] = reactExports.useState(true);
  const [phase, setPhase] = reactExports.useState("video");
  reactExports.useEffect(() => {
    if (isOpen) {
      setPhase("video");
      setVideoAudioEnabled(true);
    }
  }, [isOpen]);
  reactExports.useEffect(() => {
    if (isOpen && videoRef.current && phase === "video") {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          setVideoAudioEnabled(false);
          videoRef.current.play().catch(() => {
          });
        }
      });
    }
  }, [isOpen, won, phase]);
  const handleVideoTapForAudio = reactExports.useCallback(() => {
    if (videoRef.current && !videoAudioEnabled) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {
      });
      setVideoAudioEnabled(true);
    }
  }, [videoAudioEnabled]);
  const handleVideoEnd = reactExports.useCallback(() => {
    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = "none";
      } catch (e) {
      }
    }
    setPhase("result");
    setTimeout(() => {
      onClose();
    }, 3e3);
  }, [onClose]);
  const handleSkipVideo = reactExports.useCallback(() => {
    if (phase === "video") {
      setPhase("result");
      setTimeout(() => {
        onClose();
      }, 3e3);
    } else {
      onClose();
    }
  }, [onClose, phase]);
  if (!isOpen) {
    return null;
  }
  const videoSrc = won ? WIN_VIDEO : LOSE_VIDEO;
  const accentColor = phase === "video" ? "#00d4ff" : won ? "#10b981" : "#ef4444";
  const title = phase === "video" ? "🚀 LAUNCHING..." : won ? "⚔️ VITTORIA!" : "💀 SCONFITTA!";
  const modalContent = /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 bg-black/95 backdrop-blur-md z-[999998]"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { type: "spring", damping: 30, stiffness: 300 },
        className: "fixed inset-x-0 bottom-0 z-[999999] overflow-hidden",
        style: {
          top: "calc(47px + env(safe-area-inset-top, 0px))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "h-full rounded-t-3xl bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-x overflow-hidden flex flex-col",
            style: {
              borderColor: `${accentColor}30`,
              boxShadow: `0 -10px 40px ${accentColor}15, 0 0 0 1px ${accentColor}10`
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center pt-3 pb-2 cursor-grab flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-1.5 rounded-full bg-white/30" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 pb-2 border-b border-white/10 flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      className: "w-2 h-2 rounded-full",
                      style: { background: accentColor, boxShadow: `0 0 10px ${accentColor}` },
                      animate: { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] },
                      transition: { duration: 1, repeat: Infinity }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "h3",
                    {
                      className: "font-orbitron font-bold text-white text-[15px]",
                      style: { textShadow: `0 0 10px ${accentColor}` },
                      children: title
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleSkipVideo,
                    className: "w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-white/70" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden relative", children: phase === "video" ? (
                /* Video Phase - FULL SIZE */
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "absolute inset-0",
                    onClick: handleVideoTapForAudio,
                    onTouchStart: handleVideoTapForAudio,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "video",
                        {
                          ref: videoRef,
                          src: videoSrc,
                          className: "w-full h-full object-cover",
                          playsInline: true,
                          muted: !videoAudioEnabled,
                          onEnded: handleVideoEnd,
                          onError: handleSkipVideo,
                          disablePictureInPicture: true,
                          disableRemotePlayback: true,
                          controlsList: "nodownload noremoteplayback"
                        }
                      ),
                      !videoAudioEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          className: "absolute inset-0 flex items-center justify-center",
                          initial: { opacity: 0 },
                          animate: { opacity: 1 },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            motion.div,
                            {
                              className: "flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-black/70 backdrop-blur-sm",
                              animate: { scale: [1, 1.05, 1] },
                              transition: { duration: 1.5, repeat: Infinity },
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "w-10 h-10 text-white/80" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/80 text-sm font-medium", children: "Tocca per l'audio" })
                              ]
                            }
                          )
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center", children: videoAudioEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "w-6 h-6 text-white" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "w-6 h-6 text-white/60" }) }) })
                    ]
                  }
                )
              ) : (
                /* Result Animation Phase */
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    className: "absolute inset-0 flex flex-col items-center justify-center",
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    style: {
                      background: won ? "radial-gradient(circle at center, rgba(16,185,129,0.3) 0%, transparent 70%)" : "radial-gradient(circle at center, rgba(239,68,68,0.3) 0%, transparent 70%)"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          className: "absolute inset-0",
                          initial: { opacity: 1, background: won ? "#10b981" : "#ef4444" },
                          animate: { opacity: 0 },
                          transition: { duration: 0.5 }
                        }
                      ),
                      [...Array(3)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          className: "absolute rounded-full border-2",
                          style: {
                            borderColor: won ? "#10b981" : "#ef4444",
                            width: 150 + i * 60,
                            height: 150 + i * 60
                          },
                          initial: { scale: 0, opacity: 0.8 },
                          animate: { scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] },
                          transition: { duration: 1.5, delay: i * 0.2, repeat: Infinity }
                        },
                        i
                      )),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          initial: { scale: 0, rotate: -180 },
                          animate: { scale: 1, rotate: 0 },
                          transition: { type: "spring", damping: 10, stiffness: 100, delay: 0.3 },
                          children: won ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            {
                              className: "w-32 h-32 rounded-full flex items-center justify-center",
                              style: {
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                boxShadow: "0 0 60px rgba(16,185,129,0.8), inset 0 0 30px rgba(255,255,255,0.2)"
                              },
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-16 h-16 text-white" })
                            }
                          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            {
                              className: "w-32 h-32 rounded-full flex items-center justify-center",
                              style: {
                                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                boxShadow: "0 0 60px rgba(239,68,68,0.8), inset 0 0 30px rgba(255,255,255,0.2)"
                              },
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skull, { className: "w-16 h-16 text-white" })
                            }
                          )
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.h2,
                        {
                          className: "mt-8 text-4xl font-orbitron font-black uppercase tracking-widest",
                          initial: { opacity: 0, y: 20 },
                          animate: { opacity: 1, y: 0 },
                          transition: { delay: 0.5 },
                          style: {
                            color: won ? "#10b981" : "#ef4444",
                            textShadow: won ? "0 0 30px rgba(16,185,129,0.8), 0 0 60px rgba(16,185,129,0.5)" : "0 0 30px rgba(239,68,68,0.8), 0 0 60px rgba(239,68,68,0.5)"
                          },
                          children: won ? "VITTORIA!" : "SCONFITTA!"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.p,
                        {
                          className: "mt-3 text-lg text-white/80 font-medium",
                          initial: { opacity: 0 },
                          animate: { opacity: 1 },
                          transition: { delay: 0.7 },
                          children: won ? "Hai distrutto il nemico!" : "Il nemico ha resistito!"
                        }
                      ),
                      won && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: [...Array(12)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          className: "absolute",
                          initial: {
                            opacity: 0,
                            scale: 0,
                            x: 0,
                            y: 0
                          },
                          animate: {
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            x: Math.cos(i * 30 * Math.PI / 180) * 150,
                            y: Math.sin(i * 30 * Math.PI / 180) * 150
                          },
                          transition: { duration: 1, delay: 0.5 + i * 0.05 },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-6 h-6 text-yellow-400" })
                        },
                        `sparkle-${i}`
                      )) })
                    ]
                  }
                )
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-4 pt-2 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.button,
                {
                  className: "w-full py-4 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider",
                  style: {
                    background: phase === "video" ? "linear-gradient(135deg, #00d4ff 0%, #0099ccCC 100%)" : `linear-gradient(135deg, ${won ? "#10b981" : "#ef4444"} 0%, ${won ? "#059669" : "#dc2626"}CC 100%)`,
                    color: "white",
                    boxShadow: phase === "video" ? "0 0 20px rgba(0,212,255,0.5)" : `0 0 20px ${won ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.5)"}`
                  },
                  onClick: (e) => {
                    e.stopPropagation();
                    handleSkipVideo();
                  },
                  whileHover: { scale: 1.02 },
                  whileTap: { scale: 0.98 },
                  children: phase === "video" ? "SALTA VIDEO" : "CONTINUA"
                }
              ) })
            ]
          }
        )
      }
    )
  ] }) });
  return reactDomExports.createPortal(modalContent, document.body);
}

function BattleModal({
  isOpen,
  onClose,
  userId,
  activeBattles,
  pendingChallenges,
  loading,
  preSelectedOpponent
}) {
  const [activeTab, setActiveTab] = reactExports.useState("new");
  const { toast } = useToast();
  const [showBattleVideo, setShowBattleVideo] = reactExports.useState(false);
  const [battleVideoResult, setBattleVideoResult] = reactExports.useState(null);
  const activeBattle = activeBattles[0];
  const handleShowBattleVideo = reactExports.useCallback((won) => {
    setBattleVideoResult(won);
    setShowBattleVideo(true);
  }, []);
  const handleBattleVideoClose = reactExports.useCallback(() => {
    setShowBattleVideo(false);
  }, []);
  if (!userId) return null;
  const modalContent = /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "fixed inset-0 bg-black/80 backdrop-blur-md",
        style: { zIndex: 999998 },
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "fixed left-4 right-4 bg-background/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden",
        style: {
          zIndex: 999999,
          top: "calc(60px + env(safe-area-inset-top, 0px))",
          bottom: "calc(90px + env(safe-area-inset-bottom, 0px))",
          maxWidth: "600px",
          margin: "0 auto"
        },
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 },
        transition: { type: "spring", stiffness: 300, damping: 30 },
        onClick: (e) => e.stopPropagation(),
        onMouseDown: (e) => e.stopPropagation(),
        onTouchStart: (e) => e.stopPropagation(),
        onPointerDown: (e) => e.stopPropagation(),
        onKeyDown: (e) => e.stopPropagation(),
        onKeyUp: (e) => e.stopPropagation(),
        onKeyPress: (e) => e.stopPropagation(),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 to-purple-950/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-5 w-5 text-white" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-cyan-400", children: "TRON Battle" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Manage your battles" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: onClose,
                className: "h-8 w-8 rounded-full hover:bg-cyan-500/10",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "flex-1 flex flex-col h-[calc(100%-73px)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full grid grid-cols-2 bg-muted/30 rounded-none border-b border-border/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "new", children: "⚔️ New Battle" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "shop", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4 mr-1" }),
                "Shop"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "new", className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", onClick: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(), onTouchStart: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              BattleCreationForm,
              {
                userId,
                preSelectedOpponent,
                onShowVideo: handleShowBattleVideo,
                onSuccess: () => {
                  toast({
                    title: "✅ Battle Created!",
                    description: "Waiting for opponent..."
                  });
                  setActiveTab("overview");
                },
                onCancel: () => setActiveTab("overview")
              }
            ) }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "shop", className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", onClick: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(), onTouchStart: (e) => e.stopPropagation(), children: userId ? /* @__PURE__ */ jsxRuntimeExports.jsx(BattleShop, { userId }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-sm text-muted-foreground", children: "Please log in to access the shop" }) }) }) })
          ] })
        ]
      }
    )
  ] }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    reactDomExports.createPortal(modalContent, document.body),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BattleVideoModal,
      {
        isOpen: showBattleVideo,
        won: battleVideoResult ?? false,
        onClose: handleBattleVideoClose
      }
    ),
    activeBattle && /* @__PURE__ */ jsxRuntimeExports.jsx(
      BattleMount,
      {
        sessionId: activeBattle.id,
        onClose: () => {
        }
      }
    )
  ] });
}

function BattlePill({ userId }) {
  const [isModalOpen, setIsModalOpen] = reactExports.useState(false);
  const { activeBattles, pendingChallenges, loading } = useMyActiveBattles(userId);
  const totalBadgeCount = activeBattles.length + pendingChallenges.length;
  if (!userId) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.button,
      {
        className: "pill-orb fixed z-[1001]",
        style: {
          left: "16px",
          bottom: "calc(env(safe-area-inset-bottom, 34px) + 240px)"
        },
        onClick: () => setIsModalOpen(true),
        initial: { scale: 0 },
        animate: { scale: 1 },
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.97 },
        transition: { type: "spring", stiffness: 300, damping: 20 },
        "aria-label": "Battle System",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "w-5 h-5 text-red-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dot", style: { background: "#f44", boxShadow: "0 0 8px #f44" } }),
          totalBadgeCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              className: "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-gradient-to-br from-red-500 to-pink-600 border-2 border-background",
              variant: "destructive",
              children: totalBadgeCount
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BattleModal,
      {
        isOpen: isModalOpen,
        onClose: () => setIsModalOpen(false),
        userId,
        activeBattles,
        pendingChallenges,
        loading
      }
    )
  ] });
}

const RARITY_COLORS = {
  common: "border-gray-500/30 bg-gray-500/10",
  rare: "border-blue-500/30 bg-blue-500/10",
  epic: "border-purple-500/30 bg-purple-500/10",
  legendary: "border-yellow-500/30 bg-yellow-500/10"
};
function BattleShopPill({ userId, className = "" }) {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [inventory, setInventory] = reactExports.useState([]);
  const [loadingInventory, setLoadingInventory] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (isOpen && userId) {
      loadInventory();
    }
  }, [isOpen, userId]);
  const loadInventory = async () => {
    setLoadingInventory(true);
    try {
      const { data, error } = await supabase.rpc("get_user_battle_inventory");
      if (error) throw error;
      setInventory(data || []);
    } catch (err) {
    } finally {
      setLoadingInventory(false);
    }
  };
  const weapons = inventory.filter((i) => i.type === "weapon");
  const defenses = inventory.filter((i) => i.type === "defense");
  const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.button,
      {
        className: `pill-orb ${className}`,
        onClick: () => setIsOpen(true),
        "aria-label": "Open Battle Shop",
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.97 },
        initial: { scale: 0 },
        animate: { scale: 1 },
        transition: { type: "spring", stiffness: 300, damping: 20 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "w-5 h-5 text-cyan-100" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dot", style: { background: "#f0f", boxShadow: "0 0 8px #f0f" } }),
          totalItems > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              className: "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-gradient-to-br from-purple-500 to-pink-600 border-2 border-background",
              children: totalItems
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "fixed inset-0 z-[5000] flex items-center justify-center p-4",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute inset-0 bg-black/80 backdrop-blur-sm",
              onClick: () => setIsOpen(false)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "relative w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl",
              style: {
                background: "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)",
                border: "1px solid rgba(0, 255, 255, 0.2)",
                boxShadow: "0 0 40px rgba(0, 255, 255, 0.15), 0 25px 50px rgba(0, 0, 0, 0.5)"
              },
              initial: { scale: 0.9, y: 20, opacity: 0 },
              animate: { scale: 1, y: 0, opacity: 1 },
              exit: { scale: 0.9, y: 20, opacity: 0 },
              transition: { type: "spring", damping: 25 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-6 py-4 border-b border-white/10", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "p-2.5 rounded-xl",
                        style: {
                          background: "radial-gradient(circle at 30% 30%, rgba(0,255,255,0.2), rgba(139,92,246,0.3) 80%)",
                          border: "1px solid rgba(0, 255, 255, 0.3)"
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "w-5 h-5 text-cyan-400" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-white font-orbitron", children: "Arsenal" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Shop & Inventory" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setIsOpen(false),
                      className: "absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-gray-400" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "shop", className: "w-full", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full grid grid-cols-2 mx-4 mt-4", style: { width: "calc(100% - 32px)" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "shop", className: "gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4" }),
                      "Shop"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "inventory", className: "gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }),
                      "Inventory (",
                      totalItems,
                      ")"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "shop", className: "mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 max-h-[calc(85vh-180px)] overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BattleShop, { userId }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "inventory", className: "mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[calc(85vh-180px)] p-4", children: loadingInventory ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-cyan-400" }) }) : inventory.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-12 w-12 text-gray-600 mx-auto mb-3" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-sm", children: "No items in inventory" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-xs mt-1", children: "Purchase items from the Shop!" })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
                    weapons.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-4 w-4 text-red-400" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-white", children: "Weapons" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] border-red-500/30 text-red-400", children: weapons.length })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: weapons.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: `p-3 rounded-lg border ${RARITY_COLORS[item.rarity] || RARITY_COLORS.common}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-white", children: item.name }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[9px] px-1.5 py-0", children: [
                                  "x",
                                  item.quantity
                                ] })
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1 text-xs text-gray-400", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                  "Power: ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400", children: item.power })
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: item.rarity })
                              ] })
                            ] }),
                            item.is_equipped && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-500/20 text-green-400 border-green-500/30 text-[10px]", children: "Equipped" })
                          ] })
                        },
                        item.inventory_id
                      )) })
                    ] }),
                    defenses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-cyan-400" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-white", children: "Defenses" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] border-cyan-500/30 text-cyan-400", children: defenses.length })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: defenses.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: `p-3 rounded-lg border ${RARITY_COLORS[item.rarity] || RARITY_COLORS.common}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-white", children: item.name }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[9px] px-1.5 py-0", children: [
                                  "x",
                                  item.quantity
                                ] })
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1 text-xs text-gray-400", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                  "Power: ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400", children: item.power })
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: item.rarity })
                              ] })
                            ] }),
                            item.is_equipped && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-500/20 text-green-400 border-green-500/30 text-[10px]", children: "Equipped" })
                          ] })
                        },
                        item.inventory_id
                      )) })
                    ] })
                  ] }) }) })
                ] })
              ]
            }
          )
        ]
      }
    ) })
  ] });
}

const CONTINENT_COUNTRIES = {
  EUROPE: [
    "IT",
    "FR",
    "DE",
    "ES",
    "PT",
    "GB",
    "NL",
    "BE",
    "AT",
    "CH",
    "PL",
    "CZ",
    "SK",
    "HU",
    "RO",
    "BG",
    "GR",
    "HR",
    "SI",
    "SE",
    "NO",
    "DK",
    "FI",
    "IE",
    "LT",
    "LV",
    "EE"
  ],
  ASIA: [
    "CN",
    "JP",
    "KR",
    "IN",
    "ID",
    "TH",
    "VN",
    "MY",
    "PH",
    "SG",
    "AE",
    "SA",
    "TR",
    "IL",
    "IR",
    "IQ",
    "PK",
    "BD"
  ],
  NORTH_AMERICA: ["US", "CA", "MX"],
  SOUTH_AMERICA: ["BR", "AR", "CL", "CO", "PE", "VE", "EC", "BO", "PY", "UY"],
  AFRICA: ["ZA", "EG", "NG", "KE", "MA", "DZ", "TN", "GH", "ET", "TZ"],
  OCEANIA: ["AU", "NZ", "FJ", "PG"]
};
const COUNTRY_TO_CONTINENT = {};
Object.entries(CONTINENT_COUNTRIES).forEach(([continent, countries]) => {
  countries.forEach((country) => {
    COUNTRY_TO_CONTINENT[country] = continent;
  });
});
const COUNTRY_NAMES = {
  IT: "Italia",
  FR: "Francia",
  DE: "Germania",
  ES: "Spagna",
  PT: "Portogallo",
  GB: "Regno Unito",
  NL: "Paesi Bassi",
  BE: "Belgio",
  AT: "Austria",
  CH: "Svizzera",
  PL: "Polonia",
  CZ: "Repubblica Ceca",
  SK: "Slovacchia",
  HU: "Ungheria",
  RO: "Romania",
  BG: "Bulgaria",
  GR: "Grecia",
  HR: "Croazia",
  SI: "Slovenia",
  SE: "Svezia",
  NO: "Norvegia",
  DK: "Danimarca",
  FI: "Finlandia",
  IE: "Irlanda",
  CN: "Cina",
  JP: "Giappone",
  KR: "Corea del Sud",
  IN: "India",
  ID: "Indonesia",
  TH: "Thailandia",
  VN: "Vietnam",
  MY: "Malaysia",
  PH: "Filippine",
  SG: "Singapore",
  AE: "Emirati Arabi",
  SA: "Arabia Saudita",
  TR: "Turchia",
  IL: "Israele",
  US: "Stati Uniti",
  CA: "Canada",
  MX: "Messico",
  BR: "Brasile",
  AR: "Argentina",
  CL: "Cile",
  CO: "Colombia",
  PE: "Perù",
  ZA: "Sudafrica",
  EG: "Egitto",
  NG: "Nigeria",
  KE: "Kenya",
  MA: "Marocco",
  AU: "Australia",
  NZ: "Nuova Zelanda"
};
const CONTINENT_NAMES = {
  EUROPE: "Europa",
  ASIA: "Asia",
  NORTH_AMERICA: "Nord America",
  SOUTH_AMERICA: "Sud America",
  AFRICA: "Africa",
  OCEANIA: "Oceania"
};

const M1ssionWarModal = ({
  isOpen,
  onClose,
  userId
}) => {
  const [loading, setLoading] = reactExports.useState(true);
  const [battleHistory, setBattleHistory] = reactExports.useState([]);
  const [countryProgress, setCountryProgress] = reactExports.useState([]);
  const [userStats, setUserStats] = reactExports.useState(null);
  const [activeTab, setActiveTab] = reactExports.useState("progress");
  reactExports.useEffect(() => {
    if (!isOpen || !userId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        let finalStats = {
          countries_owned: 0,
          countries_contested: 0,
          total_wins: 0,
          continents_owned: []
        };
        try {
          const { data: statsData } = await supabase.rpc("get_user_domination_stats", {
            p_user_id: userId
          });
          if (statsData && statsData.length > 0) {
            finalStats = statsData[0];
          }
        } catch (rpcErr) {
        }
        const { data: sessionWins, count: sessionCount } = await supabase.from("battle_sessions").select("id", { count: "exact" }).eq("winner_id", userId).eq("status", "resolved");
        if (sessionCount && sessionCount > 0) {
          finalStats.total_wins += sessionCount;
        }
        setUserStats(finalStats);
        const { data: allBattlesData } = await supabase.from("country_battle_wins").select("id, country_code, won_at, is_pvp, winner_id, is_win").eq("winner_id", userId).order("won_at", { ascending: false }).limit(50);
        const allBattles = (allBattlesData || []).map((b) => ({
          id: b.id,
          country_code: b.country_code,
          won_at: b.won_at,
          is_pvp: b.is_pvp,
          // is_win viene dal DB (nuova colonna), fallback a winner_id check per vecchi record
          is_win: b.is_win !== void 0 ? b.is_win : b.winner_id === userId
        }));
        setBattleHistory(allBattles);
        const { data: userWinsByCountry } = await supabase.from("country_battle_wins").select("country_code").eq("winner_id", userId).eq("is_win", true);
        const winsPerCountry = {};
        (userWinsByCountry || []).forEach((w) => {
          winsPerCountry[w.country_code] = (winsPerCountry[w.country_code] || 0) + 1;
        });
        const { count: sessionWinsCount } = await supabase.from("battle_sessions").select("id", { count: "exact" }).eq("winner_id", userId).eq("status", "resolved");
        if (sessionWinsCount && sessionWinsCount > 0 && Object.keys(winsPerCountry).length === 0) {
          winsPerCountry["IT"] = sessionWinsCount;
        }
        const countryCodes = Object.keys(winsPerCountry);
        if (countryCodes.length === 0) {
          if (allBattles.length > 0) {
            countryCodes.push("IT");
            winsPerCountry["IT"] = allBattles.length;
          }
        }
        let mappedProgress = [];
        if (countryCodes.length > 0) {
          const { data: progressData } = await supabase.from("country_domination").select("country_code, win_progress, conquest_threshold, status, owner_id").in("country_code", countryCodes);
          mappedProgress = (progressData || []).map((p) => {
            const userWins = winsPerCountry[p.country_code] || 0;
            return {
              country_code: p.country_code,
              country_name: COUNTRY_NAMES[p.country_code] || p.country_code,
              continent: CONTINENT_NAMES[COUNTRY_TO_CONTINENT[p.country_code]] || "Unknown",
              win_progress: userWins,
              // Vittorie DELL'UTENTE, non globali
              conquest_threshold: p.conquest_threshold,
              status: p.status,
              owner_id: p.owner_id,
              owner_name: null,
              is_mine: p.owner_id === userId,
              attacks_needed: Math.max(0, p.conquest_threshold - userWins),
              progress_percent: Math.min(100, userWins / p.conquest_threshold * 100)
            };
          });
          countryCodes.forEach((code) => {
            if (!mappedProgress.find((p) => p.country_code === code)) {
              const userWins = winsPerCountry[code] || 0;
              const threshold = code === "IT" ? 21 : 15;
              mappedProgress.push({
                country_code: code,
                country_name: COUNTRY_NAMES[code] || code,
                continent: CONTINENT_NAMES[COUNTRY_TO_CONTINENT[code]] || "Unknown",
                win_progress: userWins,
                conquest_threshold: threshold,
                status: "neutral",
                owner_id: null,
                owner_name: null,
                is_mine: false,
                attacks_needed: Math.max(0, threshold - userWins),
                progress_percent: Math.min(100, userWins / threshold * 100)
              });
            }
          });
        }
        mappedProgress.sort((a, b) => b.progress_percent - a.progress_percent);
        setCountryProgress(mappedProgress);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOpen, userId]);
  if (!isOpen) return null;
  const modalContent = /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "fixed inset-0 bg-black/80 backdrop-blur-md",
        style: { zIndex: 999998 },
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "fixed left-4 right-4 bg-gradient-to-b from-gray-900/98 to-black/98 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden",
        style: {
          zIndex: 999999,
          top: "calc(60px + env(safe-area-inset-top, 0px))",
          bottom: "calc(90px + env(safe-area-inset-bottom, 0px))",
          maxWidth: "600px",
          margin: "0 auto"
        },
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 },
        transition: { type: "spring", stiffness: 300, damping: 30 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-red-500/30 bg-gradient-to-r from-red-950/50 to-orange-950/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-5 w-5 text-white" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-red-400", children: "M1SSION WAR" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Domina il mondo" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: onClose,
                className: "h-8 w-8 rounded-full hover:bg-red-500/10",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
              }
            )
          ] }),
          userStats && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b border-red-500/20 bg-black/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-green-400", children: userStats.countries_owned }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-green-300/70", children: "Conquistati" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-amber-400", children: userStats.countries_contested }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-amber-300/70", children: "Contesi" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-cyan-400", children: userStats.total_wins }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-cyan-300/70", children: "Vittorie" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-purple-400", children: userStats.continents_owned?.length || 0 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-purple-300/70", children: "Continenti" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border-b border-red-500/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setActiveTab("progress"),
                className: `flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === "progress" ? "text-red-400 border-b-2 border-red-400 bg-red-500/10" : "text-muted-foreground hover:text-foreground"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "inline w-3.5 h-3.5 mr-1" }),
                  "Conquiste"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setActiveTab("history"),
                className: `flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === "history" ? "text-red-400 border-b-2 border-red-400 bg-red-500/10" : "text-muted-foreground hover:text-foreground"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "inline w-3.5 h-3.5 mr-1" }),
                  "Battaglie"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setActiveTab("leaderboard"),
                className: `flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === "leaderboard" ? "text-red-400 border-b-2 border-red-400 bg-red-500/10" : "text-muted-foreground hover:text-foreground"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "inline w-3.5 h-3.5 mr-1" }),
                  "Classifica"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[calc(100%-220px)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full" }) }) : activeTab === "progress" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            CountryProgressTab,
            {
              countryProgress,
              userId
            }
          ) : activeTab === "history" ? /* @__PURE__ */ jsxRuntimeExports.jsx(BattleHistoryTab, { battleHistory }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LeaderboardTab, {}) }) })
        ]
      }
    )
  ] }) });
  return reactDomExports.createPortal(modalContent, document.body);
};
const CountryProgressTab = ({
  countryProgress,
  userId
}) => {
  if (countryProgress.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-12 h-12 mx-auto text-red-500/30 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nessuna conquista in corso." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70 mt-1", children: "Attacca agenti in altri paesi per iniziare a conquistare!" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: countryProgress.map((country) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `p-3 rounded-xl border ${country.status === "conquered" ? "bg-green-950/30 border-green-500/30" : country.status === "contested" ? "bg-amber-950/30 border-amber-500/30" : "bg-gray-900/50 border-gray-700/30"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: `w-4 h-4 ${country.status === "conquered" ? "text-green-400" : country.status === "contested" ? "text-amber-400" : "text-gray-400"}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: country.country_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: country.continent })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: country.status === "conquered" && country.is_mine ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-green-400 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-3 h-3" }),
            "TUO!"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-cyan-400", children: [
              country.win_progress,
              "/",
              country.conquest_threshold
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: country.attacks_needed > 0 ? `${country.attacks_needed} mancanti` : "Completato!" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Progress,
            {
              value: country.progress_percent,
              className: `h-3 ${country.status === "conquered" ? "bg-green-950" : country.status === "contested" ? "bg-amber-950" : "bg-gray-800"}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${country.progress_percent >= 80 ? "text-amber-400" : country.progress_percent >= 50 ? "text-cyan-400" : "text-muted-foreground"}`, children: [
              country.win_progress,
              " vittorie su ",
              country.conquest_threshold
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold ${country.progress_percent >= 100 ? "text-green-400" : country.progress_percent >= 80 ? "text-amber-400" : "text-muted-foreground"}`, children: [
              Math.round(country.progress_percent),
              "%"
            ] })
          ] })
        ] }),
        country.status !== "neutral" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-medium ${country.status === "conquered" ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300"}`, children: country.status === "conquered" ? "✅ CONQUISTATO" : "⚔️ CONTESO" }) })
      ]
    },
    country.country_code
  )) });
};
const BattleHistoryTab = ({ battleHistory }) => {
  if (battleHistory.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "w-12 h-12 mx-auto text-red-500/30 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nessuna battaglia registrata." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70 mt-1", children: "Le tue battaglie appariranno qui!" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: battleHistory.map((battle) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `flex items-center justify-between p-3 rounded-lg border ${battle.is_win ? "bg-green-950/20 border-green-500/30" : "bg-red-950/20 border-red-500/30"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center ${battle.is_win ? "bg-green-500/20" : "bg-red-500/20"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: `w-4 h-4 ${battle.is_win ? "text-green-400" : "text-red-400"}` }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: COUNTRY_NAMES[battle.country_code] || battle.country_code }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: battle.is_pvp ? "⚔️ PvP" : "🤖 vs NPC" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs font-medium ${battle.is_win ? "text-green-400" : "text-red-400"}`, children: battle.is_win ? "+1 conquista" : "Sconfitta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: new Date(battle.won_at).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
          }) })
        ] })
      ]
    },
    battle.id
  )) });
};
const LeaderboardTab = () => {
  const [leaders, setLeaders] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const { data: conquests } = await supabase.from("country_domination").select("owner_id").eq("status", "conquered").not("owner_id", "is", null);
        const ownerIds = [...new Set((conquests || []).map((c) => c.owner_id))];
        const ownerCounts = {};
        (conquests || []).forEach((c) => {
          if (c.owner_id) {
            if (!ownerCounts[c.owner_id]) {
              ownerCounts[c.owner_id] = { full_name: "Agent", agent_code: "", count: 0 };
            }
            ownerCounts[c.owner_id].count++;
          }
        });
        if (ownerIds.length > 0) {
          const { data: profiles } = await supabase.from("public_profiles").select("id, full_name, agent_code, nickname").in("id", ownerIds);
          (profiles || []).forEach((p) => {
            if (ownerCounts[p.id]) {
              ownerCounts[p.id].full_name = p.full_name || p.nickname || "Agent";
              ownerCounts[p.id].agent_code = p.agent_code || "";
            }
          });
        }
        const sorted = Object.entries(ownerCounts).map(([id, data]) => ({
          id,
          full_name: data.full_name,
          agent_code: data.agent_code,
          countries_count: data.count
        })).sort((a, b) => b.countries_count - a.countries_count).slice(0, 10);
        setLeaders(sorted);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full" }) });
  }
  if (leaders.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-12 h-12 mx-auto text-red-500/30 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nessun conquistatore ancora." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70 mt-1", children: "Sii il primo a conquistare un paese!" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: leaders.map((leader, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `flex items-center justify-between p-3 rounded-lg border ${index === 0 ? "bg-yellow-950/30 border-yellow-500/30" : index === 1 ? "bg-gray-800/50 border-gray-500/30" : index === 2 ? "bg-orange-950/30 border-orange-700/30" : "bg-gray-900/50 border-gray-700/30"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-yellow-500 text-black" : index === 1 ? "bg-gray-400 text-black" : index === 2 ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-300"}`, children: index + 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: leader.full_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: leader.agent_code })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-4 h-4 text-green-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-green-400", children: leader.countries_count })
        ] })
      ]
    },
    leader.id
  )) });
};

const M1ssionWarPill = ({
  userId,
  className = ""
}) => {
  const [isModalOpen, setIsModalOpen] = reactExports.useState(false);
  if (!userId) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.button,
      {
        onClick: () => setIsModalOpen(true),
        className: `
          flex items-center gap-2 px-3 py-2
          bg-gradient-to-r from-red-900/80 to-orange-900/80
          backdrop-blur-md
          border border-red-500/40
          rounded-full
          shadow-lg shadow-red-500/20
          hover:from-red-800/90 hover:to-orange-800/90
          hover:border-red-400/60
          hover:shadow-red-500/30
          transition-all duration-300
          ${className}
        `,
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-4 h-4 text-red-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "w-3 h-3 text-orange-400 absolute -bottom-1 -right-1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-red-300 tracking-wide", children: "WAR" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      M1ssionWarModal,
      {
        isOpen: isModalOpen,
        onClose: () => setIsModalOpen(false),
        userId
      }
    )
  ] });
};

const STATUS_CONFIG = {
  available: {
    label: "Available for Battle",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30"
  },
  ghost: {
    label: "Ghost Mode Active",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30"
  },
  shielded: {
    label: "Shield Active",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  },
  in_battle: {
    label: "Currently in Battle",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30"
  }
};
function AgentBattleCard({
  isOpen,
  onClose,
  agentCode,
  displayName,
  rank,
  reputation,
  isAttackable,
  status = "available",
  onAttack
}) {
  const statusConfig = STATUS_CONFIG[status];
  const cardContent = /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "fixed inset-0 bg-black/60 backdrop-blur-md",
        style: { zIndex: 999996 },
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "fixed left-4 right-4 w-auto max-w-[400px] mx-auto",
        style: {
          zIndex: 999997,
          top: "calc(80px + env(safe-area-inset-top, 0px))"
        },
        initial: { opacity: 0, scale: 0.9, y: -20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: -20 },
        transition: { type: "spring", stiffness: 300, damping: 25 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-background/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative p-4 bg-gradient-to-r from-cyan-950/50 to-purple-950/50 border-b border-cyan-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-6 w-6 text-white" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-cyan-400", children: agentCode }),
                displayName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: displayName })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: onClose,
                className: "h-8 w-8 rounded-full hover:bg-cyan-500/10",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              rank && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/30 border border-border/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Rank" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: rank })
              ] }),
              reputation !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-muted/30 border border-border/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Reputation" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: reputation })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `
                    p-3 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}
                  `,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  status === "shielded" && /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4" }),
                  status === "in_battle" && /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 animate-pulse" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm font-medium ${statusConfig.color}`, children: statusConfig.label })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: onAttack,
                disabled: !isAttackable,
                className: "w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "mr-2 h-5 w-5" }),
                  isAttackable ? "Attack this Agent" : "Cannot Attack"
                ]
              }
            ),
            !isAttackable && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-center text-muted-foreground", children: "This agent is currently unavailable for battle" })
          ] })
        ] })
      }
    )
  ] }) });
  return reactDomExports.createPortal(cardContent, document.body);
}

function RewardCounterPill({ className = "" }) {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [stats, setStats] = reactExports.useState({ total: 0, claimed: 0, available: 0 });
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const loadStats = async () => {
    try {
      setIsLoading(true);
      const { data: markersData, error: markersError } = await supabase.from("markers").select("id").eq("active", true);
      if (markersError) {
        setStats({ total: 99, claimed: 0, available: 99 });
        return;
      }
      const totalMarkers = markersData?.length || 99;
      const { data: claimsData, error: claimsError } = await supabase.from("marker_claims").select("marker_id");
      if (claimsError) {
        setStats({ total: totalMarkers, claimed: 0, available: totalMarkers });
        return;
      }
      const claimedMarkerIds = new Set((claimsData || []).map((c) => c.marker_id));
      const claimedCount = claimedMarkerIds.size;
      setStats({
        total: Math.max(totalMarkers, 99),
        // At least 99
        claimed: claimedCount,
        available: Math.max(totalMarkers, 99) - claimedCount
      });
    } catch (error) {
      setStats({ total: 99, claimed: 0, available: 99 });
    } finally {
      setIsLoading(false);
    }
  };
  reactExports.useEffect(() => {
    loadStats();
    const channel = supabase.channel("reward-counter-updates").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "marker_claims" },
      () => {
        loadStats();
      }
    ).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "markers" },
      () => {
        loadStats();
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const availablePercent = stats.total > 0 ? Math.round(stats.available / stats.total * 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.button,
      {
        className: `pill-orb ${className}`,
        onClick: () => setIsOpen(true),
        "aria-label": "Marker Rewards disponibili",
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.97 },
        initial: { scale: 0 },
        animate: { scale: 1 },
        transition: { type: "spring", stiffness: 300, damping: 20 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-5 h-5 text-yellow-300" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dot", style: { background: "#ffd700", boxShadow: "0 0 8px #ffd700" } }),
          !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              className: "absolute -top-1 -right-1 h-5 min-w-[28px] px-1.5 flex items-center justify-center text-[9px] bg-gradient-to-br from-yellow-500 to-orange-600 border-2 border-background font-bold",
              children: [
                stats.available,
                "/",
                stats.total
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "fixed inset-0 z-[5000] flex items-center justify-center p-4",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute inset-0 bg-black/80 backdrop-blur-sm",
              onClick: () => setIsOpen(false)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "relative w-full max-w-sm overflow-hidden rounded-2xl",
              style: {
                background: "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)",
                border: "1px solid rgba(255, 215, 0, 0.3)",
                boxShadow: "0 0 40px rgba(255, 215, 0, 0.15), 0 25px 50px rgba(0, 0, 0, 0.5)"
              },
              initial: { scale: 0.9, y: 20, opacity: 0 },
              animate: { scale: 1, y: 0, opacity: 1 },
              exit: { scale: 0.9, y: 20, opacity: 0 },
              transition: { type: "spring", damping: 25 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-6 py-4 border-b border-white/10", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "p-2.5 rounded-xl",
                        style: {
                          background: "radial-gradient(circle at 30% 30%, rgba(255,215,0,0.2), rgba(255,165,0,0.3) 80%)",
                          border: "1px solid rgba(255, 215, 0, 0.3)"
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-5 h-5 text-yellow-400" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-white font-orbitron", children: "Rewards" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Premi sulla Mappa" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setIsOpen(false),
                      className: "absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-gray-400" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 space-y-6", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-32 h-32", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "w-full h-full transform -rotate-90", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "circle",
                        {
                          cx: "64",
                          cy: "64",
                          r: "56",
                          fill: "none",
                          stroke: "rgba(255,255,255,0.1)",
                          strokeWidth: "8"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "circle",
                        {
                          cx: "64",
                          cy: "64",
                          r: "56",
                          fill: "none",
                          stroke: "url(#rewardGradient)",
                          strokeWidth: "8",
                          strokeLinecap: "round",
                          strokeDasharray: `${availablePercent * 3.52} 352`
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "rewardGradient", x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#ffd700" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#ff8c00" })
                      ] }) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold text-yellow-400", children: stats.available }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "disponibili" })
                    ] })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 rounded-xl p-3 text-center border border-white/10", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-5 h-5 text-yellow-400 mx-auto mb-1" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-white", children: stats.total }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-gray-400 uppercase", children: "Totali" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-5 h-5 text-green-400 mx-auto mb-1" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-green-400", children: stats.claimed }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-gray-400 uppercase", children: "Riscattati" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/20", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5 text-yellow-400 mx-auto mb-1" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-yellow-400", children: stats.available }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-gray-400 uppercase", children: "Disponibili" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-emerald-200/80 text-center", children: [
                    "🎁 Trova i marker ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-emerald-400 font-semibold", children: "verdi" }),
                    " sulla mappa per riscattare premi istantanei!"
                  ] }) })
                ] }) })
              ]
            }
          )
        ]
      }
    ) })
  ] });
}

const DebugMapPanel = () => {
  const { user, session, isAuthenticated } = useUnifiedAuth();
  const { nextLevel, nextRadiusKm, nextCostM1U } = useBuzzMapPricingNew(user?.id);
  const { unitsData } = useM1UnitsRealtime(user?.id);
  const [collapsed, setCollapsed] = reactExports.useState(true);
  const [geoPermission, setGeoPermission] = reactExports.useState("unknown");
  const [currentPos, setCurrentPos] = reactExports.useState(null);
  const [lastResult, setLastResult] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setGeoPermission(result.state);
      });
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPos({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
        }
      );
    }
  }, []);
  const getJwtInfo = () => {
    if (!session?.access_token) return { len: 0, exp: null };
    try {
      const parts = session.access_token.split(".");
      if (parts.length !== 3) return { len: 0, exp: null };
      const payload = JSON.parse(atob(parts[1]));
      return {
        len: session.access_token.length,
        exp: payload.exp ? new Date(payload.exp * 1e3).toISOString() : null
      };
    } catch (e) {
      return { len: session.access_token.length, exp: null };
    }
  };
  const testMapGeneration = async () => {
    try {
      const coords = currentPos || { lat: 41.9028, lng: 12.4964 };
      const { data, error } = await supabase.functions.invoke("handle-buzz-press", {
        body: {
          generateMap: true,
          coordinates: coords,
          sessionId: "debug_" + Date.now()
        },
        headers: { "x-m1-debug": "1" }
      });
      const result = {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        success: !error,
        data,
        error: error?.message || null,
        coordinates: coords
      };
      setLastResult(result);
    } catch (e) {
      setLastResult({ error: e.message });
    }
  };
  if (!isAuthenticated) return null;
  const panel = /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      style: {
        position: "fixed",
        bottom: "80px",
        right: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        color: "#fff",
        padding: collapsed ? "8px" : "12px",
        borderRadius: "8px",
        fontSize: "11px",
        zIndex: 2147483e3,
        maxWidth: "320px",
        maxHeight: collapsed ? "40px" : "60vh",
        overflow: "auto",
        fontFamily: "monospace",
        border: "1px solid #10b981"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onClick: () => setCollapsed(!collapsed),
            style: {
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: "bold",
              marginBottom: collapsed ? 0 : "8px"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🗺️ MAP DEBUG" }),
              collapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16 })
            ]
          }
        ),
        !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "8px", paddingTop: "8px", borderTop: "1px solid #444" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: "bold", marginBottom: "4px" }, children: "Auth & Session" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Auth: ",
              isAuthenticated ? "✅" : "❌"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "User ID: ",
              user?.id?.substring(0, 12),
              "..."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "JWT Len: ",
              getJwtInfo().len
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "8px", paddingTop: "8px", borderTop: "1px solid #444" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: "bold", marginBottom: "4px" }, children: "Geolocation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Permission: ",
              geoPermission
            ] }),
            currentPos && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                "Lat: ",
                currentPos.lat.toFixed(4)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                "Lng: ",
                currentPos.lng.toFixed(4)
              ] })
            ] }),
            !currentPos && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#ef4444" }, children: "No position" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "8px", paddingTop: "8px", borderTop: "1px solid #444" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: "bold", marginBottom: "4px" }, children: "Economy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Balance M1U: ",
              unitsData?.balance || 0
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Cost M1U: ",
              nextCostM1U
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Next Level: ",
              nextLevel
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Next Radius: ",
              nextRadiusKm,
              "km"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "8px", paddingTop: "8px", borderTop: "1px solid #444" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: "bold", marginBottom: "4px" }, children: "Payload Preview" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { style: { fontSize: "9px", margin: 0 }, children: JSON.stringify({
              generateMap: true,
              coordinates: currentPos || { lat: "N/A", lng: "N/A" },
              sessionId: "xxx"
            }, null, 1) })
          ] }),
          lastResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "8px", paddingTop: "8px", borderTop: "1px solid #444" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: "bold", marginBottom: "4px" }, children: "Last Test" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Success: ",
              lastResult.success ? "✅" : "❌"
            ] }),
            lastResult.data?.area_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                "Area ID: ",
                lastResult.data.area_id.substring(0, 12),
                "..."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                "Radius: ",
                lastResult.data.radius_km,
                "km"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                "Level: ",
                lastResult.data.level
              ] })
            ] }),
            lastResult.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: "#ef4444" }, children: [
              "Error: ",
              lastResult.error
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CopyJsonButton, { data: lastResult, label: "Copy Result" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: "4px", paddingTop: "8px", borderTop: "1px solid #444" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: testMapGeneration,
              style: {
                padding: "4px 8px",
                fontSize: "10px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              },
              children: "Test MAP"
            }
          ) })
        ] })
      ]
    }
  );
  return typeof document !== "undefined" ? reactDomExports.createPortal(panel, document.body) : panel;
};

const MILESTONE_4_MIN = 240;
const MILESTONE_10_MIN = 600;
function useMapTimeTracking({ enabled = true } = {}) {
  const { awardPE } = useAwardPE();
  const startTimeRef = reactExports.useRef(null);
  const awarded4MinRef = reactExports.useRef(false);
  const awarded10MinRef = reactExports.useRef(false);
  const intervalRef = reactExports.useRef(null);
  const checkMilestones = reactExports.useCallback(() => {
    if (!startTimeRef.current) return;
    const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1e3);
    if (elapsedSeconds >= MILESTONE_4_MIN && !awarded4MinRef.current) {
      awarded4MinRef.current = true;
      awardPE("MAP_TIME_240S", void 0, {
        elapsedSeconds,
        milestone: "4min"
      }).catch((err) => void 0);
    }
    if (elapsedSeconds >= MILESTONE_10_MIN && !awarded10MinRef.current) {
      awarded10MinRef.current = true;
      awardPE("MAP_TIME_600S", void 0, {
        elapsedSeconds,
        milestone: "10min"
      }).catch((err) => void 0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [awardPE]);
  reactExports.useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    startTimeRef.current = Date.now();
    awarded4MinRef.current = false;
    awarded10MinRef.current = false;
    intervalRef.current = setInterval(checkMilestones, 30 * 1e3);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      startTimeRef.current = null;
    };
  }, [enabled, checkMilestones]);
  return {
    // Expose elapsed time if needed for UI
    getElapsedSeconds: reactExports.useCallback(() => {
      if (!startTimeRef.current) return 0;
      return Math.floor((Date.now() - startTimeRef.current) / 1e3);
    }, []),
    has4MinMilestone: awarded4MinRef.current,
    has10MinMilestone: awarded10MinRef.current
  };
}

function MissionPill() {
  const { user } = useAuth();
  const [showModal, setShowModal] = reactExports.useState(false);
  const [phase, setPhase] = reactExports.useState(0);
  const [showCompletion, setShowCompletion] = reactExports.useState(false);
  const [completedReward, setCompletedReward] = reactExports.useState(0);
  const [completedPhase, setCompletedPhase] = reactExports.useState(1);
  const [isReady, setIsReady] = reactExports.useState(false);
  const mission = getMissionOfTheDay();
  const { phase1: phase1Reward, phase2: phase2Reward } = calculatePhaseRewards(mission.totalRewardM1U);
  const refreshState = reactExports.useCallback(() => {
    const state = getMissionState();
    setPhase(state.phase);
  }, []);
  reactExports.useEffect(() => {
    const timer = setTimeout(() => {
      refreshState();
      setIsReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [refreshState]);
  reactExports.useEffect(() => {
    if (!user || !isReady) return;
    const interval = setInterval(refreshState, 5e3);
    return () => clearInterval(interval);
  }, [user, isReady, refreshState]);
  if (!isReady) return null;
  if (phase === 3) return null;
  const isPhase2Ready = isPhase2Available();
  const isNotStarted = phase === 0;
  const isPhase1Active = phase === 1 && !isPhase2Ready;
  const isPhase2Pending = phase === 2 && !isPhase2Ready;
  const handleStartMission = async () => {
    startMission(mission.id);
    markBriefingShown();
    refreshState();
    setShowModal(false);
  };
  const handleCompletePhase1 = async () => {
    completePhase1();
    await creditM1USafe(phase1Reward, `Mission Phase 1: ${mission.id}`);
    markPhase1Credited();
    setCompletedReward(phase1Reward);
    setCompletedPhase(1);
    setShowCompletion(true);
    refreshState();
    setShowModal(false);
  };
  const handleCompletePhase2 = async () => {
    completePhase2();
    await creditM1USafe(phase2Reward, `Mission Phase 2: ${mission.id}`);
    markPhase2Credited();
    setCompletedReward(phase2Reward);
    setCompletedPhase(2);
    setShowCompletion(true);
    refreshState();
    setShowModal(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.button,
      {
        className: "pill-orb fixed",
        style: {
          left: "16px",
          bottom: "calc(env(safe-area-inset-bottom, 34px) + 170px)",
          zIndex: 9998
        },
        onClick: () => setShowModal(true),
        initial: { scale: 0 },
        animate: { scale: 1 },
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.97 },
        transition: { type: "spring", stiffness: 300, damping: 20 },
        "aria-label": "Daily Mission",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: "/icons/icon-m1-192x192.png",
              alt: "M1",
              style: {
                width: "24px",
                height: "24px",
                borderRadius: "4px",
                position: "relative",
                zIndex: 2
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "dot",
              style: {
                background: isPhase2Ready ? "#FFD700" : isNotStarted ? "#00FF96" : "#0ff",
                boxShadow: `0 0 8px ${isPhase2Ready ? "#FFD700" : isNotStarted ? "#00FF96" : "#0ff"}`
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              className: "absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[8px] font-bold border-2 border-background",
              style: {
                background: isNotStarted ? "linear-gradient(135deg, #00FF96, #00CC77)" : isPhase2Ready ? "linear-gradient(135deg, #FFD700, #FFA500)" : "linear-gradient(135deg, #00D1FF, #0099CC)",
                color: isNotStarted || isPhase2Ready ? "#000" : "#fff"
              },
              children: isNotStarted ? "!" : isPhase2Ready ? "P2" : "P1"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: () => setShowModal(false),
        style: {
          position: "fixed",
          inset: 0,
          zIndex: 10003,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { scale: 0.9, y: 30 },
            animate: { scale: 1, y: 0 },
            exit: { scale: 0.9, y: 30 },
            onClick: (e) => e.stopPropagation(),
            style: {
              width: "100%",
              maxWidth: "340px",
              maxHeight: "80vh",
              overflowY: "auto",
              background: "linear-gradient(145deg, rgba(10,20,40,0.98), rgba(20,30,50,0.95))",
              borderRadius: "20px",
              border: "2px solid rgba(0,209,255,0.4)",
              padding: "20px"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", marginBottom: "16px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "40px" }, children: mission.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "16px", fontWeight: 700, color: "#fff", margin: "8px 0 4px" }, children: mission.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "12px", color: "rgba(255,255,255,0.7)" }, children: mission.description })
              ] }),
              isNotStarted && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "rgba(0,255,150,0.1)", borderRadius: "12px", padding: "12px", marginBottom: "12px" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "11px", color: "#00FF96", fontWeight: 600, margin: 0 }, children: [
                    "📍 PHASE 1 TODAY: +",
                    phase1Reward,
                    " M1U"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "11px", color: "#FFD700", fontWeight: 600, margin: "4px 0 0" }, children: [
                    "🔄 PHASE 2 TOMORROW: +",
                    phase2Reward,
                    " M1U"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: handleStartMission,
                    style: {
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #00FF96, #00CC77)",
                      border: "none",
                      color: "#000",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 18 }),
                      " START MISSION"
                    ]
                  }
                )
              ] }),
              isPhase1Active && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "rgba(0,209,255,0.1)", borderRadius: "12px", padding: "12px", marginBottom: "12px" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "11px", color: "#00D1FF", fontWeight: 600, margin: 0 }, children: "📍 PHASE 1 IN PROGRESS" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "12px", color: "#fff", margin: "4px 0" }, children: mission.phase1.instruction })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: handleCompletePhase1,
                    style: {
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #00D1FF, #0099CC)",
                      border: "none",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer"
                    },
                    children: [
                      "✓ COMPLETE PHASE 1 (+",
                      phase1Reward,
                      " M1U)"
                    ]
                  }
                )
              ] }),
              isPhase2Pending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "rgba(255,200,0,0.1)", borderRadius: "12px", padding: "16px", textAlign: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 30, color: "#FFD700", style: { marginBottom: "8px" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "13px", color: "#FFD700", fontWeight: 600, margin: 0 }, children: "PHASE 2 UNLOCKS TOMORROW" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "11px", color: "rgba(255,255,255,0.7)", margin: "4px 0 0" }, children: [
                  "Return to claim +",
                  phase2Reward,
                  " M1U"
                ] })
              ] }),
              isPhase2Ready && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "rgba(255,200,0,0.1)", borderRadius: "12px", padding: "12px", marginBottom: "12px" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "11px", color: "#FFD700", fontWeight: 600, margin: 0 }, children: "🔄 PHASE 2 READY!" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "12px", color: "#fff", margin: "4px 0" }, children: mission.phase2.instruction })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: handleCompletePhase2,
                    style: {
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #FFD700, #FFA500)",
                      border: "none",
                      color: "#000",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer"
                    },
                    children: [
                      "🎉 COMPLETE PHASE 2 (+",
                      phase2Reward,
                      " M1U)"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  onClick: () => setShowModal(false),
                  style: { fontSize: "12px", color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: "12px", cursor: "pointer" },
                  children: "Close"
                }
              )
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showCompletion && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { y: 100, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 100, opacity: 0 },
        onClick: () => setShowCompletion(false),
        style: {
          position: "fixed",
          bottom: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10004,
          background: "linear-gradient(135deg, rgba(0,40,20,0.95), rgba(0,60,30,0.9))",
          border: "2px solid rgba(0,255,150,0.5)",
          borderRadius: "16px",
          padding: "16px 24px",
          textAlign: "center"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "14px", fontWeight: 700, color: "#00FF96", margin: 0 }, children: completedPhase === 1 ? "✅ PHASE 1 COMPLETE!" : "🎉 MISSION ACCOMPLISHED!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "20px", fontWeight: 800, color: "#00FF96", margin: "4px 0" }, children: [
            "+",
            completedReward,
            " M1U"
          ] }),
          completedPhase === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "11px", color: "#FFD700", margin: 0 }, children: "Return tomorrow for Phase 2!" })
        ]
      }
    ) })
  ] });
}

const DEV_MOCKS = false;
const DEV_VIEW_LOCK = undefined                                         === "true";
function MapTiler3D() {
  const containerRef = reactExports.useRef(null);
  const mapRef = reactExports.useRef(null);
  const debugEnabled = useDebugFlag();
  useMapGlitchEffect();
  useMapTimeTracking({ enabled: true });
  const [diag, setDiag] = reactExports.useState({
    keyMode: "?",
    tiles: "?",
    pbf: "?",
    glyph: "?",
    style: "-",
    error: null
  });
  reactExports.useEffect(() => {
    if (!localStorage.getItem("m1_has_seen_map")) {
      localStorage.setItem("m1_has_seen_map", "true");
    }
    if (!localStorage.getItem("m1_first_session_completed")) {
      localStorage.setItem("m1_first_session_completed", "true");
    }
  }, []);
  reactExports.useEffect(() => {
  }, []);
  const [layerVisibility, setLayerVisibility] = reactExports.useState({
    agents: true,
    portals: true,
    rewards: true,
    areas: true,
    notes: true
  });
  const [rewardZoneArea, setRewardZoneArea] = reactExports.useState(null);
  const [mapStyle, setMapStyle] = reactExports.useState("neon");
  const DEFAULT_LOCATION = [41.9028, 12.4964];
  const devMocks = use3DDevMocks();
  const { currentWeekAreas, reloadAreas } = useBuzzMapLogic();
  const { position, status: geoStatus, enable: enableGeo, enabled: geoEnabled, isBlocked, isIOS, isPWA, retry: retryGeo} = useGeolocation();
  useAgentLocationUpdater(position || void 0, geoEnabled);
  const { portals, agents: liveAgents, events, zones, loading: liveLoading } = useLiveLayers(true);
  const {
    searchAreas,
    isAddingSearchArea,
    setActiveSearchArea,
    handleAddArea,
    handleMapClickArea,
    deleteSearchArea,
    setPendingRadius,
    createAreaDirect
  } = useSearchAreasLogic();
  const handleAddAreaWithRadius = (radius) => {
    if (radius) setPendingRadius(radius);
    handleAddArea(radius);
  };
  const {
    isAddingMarker,
    handleMapClickMarker} = useMapMarkersLogic();
  const { isAuthenticated, user } = useUnifiedAuth();
  const [rewardMarkersLive, setRewardMarkersLive] = reactExports.useState([]);
  const [isUserAdmin, setIsUserAdmin] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!user?.id) {
      setIsUserAdmin(false);
      return;
    }
    const checkAdmin = async () => {
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      setIsUserAdmin(!!data?.role && ["admin", "owner"].some((r) => data.role.toLowerCase().includes(r)));
    };
    checkAdmin();
  }, [user?.id]);
  reactExports.useEffect(() => {
    let mounted = true;
    if (!isAuthenticated) {
      setRewardMarkersLive([]);
      return;
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const load = async () => {
      try {
        const { data: markersData, error } = await supabase.from("markers").select("id, lat, lng, title, active, visible_from, visible_to").eq("active", true).or(`visible_from.is.null,visible_from.lte.${now}`).or(`visible_to.is.null,visible_to.gte.${now}`).limit(2e3);
        if (!mounted) return;
        if (error) {
          return;
        }
        const markerIds = (markersData || []).map((m) => m.id);
        const { data: claimsData } = await supabase.from("marker_claims").select("marker_id").in("marker_id", markerIds);
        const { data: rewardsData } = await supabase.from("marker_rewards").select("marker_id, payload").in("marker_id", markerIds);
        const claimedIds = new Set((claimsData || []).map((c) => c.marker_id));
        const minZoomMap = /* @__PURE__ */ new Map();
        (rewardsData || []).forEach((r) => {
          if (r.payload?.min_zoom) {
            minZoomMap.set(r.marker_id, r.payload.min_zoom);
          }
        });
        setRewardMarkersLive((markersData || []).map((m) => ({
          id: m.id,
          lat: m.lat,
          lng: m.lng,
          title: m.title,
          claimed: claimedIds.has(m.id),
          // 🟣 VIOLA se riscattato
          min_zoom: minZoomMap.get(m.id) || 17
          // Zoom minimo per visibilità (default 17)
        })));
      } catch (e) {
      }
    };
    load();
    const channel = supabase.channel("markers-changes-3d").on("postgres_changes", { event: "*", schema: "public", table: "markers" }, () => load()).on("postgres_changes", { event: "*", schema: "public", table: "marker_claims" }, () => load()).subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);
  reactExports.useEffect(() => {
    if (!isAuthenticated) return;
    let lastRefetch = 0;
    const REFETCH_THROTTLE_MS = 3e3;
    const refetchAgentsSilently = async () => {
      const now = Date.now();
      if (now - lastRefetch < REFETCH_THROTTLE_MS) {
        return;
      }
      lastRefetch = now;
    };
    const channel = supabase.channel("agent-locations-live-3d").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "agent_locations"
    }, refetchAgentsSilently).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);
  reactExports.useEffect(() => {
    if (geoStatus === "idle") {
      enableGeo();
    }
  }, [geoStatus, enableGeo]);
  const processRewardZoneTarget = reactExports.useCallback(() => {
    const targetStr = sessionStorage.getItem("reward_zone_target");
    if (!targetStr) return;
    try {
      const target = JSON.parse(targetStr);
      if (Date.now() - target.timestamp > 6e4) {
        sessionStorage.removeItem("reward_zone_target");
        return;
      }
      sessionStorage.removeItem("reward_zone_target");
      setRewardZoneArea({
        lat: target.lat,
        lng: target.lng,
        radius: target.radius,
        markerId: target.markerId
      });
      let retryCount = 0;
      const MAX_RETRIES = 20;
      const flyToTarget = () => {
        const map = mapRef.current;
        if (!map || !map.isStyleLoaded()) {
          retryCount++;
          if (retryCount < MAX_RETRIES) {
            setTimeout(flyToTarget, 500);
          } else {
          }
          return;
        }
        map.flyTo({
          center: [target.lng, target.lat],
          zoom: 15,
          pitch: 45,
          bearing: 0,
          duration: 3e3
        });
      };
      setTimeout(flyToTarget, 500);
    } catch (e) {
      sessionStorage.removeItem("reward_zone_target");
    }
  }, []);
  reactExports.useEffect(() => {
    processRewardZoneTarget();
    let checkInterval = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 20;
    checkInterval = setInterval(() => {
      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        if (checkInterval) clearInterval(checkInterval);
        return;
      }
      processRewardZoneTarget();
    }, 500);
    const handleFlyToEvent = () => {
      processRewardZoneTarget();
    };
    window.addEventListener("reward-zone-fly-to", handleFlyToEvent);
    return () => {
      if (checkInterval) clearInterval(checkInterval);
      window.removeEventListener("reward-zone-fly-to", handleFlyToEvent);
    };
  }, [processRewardZoneTarget]);
  reactExports.useEffect(() => {
    if (!isAuthenticated) return;
    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;
      const currentWeek = getCurrentWeekOfYear();
      const channel = supabase.channel(`map3d_buzz_fit_${uid}`).on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_map_areas",
          filter: `user_id=eq.${uid}`
        },
        async (payload) => {
          if (payload.new?.source === "buzz_map" && payload.new?.week === currentWeek) {
            const map = mapRef.current;
            if (!map) return;
            const lat = payload.new.center_lat ?? payload.new.lat;
            const lng = payload.new.center_lng ?? payload.new.lng;
            const radiusKm = payload.new.radius_km || 500;
            const radiusMeters = radiusKm * 1e3;
            await reloadAreas();
            window.dispatchEvent(new CustomEvent("areasReloaded", {
              detail: {
                lat,
                lng,
                radius_km: radiusKm
              }
            }));
            window.dispatchEvent(new CustomEvent("buzzAreaCreated", {
              detail: {
                lat,
                lng,
                radius_km: radiusKm
              }
            }));
            setTimeout(() => {
              const latDeltaDeg = radiusMeters / 111320;
              const lngDeltaDeg = radiusMeters / (111320 * Math.cos(lat * Math.PI / 180));
              const bbox = [
                [lng - lngDeltaDeg, lat - latDeltaDeg],
                [lng + lngDeltaDeg, lat + latDeltaDeg]
              ];
              const maxZoom = radiusKm > 150 ? 6 : radiusKm > 80 ? 8 : 10;
              map.fitBounds(bbox, {
                padding: 80,
                maxZoom,
                duration: 800
              });
            }, 400);
          }
        }
      ).subscribe();
      return () => supabase.removeChannel(channel);
    };
    setup();
  }, [isAuthenticated]);
  reactExports.useEffect(() => {
    return;
  }, [devMocks.notesSeed]);
  const realAgents = liveAgents && liveAgents.length > 0 ? liveAgents : [];
  const fakeAgents = reactExports.useMemo(() => {
    const WORLD_AGENTS = [
      { name: "AG-CHINA", lat: 39.9042, lng: 116.4074, country: "Beijing, China" },
      { name: "AG-RUSSIA", lat: 55.7558, lng: 37.6173, country: "Moscow, Russia" },
      { name: "AG-AUSTRALIA", lat: -33.8688, lng: 151.2093, country: "Sydney, Australia" },
      { name: "AG-USA", lat: 40.7128, lng: -74.006, country: "New York, USA" },
      { name: "AG-BRAZIL", lat: -22.9068, lng: -43.1729, country: "Rio de Janeiro, Brazil" },
      { name: "AG-JAPAN", lat: 35.6762, lng: 139.6503, country: "Tokyo, Japan" },
      { name: "AG-INDIA", lat: 28.6139, lng: 77.209, country: "New Delhi, India" },
      { name: "AG-EGYPT", lat: 30.0444, lng: 31.2357, country: "Cairo, Egypt" },
      { name: "AG-UK", lat: 51.5074, lng: -0.1278, country: "London, UK" },
      { name: "AG-SOUTH-AFRICA", lat: -33.9249, lng: 18.4241, country: "Cape Town, South Africa" }
    ];
    return WORLD_AGENTS.map((agent, index) => ({
      id: `fake-agent-${index}`,
      username: agent.name,
      agent_code: agent.name,
      status: "online",
      lat: agent.lat,
      lng: agent.lng,
      avatar_url: void 0,
      lastSeen: (/* @__PURE__ */ new Date()).toISOString(),
      rank_id: Math.floor(Math.random() * 5) + 1,
      is_fake: true,
      country: agent.country
      // Extra info for display
    }));
  }, []);
  const effectiveAgents = [...realAgents, ...fakeAgents];
  const effectiveRewardMarkers = rewardMarkersLive;
  const effectiveUserAreas = currentWeekAreas?.length ? currentWeekAreas.map((a) => ({
    id: a.id,
    lat: a.lat,
    lng: a.lng,
    radius: a.radius_km * 1e3,
    level: a.level,
    radius_km: a.radius_km
  })) : [];
  reactExports.useEffect(() => {
  }, []);
  const filteredUserAreas = effectiveUserAreas.length > 0 ? [effectiveUserAreas[0]] : [];
  const latestArea = effectiveUserAreas[0] || null;
  const currentAreaVersion = reactExports.useMemo(() => {
    if (!latestArea) return "none";
    return `${latestArea.id}|${latestArea.level}|${latestArea.radius_km}`;
  }, [latestArea?.id, latestArea?.level, latestArea?.radius_km]);
  reactExports.useEffect(() => {
  }, [latestArea?.id, latestArea?.radius_km]);
  const effectiveSearchAreas = searchAreas?.length ? searchAreas.map((a) => ({ id: a.id, lat: a.lat, lng: a.lng, radius: a.radius })) : [];
  reactExports.useEffect(() => {
  }, [events.length, zones.length, portals.length, effectiveAgents.length, liveLoading]);
  reactExports.useEffect(() => {
  }, [effectiveAgents.length, effectiveRewardMarkers.length, filteredUserAreas.length, effectiveSearchAreas.length]);
  const mapCenter = position ? [position.lat, position.lng] : void 0;
  const handleBuzz = () => {
  };
  const handleAreaGenerated = (lat, lng, radiusMeters) => {
    const radiusKm = radiusMeters / 1e3;
    reloadAreas();
    if (mapRef.current) {
      const map = mapRef.current;
      setTimeout(() => {
        const latDeltaDeg = radiusMeters / 111320;
        const lngDeltaDeg = radiusMeters / (111320 * Math.cos(lat * Math.PI / 180));
        const bbox = [
          [lng - lngDeltaDeg, lat - latDeltaDeg],
          [lng + lngDeltaDeg, lat + latDeltaDeg]
        ];
        const maxZoom = radiusKm > 150 ? 6 : radiusKm > 80 ? 8 : 10;
        map.fitBounds(bbox, {
          padding: 80,
          maxZoom,
          duration: 800
        });
      }, 300);
    }
  };
  const toggleLayer = (layer) => {
    setLayerVisibility((prev) => {
      const newState = { ...prev, [layer]: !prev[layer] };
      return newState;
    });
  };
  const handleMapStyleChange = (newStyle) => {
    const map = mapRef.current;
    if (!map) return;
    const hostname = window.location.hostname;
    const isPreview = hostname.includes("lovable") || hostname.includes("pages.dev") || hostname === "localhost" || hostname === "127.0.0.1";
    const key = isPreview ? "gw2gQRfg512G0yw3DbWn" : "M2JlRFvsxjcMvVXw1HN1";
    let styleUrl;
    if (newStyle === "neon") {
      const style = JSON.parse(JSON.stringify(neonStyleTemplate));
      if (style.sources) {
        Object.keys(style.sources).forEach((sourceKey) => {
          const source = style.sources[sourceKey];
          if (source.url) source.url = source.url.replace("{key}", key).replace("YOUR_MAPTILER_API_KEY_HERE", key);
          if (source.tiles) source.tiles = source.tiles.map((t) => t.replace("{key}", key).replace("YOUR_MAPTILER_API_KEY_HERE", key));
        });
      }
      if (style.glyphs) style.glyphs = style.glyphs.replace("{key}", key).replace("YOUR_MAPTILER_API_KEY_HERE", key);
      if (style.sprite) style.sprite = style.sprite.replace("{key}", key).replace("YOUR_MAPTILER_API_KEY_HERE", key);
      map.setStyle(style);
      setMapStyle("neon");
      ue.success("🌃 Stile Neon attivato");
      return;
    } else if (newStyle === "streets") {
      styleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${key}`;
    } else if (newStyle === "satellite") {
      styleUrl = `https://api.maptiler.com/maps/hybrid/style.json?key=${key}`;
    } else {
      return;
    }
    setMapStyle(newStyle);
    map.setStyle(styleUrl);
    ue.success(`🗺️ Stile ${newStyle === "streets" ? "Standard" : "Satellite"} attivato`);
  };
  reactExports.useEffect(() => {
    return () => void 0;
  }, []);
  reactExports.useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const forceKey = sp.get("forceKey");
    const hostname = window.location.hostname;
    const isPreview = hostname.includes("lovable") || hostname.includes("pages.dev") || hostname === "localhost" || hostname === "127.0.0.1";
    const devKey = "gw2gQRfg512G0yw3DbWn";
    const prodKey = "M2JlRFvsxjcMvVXw1HN1";
    let key;
    let mode;
    if (forceKey === "DEV") {
      key = devKey;
      mode = "DEV (forced)";
    } else if (forceKey === "PROD") {
      key = prodKey;
      mode = "PROD (forced)";
    } else {
      key = isPreview ? devKey : prodKey;
      mode = isPreview ? "DEV (auto)" : "PROD (auto)";
    }
    if (!key) {
      const msg = "MapTiler secrets not loaded. Please wait for rebuild or hard refresh.";
      ue.error(msg);
      setDiag((prev) => ({ ...prev, error: msg }));
      return;
    }
    const lat = parseFloat(sp.get("lat") || "41.9028");
    const lng = parseFloat(sp.get("lng") || "12.4964");
    const z = parseFloat(sp.get("z") || "15.5");
    const pitch = parseFloat(sp.get("pitch") || "55");
    const bearing = parseFloat(sp.get("bearing") || "25");
    if (!containerRef.current || !key) {
      setDiag((prev) => ({ ...prev, error: "Container or key missing" }));
      return;
    }
    setDiag((prev) => ({ ...prev, keyMode: mode, style: "M1SSION Neon 3D" }));
    fetch(`https://api.maptiler.com/tiles/v3/tiles.json?key=${key}`).then((r) => {
      setDiag((prev) => ({ ...prev, tiles: String(r.status) }));
    }).catch(() => {
      setDiag((prev) => ({ ...prev, tiles: "NET_ERR" }));
    });
    const style = JSON.parse(JSON.stringify(neonStyleTemplate));
    if (key && style.sources) {
      Object.keys(style.sources).forEach((sourceKey) => {
        const source = style.sources[sourceKey];
        if (source.url && source.url.includes("{key}")) {
          source.url = source.url.replace("{key}", key);
        }
        if (source.url && source.url.includes("YOUR_MAPTILER_API_KEY_HERE")) {
          source.url = source.url.replace("YOUR_MAPTILER_API_KEY_HERE", key);
        }
        if (source.tiles && Array.isArray(source.tiles)) {
          source.tiles = source.tiles.map(
            (tile) => tile.replace("{key}", key).replace("YOUR_MAPTILER_API_KEY_HERE", key)
          );
        }
      });
      if (style.glyphs) {
        style.glyphs = style.glyphs.replace("{key}", key).replace("YOUR_MAPTILER_API_KEY_HERE", key);
      }
      if (style.sprite) {
        style.sprite = style.sprite.replace("{key}", key).replace("YOUR_MAPTILER_API_KEY_HERE", key);
      }
    }
    let sanitized = false;
    if (Array.isArray(style.layers)) {
      style.layers = style.layers.map((layer) => {
        if (layer?.type === "fill-extrusion" && layer.paint) {
          if ("fill-extrusion-ambient-occlusion-intensity" in layer.paint) {
            delete layer.paint["fill-extrusion-ambient-occlusion-intensity"];
            sanitized = true;
          }
          if ("fill-extrusion-vertical-gradient" in layer.paint) {
            delete layer.paint["fill-extrusion-vertical-gradient"];
            sanitized = true;
          }
        }
        return layer;
      });
    }
    if (sanitized) {
      setDiag((prev) => ({ ...prev, style: "M1SSION Neon 3D (sanitized)" }));
    }
    try {
      const map = new maplibreGlExports.Map({
        container: containerRef.current,
        style,
        center: [lng, lat],
        zoom: z,
        pitch,
        bearing,
        hash: true,
        attributionControl: false
        // Hide MapLibre/MapTiler attribution
      });
      mapRef.current = map;
      map.on("error", (e) => {
        if (e?.error?.status === 403) {
          setDiag((prev) => ({
            ...prev,
            error: `403 Forbidden - Add hostname to MapTiler origins`
          }));
        }
      });
      map.on("load", () => {
        const buildId = "build-mkzjjbvb";
        const urlParams = new URLSearchParams(window.location.search);
        const isDebug = urlParams.has("debug");
        const uaOnly = urlParams.has("uaOnly");
        if (isDebug) {
          window.M1_MAP = map;
          window.supabase = supabase;
          window.__bypassSW = () => {
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.getRegistrations().then((regs) => {
                regs.forEach((reg) => reg.unregister());
              });
            }
          };
          window.__hideLayer = (id) => {
            if (map.getLayer(id)) {
              map.setLayoutProperty(id, "visibility", "none");
            } else {
            }
          };
          window.__onlyUserAreas = () => {
            const keep = /* @__PURE__ */ new Set(["user-areas-fill", "user-areas-border"]);
            const layers = map.getStyle()?.layers || [];
            let hidden = 0;
            layers.forEach((l) => {
              const isFillOrLine = l.type === "fill" || l.type === "line";
              if (isFillOrLine && !keep.has(l.id)) {
                try {
                  map.setLayoutProperty(l.id, "visibility", "none");
                  hidden++;
                } catch {
                }
              }
            });
            try {
              const ua = map.getSource("user-areas");
              if (ua && ua.setData) {
                ua.setData({ type: "FeatureCollection", features: [] });
              }
            } catch (e) {
            }
          };
          window.__whoDrawsHere = (lng2, lat2) => {
            const point = map.project([lng2, lat2]);
            const features = map.queryRenderedFeatures(point);
            const rows = (features || []).map((f) => ({
              layer: f.layer?.id || "unknown",
              source: f.source,
              sourceLayer: f.sourceLayer,
              type: f.geometry.type,
              properties: JSON.stringify(f.properties)
            }));
            return rows;
          };
          window.__inventoryLayers = () => {
            const layers = (map.getStyle()?.layers || []).map((l, i) => ({
              index: i,
              id: l.id,
              type: l.type,
              source: l.source,
              visible: (() => {
                try {
                  return (map.getLayoutProperty(l.id, "visibility") ?? "visible") !== "none";
                } catch {
                  return true;
                }
              })()
            }));
            return layers;
          };
          window.__bypassSW = async () => {
            try {
              const regs = await navigator.serviceWorker.getRegistrations();
              await Promise.all(regs.map((r) => r.unregister()));
              const keys = await caches.keys();
              await Promise.all(keys.map((k) => caches.delete(k)));
              location.reload();
            } catch (e) {
            }
          };
          window.__killOverlay = () => {
            const overlays = document.querySelectorAll('#map-space,[data-overlay="map-space"],.map-overlay-circle');
            overlays.forEach((el) => {
              el.remove();
            });
            if (overlays.length === 0) {
            }
          };
          setTimeout(() => {
            window.__inventoryLayers();
            try {
              const c = map.getCenter();
              const feats = map.queryRenderedFeatures(map.project(c));
            } catch (e) {
            }
          }, 1500);
          if (uaOnly) {
            setTimeout(() => {
              const keep = /* @__PURE__ */ new Set(["user-areas-fill", "user-areas-border"]);
              const layers = map.getStyle()?.layers || [];
              let hidden = 0;
              layers.forEach((l) => {
                const isFillOrLine = l.type === "fill" || l.type === "line";
                if (isFillOrLine && !keep.has(l.id)) {
                  try {
                    map.setLayoutProperty(l.id, "visibility", "none");
                    hidden++;
                  } catch {
                  }
                }
              });
              window.__killOverlay?.();
            }, 500);
          }
          setTimeout(() => {
            const layers = map.getStyle().layers || [];
            const areaLayers = layers.filter(
              (l) => l.id.includes("areas") || l.id.includes("search")
            );
          }, 1e3);
        }
        const loadedStyle = map.getStyle();
        const hasExtrusionLayer = loadedStyle?.layers?.some(
          (l) => l.type === "fill-extrusion"
        );
        if (!hasExtrusionLayer) {
          try {
            map.addLayer({
              id: "m1-buildings-extrusion",
              type: "fill-extrusion",
              source: "openmaptiles",
              "source-layer": "building",
              minzoom: 12,
              paint: {
                "fill-extrusion-color": "#6f78ff",
                "fill-extrusion-opacity": 0.92,
                "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["get", "height"], 15],
                "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0]
              }
            });
          } catch (e) {
          }
        }
        fetch(`https://api.maptiler.com/fonts/Noto%20Sans%20Regular/0-255.pbf?key=${key}`).then((r) => setDiag((prev) => ({ ...prev, glyph: String(r.status) }))).catch(() => setDiag((prev) => ({ ...prev, glyph: "NET_ERR" })));
        const tileCoords = getTileCoordinates(lng, lat, 15);
        fetch(`https://api.maptiler.com/tiles/v3/${tileCoords.z}/${tileCoords.x}/${tileCoords.y}.pbf?key=${key}`).then((r) => setDiag((prev) => ({ ...prev, pbf: String(r.status) }))).catch(() => setDiag((prev) => ({ ...prev, pbf: "NET_ERR" })));
        if (DEV_MOCKS) ;
      });
    } catch (error) {
      setDiag((prev) => ({ ...prev, error: `MapLibre creation failed` }));
      return;
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
  reactExports.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handleClick = (e) => {
      const { lng, lat } = e.lngLat;
      if (isAddingMarker) {
        handleMapClickMarker({ latLng: { lat: () => lat, lng: () => lng } });
      } else if (isAddingSearchArea) {
        handleMapClickArea({ latlng: { lat, lng } });
      }
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [isAddingMarker, isAddingSearchArea, handleMapClickMarker, handleMapClickArea]);
  const hasInitialCenteredRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;
    if (hasInitialCenteredRef.current) {
      return;
    }
    if (!map.loaded()) {
      map.once("load", () => {
        hasInitialCenteredRef.current = true;
        map.flyTo({
          center: [position.lng, position.lat],
          zoom: 15.5,
          pitch: 55,
          bearing: 25,
          essential: true,
          duration: 2e3
        });
      });
    } else {
      hasInitialCenteredRef.current = true;
      map.flyTo({
        center: [position.lng, position.lat],
        zoom: 15.5,
        pitch: 55,
        bearing: 25,
        essential: true,
        duration: 2e3
      });
    }
  }, [position]);
  const handleCenterLocation = () => {
    if (mapRef.current && position) {
      mapRef.current.flyTo({
        center: [position.lng, position.lat],
        zoom: 15.5,
        pitch: 55,
        bearing: 25,
        essential: true,
        duration: 1500
      });
    }
  };
  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [DEFAULT_LOCATION[1], DEFAULT_LOCATION[0]],
        zoom: 15.5,
        pitch: 55,
        bearing: 25,
        essential: true,
        duration: 1500
      });
    }
  };
  const handleResetBearing = () => {
    if (mapRef.current) {
      mapRef.current.easeTo({
        bearing: 0,
        pitch: 0,
        duration: 800
      });
    }
  };
  const handleFindMyLocation = () => {
    if (mapRef.current && position) {
      mapRef.current.flyTo({
        center: [position.lng, position.lat],
        zoom: 16,
        essential: true,
        duration: 1500
      });
    } else if (geoStatus === "idle") {
      enableGeo();
      ue.info("Attivazione geolocalizzazione...");
    } else {
      ue.info("Geolocalizzazione non disponibile");
    }
  };
  reactExports.useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;
    return;
  }, [
    DEV_MOCKS,
    DEV_VIEW_LOCK,
    effectiveAgents,
    effectiveRewardMarkers,
    filteredUserAreas,
    effectiveSearchAreas
  ]);
  const { profileImage } = useProfileImage();
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    deleteNotification,
    notificationsBannerOpen,
    closeNotificationsBanner
  } = useNotificationManager();
  const { battleFxMode } = usePerformanceSettings();
  const [battleUserId, setBattleUserId] = reactExports.useState(null);
  const [selectedAgent, setSelectedAgent] = reactExports.useState(null);
  const [showAgentCard, setShowAgentCard] = reactExports.useState(false);
  const [showBattleModal, setShowBattleModal] = reactExports.useState(false);
  const [preSelectedOpponent, setPreSelectedOpponent] = reactExports.useState();
  const [selectedAgentRank, setSelectedAgentRank] = reactExports.useState("Agent");
  const [activeBattleOnMap, setActiveBattleOnMap] = reactExports.useState(null);
  const [battleTimeLeft, setBattleTimeLeft] = reactExports.useState(0);
  const [showBattleResult, setShowBattleResult] = reactExports.useState(null);
  reactExports.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setBattleUserId(data.user?.id || null);
    });
  }, []);
  reactExports.useEffect(() => {
    if (!selectedAgent?.rank_id) {
      setSelectedAgentRank("Agent");
      return;
    }
    const fetchRank = async () => {
      try {
        const { data: rank } = await supabase.from("agent_ranks").select("code, name_en").eq("id", selectedAgent.rank_id).single();
        if (rank) {
          setSelectedAgentRank(rank.name_en || rank.code || "Agent");
        }
      } catch (err) {
        setSelectedAgentRank("Agent");
      }
    };
    fetchRank();
  }, [selectedAgent?.rank_id]);
  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
    setShowAgentCard(true);
  };
  const handleAttackAgent = () => {
    const opponent = {
      id: selectedAgent.id,
      name: selectedAgent.username || selectedAgent.agent_code || "Unknown Agent",
      lat: selectedAgent.lat,
      lng: selectedAgent.lng
    };
    if (!opponent.lat || !opponent.lng) ;
    setShowAgentCard(false);
    setPreSelectedOpponent(opponent);
    setShowBattleModal(true);
  };
  reactExports.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (showBattleModal) {
      map.keyboard?.disable();
      map.dragPan?.disable();
      map.dragRotate?.disable();
      map.scrollZoom?.disable();
      map.touchZoomRotate?.disable();
      map.doubleClickZoom?.disable();
    } else {
      map.keyboard?.enable();
      map.dragPan?.enable();
      map.dragRotate?.enable();
      map.scrollZoom?.enable();
      map.touchZoomRotate?.enable();
      map.doubleClickZoom?.enable();
    }
  }, [showBattleModal]);
  reactExports.useEffect(() => {
    const handleBattleStart = (event) => {
      const { defenderLat, defenderLng, defenderName, battleDuration } = event.detail;
      const attackerLat = position?.lat || 0;
      const attackerLng = position?.lng || 0;
      setActiveBattleOnMap({
        attackerLat,
        attackerLng,
        defenderLat,
        defenderLng,
        defenderName,
        duration: battleDuration,
        startTime: Date.now()
      });
      setBattleTimeLeft(battleDuration);
      setShowBattleModal(false);
    };
    window.addEventListener("battle-map-start", handleBattleStart);
    return () => {
      window.removeEventListener("battle-map-start", handleBattleStart);
    };
  }, [position]);
  reactExports.useEffect(() => {
    if (!activeBattleOnMap || battleTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setBattleTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const won = Math.random() > 0.35;
          setShowBattleResult({ won });
          window.dispatchEvent(new CustomEvent("battle-map-end", {
            detail: { won }
          }));
          setTimeout(() => {
            setActiveBattleOnMap(null);
            setShowBattleResult(null);
          }, 5e3);
          return 0;
        }
        return prev - 1;
      });
    }, 1e3);
    return () => clearInterval(timer);
  }, [activeBattleOnMap, battleTimeLeft]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(FinalShootProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        id: "mission-header-container",
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100vw",
          zIndex: 1e4,
          isolation: "isolate",
          transform: "translateZ(0)",
          willChange: "transform",
          display: "block",
          visibility: "visible",
          opacity: 1
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(UnifiedHeader, { profileImage })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: notificationsBannerOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 },
        style: {
          position: "fixed",
          top: "calc(env(safe-area-inset-top, 0px) + 140px)",
          left: 0,
          right: 0,
          zIndex: 2e4,
          paddingLeft: "8px",
          paddingRight: "8px"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          NotificationsBanner,
          {
            notifications,
            open: notificationsBannerOpen,
            unreadCount,
            onClose: closeNotificationsBanner,
            onMarkAllAsRead: markAllAsRead,
            onDeleteNotification: deleteNotification
          }
        )
      }
    ) }),
    isBlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      position: "fixed",
      top: "calc(env(safe-area-inset-top, 0px) + 64px)",
      left: 0,
      right: 0,
      zIndex: 9999,
      padding: "8px"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      GeolocationPermissionGuide,
      {
        isIOS,
        isPWA,
        onRetry: retryGeo
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: containerRef,
        id: "ml-sandbox",
        style: {
          position: "fixed",
          inset: 0,
          zIndex: 1
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FinalShootOverlay, { map: mapRef.current }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom, 34px) + 240px)",
          right: "16px",
          zIndex: 1e3,
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.button,
            {
              onClick: handleResetBearing,
              className: "pill-orb",
              whileHover: { scale: 1.03 },
              whileTap: { scale: 0.97 },
              title: "Reset bearing to north",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "w-5 h-5 text-cyan-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dot", style: { background: "#0ff", boxShadow: "0 0 8px #0ff" } })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.button,
            {
              onClick: handleFindMyLocation,
              className: "pill-orb",
              whileHover: { scale: 1.03 },
              whileTap: { scale: 0.97 },
              title: "Find my location",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "w-5 h-5 text-cyan-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dot", style: { background: "#0ff", boxShadow: "0 0 8px #0ff" } })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.button,
            {
              onClick: handleCenterLocation,
              className: "pill-orb",
              whileHover: { scale: 1.03 },
              whileTap: { scale: 0.97 },
              title: "Centra su posizione",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Crosshair, { className: "w-5 h-5 text-cyan-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dot", style: { background: "#0ff", boxShadow: "0 0 8px #0ff" } })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.button,
            {
              onClick: handleResetView,
              className: "pill-orb",
              whileHover: { scale: 1.03 },
              whileTap: { scale: 0.97 },
              title: "Reset vista",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-5 h-5 text-cyan-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dot", style: { background: "#0ff", boxShadow: "0 0 8px #0ff" } })
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AgentsLayer3D,
      {
        map: mapRef.current,
        enabled: layerVisibility.agents,
        agents: effectiveAgents,
        mePosition: position ? { lat: position.lat, lng: position.lng } : null,
        currentUserId: user?.id || null,
        onAgentClick: handleAgentClick
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PortalsLayer3D, { map: mapRef.current, enabled: layerVisibility.portals }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RewardsLayer3D,
      {
        map: mapRef.current,
        enabled: layerVisibility.rewards,
        markers: effectiveRewardMarkers,
        userPosition: position ? { lat: position.lat, lng: position.lng } : void 0,
        isAdmin: isUserAdmin
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AreasLayer3D,
      {
        map: mapRef.current,
        enabled: layerVisibility.areas,
        userAreas: filteredUserAreas,
        searchAreas: effectiveSearchAreas,
        onDeleteSearchArea: (id) => deleteSearchArea(id),
        currentAreaVersion
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RewardZoneLayer3D,
      {
        map: mapRef.current,
        rewardZone: rewardZoneArea,
        onDelete: () => setRewardZoneArea(null)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NotesLayer3D, { map: mapRef.current, enabled: layerVisibility.notes }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CountryDominationLayer3D,
      {
        map: mapRef.current,
        enabled: true,
        minZoom: 4
      }
    ),
    mapRef.current && /* @__PURE__ */ jsxRuntimeExports.jsx(
      BattleFxLayer,
      {
        map: mapRef.current,
        battleFxMode
      }
    ),
    mapRef.current && activeBattleOnMap && /* @__PURE__ */ jsxRuntimeExports.jsx(
      MapBattleOverlay,
      {
        map: mapRef.current,
        battle: activeBattleOnMap,
        timeLeft: battleTimeLeft,
        result: showBattleResult
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        id: "m1u-pill-map3d-slot",
        className: "fixed left-4 z-[1001] flex flex-col gap-3",
        style: {
          top: "calc(env(safe-area-inset-top, 0px) + 96px)",
          paddingLeft: "max(0px, env(safe-area-inset-left, 0px))",
          pointerEvents: "auto"
        },
        "aria-hidden": false,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(M1UPill, { showLabel: true, showPlusButton: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SearchLocationPill, { map: mapRef.current })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DevNotesPanel, { map: mapRef.current }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DevAreasPanel,
        {
          map: mapRef.current,
          searchAreas: effectiveSearchAreas,
          onDelete: (id) => deleteSearchArea(id),
          onFocus: (id) => setActiveSearchArea(id),
          onAddArea: handleAddAreaWithRadius,
          onCreateAreaDirect: createAreaDirect
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      LayerTogglePanel,
      {
        layers: layerVisibility,
        onToggle: toggleLayer,
        mapStyle,
        onMapStyleChange: handleMapStyleChange
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed right-4 z-[100]",
        style: {
          top: "calc(env(safe-area-inset-top, 0px) + 150px)",
          pointerEvents: "auto"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(RealtimePlayersPill, {})
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed z-[1001]",
        style: {
          left: "16px",
          bottom: "calc(env(safe-area-inset-bottom, 34px) + 450px)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(FinalShootPill, {})
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed z-[1001]",
        style: {
          left: "16px",
          bottom: "calc(env(safe-area-inset-bottom, 34px) + 380px)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(RewardCounterPill, {})
      }
    ),
    battleUserId && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed z-[1001]",
        style: {
          left: "16px",
          bottom: "calc(env(safe-area-inset-bottom, 34px) + 310px)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(BattleShopPill, { userId: battleUserId })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BattlePill, { userId: battleUserId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      M1ssionWarPill,
      {
        userId: battleUserId,
        className: "fixed bottom-[200px] right-4 z-[1000]"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MissionPill, {}),
    selectedAgent && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AgentBattleCard,
      {
        isOpen: showAgentCard,
        onClose: () => setShowAgentCard(false),
        agentCode: selectedAgent.agent_code || selectedAgent.username || "Unknown Agent",
        displayName: selectedAgent.username,
        rank: selectedAgentRank,
        isAttackable: true,
        status: "available",
        onAttack: handleAttackAgent
      }
    ),
    showBattleModal && battleUserId && /* @__PURE__ */ jsxRuntimeExports.jsx(
      BattleModal,
      {
        isOpen: showBattleModal,
        onClose: () => setShowBattleModal(false),
        userId: battleUserId,
        activeBattles: [],
        pendingChallenges: [],
        loading: false,
        preSelectedOpponent
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom, 34px) + 100px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1001
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          BuzzMapButtonSecure,
          {
            onBuzzPress: handleBuzz,
            mapCenter: mapCenter || DEFAULT_LOCATION,
            onAreaGenerated: handleAreaGenerated
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        id: "mission-bottom-nav-container",
        style: {
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100vw",
          zIndex: 1e4,
          isolation: "isolate",
          transform: "translateZ(0)",
          willChange: "transform",
          display: "block",
          visibility: "visible",
          opacity: 1
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNavigation, {})
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BuzzDebugBadge, { latestArea }),
    debugEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(MapVerificationPanel, {}),
    debugEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(DebugMapPanel, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BuzzDiagnosticPanel, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MapHUD, { mapContainerId: "ml-sandbox" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotivationalPopup, { pageType: "map" })
  ] });
}
function getTileCoordinates(lng, lat, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lng + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y, z: zoom };
}

export { MapTiler3D as default };
