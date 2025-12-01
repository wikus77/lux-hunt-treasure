class SilentAutoUpdate {
  state;
  options;
  registration = null;
  isInitialized = false;
  constructor() {
    this.state = {
      buildId: this.getBuildId(),
      isIOSPWA: this.detectIOSPWA(),
      hasController: !!navigator.serviceWorker?.controller,
      isUpdating: false
    };
    this.options = { debug: false };
  }
  getBuildId() {
    return "build-mijx2t6r";
  }
  detectIOSPWA() {
    if (typeof window === "undefined") return false;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    return isStandalone && isIOS;
  }
  log(message, data) {
    if (this.options.debug) {
      console.info(`[SILENT-UPDATE] ${message}`, data || "");
    }
  }
  getSessionKey(type) {
    return `sw:${type}:${this.state.buildId}`;
  }
  hasReloaded() {
    return sessionStorage.getItem(this.getSessionKey("reloaded")) === "1";
  }
  setReloaded() {
    sessionStorage.setItem(this.getSessionKey("reloaded"), "1");
  }
  hasUpdateReady() {
    return sessionStorage.getItem(this.getSessionKey("updateReady")) === "1";
  }
  setUpdateReady() {
    sessionStorage.setItem(this.getSessionKey("updateReady"), "1");
  }
  performSilentRefresh() {
    if (this.hasReloaded()) {
      this.log("Already reloaded for this BUILD_ID, skipping");
      return;
    }
    if (this.state.isUpdating) {
      this.log("Update already in progress, skipping");
      return;
    }
    this.state.isUpdating = true;
    this.setReloaded();
    this.log(`Performing silent refresh (iOS PWA: ${this.state.isIOSPWA})`);
    const executeRefresh = () => {
      if (this.state.isIOSPWA) {
        const currentUrl = `${location.pathname}${location.search}${location.hash}`;
        location.replace(currentUrl);
      } else {
        location.reload();
      }
    };
    if (this.state.isIOSPWA && document.visibilityState === "hidden") {
      this.log("App hidden, waiting for visibility change");
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          setTimeout(executeRefresh, 200);
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      setTimeout(() => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        executeRefresh();
      }, 3e4);
    } else {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(executeRefresh, { timeout: 1e3 });
      } else {
        setTimeout(executeRefresh, 300);
      }
    }
  }
  handleUpdateFound(registration) {
    const newWorker = registration.installing;
    if (!newWorker) return;
    this.log("New worker installing, setting update ready flag");
    this.setUpdateReady();
    newWorker.addEventListener("statechange", () => {
      if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
        this.log("New worker installed and waiting, sending skip waiting message");
        newWorker.postMessage({ type: "SW_SKIP_WAITING" });
      }
    });
  }
  handleControllerChange() {
    this.log("Controller change detected");
    if (!this.hasReloaded() && this.hasUpdateReady()) {
      this.log("Update ready and not yet reloaded, performing silent refresh");
      this.performSilentRefresh();
    } else {
      this.log("Skipping refresh", {
        hasReloaded: this.hasReloaded(),
        hasUpdateReady: this.hasUpdateReady()
      });
    }
  }
  addUpdateListeners() {
    if (!this.registration) return;
    this.registration.addEventListener("updatefound", () => {
      this.handleUpdateFound(this.registration);
    });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      this.handleControllerChange();
    });
    this.log("Silent update listeners added");
  }
  cleanupOldFlags() {
    try {
      const currentBuildId = this.state.buildId;
      const keys = Object.keys(sessionStorage);
      keys.forEach((key) => {
        if ((key.startsWith("sw:reloaded:") || key.startsWith("sw:updateReady:")) && !key.includes(currentBuildId)) {
          sessionStorage.removeItem(key);
        }
      });
      this.log("Cleaned up old session flags");
    } catch (error) {
      console.warn("[SILENT-UPDATE] Failed to cleanup old flags:", error);
    }
  }
  async init(options = {}) {
    if (this.isInitialized) {
      this.log("Already initialized");
      return this.registration;
    }
    if (!("serviceWorker" in navigator)) {
      console.warn("[SILENT-UPDATE] Service Worker not supported");
      return null;
    }
    this.options = options;
    this.log("Initializing Silent Auto-Update", {
      buildId: this.state.buildId,
      isIOSPWA: this.state.isIOSPWA,
      hasController: this.state.hasController,
      hasReloaded: this.hasReloaded(),
      hasUpdateReady: this.hasUpdateReady()
    });
    try {
      this.cleanupOldFlags();
      let registration = await navigator.serviceWorker.getRegistration("/");
      if (!registration) {
        this.log("Registering new SW");
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none"
        });
      }
      this.registration = registration;
      await navigator.serviceWorker.ready;
      this.addUpdateListeners();
      if (registration.waiting && navigator.serviceWorker.controller && !this.hasReloaded()) {
        this.log("Found waiting worker on init, sending skip waiting");
        this.setUpdateReady();
        registration.waiting.postMessage({ type: "SW_SKIP_WAITING" });
      }
      this.isInitialized = true;
      this.log("Silent Auto-Update initialized successfully");
      return registration;
    } catch (error) {
      console.error("[SILENT-UPDATE] Initialization failed:", error);
      return null;
    }
  }
  getDiagnostics() {
    return {
      ...this.state,
      hasReloaded: this.hasReloaded(),
      hasUpdateReady: this.hasUpdateReady(),
      isInitialized: this.isInitialized,
      sessionKeys: {
        reloaded: this.getSessionKey("reloaded"),
        updateReady: this.getSessionKey("updateReady")
      },
      timestamp: Date.now()
    };
  }
  // Manual trigger for testing
  triggerUpdate() {
    if (this.registration) {
      this.registration.update();
    }
  }
  // Reset flags for testing
  resetFlags() {
    sessionStorage.removeItem(this.getSessionKey("reloaded"));
    sessionStorage.removeItem(this.getSessionKey("updateReady"));
    this.log("Session flags reset");
  }
}
const silentAutoUpdate = new SilentAutoUpdate();
const initSilentAutoUpdate = (options) => silentAutoUpdate.init(options);

export { initSilentAutoUpdate };
