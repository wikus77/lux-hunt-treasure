const removeProductionLogs = () => {
  {
    console.log = () => {
    };
    console.warn = () => {
    };
    console.info = () => {
    };
  }
};
const prefetchCriticalRoutes = () => {
  const routes = ["/home", "/map", "/profile"];
  routes.forEach((route) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = route;
    document.head.appendChild(link);
  });
};
const optimizeMemoryUsage = () => {
  const protectedKeys = ["profileImage", "user-preferences", "auth-token"];
  Object.keys(localStorage).forEach((key) => {
    if (!protectedKeys.some((protectedKey) => key.includes(protectedKey))) {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          const parsed = JSON.parse(item);
          if (parsed.timestamp && Date.now() - parsed.timestamp > 24 * 60 * 60 * 1e3) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  });
};
const initPerformanceOptimizations = () => {
  removeProductionLogs();
  prefetchCriticalRoutes();
  optimizeMemoryUsage();
};

export { initPerformanceOptimizations, optimizeMemoryUsage, prefetchCriticalRoutes, removeProductionLogs };
