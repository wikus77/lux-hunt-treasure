import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { aH as useAuth, v as Card, A as CardHeader, H as CardTitle, O as CardContent, a7 as Label, I as Input, aW as Checkbox, B as Button, e as ue } from './index.BEQCqgv7.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

function PushTest() {
  const { user } = useAuth();
  const [title, setTitle] = reactExports.useState("⚡️ M1SSION – Test Push");
  const [body, setBody] = reactExports.useState("Test notifica push da pannello dev.");
  const [deeplink, setDeeplink] = reactExports.useState("/profile");
  const [bypassQuietHours, setBypassQuietHours] = reactExports.useState(true);
  const [adminToken, setAdminToken] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (user && user.email !== "wikus77@hotmail.it") {
      window.location.href = "/";
    }
  }, [user]);
  if (!user || user.email !== "wikus77@hotmail.it") {
    return null;
  }
  const handleSendPush = async () => {
    if (!adminToken.trim()) {
      ue.error("❌ Inserisci il token admin");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const functionsBaseUrl = "https://vkjrqirvdvjbemsfzxof.supabase.co"?.replace(/\/$/, "") || "";
      const response = await fetch(
        `${functionsBaseUrl}/functions/v1/webpush-targeted-send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": adminToken
          },
          body: JSON.stringify({
            user_ids: ["495246c1-9154-4f01-a428-7f37fe230180"],
            payload: {
              title,
              body,
              url: deeplink
            }
          })
        }
      );
      const data = await response.json();
      setResult(data);
      if (response.ok && data.success) {
        ue.success(`✅ Push inviato: ${data.sent}/${data.total}`);
      } else {
        ue.error(`❌ Errore: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      setResult({ error: error.message });
      ue.error(`❌ Errore: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto p-6 max-w-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "🧪 Push Test Panel (MCP Only)" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "adminToken", children: "🔑 Admin Token (PUSH_ADMIN_TOKEN)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "adminToken",
            type: "password",
            value: adminToken,
            onChange: (e) => setAdminToken(e.target.value),
            placeholder: "Inserisci token admin da Supabase secrets"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Trovalo in: Supabase Dashboard → Edge Functions → Secrets → PUSH_ADMIN_TOKEN" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "title", children: "Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "title",
            value: title,
            onChange: (e) => setTitle(e.target.value),
            placeholder: "Notification title"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "body", children: "Body" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "body",
            value: body,
            onChange: (e) => setBody(e.target.value),
            placeholder: "Notification body"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "deeplink", children: "Deeplink" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "deeplink",
            value: deeplink,
            onChange: (e) => setDeeplink(e.target.value),
            placeholder: "/profile"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Checkbox,
          {
            id: "quiet",
            checked: bypassQuietHours,
            onCheckedChange: (checked) => setBypassQuietHours(checked)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "quiet", className: "text-sm", children: "Bypass quiet hours" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleSendPush,
          disabled: loading || !adminToken.trim(),
          className: "w-full",
          children: loading ? "⏳ Invio..." : "📤 Invia a MCP (495246c1...)"
        }
      ),
      !adminToken.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-yellow-500 text-center", children: "⚠️ Inserisci il token admin per abilitare l'invio" }),
      result && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-4 bg-muted rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-2", children: "📊 Result:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-xs overflow-auto", children: JSON.stringify(result, null, 2) })
      ] })
    ] })
  ] }) });
}

export { PushTest as default };
