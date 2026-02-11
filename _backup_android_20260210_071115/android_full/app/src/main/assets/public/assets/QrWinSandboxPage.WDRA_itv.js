import { r as reactExports, j as jsxRuntimeExports, A as AnimatePresence, m as motion } from './animation-vendor.BiI6PE8T.js';
import { c as createLucideIcon, X, bP as CircleCheck, S as Sparkles, bj as ChevronRight, G as Gift, aE as Crown } from './index.CUdqZWfi.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const ShieldCheck = createLucideIcon("ShieldCheck", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);

const CAROUSEL_PRIZES = [
  {
    id: "porsche-911-cabrio",
    title: "Porsche 911 Cabrio",
    subtitle: "La leggenda su quattro ruote",
    tag: "SUPERCAR",
    imageUrl: "/assets/prizes/auto-reali/PORSCHE 911_CABRIO.png",
    rarity: "legendary",
    value: "€150,000+"
  },
  {
    id: "tudor",
    title: "Tudor",
    subtitle: "Eleganza senza tempo",
    tag: "LUXURY WATCH",
    imageUrl: "/assets/prizes/orologi-reali/TUDOR.png",
    rarity: "legendary",
    value: "€4,500+"
  },
  {
    id: "chanel",
    title: "Chanel",
    subtitle: "Icona della haute couture",
    tag: "FASHION",
    imageUrl: "/assets/prizes/borse-reali/CHANEL.png",
    rarity: "legendary",
    value: "€8,000+"
  },
  {
    id: "iphone-01",
    title: "iPhone",
    subtitle: "Il meglio della tecnologia",
    tag: "TECH",
    imageUrl: "/assets/prizes/99premi/IPHONE_01.png",
    rarity: "epic",
    value: "€1,200+"
  }
];
const MINI_PRIZES_POOL = [
  // Auto
  {
    id: "ferrari-purosangue",
    title: "Ferrari Purosangue",
    subtitle: "",
    tag: "AUTO",
    imageUrl: "/assets/prizes/auto-reali/FERRARI_PUROSANGUE.png",
    rarity: "legendary",
    value: "€400,000+"
  },
  {
    id: "lamborghini",
    title: "Lamborghini",
    subtitle: "",
    tag: "AUTO",
    imageUrl: "/assets/prizes/auto-reali/LAMBORGHINI.png",
    rarity: "legendary",
    value: "€300,000+"
  },
  {
    id: "aston-martin",
    title: "Aston Martin",
    subtitle: "",
    tag: "AUTO",
    imageUrl: "/assets/prizes/auto-reali/ASTON_MARTIN.png",
    rarity: "legendary",
    value: "€200,000+"
  },
  // Orologi
  {
    id: "rolex-submariner",
    title: "Rolex Submariner",
    subtitle: "",
    tag: "OROLOGI",
    imageUrl: "/assets/prizes/orologi-reali/ROLEX SUBMARINER-ORO.png",
    rarity: "legendary",
    value: "€40,000+"
  },
  {
    id: "patek-philippe",
    title: "Patek Philippe",
    subtitle: "",
    tag: "OROLOGI",
    imageUrl: "/assets/prizes/orologi-reali/PATEK PHILIPPE.png",
    rarity: "legendary",
    value: "€80,000+"
  },
  {
    id: "omega",
    title: "Omega",
    subtitle: "",
    tag: "OROLOGI",
    imageUrl: "/assets/prizes/orologi-reali/OMEGA.png",
    rarity: "epic",
    value: "€8,000+"
  },
  // Borse
  {
    id: "hermes-birkin",
    title: "Hermès Birkin",
    subtitle: "",
    tag: "BORSE",
    imageUrl: "/assets/prizes/borse-reali/HERMES_BIRKIN.png",
    rarity: "legendary",
    value: "€15,000+"
  },
  {
    id: "louis-vuitton",
    title: "Louis Vuitton",
    subtitle: "",
    tag: "BORSE",
    imageUrl: "/assets/prizes/borse-reali/LOUIS VUITTON_CLASSIC.png",
    rarity: "epic",
    value: "€3,500+"
  },
  {
    id: "ysl",
    title: "YSL",
    subtitle: "",
    tag: "BORSE",
    imageUrl: "/assets/prizes/borse-reali/YLS.png",
    rarity: "epic",
    value: "€2,800+"
  },
  // Gioielli
  {
    id: "lingotto-oro",
    title: "Lingotto d'Oro",
    subtitle: "",
    tag: "GIOIELLI",
    imageUrl: "/assets/prizes/gioielli-reali/LINGOTTO-ORO.png",
    rarity: "legendary",
    value: "€50,000+"
  },
  {
    id: "diamanti",
    title: "Diamanti",
    subtitle: "",
    tag: "GIOIELLI",
    imageUrl: "/assets/prizes/gioielli-reali/DIAMANTI.png",
    rarity: "legendary",
    value: "€30,000+"
  },
  {
    id: "bracciale-tennis",
    title: "Bracciale Tennis",
    subtitle: "",
    tag: "GIOIELLI",
    imageUrl: "/assets/prizes/gioielli-reali/BRACCIOALE TENNIS.png",
    rarity: "epic",
    value: "€12,000+"
  },
  // Tech
  {
    id: "macbook",
    title: "MacBook Pro",
    subtitle: "",
    tag: "TECH",
    imageUrl: "/assets/prizes/99premi/MACBOOK.png",
    rarity: "rare",
    value: "€3,500+"
  },
  {
    id: "apple-watch-ultra",
    title: "Apple Watch Ultra",
    subtitle: "",
    tag: "TECH",
    imageUrl: "/assets/prizes/99premi/APPLE WATCH_ULTRA.png",
    rarity: "rare",
    value: "€900+"
  },
  {
    id: "ipad-pro",
    title: "iPad Pro",
    subtitle: "",
    tag: "TECH",
    imageUrl: "/assets/prizes/99premi/IPAD_PRO.png",
    rarity: "rare",
    value: "€1,500+"
  }
];
function getRandomMiniPrizes(count = 6) {
  const shuffled = [...MINI_PRIZES_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const PHASE_TIMING = {
  intro: 800,
  // Initial intro animation
  syncing: 8e3,
  // Scanning/syncing sequence (can be skipped)
  unlocked: 2e3,
  // Cinematic reveal (increased for drama)
  exiting: 1200
  // Fade out transition before navigation
};
const M1ssionEntryModal = ({
  isOpen,
  onClose,
  onEnter
}) => {
  const [phase, setPhase] = reactExports.useState("intro");
  const [progress, setProgress] = reactExports.useState(0);
  const audioRef = reactExports.useRef(null);
  const progressIntervalRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (isOpen) {
      setPhase("intro");
      setProgress(0);
    }
  }, [isOpen]);
  reactExports.useEffect(() => {
    if (!isOpen) return;
    if (phase === "intro") {
      const timer = setTimeout(() => {
        setPhase("syncing");
      }, PHASE_TIMING.intro);
      return () => clearTimeout(timer);
    }
    if (phase === "syncing") {
      const startTime = Date.now();
      const duration = PHASE_TIMING.syncing;
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(elapsed / duration * 100, 100);
        setProgress(newProgress);
        if (newProgress >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          setPhase("unlocked");
        }
      }, 50);
      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
    if (phase === "unlocked") {
      const timer = setTimeout(() => {
        setPhase("ready");
      }, PHASE_TIMING.unlocked);
      return () => clearTimeout(timer);
    }
  }, [phase, isOpen]);
  const handleSkip = reactExports.useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setProgress(100);
    setPhase("ready");
  }, []);
  const handleEnterClick = reactExports.useCallback(() => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 80]);
      }
    } catch (e) {
    }
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.7;
        const playPromise = audioRef.current.play();
        if (playPromise !== void 0) {
          playPromise.catch(() => {
          });
        }
      }
    } catch (e) {
    }
    setPhase("exiting");
  }, []);
  reactExports.useEffect(() => {
    if (phase === "exiting") {
      const timer = setTimeout(() => {
        onEnter();
      }, PHASE_TIMING.exiting);
      return () => clearTimeout(timer);
    }
  }, [phase, onEnter]);
  reactExports.useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m1-entry-overlay", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "audio",
      {
        ref: audioRef,
        preload: "auto",
        playsInline: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("source", { src: "/assets/audio/m1ssion-entry.mp3", type: "audio/mpeg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("source", { src: "/assets/audio/m1ssion-entry.ogg", type: "audio/ogg" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "m1-entry-backdrop",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.5 }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-vignette" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-grain" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "m1-entry-glow",
        initial: { scale: 0.5, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.8, ease: "easeOut" }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "m1-entry-modal",
        initial: { scale: 0.9, opacity: 0, y: 20 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.9, opacity: 0, y: 20 },
        transition: {
          type: "spring",
          duration: 0.6,
          delay: 0.1
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.button,
            {
              className: "m1-entry-close",
              onClick: onClose,
              whileHover: { scale: 1.1 },
              whileTap: { scale: 0.9 },
              "aria-label": "Chiudi",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
            }
          ),
          (phase === "intro" || phase === "syncing") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "m1-entry-content",
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m1-entry-badge", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-badge-dot" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "ACCESSO CONFERMATO" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m1-entry-scanner", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-scanner-ring" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-scanner-ring delay-1" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-scanner-ring delay-2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-scanner-core", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-8 h-8 text-cyan-400" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.p,
                  {
                    className: "m1-entry-status",
                    animate: { opacity: [0.5, 1, 0.5] },
                    transition: { duration: 1.5, repeat: Infinity },
                    children: [
                      progress < 30 && "SINCRONIZZAZIONE...",
                      progress >= 30 && progress < 70 && "VERIFICA CREDENZIALI...",
                      progress >= 70 && "INIZIALIZZAZIONE SISTEMA..."
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-progress", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "m1-entry-progress-bar",
                    style: { width: `${progress}%` }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.button,
                  {
                    className: "m1-entry-skip",
                    onClick: handleSkip,
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: { delay: 1.5 },
                    children: "Salta →"
                  }
                )
              ]
            }
          ),
          phase === "unlocked" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "m1-entry-content m1-entry-unlocked-phase",
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "m1-entry-flash",
                    initial: { opacity: 1, scale: 0.5 },
                    animate: { opacity: 0, scale: 3 },
                    transition: { duration: 0.8, ease: "easeOut" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-particles-burst", children: [...Array(12)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "m1-entry-particle-burst",
                    initial: {
                      x: 0,
                      y: 0,
                      opacity: 1,
                      scale: 1
                    },
                    animate: {
                      x: Math.cos(i / 12 * Math.PI * 2) * 120,
                      y: Math.sin(i / 12 * Math.PI * 2) * 120,
                      opacity: 0,
                      scale: 0
                    },
                    transition: {
                      duration: 1.2,
                      ease: "easeOut",
                      delay: 0.1
                    }
                  },
                  i
                )) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    className: "m1-entry-unlock-icon-container",
                    initial: { scale: 0 },
                    animate: { scale: 1 },
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                      delay: 0.2
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-unlock-glow" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-unlock-ring" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-unlock-ring delay" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          className: "m1-entry-unlock-icon",
                          initial: { scale: 0, rotate: -45 },
                          animate: { scale: 1, rotate: 0 },
                          transition: { delay: 0.3, type: "spring", stiffness: 200 },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-16 h-16 text-emerald-400" })
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    className: "m1-entry-unlock-text",
                    initial: { opacity: 0, y: 30 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.5, duration: 0.6 },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.span,
                        {
                          className: "m1-entry-unlock-label",
                          initial: { opacity: 0 },
                          animate: { opacity: 1 },
                          transition: { delay: 0.6 },
                          children: "VERIFICA COMPLETATA"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.h2,
                        {
                          className: "m1-entry-unlock-title",
                          initial: { opacity: 0, scale: 0.8 },
                          animate: { opacity: 1, scale: 1 },
                          transition: { delay: 0.7, duration: 0.5 },
                          children: "DIVENTA UN AGENTE"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        motion.div,
                        {
                          className: "m1-entry-unlock-sparkles",
                          initial: { opacity: 0 },
                          animate: { opacity: 1 },
                          transition: { delay: 0.9 },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "IL SISTEMA TI RICONOSCE" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5" })
                          ]
                        }
                      )
                    ]
                  }
                )
              ]
            }
          ),
          phase === "ready" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "m1-entry-content",
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m1-entry-badge success", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-badge-dot success" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "SISTEMA PRONTO" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.h1,
                  {
                    className: "m1-entry-title",
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.1 },
                    children: [
                      "BENVENUTO IN",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "m1-entry-title-brand", children: "M1SSION™" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    className: "m1-entry-subtitle",
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: { delay: 0.3 },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "La tua identità è stata verificata." }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "m1-entry-highlight", children: "I Premi Attivi sono reali. La caccia è iniziata." })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    className: "m1-entry-actions",
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.5 },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          className: "m1-entry-cta-primary",
                          onClick: handleEnterClick,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "ENTRA ORA" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-5 h-5" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "m1-entry-cta-shine" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          className: "m1-entry-cta-secondary",
                          onClick: onClose,
                          children: "Non ora"
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.p,
                  {
                    className: "m1-entry-legal",
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: { delay: 0.7 },
                    children: "Non è un gioco d'azzardo. Accesso digitale gratuito."
                  }
                )
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: phase === "exiting" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "m1-entry-exit-overlay",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.6, ease: "easeInOut" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "m1-entry-exit-glow",
              initial: { scale: 0, opacity: 0.8 },
              animate: { scale: 4, opacity: 0 },
              transition: { duration: 1.2, ease: "easeOut" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "m1-entry-exit-content",
              initial: { opacity: 1, scale: 1 },
              animate: { opacity: 0, scale: 0.95 },
              transition: { duration: 0.8, delay: 0.3 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "m1-entry-exit-icon",
                    initial: { rotate: 0 },
                    animate: { rotate: 180 },
                    transition: { duration: 1 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-8 h-8 text-cyan-400" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.p,
                  {
                    className: "m1-entry-exit-text",
                    initial: { opacity: 1 },
                    animate: { opacity: 0 },
                    transition: { duration: 0.5, delay: 0.2 },
                    children: "INIZIALIZZAZIONE..."
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "m1-entry-exit-black",
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { duration: 0.5, delay: 0.7 }
            }
          )
        ]
      }
    ) })
  ] }) });
};

const STORAGE_KEY = "m1ssion_sound";
const DEFAULT_VOLUME = 0.65;
const isIOS = () => {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};
function useSound() {
  const [soundEnabled, setSoundEnabled] = reactExports.useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = reactExports.useState(false);
  const audioContextRef = reactExports.useRef(null);
  const gainNodeRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "1") {
      setSoundEnabled(true);
    }
  }, []);
  const initAudioContext = reactExports.useCallback(async () => {
    if (audioContextRef.current) return audioContextRef.current;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      const gainNode = ctx.createGain();
      gainNode.gain.value = DEFAULT_VOLUME;
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      setIsAudioUnlocked(true);
      return ctx;
    } catch (e) {
      return null;
    }
  }, []);
  const enableSound = reactExports.useCallback(async () => {
    try {
      const ctx = await initAudioContext();
      if (ctx) {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        setSoundEnabled(true);
        localStorage.setItem(STORAGE_KEY, "1");
        setIsAudioUnlocked(true);
        if ("vibrate" in navigator) {
          navigator.vibrate([20, 30, 20]);
        }
      }
    } catch (e) {
    }
  }, [initAudioContext]);
  const createScanSound = reactExports.useCallback((ctx, destination) => {
    const now = ctx.currentTime;
    const duration = 0.3;
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = "square";
    clickOsc.frequency.setValueAtTime(1200, now);
    clickOsc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    clickGain.gain.setValueAtTime(0.3, now);
    clickGain.gain.exponentialRampToValueAtTime(1e-3, now + duration);
    clickOsc.connect(clickGain);
    clickGain.connect(destination);
    clickOsc.start(now);
    clickOsc.stop(now + duration);
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepOsc.type = "sine";
    sweepOsc.frequency.setValueAtTime(800, now + 0.05);
    sweepOsc.frequency.exponentialRampToValueAtTime(2e3, now + 0.2);
    sweepGain.gain.setValueAtTime(0.15, now + 0.05);
    sweepGain.gain.exponentialRampToValueAtTime(1e-3, now + duration);
    sweepOsc.connect(sweepGain);
    sweepGain.connect(destination);
    sweepOsc.start(now + 0.05);
    sweepOsc.stop(now + duration);
  }, []);
  const createVictorySound = reactExports.useCallback((ctx, destination) => {
    const now = ctx.currentTime;
    const duration = 1;
    const iosMultiplier = isIOS() ? 0.7 : 1;
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = "sine";
    bassOsc.frequency.setValueAtTime(80 * iosMultiplier, now);
    bassOsc.frequency.exponentialRampToValueAtTime(40 * iosMultiplier, now + 0.3);
    bassGain.gain.setValueAtTime(0.5 * iosMultiplier, now);
    bassGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.5);
    bassOsc.connect(bassGain);
    bassGain.connect(destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.5);
    const shimmerFreqs = [800, 1200, 1600, 2e3];
    shimmerFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + 0.1);
      osc.frequency.setValueAtTime(freq * 1.5, now + 0.4);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.15 + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + duration);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now + 0.1 + i * 0.03);
      osc.stop(now + duration);
    });
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noiseSource = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    noiseSource.buffer = noiseBuffer;
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 3e3;
    noiseGain.gain.setValueAtTime(0.15, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(1e-3, now + 0.25);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(destination);
    noiseSource.start(now + 0.05);
  }, []);
  const createShimmerSound = reactExports.useCallback((ctx, destination) => {
    const now = ctx.currentTime;
    const duration = 0.8;
    const freqs = [2e3, 2400, 3e3, 3600, 4200];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + duration);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + duration);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now + i * 0.1);
      osc.stop(now + duration);
    });
  }, []);
  const createEntrySound = reactExports.useCallback((ctx, destination) => {
    const now = ctx.currentTime;
    const iosMultiplier = isIOS() ? 0.7 : 1;
    const subBass = ctx.createOscillator();
    const subGain = ctx.createGain();
    subBass.type = "sine";
    subBass.frequency.setValueAtTime(40 * iosMultiplier, now);
    subBass.frequency.exponentialRampToValueAtTime(25 * iosMultiplier, now + 0.8);
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.4 * iosMultiplier, now + 0.1);
    subGain.gain.exponentialRampToValueAtTime(1e-3, now + 1.2);
    subBass.connect(subGain);
    subGain.connect(destination);
    subBass.start(now);
    subBass.stop(now + 1.2);
    const swooshBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const swooshData = swooshBuffer.getChannelData(0);
    for (let i = 0; i < swooshData.length; i++) {
      swooshData[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const swooshSource = ctx.createBufferSource();
    const swooshFilter = ctx.createBiquadFilter();
    const swooshGain = ctx.createGain();
    swooshSource.buffer = swooshBuffer;
    swooshFilter.type = "bandpass";
    swooshFilter.Q.value = 2;
    swooshFilter.frequency.setValueAtTime(200, now);
    swooshFilter.frequency.exponentialRampToValueAtTime(4e3, now + 0.8);
    swooshFilter.frequency.exponentialRampToValueAtTime(800, now + 1.2);
    swooshGain.gain.setValueAtTime(0, now);
    swooshGain.gain.linearRampToValueAtTime(0.25, now + 0.5);
    swooshGain.gain.exponentialRampToValueAtTime(1e-3, now + 1.5);
    swooshSource.connect(swooshFilter);
    swooshFilter.connect(swooshGain);
    swooshGain.connect(destination);
    swooshSource.start(now);
    const impactOsc = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impactOsc.type = "sine";
    impactOsc.frequency.setValueAtTime(120 * iosMultiplier, now + 0.8);
    impactOsc.frequency.exponentialRampToValueAtTime(50 * iosMultiplier, now + 1.1);
    impactGain.gain.setValueAtTime(0.6 * iosMultiplier, now + 0.8);
    impactGain.gain.exponentialRampToValueAtTime(1e-3, now + 1.3);
    impactOsc.connect(impactGain);
    impactGain.connect(destination);
    impactOsc.start(now + 0.8);
    impactOsc.stop(now + 1.3);
    const shimmerFreqs = [800, 1e3, 1200, 1500, 2e3, 2400];
    shimmerFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + 0.85);
      osc.frequency.setValueAtTime(freq * 1.2, now + 1.5);
      gain.gain.setValueAtTime(0, now + 0.85);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.95 + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 2.5);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now + 0.85 + i * 0.02);
      osc.stop(now + 2.5);
    });
    const sparkleOsc = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkleOsc.type = "sine";
    sparkleOsc.frequency.setValueAtTime(3e3, now + 0.9);
    sparkleOsc.frequency.exponentialRampToValueAtTime(4500, now + 1.2);
    sparkleOsc.frequency.exponentialRampToValueAtTime(2e3, now + 2);
    sparkleGain.gain.setValueAtTime(0, now + 0.9);
    sparkleGain.gain.linearRampToValueAtTime(0.1, now + 1);
    sparkleGain.gain.exponentialRampToValueAtTime(1e-3, now + 2.2);
    sparkleOsc.connect(sparkleGain);
    sparkleGain.connect(destination);
    sparkleOsc.start(now + 0.9);
    sparkleOsc.stop(now + 2.2);
  }, []);
  const playSound = reactExports.useCallback((type) => {
    if (!soundEnabled || !audioContextRef.current || !gainNodeRef.current) return;
    const ctx = audioContextRef.current;
    const destination = gainNodeRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    switch (type) {
      case "scan":
        createScanSound(ctx, destination);
        break;
      case "victory":
        createVictorySound(ctx, destination);
        break;
      case "shimmer":
        createShimmerSound(ctx, destination);
        break;
      case "entry":
        createEntrySound(ctx, destination);
        break;
    }
  }, [soundEnabled, createScanSound, createVictorySound, createShimmerSound, createEntrySound]);
  return {
    soundEnabled,
    enableSound,
    playSound,
    isAudioUnlocked
  };
}

const CAROUSEL_INTERVAL = 3500;
const PrizeShowcase = ({ onContinue }) => {
  const [currentSlide, setCurrentSlide] = reactExports.useState(0);
  const [carouselImageErrors, setCarouselImageErrors] = reactExports.useState({});
  const [miniImageErrors, setMiniImageErrors] = reactExports.useState({});
  const [isEntryModalOpen, setIsEntryModalOpen] = reactExports.useState(false);
  const { enableSound, playSound } = useSound();
  const miniPrizes = reactExports.useMemo(() => getRandomMiniPrizes(6), []);
  reactExports.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_PRIZES.length);
    }, CAROUSEL_INTERVAL);
    return () => clearInterval(timer);
  }, []);
  const handleCarouselImageError = (index) => {
    setCarouselImageErrors((prev) => ({ ...prev, [index]: true }));
  };
  const handleMiniImageError = (id) => {
    setMiniImageErrors((prev) => ({ ...prev, [id]: true }));
  };
  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case "legendary":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-3 h-3 mr-1" });
      case "epic":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3 h-3 mr-1" });
      default:
        return null;
    }
  };
  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case "legendary":
        return "LEGGENDARIO";
      case "epic":
        return "EPICO";
      case "rare":
        return "RARO";
      default:
        return "COMUNE";
    }
  };
  const currentPrize = CAROUSEL_PRIZES[currentSlide];
  const handleCtaClick = reactExports.useCallback(() => {
    {
      enableSound();
      setIsEntryModalOpen(true);
    }
  }, [enableSound, onContinue]);
  const handleModalEnter = reactExports.useCallback(() => {
    playSound("entry");
    onContinue();
  }, [playSound, onContinue]);
  const handleModalClose = reactExports.useCallback(() => {
    setIsEntryModalOpen(false);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-showcase", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-showcase-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-showcase-badge", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-showcase-badge-dot" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "qrwin-showcase-badge-text", children: "Accesso Confermato" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "qrwin-showcase-title", children: "Premi Attivi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "qrwin-showcase-subtitle", children: "Questi premi sono attualmente in palio nella missione" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-showcase-content", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-hero-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-carousel", children: CAROUSEL_PRIZES.map((prize, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `qrwin-carousel-slide ${index === currentSlide ? "active" : ""}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-hero-image", children: [
              !carouselImageErrors[index] ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: prize.imageUrl,
                  alt: prize.title,
                  onError: () => handleCarouselImageError(index)
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-hero-image-fallback", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-16 h-16" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "qrwin-hero-tag", children: prize.tag }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "qrwin-hero-rarity", children: [
                getRarityIcon(prize.rarity),
                getRarityLabel(prize.rarity)
              ] })
            ] })
          },
          prize.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-carousel-indicators", children: CAROUSEL_PRIZES.map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `qrwin-carousel-dot ${index === currentSlide ? "active" : ""}`,
            onClick: () => setCurrentSlide(index),
            "aria-label": `Slide ${index + 1}`
          },
          index
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-hero-body", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "qrwin-hero-title", children: currentPrize.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "qrwin-hero-subtitle", children: currentPrize.subtitle }),
          currentPrize.value && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "qrwin-hero-value", children: currentPrize.value })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-mini-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "qrwin-mini-title", children: "Altri Premi Disponibili" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-mini-scroll", children: miniPrizes.map((prize) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-mini-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-mini-image", children: !miniImageErrors[prize.id] ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: prize.imageUrl,
              alt: prize.title,
              onError: () => handleMiniImageError(prize.id)
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-mini-body", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "qrwin-mini-name", children: prize.title }),
            prize.value && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "qrwin-mini-value", children: prize.value })
          ] })
        ] }, prize.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-cta-footer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "qrwin-cta-button",
          onClick: handleCtaClick,
          children: "Entra in M1SSION"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "qrwin-legal", children: "Non è un gioco d'azzardo. Nessun premio in denaro. Accesso digitale gratuito e temporaneo." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      M1ssionEntryModal,
      {
        isOpen: isEntryModalOpen,
        onClose: handleModalClose,
        onEnter: handleModalEnter
      }
    )
  ] });
};

const VIDEO_SRC = "/assets/video/M1QR-WIN-v2.mp4";
const TIMING = {
  checking: 2400,
  success: 1380,
  fadeOut: 800,
  // fade transition duration (increased for smoother effect)
  videoFade: 1e3
  // video fade out duration
};
const QrWinFlow = () => {
  const [phase, setPhase] = reactExports.useState("video");
  const videoRef = reactExports.useRef(null);
  const [videoError, setVideoError] = reactExports.useState(false);
  const [audioEnabled, setAudioEnabled] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (phase === "video" && videoRef.current) {
      const video = videoRef.current;
      const tryUnmute = () => {
        video.muted = false;
        video.play().then(() => {
          setAudioEnabled(true);
        }).catch(() => {
          video.muted = true;
          video.play();
        });
      };
      setTimeout(tryUnmute, 100);
    }
  }, [phase]);
  const handleScreenTap = reactExports.useCallback(() => {
    if (videoRef.current && !audioEnabled) {
      videoRef.current.muted = false;
      setAudioEnabled(true);
    }
  }, [audioEnabled]);
  const confettiParticles = reactExports.useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const angle = i / 30 * 360;
      const distance = 150 + Math.random() * 100;
      const tx = Math.cos(angle * Math.PI / 180) * distance;
      const ty = Math.sin(angle * Math.PI / 180) * distance - 50;
      const rot = Math.random() * 720;
      const colors = ["#FFD700", "#00E5FF", "#22C55E", "#9333EA", "#FF6B6B"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 0.2;
      return { id: i, tx, ty, rot, color, delay };
    });
  }, []);
  const bgParticles = reactExports.useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 10
    }));
  }, []);
  const triggerHaptic = reactExports.useCallback(() => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(35);
      }
    } catch (e) {
    }
  }, []);
  const handleVideoEnd = reactExports.useCallback(() => {
    setPhase("video-fading");
  }, []);
  const handleVideoError = reactExports.useCallback(() => {
    setVideoError(true);
    setPhase("showcase");
  }, []);
  reactExports.useEffect(() => {
    if (phase === "video-fading") {
      const timer = setTimeout(() => {
        setPhase("showcase");
      }, TIMING.videoFade);
      return () => clearTimeout(timer);
    }
    if (phase === "checking") {
      const timer = setTimeout(() => {
        setPhase("success");
        triggerHaptic();
      }, TIMING.checking);
      return () => clearTimeout(timer);
    }
    if (phase === "success") {
      const timer = setTimeout(() => {
        setPhase("success-fading");
      }, TIMING.success);
      return () => clearTimeout(timer);
    }
    if (phase === "success-fading") {
      const timer = setTimeout(() => {
        setPhase("showcase");
      }, TIMING.fadeOut);
      return () => clearTimeout(timer);
    }
  }, [phase, triggerHaptic]);
  const handleContinue = reactExports.useCallback(() => {
    window.location.href = "https://www.m1ssion.eu/landing";
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-container", children: [
    (phase === "video" || phase === "video-fading") && !videoError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `qrwin-video-container ${phase === "video-fading" ? "qrwin-video-fading" : ""}`,
        onClick: handleScreenTap,
        onTouchStart: handleScreenTap,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "video",
            {
              ref: videoRef,
              className: "qrwin-video",
              src: VIDEO_SRC,
              autoPlay: true,
              muted: true,
              playsInline: true,
              onEnded: handleVideoEnd,
              onError: handleVideoError,
              disablePictureInPicture: true,
              disableRemotePlayback: true,
              controlsList: "nodownload noremoteplayback"
            }
          ),
          !audioEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-audio-indicator", children: "🔇" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "qrwin-video-skip",
              onClick: () => setPhase("video-fading"),
              children: "Salta →"
            }
          )
        ]
      }
    ),
    phase !== "video" && phase !== "video-fading" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-bg-gradient" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-particles", children: bgParticles.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "qrwin-particle",
          style: {
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }
        },
        p.id
      )) })
    ] }),
    phase === "checking" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-checking", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-scanner", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-scanner-ring" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-scanner-ring" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-scanner-ring" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-scanner-core" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-scanline" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "qrwin-checking-title", children: "Verifica accesso in corso..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "qrwin-checking-subtitle", children: "Attendere" })
    ] }),
    (phase === "success" || phase === "success-fading") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `qrwin-success ${phase === "success-fading" ? "qrwin-fade-out" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-success-flash" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-confetti", children: confettiParticles.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "qrwin-confetti-particle",
          style: {
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            "--rot": `${p.rot}deg`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`
          }
        },
        p.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "qrwin-success-icon", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "qrwin-success-glow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "qrwin-success-check" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "qrwin-success-title", children: "ACCESSO CONFERMATO" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "qrwin-success-subtitle", children: "Benvenuto in M1SSION" })
    ] }),
    phase === "showcase" && /* @__PURE__ */ jsxRuntimeExports.jsx(PrizeShowcase, { onContinue: handleContinue })
  ] });
};

const QrWinSandboxPage = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QrWinFlow, {});
};

export { QrWinSandboxPage as default };
