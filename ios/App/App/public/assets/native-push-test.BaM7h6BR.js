import { j as jsxRuntimeExports } from './ui-vendor.DoN6OTIp.js';
import { aE as useNativePushNotifications, az as TestTube, B as Badge, aD as Bell, aF as PushNotificationSetup, C as Card, b as CardHeader, c as CardTitle, aw as Send, W as CardDescription, d as CardContent, f as Button, aG as Capacitor, s as supabase, o as ue } from './index.B1pZJRDR.js';
import './react-vendor.CAU3V3le.js';
import './three-vendor.wwSanNQ8.js';
import './supabase-vendor.CghLtY7N.js';
import './animation-vendor.Bezovbgp.js';
import './map-vendor.Dz2XYzxS.js';
import './stripe-vendor.BaJG9Xy1.js';
import './router-vendor.opNAzTki.js';

function NativePushTest() {
  const { platform, isRegistered, token } = useNativePushNotifications();
  const currentPlatform = Capacitor.getPlatform();
  const sendTestNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        ue.error("Devi essere autenticato per testare le notifiche");
        return;
      }
      ue.loading("Invio notifica di test...");
      const { data, error } = await supabase.functions.invoke("send-native-push", {
        body: {
          title: "🚀 Test M1SSION",
          body: `Notifica push ${platform} inviata con successo!`,
          data: {
            type: "test",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      });
      if (error) {
        console.error("Errore invio notifica:", error);
        ue.error("Errore nell'invio della notifica");
      } else {
        ue.success("Notifica di test inviata!");
        console.log("Test notification sent:", data);
      }
    } catch (error) {
      console.error("Errore:", error);
      ue.error("Errore nell'invio della notifica");
    }
  };
  const getPlatformIcon = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-6 h-6" });
  };
  const getPlatformName = () => {
    return "PWA Web";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mb-4", children: [
        getPlatformIcon(),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "w-6 h-6" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent", children: "Test Notifiche Push Native" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
          getPlatformIcon(),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1", children: getPlatformName() })
        ] }),
        isRegistered && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "default", className: "bg-green-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-3 h-3 mr-1" }),
          "Attive"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: [
        "Testa le notifiche push native per ",
        getPlatformName()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PushNotificationSetup, { className: "max-w-md mx-auto" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "max-w-md mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-5 h-5" }),
          "Test Notifica"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Invia una notifica di test al tuo dispositivo" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: sendTestNotification,
            disabled: !isRegistered,
            className: "w-full",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4 mr-2" }),
              "Invia Notifica di Test"
            ]
          }
        ),
        !isRegistered && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2 text-center", children: "Prima configura le notifiche push qui sopra" })
      ] })
    ] }),
    token && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "max-w-md mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Debug Info" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Platform:" }),
          " ",
          currentPlatform
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Registered:" }),
          " ",
          isRegistered ? "Sì" : "No"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs break-all", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Token:" }),
          " ",
          token.substring(0, 50),
          "..."
        ] })
      ] })
    ] })
  ] });
}

export { NativePushTest as default };
