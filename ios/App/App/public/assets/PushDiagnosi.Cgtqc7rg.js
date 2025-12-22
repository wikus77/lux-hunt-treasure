import { _ as __vitePreload } from './three-vendor.B3e0mz6d.js';
import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { aH as useAuth, be as Helmet, av as UnifiedHeader, B as Button, bi as House, v as Card, O as CardContent, ak as CircleCheckBig, o as TriangleAlert, an as CircleX, x as RefreshCw, a5 as Badge, a4 as LoaderCircle, A as CardHeader, H as CardTitle, s as supabase } from './index.BEQCqgv7.js';
import { m as motion } from './animation-vendor.BBMfCuXy.js';
import './supabase-vendor.Be5pfGoK.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

function PushDiagnosi() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = reactExports.useState(false);
  const [results, setResults] = reactExports.useState([]);
  const [summary, setSummary] = reactExports.useState({
    success: 0,
    warnings: 0,
    errors: 0
  });
  const runDiagnostics = async () => {
    setResults([]);
    setSummary({ success: 0, warnings: 0, errors: 0 });
    setIsRunning(true);
    const newResults = [];
    try {
      newResults.push({
        step: "1/10",
        status: "success",
        message: "Controllo supporto Push API",
        details: "Verifica se il browser supporta le notifiche push..."
      });
      if (!("Notification" in window)) {
        newResults.push({
          step: "1/10",
          status: "error",
          message: "Push API non supportato",
          details: "Il tuo browser non supporta le notifiche push"
        });
        setResults(newResults);
        return;
      }
      if (!("serviceWorker" in navigator)) {
        newResults.push({
          step: "1/10",
          status: "error",
          message: "Service Worker non supportato",
          details: "Il tuo browser non supporta i Service Workers"
        });
        setResults(newResults);
        return;
      }
      newResults.push({
        step: "1/10",
        status: "success",
        message: "✓ Push API supportato",
        details: "Browser compatibile con notifiche push"
      });
      const permission = Notification.permission;
      if (permission === "denied") {
        newResults.push({
          step: "2/10",
          status: "error",
          message: "✗ Permesso negato",
          details: "Le notifiche sono bloccate. Vai nelle impostazioni del browser per abilitarle."
        });
      } else if (permission === "default") {
        newResults.push({
          step: "2/10",
          status: "warning",
          message: "⚠ Permesso non richiesto",
          details: 'Usa il bottone "Ripara notifiche" per richiedere il permesso'
        });
      } else {
        newResults.push({
          step: "2/10",
          status: "success",
          message: "✓ Permesso concesso",
          details: `Stato permesso: ${permission}`
        });
      }
      const registrations = await navigator.serviceWorker.getRegistrations();
      const mainReg = registrations.find((r) => r.active?.scriptURL.includes("/sw.js"));
      if (registrations.length === 0) {
        newResults.push({
          step: "3/10",
          status: "warning",
          message: "⚠ Nessun SW registrato",
          details: 'Usa "Ripara notifiche" per registrare /sw.js'
        });
      } else if (registrations.length > 1) {
        newResults.push({
          step: "3/10",
          status: "warning",
          message: `⚠ ${registrations.length} SW registrati`,
          details: "Rilevati SW multipli. Consigliato mantenere solo /sw.js"
        });
      } else if (mainReg) {
        newResults.push({
          step: "3/10",
          status: "success",
          message: "✓ SW corretto attivo",
          details: `Scope: ${mainReg.scope}, State: ${mainReg.active?.state}`
        });
      } else {
        newResults.push({
          step: "3/10",
          status: "error",
          message: "✗ SW non corretto",
          details: `SW attivo: ${registrations[0]?.active?.scriptURL || "unknown"}`
        });
      }
      try {
        const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await __vitePreload(async () => { const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await import('./vapid-loader.Dvqe_4zt.js');return { loadVAPIDPublicKey, urlBase64ToUint8Array }},true?[]:void 0);
        const vapidKey = await loadVAPIDPublicKey();
        const vapidArray = urlBase64ToUint8Array(vapidKey);
        newResults.push({
          step: "4/10",
          status: "success",
          message: "✓ VAPID key valida",
          details: `Length: ${vapidArray.length} bytes, Prefix: 0x${vapidArray[0].toString(16)}`
        });
      } catch (error) {
        newResults.push({
          step: "4/10",
          status: "error",
          message: "✗ VAPID key non valida",
          details: error.message
        });
        setResults(newResults);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        newResults.push({
          step: "5/10",
          status: "error",
          message: "✗ JWT mancante",
          details: "Sessione non valida. Effettua il login."
        });
        setResults(newResults);
        return;
      }
      newResults.push({
        step: "5/10",
        status: "success",
        message: "✓ JWT presente",
        details: `User ID: ${session.user?.id?.substring(0, 8)}...`
      });
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        newResults.push({
          step: "6/10",
          status: "warning",
          message: "⚠ Nessuna subscription",
          details: 'Usa "Ripara notifiche" per creare una subscription'
        });
      } else {
        const platform = subscription.endpoint.includes("web.push.apple.com") ? "iOS" : "Web";
        newResults.push({
          step: "6/10",
          status: "success",
          message: "✓ Subscription presente",
          details: `Platform: ${platform}, Endpoint: ${subscription.endpoint.substring(0, 50)}...`
        });
      }
      try {
        const testBody = subscription ? {
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys,
          provider: "webpush",
          platform: subscription.endpoint.includes("web.push.apple.com") ? "ios" : "web",
          ua: navigator.userAgent
        } : { test: true };
        const { data, error } = await supabase.functions.invoke("webpush-upsert", {
          body: testBody
        });
        if (error) {
          newResults.push({
            step: "7/10",
            status: "error",
            message: "✗ Errore backend",
            details: error.message
          });
        } else {
          newResults.push({
            step: "7/10",
            status: "success",
            message: "✓ Backend raggiungibile",
            details: `Response OK`
          });
        }
      } catch (error) {
        newResults.push({
          step: "7/10",
          status: "error",
          message: "✗ Errore connessione",
          details: error.message
        });
      }
      try {
        const { count, error } = await supabase.from("webpush_subscriptions").select("*", { count: "exact", head: true }).eq("user_id", user?.id || "").eq("is_active", true);
        if (error) {
          newResults.push({
            step: "8/10",
            status: "warning",
            message: "⚠ Errore query database",
            details: error.message
          });
        } else {
          newResults.push({
            step: "8/10",
            status: count && count > 0 ? "success" : "warning",
            message: count && count > 0 ? "✓ Subscriptions attive" : "⚠ Nessuna subscription nel DB",
            details: `Count: ${count || 0}`
          });
        }
      } catch (error) {
        newResults.push({
          step: "8/10",
          status: "warning",
          message: "⚠ Query non eseguita",
          details: error.message
        });
      }
      const isIOSSafari = navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome") && /iPhone|iPad|iPod/.test(navigator.userAgent);
      const isPWA = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
      let platformStatus = "success";
      let platformMessage = "✓ Piattaforma supportata";
      let platformDetails = `Browser: ${navigator.userAgent.substring(0, 50)}...`;
      if (isIOSSafari && !isPWA) {
        platformStatus = "warning";
        platformMessage = "⚠ iOS Safari";
        platformDetails = "Su iOS Safari, installa l'app alla Home Screen (PWA) per ricevere notifiche (iOS 16.4+)";
      }
      newResults.push({
        step: "9/10",
        status: platformStatus,
        message: platformMessage,
        details: platformDetails
      });
      newResults.push({
        step: "10/10",
        status: "success",
        message: "✓ Diagnosi completata",
        details: "Controlla i risultati sopra per eventuali problemi"
      });
    } catch (error) {
      newResults.push({
        step: "ERROR",
        status: "error",
        message: "✗ Errore durante la diagnosi",
        details: error.message
      });
    } finally {
      setResults(newResults);
      setIsRunning(false);
      const successCount = newResults.filter((r) => r.status === "success").length;
      const warningCount = newResults.filter((r) => r.status === "warning").length;
      const errorCount = newResults.filter((r) => r.status === "error").length;
      setSummary({
        success: successCount,
        warnings: warningCount,
        errors: errorCount
      });
    }
  };
  reactExports.useEffect(() => {
    runDiagnostics();
  }, []);
  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-5 h-5 text-green-400" });
      case "error":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-5 h-5 text-red-400" });
      case "warning":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-yellow-400" });
    }
  };
  const getStatusBadge = (status) => {
    const colors = {
      success: "bg-green-500/20 text-green-400 border-green-500/50",
      error: "bg-red-500/20 text-red-400 border-red-500/50",
      warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
    };
    return colors[status];
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Helmet, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("title", { children: "M1SSION™ - Diagnosi Push Notifications" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UnifiedHeader, { profileImage: null }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "px-4 py-8",
        style: {
          paddingTop: "calc(72px + 47px + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              className: "mb-8",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "🔍 Diagnosi Push Notifications" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400", children: "Controllo completo della configurazione push" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      onClick: () => window.location.href = "/panel-access",
                      variant: "outline",
                      className: "border-cyan-500/50 text-cyan-400",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "w-4 h-4 mr-2" }),
                        "Panel"
                      ]
                    }
                  )
                ] }),
                !isRunning && results.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-black/40 border-cyan-500/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 text-green-400" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-medium", children: summary.success }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-sm", children: "Successi" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-yellow-400" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-medium", children: summary.warnings }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-sm", children: "Warning" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-400" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-medium", children: summary.errors }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-sm", children: "Errori" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      onClick: runDiagnostics,
                      variant: "outline",
                      size: "sm",
                      className: "border-cyan-500/50 text-cyan-400",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2" }),
                        "Riesegui"
                      ]
                    }
                  )
                ] }) }) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            results.map((result, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, x: -20 },
                animate: { opacity: 1, x: 0 },
                transition: { delay: index * 0.05 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `bg-black/40 border ${result.status === "success" ? "border-green-500/30" : result.status === "error" ? "border-red-500/30" : "border-yellow-500/30"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5", children: getStatusIcon(result.status) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        {
                          variant: "outline",
                          className: `text-xs ${getStatusBadge(result.status)}`,
                          children: result.step
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-medium", children: result.message })
                    ] }),
                    result.details && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-sm mt-1 break-words", children: result.details })
                  ] })
                ] }) }) })
              },
              index
            )),
            isRunning && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                className: "flex items-center justify-center py-8",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 animate-spin text-cyan-400" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-white", children: "Esecuzione diagnosi..." })
                ]
              }
            )
          ] }),
          !isRunning && results.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { delay: 0.5 },
              className: "mt-8",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-black/40 border-blue-500/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-blue-400 text-lg", children: "💡 Suggerimenti" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-300", children: [
                    "• Se vedi errori o warning, usa il bottone ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Ripara notifiche"' }),
                    " nel Push Center"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-300", children: "• Su iOS Safari, installa l'app alla Home Screen (PWA) per abilitare le notifiche" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-300", children: "• Se il permesso è negato, vai nelle impostazioni del browser per ripristinarlo" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-300", children: [
                    "• Mantieni attivo solo il Service Worker ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "/sw.js" })
                  ] })
                ] })
              ] })
            }
          )
        ] })
      }
    )
  ] });
}

export { PushDiagnosi as default };
