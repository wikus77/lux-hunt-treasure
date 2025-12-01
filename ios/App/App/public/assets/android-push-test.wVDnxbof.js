import { j as jsxRuntimeExports } from './ui-vendor.DoN6OTIp.js';
import { aB as Smartphone, aC as AndroidPushSetup, f as Button, aw as Send, aD as Bell, s as supabase, o as ue } from './index.B1pZJRDR.js';
import './react-vendor.CAU3V3le.js';
import './three-vendor.wwSanNQ8.js';
import './supabase-vendor.CghLtY7N.js';
import './animation-vendor.Bezovbgp.js';
import './map-vendor.Dz2XYzxS.js';
import './stripe-vendor.BaJG9Xy1.js';
import './router-vendor.opNAzTki.js';

function AndroidPushTest() {
  const sendTestNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        ue.error("Devi essere autenticato per testare le notifiche");
        return;
      }
      const { data, error } = await supabase.functions.invoke("send-push-notification", {
        body: {
          user_id: user.id,
          title: "🚀 Test M1SSION Android",
          body: "Notifica push di test per Android funzionante!"
        }
      });
      if (error) {
        console.error("Error sending test notification:", error);
        ue.error("Errore invio notifica test");
      } else {
        ue.success("📱 Notifica test inviata!");
      }
    } catch (error) {
      console.error("Error in sendTestNotification:", error);
      ue.error("Errore durante l'invio della notifica");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-black text-white p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto pt-safe-top", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-16 h-16 text-m1ssion-blue mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-2", children: "🔔 Push Android Test" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-300", children: "Testa le notifiche push native per Android" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AndroidPushSetup, { className: "mb-6" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: sendTestNotification,
          className: "w-full bg-gradient-to-r from-green-500 to-green-600 text-white",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4 mr-2" }),
            "Invia Notifica Test"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-4 h-4" }),
          "Come testare:"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "text-sm text-gray-300 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "1. Attiva le notifiche con il pulsante sopra" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "2. Invia una notifica test" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "3. Metti l'app in background" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "4. Dovresti ricevere la notifica" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2 text-m1ssion-blue", children: "📱 Requisiti Android:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-gray-300 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• App installata come APK" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Connessione internet attiva" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Permessi notifiche abilitati" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Google Play Services attivi" })
        ] })
      ] })
    ] })
  ] }) });
}

export { AndroidPushTest as default };
