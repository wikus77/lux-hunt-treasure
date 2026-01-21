import { j as jsxRuntimeExports } from './ui-vendor.sKtoNQj2.js';
import { r as reactExports } from './react-vendor.FGvtrp7q.js';
import { s as supabase, u as useLocation, B as Button, bD as ArrowLeft, W as Card, ac as CardHeader, ae as CardTitle, bs as Send, ai as CardContent, aw as Label, K as Input, N as Textarea, m as ue } from './index.C8SyQ7Ep.js';
import { T as TestTube } from './test-tube.BW7dQTkK.js';
import './supabase-vendor.DVELIqeo.js';
import './animation-vendor.BT4oAzOt.js';
import './stripe-vendor.C-6aXM1t.js';
import './map-vendor.DftgD3cK.js';
import './router-vendor.Bb8w37VQ.js';

const SAFE_HEADERS = {
  "Content-Type": "application/json",
  "X-M1-Dropper-Version": "v1",
  "X-Client-Info": "m1ssion-pwa"
};
async function invokePushFunction(fn, payload) {
  try {
    const { data, error } = await supabase.functions.invoke(fn, {
      body: payload,
      headers: SAFE_HEADERS
    });
    if (error) {
      throw new Error(error.message || `Error calling ${fn}`);
    }
    return data;
  } catch (error) {
    throw error;
  }
}

function AdminPushConsolePage() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = reactExports.useState("");
  const [body, setBody] = reactExports.useState("");
  const [image, setImage] = reactExports.useState("");
  const [deepLink, setDeepLink] = reactExports.useState("");
  const [badge, setBadge] = reactExports.useState("");
  const [testToken, setTestToken] = reactExports.useState("");
  const [isSending, setIsSending] = reactExports.useState(false);
  const handleSendTest = async () => {
    if (!title.trim() || !body.trim()) {
      ue.error("Titolo e messaggio sono obbligatori");
      return;
    }
    if (!testToken.trim()) {
      ue.error("Token test è obbligatorio per il test");
      return;
    }
    setIsSending(true);
    try {
      const result = await invokePushFunction("push_test", {
        token: testToken.trim(),
        payload: {
          title: title.trim(),
          body: body.trim(),
          image: image.trim() || null,
          deepLink: deepLink.trim() || null,
          badge: badge.trim() || null
        }
      });
      if (result.ok) {
        ue.success("✅ Test inviato con successo!");
      } else {
        ue.error(`❌ Test fallito: ${result.error || "Errore sconosciuto"}`);
      }
    } catch (error) {
      ue.error(`❌ Errore test: ${error.message || "Errore di rete"}`);
    } finally {
      setIsSending(false);
    }
  };
  const handleSendBroadcast = async () => {
    if (!title.trim() || !body.trim()) {
      ue.error("Titolo e messaggio sono obbligatori");
      return;
    }
    const confirmed = window.confirm(
      "Sei sicuro di voler inviare una notifica broadcast a tutti gli utenti? Questa azione non può essere annullata."
    );
    if (!confirmed) return;
    setIsSending(true);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        image: image.trim() || null,
        deepLink: deepLink.trim() || null,
        badge: badge.trim() || null,
        testToken: testToken.trim() || null
      };
      const result = await invokePushFunction("push_admin_broadcast", payload);
      if (result.ok) {
        ue.success(`✅ Broadcast inviato! ${result.sent}/${result.sent + result.failed} device raggiunti`);
        setTitle("");
        setBody("");
        setImage("");
        setDeepLink("");
        setBadge("");
        setTestToken("");
      } else {
        ue.error(`❌ Broadcast fallito: ${result.error || "Errore sconosciuto"}`);
      }
    } catch (error) {
      ue.error(`❌ Errore broadcast: ${error.message || "Errore di rete"}`);
    } finally {
      setIsSending(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto p-6 max-w-4xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          onClick: () => setLocation("/admin/mission-panel"),
          className: "flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Torna al Panel"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink bg-clip-text text-transparent", children: "Admin Push Console" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Invio notifiche push broadcast - Solo Amministratori" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-5 w-5" }),
        "Notifica Push Broadcast"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "title", children: "Titolo *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "title",
                value: title,
                onChange: (e) => setTitle(e.target.value),
                placeholder: "Titolo della notifica",
                maxLength: 100
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "badge", children: "Badge" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "badge",
                value: badge,
                onChange: (e) => setBadge(e.target.value),
                placeholder: "Numero badge (opzionale)",
                type: "number",
                min: "0"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "body", children: "Messaggio *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: "body",
              value: body,
              onChange: (e) => setBody(e.target.value),
              placeholder: "Contenuto della notifica",
              maxLength: 500,
              rows: 3
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "image", children: "URL Immagine" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "image",
                value: image,
                onChange: (e) => setImage(e.target.value),
                placeholder: "https://example.com/image.jpg",
                type: "url"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "deepLink", children: "Deep Link" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "deepLink",
                value: deepLink,
                onChange: (e) => setDeepLink(e.target.value),
                placeholder: "/buzz, /map, /profile..."
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "testToken", children: "Token Test Device" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: "testToken",
              value: testToken,
              onChange: (e) => setTestToken(e.target.value),
              placeholder: "Token FCM o WebPush endpoint per test (opzionale)",
              rows: 2
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Se fornito, verrà utilizzato anche per il test prima del broadcast" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 pt-4 border-t", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: handleSendTest,
              disabled: isSending || !title.trim() || !body.trim() || !testToken.trim(),
              variant: "outline",
              className: "flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "h-4 w-4" }),
                isSending ? "Invio Test..." : "Invia Test"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: handleSendBroadcast,
              disabled: isSending || !title.trim() || !body.trim(),
              className: "flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
                isSending ? "Invio Broadcast..." : "Invia Broadcast Admin"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Il broadcast raggiungerà tutti i device registrati con notifiche attive" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Il test invia solo al token specificato sopra" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• I deep link permettono di aprire sezioni specifiche dell'app" })
        ] })
      ] })
    ] })
  ] });
}

export { AdminPushConsolePage as default };
