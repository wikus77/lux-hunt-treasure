import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { u as useFcm } from './useFcm.BkmHgguS.js';
import './index.BEQCqgv7.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

function FcmTest() {
  const [log, setLog] = reactExports.useState([]);
  const { status, error, token, generate, isSupported, permission } = useFcm("web-test");
  const push = (l) => setLog((x) => [...x, l]);
  reactExports.useEffect(() => {
    if (status === "loading") {
      push("🔄 Inizializzazione FCM...");
      push("• Carico Firebase v8 compat SDK...");
      push("• Registro Service Worker /firebase-messaging-sw.js...");
      push("• Richiedo permessi notifiche...");
      push("• Genero token con VAPID (22/08)...");
    } else if (status === "success" && token) {
      push("✅ FCM configurato con successo!");
      push(`🔑 Token: ${token.substring(0, 20)}...`);
      push("💾 Token salvato su Supabase");
      push("🎯 M1SSION™ FCM Ready!");
    } else if (status === "error" && error) {
      push(`❌ Errore FCM: ${error}`);
    }
  }, [status, error, token]);
  reactExports.useEffect(() => {
    push("🔧 M1SSION™ FCM Test - Build 22/08/2025");
    push(`📱 Browser Support: ${isSupported ? "✅" : "❌"}`);
    push(`🔔 Permissions: ${permission || "non richiesti"}`);
    if (token) {
      push(`🔑 Token cached: ${token.substring(0, 20)}...`);
    }
  }, [isSupported, permission, token]);
  const onClick = async () => {
    setLog([]);
    await generate();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { style: { padding: 24 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "🔔 M1SSION™ — Test Push (isolato)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Questa pagina serve SOLO per attivare le push senza toccare la tua UI." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, children: "Attiva e salva token" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { style: { marginTop: 16, background: "#111", color: "#0f0", padding: 16, borderRadius: 8 }, children: log.join("\n") })
  ] });
}

export { FcmTest as default };
