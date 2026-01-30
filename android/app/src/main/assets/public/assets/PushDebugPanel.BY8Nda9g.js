const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/enableWebPush.Dl_wlmt9.js","assets/webPushManager.CtKFuVbO.js","assets/index.CUdqZWfi.js","assets/animation-vendor.BiI6PE8T.js","assets/supabase-vendor.CPRn8nK0.js","assets/map-vendor.uCr1tAyj.js","assets/ui-vendor.C69ET9UU.js","assets/stripe-vendor.baQ46ET6.js","assets/router-vendor.DUjmXt3z.js","assets/index.CnkXYqkZ.css"])))=>i.map(i=>d[i]);
import { aH as CircleCheckBig, bQ as CircleX, B as Button, $ as RefreshCw, bs as Send, U as Users, s as supabase, _ as __vitePreload, bc as functionsBaseUrl, bX as getSupabaseAnonKey } from './index.CUdqZWfi.js';
import { r as reactExports, j as jsxRuntimeExports } from './animation-vendor.BiI6PE8T.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

async function getCurrentSubscription() {
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}
const PushDebugPanel = () => {
  const [isControlled, setIsControlled] = reactExports.useState(false);
  const [isSubscribed, setIsSubscribed] = reactExports.useState(false);
  const [endpointHost, setEndpointHost] = reactExports.useState("");
  const [endpointTail, setEndpointTail] = reactExports.useState("");
  const [readyScope, setReadyScope] = reactExports.useState("");
  const [permission, setPermission] = reactExports.useState("default");
  const [sessionUid, setSessionUid] = reactExports.useState("");
  const [lastUpsertResult, setLastUpsertResult] = reactExports.useState(null);
  const [lastSendResult, setLastSendResult] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const updateStatus = async () => {
    try {
      const sub = await getCurrentSubscription();
      const isControlledNow = !!navigator.serviceWorker.controller;
      const isSubscribedNow = !!sub;
      setIsControlled(isControlledNow);
      setIsSubscribed(isSubscribedNow);
      if (sub) {
        const url = new URL(sub.endpoint);
        setEndpointHost(url.hostname);
        setEndpointTail(sub.endpoint.slice(-20));
      } else {
        setEndpointHost("");
        setEndpointTail("");
      }
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        setReadyScope(registration.scope);
      }
      if ("Notification" in window) {
        setPermission(Notification.permission);
      }
      const { data: { session } } = await supabase.auth.getSession();
      setSessionUid(session?.user?.id || "Not logged in");
    } catch (error) {
    }
  };
  const handleResubscribe = async () => {
    setIsLoading(true);
    setLastUpsertResult(null);
    try {
      const { enableWebPush } = await __vitePreload(async () => { const { enableWebPush } = await import('./enableWebPush.Dl_wlmt9.js');return { enableWebPush }},true?__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]):void 0);
      const sub = await enableWebPush();
      setLastUpsertResult({
        success: true,
        endpoint: sub?.endpoint.slice(-30)
      });
      await updateStatus();
    } catch (error) {
      setLastUpsertResult({
        success: false,
        error: error?.message || String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleTestSendSelf = async () => {
    setIsLoading(true);
    setLastSendResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }
      const { data, error } = await supabase.functions.invoke("webpush-send", {
        body: {
          audience: { user_id: session.user.id },
          payload: {
            title: "Test Self",
            body: `Test notification at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`
          }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      setLastSendResult(data || { error: error?.message });
    } catch (error) {
      setLastSendResult({ error: error?.message || String(error) });
    } finally {
      setIsLoading(false);
    }
  };
  const handleTestSendAll = async () => {
    setIsLoading(true);
    setLastSendResult(null);
    try {
      const adminToken = prompt("Enter admin token:");
      if (!adminToken) return;
      const SUPABASE_URL = `${functionsBaseUrl}`;
      const SUPABASE_ANON_KEY = getSupabaseAnonKey();
      const SUPABASE_ANON_MASK = SUPABASE_ANON_KEY && typeof SUPABASE_ANON_KEY === "string" ? SUPABASE_ANON_KEY.slice(0, 4) + "…" + SUPABASE_ANON_KEY.slice(-4) : "<env>";
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/webpush-send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": adminToken,
            "apikey": SUPABASE_ANON_KEY && typeof SUPABASE_ANON_KEY === "string" ? SUPABASE_ANON_KEY.slice(0, 4) + "…" + SUPABASE_ANON_KEY.slice(-4) : "<env>"
          },
          body: JSON.stringify({
            payload: {
              title: "Admin Broadcast Test",
              body: `Broadcast at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`
            }
          })
        }
      );
      const data = await response.json();
      setLastSendResult({ status: response.status, ...data });
    } catch (error) {
      setLastSendResult({ error: error?.message || String(error) });
    } finally {
      setIsLoading(false);
    }
  };
  reactExports.useEffect(() => {
    updateStatus();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border rounded-lg space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Push Debug E2E" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        permission === "granted" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-500" }),
        "Permission: ",
        permission
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        isControlled ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-500" }),
        "SW Controller: ",
        isControlled ? "true" : "false"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        isSubscribed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-500" }),
        "Subscribed: ",
        isSubscribed ? "true" : "false"
      ] }),
      readyScope && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "SW scope: ",
        readyScope
      ] }),
      endpointHost && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Endpoint: ",
        endpointHost,
        " ...",
        endpointTail
      ] }),
      sessionUid && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "User ID: ",
        sessionUid.slice(0, 8),
        "..."
      ] })
    ] }),
    lastUpsertResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs p-2 rounded ${lastUpsertResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Upsert:" }),
      " ",
      JSON.stringify(lastUpsertResult, null, 2)
    ] }),
    lastSendResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs p-2 rounded bg-blue-100 text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Send:" }),
      " ",
      JSON.stringify(lastSendResult, null, 2)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: updateStatus, size: "sm", variant: "outline", disabled: isLoading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-1" }),
        "Refresh"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleResubscribe, size: "sm", variant: "default", disabled: isLoading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4 mr-1" }),
        "Resubscribe"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleTestSendSelf, size: "sm", variant: "secondary", disabled: isLoading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4 mr-1" }),
        "Test Self"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleTestSendAll, size: "sm", variant: "destructive", disabled: isLoading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4 mr-1" }),
        "Test All (Admin)"
      ] })
    ] })
  ] });
};

export { PushDebugPanel as default };
