import { B as Button, _ as __vitePreload } from './index.C8SyQ7Ep.js';
import { j as jsxRuntimeExports } from './ui-vendor.sKtoNQj2.js';
import { r as reactExports } from './react-vendor.FGvtrp7q.js';
import { e as enablePush } from './enablePush.C5yVx31d.js';
import './supabase-vendor.DVELIqeo.js';
import './animation-vendor.BT4oAzOt.js';
import './stripe-vendor.C-6aXM1t.js';
import './map-vendor.DftgD3cK.js';
import './router-vendor.Bb8w37VQ.js';

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
