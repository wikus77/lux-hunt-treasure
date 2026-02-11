import { r as reactExports, j as jsxRuntimeExports } from './animation-vendor.BiI6PE8T.js';
import { W as Card, ac as CardHeader, ae as CardTitle, B as Button, ai as CardContent, au as Badge, aH as CircleCheckBig, bQ as CircleX, a1 as LoaderCircle, s as supabase } from './index.CUdqZWfi.js';
import { u as useFcm } from './useFcm.6DtjqLsk.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';
import './webPushManager.CtKFuVbO.js';

const FCMDebugPanel = () => {
  const [isVisible, setIsVisible] = reactExports.useState(false);
  const [swInfo, setSwInfo] = reactExports.useState(null);
  const [edgeFunctionStatus, setEdgeFunctionStatus] = reactExports.useState("idle");
  const [edgeFunctionError, setEdgeFunctionError] = reactExports.useState(null);
  const { status, error, token, generate, isSupported, permission } = useFcm();
  reactExports.useEffect(() => {
    const isDebug = window.location.search.includes("debug=true") || localStorage.getItem("fcm_debug") === "true";
    setIsVisible(isDebug);
  }, []);
  reactExports.useEffect(() => {
    const getSwInfo = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          const activeReg = registrations.find((reg) => reg.active);
          setSwInfo({
            registered: registrations.length > 0,
            count: registrations.length,
            scope: activeReg?.scope || "none",
            scriptURL: activeReg?.active?.scriptURL || "none",
            state: activeReg?.active?.state || "none"
          });
        } catch (error2) {
          setSwInfo({ error: error2.message });
        }
      }
    };
    if (isVisible) {
      getSwInfo();
    }
  }, [isVisible]);
  const testEdgeFunction = async () => {
    if (!token) return;
    setEdgeFunctionStatus("testing");
    setEdgeFunctionError(null);
    try {
      const { data, error: error2 } = await supabase.functions.invoke("send-firebase-push", {
        body: {
          token,
          title: "M1SSION™ Debug Test",
          body: "Edge Function connectivity test",
          data: { debug: true, timestamp: Date.now() }
        }
      });
      if (error2) {
        setEdgeFunctionStatus("error");
        setEdgeFunctionError(error2.message);
      } else {
        setEdgeFunctionStatus("success");
      }
    } catch (err) {
      setEdgeFunctionStatus("error");
      setEdgeFunctionError(err.message || "Network error");
    }
  };
  if (!isVisible) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-y-auto z-50 bg-background/95 backdrop-blur-sm border-2 border-orange-500", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm text-orange-500 flex items-center justify-between", children: [
      "🔧 M1SSION™ FCM Debug Panel",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => setIsVisible(false),
          className: "h-6 w-6 p-0",
          children: "×"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Browser Support:" }),
        isSupported ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "default", className: "bg-green-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3 mr-1" }),
          "Supported"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3 mr-1" }),
          "Not Supported"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Notification Permission:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: permission === "granted" ? "default" : permission === "denied" ? "destructive" : "secondary",
            className: permission === "granted" ? "bg-green-600" : "",
            children: permission || "default"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Service Worker:" }),
          swInfo ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: swInfo.registered ? "default" : "destructive", className: swInfo.registered ? "bg-green-600" : "", children: [
            swInfo.registered ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3 mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3 mr-1" }),
            swInfo.registered ? "Active" : "None"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Loading..." })
        ] }),
        swInfo && swInfo.registered && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground pl-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "Scope: ",
            swInfo.scope
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "URL: ",
            swInfo.scriptURL?.split("/").pop()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "State: ",
            swInfo.state
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "FCM Token:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Badge,
          {
            variant: status === "success" ? "default" : status === "error" ? "destructive" : "secondary",
            className: status === "success" ? "bg-green-600" : "",
            children: [
              status === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 mr-1 animate-spin" }),
              status === "success" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3 mr-1" }),
              status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3 mr-1" }),
              status
            ]
          }
        )
      ] }),
      token && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Token: ",
        token.substring(0, 16),
        "..."
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-red-500 bg-red-50 p-2 rounded", children: [
        "Error: ",
        error
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: generate,
          disabled: status === "loading",
          size: "sm",
          className: "w-full",
          children: [
            status === "loading" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 mr-1 animate-spin" }) : "🔄",
            "Generate Token"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Edge Function:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              variant: edgeFunctionStatus === "success" ? "default" : edgeFunctionStatus === "error" ? "destructive" : "secondary",
              className: edgeFunctionStatus === "success" ? "bg-green-600" : "",
              children: [
                edgeFunctionStatus === "testing" && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 mr-1 animate-spin" }),
                edgeFunctionStatus === "success" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3 mr-1" }),
                edgeFunctionStatus === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3 mr-1" }),
                edgeFunctionStatus
              ]
            }
          )
        ] }),
        edgeFunctionError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-red-500 bg-red-50 p-2 rounded mb-2", children: edgeFunctionError }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: testEdgeFunction,
            disabled: !token || edgeFunctionStatus === "testing",
            size: "sm",
            variant: "outline",
            className: "w-full",
            children: [
              edgeFunctionStatus === "testing" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 mr-1 animate-spin" }) : "📡",
              "Test Push Send"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground text-center pt-2 border-t", children: [
        "AG-X0197 Debug Mode • ",
        (/* @__PURE__ */ new Date()).toLocaleTimeString()
      ] })
    ] })
  ] });
};

function FirebaseNotificationDebug() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FCMDebugPanel, {});
}

export { FirebaseNotificationDebug as default };
