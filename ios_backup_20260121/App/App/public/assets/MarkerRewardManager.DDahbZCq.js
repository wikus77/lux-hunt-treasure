const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/SimpleClickMap.CjJVIDIO.js","assets/index.C8SyQ7Ep.js","assets/ui-vendor.sKtoNQj2.js","assets/react-vendor.FGvtrp7q.js","assets/supabase-vendor.DVELIqeo.js","assets/animation-vendor.BT4oAzOt.js","assets/stripe-vendor.C-6aXM1t.js","assets/map-vendor.DftgD3cK.js","assets/router-vendor.Bb8w37VQ.js","assets/index.r3jusNWK.css"])))=>i.map(i=>d[i]);
import { s as supabase, bQ as Alert, bR as AlertDescription, B as Button, $ as RefreshCw, W as Card, ac as CardHeader, ae as CardTitle, M as MapPin, ah as CardDescription, ai as CardContent, a1 as LoaderCircle, aw as Label, K as Input, r as Target, a6 as Tabs, a7 as TabsList, a8 as TabsTrigger, a9 as TabsContent, al as Select, am as SelectTrigger, an as SelectValue, ao as SelectContent, ay as Coins, a0 as Search, G as Gift, Z as Zap, aC as Trophy, ch as MessageSquare, ap as SelectItem, N as Textarea, ba as Switch, a5 as Trash2, _ as __vitePreload, m as ue, ci as logAuditEvent } from './index.C8SyQ7Ep.js';
import { j as jsxRuntimeExports } from './ui-vendor.sKtoNQj2.js';
import { r as reactExports } from './react-vendor.FGvtrp7q.js';

const SimpleClickMap = reactExports.lazy(() => __vitePreload(() => import('./SimpleClickMap.CjJVIDIO.js'),true?__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]):void 0));
const REWARD_TYPES = [
  { value: "M1U", label: "M1U Credits", icon: Coins, color: "#FFD700" },
  { value: "CLUE", label: "Indizio", icon: Search, color: "#00D1FF" },
  { value: "PHYSICAL_PRIZE", label: "Premio Fisico", icon: Gift, color: "#FF1493" },
  { value: "BUZZ_FREE", label: "Buzz Gratuiti", icon: Zap, color: "#10B981" },
  { value: "XP_POINTS", label: "Punti XP", icon: Trophy, color: "#F59E0B" },
  { value: "MESSAGE", label: "Messaggio", icon: MessageSquare, color: "#8B5CF6" }
];
const PHYSICAL_PRIZES = [
  "iPhone",
  "AirPods",
  "GoPro",
  "USB Key",
  "T-Shirt",
  "Hat",
  "PC",
  "Apple Watch",
  "M1 Kit",
  "iPad",
  "Powerbank",
  "Smart Speaker",
  "Tech Backpack",
  "Mousepad",
  "Stickers",
  "NFC/QR Keychain"
];
const MarkerRewardManager = () => {
  const [isAdmin, setIsAdmin] = reactExports.useState(false);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [activeTab, setActiveTab] = reactExports.useState("manual");
  const [selectedRewardType, setSelectedRewardType] = reactExports.useState("M1U");
  const [markerTitle, setMarkerTitle] = reactExports.useState("");
  const [m1uAmount, setM1uAmount] = reactExports.useState(50);
  const [clueText, setClueText] = reactExports.useState("");
  const [physicalPrize, setPhysicalPrize] = reactExports.useState("iPhone");
  const [buzzCount, setBuzzCount] = reactExports.useState(1);
  const [xpPoints, setXpPoints] = reactExports.useState(10);
  const [messageText, setMessageText] = reactExports.useState("");
  const [visibilityHours, setVisibilityHours] = reactExports.useState(24);
  const [minZoom, setMinZoom] = reactExports.useState(17);
  const [lat, setLat] = reactExports.useState("41.9028");
  const [lng, setLng] = reactExports.useState("12.4964");
  const [bulkCount, setBulkCount] = reactExports.useState(25);
  const [bulkRewardType, setBulkRewardType] = reactExports.useState("M1U");
  const [bulkM1uAmount, setBulkM1uAmount] = reactExports.useState(50);
  const [bulkMinZoom, setBulkMinZoom] = reactExports.useState(17);
  const [existingMarkers, setExistingMarkers] = reactExports.useState([]);
  const [showExisting, setShowExisting] = reactExports.useState(true);
  const handleLocationSelect = reactExports.useCallback((newLat, newLng) => {
    setLat(newLat.toFixed(6));
    setLng(newLng.toFixed(6));
  }, []);
  reactExports.useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        setIsAdmin(!!profile && ["admin", "owner"].some(
          (r) => profile.role?.toLowerCase?.().includes(r)
        ));
      }
    };
    checkAdmin();
  }, []);
  const loadMarkers = reactExports.useCallback(async () => {
    try {
      const { data: markersData, error: markersError } = await supabase.from("markers").select("id, lat, lng, title, active, created_at, visible_from, visible_to").order("created_at", { ascending: false }).limit(200);
      if (markersError) {
        return;
      }
      if (!markersData || markersData.length === 0) {
        setExistingMarkers([]);
        return;
      }
      const markerIds = markersData.map((m) => m.id);
      const { data: rewardsData, error: rewardsError } = await supabase.from("marker_rewards").select("marker_id, reward_type, payload").in("marker_id", markerIds);
      if (rewardsError) {
      }
      const markers = markersData.map((m) => ({
        ...m,
        rewards: (rewardsData || []).filter((r) => r.marker_id === m.id).map((r) => ({ reward_type: r.reward_type, payload: r.payload }))
      }));
      setExistingMarkers(markers);
    } catch (error) {
    }
  }, []);
  reactExports.useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);
  const buildPayload = () => {
    switch (selectedRewardType) {
      case "M1U":
        return { amount: Math.min(1e3, Math.max(10, m1uAmount)) };
      case "CLUE":
        return { text: clueText, clue_type: "location" };
      case "PHYSICAL_PRIZE":
        return { prize_name: physicalPrize, description: `Premio: ${physicalPrize}` };
      case "BUZZ_FREE":
        return { buzzCount };
      case "XP_POINTS":
        return { xp: xpPoints };
      case "MESSAGE":
        return { text: messageText };
      default:
        return {};
    }
  };
  const handleCreateMarker = async () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      ue.error("Inserisci coordinate valide");
      return;
    }
    setIsLoading(true);
    try {
      const now = /* @__PURE__ */ new Date();
      const visibleTo = new Date(now.getTime() + visibilityHours * 60 * 60 * 1e3);
      const { data: marker, error: markerError } = await supabase.from("markers").insert({
        lat: latNum,
        lng: lngNum,
        title: markerTitle || "Reward Marker",
        active: true,
        visible_from: now.toISOString(),
        visible_to: visibleTo.toISOString()
      }).select().single();
      if (markerError) {
        throw markerError;
      }
      const payloadWithZoom = {
        ...buildPayload(),
        min_zoom: minZoom
      };
      const { error: rewardError } = await supabase.from("marker_rewards").insert({
        marker_id: marker.id,
        reward_type: selectedRewardType.toLowerCase(),
        // 🔥 IMPORTANTE: minuscolo per Edge Function
        payload: payloadWithZoom,
        description: `${REWARD_TYPES.find((r) => r.value === selectedRewardType)?.label} reward`
      });
      if (rewardError) {
        throw rewardError;
      }
      await logAuditEvent({
        event_type: "MARKER_CREATED",
        severity: "warning",
        details: {
          marker_id: marker.id,
          reward_type: selectedRewardType,
          lat: latNum.toFixed(4),
          lng: lngNum.toFixed(4)
        }
      });
      ue.success("✅ Marker creato!");
      setMarkerTitle("");
      setTimeout(() => {
        loadMarkers();
      }, 500);
    } catch (error) {
      ue.error(`Errore: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const [deletingIds, setDeletingIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const handleDeleteMarker = async (markerId) => {
    if (!confirm(`Eliminare marker ${markerId.slice(0, 8)}...?`)) return;
    setDeletingIds((prev) => /* @__PURE__ */ new Set([...prev, markerId]));
    try {
      const { data, error } = await supabase.functions.invoke("admin-delete-marker", {
        body: { marker_id: markerId }
      });
      if (data?.logs) {
        data.logs.forEach((log) => void 0);
      }
      if (error) {
        ue.error(`Errore chiamata: ${error.message}`);
        setDeletingIds((prev) => {
          const n = new Set(prev);
          n.delete(markerId);
          return n;
        });
        return;
      }
      if (!data?.success) {
        ue.error(`Errore: ${data?.error || "Eliminazione fallita"}`);
        setDeletingIds((prev) => {
          const n = new Set(prev);
          n.delete(markerId);
          return n;
        });
        return;
      }
      await logAuditEvent({
        event_type: "MARKER_DELETED",
        severity: "warning",
        details: { marker_id: markerId }
      });
      ue.success("✅ Eliminato! Ricarico lista...");
      setDeletingIds((prev) => {
        const n = new Set(prev);
        n.delete(markerId);
        return n;
      });
      setTimeout(() => {
        loadMarkers();
      }, 500);
    } catch (err) {
      ue.error(`Errore: ${err.message}`);
      setDeletingIds((prev) => {
        const n = new Set(prev);
        n.delete(markerId);
        return n;
      });
    }
  };
  const handleBulkCreate = async () => {
    setIsLoading(true);
    try {
      const hashInput = `${Date.now()}-${Math.random().toString(36)}`;
      const encoder = new TextEncoder();
      const data_bytes = encoder.encode(hashInput);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data_bytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const codeHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      const { data, error } = await supabase.functions.invoke("create-random-markers", {
        body: {
          distributions: [{
            type: bulkRewardType,
            count: bulkCount,
            payload: bulkRewardType === "M1U" ? { amount: bulkM1uAmount, min_zoom: bulkMinZoom } : { min_zoom: bulkMinZoom }
          }],
          // WORLDWIDE bbox - markers sparsi in tutto il mondo
          bbox: {
            minLat: -60,
            // Esclude Antartide
            maxLat: 70,
            // Esclude zone artiche estreme
            minLng: -180,
            maxLng: 180
          }
        },
        headers: {
          "X-M1-Dropper-Version": "v1",
          "X-M1-Code-Hash": codeHash
        }
      });
      if (error) throw error;
      if (data?.partial_failures) {
        ue.warning(`⚠️ ${data.created} marker creati, ${data.partial_failures} falliti`);
      } else {
        ue.success(`✅ ${data?.created || bulkCount} marker creati!`);
      }
      loadMarkers();
    } catch (error) {
      ue.error(`Errore: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  if (!isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "❌ Solo admin/owner possono accedere." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent", children: "🎯 Marker Reward Manager" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Gestione marker reward" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: loadMarkers, variant: "outline", size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
        "Aggiorna"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:row-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-5 w-5 text-cyan-400" }),
            "Mappa"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Clicca per selezionare posizione" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-[280px] rounded-lg overflow-hidden border border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center bg-slate-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-cyan-400" }) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SimpleClickMap,
            {
              initialLat: parseFloat(lat) || 41.9028,
              initialLng: parseFloat(lng) || 12.4964,
              onLocationSelect: handleLocationSelect,
              existingMarkers: showExisting ? existingMarkers.map((m) => ({
                id: m.id,
                lat: m.lat,
                lng: m.lng,
                title: m.title,
                reward_type: m.rewards?.[0]?.reward_type
              })) : []
            }
          ) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Latitudine" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: lat,
                  onChange: (e) => setLat(e.target.value),
                  placeholder: "41.9028"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Longitudine" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: lng,
                  onChange: (e) => setLng(e.target.value),
                  placeholder: "12.4964"
                }
              )
            ] })
          ] }),
          lat && lng && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-3 w-3 inline mr-1" }),
            lat,
            ", ",
            lng
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Configurazione" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "manual", children: "📍 Manuale" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "bulk", children: "🎲 Bulk" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "manual", className: "space-y-3 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Titolo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: markerTitle, onChange: (e) => setMarkerTitle(e.target.value), placeholder: "Premio Roma" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo Premio" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedRewardType, onValueChange: setSelectedRewardType, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: REWARD_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: t.value, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: "h-4 w-4 inline mr-2", style: { color: t.color } }),
                  t.label
                ] }, t.value)) })
              ] })
            ] }),
            selectedRewardType === "M1U" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "M1U (10-1000)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 10, max: 1e3, value: m1uAmount, onChange: (e) => setM1uAmount(+e.target.value || 50) })
            ] }),
            selectedRewardType === "CLUE" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Indizio" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: clueText, onChange: (e) => setClueText(e.target.value), placeholder: "Il tesoro...", rows: 2 })
            ] }),
            selectedRewardType === "PHYSICAL_PRIZE" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Premio" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: physicalPrize, onValueChange: setPhysicalPrize, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PHYSICAL_PRIZES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
              ] })
            ] }),
            selectedRewardType === "BUZZ_FREE" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buzz" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 10, value: buzzCount, onChange: (e) => setBuzzCount(+e.target.value || 1) })
            ] }),
            selectedRewardType === "XP_POINTS" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "XP" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 1e3, value: xpPoints, onChange: (e) => setXpPoints(+e.target.value || 10) })
            ] }),
            selectedRewardType === "MESSAGE" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Messaggio" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: messageText, onChange: (e) => setMessageText(e.target.value), rows: 2 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Visibilità (ore)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 168, value: visibilityHours, onChange: (e) => setVisibilityHours(+e.target.value || 24) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Zoom Visibilità (10-20)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: 10,
                    max: 20,
                    value: minZoom,
                    onChange: (e) => setMinZoom(Math.min(20, Math.max(10, +e.target.value || 17)))
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: minZoom <= 12 ? "🔭 Molto visibile" : minZoom <= 15 ? "👁️ Visibile" : minZoom <= 17 ? "🔍 Vicino" : "🎯 Molto vicino" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Zoom basso = più visibile da lontano | Zoom alto = devi avvicinarti" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleCreateMarker, disabled: isLoading, className: "w-full bg-gradient-to-r from-cyan-500 to-pink-500", children: isLoading ? "Creazione..." : "✨ Crea Marker" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "bulk", className: "space-y-3 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantità (1-100)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 100, value: bulkCount, onChange: (e) => setBulkCount(+e.target.value || 25) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: bulkRewardType, onValueChange: setBulkRewardType, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: REWARD_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
              ] })
            ] }),
            bulkRewardType === "M1U" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "M1U per marker" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 10, max: 1e3, value: bulkM1uAmount, onChange: (e) => setBulkM1uAmount(+e.target.value || 50) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Zoom Visibilità (10-20)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: 10,
                    max: 20,
                    value: bulkMinZoom,
                    onChange: (e) => setBulkMinZoom(Math.min(20, Math.max(10, +e.target.value || 17)))
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: bulkMinZoom <= 12 ? "🔭 Molto visibile" : bulkMinZoom <= 15 ? "👁️ Visibile" : bulkMinZoom <= 17 ? "🔍 Vicino" : "🎯 Molto vicino" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Zoom basso = più visibile da lontano | Zoom alto = devi avvicinarti" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleBulkCreate, disabled: isLoading, className: "w-full bg-gradient-to-r from-purple-500 to-pink-500", children: isLoading ? "Generazione..." : `🎲 Genera ${bulkCount} Marker` })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Marker (",
            existingMarkers.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: showExisting, onCheckedChange: setShowExisting })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[250px] overflow-y-auto space-y-2", children: existingMarkers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-4", children: "Nessun marker" }) : existingMarkers.slice(0, 20).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center justify-between p-2 bg-muted/30 rounded border border-border/50 ${deletingIds.has(m.id) ? "opacity-50" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-2 h-2 rounded-full ${m.active ? "bg-green-500" : "bg-gray-500"}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: m.title })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: m.rewards?.map((r) => r.reward_type).join(", ") || "No rewards" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => handleDeleteMarker(m.id),
              disabled: deletingIds.has(m.id),
              className: "text-red-400 hover:bg-red-500/10",
              children: deletingIds.has(m.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
            }
          )
        ] }, m.id)) }) })
      ] })
    ] })
  ] });
};

export { MarkerRewardManager as M };
