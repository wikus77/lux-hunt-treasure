import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { aN as useUnifiedPush, aO as BellOff, a7 as Label, aI as Bell, a5 as Badge, aE as Switch, aP as Smartphone, aQ as Monitor, aR as NEW_PUSH_SUBSCRIBE_FLOW, aS as subscribeFlow, e as ue, aH as useAuth, B as Button, aT as registerPush, v as Card, A as CardHeader, H as CardTitle, m as Shield, O as CardContent, Z as Zap, aU as UnifiedPushToggle, N as CardDescription, s as supabase } from './index.BEQCqgv7.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { T as TestTube } from './test-tube.Ck18vXQW.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

const PushNotificationToggle = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    requestPermission,
    subscribe} = useUnifiedPush();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const isPWA = window.matchMedia("(display-mode: standalone)").matches;
  const isIOSPWA = isIOS && isPWA;
  const handleToggle = async () => {
    try {
      if (!isSubscribed) {
        if (NEW_PUSH_SUBSCRIBE_FLOW) {
          const res = await subscribeFlow();
          if (res.ok) {
            ue.success("Notifiche attivate! 🎉");
          } else if (res.status === "permission_denied") {
            ue.warning("Permesso negato. Abilita le notifiche nelle impostazioni di sistema.");
          } else {
            ue.error(`Errore attivazione: ${res.error ?? "sconosciuto"}`);
          }
          return;
        }
        if (permission !== "granted") {
          const granted = await requestPermission();
          if (!granted) return;
        }
        const result = await subscribe();
      } else {
        ue.info("Le notifiche possono essere disattivate dalle Impostazioni del dispositivo.");
      }
    } catch (error) {
      ue.error(`Errore: ${error?.message ?? "unknown"}`);
    }
  };
  const getPlatformInfo = () => {
    if (isIOSPWA) {
      return {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-4 h-4" }),
        label: "iOS PWA",
        description: "VAPID Push"
      };
    }
    return {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "w-4 h-4" }),
      label: "Desktop",
      description: "Firebase FCM"
    };
  };
  const platformInfo = getPlatformInfo();
  if (!isSupported) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 p-4 bg-muted/20 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BellOff, { className: "w-5 h-5 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Push Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Not supported on this device" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-card rounded-lg border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
      isSubscribed ? /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-5 h-5 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BellOff, { className: "w-5 h-5 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "push-notifications", children: "Push Notifications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [
            platformInfo.icon,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: platformInfo.label })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          isSubscribed ? "Attive" : "Disattivate",
          " • ",
          platformInfo.description
        ] }),
        permission === "denied" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Permessi negati. Abilitali nelle impostazioni del browser." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Switch,
      {
        id: "push-notifications",
        checked: isSubscribed,
        onCheckedChange: handleToggle,
        disabled: loading || permission === "denied"
      }
    )
  ] });
};

function checkPushSupport() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}
async function requestNotificationPermission() {
  try {
    const perm = await Notification.requestPermission();
    return perm === "granted";
  } catch {
    return false;
  }
}
const PushRegistrationTest = () => {
  const { user } = useAuth();
  const [status, setStatus] = reactExports.useState("idle");
  const onCheck = () => {
    const ok = checkPushSupport();
    setStatus(ok ? "supported" : "not_supported");
    ue[ok ? "success" : "error"](ok ? "Push support OK" : "Push not supported on this device");
  };
  const onAskPerm = async () => {
    const granted = await requestNotificationPermission();
    setStatus(granted ? "permission_granted" : "permission_denied");
    ue[granted ? "success" : "error"](granted ? "Permission granted" : "Permission denied");
  };
  const onRegister = async () => {
    try {
      setStatus("registering");
      const reg = await navigator.serviceWorker.ready;
      const res = await registerPush(reg);
      setStatus("registered");
      ue.success("Registered for push");
    } catch (e) {
      setStatus("error");
      ue.error("Failed to register push");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
      "User: ",
      user?.id ?? "anon"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
      "Status: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: status })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: onCheck, children: "Check support" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: onAskPerm, children: "Ask permission" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onRegister, children: "Register push" })
    ] })
  ] });
};

const PushTestPage = () => {
  const handleTestPush = async () => {
    try {
      ue.loading("Invio notifica di test...");
      const { data, error } = await supabase.functions.invoke("send-push-notification", {
        body: {
          title: "🎯 Test M1SSION™",
          body: "Sistema di notifiche push funzionante!",
          data: {
            type: "test",
            timestamp: Date.now()
          }
        }
      });
      if (error) throw error;
      ue.success("✅ Notifica di test inviata!");
    } catch (error) {
      ue.error("❌ Test fallito");
    }
  };
  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Unknown";
  };
  const getPlatformInfo = () => {
    const platform = navigator.platform;
    const ua = navigator.userAgent.toLowerCase();
    if (/ipad|iphone|ipod/.test(ua)) return "iOS";
    if (/android/.test(ua)) return "Android";
    if (platform.includes("Win")) return "Windows";
    if (platform.includes("Mac")) return "macOS";
    if (platform.includes("Linux")) return "Linux";
    return platform;
  };
  const isSupported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const isPWA = window.matchMedia("(display-mode: standalone)").matches;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto py-8 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-8 h-8" }),
        "Push Notifications Test"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Sistema unificato di notifiche push M1SSION™" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-5 h-5" }),
        "Informazioni Ambiente"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Browser" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: getBrowserInfo() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Piattaforma" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: getPlatformInfo() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "PWA" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: isPWA ? "default" : "secondary", children: isPWA ? "Sì" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Supporto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: isSupported ? "default" : "destructive", children: isSupported ? "Supportato" : "Non supportato" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PushRegistrationTest, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-5 h-5" }),
          "Sistema Unificato"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(UnifiedPushToggle, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-5 h-5" }),
          "Sistema Legacy"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PushNotificationToggle, {})
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "w-5 h-5" }),
          "Test Notifiche"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Invia una notifica di test per verificare il funzionamento" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleTestPush, className: "w-full", children: "🚀 Invia Notifica di Test" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Dettagli Tecnici" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "User Agent:" }),
          " ",
          navigator.userAgent
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Language:" }),
          " ",
          navigator.language
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Platform:" }),
          " ",
          navigator.platform
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Service Worker:" }),
          " ",
          "serviceWorker" in navigator ? "Supportato" : "Non supportato"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Push Manager:" }),
          " ",
          "PushManager" in window ? "Supportato" : "Non supportato"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Notifications:" }),
          " ",
          "Notification" in window ? Notification.permission : "Non supportato"
        ] })
      ] })
    ] })
  ] });
};

export { PushTestPage as default };
