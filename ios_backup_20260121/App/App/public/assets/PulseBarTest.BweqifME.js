import { j as jsxRuntimeExports } from './ui-vendor.sKtoNQj2.js';
import { r as reactExports } from './react-vendor.FGvtrp7q.js';
import { cz as HIERARCHY_LEVELS, cA as getCurrentLevel, cB as getNextLevel, cC as calculateProgress, cD as getPEToNextLevel, Q as ChevronUp, B as Button, a3 as Plus, b5 as RotateCcw, bN as Award, cE as RankUpVideoModal } from './index.C8SyQ7Ep.js';
import { m as motion } from './animation-vendor.BT4oAzOt.js';
import './supabase-vendor.DVELIqeo.js';
import './stripe-vendor.C-6aXM1t.js';
import './map-vendor.DftgD3cK.js';
import './router-vendor.Bb8w37VQ.js';

function PulseBarTest() {
  const [simulatedPE, setSimulatedPE] = reactExports.useState(0);
  const [previousLevel, setPreviousLevel] = reactExports.useState(HIERARCHY_LEVELS[0]);
  const [showRankUpVideo, setShowRankUpVideo] = reactExports.useState(false);
  const [newRankAchieved, setNewRankAchieved] = reactExports.useState(null);
  const [unlockedRanks, setUnlockedRanks] = reactExports.useState([]);
  const currentLevel = getCurrentLevel(simulatedPE);
  const nextLevel = getNextLevel(currentLevel);
  const progressPercent = calculateProgress(simulatedPE, currentLevel, nextLevel);
  const peToNext = getPEToNextLevel(simulatedPE, nextLevel);
  const getPEInCurrentLevel = () => {
    if (currentLevel.level === 0) {
      return simulatedPE;
    }
    return simulatedPE - currentLevel.peThreshold;
  };
  const getPENeededForCurrentLevel = () => {
    if (!nextLevel) return 0;
    return nextLevel.peThreshold - currentLevel.peThreshold;
  };
  reactExports.useEffect(() => {
    if (currentLevel.level > previousLevel.level && currentLevel.level > 0) {
      setNewRankAchieved(currentLevel);
      setShowRankUpVideo(true);
      setUnlockedRanks((prev) => {
        if (!prev.find((r) => r.level === currentLevel.level)) {
          return [...prev, currentLevel];
        }
        return prev;
      });
    }
    setPreviousLevel(currentLevel);
  }, [currentLevel.level]);
  const add25Percent = reactExports.useCallback(() => {
    if (!nextLevel) return;
    const peNeeded = nextLevel.peThreshold - currentLevel.peThreshold;
    const peToAdd = Math.ceil(peNeeded * 0.25);
    setSimulatedPE((prev) => prev + peToAdd);
  }, [currentLevel, nextLevel]);
  const addCustomPE = (amount) => {
    setSimulatedPE((prev) => prev + amount);
  };
  const resetAll = () => {
    setSimulatedPE(0);
    setPreviousLevel(HIERARCHY_LEVELS[0]);
    setUnlockedRanks([]);
  };
  const handleRankUpComplete = () => {
    setShowRankUpVideo(false);
    setNewRankAchieved(null);
  };
  const formatPE = (pe) => {
    if (pe >= 1e6) return `${(pe / 1e6).toFixed(1)}M`;
    if (pe >= 1e3) return `${(pe / 1e3).toFixed(1)}K`;
    return pe.toString();
  };
  const totalSegments = 24;
  const filledSegments = Math.floor(progressPercent / 100 * totalSegments);
  const rankColor = currentLevel.color || "#00e7ff";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white p-4 sm:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black text-center mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent", children: "🧪 PULSE BAR TEST" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-white/60 text-sm", children: "Pagina di test per verificare il flusso di progressione e video rank-up" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-white/5 border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/40 text-xs uppercase tracking-wider", children: "PE Totali" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-cyan-400", children: formatPE(simulatedPE) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/40 text-xs uppercase tracking-wider", children: "Livello" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", style: { color: rankColor }, children: currentLevel.level })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/40 text-xs uppercase tracking-wider", children: "Grado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold", style: { color: rankColor }, children: [
          currentLevel.icon,
          " ",
          currentLevel.name
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/40 text-xs uppercase tracking-wider", children: "Prossimo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-white/60", children: nextLevel ? `${nextLevel.icon} ${formatPE(peToNext)} PE` : "👑 MAX" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl mx-auto mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "relative w-full flex items-center gap-4 p-4 rounded-2xl bg-black/50 border border-white/10",
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-shrink-0", style: { width: 80, height: 80 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "80", height: "80", viewBox: "0 0 80 80", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "40", cy: "40", r: "38", fill: "none", stroke: rankColor, strokeWidth: "1", opacity: "0.3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "40", cy: "40", r: "32", fill: "none", stroke: "rgba(255,255,255,0.1)", strokeWidth: "4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.circle,
                {
                  cx: "40",
                  cy: "40",
                  r: "32",
                  fill: "none",
                  stroke: rankColor,
                  strokeWidth: "4",
                  strokeLinecap: "round",
                  strokeDasharray: 2 * Math.PI * 32,
                  strokeDashoffset: 2 * Math.PI * 32 * (1 - progressPercent / 100),
                  transform: "rotate(-90 40 40)",
                  style: { filter: `drop-shadow(0 0 6px ${rankColor})` },
                  initial: false,
                  animate: { strokeDashoffset: 2 * Math.PI * 32 * (1 - progressPercent / 100) },
                  transition: { duration: 0.5 }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl", children: currentLevel.icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: "font-bold font-mono text-xs",
                  style: { color: rankColor },
                  children: [
                    Math.round(progressPercent),
                    "%"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-xs font-bold tracking-[0.2em] uppercase",
                    style: { color: rankColor },
                    children: currentLevel.name
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-white/40", children: [
                  "LVL ",
                  currentLevel.level
                ] })
              ] }),
              nextLevel && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-white/40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-3 h-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  nextLevel.icon,
                  " ",
                  formatPE(peToNext),
                  " PE"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "relative h-6 rounded-lg overflow-hidden",
                style: {
                  background: "rgba(0,20,30,0.9)",
                  border: `1px solid ${rankColor}33`
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-1 flex gap-1", children: [...Array(totalSegments)].map((_, i) => {
                    const isFilled = i < filledSegments;
                    return /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.div,
                      {
                        className: "flex-1 rounded-sm",
                        style: {
                          background: isFilled ? `linear-gradient(180deg, ${rankColor} 0%, ${rankColor}99 50%, ${rankColor}66 100%)` : "rgba(255,255,255,0.05)",
                          boxShadow: isFilled ? `0 0 8px ${rankColor}` : "none"
                        },
                        initial: false,
                        animate: { opacity: isFilled ? 1 : 0.3 },
                        transition: { duration: 0.2 }
                      },
                      i
                    );
                  }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      className: "absolute top-0 bottom-0 w-12 pointer-events-none",
                      style: {
                        background: `linear-gradient(90deg, transparent, ${rankColor}44, transparent)`
                      },
                      animate: { left: ["-15%", "115%"] },
                      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2 text-xs text-white/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                formatPE(getPEInCurrentLevel()),
                " PE in questo livello"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                formatPE(getPENeededForCurrentLevel()),
                " PE necessari"
              ] })
            ] })
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-white/5 border border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold mb-4 text-center", children: "🎮 Controlli Test" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: add25Percent,
            disabled: !nextLevel,
            className: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
              "+25% (",
              nextLevel ? formatPE(Math.ceil((nextLevel.peThreshold - currentLevel.peThreshold) * 0.25)) : 0,
              " PE)"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => addCustomPE(100),
            variant: "outline",
            className: "border-cyan-500/50 text-cyan-400",
            children: "+100 PE"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => addCustomPE(500),
            variant: "outline",
            className: "border-cyan-500/50 text-cyan-400",
            children: "+500 PE"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => addCustomPE(1e3),
            variant: "outline",
            className: "border-purple-500/50 text-purple-400",
            children: "+1K PE"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => addCustomPE(5e3),
            variant: "outline",
            className: "border-purple-500/50 text-purple-400",
            children: "+5K PE"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: resetAll,
            variant: "destructive",
            className: "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-4 h-4 mr-2" }),
              "Reset"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-white/5 border border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold mb-4 text-center flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-5 h-5" }),
        "Badge Sbloccati"
      ] }),
      unlockedRanks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-white/40 text-sm", children: "Nessun badge sbloccato. Raggiungi 1,000 PE per il primo rank!" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-4 justify-center", children: unlockedRanks.map((rank) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          className: "flex flex-col items-center p-3 rounded-xl",
          style: {
            background: `${rank.color}20`,
            border: `1px solid ${rank.color}50`
          },
          initial: { scale: 0 },
          animate: { scale: 1 },
          transition: { type: "spring" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl mb-1", children: rank.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "text-xs font-bold uppercase",
                style: { color: rank.color },
                children: rank.name
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-white/40", children: [
              "LVL ",
              rank.level
            ] })
          ]
        },
        rank.level
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto p-4 rounded-2xl bg-white/5 border border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold mb-4 text-center", children: "📊 Gerarchia Completa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-white/40 text-xs uppercase tracking-wider border-b border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-left", children: "Lvl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-left", children: "Grado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-right", children: "PE Soglia" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-right", children: "PE Incrementali" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-center", children: "Stato" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: HIERARCHY_LEVELS.filter((l) => l.code !== "MCP").map((level) => {
          const isUnlocked = simulatedPE >= level.peThreshold;
          const isCurrent = currentLevel.level === level.level;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              className: `border-b border-white/5 ${isCurrent ? "bg-white/5" : ""}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 font-bold", style: { color: level.color }, children: level.level }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-2", children: level.icon }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: isUnlocked ? level.color : "rgba(255,255,255,0.3)" }, children: level.name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-right font-mono text-white/60", children: formatPE(level.peThreshold) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right font-mono text-white/40", children: [
                  "+",
                  formatPE(level.peIncremental)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-center", children: isUnlocked ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-400", children: "✅" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/20", children: "🔒" }) })
              ]
            },
            level.level
          );
        }) })
      ] }) })
    ] }),
    newRankAchieved && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RankUpVideoModal,
      {
        isOpen: showRankUpVideo,
        newRank: newRankAchieved,
        onComplete: handleRankUpComplete
      }
    )
  ] });
}

export { PulseBarTest as default };
