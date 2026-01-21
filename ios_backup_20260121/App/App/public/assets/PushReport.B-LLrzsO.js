import { j as jsxRuntimeExports } from './ui-vendor.sKtoNQj2.js';
import { r as reactExports } from './react-vendor.FGvtrp7q.js';
import { B as Button, W as Card, ac as CardHeader, ae as CardTitle, au as Badge, ai as CardContent, s as supabase, m as ue } from './index.C8SyQ7Ep.js';
import './supabase-vendor.DVELIqeo.js';
import './animation-vendor.BT4oAzOt.js';
import './stripe-vendor.C-6aXM1t.js';
import './map-vendor.DftgD3cK.js';
import './router-vendor.Bb8w37VQ.js';

const PushReport = () => {
  const [report, setReport] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [testing, setTesting] = reactExports.useState(false);
  const generateReport = async () => {
    setLoading(true);
    try {
      const { data: subscriptions } = await supabase.from("push_subscriptions").select("endpoint, platform, endpoint_type, created_at, p256dh, auth").order("created_at", { ascending: false }).limit(10);
      let serviceWorkers = [];
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        serviceWorkers = registrations.map((reg) => ({
          scriptURL: reg.active?.scriptURL || "No active SW",
          state: reg.active?.state || "No active SW",
          scope: reg.scope
        }));
      }
      let vapidStatus = { valid: false, length: 0, error: "Not checked" };
      try {
        const response = await fetch("/vapid-public.txt");
        const vapidKey = await response.text();
        vapidStatus = {
          valid: vapidKey.length > 40,
          length: vapidKey.length,
          error: vapidKey.length > 40 ? void 0 : "Key too short"
        };
      } catch (error) {
        vapidStatus.error = error instanceof Error ? error.message : "Unknown error";
      }
      setReport({
        subscriptions: (subscriptions || []).map((sub) => ({
          ...sub,
          p256dh_length: sub.p256dh?.length || 0,
          auth_length: sub.auth?.length || 0
        })),
        canary_results: null,
        service_workers: serviceWorkers,
        vapid_status: vapidStatus
      });
    } catch (error) {
      ue.error("Errore generazione report");
    } finally {
      setLoading(false);
    }
  };
  const runCanaryTest = async () => {
    setTesting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke("send-push-canary", {
        body: {
          user_id: user?.id,
          title: "M1SSION™ Test",
          body: "Test push da report diagnostico",
          link: "https://m1ssion.eu/push-report",
          broadcast: false
        }
      });
      if (error) throw error;
      setReport((prev) => prev ? {
        ...prev,
        canary_results: {
          ...data,
          pass_rate: data.sent / (data.sent + data.failed) * 100 || 0
        }
      } : null);
      ue.success(`Test completato: ${data.sent} inviati, ${data.failed} falliti`);
    } catch (error) {
      ue.error("Errore test canary");
    } finally {
      setTesting(false);
    }
  };
  reactExports.useEffect(() => {
    generateReport();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "📊 Report Push Notifications" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: generateReport, disabled: loading, children: [
          loading ? "🔄" : "📊",
          " Aggiorna Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: runCanaryTest, disabled: testing || !report?.subscriptions.length, children: [
          testing ? "🔄" : "🧪",
          " Test Canary"
        ] })
      ] })
    ] }),
    !report ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse", children: "📊 Generazione report..." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          "🔑 Status VAPID",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: report.vapid_status.valid ? "default" : "destructive", children: report.vapid_status.valid ? "Valido" : "Errore" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Lunghezza chiave:" }),
            " ",
            report.vapid_status.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Status:" }),
            " ",
            report.vapid_status.valid ? "✅ OK" : "❌ Errore"
          ] }),
          report.vapid_status.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 text-red-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Errore:" }),
            " ",
            report.vapid_status.error
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "⚙️ Service Workers Registrati" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: report.service_workers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-yellow-400", children: "⚠️ Nessun Service Worker registrato" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: report.service_workers.map((sw, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Script:" }),
            " ",
            sw.scriptURL
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "State:" }),
            " ",
            sw.state
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Scope:" }),
            " ",
            sw.scope
          ] })
        ] }, index)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
          "📱 Subscriptions (",
          report.subscriptions.length,
          ")"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: report.subscriptions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-yellow-400", children: "⚠️ Nessuna subscription trovata" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: report.subscriptions.map((sub, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: sub.endpoint_type }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: sub.platform })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Endpoint:" }),
            " ",
            sub.endpoint.substring(0, 60),
            "..."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Keys:" }),
            " p256dh=",
            sub.p256dh_length,
            "B, auth=",
            sub.auth_length,
            "B",
            (sub.p256dh_length !== 88 || sub.auth_length !== 24) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400 ml-2", children: "⚠️ Lunghezza invalida" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Creata:" }),
            " ",
            new Date(sub.created_at).toLocaleDateString()
          ] })
        ] }, index)) }) })
      ] }),
      report.canary_results && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          "🧪 Risultati Test Canary",
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              variant: report.canary_results.pass_rate >= 99 ? "default" : "destructive",
              children: [
                report.canary_results.pass_rate.toFixed(1),
                "%"
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 mb-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-400", children: report.canary_results.sent }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: "Inviati" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-red-400", children: report.canary_results.failed }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: "Falliti" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: report.canary_results.total_processed }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: "Totale" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Dettagli per endpoint:" }),
            report.canary_results.results.map((result, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: result.endpoint_type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: result.status === "success" ? "default" : "destructive", children: result.status }),
              result.status_code && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "HTTP ",
                result.status_code
              ] }),
              result.error && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: result.error })
            ] }, index))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "🔧 Azioni Raccomandate" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
          !report.vapid_status.valid && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-400", children: "❌ Configurare correttamente le chiavi VAPID" }),
          report.service_workers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-yellow-400", children: "⚠️ Registrare Service Worker" }),
          report.subscriptions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-yellow-400", children: "⚠️ Creare almeno una subscription di test" }),
          report.canary_results && report.canary_results.pass_rate < 99 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-400", children: "❌ Investigare fallimenti nell'invio push" }),
          (!report.canary_results || report.canary_results.pass_rate >= 99) && report.subscriptions.length > 0 && report.vapid_status.valid && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-green-400", children: "✅ Sistema push funzionante correttamente" })
        ] }) })
      ] })
    ] })
  ] });
};

export { PushReport };
