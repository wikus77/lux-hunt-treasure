import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { c as createLucideIcon, bJ as useOnboarding, bK as PAGE_ORDER, bL as ONBOARDING_STEPS, v as Card, A as CardHeader, H as CardTitle, w as Settings, O as CardContent, ak as CircleCheckBig, an as CircleX, al as CircleAlert, bz as Progress, aD as Play, B as Button, ay as RotateCcw, bM as ChevronRight, E as Eye, bN as hapticLight, am as Trophy, aI as Bell, bO as Bot, Z as Zap, aL as Map, bi as House } from './index.BEQCqgv7.js';
import { m as motion } from './animation-vendor.BBMfCuXy.js';
import { T as TestTube } from './test-tube.Ck18vXQW.js';
import { P as Pause } from './pause.5qOwhCHd.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const ChevronLeft = createLucideIcon("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);

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
