import { r as reactExports } from './animation-vendor.BiI6PE8T.js';
import { u as useLocation } from './index.CUdqZWfi.js';
import { trackDwell, trackView, trackClick } from './interestSignals.DFffzaep.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

const routeToSection = (pathname) => {
  if (pathname.includes("/map")) return "Map";
  if (pathname.includes("/intel")) return "Intel";
  if (pathname.includes("/notice") || pathname.includes("/notification")) return "Notice";
  if (pathname.includes("/reward") || pathname.includes("/prize")) return "Rewards";
  if (pathname.includes("/buzz-map")) return "BuzzMap";
  return null;
};
function useAutoInterestSignals() {
  const [location] = useLocation();
  const currentSection = reactExports.useRef(null);
  const sectionStartTime = reactExports.useRef(0);
  reactExports.useEffect(() => {
    const section = routeToSection(location);
    if (currentSection.current && sectionStartTime.current > 0) {
      const dwellTime = Date.now() - sectionStartTime.current;
      if (dwellTime > 1e3) {
        trackDwell(currentSection.current, dwellTime);
      }
    }
    if (section) {
      trackView(section);
      currentSection.current = section;
      sectionStartTime.current = Date.now();
    } else {
      currentSection.current = null;
      sectionStartTime.current = 0;
    }
  }, [location]);
  reactExports.useEffect(() => {
    return () => {
      if (currentSection.current && sectionStartTime.current > 0) {
        const dwellTime = Date.now() - sectionStartTime.current;
        if (dwellTime > 1e3) {
          trackDwell(currentSection.current, dwellTime);
        }
      }
    };
  }, []);
  reactExports.useEffect(() => {
    if (typeof document === "undefined") return;
    const handleInteraction = (event) => {
      const target = event.target;
      if (!target) return;
      try {
        if (target.closest("[data-mission-id]") || target.closest(".mission-card") || target.textContent?.toLowerCase().includes("mission")) {
          trackClick("mission_interaction");
        } else if (target.closest("[data-reward-id]") || target.closest(".reward-card") || target.textContent?.toLowerCase().includes("prize") || target.textContent?.toLowerCase().includes("reward")) {
          trackClick("reward_interaction");
        } else if (target.closest("nav") || target.closest(".bottom-navigation") || target.closest('[role="navigation"]')) {
          trackClick("navigation");
        } else if (target.closest(".brand-card") || target.textContent?.toLowerCase().includes("sponsor") || target.textContent?.toLowerCase().includes("brand")) {
          trackClick("brand_interaction");
        }
      } catch (error) {
      }
    };
    document.addEventListener("click", handleInteraction, { passive: true });
    document.addEventListener("touchend", handleInteraction, { passive: true });
    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchend", handleInteraction);
    };
  }, []);
}
function initAutoInterestSignals() {
  if (typeof window !== "undefined") {
    try {
      const isDebugMode = new URLSearchParams(window.location.search).get("M1_DIAG") === "1" || undefined                          === "1";
      if (isDebugMode) {
        window.__M1_AUTO_SIG__ = {
          isActive: true,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          version: "1.0.0"
        };
      }
    } catch (error) {
    }
  }
}

export { initAutoInterestSignals, useAutoInterestSignals };
