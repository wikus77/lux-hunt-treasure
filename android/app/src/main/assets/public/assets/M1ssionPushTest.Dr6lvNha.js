import { j as jsxRuntimeExports } from './animation-vendor.BiI6PE8T.js';
import { W as Card, ac as CardHeader, ae as CardTitle, ai as CardContent, au as Badge, B as Button } from './index.CUdqZWfi.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

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
