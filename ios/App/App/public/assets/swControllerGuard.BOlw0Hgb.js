async function ensureAppSWController() {
  if (!("serviceWorker" in navigator)) {
    console.warn("[SW-GUARD] Service workers not supported");
    return false;
  }
  try {
    const buildId = "build-mijx2t6r";
    const appSWPath = `/sw-app-${buildId}.js`;
    const currentController = navigator.serviceWorker.controller;
    const currentURL = currentController?.scriptURL;
    if (!currentController || !currentURL?.includes("/sw-app-")) {
      console.log("[SW-GUARD] 🔄 Taking app controller with:", appSWPath);
      const registration = await navigator.serviceWorker.register(appSWPath, {
        scope: "/",
        updateViaCache: "none"
      });
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      if (!navigator.serviceWorker.controller) {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Controller timeout")), 3e3);
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            clearTimeout(timeout);
            resolve();
          }, { once: true });
        });
      }
      console.log("[SW-GUARD] ✅ App controller established");
      return true;
    }
    console.log("[SW-GUARD] ✅ App SW already in control:", currentURL);
    return true;
  } catch (error) {
    console.warn("[SW-GUARD] ⚠️ Guard failed (non-critical):", error);
    return false;
  }
}
async function logActiveSWs() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const controller = navigator.serviceWorker.controller;
    console.log("[SW-GUARD] 📊 Active SWs:", {
      controller: controller?.scriptURL || "none",
      registrations: registrations.map((reg) => ({
        scope: reg.scope,
        scriptURL: reg.active?.scriptURL || "pending",
        state: reg.active?.state || "unknown"
      }))
    });
  } catch (error) {
    console.warn("[SW-GUARD] Could not log SWs:", error);
  }
}

export { ensureAppSWController, logActiveSWs };
