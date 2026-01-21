import { j as jsxRuntimeExports } from './ui-vendor.sKtoNQj2.js';
import { W as Card, ac as CardHeader, ae as CardTitle, ai as CardContent, au as Badge, B as Button } from './index.C8SyQ7Ep.js';
import './react-vendor.FGvtrp7q.js';
import './supabase-vendor.DVELIqeo.js';
import './animation-vendor.BT4oAzOt.js';
import './stripe-vendor.C-6aXM1t.js';
import './map-vendor.DftgD3cK.js';
import './router-vendor.Bb8w37VQ.js';

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
