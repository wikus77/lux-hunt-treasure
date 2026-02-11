import { r as reactExports, j as jsxRuntimeExports } from './animation-vendor.BiI6PE8T.js';
import { W as Card, ac as CardHeader, ae as CardTitle, ah as CardDescription, br as Bell, ai as CardContent, aH as CircleCheckBig, e as CircleAlert, ba as Switch, B as Button, m as ue, s as supabase } from './index.CUdqZWfi.js';
import { w as webPushManager } from './webPushManager.CtKFuVbO.js';
import { A as Alert, a as AlertDescription } from './alert.BfQV5yF9.js';
import { r as runRepairFlow } from './repairFlow.BsA_Cch6.js';
import { B as BellOff } from './bell-off.DfVi_ENY.js';

function useUnifiedPush() {
  const [state, setState] = reactExports.useState({
    enabled: false,
    loading: false,
    error: null,
    permission: typeof Notification !== "undefined" ? Notification.permission : "default",
    subscriptionEndpoint: null
  });
  reactExports.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await navigator.serviceWorker?.ready.catch(() => null);
        const status = await webPushManager.getStatus();
        if (!mounted) return;
        if (false) ;
        setState((s) => ({
          ...s,
          enabled: !!status.enabled,
          permission: status.permission ?? s.permission,
          subscriptionEndpoint: status.endpoint ?? null,
          error: null
        }));
      } catch (err) {
        if (!mounted) return;
        setState((s) => ({ ...s, error: err?.message ?? "Push status read failed" }));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const enable = reactExports.useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await webPushManager.enable();
      const status = await webPushManager.getStatus();
      setState((s) => ({
        ...s,
        loading: false,
        enabled: !!status.enabled,
        permission: status.permission ?? s.permission,
        subscriptionEndpoint: status.endpoint ?? null
      }));
      return true;
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err?.message ?? "Enable push failed" }));
      return false;
    }
  }, []);
  const disable = reactExports.useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await webPushManager.disable();
      const status = await webPushManager.getStatus();
      setState((s) => ({
        ...s,
        loading: false,
        enabled: !!status.enabled,
        permission: status.permission ?? s.permission,
        subscriptionEndpoint: status.endpoint ?? null
      }));
      return true;
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err?.message ?? "Disable push failed" }));
      return false;
    }
  }, []);
  const refresh = reactExports.useCallback(async () => {
    try {
      const status = await webPushManager.getStatus();
      setState((s) => ({
        ...s,
        enabled: !!status.enabled,
        permission: status.permission ?? s.permission,
        subscriptionEndpoint: status.endpoint ?? null
      }));
    } catch (err) {
      setState((s) => ({ ...s, error: err?.message ?? "Refresh push status failed" }));
    }
  }, []);
  return {
    ...state,
    enable,
    disable,
    refresh,
    // compat richiesti dai componenti legacy:
    isSupported: webPushManager.isSupported(),
    subscription: null,
    webPushSubscription: state.subscriptionEndpoint,
    subscriptionType: "webpush",
    isLoading: state.loading,
    isSubscribed: !!state.enabled,
    canSubscribe: !state.enabled && !state.loading,
    subscribe: enable,
    async requestPermission() {
      const perm = await Notification.requestPermission();
      setState((s) => ({ ...s, permission: perm }));
      return perm === "granted";
    },
    unsubscribe: disable
  };
}

async function backendHasActiveEndpoint(endpoint) {
  if (!endpoint) return false;
  try {
    const { count, error } = await supabase.from("webpush_subscriptions").select("endpoint", { head: true, count: "exact" }).eq("endpoint", endpoint).eq("is_active", true);
    if (error) {
      return false;
    }
    return (count ?? 0) > 0;
  } catch (e) {
    return false;
  }
}
const UnifiedPushToggle = ({ className }) => {
  const {
    isSupported,
    permission,
    subscription,
    subscriptionType,
    isLoading,
    error,
    isSubscribed,
    canSubscribe,
    requestPermission,
    unsubscribe,
    refresh
  } = useUnifiedPush();
  const [isRepairLoading, setIsRepairLoading] = reactExports.useState(false);
  const getPlatformLabel = () => {
    return "Desktop";
  };
  const getSubscriptionTypeLabel = () => {
    return subscriptionType?.toUpperCase() || "Unknown";
  };
  const getStatusColor = () => {
    if (isSubscribed) return "text-success";
    if (permission === "denied") return "text-destructive";
    return "text-muted-foreground";
  };
  const getStatusText = () => {
    if (isLoading) return "Configurazione in corso...";
    if (isSubscribed) return `Attivo (${getSubscriptionTypeLabel()})`;
    if (permission === "denied") return "Permessi negati";
    if (permission === "default") return "Permessi richiesti";
    return "Non attivo";
  };
  const handleToggle = async () => {
    setIsRepairLoading(true);
    try {
      const reg = await navigator.serviceWorker?.ready.catch(() => null);
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (false) ;
      if (isSubscribed) {
        const known = sub ? await backendHasActiveEndpoint(sub.endpoint) : false;
        if (false) ;
        if (!known) {
          const result2 = await runRepairFlow();
          if (result2.ok && result2.subscription) {
            ue.success("Notifiche riparate e riattivate ✅");
            await refresh();
          } else {
            ue.error("Impossibile riparare la subscription");
          }
          return;
        }
        await unsubscribe();
        await refresh();
        ue.success("Notifiche disattivate");
        return;
      }
      if (false) ;
      await navigator.serviceWorker.ready;
      const result = await runRepairFlow();
      if (result.ok && result.subscription) {
        ue.success("Notifiche attivate ✅");
        await refresh();
      } else {
        ue.error("Impossibile completare l'attivazione (riprovare)");
      }
    } catch (error2) {
      ue.error("Errore durante l'operazione");
    } finally {
      setIsRepairLoading(false);
    }
  };
  if (!isSupported) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BellOff, { className: "w-5 h-5" }),
        "Notifiche Push"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Le notifiche push non sono supportate su questo dispositivo." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className, "data-push-toggle-v1": true, "data-push-toggle-repair": "1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-5 h-5" }),
        "Notifiche Push Unificate"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Sistema unificato per notifiche su tutti i dispositivi" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-2 h-2 rounded-full ${isSubscribed ? "bg-success" : "bg-muted-foreground"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: getStatusColor(), children: getStatusText() })
        ] }),
        subscription
      ] }),
      isSubscribed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-muted/50 rounded-lg space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 text-success" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Connesso" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "Tipo: ",
            getSubscriptionTypeLabel()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "Piattaforma: ",
            getPlatformLabel()
          ] }),
          subscription
        ] })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: error })
      ] }),
      permission === "denied" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "Per attivare le notifiche, vai nelle impostazioni del browser e consenti le notifiche per questo sito." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
            isSubscribed ? "Disattiva" : "Attiva",
            " Notifiche"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: isSubscribed ? "Riceverai notifiche push su questo dispositivo" : "Attiva per ricevere notifiche push" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            checked: isSubscribed,
            onCheckedChange: handleToggle,
            disabled: isLoading || isRepairLoading || !canSubscribe && !isSubscribed
          }
        )
      ] }),
      !isSubscribed && permission !== "granted" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: requestPermission,
          disabled: isLoading,
          className: "w-full",
          variant: "outline",
          children: isLoading ? "Configurazione..." : "Richiedi Permessi"
        }
      ),
      isSubscribed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-success text-sm font-medium", children: "✅ Notifiche push attive e funzionanti!" }) })
    ] })
  ] });
};

const UnifiedPushToggle$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  UnifiedPushToggle
}, Symbol.toStringTag, { value: 'Module' }));

export { UnifiedPushToggle as U, UnifiedPushToggle$1 as a, useUnifiedPush as u };
