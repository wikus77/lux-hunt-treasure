import { j as jsxRuntimeExports } from './ui-vendor.DoN6OTIp.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { u as useLocation, f as Button, av as ArrowLeft, C as Card, b as CardHeader, c as CardTitle, aw as Send, d as CardContent, L as Label, I as Input, T as Textarea, z as Users, ax as RadioGroup, ay as RadioGroupItem, $ as Select, a0 as SelectTrigger, a1 as SelectValue, a2 as SelectContent, a3 as SelectItem, az as TestTube, o as ue, aA as invokePushFunction } from './index.B1pZJRDR.js';
import './three-vendor.wwSanNQ8.js';
import './supabase-vendor.CghLtY7N.js';
import './animation-vendor.Bezovbgp.js';
import './map-vendor.Dz2XYzxS.js';
import './stripe-vendor.BaJG9Xy1.js';
import './router-vendor.opNAzTki.js';

function UserPushConsolePage() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = reactExports.useState("");
  const [body, setBody] = reactExports.useState("");
  const [image, setImage] = reactExports.useState("");
  const [deepLink, setDeepLink] = reactExports.useState("");
  const [badge, setBadge] = reactExports.useState("");
  const [testToken, setTestToken] = reactExports.useState("");
  const [audience, setAudience] = reactExports.useState("all");
  const [segment, setSegment] = reactExports.useState("active_24h");
  const [usersList, setUsersList] = reactExports.useState("");
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
      const payload = {
        token: testToken.trim(),
        payload: {
          title: title.trim(),
          body: body.trim(),
          image: image.trim() || null,
          deepLink: deepLink.trim() || null,
          badge: badge.trim() || null
        }
      };
      const result = await invokePushFunction("push_test", payload);
      if (result.ok) {
        ue.success("✅ Test inviato con successo!");
      } else {
        ue.error(`❌ Test fallito: ${result.error || "Errore sconosciuto"}`);
      }
    } catch (error) {
      console.error("Test push error:", error);
      ue.error(`❌ Errore test: ${error.message || "Errore di rete"}`);
    } finally {
      setIsSending(false);
    }
  };
  const handleSendToSelection = async () => {
    if (!title.trim() || !body.trim()) {
      ue.error("Titolo e messaggio sono obbligatori");
      return;
    }
    if (audience === "list" && !usersList.trim()) {
      ue.error('Lista utenti richiesta per audience "list"');
      return;
    }
    const confirmed = window.confirm(
      `Sei sicuro di voler inviare la notifica al target selezionato (${audience})? Questa azione non può essere annullata.`
    );
    if (!confirmed) return;
    setIsSending(true);
    try {
      const payload = {
        audience,
        payload: {
          title: title.trim(),
          body: body.trim(),
          image: image.trim() || null,
          deepLink: deepLink.trim() || null,
          badge: badge.trim() || null
        }
      };
      if (audience === "segment") {
        payload.filters = { segment };
      } else if (audience === "list") {
        const lines = usersList.trim().split("\n").map((line) => line.trim()).filter(Boolean);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmails = lines.every((line) => emailRegex.test(line));
        const isIds = lines.every((line) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(line));
        if (isEmails) {
          payload.filters = { emails: lines };
        } else if (isIds) {
          payload.filters = { ids: lines };
        } else {
          ue.error("Lista deve contenere solo email valide o UUID validi");
          return;
        }
      }
      const result = await invokePushFunction("push_send", payload);
      if (result.ok) {
        ue.success(`✅ Notifica inviata! ${result.sent}/${result.sent + result.failed} device raggiunti`);
        setTitle("");
        setBody("");
        setImage("");
        setDeepLink("");
        setBadge("");
        setTestToken("");
        setUsersList("");
      } else {
        ue.error(`❌ Invio fallito: ${result.error || "Errore sconosciuto"}`);
      }
    } catch (error) {
      console.error("Push send error:", error);
      ue.error(`❌ Errore invio: ${error.message || "Errore di rete"}`);
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink bg-clip-text text-transparent", children: "Push Console" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Invio notifiche push mirate - Segmenti e Liste" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-5 w-5" }),
          "Contenuto Notifica"
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
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5" }),
          "Selezione Target"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Audience" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(RadioGroup, { value: audience, onValueChange: (value) => setAudience(value), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "all", id: "all" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "all", children: "Tutti gli utenti" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "segment", id: "segment" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "segment", children: "Segmento specifico" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "list", id: "list" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "list", children: "Lista specifica (IDs o email)" })
              ] })
            ] })
          ] }),
          audience === "segment" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "segmentSelect", children: "Segmento" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: segment, onValueChange: (value) => setSegment(value), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "winners", children: "Vincitori" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active_24h", children: "Attivi ultime 24h" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ios", children: "iOS devices" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "android", children: "Android devices" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "webpush", children: "WebPush subscribers" })
              ] })
            ] })
          ] }),
          audience === "list" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "usersList", children: "Lista Utenti" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                id: "usersList",
                value: usersList,
                onChange: (e) => setUsersList(e.target.value),
                placeholder: "user@email.com\naltro@email.com\n\noppure:\n\n12345678-1234-1234-1234-123456789abc\n87654321-4321-4321-4321-cba987654321",
                rows: 6
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Un email o UUID per riga. Tutti devono essere dello stesso tipo." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
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
              onClick: handleSendToSelection,
              disabled: isSending || !title.trim() || !body.trim(),
              className: "flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
                isSending ? "Invio in corso..." : "Invia a Selezione"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-4 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Il test invia solo al token specificato sopra" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• L'invio a selezione rispetta l'audience e i filtri scelti" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• I segmenti filtrano automaticamente i device appropriati" })
        ] })
      ] }) })
    ] })
  ] });
}

export { UserPushConsolePage as default };
