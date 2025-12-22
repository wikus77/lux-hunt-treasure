import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { aH as useAuth, v as Card, A as CardHeader, H as CardTitle, O as CardContent, B as Button, s as supabase, e as ue } from './index.BEQCqgv7.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

const NotificationDebug = () => {
  const [isInitialized, setIsInitialized] = reactExports.useState(false);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [playerId, setPlayerId] = reactExports.useState(null);
  const [permission, setPermission] = reactExports.useState("default");
  const [deviceTokens, setDeviceTokens] = reactExports.useState([]);
  const [iosDebugInfo, setIosDebugInfo] = reactExports.useState({});
  const [workerStatus, setWorkerStatus] = reactExports.useState("checking");
  const [subscriptionStatus, setSubscriptionStatus] = reactExports.useState(false);
  const { user } = useAuth();
  const checkWorkerStatus = async () => {
    try {
      const workerResponse = await fetch("/OneSignalSDKWorker.js");
      const updaterResponse = await fetch("/OneSignalSDKUpdaterWorker.js");
      if (workerResponse.ok && updaterResponse.ok) {
        setWorkerStatus("✅ Worker files accessible");
      } else {
        setWorkerStatus("❌ Worker files missing");
      }
    } catch (error) {
      setWorkerStatus("❌ Worker check failed");
    }
  };
  const detectiOSEnvironment = () => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isStandalone = window.navigator.standalone === true;
    const isPWA = window.matchMedia("(display-mode: standalone)").matches;
    const iosInfo = {
      isIOS,
      isSafari,
      isStandalone,
      isPWA,
      userAgent,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      notificationSupport: "Notification" in window,
      serviceWorkerSupport: "serviceWorker" in navigator
    };
    setIosDebugInfo(iosInfo);
    return iosInfo;
  };
  const initializeOneSignal = async () => {
    try {
      if (typeof window === "undefined") {
        return false;
      }
      const iosInfo = detectiOSEnvironment();
      if (window.OneSignal) {
        try {
          await window.OneSignal.logout();
          delete window.OneSignalDeferred;
          delete window.OneSignalSDK;
        } catch (e) {
        }
        delete window.OneSignal;
      }
      const existingScript = document.querySelector('script[src*="OneSignalSDK"]');
      if (existingScript) {
        existingScript.remove();
      }
      const script = document.createElement("script");
      script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      script.defer = true;
      script.async = true;
      document.head.appendChild(script);
      return new Promise((resolve) => {
        script.onload = async () => {
          try {
            let attempts = 0;
            while (!window.OneSignal && attempts < 50) {
              await new Promise((resolve2) => setTimeout(resolve2, 100));
              attempts++;
            }
            if (!window.OneSignal) {
              throw new Error("OneSignal script loaded but object not available");
            }
            const config = {
              appId: "5e0cb75f-f065-4626-9a63-ce5692f7a7e0",
              // CORRECT App ID
              allowLocalhostAsSecureOrigin: true,
              // iOS Safari BYPASS MODE
              requiresUserPrivacyConsent: false,
              autoRegister: false,
              // Manual control for iOS
              autoResubscribe: true,
              // Service Worker configuration
              serviceWorkerPath: "/OneSignalSDKWorker.js",
              serviceWorkerUpdaterPath: "/OneSignalSDKUpdaterWorker.js",
              serviceWorkerParam: { scope: "/" },
              // iOS Safari Web Push BYPASS
              safari_web_id: void 0,
              // Let OneSignal auto-detect
              // CRITICAL: Disable domain validation for localhost testing
              restrictedOriginValidation: false,
              // HTTP permission request (for non-HTTPS environments)
              httpPermissionRequest: {
                enable: true,
                useModal: true
              },
              // Notification options
              notifyButton: { enable: false },
              persistNotification: true,
              // BYPASS MODE: Force initialization regardless of origin
              __BYPASS_ORIGIN_VALIDATION: true
            };
            await window.OneSignal.init(config);
            window.OneSignal.push(() => {
            });
            setTimeout(async () => {
              await checkOneSignalStatus();
            }, 1e3);
            setIsInitialized(true);
            resolve(true);
          } catch (error) {
            if (iosInfo.isIOS && iosInfo.isSafari) {
              try {
                const permission2 = await Notification.requestPermission();
                if (permission2 === "granted") {
                  setPermission(permission2);
                  resolve(true);
                } else {
                  resolve(false);
                }
              } catch (fallbackError) {
                resolve(false);
              }
            } else {
              resolve(false);
            }
          }
        };
        script.onerror = (error) => {
          resolve(false);
        };
      });
    } catch (error) {
      return false;
    }
  };
  const checkOneSignalStatus = async () => {
    try {
      if (!window.OneSignal) return;
      const OneSignal = window.OneSignal;
      const isEnabled = await OneSignal.isPushNotificationsEnabled();
      const userId = await OneSignal.getUserId();
      const notificationPermission = await OneSignal.getNotificationPermission();
      setSubscriptionStatus(isEnabled);
      setPlayerId(userId);
      setPermission(notificationPermission);
    } catch (error) {
    }
  };
  const loadDeviceTokens = async () => {
    try {
      const { data, error } = await supabase.from("device_tokens").select("*").order("created_at", { ascending: false });
      if (error) {
      } else {
        setDeviceTokens(data || []);
      }
    } catch (error) {
    }
  };
  const handleUltimateRegistration = async () => {
    setIsLoading(true);
    try {
      const initialized = await initializeOneSignal();
      if (!initialized) {
        throw new Error("Inizializzazione OneSignal fallita");
      }
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      if (!window.OneSignal) {
        throw new Error("OneSignal non disponibile dopo inizializzazione");
      }
      const OneSignal = window.OneSignal;
      if (!("Notification" in window)) {
        throw new Error("Notifiche non supportate su questo browser");
      }
      if (iosDebugInfo.isIOS && iosDebugInfo.isSafari) {
        const permission2 = await Notification.requestPermission();
        if (permission2 !== "granted") {
        }
      }
      try {
        await OneSignal.Notifications.requestPermission();
      } catch (osError) {
      }
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      let currentPlayerId = null;
      try {
        currentPlayerId = await OneSignal.User.PushSubscription.id;
        if (currentPlayerId) {
        }
      } catch (error) {
      }
      if (!currentPlayerId) {
        try {
          currentPlayerId = await OneSignal.getUserId();
          if (currentPlayerId) {
          }
        } catch (error) {
        }
      }
      if (!currentPlayerId) {
        try {
          const subscription = await OneSignal.getSubscription();
          currentPlayerId = subscription?.userId || subscription?.playerId;
          if (currentPlayerId) {
          }
        } catch (error) {
        }
      }
      if (!currentPlayerId) {
        try {
          currentPlayerId = OneSignal.User?.onesignalId || OneSignal.User?.userId;
          if (currentPlayerId) {
          }
        } catch (error) {
        }
      }
      if (!currentPlayerId && iosDebugInfo.isIOS && iosDebugInfo.isSafari) {
        try {
          await OneSignal.setSubscription(true);
          await new Promise((resolve) => setTimeout(resolve, 3e3));
          currentPlayerId = await OneSignal.User.PushSubscription.id || await OneSignal.getUserId();
          if (currentPlayerId) {
          }
        } catch (manualError) {
        }
      }
      if (currentPlayerId) {
        setPlayerId(currentPlayerId);
        if (user) {
          const { error } = await supabase.from("device_tokens").upsert({
            user_id: user.id,
            token: currentPlayerId,
            device_type: iosDebugInfo.isIOS ? "onesignal_ios_web" : "onesignal_web",
            platform: `${navigator.platform} - ${iosDebugInfo.isIOS ? "iOS" : "Other"}`
          });
          if (error) {
          } else {
            await loadDeviceTokens();
          }
        }
        await checkOneSignalStatus();
        ue.success("🛰️ REGISTRAZIONE iOS ULTIMATE COMPLETATA!");
      } else {
        try {
          const isEnabled = await OneSignal.isPushNotificationsEnabled();
          const permission2 = await OneSignal.getNotificationPermission();
        } catch (debugError) {
        }
        throw new Error("Player ID non ottenuto - verifica permessi e connessione");
      }
    } catch (error) {
      ue.error(`❌ Registrazione iOS fallita: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };
  const handleTestNotification = async () => {
    if (!playerId) {
      ue.error("Registrati prima con il bottone ULTIMATE!");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("send-push-notification-onesignal", {
        body: {
          user_id: user?.id,
          title: "🚀 ULTIMATE TEST M1SSION™",
          message: "Notifica test OneSignal funzionante!",
          data: { test: true }
        }
      });
      if (error) {
        ue.error(`❌ Errore: ${error.message}`);
      } else {
        ue.success("✅ Notifica test inviata!");
      }
    } catch (error) {
      ue.error("❌ Errore invio notifica");
    }
  };
  const updatePermissionStatus = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  };
  reactExports.useEffect(() => {
    detectiOSEnvironment();
    checkWorkerStatus();
    initializeOneSignal();
    loadDeviceTokens();
    updatePermissionStatus();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-black/50 border-cyan-400/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-cyan-400 text-center", children: "🛰️ NOTIFICATION DEBUG iOS ULTIMATE - M1SSION™" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-sm text-green-400 mt-2", children: [
        "✅ PAGINA FUNZIONANTE - URL: ",
        window.location.href
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-xs text-orange-400 mt-1", children: "🍎 iOS Safari Optimized - OneSignal Debug Mode" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-black/50 border-cyan-400/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-cyan-400", children: "📊 Status Dashboard" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-800/50 p-3 rounded", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-400", children: "OneSignal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-bold ${isInitialized ? "text-green-400" : "text-red-400"}`, children: isInitialized ? "✅ Inizializzato" : "❌ Non inizializzato" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-800/50 p-3 rounded", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-400", children: "Permessi" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-bold ${permission === "granted" ? "text-green-400" : permission === "denied" ? "text-red-400" : "text-yellow-400"}`, children: permission })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-800/50 p-3 rounded", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-400", children: "Player ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-bold ${playerId ? "text-green-400" : "text-red-400"}`, children: playerId ? "✅ Ottenuto" : "❌ Mancante" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-800/50 p-3 rounded", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-400", children: "Subscription" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-bold ${subscriptionStatus ? "text-green-400" : "text-red-400"}`, children: subscriptionStatus ? "✅ Attiva" : "❌ Inattiva" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-orange-800/30 p-3 rounded", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-orange-400", children: "iOS Device" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-bold ${iosDebugInfo.isIOS ? "text-green-400" : "text-red-400"}`, children: iosDebugInfo.isIOS ? "🍎 iOS" : "🖥️ Desktop" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-orange-800/30 p-3 rounded", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-orange-400", children: "Safari" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-bold ${iosDebugInfo.isSafari ? "text-green-400" : "text-yellow-400"}`, children: iosDebugInfo.isSafari ? "✅ Safari" : "⚠️ Other" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-orange-800/30 p-3 rounded", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-orange-400", children: "Service Worker" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-bold text-xs ${workerStatus.includes("✅") ? "text-green-400" : "text-red-400"}`, children: workerStatus })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-black/50 border-cyan-400/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-cyan-400", children: "🎯 Azioni Principali" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleUltimateRegistration,
            disabled: isLoading,
            size: "lg",
            className: "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold px-8 py-4 text-lg",
            children: isLoading ? "🔄 Registrando iOS..." : "🛰️ REGISTRATI ULTIMATE iOS"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleTestNotification,
              disabled: !playerId,
              className: "bg-green-600 hover:bg-green-700",
              children: "📤 Test Notifica iOS"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: checkOneSignalStatus,
              variant: "outline",
              className: "border-orange-400 text-orange-400",
              children: "🛰️ Check OneSignal"
            }
          ),
          iosDebugInfo.isIOS && iosDebugInfo.isSafari && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: async () => {
                try {
                  if (window.OneSignal) {
                    await window.OneSignal.logout();
                    delete window.OneSignal;
                  }
                  const permission2 = await Notification.requestPermission();
                  if (permission2 === "granted") {
                    await initializeOneSignal();
                    await new Promise((resolve) => setTimeout(resolve, 3e3));
                    await checkOneSignalStatus();
                  }
                } catch (error) {
                }
              },
              className: "bg-orange-600 hover:bg-orange-700",
              children: "🍎 iOS BYPASS Manual"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: loadDeviceTokens,
              variant: "outline",
              className: "border-cyan-400 text-cyan-400",
              children: "🔄 Ricarica Token"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => {
                detectiOSEnvironment();
                checkWorkerStatus();
                updatePermissionStatus();
              },
              variant: "outline",
              className: "border-yellow-400 text-yellow-400",
              children: "🔍 Full iOS Check"
            }
          )
        ] })
      ] })
    ] }),
    playerId && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-black/50 border-green-400/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-green-400", children: "✅ Player ID OneSignal" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-800/50 p-4 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-mono text-green-400 break-all", children: playerId }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-black/50 border-cyan-400/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-cyan-400", children: "📱 Token Dispositivi Registrati" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: deviceTokens.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-400", children: "Nessun token registrato. Usa il bottone ULTIMATE per registrarti!" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: deviceTokens.map((tokenData) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-800/50 p-3 rounded", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400", children: tokenData.device_type }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 ml-2", children: new Date(tokenData.created_at).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-green-400", children: [
            "ID: ",
            tokenData.id
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-mono text-gray-300 break-all", children: tokenData.token })
      ] }, tokenData.id)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-black/50 border-orange-400/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-orange-400", children: "🍎 iOS Environment Debug" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "iOS Device:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-2 ${iosDebugInfo.isIOS ? "text-green-400" : "text-red-400"}`, children: iosDebugInfo.isIOS ? "✅ iOS Device" : "❌ Not iOS" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Safari Browser:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-2 ${iosDebugInfo.isSafari ? "text-green-400" : "text-yellow-400"}`, children: iosDebugInfo.isSafari ? "✅ Safari" : "⚠️ Other Browser" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "PWA Mode:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-2 ${iosDebugInfo.isPWA ? "text-green-400" : "text-yellow-400"}`, children: iosDebugInfo.isPWA ? "✅ PWA" : "⚠️ Browser" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Standalone:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-2 ${iosDebugInfo.isStandalone ? "text-green-400" : "text-gray-400"}`, children: iosDebugInfo.isStandalone ? "✅ Standalone" : "❌ Not Standalone" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Protocol:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-2 ${iosDebugInfo.protocol === "https:" ? "text-green-400" : "text-red-400"}`, children: iosDebugInfo.protocol })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Notification API:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-2 ${iosDebugInfo.notificationSupport ? "text-green-400" : "text-red-400"}`, children: iosDebugInfo.notificationSupport ? "✅ Supported" : "❌ Not Supported" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-3 bg-gray-800/50 rounded", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-400 text-xs mb-2", children: "User Agent:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white text-xs break-all", children: iosDebugInfo.userAgent })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-3 bg-gray-800/50 rounded", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-400 text-xs mb-2", children: "Service Worker Status:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white text-xs", children: workerStatus })
        ] })
      ] })
    ] })
  ] }) });
};

export { NotificationDebug as default };
