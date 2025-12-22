import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports, c as React } from './react-vendor.CAU3V3le.js';
import { u as useLocation, s as supabase, v as Card, A as CardHeader, H as CardTitle, aJ as Send, N as CardDescription, O as CardContent, B as Button, Z as Zap, aK as broadcastGlobalGlitch, e as ue, G as Gift, aL as Map, a7 as Label, P as Plus, W as Select, Y as SelectTrigger, _ as SelectValue, $ as SelectContent, a0 as SelectItem, I as Input, z as Trash2, a5 as Badge, o as TriangleAlert, aE as Switch, aG as functionsBaseUrl } from './index.BEQCqgv7.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

const REWARD_TYPES = [
  { value: "BUZZ_FREE", label: "Buzz Gratuiti", description: "Buzz che non costano nulla" },
  { value: "MESSAGE", label: "Messaggio", description: "Messaggio testuale personalizzato" },
  { value: "XP_POINTS", label: "Punti XP", description: "Punti esperienza per il giocatore" },
  { value: "EVENT_TICKET", label: "Ticket Evento", description: "Biglietto per evento speciale" },
  { value: "BADGE", label: "Badge", description: "Badge da assegnare al giocatore" }
];
const MissionPanelPage = () => {
  const [showBulkDrop, setShowBulkDrop] = reactExports.useState(false);
  const [, setLocation] = useLocation();
  const [distributions, setDistributions] = reactExports.useState([
    { type: "BUZZ_FREE", count: 0 }
  ]);
  const [showAdvanced, setShowAdvanced] = reactExports.useState(false);
  const [seed, setSeed] = reactExports.useState("");
  const [bbox, setBbox] = reactExports.useState({
    minLat: "",
    minLng: "",
    maxLat: "",
    maxLng: ""
  });
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [isAdmin, setIsAdmin] = reactExports.useState(false);
  const [httpStatus, setHttpStatus] = reactExports.useState(null);
  const [responseHeaders, setResponseHeaders] = reactExports.useState({});
  const [rawBody, setRawBody] = reactExports.useState("");
  const [parsedResponse, setParsedResponse] = reactExports.useState(null);
  const [requestId, setRequestId] = reactExports.useState(null);
  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        const adminStatus = !!profile && ["admin", "owner"].some((r) => profile.role?.toLowerCase?.().includes(r));
        setIsAdmin(adminStatus);
      }
    })();
  }, []);
  const addDistribution = () => {
    setDistributions([...distributions, { type: "BUZZ_FREE", count: 0 }]);
  };
  const removeDistribution = (index) => {
    setDistributions(distributions.filter((_, i) => i !== index));
  };
  const updateDistribution = (index, field, value) => {
    const updated = [...distributions];
    if (field === "payload") {
      updated[index] = { ...updated[index], payload: value };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setDistributions(updated);
  };
  const updatePayloadField = (index, key, value) => {
    const updated = [...distributions];
    updated[index] = {
      ...updated[index],
      payload: { ...updated[index].payload, [key]: value }
    };
    setDistributions(updated);
  };
  const validateDistributions = () => {
    const errors = [];
    const totalCount = distributions.reduce((sum, d) => sum + d.count, 0);
    if (totalCount <= 0) {
      errors.push("La somma totale dei marker deve essere > 0");
    }
    distributions.forEach((dist, index) => {
      if (dist.count < 0) {
        errors.push(`Count alla riga ${index + 1} deve essere ≥ 0`);
      }
      if (dist.type === "MESSAGE" && (!dist.payload?.text || dist.payload.text.trim() === "")) {
        errors.push(`Messaggio richiesto alla riga ${index + 1}`);
      }
      if (dist.type === "XP_POINTS" && (!dist.payload?.points || dist.payload.points <= 0)) {
        errors.push(`Punti XP richiesti (> 0) alla riga ${index + 1}`);
      }
      if (dist.type === "BADGE" && (!dist.payload?.badge_id || dist.payload.badge_id.trim() === "")) {
        errors.push(`Badge ID richiesto alla riga ${index + 1}`);
      }
      if (dist.type === "EVENT_TICKET" && dist.count > 1) {
        errors.push(`Warning: Event ticket count > 1 alla riga ${index + 1} (tipico = 1)`);
      }
    });
    return { valid: errors.length === 0, errors };
  };
  const createBulkMarkers = async () => {
    const validation = validateDistributions();
    if (!validation.valid) {
      validation.errors.forEach((error) => ue.error(error));
      return;
    }
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        ue.error("Nessuna sessione di autenticazione");
        return;
      }
      const request = {
        distributions,
        seed: seed.trim() || void 0
      };
      if (bbox.minLat && bbox.minLng && bbox.maxLat && bbox.maxLng) {
        request.bbox = {
          minLat: parseFloat(bbox.minLat),
          minLng: parseFloat(bbox.minLng),
          maxLat: parseFloat(bbox.maxLat),
          maxLng: parseFloat(bbox.maxLng)
        };
      }
      const response = await fetch(`${functionsBaseUrl}/create-random-markers?debug=1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk"
        },
        body: JSON.stringify(request)
      });
      const rawText = await response.text();
      setHttpStatus(response.status);
      setRawBody(rawText);
      const hdrs = {};
      ;
      ["content-type", "date", "x-edge-functions-region", "cf-ray", "server", "content-length"].forEach((k) => {
        const v = response.headers.get(k);
        if (v) hdrs[k] = v;
      });
      setResponseHeaders(hdrs);
      let data = null;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        ue.error(`Risposta non valida: ${response.status} ${response.statusText}`);
        return;
      }
      setParsedResponse(data);
      if (data?.request_id) setRequestId(data.request_id);
      if (!response.ok) {
        const errorMsg = data?.error || `HTTP ${response.status}`;
        const requestId2 = data?.request_id ? ` (${data.request_id})` : "";
        ue.error(`Errore Edge Function: ${errorMsg}${requestId2}`);
        return;
      }
      const totalCount = distributions.reduce((sum, d) => sum + d.count, 0);
      ue.success(`✅ ${data.created} marker creati con successo!`, {
        description: `Drop ID: ${data.drop_id}`,
        action: {
          label: "Vedi su Buzz Map",
          onClick: () => window.open("/map", "_blank")
        }
      });
      setDistributions([{ type: "BUZZ_FREE", count: 0 }]);
      setSeed("");
      setBbox({ minLat: "", minLng: "", maxLat: "", maxLng: "" });
      setShowBulkDrop(false);
    } catch (error) {
      ue.error(`Errore di rete: ${error instanceof Error ? error.message : "Sconosciuto"}`);
    } finally {
      setIsProcessing(false);
    }
  };
  const getTotalCount = () => distributions.reduce((sum, d) => sum + d.count, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto p-6 max-w-4xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink bg-clip-text text-transparent", children: "M1SSION PANEL" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2", children: "Strumenti amministrativi per la gestione dei marker sulla Buzz Map" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground p-2 bg-gray-900 rounded", children: [
          "Debug: isAdmin = ",
          isAdmin.toString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-purple-500/20 hover:border-purple-500/40 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-5 w-5 text-purple-400" }),
                "Admin Push Console"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Invio notifiche push broadcast a tutti gli utenti - Solo Amministratori" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => setLocation("/panel/push-admin"),
                variant: "outline",
                className: "w-full",
                children: "Apri Admin Console"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-blue-500/20 hover:border-blue-500/40 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-5 w-5 text-blue-400" }),
                "Push Console"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Invio notifiche push mirate a segmenti specifici o liste utenti" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => setLocation("/panel/push"),
                variant: "outline",
                className: "w-full",
                children: "Apri Push Console"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-purple-500/20 hover:border-purple-500/40 transition-colors bg-gradient-to-br from-purple-900/20 to-pink-900/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-purple-400" }),
                "⚡ GLITCH GLOBALE"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Attiva un effetto TV shutdown su TUTTI gli utenti con l'app aperta in tempo reale" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: () => {
                  broadcastGlobalGlitch();
                  ue.success("⚡ Glitch inviato a tutti gli utenti!");
                },
                className: "w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 mr-2" }),
                  "ATTIVA GLITCH GLOBALE"
                ]
              }
            ) })
          ] })
        ] })
      ] }),
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-emerald-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Markers Healthcheck" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Diagnostica Edge Function e readback DB (solo lettura)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setLocation("/dev/markers-healthcheck"), variant: "outline", children: "Apri" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-emerald-500/20 hover:border-emerald-500/40 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-5 w-5 text-emerald-400" }),
            "🎯 Marker Reward Manager"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Gestione completa marker reward: inserimento manuale con mappa, generazione bulk, M1U, Indizi, Premi Fisici" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => setLocation("/panel/marker-rewards"),
            className: "w-full bg-gradient-to-r from-emerald-500 to-cyan-500",
            children: "Apri Marker Manager"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-cyan-500/20 hover:border-cyan-500/40 transition-colors opacity-70", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "h-5 w-5 text-cyan-400" }),
            "Bulk Marker Drop (Legacy)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Genera marker casuali sulla Buzz Map (usa il nuovo Marker Manager per più opzioni)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => setShowBulkDrop(!showBulkDrop),
              variant: "outline",
              className: "w-full",
              children: showBulkDrop ? "Chiudi" : "Configura Distribuzione"
            }
          ),
          showBulkDrop && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-lg font-semibold", children: "Distribuzione Reward" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: addDistribution, size: "sm", variant: "outline", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
                  "Aggiungi"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: distributions.map((dist, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 items-start", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `type-${index}`, children: "Reward Type" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: dist.type,
                      onValueChange: (value) => updateDistribution(index, "type", value),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: REWARD_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: type.value, children: type.label }, type.value)) })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `count-${index}`, children: "Count" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: `count-${index}`,
                      type: "number",
                      min: "0",
                      value: dist.count,
                      onChange: (e) => updateDistribution(index, "count", parseInt(e.target.value) || 0)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payload" }),
                  dist.type === "MESSAGE" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      placeholder: "Testo messaggio",
                      value: dist.payload?.text || "",
                      onChange: (e) => updatePayloadField(index, "text", e.target.value)
                    }
                  ),
                  dist.type === "XP_POINTS" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "number",
                      placeholder: "Punti XP",
                      min: "1",
                      value: dist.payload?.points || "",
                      onChange: (e) => updatePayloadField(index, "points", parseInt(e.target.value) || 0)
                    }
                  ),
                  dist.type === "EVENT_TICKET" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      placeholder: "Event ID",
                      value: dist.payload?.event_id || "",
                      onChange: (e) => updatePayloadField(index, "event_id", e.target.value)
                    }
                  ),
                  dist.type === "BADGE" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      placeholder: "Badge ID",
                      value: dist.payload?.badge_id || "",
                      onChange: (e) => updatePayloadField(index, "badge_id", e.target.value)
                    }
                  ),
                  dist.type === "BUZZ_FREE" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "number",
                      placeholder: "Quantità (default: 1)",
                      min: "1",
                      value: dist.payload?.amount || 1,
                      onChange: (e) => updatePayloadField(index, "amount", parseInt(e.target.value) || 1)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: () => removeDistribution(index),
                    variant: "destructive",
                    size: "sm",
                    disabled: distributions.length <= 1,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                  }
                ) })
              ] }) }) }, index)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
                  "Totale: ",
                  getTotalCount(),
                  " marker"
                ] }),
                distributions.some((d) => d.type === "EVENT_TICKET" && d.count > 1) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-amber-500", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Event ticket con count maggiore di 1 rilevato" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    id: "advanced",
                    checked: showAdvanced,
                    onCheckedChange: setShowAdvanced
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "advanced", children: "Opzioni Avanzate" })
              ] }),
              showAdvanced && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4 p-4 border border-gray-700 rounded-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "seed", children: "Seed (Generazione Deterministica)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "seed",
                      placeholder: "es. M1SSION-2025-01",
                      value: seed,
                      onChange: (e) => setSeed(e.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bounding Box (opzionale - default: mondo intero)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2 mt-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        placeholder: "Min Lat",
                        type: "number",
                        step: "0.000001",
                        value: bbox.minLat,
                        onChange: (e) => setBbox({ ...bbox, minLat: e.target.value })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        placeholder: "Min Lng",
                        type: "number",
                        step: "0.000001",
                        value: bbox.minLng,
                        onChange: (e) => setBbox({ ...bbox, minLng: e.target.value })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        placeholder: "Max Lat",
                        type: "number",
                        step: "0.000001",
                        value: bbox.maxLat,
                        onChange: (e) => setBbox({ ...bbox, maxLat: e.target.value })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        placeholder: "Max Lng",
                        type: "number",
                        step: "0.000001",
                        value: bbox.maxLng,
                        onChange: (e) => setBbox({ ...bbox, maxLng: e.target.value })
                      }
                    )
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: createBulkMarkers,
                disabled: isProcessing || getTotalCount() <= 0,
                className: "w-full bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink hover:opacity-90",
                children: isProcessing ? "Creazione in corso..." : "Lancia Marker"
              }
            ) })
          ] })
        ] })
      ] })
    ] })
  ] });
};

export { MissionPanelPage, MissionPanelPage as default };
