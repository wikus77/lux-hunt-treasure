import { r as reactExports, j as jsxRuntimeExports } from './animation-vendor.BiI6PE8T.js';
import { s as supabase } from './index.CUdqZWfi.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

function detectProvider(endpoint) {
  if (!endpoint) return null;
  const e = endpoint.toLowerCase();
  if (e.startsWith("https://webpush.push.apple.com") || e.startsWith("https://api.push.apple.com")) return "APPLE";
  if (e.startsWith("https://fcm.googleapis.com")) return "FCM";
  return "ALTRO";
}
function PushInspector({ userId }) {
  const [info, setInfo] = reactExports.useState({ swReady: false, permission: Notification?.permission, notes: [] });
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    let mounted = true;
    (async () => {
      const notes = [];
      try {
        const reg = await navigator.serviceWorker?.ready;
        const scope = reg?.scope ?? null;
        const sub = await reg?.pushManager?.getSubscription();
        const swEndpoint = sub?.endpoint ?? null;
        const swProvider = detectProvider(swEndpoint);
        const { data: v, error } = await supabase.from("push_tokens").select("id, token, is_active, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (error) notes.push(`DB error: ${error.message}`);
        const dbEndpoint = v?.token ?? null;
        const dbProvider = detectProvider(dbEndpoint);
        const dbIsActive = v?.is_active ?? null;
        const match = !!swEndpoint && !!dbEndpoint && swEndpoint === dbEndpoint;
        const permission = Notification?.permission;
        const ua = navigator.userAgent;
        if (!swEndpoint) notes.push("SW subscription non trovata su questo device (getSubscription() = null).");
        if (!dbEndpoint) notes.push("Nessuna subscription Apple/FCM registrata in DB per l'utente.");
        if (swEndpoint && dbEndpoint && !match) notes.push("ATTENZIONE: endpoint SW ≠ endpoint DB (device non allineato al record più recente).");
        if (mounted) {
          setInfo({
            swReady: !!reg,
            swEndpoint,
            swProvider,
            dbEndpoint,
            dbProvider,
            dbIsActive,
            match,
            permission,
            ua,
            scope,
            notes
          });
        }
      } catch (e) {
        if (mounted) setInfo((old) => ({ ...old, notes: [...old.notes ?? [], `Runtime error: ${e?.message ?? e}`] }));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);
  const Badge = ({ label }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-xs bg-slate-700/60", children: label ?? "—" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-xl border border-slate-700/40 bg-slate-800/40 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mb-3", children: "Audit flusso Push (read-only)" }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm opacity-80", children: "⏳ Raccolta dati…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-40 opacity-70", children: "Permesso iOS/Browser" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { label: info.permission })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-40 opacity-70", children: "SW Endpoint (device)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 break-all", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1", children: info.swEndpoint ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-70", children: "Provider" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { label: info.swProvider ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "opacity-70 mt-1", children: [
            "Scope: ",
            info.scope ?? "—"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-40 opacity-70", children: "DB Endpoint (latest)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 break-all", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1", children: info.dbEndpoint ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-70", children: "Provider" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { label: info.dbProvider ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-70", children: "is_active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { label: info.dbIsActive === true ? "TRUE" : info.dbIsActive === false ? "FALSE" : "—" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-40 opacity-70", children: "Match DB ↔ Device" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { label: info.match ? "MATCH" : "NO MATCH" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-40 opacity-70", children: "User-Agent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 break-all", children: info.ua })
      ] }),
      !!info.notes?.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 p-2 rounded bg-amber-500/10 border border-amber-400/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium mb-1", children: "Note" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc pl-5 space-y-1", children: info.notes.map((n, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: n }, i)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-60 mt-3", children: "Component read-only. Nessuna modifica alla catena push." })
  ] });
}

export { PushInspector as default };
