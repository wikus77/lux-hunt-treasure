import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { s as supabase, aH as useAuth, a6 as useToast, v as Card, A as CardHeader, H as CardTitle, aI as Bell, O as CardContent, I as Input, r as Textarea, B as Button, aJ as Send } from './index.BEQCqgv7.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

async function sendAdminBroadcast(payload) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");
  const { data, error } = await supabase.functions.invoke("webpush-admin-broadcast", {
    body: payload
  });
  if (error) throw error;
  return data;
}

const SendNotificationPage = () => {
  const [title, setTitle] = reactExports.useState("");
  const [body, setBody] = reactExports.useState("");
  const [isSending, setIsSending] = reactExports.useState(false);
  useAuth();
  const { toast } = useToast();
  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast({
        title: "⚠️ Campi obbligatori",
        description: "Inserisci titolo e messaggio.",
        variant: "destructive"
      });
      return;
    }
    setIsSending(true);
    try {
      await supabase.from("admin_logs").insert({
        event_type: "webpush_admin_broadcast",
        note: `Admin Page Send - Title: ${title}, Body: ${body}`,
        context: "admin_page_notification"
      });
      const data = await sendAdminBroadcast({
        title: title.trim(),
        body: body.trim(),
        url: "/notifications",
        target: { all: true }
      });
      toast({
        title: "✅ Push notifica inviata",
        description: `Inviata a ${data?.success || 0}/${data?.total || 0} dispositivi`
      });
      setTitle("");
      setBody("");
    } catch (error) {
      if (error.message.includes("Unauthorized") || error.message.includes("401")) {
        toast({
          title: "❌ Accesso negato",
          description: "Solo gli admin possono inviare notifiche.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "❌ Errore invio",
          description: error.message || "Impossibile inviare la notifica.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSending(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pt-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-black/80 border-[#00D1FF]/30 backdrop-blur-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-2xl font-orbitron text-white flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-6 h-6 text-[#00D1FF]" }),
      "🔥 Firebase Push Notifications - M1SSION™"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-white/70 text-sm font-medium mb-2", children: "Titolo notifica Firebase" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: title,
              onChange: (e) => setTitle(e.target.value),
              placeholder: "Inserisci il titolo Firebase...",
              className: "bg-white/5 border-white/20 text-white placeholder:text-white/50",
              maxLength: 50
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/50 text-xs mt-1", children: [
            title.length,
            "/50 caratteri"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-white/70 text-sm font-medium mb-2", children: "Messaggio" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: body,
              onChange: (e) => setBody(e.target.value),
              placeholder: "Inserisci il messaggio della notifica Firebase...",
              className: "bg-white/5 border-white/20 text-white placeholder:text-white/50 min-h-[120px]",
              maxLength: 200
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/50 text-xs mt-1", children: [
            body.length,
            "/200 caratteri"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-orange-500/10 border border-orange-500/30 rounded-lg p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-orange-400 font-medium mb-2", children: "🔥 Anteprima notifica Firebase:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-black/50 rounded-lg p-3 border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 bg-orange-500 rounded-sm flex-shrink-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-black text-xs font-bold", children: "🔥" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-white font-medium text-sm", children: title || "Titolo notifica Firebase" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/70 text-sm", children: body || "Messaggio della notifica Firebase" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleSendNotification,
          disabled: isSending || !title.trim() || !body.trim(),
          className: "w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium",
          children: isSending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" }),
            "🔥 Invio Firebase in corso..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4 mr-2" }),
            "🔥 Invia notifica Firebase a tutti"
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/50 text-xs text-center", children: "🔥 La notifica verrà inviata tramite Firebase Cloud Messaging a tutti i dispositivi con token FCM attivi." })
    ] })
  ] }) }) });
};

export { SendNotificationPage as default };
