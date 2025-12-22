import { diagnostics } from './interestSignals.Dc6ZMrNh.js';
import './index.BEQCqgv7.js';
import './three-vendor.B3e0mz6d.js';
import './react-vendor.CAU3V3le.js';
import './ui-vendor.CkkPodTS.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

class ProductionMonitor {
  metrics = {
    errors: [],
    performance: [],
    features: [],
    system: {
      timestamp: Date.now()
    }
  };
  maxEntries = 50;
  // Limit stored metrics
  reportingInterval = 3e5;
  // 5 minutes
  constructor() {
    this.init();
  }
  init() {
    if (typeof window === "undefined") return;
    this.setupErrorMonitoring();
    this.setupPerformanceMonitoring();
    this.setupSystemHealthMonitoring();
    {
      this.startPeriodicReporting();
    }
  }
  setupErrorMonitoring() {
    window.addEventListener("error", (event) => {
      this.recordError({
        timestamp: Date.now(),
        type: "javascript_error",
        message: this.sanitizeMessage(event.error?.message || event.message || "Unknown error"),
        stack: this.sanitizeStack(event.error?.stack),
        userAgent: navigator.userAgent,
        url: this.sanitizeUrl(window.location.href),
        userId: this.getCurrentUserId()
      });
    });
    window.addEventListener("unhandledrejection", (event) => {
      this.recordError({
        timestamp: Date.now(),
        type: "promise_rejection",
        message: this.sanitizeMessage(event.reason?.message || String(event.reason) || "Promise rejected"),
        stack: this.sanitizeStack(event.reason?.stack),
        userAgent: navigator.userAgent,
        url: this.sanitizeUrl(window.location.href),
        userId: this.getCurrentUserId()
      });
    });
  }
  setupPerformanceMonitoring() {
    if ("performance" in window && "getEntriesByType" in performance) {
      setTimeout(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        if (navigation) {
          this.recordPerformance("page_load", navigation.loadEventEnd - navigation.fetchStart);
          this.recordPerformance("dom_content_loaded", navigation.domContentLoadedEventEnd - navigation.fetchStart);
        }
      }, 1e3);
    }
  }
  setupSystemHealthMonitoring() {
    const monitorHealth = () => {
      const health = {
        timestamp: Date.now()
      };
      if ("memory" in performance) {
        const memory = performance.memory;
        health.memory = {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          percentage: Math.round(memory.usedJSHeapSize / memory.totalJSHeapSize * 100)
        };
      }
      if ("connection" in navigator) {
        const connection = navigator.connection;
        health.network = {
          online: navigator.onLine,
          effectiveType: connection.effectiveType || "unknown",
          rtt: connection.rtt || 0
        };
      }
      if ("getBattery" in navigator) {
        navigator.getBattery().then((battery) => {
          health.battery = {
            level: Math.round(battery.level * 100),
            charging: battery.charging
          };
        }).catch(() => {
        });
      }
      this.metrics.system = health;
    };
    monitorHealth();
    setInterval(monitorHealth, this.reportingInterval);
  }
  startPeriodicReporting() {
    setInterval(() => {
      this.sendMetricsToServer();
    }, this.reportingInterval);
  }
  recordError(error) {
    this.metrics.errors.push(error);
    this.limitArray(this.metrics.errors);
  }
  recordPerformance(metric, value) {
    this.metrics.performance.push({
      timestamp: Date.now(),
      metric,
      value,
      url: this.sanitizeUrl(window.location.href)
    });
    this.limitArray(this.metrics.performance);
  }
  recordFeatureUsage(feature) {
    this.metrics.features.push({
      feature,
      timestamp: Date.now(),
      userId: this.getCurrentUserId()
    });
    this.limitArray(this.metrics.features);
  }
  limitArray(array) {
    if (array.length > this.maxEntries) {
      array.splice(0, array.length - this.maxEntries);
    }
  }
  sanitizeMessage(message) {
    return message.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]").replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "[CARD]").replace(/\b(?:token|key|secret|password)[\s=:]\S+/gi, "[REDACTED]").substring(0, 500);
  }
  sanitizeStack(stack) {
    if (!stack) return void 0;
    return this.sanitizeMessage(stack);
  }
  sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);
      urlObj.search = "";
      urlObj.hash = "";
      return urlObj.toString();
    } catch {
      return "[INVALID_URL]";
    }
  }
  getCurrentUserId() {
    try {
      const userId = sessionStorage.getItem("user_id");
      return userId ? userId.substring(0, 8) + "..." : void 0;
    } catch {
      return void 0;
    }
  }
  async sendMetricsToServer() {
    try {
      const hasMetrics = this.metrics.errors.length > 0 || this.metrics.performance.length > 0 || this.metrics.features.length > 0;
      if (!hasMetrics) return;
      const payload = {
        ...this.metrics,
        diagnostics: {
          queueSize: diagnostics.queueSize(),
          sessionId: diagnostics.sessionId(),
          status: diagnostics.lastFlushStatus()
        }
      };
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        this.metrics.errors = [];
        this.metrics.performance = [];
        this.metrics.features = [];
      }
    } catch (error) {
    }
  }
  /**
   * Public API for manual tracking
   */
  trackFeature(feature) {
    this.recordFeatureUsage(feature);
  }
  trackCustomMetric(metric, value) {
    this.recordPerformance(metric, value);
  }
  getMetrics() {
    return { ...this.metrics };
  }
  exportMetrics() {
    return JSON.stringify({
      ...this.metrics,
      diagnostics: {
        queueSize: diagnostics.queueSize(),
        sessionId: diagnostics.sessionId(),
        lastFlushStatus: diagnostics.lastFlushStatus()
      },
      exportedAt: (/* @__PURE__ */ new Date()).toISOString()
    }, null, 2);
  }
}
const productionMonitor = new ProductionMonitor();
const monitoring = {
  trackFeature: (feature) => productionMonitor.trackFeature(feature),
  trackMetric: (metric, value) => productionMonitor.trackCustomMetric(metric, value),
  getMetrics: () => productionMonitor.getMetrics(),
  export: () => productionMonitor.exportMetrics()
};
{
  window.__M1_MONITOR__ = monitoring;
}

export { monitoring, productionMonitor };
