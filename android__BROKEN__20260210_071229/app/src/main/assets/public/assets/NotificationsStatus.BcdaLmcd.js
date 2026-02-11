import { r as reactExports, j as jsxRuntimeExports } from './animation-vendor.BiI6PE8T.js';
import { s as supabase } from './index.CUdqZWfi.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

function getProviderFromEndpoint(endpoint) {
  if (endpoint.includes("webpush.push.apple.com") || endpoint.includes("api.push.apple.com")) {
    return "Apple";
  }
  if (endpoint.includes("fcm.googleapis.com")) {
    return "FCM";
  }
  return "Altro";
}
function NotificationsStatus({ userId }) {
  const [enabled, setEnabled] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  const [providerLabel, setProviderLabel] = reactExports.useState("");
  reactExports.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("push_tokens").select("token").eq("user_id", userId).eq("is_active", true).limit(1).maybeSingle();
      if (!mounted) return;
      if (error) {
        setEnabled(false);
        setProviderLabel("");
      } else {
        const isConnected = !!data;
        setEnabled(isConnected);
        setProviderLabel(isConnected ? getProviderFromEndpoint(data.token) : "");
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border border-border rounded-lg bg-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium mb-3", children: "Stato Notifiche Push" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            checked: enabled,
            readOnly: true,
            className: "h-4 w-4",
            style: { pointerEvents: "none" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Notifiche Push su questo dispositivo" })
      ] }),
      !loading && enabled && providerLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 text-xs bg-primary/10 text-primary rounded-md", children: providerLabel })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs text-muted-foreground", children: [
      loading && "Verifico stato…",
      !loading && enabled && "Connesso ✅",
      !loading && !enabled && "Non connesso ❌"
    ] })
  ] });
}

export { NotificationsStatus as default };
