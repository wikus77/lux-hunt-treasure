import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { v as Card, A as CardHeader, H as CardTitle, a5 as Badge, O as CardContent, b7 as Alert, b8 as AlertDescription, B as Button, e as ue } from './index.BEQCqgv7.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

const M1ssionDebugTest = () => {
  const [isTestingRaw, setIsTestingRaw] = reactExports.useState(false);
  const [debugResult, setDebugResult] = reactExports.useState(null);
  const testRawAPI = async () => {
    setIsTestingRaw(true);
    setDebugResult(null);
    try {
      const directPayload = {
        app_id: "50cb75f7-f065-4626-9a63-ce5692fa7e70",
        included_segments: ["Subscribed Users"],
        contents: { "en": "🧪 DIRECT M1SSION™ API TEST" },
        headings: { "en": "Test Diretto OneSignal" }
      };
      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic os_v2_app_kdfxl57qmvdcngtdzzljf6t6od5lu3aqsvfuepv3ssgtn2suiajfh72u3cdgn57kni5akugzkqb5ufocgblyjt7q4vi5yy6fdxr7fna`,
          "Accept": "application/json"
        },
        body: JSON.stringify(directPayload)
      });
      const result = await response.json();
      setDebugResult({
        success: response.ok,
        status: response.status,
        result,
        method: "DIRECT_API_CALL",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (response.ok) {
        ue.success("✅ Direct OneSignal API Success!", {
          description: `Notification ID: ${result.id}`
        });
      } else {
        ue.error("❌ Direct OneSignal API Failed", {
          description: `Status: ${response.status}`
        });
      }
    } catch (error) {
      setDebugResult({
        success: false,
        error: error.message,
        method: "DIRECT_API_CALL",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      ue.error("Direct API test failed", {
        description: error.message
      });
    } finally {
      setIsTestingRaw(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        "🔧 M1SSION™ RAW API DEBUG",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "EMERGENCY TEST" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "Test diretto dell'API OneSignal per verificare se il problema è nella configurazione o nell'Edge Function." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "🔑 OneSignal App ID:" }),
            " 50cb75f7-f065-4626-9a63-ce5692fa7e70"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "🔐 REST API Key:" }),
            " os_v2_app_...6fdxr7fna (configurata)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "📡 Target:" }),
            " https://onesignal.com/api/v1/notifications"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "📱 Audience:" }),
            " Subscribed Users (broadcast)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: testRawAPI,
            disabled: isTestingRaw,
            className: "w-full",
            size: "lg",
            variant: "destructive",
            children: isTestingRaw ? "🔄 Testing Direct API..." : "🧪 TEST DIRECT ONESIGNAL API"
          }
        ),
        debugResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 p-4 border rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold mb-3 flex items-center gap-2", children: [
            debugResult.success ? "✅ SUCCESS" : "❌ FAILED",
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: debugResult.success ? "default" : "destructive", children: [
              "Status: ",
              debugResult.status || "ERROR"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs bg-muted p-3 rounded overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { children: JSON.stringify(debugResult, null, 2) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Timestamp:" }),
              " ",
              debugResult.timestamp
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Method:" }),
              " ",
              debugResult.method
            ] }),
            debugResult.result?.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "OneSignal ID:" }),
              " ",
              debugResult.result.id
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold mb-2", children: "🧪 Diagnostica:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Se questo test funziona → Problema nell'Edge Function Supabase" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Se questo test fallisce → Problema nella configurazione OneSignal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Status 400 → Payload malformato" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Status 401 → API Key non valida" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Status 429 → Rate limit superato" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground", children: "© 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ" })
  ] });
};

export { M1ssionDebugTest };
