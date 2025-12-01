import { s as supabase } from './index.B1pZJRDR.js';
import './three-vendor.wwSanNQ8.js';
import './react-vendor.CAU3V3le.js';
import './ui-vendor.DoN6OTIp.js';
import './supabase-vendor.CghLtY7N.js';
import './animation-vendor.Bezovbgp.js';
import './map-vendor.Dz2XYzxS.js';
import './stripe-vendor.BaJG9Xy1.js';
import './router-vendor.opNAzTki.js';

class InterestSignalsQueue {
  events = [];
  sessionId;
  flushTimer = null;
  isOnline = true;
  retryCount = 0;
  maxRetries = 3;
  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupFlushTimer();
    this.setupVisibilityHandler();
    this.setupOnlineHandler();
  }
  generateSessionId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  getDeviceHint() {
    if (typeof window === "undefined") return "unknown";
    const userAgent = navigator.userAgent;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    if (isStandalone && /iPhone|iPad|iPod/i.test(userAgent)) {
      return "ios_pwa";
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return "safari";
    } else if (/Chrome/i.test(userAgent)) {
      return "chrome";
    } else {
      return "desktop";
    }
  }
  extractKeywords() {
    if (typeof window === "undefined") return [];
    const keywords = [];
    const pathname = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (pathname.includes("map")) keywords.push("map");
    if (pathname.includes("intel")) keywords.push("intel");
    if (pathname.includes("reward")) keywords.push("reward");
    if (pathname.includes("mission")) keywords.push("mission");
    const urlParams = new URLSearchParams(search);
    urlParams.forEach((value, key) => {
      if (key === "q" || key === "search") {
        keywords.push(...value.split(" ").slice(0, 2));
      }
    });
    return keywords.slice(0, 3);
  }
  setupFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, 1e4);
  }
  setupVisibilityHandler() {
    if (typeof document === "undefined") return;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flush();
      }
    });
  }
  setupOnlineHandler() {
    if (typeof window === "undefined") return;
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.retryCount = 0;
      this.flush();
    });
    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }
  track(event) {
    try {
      const fullEvent = {
        ...event,
        ts: (/* @__PURE__ */ new Date()).toISOString(),
        device: this.getDeviceHint(),
        keywords: this.extractKeywords()
      };
      this.events.push(fullEvent);
      if (undefined                          === "1") ;
      if (this.events.length >= 20) {
        this.flush();
      }
    } catch (error) {
    }
  }
  async flush() {
    if (this.events.length === 0 || !this.isOnline || this.retryCount >= this.maxRetries) {
      return;
    }
    const eventsToSend = [...this.events];
    this.events = [];
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (undefined                          === "1") ;
        return;
      }
      const payload = {
        user_id: user.id,
        session_id: this.sessionId,
        events: eventsToSend
      };
      let rpcError = null;
      try {
        const { error } = await supabase.rpc("interest_track", payload);
        rpcError = error;
      } catch (e) {
        rpcError = e;
      }
      if (rpcError) {
        try {
          const { error: insertError } = await supabase.from("interest_signals").insert(
            eventsToSend.map((event) => ({
              user_id: user.id,
              session_id: this.sessionId,
              ts: event.ts,
              type: event.type,
              section: event.section || null,
              category: event.category || null,
              meta: event.meta || {},
              device: event.device,
              keywords: event.keywords
            }))
          );
          if (insertError) {
            throw insertError;
          }
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      this.retryCount = 0;
      if (undefined                          === "1") ;
    } catch (error) {
      this.retryCount++;
      this.events.unshift(...eventsToSend);
      const backoffDelay = Math.min(1e3 * Math.pow(2, this.retryCount), 3e4);
      setTimeout(() => this.flush(), backoffDelay);
    }
  }
  // Diagnostic helpers
  queueSize() {
    return this.events.length;
  }
  flushNow() {
    return this.flush();
  }
}
const queue = new InterestSignalsQueue();
function trackView(section) {
  queue.track({ type: "view", section });
}
function trackClick(category, meta) {
  queue.track({ type: "click", category, meta });
}
function trackDwell(section, ms) {
  queue.track({
    type: "dwell",
    section,
    meta: { duration_ms: ms }
  });
}
const diagnostics = {
  queueSize: () => queue.queueSize(),
  flushNow: () => queue.flushNow(),
  lastFlushStatus: () => ({ retryCount: queue["retryCount"], isOnline: queue["isOnline"] }),
  sessionId: () => queue["sessionId"]
};
if (typeof window !== "undefined") {
  const isDebugMode = new URLSearchParams(window.location.search).get("M1_DIAG") === "1" || undefined                          === "1";
  if (isDebugMode) {
    window.__M1_SIG__ = diagnostics;
    console.log("📊 M1_SIG global diagnostics active");
  }
}

export { diagnostics, trackClick, trackDwell, trackView };
