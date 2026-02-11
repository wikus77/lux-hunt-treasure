import { B as Button, _ as __vitePreload } from './index.CUdqZWfi.js';
import { r as reactExports, j as jsxRuntimeExports } from './animation-vendor.BiI6PE8T.js';
import { e as enablePush } from './enablePush.CuS8GuzD.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';
import './webPushManager.CtKFuVbO.js';

async function loadKeyAndConv() {
  const mod = await __vitePreload(() => import('./vapid-loader.Dvqe_4zt.js'),true?[]:void 0);
  const loadKey = mod.loadVAPIDPublicKey;
  const convName = "urlBase64ToUint8Array";
  const toU8 = mod[convName];
  return { loadKey, toU8 };
}
function PushDebug() {
  const [preview, setPreview] = reactExports.useState("…");
  const [status, setStatus] = reactExports.useState("");
  reactExports.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { loadKey } = await loadKeyAndConv();
        const k = await loadKey();
        if (alive && typeof k === "string") setPreview(String(k).slice(0, 20) + "…");
      } catch {
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  const onEnable = async () => {
    try {
      setStatus("Enabling…");
      await enablePush();
      setStatus("Enabled ✅");
    } catch (e) {
      setStatus("Error: " + (e?.message || String(e)));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Push Debug (Guard-safe)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
      "Public key preview: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: preview })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onEnable, children: "Enable Push" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: status })
    ] })
  ] });
}

export { PushDebug as default };
