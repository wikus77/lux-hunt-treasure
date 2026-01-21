import { j as jsxRuntimeExports } from './ui-vendor.sKtoNQj2.js';
import { r as reactExports } from './react-vendor.FGvtrp7q.js';
import { c as createLucideIcon, aO as Play, G as Gift, b5 as RotateCcw, cx as DNAModal, cy as WelcomeBonusModal } from './index.C8SyQ7Ep.js';
import { m as motion } from './animation-vendor.BT4oAzOt.js';
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


const Dna = createLucideIcon("Dna", [
  ["path", { d: "m10 16 1.5 1.5", key: "11lckj" }],
  ["path", { d: "m14 8-1.5-1.5", key: "1ohn8i" }],
  ["path", { d: "M15 2c-1.798 1.998-2.518 3.995-2.807 5.993", key: "80uv8i" }],
  ["path", { d: "m16.5 10.5 1 1", key: "696xn5" }],
  ["path", { d: "m17 6-2.891-2.891", key: "xu6p2f" }],
  ["path", { d: "M2 15c6.667-6 13.333 0 20-6", key: "1pyr53" }],
  ["path", { d: "m20 9 .891.891", key: "3xwk7g" }],
  ["path", { d: "M3.109 14.109 4 15", key: "q76aoh" }],
  ["path", { d: "m6.5 12.5 1 1", key: "cs35ky" }],
  ["path", { d: "m7 18 2.891 2.891", key: "1sisit" }],
  ["path", { d: "M9 22c1.798-1.998 2.518-3.995 2.807-5.993", key: "q3hbxp" }]
]);

const OnboardingSandbox = () => {
  const [showDNAModal, setShowDNAModal] = reactExports.useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = reactExports.useState(false);
  const [dnaResult, setDnaResult] = reactExports.useState(null);
  const [welcomeCompleted, setWelcomeCompleted] = reactExports.useState(false);
  const handleDNAComplete = (scores) => {
    setDnaResult(scores);
    setShowDNAModal(false);
  };
  const handleDNASkip = () => {
    setShowDNAModal(false);
  };
  const handleWelcomeComplete = () => {
    setWelcomeCompleted(true);
    setShowWelcomeModal(false);
  };
  const resetAll = () => {
    setDnaResult(null);
    setWelcomeCompleted(false);
    setShowDNAModal(false);
    setShowWelcomeModal(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen p-4 md:p-8",
      style: {
        background: "linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 50%, #0a0f1a 100%)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl mx-auto mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: -20 },
            animate: { opacity: 1, y: 0 },
            className: "text-center",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl md:text-4xl font-bold font-orbitron mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400", children: "ONBOARDING" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: "SANDBOX" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400", children: "Test dei componenti di onboarding M1SSION" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, x: -20 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: 0.1 },
              className: "rounded-2xl p-6",
              style: {
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(0,229,255,0.2)",
                boxShadow: "0 0 30px rgba(0,229,255,0.1)"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Dna, { className: "w-6 h-6 text-cyan-400" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-white font-orbitron", children: "DNA MODAL" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Questionario identità agente" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-300 text-sm mb-4", children: "Il DNA Modal appare dopo la registrazione per determinare l'archetipo dell'agente attraverso una serie di domande. Include preview live dell'archetipo e opzione skip." }),
                dnaResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-400 text-sm font-medium", children: "✓ DNA Completato" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-400 text-xs mt-1", children: [
                    "Scores: ",
                    JSON.stringify(dnaResult)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => setShowDNAModal(true),
                    className: "w-full py-3 px-4 rounded-xl font-semibold text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02]",
                    style: {
                      background: "linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)",
                      boxShadow: "0 0 20px rgba(0,229,255,0.3)"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-5 h-5" }),
                      "AVVIA DNA MODAL"
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, x: -20 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: 0.2 },
              className: "rounded-2xl p-6",
              style: {
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(138,43,226,0.2)",
                boxShadow: "0 0 30px rgba(138,43,226,0.1)"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-6 h-6 text-purple-400" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-white font-orbitron", children: "WELCOME BONUS" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Modal bonus 500 M1U" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-300 text-sm mb-4", children: "Il Welcome Bonus Modal appare dopo l'onboarding DNA per accreditare 500 M1U all'utente. Include animazione slot machine e effetti particellari." }),
                welcomeCompleted && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-400 text-sm font-medium", children: "✓ Bonus Completato" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-xs mt-1", children: "500 M1U accreditati (simulazione sandbox)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => setShowWelcomeModal(true),
                    className: "w-full py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]",
                    style: {
                      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                      boxShadow: "0 0 20px rgba(138,43,226,0.3)"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-5 h-5" }),
                      "AVVIA WELCOME MODAL"
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, x: -20 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: 0.3 },
              className: "rounded-2xl p-6",
              style: {
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,215,0,0.2)",
                boxShadow: "0 0 30px rgba(255,215,0,0.1)"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "🚀" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-white font-orbitron", children: "FLUSSO COMPLETO" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "DNA → Welcome Bonus" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-300 text-sm mb-4", children: "Avvia il flusso completo di onboarding: prima il DNA Modal, poi automaticamente il Welcome Bonus Modal dopo il completamento." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => {
                      resetAll();
                      setShowDNAModal(true);
                    },
                    className: "w-full py-3 px-4 rounded-xl font-semibold text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02]",
                    style: {
                      background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                      boxShadow: "0 0 20px rgba(255,215,0,0.3)"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-5 h-5" }),
                      "AVVIA FLUSSO COMPLETO"
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { delay: 0.4 },
              className: "text-center",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: resetAll,
                  className: "py-2 px-6 rounded-lg text-gray-400 hover:text-white flex items-center gap-2 mx-auto transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-4 h-4" }),
                    "Reset Sandbox"
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { delay: 0.5 },
              className: "text-center text-gray-500 text-xs mt-8",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Questa sandbox è solo per test. I dati non vengono salvati." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: "© 2025 M1SSION™ - NIYVORA KFT™" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DNAModal,
          {
            isOpen: showDNAModal,
            onComplete: (scores) => {
              handleDNAComplete(scores);
              setTimeout(() => setShowWelcomeModal(true), 500);
            },
            onSkip: handleDNASkip
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          WelcomeBonusModal,
          {
            isOpen: showWelcomeModal,
            onComplete: handleWelcomeComplete
          }
        )
      ]
    }
  );
};

export { OnboardingSandbox as default };
