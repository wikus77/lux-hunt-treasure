import { r as reactExports, j as jsxRuntimeExports } from './animation-vendor.BiI6PE8T.js';
import { e as CircleAlert, B as Button, a1 as LoaderCircle, br as Bell } from './index.CUdqZWfi.js';
import { r as runRepairFlow } from './repairFlow.BsA_Cch6.js';
import { i as isWebPushSupported, a as isPWAMode, w as webPushManager } from './webPushManager.CtKFuVbO.js';
import { B as BellOff } from './bell-off.DfVi_ENY.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

const PushToggleV2 = () => {
  const [isEnabled, setIsEnabled] = reactExports.useState(false);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [isSupported, setIsSupported] = reactExports.useState(false);
  const [supportReason, setSupportReason] = reactExports.useState("");
  const lastClickRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    const supported = isWebPushSupported();
    setIsSupported(supported);
    if (!supported) {
      setSupportReason("Push notifications not supported");
      return;
    }
    const isIOS = /iphone|ipod|ipad/i.test(navigator.userAgent);
    if (isIOS && !isPWAMode()) {
      setIsSupported(false);
      setSupportReason("Su iOS, aggiungi questa app alla home screen prima");
      return;
    }
    refreshStatus();
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshStatus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", refreshStatus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", refreshStatus);
    };
  }, []);
  const refreshStatus = async () => {
    if (!isWebPushSupported()) return;
    try {
      const subscription = await webPushManager.getCurrent();
      setIsEnabled(!!subscription);
      if (subscription) {
      } else {
      }
    } catch (error) {
    }
  };
  const handleToggle = reactExports.useCallback(async () => {
    if (!isSupported) return;
    const now = Date.now();
    if (now - lastClickRef.current < 500) {
      return;
    }
    lastClickRef.current = now;
    if (window.__m1_push_in_progress) {
      return;
    }
    setIsLoading(true);
    window.__m1_push_in_progress = true;
    try {
      if (!isEnabled) {
        const t0 = performance.now();
        const result = await runRepairFlow();
        const elapsed = Math.round(performance.now() - t0);
        if (result.ok && result.subscription) {
          setIsEnabled(true);
        } else {
          alert("Impossibile completare l'attivazione (riprovare)");
        }
      } else {
        await webPushManager.unsubscribe();
        setIsEnabled(false);
      }
    } catch (error) {
      let errorMessage = "Errore nell'abilitare le notifiche push.";
      if (error instanceof Error) {
        if (error.message.includes("home screen")) {
          errorMessage = "Aggiungi l'app alla home screen per abilitare le notifiche.";
        } else if (error.message.includes("permission")) {
          errorMessage = "Permessi notifiche negati.";
        } else if (error.message.includes("VAPID")) {
          errorMessage = "Errore configurazione server. Contatta l'assistenza.";
        }
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        window.__m1_push_in_progress = false;
      }, 1e3);
    }
  }, [isEnabled, isSupported]);
  if (!isSupported) {
    if (supportReason) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3 h-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: supportReason })
      ] });
    }
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", "data-push-toggle-v2": true, "data-push-toggle-repair": "1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      onClick: handleToggle,
      disabled: isLoading,
      variant: isEnabled ? "default" : "outline",
      size: "sm",
      className: "flex items-center gap-2",
      children: [
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : isEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BellOff, { className: "w-4 h-4" }),
        isLoading ? "Attendere..." : isEnabled ? "Notifiche Attive (V2)" : "Abilita Notifiche (V2)"
      ]
    }
  ) });
};

export { PushToggleV2 as default };
