import { j as jsxRuntimeExports } from './ui-vendor.sKtoNQj2.js';
import { r as reactExports } from './react-vendor.FGvtrp7q.js';
import { c as createLucideIcon, W as Card, ac as CardHeader, ae as CardTitle, Y as Settings, ai as CardContent, aH as CircleCheckBig, bV as CircleX, e as CircleAlert, aG as Progress, aO as Play, B as Button, b5 as RotateCcw, aa as ChevronLeft, bj as ChevronRight, E as Eye, cv as hapticLight, aC as Trophy, br as Bell, cw as Bot, Z as Zap, V as Map, c3 as House } from './index.C8SyQ7Ep.js';
import { m as motion } from './animation-vendor.BT4oAzOt.js';
import { T as TestTube } from './test-tube.BW7dQTkK.js';
import { P as Pause } from './pause.BGMSwxEl.js';
import './supabase-vendor.DVELIqeo.js';
import './stripe-vendor.C-6aXM1t.js';
import './map-vendor.DftgD3cK.js';
import './router-vendor.Bb8w37VQ.js';

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const SkipForward = createLucideIcon("SkipForward", [
  ["polygon", { points: "5 4 15 12 5 20 5 4", key: "16p6eg" }],
  ["line", { x1: "19", x2: "19", y1: "5", y2: "19", key: "futhcm" }]
]);

const ONBOARDING_STEPS = [
  // ═══════════════════════════════════════════════════════════════
  // 🏠 HOME PAGE (Step 1-7)
  // ═══════════════════════════════════════════════════════════════
  // 1. START M1SSION
  {
    id: "start-mission",
    page: "/home",
    targetSelector: '[data-onboarding="start-mission"]',
    title: "🚀 START M1SSION",
    description: "Clicca qui per iniziare la tua avventura!",
    icon: "🚀",
    action: "click",
    position: "bottom",
    spotlightPadding: 12,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true
  },
  // 2. M1U PILL
  {
    id: "m1u-pill",
    page: "/home",
    targetSelector: '[data-onboarding="m1u-pill"]',
    title: "💰 M1U - VALUTA",
    description: "I tuoi M1U! Guadagnali e usali per BUZZ.",
    icon: "💰",
    action: "click",
    position: "bottom",
    spotlightPadding: 12,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true
  },
  // 3. STREAK PILL
  {
    id: "streak-pill",
    page: "/home",
    targetSelector: '[data-onboarding="streak-pill"]',
    title: "🔥 STREAK",
    description: "Accedi ogni giorno per bonus PE e M1U!",
    icon: "🔥",
    action: "click",
    position: "bottom",
    spotlightPadding: 12,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true
  },
  // 4. M1SSION PRIZE
  {
    id: "prize-vision",
    page: "/home",
    targetSelector: '[data-onboarding="prize-vision"]',
    title: "🏆 PRIZE",
    description: "Il Premio Principale è ancora TOP SECRET. Si svelerà durante la Missione...",
    icon: "🏆",
    action: "click",
    position: "bottom",
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true
  },
  // 5. STATO MISSIONE
  {
    id: "mission-card",
    page: "/home",
    targetSelector: '[data-onboarding="mission-card"]',
    title: "📋 MISSIONE",
    description: "Stato missione: indizi e tempo rimasto.",
    icon: "📋",
    action: "click",
    position: "top",
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true
  },
  // 6. M1SSION BATTLE
  {
    id: "battle",
    page: "/home",
    targetSelector: '[data-onboarding="battle"]',
    title: "⚔️ BATTLE",
    description: "Sfida altri agenti e vinci M1U!",
    icon: "⚔️",
    action: "click",
    position: "top",
    spotlightPadding: 12,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true
  },
  // 7. INVITE
  {
    id: "invite",
    page: "/home",
    targetSelector: '[data-onboarding="invite"]',
    title: "👥 INVITA",
    description: "Invita amici e guadagna +25 PE!",
    icon: "👥",
    action: "click",
    position: "left",
    spotlightPadding: 8,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true
  },
  // ═══════════════════════════════════════════════════════════════
  // 🗺️ MAP PAGE (Step 8)
  // ═══════════════════════════════════════════════════════════════
  // 8. BUZZ MAP BUTTON
  {
    id: "buzz-map-button",
    page: "/map-3d-tiler",
    targetSelector: '[data-onboarding="buzz-map-button"]',
    title: "✨ BUZZ MAP",
    description: "Marker 🔴 = Agenti sfidabili. 99 Reward nascosti con premi instant!",
    icon: "✨",
    action: "click",
    position: "top",
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true
  },
  // ═══════════════════════════════════════════════════════════════
  // 🎰 BUZZ PAGE (Step 9-10)
  // ═══════════════════════════════════════════════════════════════
  // 9. NAVIGAZIONE
  {
    id: "bottom-nav",
    page: "/buzz",
    targetSelector: '[data-onboarding="bottom-nav"]',
    title: "🧭 NAV",
    description: "Naviga tra le sezioni dell'app!",
    icon: "🧭",
    action: "click",
    position: "top",
    spotlightPadding: 8,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true
  },
  // 10. BUZZ BUTTON
  {
    id: "buzz-button",
    page: "/buzz",
    targetSelector: '[data-onboarding="buzz-button"]',
    title: "🎰 BUZZ",
    description: "Ottieni hint sugli indizi!",
    icon: "🎰",
    action: "click",
    position: "top",
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true
  },
  // ═══════════════════════════════════════════════════════════════
  // 🤖 INTELLIGENCE PAGE (Step 11)
  // ═══════════════════════════════════════════════════════════════
  // 11. AI AION
  {
    id: "ai-chat",
    page: "/intelligence",
    targetSelector: '[data-onboarding="ai-chat"]',
    title: "🔮 AION",
    description: "L'Oracolo di M1SSION. Solo lui conosce tutti i segreti. Chiedi a lui.",
    icon: "🔮",
    action: "click",
    position: "top",
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true
  },
  // ═══════════════════════════════════════════════════════════════
  // 🎉 FINE TUTORIAL (Step 12)
  // ═══════════════════════════════════════════════════════════════
  // 12. FINE TUTORIAL
  {
    id: "tutorial-complete",
    page: "/home",
    targetSelector: '[data-onboarding="m1ssion-title"]',
    title: "🎉 COMPLETATO!",
    description: "Ora sei pronto per M1SSION!",
    icon: "🎉",
    action: "click",
    position: "bottom",
    spotlightPadding: 20,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: false,
    isFinalStep: true
  }
];
const ONBOARDING_STEPS_LITE = [
  // 1. MAPPA - Il cuore del gioco
  {
    id: "map-intro",
    page: "/map-3d-tiler",
    targetSelector: '[data-onboarding="buzz-map-button"]',
    title: "🗺️ ESPLORA LA MAPPA",
    description: "Questo è il tuo campo di gioco! Cerca i marker 🔴 per trovare indizi e premi.",
    icon: "🗺️",
    action: "info",
    position: "top",
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true
  },
  // 2. BUZZ - Come ottenere indizi
  {
    id: "buzz-intro",
    page: "/buzz",
    targetSelector: '[data-onboarding="buzz-button"]',
    title: "🎰 OTTIENI INDIZI",
    description: "Premi BUZZ per ottenere hint che ti avvicinano al tesoro!",
    icon: "🎰",
    action: "info",
    position: "top",
    spotlightPadding: 16,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: true
  },
  // 3. FINE - Sei pronto!
  {
    id: "ready",
    page: "/map-3d-tiler",
    targetSelector: '[data-onboarding="bottom-nav"]',
    title: "🎉 SEI PRONTO!",
    description: "Usa la navigazione per esplorare. Buona caccia al tesoro!",
    icon: "🎉",
    action: "info",
    position: "top",
    spotlightPadding: 8,
    autoAdvanceOnClick: true,
    highlightPulse: true,
    skipIfNotFound: false,
    isFinalStep: true
  }
];
const ACTIVE_STEPS = ONBOARDING_STEPS_LITE ;
ACTIVE_STEPS.reduce((acc, step) => {
  if (!acc[step.page]) acc[step.page] = [];
  acc[step.page].push(step);
  return acc;
}, {});
const PAGE_ORDER = ["/map-3d-tiler", "/buzz"] ;

const OnboardingContext = reactExports.createContext(null);
function useOnboarding() {
  const context = reactExports.useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}

const PAGE_ICONS = {
  "/home": /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "w-4 h-4" }),
  "/map-3d-tiler": /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "w-4 h-4" }),
  "/buzz": /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4" }),
  "/ai": /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "w-4 h-4" }),
  "/notice": /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-4 h-4" }),
  "/leaderboard": /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-4 h-4" })
};
function OnboardingSandbox() {
  const {
    isActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    progressPercent,
    isCompleted,
    isSkipped,
    isSandboxMode,
    startOnboarding,
    nextStep,
    prevStep,
    goToStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
    pauseOnboarding,
    resumeOnboarding,
    enableSandboxMode,
    disableSandboxMode
  } = useOnboarding();
  const [showOptions, setShowOptions] = reactExports.useState(false);
  const [forceShow, setForceShow] = reactExports.useState(false);
  const handleStartTest = () => {
    hapticLight();
    enableSandboxMode();
    startOnboarding();
  };
  const handleStopTest = () => {
    hapticLight();
    disableSandboxMode();
    pauseOnboarding();
  };
  const handleReset = () => {
    hapticLight();
    resetOnboarding();
  };
  const getStepStatus = (index) => {
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "pending";
  };
  const stepsByPage = PAGE_ORDER.map((page) => ({
    page,
    steps: ONBOARDING_STEPS.filter((s) => s.page === page),
    startIndex: ONBOARDING_STEPS.findIndex((s) => s.page === page)
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        className: "text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "w-8 h-8 text-cyan-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-orbitron font-bold text-white", children: "ONBOARDING SANDBOX" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400", children: "Testa il tutorial interattivo prima di pubblicarlo" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-gray-800/50 border-gray-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-5 h-5 text-cyan-400" }),
        "Stato Onboarding"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg", children: [
            isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 text-green-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-gray-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-300", children: isActive ? "Attivo" : "Inattivo" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg", children: [
            isCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 text-green-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-yellow-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-300", children: isCompleted ? "Completato" : "Non completato" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg", children: [
            isSkipped ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 text-gray-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-300", children: isSkipped ? "Skippato" : "Non skippato" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg", children: [
            isSandboxMode ? /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "w-4 h-4 text-purple-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "w-4 h-4 text-gray-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-300", children: isSandboxMode ? "Sandbox ON" : "Sandbox OFF" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Progresso" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-cyan-400 font-medium", children: [
              currentStepIndex + 1,
              " / ",
              totalSteps
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progressPercent, className: "h-2" })
        ] }),
        currentStep && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: currentStep.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-white", children: currentStep.title })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-400", children: [
            "Pagina: ",
            currentStep.page
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-400", children: [
            "Target: ",
            currentStep.targetSelector.split(",")[0]
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-gray-800/50 border-gray-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-5 h-5 text-green-400" }),
        "Controlli Test"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          !isActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: handleStartTest,
              className: "bg-green-600 hover:bg-green-700",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 mr-2" }),
                "Avvia Test"
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: handleStopTest,
              variant: "outline",
              className: "border-yellow-500 text-yellow-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "w-4 h-4 mr-2" }),
                "Pausa"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: handleReset,
              variant: "outline",
              className: "border-red-500 text-red-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-4 h-4 mr-2" }),
                "Reset"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: skipOnboarding,
              variant: "outline",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SkipForward, { className: "w-4 h-4 mr-2" }),
                "Salta Tutto"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: prevStep,
              disabled: currentStepIndex === 0,
              variant: "outline",
              size: "sm",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-sm flex-1 text-center", children: "Naviga tra gli step" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: nextStep,
              disabled: currentStepIndex >= totalSteps - 1,
              variant: "outline",
              size: "sm",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" })
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-gray-800/50 border-gray-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-5 h-5 text-purple-400" }),
        "Vai a Step"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: stepsByPage.map(({ page, steps, startIndex }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-gray-300", children: [
          PAGE_ICONS[page],
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: page }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
            "(",
            steps.length,
            " step)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 ml-6", children: steps.map((step, i) => {
          const globalIndex = startIndex + i;
          const status = getStepStatus(globalIndex);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                hapticLight();
                goToStep(globalIndex);
              },
              className: `
                            w-8 h-8 rounded-lg text-xs font-medium transition-all
                            ${status === "completed" ? "bg-green-600/30 text-green-400 border border-green-500/30" : status === "current" ? "bg-cyan-600/30 text-cyan-400 border border-cyan-500/50 ring-2 ring-cyan-500/30" : "bg-gray-700/30 text-gray-400 border border-gray-600/30 hover:bg-gray-700/50"}
                          `,
              title: step.title,
              children: globalIndex + 1
            },
            step.id
          );
        }) })
      ] }, page)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-gray-800/50 border-gray-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-lg", children: [
        "📋 Tutti gli Step (",
        totalSteps,
        ")"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-96 overflow-y-auto space-y-2 pr-2", children: ONBOARDING_STEPS.map((step, index) => {
        const status = getStepStatus(index);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.button,
          {
            onClick: () => {
              hapticLight();
              goToStep(index);
            },
            className: `
                      w-full p-3 rounded-lg text-left transition-all
                      ${status === "current" ? "bg-cyan-900/30 border border-cyan-500/50" : "bg-gray-700/20 border border-gray-700/50 hover:bg-gray-700/30"}
                    `,
            whileHover: { scale: 1.01 },
            whileTap: { scale: 0.99 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                        ${status === "completed" ? "bg-green-600 text-white" : status === "current" ? "bg-cyan-600 text-white" : "bg-gray-600 text-gray-300"}
                      `, children: status === "completed" ? "✓" : index + 1 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: step.icon }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-medium truncate ${status === "current" ? "text-cyan-400" : "text-white"}`, children: step.title })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-0.5 truncate", children: [
                  step.page,
                  " • ",
                  step.action
                ] })
              ] })
            ] })
          },
          step.id
        );
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-xs text-gray-500 pb-4", children: "© 2025 Joseph MULÉ – M1SSION™ – Onboarding Sandbox v1.0" })
  ] }) });
}

export { OnboardingSandbox as default };
