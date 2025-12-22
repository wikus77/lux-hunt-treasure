import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { u as useLocation, B as Button, aV as ArrowLeft, a7 as Label, W as Select, Y as SelectTrigger, _ as SelectValue, $ as SelectContent, a0 as SelectItem, I as Input, r as Textarea, aW as Checkbox, a4 as LoaderCircle, aJ as Send, e as ue, s as supabase } from './index.BEQCqgv7.js';
import { s as sendPushNotification, g as getSuggestion } from './api.DTyiylKT.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

function PushSenderPanel() {
  const [, setLocation] = useLocation();
  const [audience, setAudience] = reactExports.useState("targeted");
  const [userIds, setUserIds] = reactExports.useState("");
  const [title, setTitle] = reactExports.useState("");
  const [badge, setBadge] = reactExports.useState("");
  const [message, setMessage] = reactExports.useState("");
  const [imageUrl, setImageUrl] = reactExports.useState("");
  const [linkUrl, setLinkUrl] = reactExports.useState("");
  const [freeBuzz, setFreeBuzz] = reactExports.useState(false);
  const [freeBuzzMap, setFreeBuzzMap] = reactExports.useState(false);
  const [xpPoints, setXpPoints] = reactExports.useState("");
  const [markerLat, setMarkerLat] = reactExports.useState("");
  const [markerLng, setMarkerLng] = reactExports.useState("");
  const [adminToken, setAdminToken] = reactExports.useState("");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [lastResult, setLastResult] = reactExports.useState(null);
  const canSend = (title || message) && (audience !== "targeted" || userIds.trim());
  const handleSend = async () => {
    if (!canSend) {
      ue.error("Compila title o message. Per targeted, inserisci User ID.");
      return;
    }
    setIsLoading(true);
    setLastResult(null);
    try {
      const payload = {};
      if (title) payload.title = title;
      if (message) payload.body = message;
      if (badge !== "") payload.badge = Number(badge) || 0;
      if (imageUrl) payload.image = imageUrl;
      payload.data = {};
      if (linkUrl) payload.data.url = linkUrl;
      const extras = {};
      if (freeBuzz) extras.free_buzz = true;
      if (freeBuzzMap) extras.free_buzz_map = true;
      if (xpPoints) extras.xp_points = Number(xpPoints);
      if (markerLat && markerLng) extras.marker = { lat: markerLat, lng: markerLng };
      if (Object.keys(extras).length > 0) payload.data.extras = extras;
      let totalSent = 0;
      let totalFailed = 0;
      if (audience === "all") {
        if (!adminToken) {
          ue.error("Admin token richiesto per broadcast");
          setIsLoading(false);
          return;
        }
        const response = await sendPushNotification(
          { audience: "all", payload },
          { adminToken }
        );
        setLastResult(response);
        if (response.status === 200 || response.data.success) {
          totalSent = response.data.sent || response.data.total || 0;
          totalFailed = response.data.failed || 0;
          ue.success(`✅ Broadcast inviato: ${totalSent} sent, ${totalFailed} failed`);
        } else {
          ue.error(getSuggestion(response.data.error, response.status));
        }
      } else if (audience === "self") {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          ue.error("Non autenticato. Esegui login.");
          setIsLoading(false);
          return;
        }
        const response = await sendPushNotification(
          { audience: "all", payload },
          // self è gestito come all con JWT
          { userJWT: session.access_token }
        );
        setLastResult(response);
        if (response.status === 200 || response.data.success) {
          ue.success("✅ Push self inviata!");
        } else {
          ue.error(getSuggestion(response.data.error, response.status));
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          ue.error("Non autenticato. Esegui login.");
          setIsLoading(false);
          return;
        }
        const userIdList = userIds.split(",").map((s) => s.trim()).filter(Boolean);
        if (userIdList.length === 0) {
          ue.error("Inserisci almeno un User ID");
          setIsLoading(false);
          return;
        }
        const results = await Promise.allSettled(
          userIdList.map(
            (uid) => sendPushNotification(
              { audience: { user_id: uid }, payload },
              { userJWT: session.access_token }
            )
          )
        );
        results.forEach((r, i) => {
          if (r.status === "fulfilled") {
            if (r.value.status === 200 || r.value.data.success) {
              totalSent += r.value.data.sent || 1;
            } else {
              totalFailed++;
            }
          } else {
            totalFailed++;
          }
        });
        setLastResult({ status: 200, data: { sent: totalSent, failed: totalFailed } });
        ue.success(`✅ Targeted: ${totalSent} sent, ${totalFailed} failed`);
      }
    } catch (error) {
      ue.error(`Errore: ${error.message}`);
      setLastResult({ status: 0, data: { error: error.message } });
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          onClick: () => setLocation("/panel-access"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent", children: "🚀 Push Sender" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-sm", children: "Invio notifiche push (reuse existing logic)" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Audience" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: audience, onValueChange: (v) => setAudience(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "targeted", children: "Targeted (User IDs)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Broadcast (All)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "self", children: "Self Test" })
          ] })
        ] })
      ] }),
      audience === "targeted" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "User IDs (CSV)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "uuid1, uuid2, uuid3",
            value: userIds,
            onChange: (e) => setUserIds(e.target.value)
          }
        )
      ] }),
      audience === "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Admin Token" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "password",
            placeholder: "PUSH_ADMIN_TOKEN",
            value: adminToken,
            onChange: (e) => setAdminToken(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "🔔 Titolo notifica",
              value: title,
              onChange: (e) => setTitle(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Badge (numero)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              placeholder: "0",
              value: badge,
              onChange: (e) => setBadge(e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Message" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            placeholder: "Testo della notifica",
            value: message,
            onChange: (e) => setMessage(e.target.value),
            rows: 3
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Image URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "https://...",
            value: imageUrl,
            onChange: (e) => setImageUrl(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "/notifications",
            value: linkUrl,
            onChange: (e) => setLinkUrl(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-700 pt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-400", children: "Extras (opzionali)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                id: "freeBuzz",
                checked: freeBuzz,
                onCheckedChange: (c) => setFreeBuzz(!!c)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "freeBuzz", className: "cursor-pointer", children: "Free Buzz" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                id: "freeBuzzMap",
                checked: freeBuzzMap,
                onCheckedChange: (c) => setFreeBuzzMap(!!c)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "freeBuzzMap", className: "cursor-pointer", children: "Free Buzz Map" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "XP Points" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                placeholder: "0",
                value: xpPoints,
                onChange: (e) => setXpPoints(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Marker Lat" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "45.464",
                value: markerLat,
                onChange: (e) => setMarkerLat(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Marker Lng" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "9.190",
                value: markerLng,
                onChange: (e) => setMarkerLng(e.target.value)
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "w-full",
          onClick: handleSend,
          disabled: !canSend || isLoading,
          children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }),
            "Invio in corso..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4 mr-2" }),
            "Invia Push"
          ] })
        }
      ),
      lastResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-4 bg-gray-800/50 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Ultimo Esito:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-xs text-gray-300 overflow-auto", children: JSON.stringify(lastResult.data, null, 2) })
      ] })
    ] })
  ] }) });
}

export { PushSenderPanel as default };
