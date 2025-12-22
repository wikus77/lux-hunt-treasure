import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { s as supabase, e as ue } from './index.BEQCqgv7.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

function DeviceTokenDebug() {
  const [deviceTokens, setDeviceTokens] = reactExports.useState([]);
  const [testing, setTesting] = reactExports.useState(false);
  const [testResults, setTestResults] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const loadDeviceTokens = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("device_tokens").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) {
        ue.error("Errore caricamento token");
      } else {
        setDeviceTokens(data || []);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const registerTestToken = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        ue.error("Utente non autenticato");
        return;
      }
      const testPlayerId = `onesignal-test-${user.id}-${Date.now()}`;
      const { error } = await supabase.from("device_tokens").upsert({
        user_id: user.id,
        token: testPlayerId,
        device_type: "onesignal",
        device_info: { platform: "web", source: "debug_test", created: (/* @__PURE__ */ new Date()).toISOString() },
        is_active: true,
        last_used: (/* @__PURE__ */ new Date()).toISOString(),
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }, {
        onConflict: "user_id,device_type"
      });
      if (error) {
        ue.error("Errore registrazione token test");
      } else {
        ue.success("Token OneSignal test registrato!");
        loadDeviceTokens();
      }
    } catch (error) {
    }
  };
  const testPushNotification = async (testNumber) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || deviceTokens.length === 0) {
      ue.error("Nessun token device registrato");
      return;
    }
    setTesting(true);
    const testTitle = `🎯 M1SSION™ Test ${testNumber}`;
    const testBody = `Test push notification #${testNumber} - ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`;
    try {
      const { data, error } = await supabase.functions.invoke("send-push-notification", {
        body: {
          title: testTitle,
          body: testBody,
          target_user_id: user.id
        }
      });
      const result = {
        testNumber,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        success: !error && data?.success,
        data,
        error: error?.message,
        sent: data?.sent || 0,
        total: data?.total || 0
      };
      setTestResults((prev) => [result, ...prev]);
      if (error) {
        ue.error(`Test #${testNumber} fallito: ${error.message}`);
      } else {
        ue.success(`Test #${testNumber} inviato: ${data.sent}/${data.total} dispositivi`);
      }
    } catch (err) {
      ue.error(`Test #${testNumber} errore di sistema`);
    } finally {
      setTesting(false);
    }
  };
  const runAllTests = async () => {
    if (testing) return;
    setTestResults([]);
    for (let i = 1; i <= 3; i++) {
      await testPushNotification(i);
      if (i < 3) {
        await new Promise((resolve) => setTimeout(resolve, 2e3));
      }
    }
  };
  const checkOneSignalStatus = async () => {
    try {
      const utils = window.OneSignalUtils;
      if (utils) {
        const playerId = await utils.getPlayerId();
        const isSubscribed = await utils.isSubscribed();
        ue.success(`OneSignal: ${isSubscribed ? "Attivo" : "Non attivo"} - ID: ${playerId}`);
      } else {
        ue.warning("OneSignal non disponibile (environment dev)");
      }
    } catch (error) {
    }
  };
  reactExports.useEffect(() => {
    loadDeviceTokens();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 p-6 bg-gray-900 rounded-lg border border-gray-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-[#00D1FF] mb-4", children: "🔧 Push Notifications Debug" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold text-white mb-2", children: [
        "📱 Device Tokens (",
        deviceTokens.length,
        ")"
      ] }),
      deviceTokens.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-yellow-400", children: "⚠️ Nessun token registrato" }) : deviceTokens.map((token, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm bg-gray-800 p-2 rounded mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-400", children: "✅" }),
        " ",
        token.device_type,
        ": ",
        token.token.substring(0, 20),
        "...",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400 ml-2", children: [
          "(",
          new Date(token.created_at).toLocaleString(),
          ")"
        ] })
      ] }, index))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: loadDeviceTokens,
          disabled: loading,
          className: "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded",
          children: [
            loading ? "⏳" : "🔄",
            " Refresh Tokens"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: registerTestToken,
          className: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded",
          children: "🔧 Registra Token Test"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: checkOneSignalStatus,
          className: "bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded",
          children: "🔔 Check OneSignal"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => testPushNotification(1),
          disabled: testing || deviceTokens.length === 0,
          className: "bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded",
          children: "🚀 Test Push Singolo"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: runAllTests,
        disabled: testing || deviceTokens.length === 0,
        className: "bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded",
        children: "🎯 Run All Tests (3x Consecutive)"
      }
    ) }),
    testResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-white mb-2", children: "📊 Test Results" }),
      testResults.map((result, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-sm p-2 rounded mb-1 ${result.success ? "bg-green-900/30 border border-green-700" : "bg-red-900/30 border border-red-700"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: result.success ? "text-green-400" : "text-red-400", children: [
            result.success ? "✅" : "❌",
            " Test #",
            result.testNumber
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: new Date(result.timestamp).toLocaleTimeString() })
        ] }),
        result.success ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-gray-300 text-xs mt-1", children: [
          "Sent: ",
          result.sent,
          "/",
          result.total,
          " devices"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-red-300 text-xs mt-1", children: [
          "Error: ",
          result.error
        ] })
      ] }, index))
    ] }),
    testing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[#00D1FF] font-semibold mt-4", children: "🔄 Testing in progress..." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 text-xs text-gray-400 bg-gray-800 p-3 rounded", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "📍 Environment:" }),
        " ",
        window.location.hostname
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "🔔 OneSignal:" }),
        " ",
        window.location.hostname === "m1ssion.eu" ? "Produzione" : "Disabilitato (dev)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "🎯 Status:" }),
        " PWA pronta al 99% - Deploy su https://m1ssion.eu per test finali"
      ] })
    ] })
  ] });
}

function PushTest() {
  const [title, setTitle] = reactExports.useState("M1SSION™ Test");
  const [body, setBody] = reactExports.useState("Test push notification per iOS e Android");
  const [loading, setLoading] = reactExports.useState(false);
  const handleSendPush = async () => {
    if (!title || !body) {
      ue.error("Titolo e messaggio sono obbligatori");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        ue.error("❌ Devi essere loggato per testare le push");
        return;
      }
      const { data, error } = await supabase.functions.invoke("send-push-notification", {
        body: {
          title: title.trim(),
          body: body.trim(),
          target_user_id: user.id
        }
      });
      if (error) {
        ue.error(`❌ ERRORE: ${error.message}`);
      } else {
        if (data.success) {
          ue.success(`✅ SUCCESSO: Notifica inviata a ${data.sent}/${data.total} dispositivi`);
        } else {
          ue.error(`❌ ERRORE: ${data.message || "Invio fallito"}`);
        }
      }
    } catch (err) {
      ue.error("❌ ERRORE: Eccezione durante invio notifica");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-black text-white p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-center mb-8 text-[#00D1FF]", children: "🚨 Push Test M1SSION™" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-2", children: "Titolo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: title,
            onChange: (e) => setTitle(e.target.value),
            className: "w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white",
            placeholder: "Titolo notifica"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-2", children: "Messaggio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: body,
            onChange: (e) => setBody(e.target.value),
            className: "w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white h-24",
            placeholder: "Testo della notifica"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleSendPush,
          disabled: loading,
          className: `w-full py-3 px-6 rounded-lg font-bold ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-[#00D1FF] hover:bg-[#00A8CC] text-black"}`,
          children: loading ? "⏳ Invio..." : "🚀 INVIA PUSH OS-NATIVE"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 p-4 bg-gray-900 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2", children: "🔍 Test Checklist:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "📱 Lock screen iOS con suono e badge" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "🤖 Lock screen Android con suono" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "📩 Notifica in /notifications in-app" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "🔔 Real-time sync immediato" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeviceTokenDebug, {})
  ] }) });
}

export { PushTest as default };
