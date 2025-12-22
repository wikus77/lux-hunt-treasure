async function ensureAppSWController() {
  if (!("serviceWorker" in navigator)) {
    return false;
  }
  try {
    const buildId = "build-mizzito4";
    const appSWPath = `/sw-app-${buildId}.js`;
    const currentController = navigator.serviceWorker.controller;
    const currentURL = currentController?.scriptURL;
    if (!currentController || !currentURL?.includes("/sw-app-")) {
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
      return true;
    }
    return true;
  } catch (error) {
    return false;
  }
}
async function logActiveSWs() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const controller = navigator.serviceWorker.controller;
  } catch (error) {
  }
}

export { ensureAppSWController, logActiveSWs };
