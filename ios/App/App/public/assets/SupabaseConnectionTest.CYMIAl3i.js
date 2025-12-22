import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { B as Button, x as RefreshCw, v as Card, A as CardHeader, H as CardTitle, N as CardDescription, O as CardContent, bD as getSupabaseConfig, a5 as Badge, an as CircleX, o as TriangleAlert, bc as CircleCheck, s as supabase } from './index.BEQCqgv7.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

const SUPABASE_CONFIG = getSupabaseConfig();
function SupabaseConnectionTest() {
  const [status, setStatus] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const runTest = async () => {
    setLoading(true);
    const errors = [];
    const warnings = [];
    try {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      if (error) errors.push(`Database query failed: ${error.message}`);
    } catch (err) {
      errors.push(`Database connection error: ${err?.message || "Unknown error"}`);
    }
    const result = {
      connected: errors.length === 0,
      projectRef: SUPABASE_CONFIG.projectRef,
      url: SUPABASE_CONFIG.url,
      errors,
      warnings
    };
    setStatus(result);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    runTest();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "🔍 Supabase Connection Test" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2", children: "Post-Remix diagnostic tool" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: runTest, disabled: loading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}` }),
        "Re-test"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Current Configuration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Environment variables detected" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Project Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm mt-1", children: SUPABASE_CONFIG.projectRef })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm mt-1 truncate", title: SUPABASE_CONFIG.url, children: SUPABASE_CONFIG.url })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Anon Key" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm mt-1", children: `${SUPABASE_CONFIG.anonKey.substring(0, 20)}...`  })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Functions URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm mt-1 truncate", title: SUPABASE_CONFIG.functionsUrl, children: SUPABASE_CONFIG.functionsUrl || "❌ Not found" })
        ] })
      ] }) })
    ] }),
    status && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Connection Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: status.connected ? "default" : "destructive", children: status.connected ? "✅ Connected" : "❌ Disconnected" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        status.errors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-5 h-5 text-destructive" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-destructive", children: [
              "Errors (",
              status.errors.length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 ml-7", children: status.errors.map((error, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-destructive bg-destructive/10 p-3 rounded-md", children: error }, i)) })
        ] }),
        status.warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-yellow-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-yellow-500", children: [
              "Warnings (",
              status.warnings.length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 ml-7", children: status.warnings.map((warning, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-md", children: warning }, i)) })
        ] }),
        status.connected && status.errors.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-green-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-green-500", children: "All Checks Passed!" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground ml-7", children: "Your Supabase connection is configured correctly and working as expected." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Next Steps" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-sm", children: "✅ If all checks passed:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground ml-4", children: "Your migration is complete! The project is now connected to your personal Supabase." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-sm", children: "❌ If you see errors:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "text-sm text-muted-foreground ml-4 space-y-1 list-decimal list-inside", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "Go to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Settings → Tools → Supabase" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Verify your Supabase credentials are correct" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Try reconnecting the integration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Rebuild the project (automatic)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Return here and click "Re-test"' })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 p-4 bg-muted rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          "📖 For detailed migration instructions, see",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-background px-2 py-1 rounded", children: "SUPABASE_MIGRATION_GUIDE.md" })
        ] }) })
      ] })
    ] })
  ] }) });
}

export { SupabaseConnectionTest as default };
