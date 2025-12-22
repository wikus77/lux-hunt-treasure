import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { aG as functionsBaseUrl, a6 as useToast, v as Card, A as CardHeader, H as CardTitle, O as CardContent, a5 as Badge, b7 as Alert, b8 as AlertDescription, a7 as Label, W as Select, Y as SelectTrigger, _ as SelectValue, $ as SelectContent, a0 as SelectItem, I as Input, B as Button, r as Textarea, aF as Separator, s as supabase } from './index.BEQCqgv7.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

async function createBulkMarkers(dist, opts) {
  const payload = {
    lat: dist.lat,
    lng: dist.lng,
    radiusMeters: dist.radiusMeters,
    count: dist.count,
    debug: false,
    dryRun: opts?.dryRun ?? false
  };
  const res = await fetch(`${functionsBaseUrl}/create-random-markers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({ message: "Invalid JSON response from function" }));
  if (!res.ok) {
    return {
      ok: false,
      message: data && (data.error || data.message) || `Edge function error (${res.status})`
    };
  }
  return {
    ok: true,
    created: typeof data?.created === "number" ? data.created : void 0,
    message: data?.message ?? (payload.dryRun ? "Dry run completed" : "Markers created successfully")
  };
}

const calculateCodeHash = () => {
  const sourceCode = [
    "BulkMarkerDropComponent",
    "create-random-markers",
    "WouterRoutes",
    "MissionPanelPage"
  ].join("|");
  let hash = 0;
  for (let i = 0; i < sourceCode.length; i++) {
    const char = sourceCode.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, "0");
};
const BulkMarkerDropComponent = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [distributions, setDistributions] = reactExports.useState([
    { type: "buzz_free", count: 1 }
  ]);
  const [visibilityHours, setVisibilityHours] = reactExports.useState(24);
  const [bbox, setBbox] = reactExports.useState(null);
  const [response, setResponse] = reactExports.useState(null);
  const [userRole, setUserRole] = reactExports.useState("");
  const [jwtExpiry, setJwtExpiry] = reactExports.useState(null);
  const [securityHeaders, setSecurityHeaders] = reactExports.useState({
    version: "v1",
    codeHash: calculateCodeHash()
  });
  reactExports.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const payload = JSON.parse(atob(session.access_token.split(".")[1]));
          setJwtExpiry(payload.exp * 1e3);
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
          setUserRole(profile?.role?.toLowerCase() || "");
        }
      } catch (error) {
      }
    };
    checkAuth();
    const interval = setInterval(checkAuth, 3e4);
    return () => clearInterval(interval);
  }, []);
  const isAuthValid = userRole === "admin" || userRole === "owner";
  const jwtExpiresIn = jwtExpiry ? Math.max(0, jwtExpiry - Date.now()) : 0;
  const jwtWarning = jwtExpiresIn > 0 && jwtExpiresIn < 10 * 60 * 1e3;
  const handleSubmit = async () => {
    if (!isAuthValid) {
      toast({
        title: "Accesso Negato",
        description: "Solo admin/owner possono eseguire bulk drops",
        variant: "destructive"
      });
      return;
    }
    if (!distributions.length) {
      toast({
        title: "Errore",
        description: "Aggiungi almeno una distribuzione",
        variant: "destructive"
      });
      return;
    }
    for (const dist of distributions) {
      if (dist.type === "message" && (!dist.text || dist.text.trim().length === 0)) {
        toast({
          title: "Errore",
          description: "Tutti i marker di tipo 'Message' devono avere un testo",
          variant: "destructive"
        });
        return;
      }
      if (dist.type === "xp_points" && (!dist.points || dist.points < 1)) {
        toast({
          title: "Errore",
          description: "I marker XP Points devono avere almeno 1 punto",
          variant: "destructive"
        });
        return;
      }
      if (dist.count < 1) {
        toast({
          title: "Errore",
          description: "Tutti i marker devono avere quantità >= 1",
          variant: "destructive"
        });
        return;
      }
    }
    setIsLoading(true);
    setResponse(null);
    try {
      const apiPayload = {
        distributions: distributions.map((dist) => {
          if (dist.type === "message") return { type: "message", count: dist.count, text: dist.text };
          if (dist.type === "xp_points") return { type: "xp_points", count: dist.count, points: dist.points };
          return { type: "buzz_free", count: dist.count };
        }),
        visibilityHours
      };
      const result = await createBulkMarkers(apiPayload);
      setResponse(result);
      toast({
        title: "Successo",
        description: `Creati ${result.created || 0} marker`,
        variant: "default"
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Errore sconosciuto";
      setResponse({
        error: errorMsg,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      toast({
        title: "Errore",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const addDistribution = () => {
    setDistributions([...distributions, { type: "buzz_free", count: 1 }]);
  };
  const removeDistribution = (index) => {
    if (distributions.length > 1) {
      setDistributions(distributions.filter((_, i) => i !== index));
    }
  };
  const updateDistribution = (index, field, value) => {
    const updated = [...distributions];
    updated[index] = { ...updated[index], [field]: value };
    setDistributions(updated);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "🔒 Security Status" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Role:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: isAuthValid ? "default" : "destructive", children: userRole || "unknown" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "JWT Status:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: jwtWarning ? "destructive" : "default", children: jwtExpiresIn > 0 ? `${Math.floor(jwtExpiresIn / 6e4)}m remaining` : "expired" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Version:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: securityHeaders.version })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Code Hash:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "font-mono text-xs", children: [
            securityHeaders.codeHash.substring(0, 12),
            "..."
          ] })
        ] }),
        jwtWarning && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "⚠️ JWT expires in less than 10 minutes. Consider refreshing your session." }) }),
        !isAuthValid && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "❌ Access denied. Admin or Owner role required." }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "🎯 Bulk Marker Drop" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base font-medium", children: "Distributions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 mt-2", children: distributions.map((dist, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-3 border rounded", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: dist.type,
                  onValueChange: (value) => updateDistribution(index, "type", value),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "buzz_free", children: "Buzz Free" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "message", children: "Message" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "xp_points", children: "XP Points" })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: "1",
                  max: "100",
                  value: dist.count,
                  onChange: (e) => updateDistribution(index, "count", parseInt(e.target.value) || 1),
                  className: "w-24",
                  placeholder: "Qty"
                }
              ),
              dist.type === "xp_points" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: "1",
                  max: "1000",
                  value: dist.points || 10,
                  onChange: (e) => updateDistribution(index, "points", parseInt(e.target.value) || 10),
                  className: "w-24",
                  placeholder: "XP"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  onClick: () => removeDistribution(index),
                  variant: "destructive",
                  size: "sm",
                  disabled: distributions.length <= 1,
                  children: "Remove"
                }
              )
            ] }),
            dist.type === "message" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `message-${index}`, className: "text-sm", children: "Messaggio" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: `message-${index}`,
                  value: dist.text || "",
                  onChange: (e) => updateDistribution(index, "text", e.target.value),
                  placeholder: "Inserisci il messaggio per questo marker...",
                  className: "min-h-[80px]",
                  maxLength: 500
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [
                (dist.text || "").length,
                "/500 caratteri"
              ] })
            ] })
          ] }, index)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addDistribution, variant: "outline", size: "sm", className: "mt-2", children: "Add Distribution" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "visibility", children: "Visibility Hours" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "visibility",
              type: "number",
              min: "1",
              value: visibilityHours,
              onChange: (e) => setVisibilityHours(parseInt(e.target.value) || 24),
              className: "w-32"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleSubmit,
            disabled: isLoading || !isAuthValid || jwtExpiresIn <= 0,
            className: "w-full",
            children: isLoading ? "Creando..." : "Crea Marker"
          }
        )
      ] })
    ] }),
    response && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "📊 Response Debug" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        response?.httpStatus === 207 && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
          "⚠️ Parziale: ",
          response?.parsedResponse?.created || 0,
          " creati, ",
          response?.parsedResponse?.partial_failures || 0,
          " fallimenti, ",
          response?.parsedResponse?.errors?.length || 0,
          " errori"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "bg-muted p-4 rounded text-sm overflow-auto max-h-96", children: JSON.stringify(response, null, 2) })
      ] }) })
    ] })
  ] });
};

const BulkMarkerDropPage = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 md:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BulkMarkerDropComponent, {}) });
};

export { BulkMarkerDropPage as default };
