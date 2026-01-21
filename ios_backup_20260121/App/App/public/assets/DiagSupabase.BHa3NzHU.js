import { j as jsxRuntimeExports } from './ui-vendor.sKtoNQj2.js';
import { c as React } from './react-vendor.FGvtrp7q.js';
import { s as supabase } from './index.C8SyQ7Ep.js';
import './supabase-vendor.DVELIqeo.js';
import './animation-vendor.BT4oAzOt.js';
import './stripe-vendor.C-6aXM1t.js';
import './map-vendor.DftgD3cK.js';
import './router-vendor.Bb8w37VQ.js';

let _instanceCount = 0;
let _lastInitStack = "";
function getSupabaseDiag() {
  return {
    count: _instanceCount,
    lastInitStack: _lastInitStack,
    env: {
      mode: "production",
      dev: false,
      prod: true
    }
  };
}

function DiagSupabase() {
  const [rpcHealth, setRpcHealth] = React.useState(null);
  const [rpcError, setRpcError] = React.useState(null);
  React.useEffect(() => {
    void supabase.auth.getSession();
  }, []);
  React.useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.rpc("supabase_client_health");
        if (error) {
          setRpcError(error.message);
        } else {
          setRpcHealth(data);
        }
      } catch (err) {
        setRpcError(err?.message || String(err));
      }
    })();
  }, []);
  const diag = getSupabaseDiag();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: 24, fontFamily: "ui-sans-serif, system-ui", maxWidth: 800 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: 24, fontWeight: "bold", marginBottom: 16 }, children: "🔍 Supabase Runtime Diagnostics" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 24 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: 18, fontWeight: 600, marginBottom: 8 }, children: "Client Instances" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Count:" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#ef4444",
          fontWeight: "bold",
          fontSize: 20
        }, children: diag.count })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { marginTop: 4, color: "#6b7280" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Expected:" }),
        " count === 1 (singleton pattern)"
      ] }),
      diag.count > 1
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 24 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: 18, fontWeight: 600, marginBottom: 8 }, children: "Environment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { style: { listStyle: "none", padding: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Mode:" }),
          " ",
          diag.env.mode
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Dev:" }),
          " ",
          String(diag.env.dev)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Prod:" }),
          " ",
          String(diag.env.prod)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { style: { margin: "24px 0", border: "none", borderTop: "1px solid #e5e7eb" } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: 18, fontWeight: 600, marginBottom: 8 }, children: "Supabase Health (RPC)" }),
      rpcError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        padding: 12,
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 4,
        color: "#991b1b"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Error:" }),
        " ",
        rpcError
      ] }) : rpcHealth ? /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { style: {
        whiteSpace: "pre-wrap",
        backgroundColor: "#f3f4f6",
        padding: 12,
        borderRadius: 4,
        fontSize: 13,
        overflow: "auto"
      }, children: JSON.stringify(rpcHealth, null, 2) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280" }, children: "Loading health metrics..." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 24, padding: 12, backgroundColor: "#f0fdf4", borderRadius: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: 14, color: "#166534" }, children: [
      "ℹ️ This page verifies that the Supabase client is a proper singleton. Navigate through the app and return here — the count should remain ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "1" }),
      "."
    ] }) })
  ] });
}

export { DiagSupabase as default };
