import { j as jsxRuntimeExports } from './ui-vendor.DoN6OTIp.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { a as useToast, D as Database, B as Badge, C as Card, b as CardHeader, c as CardTitle, U as User, d as CardContent, L as Label, e as Clock, P as Play, S as Switch, I as Input, f as Button, R as RefreshCw, g as Separator, h as CircleAlert, T as Textarea, s as supabase, i as functionsBaseUrl } from './index.B1pZJRDR.js';
import './three-vendor.wwSanNQ8.js';
import './supabase-vendor.CghLtY7N.js';
import './animation-vendor.Bezovbgp.js';
import './map-vendor.Dz2XYzxS.js';
import './stripe-vendor.BaJG9Xy1.js';
import './router-vendor.opNAzTki.js';

function MarkersHealthcheck() {
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [debugMode, setDebugMode] = reactExports.useState(false);
  const [count, setCount] = reactExports.useState(50);
  const [distribution, setDistribution] = reactExports.useState({
    BUZZ_FREE: 30,
    MESSAGE: 10,
    XP_POINTS: 8,
    EVENT_TICKET: 2,
    BADGE: 0
  });
  const [visibleFrom, setVisibleFrom] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 16));
  const [visibleTo, setVisibleTo] = reactExports.useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString().slice(0, 16));
  const [lastResult, setLastResult] = reactExports.useState(null);
  const [responseStatus, setResponseStatus] = reactExports.useState(null);
  const [responseHeaders, setResponseHeaders] = reactExports.useState({});
  const [rawResponse, setRawResponse] = reactExports.useState("");
  const [dbStats, setDbStats] = reactExports.useState(null);
  const [isRefreshingStats, setIsRefreshingStats] = reactExports.useState(false);
  const [userDiag, setUserDiag] = reactExports.useState(null);
  const { toast } = useToast();
  const loadUserDiagnostics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUserDiag({ role: null, email: null, jwt_exp: null, jwt_exp_warning: false });
        return;
      }
      let jwt_exp = null;
      let jwt_exp_warning = false;
      try {
        const payload = JSON.parse(atob(session.access_token.split(".")[1]));
        jwt_exp = payload.exp;
        const now = Date.now() / 1e3;
        jwt_exp_warning = jwt_exp - now < 600;
      } catch (e) {
        console.warn("Failed to decode JWT:", e);
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
      setUserDiag({
        role: profile?.role || null,
        email: session.user.email || null,
        jwt_exp,
        jwt_exp_warning
      });
    } catch (error) {
      console.error("Error loading user diagnostics:", error);
      setUserDiag({ role: null, email: null, jwt_exp: null, jwt_exp_warning: false });
    }
  };
  const loadDbStats = async () => {
    setIsRefreshingStats(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Errore",
          description: "Nessuna sessione di autenticazione",
          variant: "destructive"
        });
        return;
      }
      const headers = {
        "Authorization": `Bearer ${session.access_token}`,
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk"
      };
      const { count: totalCount } = await supabase.from("markers").select("*", { count: "exact", head: true });
      const { data: recentMarkers } = await supabase.from("markers").select("id, title, created_at, lat, lng").order("created_at", { ascending: false }).limit(10);
      const { data: lastInsert } = await supabase.from("markers").select("created_at").order("created_at", { ascending: false }).limit(1).maybeSingle();
      setDbStats({
        total_markers: totalCount || 0,
        last_insert_time: lastInsert?.created_at || null,
        recent_markers: recentMarkers || []
      });
    } catch (error) {
      console.error("Error loading DB stats:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le statistiche del database",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingStats(false);
    }
  };
  reactExports.useEffect(() => {
    loadUserDiagnostics();
    loadDbStats();
  }, []);
  const handleRunTest = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Nessuna sessione di autenticazione");
      }
      const distributions = Object.entries(distribution).filter(([_, ctn]) => ctn > 0).map(([type, ctn]) => ({
        type,
        count: ctn
      }));
      const payload = {
        distributions,
        bbox: {
          minLat: 45,
          minLng: 9,
          maxLat: 45.5,
          maxLng: 9.5
        },
        visibilityPreset: "custom",
        seed: `TEST-${Date.now()}`
      };
      if (visibleFrom) payload.visible_from = new Date(visibleFrom).toISOString();
      if (visibleTo) payload.visible_to = new Date(visibleTo).toISOString();
      console.log("🚀 Calling create-random-markers with payload:", payload);
      const url = debugMode ? `${functionsBaseUrl}/create-random-markers?debug=1` : `${functionsBaseUrl}/create-random-markers`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk"
        },
        body: JSON.stringify(payload)
      });
      const rawText = await response.text();
      setRawResponse(rawText);
      setResponseStatus(response.status);
      const headersObj = {};
      ["content-type", "date", "x-edge-functions-region", "cf-ray", "server", "content-length"].forEach((k) => {
        const v = response.headers.get(k);
        if (v) headersObj[k] = v;
      });
      setResponseHeaders(headersObj);
      let parsed = null;
      try {
        parsed = JSON.parse(rawText);
      } catch {
      }
      setLastResult(parsed);
      if (response.status === 200) {
        toast({ title: "Successo", description: `${parsed?.created ?? 0} marker creati` });
      } else if (response.status === 207) {
        toast({ title: "Parziale", description: `${parsed?.created ?? 0} creati, ${parsed?.partial_failures ?? 0} falliti` });
      } else {
        toast({ title: "Errore", description: parsed?.error || "Chiamata fallita", variant: "destructive" });
      }
      setTimeout(loadDbStats, 1e3);
    } catch (error) {
      console.error("Test error:", error);
      setResponseStatus(null);
      setResponseHeaders({});
      setRawResponse("");
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore di rete",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const totalDistribution = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-6 w-6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Markers System Healthcheck" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "DEV" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5" }),
          "User Diagnostics"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-3", children: userDiag ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-mono", children: userDiag.email || "N/A" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: ["admin", "owner"].includes(userDiag.role?.toLowerCase() || "") ? "default" : "secondary", children: userDiag.role || "N/A" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium flex items-center gap-2", children: [
              "JWT Expiry",
              userDiag.jwt_exp_warning && /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-amber-500" })
            ] }),
            userDiag.jwt_exp ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-sm ${userDiag.jwt_exp_warning ? "text-amber-500" : ""}`, children: [
              new Date(userDiag.jwt_exp * 1e3).toLocaleString(),
              userDiag.jwt_exp_warning && " (< 10min)"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "N/A" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Admin/Owner richiesto per Edge Function" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Caricamento diagnostica utente..." }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-5 w-5" }),
          "Test Configuration"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                id: "debug-mode",
                checked: debugMode,
                onCheckedChange: setDebugMode
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "debug-mode", children: "Debug Mode (dettagli errori)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "count", children: "Numero totale marker (informativo)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "count",
                type: "number",
                value: count,
                onChange: (e) => setCount(parseInt(e.target.value) || 0),
                min: "1",
                max: "5000"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Distribuzione ricompense (totale: ",
              totalDistribution,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 mt-2", children: Object.entries(distribution).map(([type, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: type, className: "text-xs", children: type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: type,
                  type: "number",
                  value,
                  onChange: (e) => setDistribution((prev) => ({
                    ...prev,
                    [type]: parseInt(e.target.value) || 0
                  })),
                  min: "0",
                  max: "1000"
                }
              )
            ] }, type)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "visible_from", children: "Visibile da" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "visible_from",
                  type: "datetime-local",
                  value: visibleFrom,
                  onChange: (e) => setVisibleFrom(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "visible_to", children: "Visibile fino a" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "visible_to",
                  type: "datetime-local",
                  value: visibleTo,
                  onChange: (e) => setVisibleTo(e.target.value)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleRunTest,
              disabled: isLoading || totalDistribution === 0,
              className: "w-full",
              children: isLoading ? "Esecuzione..." : "Esegui Test"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-5 w-5" }),
            "Database Statistics"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: loadDbStats,
              disabled: isRefreshingStats,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${isRefreshingStats ? "animate-spin" : ""}` })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: dbStats ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Marker totali" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: dbStats.total_markers })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Ultimo inserimento" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: dbStats.last_insert_time ? new Date(dbStats.last_insert_time).toLocaleString() : "Mai" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Ultimi 10 marker" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-2 max-h-60 overflow-y-auto", children: dbStats.recent_markers.length > 0 ? dbStats.recent_markers.map((marker) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs p-2 bg-muted rounded", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
                  marker.id.slice(0, 8),
                  "..."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: "MARKER" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: marker.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: new Date(marker.created_at).toLocaleString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
                  marker.lat.toFixed(4),
                  ", ",
                  marker.lng.toFixed(4)
                ] })
              ] })
            ] }, marker.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Nessun marker trovato" }) })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Caricamento statistiche..." }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5" }),
        "Esito ultima chiamata Edge Function"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "HTTP Status:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: responseStatus === 200 ? "default" : responseStatus === 207 ? "secondary" : "destructive", children: responseStatus ?? "—" })
        ] }),
        Object.keys(responseHeaders).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Headers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: JSON.stringify(responseHeaders, null, 2),
              readOnly: true,
              className: "mt-1 text-xs font-mono",
              rows: 5
            }
          )
        ] }),
        rawResponse && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Body (raw)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: rawResponse,
              readOnly: true,
              className: "mt-1 text-xs font-mono",
              rows: 8
            }
          )
        ] })
      ] })
    ] }),
    lastResult && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5" }),
        "Ultimo Risultato Test (parsed)"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Marker creati" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold", children: lastResult.created })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Drop ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-mono", children: lastResult.drop_id })
          ] })
        ] }),
        lastResult.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium text-destructive", children: "Errore" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: lastResult.error }),
          lastResult.details && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: lastResult.details })
        ] }),
        typeof lastResult.partial_failures === "number" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium text-amber-600", children: "Fallimenti parziali" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
            lastResult.partial_failures,
            " inserimenti falliti"
          ] })
        ] }),
        debugMode && lastResult.errors && lastResult.errors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Dettagli errori (DEBUG)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: JSON.stringify(lastResult.errors, null, 2),
              readOnly: true,
              className: "mt-1 text-xs font-mono",
              rows: 6
            }
          )
        ] })
      ] }) })
    ] })
  ] });
}

export { MarkersHealthcheck as default };
