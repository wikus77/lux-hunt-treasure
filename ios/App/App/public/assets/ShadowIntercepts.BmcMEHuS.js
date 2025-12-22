import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { bP as useEntityOverlayStore, bQ as selectRecentEvents, bR as selectShadowThreatLevel, bS as selectEntityEventCounts, bT as getThreatLevelCategory } from './index.BEQCqgv7.js';
import { A as AnimatePresence, m as motion } from './animation-vendor.BBMfCuXy.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

const ThreatLevelDisplay = ({ level, category }) => {
  const categoryColors = {
    LOW: {
      bg: "rgba(0, 229, 255, 0.1)",
      border: "#00e5ff",
      text: "#00e5ff",
      glow: "0 0 10px rgba(0, 229, 255, 0.3)"
    },
    MEDIUM: {
      bg: "rgba(255, 170, 0, 0.1)",
      border: "#ffaa00",
      text: "#ffaa00",
      glow: "0 0 10px rgba(255, 170, 0, 0.3)"
    },
    HIGH: {
      bg: "rgba(255, 0, 85, 0.1)",
      border: "#ff0055",
      text: "#ff0055",
      glow: "0 0 15px rgba(255, 0, 85, 0.4)"
    }
  };
  const colors = categoryColors[category];
  const roundedLevel = Math.round(level);
  const progressPercent = level / 5 * 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "shadow-threat-level",
      style: {
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "12px",
        boxShadow: colors.glow
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: "#888",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }, children: "THREAT LEVEL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: colors.text,
            fontSize: "12px",
            fontWeight: "bold",
            padding: "2px 8px",
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: "4px"
          }, children: category })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "flex",
          alignItems: "baseline",
          gap: "4px",
          marginBottom: "8px"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: colors.text,
            fontSize: "32px",
            fontWeight: "bold",
            fontFamily: "var(--font-orbitron, monospace)",
            lineHeight: 1
          }, children: roundedLevel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: "#666",
            fontSize: "14px"
          }, children: "/ 5" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          width: "100%",
          height: "4px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "2px",
          overflow: "hidden"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            style: {
              height: "100%",
              background: `linear-gradient(90deg, ${colors.border}, ${colors.text})`,
              borderRadius: "2px"
            },
            initial: { width: 0 },
            animate: { width: `${progressPercent}%` },
            transition: { duration: 0.5, ease: "easeOut" }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          display: "flex",
          justifyContent: "space-between",
          marginTop: "8px",
          gap: "4px"
        }, children: [0, 1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: {
              width: "100%",
              height: "3px",
              borderRadius: "2px",
              background: n <= roundedLevel ? colors.border : "rgba(255,255,255,0.1)",
              transition: "background 0.3s ease"
            }
          },
          n
        )) })
      ]
    }
  );
};
const EntityStats = ({ counts, lastShadowContact }) => {
  const entityColors = {
    MCP: "#00e5ff",
    SHADOW: "#ff0055",
    ECHO: "#a0a0a0"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.05)",
    marginBottom: "12px"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "8px"
    }, children: ["MCP", "SHADOW", "ECHO"].map((entity) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 8px",
          background: `${entityColors[entity]}10`,
          borderRadius: "4px",
          border: `1px solid ${entityColors[entity]}30`
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: entityColors[entity],
            fontSize: "10px",
            fontWeight: "bold"
          }, children: entity }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: entityColors[entity],
            fontSize: "12px",
            fontFamily: "monospace"
          }, children: counts[entity] })
        ]
      },
      entity
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "11px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#666" }, children: "Last SHADOW contact:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
        color: lastShadowContact ? "#ff0055" : "#444",
        fontFamily: "monospace"
      }, children: lastShadowContact ? formatTimestamp(lastShadowContact) : "No direct contact yet" })
    ] })
  ] });
};
const ShadowIntercepts = () => {
  const recentEvents = useEntityOverlayStore(selectRecentEvents);
  const threatLevel = useEntityOverlayStore(selectShadowThreatLevel);
  const entityCounts = useEntityOverlayStore(selectEntityEventCounts);
  const threatCategory = reactExports.useMemo(() => getThreatLevelCategory(threatLevel), [threatLevel]);
  const lastShadowContact = reactExports.useMemo(() => {
    const shadowEvent = recentEvents.find((e) => e.entity === "SHADOW");
    return shadowEvent?.timestamp || null;
  }, [recentEvents]);
  if (recentEvents.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shadow-intercepts-container empty", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shadow-intercepts-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shadow-intercepts-icon", children: "📡" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shadow-intercepts-title", children: "SHADOW INTERCEPTS" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThreatLevelDisplay, { level: threatLevel, category: threatCategory }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shadow-intercepts-empty", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No intercepts detected." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "shadow-intercepts-hint", children: "Network activity will appear here." })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shadow-intercepts-container", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shadow-intercepts-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shadow-intercepts-icon", children: "📡" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shadow-intercepts-title", children: "SHADOW INTERCEPTS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shadow-intercepts-count", children: recentEvents.length })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ThreatLevelDisplay, { level: threatLevel, category: threatCategory }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EntityStats, { counts: entityCounts, lastShadowContact }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shadow-intercepts-list", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "popLayout", children: recentEvents.map((event, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
        transition: { delay: index * 0.05 },
        className: `shadow-intercept-item entity-${event.entity.toLowerCase()}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shadow-intercept-entity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityBadge, { entity: event.entity }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shadow-intercept-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "shadow-intercept-text", children: event.text }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shadow-intercept-time", children: formatTime(event.timestamp) })
          ] })
        ]
      },
      `${event.id}-${event.timestamp}`
    )) }) })
  ] });
};
const EntityBadge = ({ entity }) => {
  const colors = {
    MCP: "#00e5ff",
    SHADOW: "#ff0055",
    ECHO: "#a0a0a0"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: "shadow-intercept-badge",
      style: {
        color: colors[entity],
        borderColor: colors[entity]
      },
      children: entity
    }
  );
};
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  });
};
const formatTimestamp = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  if (diff < 6e4) return "just now";
  if (diff < 36e5) return `${Math.floor(diff / 6e4)}m ago`;
  if (diff < 864e5) return `${Math.floor(diff / 36e5)}h ago`;
  return new Date(timestamp).toLocaleDateString("it-IT", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export { ShadowIntercepts, ShadowIntercepts as default };
