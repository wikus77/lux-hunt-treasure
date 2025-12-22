import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { v as Card, A as CardHeader, H as CardTitle, O as CardContent, a5 as Badge, B as Button } from './index.BEQCqgv7.js';
import './react-vendor.CAU3V3le.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

function M1ssionPushTest() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "M1SSION™ Push Test (Placeholder)" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Pagina placeholder per sbloccare la build. Usa il Push Center per i test completi." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Ready" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        onClick: () => {
          try {
            Notification?.requestPermission?.();
          } catch {
          }
        },
        children: "Request Notification Permission"
      }
    )
  ] });
}

export { M1ssionPushTest as default };
