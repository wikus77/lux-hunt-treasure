import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { B as Button, s as supabase, a6 as useToast, Q as Activity, x as RefreshCw, v as Card, A as CardHeader, H as CardTitle, bH as Server, O as CardContent, aB as Database, a5 as Badge, bI as Wifi, ak as CircleCheckBig, an as CircleX, o as TriangleAlert } from './index.BEQCqgv7.js';
import { e as enablePush } from './enablePush.Bj56GJ45.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

function PushEnableButton() {
  const [pending, setPending] = reactExports.useState(false);
  const onClick = async () => {
    setPending(true);
    try {
      await enablePush();
    } finally {
      setPending(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: pending, onClick, children: pending ? "Enabling…" : "Enable Push" });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
function useWebPush() {
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [isSubscribed, setIsSubscribed] = reactExports.useState(false);
  const [permission, setPermission] = reactExports.useState(
    typeof window !== "undefined" ? Notification.permission : "default"
  );
  const isSupported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const ensureServiceWorker = reactExports.useCallback(async () => {
    if (!isSupported) {
      throw new Error("Service Worker o Push Manager non supportati");
    }
    let registration = await navigator.serviceWorker.getRegistration("/");
    if (!registration) {
      registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/"
      });
    }
    const readyRegistration = await navigator.serviceWorker.ready;
    return readyRegistration;
  }, [isSupported]);
  const requestPermission = reactExports.useCallback(async () => {
    if (!isSupported) {
      throw new Error("Notifiche non supportate in questo browser");
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== "granted") {
      throw new Error("Permesso per le notifiche negato");
    }
    return result;
  }, [isSupported]);
  const subscribe = reactExports.useCallback(async (vapidPublicKey) => {
    setIsLoading(true);
    try {
      if (permission !== "granted") {
        await requestPermission();
      }
      const registration = await ensureServiceWorker();
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        const subscriptionData2 = {
          endpoint: existingSubscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(existingSubscription.getKey("p256dh")))),
            auth: btoa(String.fromCharCode(...new Uint8Array(existingSubscription.getKey("auth"))))
          }
        };
        setIsSubscribed(true);
        return subscriptionData2;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth"))))
        }
      };
      setIsSubscribed(true);
      return subscriptionData;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [permission, requestPermission, ensureServiceWorker]);
  const saveSubscription = reactExports.useCallback(async (subscription, extra = {}) => {
    setIsLoading(true);
    try {
      const payload = {
        subscription: {
          endpoint: subscription.endpoint,
          keys: subscription.keys
        },
        platform: navigator.platform || "unknown",
        ua: navigator.userAgent,
        app_version: "web-app",
        ...extra
      };
      const { data, error } = await supabase.functions.invoke("push_subscribe", {
        body: payload
      });
      if (error) {
        throw new Error(`Errore nel salvare la sottoscrizione: ${error.message}`);
      }
      return data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  const testPush = reactExports.useCallback(async (options) => {
    setIsLoading(true);
    try {
      const payload = {
        title: options.title || "M1SSION™ Test",
        body: options.body || "Test push notification",
        url: options.url || "/",
        ...options
      };
      const { data, error } = await supabase.functions.invoke("push_send", {
        body: payload
      });
      if (error) {
        throw new Error(`Errore nell'invio della notifica: ${error.message}`);
      }
      return data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  const checkSubscription = reactExports.useCallback(async () => {
    if (!isSupported) return null;
    try {
      const registration = await navigator.serviceWorker.getRegistration("/");
      if (!registration) return null;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return null;
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth"))))
        }
      };
      setIsSubscribed(true);
      return subscriptionData;
    } catch (error) {
      return null;
    }
  }, [isSupported]);
  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    ensureServiceWorker,
    subscribe,
    saveSubscription,
    testPush,
    requestPermission,
    checkSubscription
  };
}

function PushHealth() {
  useToast();
  const { isSupported, permission} = useWebPush();
  const [systemStatus, setSystemStatus] = reactExports.useState({
    serviceWorker: "loading",
    pushSupport: "loading",
    vapidKeys: "loading",
    database: "loading",
    edgeFunctions: "loading"
  });
  const [subscriptionCount, setSubscriptionCount] = reactExports.useState(null);
  const [isRefreshing, setIsRefreshing] = reactExports.useState(false);
  const checkSystemHealth = async () => {
    setIsRefreshing(true);
    const newStatus = { ...systemStatus };
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration("/");
        newStatus.serviceWorker = registration ? "ok" : "error";
      } else {
        newStatus.serviceWorker = "error";
      }
      newStatus.pushSupport = isSupported ? "ok" : "error";
      try {
        const testKey = "BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q";
        const decoded = atob(testKey.replace(/-/g, "+").replace(/_/g, "/"));
        newStatus.vapidKeys = decoded.length === 65 ? "ok" : "error";
      } catch {
        newStatus.vapidKeys = "error";
      }
      try {
        const { count, error } = await supabase.from("push_subscriptions").select("*", { count: "exact", head: true });
        if (error) {
          newStatus.database = "error";
        } else {
          newStatus.database = "ok";
          setSubscriptionCount(count || 0);
        }
      } catch (error) {
        newStatus.database = "error";
      }
      try {
        const { error } = await supabase.functions.invoke("push_send", {
          body: { test: true }
        });
        newStatus.edgeFunctions = "ok";
      } catch (error) {
        newStatus.edgeFunctions = "error";
      }
    } catch (error) {
    }
    setSystemStatus(newStatus);
    setIsRefreshing(false);
  };
  reactExports.useEffect(() => {
    checkSystemHealth();
  }, []);
  const getStatusIcon = (status) => {
    switch (status) {
      case "ok":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4 text-green-500" });
      case "error":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-red-500" });
      case "loading":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 animate-spin text-yellow-500" });
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "ok":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "OK" });
      case "error":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Error" });
      case "loading":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Loading..." });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-8 w-8" }),
          "Push Health Dashboard"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2", children: "Monitora e testa il sistema di notifiche push" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: checkSystemHealth,
          disabled: isRefreshing,
          variant: "outline",
          children: [
            isRefreshing ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
            "Aggiorna stato"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { className: "h-5 w-5" }),
          "Stato Sistema"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              getStatusIcon(systemStatus.serviceWorker),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Service Worker" })
            ] }),
            getStatusBadge(systemStatus.serviceWorker)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              getStatusIcon(systemStatus.pushSupport),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Push Support" })
            ] }),
            getStatusBadge(systemStatus.pushSupport)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              getStatusIcon(systemStatus.vapidKeys),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "VAPID Keys" })
            ] }),
            getStatusBadge(systemStatus.vapidKeys)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              getStatusIcon(systemStatus.database),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Database" })
            ] }),
            getStatusBadge(systemStatus.database)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              getStatusIcon(systemStatus.edgeFunctions),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Edge Functions" })
            ] }),
            getStatusBadge(systemStatus.edgeFunctions)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-5 w-5" }),
          "Statistiche Database"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Sottoscrizioni attive:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: subscriptionCount !== null ? subscriptionCount : "..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Permesso notifiche:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: permission === "granted" ? "secondary" : "outline", children: permission })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2 lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PushEnableButton, {}) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "h-5 w-5" }),
        "Riepilogo Sistema"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        Object.values(systemStatus).every((status) => status === "ok") ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-green-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Sistema completamente funzionante" })
        ] }) : Object.values(systemStatus).some((status) => status === "error") ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-red-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Rilevati problemi nel sistema" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-yellow-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Controllo sistema in corso..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Utilizza questo dashboard per monitorare la salute del sistema push e diagnosticare eventuali problemi." })
      ] })
    ] })
  ] });
}

export { PushHealth as default };
