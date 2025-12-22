import { _ as __vitePreload } from './three-vendor.B3e0mz6d.js';
import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { B as Button } from './index.BEQCqgv7.js';
import { e as enablePush } from './enablePush.Bj56GJ45.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

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
