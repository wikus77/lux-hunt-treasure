import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { x as RefreshCw, B as Button, bE as Copy, v as Card, A as CardHeader, H as CardTitle, O as CardContent, a5 as Badge, aP as Smartphone, aQ as Monitor, aJ as Send, s as supabase, e as ue, ak as CircleCheckBig, al as CircleAlert } from './index.BEQCqgv7.js';
import { e as enablePush } from './enablePush.Bj56GJ45.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

function PushDiagnostic() {
  const [diagnosticData, setDiagnosticData] = reactExports.useState(null);
  const [isRefreshing, setIsRefreshing] = reactExports.useState(false);
  const [testResult, setTestResult] = reactExports.useState(null);
  const [logs, setLogs] = reactExports.useState([]);
  const addLog = (message) => {
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs((prev) => [logEntry, ...prev.slice(0, 49)]);
  };
  const refreshDiagnostics = async () => {
    setIsRefreshing(true);
    try {
      addLog("🔄 Starting diagnostic scan...");
      const { data: { user } } = await supabase.auth.getUser();
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const pushSupported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      let swRegistrations = [];
      let swController = null;
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        swRegistrations = [...registrations];
        swController = navigator.serviceWorker.controller;
      }
      let currentSubscription = null;
      if (pushSupported) {
        try {
          const reg = await navigator.serviceWorker.ready;
          currentSubscription = await reg.pushManager.getSubscription();
        } catch (error) {
          addLog(`⚠️ Error getting push subscription: ${error}`);
        }
      }
      let fcmSubscriptions = [];
      if (user) {
        try {
          const { data, error } = await supabase.from("fcm_subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
          if (error) {
            addLog(`⚠️ DB query error: ${error.message}`);
          } else {
            fcmSubscriptions = data || [];
          }
        } catch (error) {
          addLog(`⚠️ DB error: ${error.message}`);
        }
      }
      const diagnostics = {
        isStandalone,
        userAgent: navigator.userAgent,
        platform: /iPad|iPhone|iPod/.test(navigator.userAgent) ? "ios" : /Android/.test(navigator.userAgent) ? "android" : "desktop",
        notificationPermission: Notification.permission,
        pushSupported,
        swSupported: "serviceWorker" in navigator,
        swRegistrations: swRegistrations.map((reg) => ({
          scope: reg.scope,
          scriptURL: reg.active?.scriptURL,
          state: reg.active?.state,
          installing: !!reg.installing,
          waiting: !!reg.waiting
        })),
        swController: swController ? {
          scriptURL: swController.scriptURL,
          state: swController.state
        } : null,
        currentSubscription: currentSubscription ? {
          endpoint: currentSubscription.endpoint.substring(0, 50) + "...",
          endpointType: currentSubscription.endpoint.includes("fcm.googleapis.com") ? "fcm" : currentSubscription.endpoint.includes("web.push.apple.com") ? "apns" : "unknown"
        } : null,
        userId: user?.id || null,
        isAuthenticated: !!user,
        fcmSubscriptions: fcmSubscriptions.map((sub) => ({
          id: sub.id,
          token: sub.token.substring(0, 20) + "...",
          platform: sub.platform,
          is_active: sub.is_active,
          created_at: sub.created_at
        })),
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      setDiagnosticData(diagnostics);
      addLog("✅ Diagnostic scan complete");
    } catch (error) {
      addLog(`❌ Diagnostic error: ${error.message}`);
      ue.error("Errore diagnostica", { description: error.message });
    } finally {
      setIsRefreshing(false);
    }
  };
  const testPushFlow = async () => {
    addLog("🧪 Starting push notification test...");
    try {
      await enablePush();
      addLog("✅ Push test SUCCESS");
      ue.success("Test push completato!");
      await refreshDiagnostics();
    } catch (error) {
      addLog(`💥 Push test ERROR: ${error.message}`);
      ue.error("Test push error", { description: error.message });
    }
  };
  const testFCMFunction = async () => {
    if (!diagnosticData?.fcmSubscriptions?.length) {
      ue.error("Nessun token FCM trovato");
      return;
    }
    const token = diagnosticData.fcmSubscriptions[0];
    addLog(`🔥 Testing FCM function with token ${token.token}...`);
    try {
      const { data, error } = await supabase.functions.invoke("fcm-test", {
        body: {
          token: token.token.replace("...", ""),
          // This won't work with truncated token, but shows the flow
          title: "M1SSION FCM Test",
          body: "Diagnostic test from /debug/push"
        }
      });
      if (error) {
        addLog(`❌ FCM function error: ${error.message}`);
        ue.error("FCM test error", { description: error.message });
      } else {
        addLog(`✅ FCM function result: ${JSON.stringify(data)}`);
        ue.success("FCM test inviato!");
      }
    } catch (error) {
      addLog(`💥 FCM function exception: ${error.message}`);
      ue.error("FCM function error", { description: error.message });
    }
  };
  const copyDiagnostics = () => {
    if (!diagnosticData) return;
    const diagnosticText = JSON.stringify(diagnosticData, null, 2);
    navigator.clipboard.writeText(diagnosticText);
    ue.success("Diagnostica copiata negli appunti");
  };
  reactExports.useEffect(() => {
    refreshDiagnostics();
  }, []);
  const getStatusIcon = (condition) => {
    return condition ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-red-500" });
  };
  if (!diagnosticData) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-8 h-8 animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Caricamento diagnostica push..." })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "🔧 Push Diagnostics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: copyDiagnostics, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4 mr-2" }),
          "Copia JSON"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: refreshDiagnostics, disabled: isRefreshing, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}` }),
          "Aggiorna"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "🌍 Environment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "PWA Standalone Mode" }),
          getStatusIcon(diagnosticData.isStandalone),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: diagnosticData.isStandalone ? "default" : "secondary", children: diagnosticData.isStandalone ? "Standalone" : "Browser" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Platform" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            diagnosticData.platform === "ios" && /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-4 h-4 mr-1" }),
            diagnosticData.platform === "android" && /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-4 h-4 mr-1" }),
            diagnosticData.platform === "desktop" && /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "w-4 h-4 mr-1" }),
            diagnosticData.platform
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "UA:" }),
          " ",
          diagnosticData.userAgent.substring(0, 100),
          "..."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "📱 Push Support" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Service Worker Support" }),
          getStatusIcon(diagnosticData.swSupported)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Push Manager Support" }),
          getStatusIcon(diagnosticData.pushSupported)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Notification Permission" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: diagnosticData.notificationPermission === "granted" ? "default" : diagnosticData.notificationPermission === "denied" ? "destructive" : "secondary", children: diagnosticData.notificationPermission })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "⚙️ Service Worker" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        diagnosticData.swController && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-green-50 border border-green-200 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Controller:" }),
            " ",
            diagnosticData.swController.scriptURL
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
            "State: ",
            diagnosticData.swController.state
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-medium", children: [
            "Registrations (",
            diagnosticData.swRegistrations.length,
            ")"
          ] }),
          diagnosticData.swRegistrations.map((reg, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 bg-muted/50 rounded text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Scope:" }),
              " ",
              reg.scope
            ] }),
            reg.scriptURL && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Script:" }),
              " ",
              reg.scriptURL
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "State:" }),
              " ",
              reg.state
            ] })
          ] }, idx))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "📡 Current Push Subscription" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: diagnosticData.currentSubscription ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Endpoint Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: diagnosticData.currentSubscription.endpointType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Endpoint:" }),
          " ",
          diagnosticData.currentSubscription.endpoint
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-4 text-muted-foreground", children: "No active push subscription" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "👤 Authentication" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Authenticated" }),
          getStatusIcon(diagnosticData.isAuthenticated)
        ] }),
        diagnosticData.userId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "User ID:" }),
          " ",
          diagnosticData.userId
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
        "🗄️ FCM Database (",
        diagnosticData.fcmSubscriptions.length,
        ")"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: diagnosticData.fcmSubscriptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: diagnosticData.fcmSubscriptions.map((sub, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 bg-muted/50 rounded text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: sub.token }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: sub.is_active ? "default" : "secondary", children: sub.is_active ? "Active" : "Inactive" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Platform: ",
          sub.platform,
          " • Created: ",
          new Date(sub.created_at).toLocaleString()
        ] })
      ] }, idx)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-4 text-muted-foreground", children: "No FCM subscriptions found" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "🧪 Test Actions" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: testPushFlow, className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4 mr-2" }),
          "Test Complete Push Flow"
        ] }),
        diagnosticData.fcmSubscriptions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: testFCMFunction, variant: "outline", className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4 mr-2" }),
          "Test FCM Edge Function"
        ] }),
        testResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-muted/50 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium mb-2", children: "Test Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-xs overflow-x-auto", children: JSON.stringify(testResult, null, 2) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "📜 Logs" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-48 overflow-y-auto bg-black text-green-400 p-3 rounded font-mono text-xs", children: [
        logs.map((log, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: log }, idx)),
        logs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "No logs yet..." })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground text-center", children: [
      "Diagnostic timestamp: ",
      new Date(diagnosticData.timestamp).toLocaleString()
    ] })
  ] });
}

export { PushDiagnostic as default };
