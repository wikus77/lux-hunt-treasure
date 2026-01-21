import { j as jsxRuntimeExports } from './ui-vendor.sKtoNQj2.js';
import { r as reactExports, c as React } from './react-vendor.FGvtrp7q.js';
import { u as useLocation, bh as trackScreen, bo as Car, bp as Watch, bq as Gem, at as ShoppingBag, bi as LandingHeader, aC as Trophy, bd as Check, B as Button, bn as ArrowRight, bk as LandingFooter } from './index.C8SyQ7Ep.js';
import { P as Package } from './package.C4_06O1A.js';
import { m as motion, A as AnimatePresence } from './animation-vendor.BT4oAzOt.js';
import './supabase-vendor.DVELIqeo.js';
import './stripe-vendor.C-6aXM1t.js';
import './map-vendor.DftgD3cK.js';
import './router-vendor.Bb8w37VQ.js';

const categories = [
  { id: "auto", title: "Auto", icon: Car, color: "#00E5FF", count: 8 },
  { id: "orologi", title: "Orologi", icon: Watch, color: "#F59E0B", count: 10 },
  { id: "gioielli", title: "Gioielli", icon: Gem, color: "#A855F7", count: 9 },
  { id: "borse", title: "Borse", icon: ShoppingBag, color: "#EC4899", count: 6 },
  { id: "tech", title: "99 Premi", icon: Package, color: "#22C55E", count: 14 }
];
const heroImages = [
  { src: "/assets/prizes/auto-reali/FERRARI_PUROSANGUE.png", name: "Ferrari Purosangue" },
  { src: "/assets/prizes/orologi-reali/PATEK PHILIPPE.png", name: "Patek Philippe" },
  { src: "/assets/prizes/gioielli-reali/DIAMANTI.png", name: "Diamanti" },
  { src: "/assets/prizes/borse-reali/HERMES_BIRKIN.png", name: "Hermès Birkin" }
];
const allPrizes = {
  auto: [
    { src: "/assets/prizes/auto-reali/FERRARI_PUROSANGUE.png", name: "Ferrari Purosangue" },
    { src: "/assets/prizes/auto-reali/LAMBORGHINI.png", name: "Lamborghini" },
    { src: "/assets/prizes/auto-reali/PORSCHE 911_CABRIO.png", name: "Porsche 911 Cabrio" },
    { src: "/assets/prizes/auto-reali/PORSCHE_CAYENNE_COUPE.png", name: "Porsche Cayenne" },
    { src: "/assets/prizes/auto-reali/PORSCHE_PANAMERA.png", name: "Porsche Panamera" },
    { src: "/assets/prizes/auto-reali/MERCEDES_AMG.png", name: "Mercedes AMG" },
    { src: "/assets/prizes/auto-reali/BMW_M3.png", name: "BMW M3" },
    { src: "/assets/prizes/auto-reali/ASTON_MARTIN.png", name: "Aston Martin" }
  ],
  orologi: [
    { src: "/assets/prizes/orologi-reali/ROLEX DAY-DATE.png", name: "Rolex Day-Date" },
    { src: "/assets/prizes/orologi-reali/PATEK PHILIPPE.png", name: "Patek Philippe" },
    { src: "/assets/prizes/orologi-reali/ROLEX SUBMARINER-ORO.png", name: "Rolex Submariner" },
    { src: "/assets/prizes/orologi-reali/CARTIER.png", name: "Cartier" },
    { src: "/assets/prizes/orologi-reali/OMEGA.png", name: "Omega" },
    { src: "/assets/prizes/orologi-reali/IWC PORTUGUESE.png", name: "IWC Portuguese" },
    { src: "/assets/prizes/orologi-reali/PANERAI.png", name: "Panerai" },
    { src: "/assets/prizes/orologi-reali/TUDOR.png", name: "Tudor" }
  ],
  gioielli: [
    { src: "/assets/prizes/gioielli-reali/DIAMANTI.png", name: "Diamanti" },
    { src: "/assets/prizes/gioielli-reali/LINGOTTO-ORO.png", name: "Lingotto Oro" },
    { src: "/assets/prizes/gioielli-reali/solitario.png", name: "Solitario" },
    { src: "/assets/prizes/gioielli-reali/BRACCIOALE TENNIS.png", name: "Bracciale Tennis" },
    { src: "/assets/prizes/gioielli-reali/collana_pietra.png", name: "Collana Preziosa" }
  ],
  borse: [
    { src: "/assets/prizes/borse-reali/HERMES_BIRKIN.png", name: "Hermès Birkin" },
    { src: "/assets/prizes/borse-reali/HERMES_BIRKIN_COCCODRILLO.png", name: "Birkin Coccodrillo" },
    { src: "/assets/prizes/borse-reali/CHANEL.png", name: "Chanel" },
    { src: "/assets/prizes/borse-reali/LOUIS VUITTON_CLASSIC.png", name: "Louis Vuitton" },
    { src: "/assets/prizes/borse-reali/YLS.png", name: "YSL" }
  ],
  tech: [
    { src: "/assets/prizes/99premi/IPHONE.png", name: "iPhone Pro Max" },
    { src: "/assets/prizes/99premi/MACBOOK.png", name: "MacBook Pro" },
    { src: "/assets/prizes/99premi/IPAD_PRO.png", name: "iPad Pro" },
    { src: "/assets/prizes/99premi/APPLE WATCH_ULTRA.png", name: "Apple Watch Ultra" },
    { src: "/assets/prizes/99premi/AIRPODS_PRO.png", name: "AirPods Pro" },
    { src: "/assets/prizes/99premi/RAYBAN_META.png", name: "Ray-Ban Meta" }
  ]
};
const PrizesPage = () => {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = reactExports.useState("auto");
  const [heroIndex, setHeroIndex] = reactExports.useState(0);
  const containerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    trackScreen("prizes", { source: "direct" });
  }, []);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4e3);
    return () => clearInterval(interval);
  }, []);
  const activeCategoryData = categories.find((c) => c.id === activeCategory);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[#030308] text-white overflow-x-hidden", ref: containerRef, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LandingHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 pointer-events-none z-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[#030308]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute inset-0",
          style: {
            background: `radial-gradient(ellipse at 50% 30%, ${activeCategoryData?.color || "#00E5FF"}08 0%, transparent 60%)`
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative min-h-screen flex items-center justify-center px-4 z-10 pt-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "max-w-6xl mx-auto w-full",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, x: -50 },
                animate: { opacity: 1, x: 0 },
                transition: { duration: 1 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    motion.span,
                    {
                      className: "inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 mb-6",
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      transition: { delay: 0.2 },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-3 h-3 inline mr-2" }),
                        "Premi Reali"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    motion.h1,
                    {
                      className: "text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] mb-6",
                      initial: { opacity: 0, y: 30 },
                      animate: { opacity: 1, y: 0 },
                      transition: { delay: 0.3, duration: 0.8 },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/90", children: "Vinci" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-yellow-400", children: "Davvero" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.p,
                    {
                      className: "text-xl text-white/50 max-w-md mb-8",
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      transition: { delay: 0.5 },
                      children: "Non simulazioni. Consegna fisica al vincitore."
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      className: "flex flex-wrap gap-2",
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      transition: { delay: 0.6 },
                      children: categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => {
                            setActiveCategory(cat.id);
                            document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
                          },
                          className: "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                          style: {
                            backgroundColor: activeCategory === cat.id ? `${cat.color}20` : "rgba(255,255,255,0.05)",
                            color: activeCategory === cat.id ? cat.color : "rgba(255,255,255,0.5)",
                            borderWidth: 1,
                            borderColor: activeCategory === cat.id ? `${cat.color}40` : "transparent"
                          },
                          children: cat.title
                        },
                        cat.id
                      ))
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                className: "relative h-[50vh] md:h-[60vh]",
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 1, delay: 0.3 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    motion.div,
                    {
                      className: "absolute inset-0 flex items-center justify-center",
                      initial: { opacity: 0, scale: 0.95, rotateY: 10 },
                      animate: { opacity: 1, scale: 1, rotateY: 0 },
                      exit: { opacity: 0, scale: 0.95, rotateY: -10 },
                      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          motion.div,
                          {
                            className: "absolute inset-0 rounded-3xl",
                            style: {
                              background: `radial-gradient(circle, ${categories[heroIndex % categories.length].color}20 0%, transparent 70%)`
                            },
                            animate: { opacity: [0.5, 0.8, 0.5] },
                            transition: { duration: 3, repeat: Infinity }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "img",
                          {
                            src: heroImages[heroIndex].src,
                            alt: heroImages[heroIndex].name,
                            className: "relative max-h-full max-w-full object-contain drop-shadow-2xl",
                            style: { filter: "drop-shadow(0 0 40px rgba(0,0,0,0.5))" }
                          }
                        )
                      ]
                    },
                    heroIndex
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      className: "absolute bottom-0 left-1/2 -translate-x-1/2 text-center",
                      initial: { opacity: 0, y: 10 },
                      animate: { opacity: 1, y: 0 },
                      transition: { delay: 0.3 },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/40 text-sm", children: heroImages[heroIndex].name })
                    },
                    heroImages[heroIndex].name
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2", children: heroImages.map((_, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setHeroIndex(idx),
                      className: `w-2 h-2 rounded-full transition-all duration-300 ${idx === heroIndex ? "bg-white w-6" : "bg-white/30"}`
                    },
                    idx
                  )) })
                ]
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute bottom-8 left-1/2 -translate-x-1/2",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 1.5 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              animate: { y: [0, 10, 0] },
              transition: { duration: 2, repeat: Infinity },
              className: "text-white/30 text-sm",
              children: "Scorri per esplorare"
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "gallery", className: "relative py-24 px-4 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "sticky top-16 z-20 py-4 bg-[#030308]/90 backdrop-blur-md -mx-4 px-4 mb-12",
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap justify-center gap-3", children: categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.button,
              {
                onClick: () => setActiveCategory(cat.id),
                className: "relative px-6 py-3 rounded-2xl flex items-center gap-2 font-medium transition-all duration-300",
                style: {
                  backgroundColor: isActive ? `${cat.color}15` : "transparent",
                  color: isActive ? cat.color : "rgba(255,255,255,0.5)"
                },
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.98 },
                children: [
                  isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      className: "absolute inset-0 rounded-2xl border",
                      style: { borderColor: `${cat.color}40` },
                      layoutId: "activeCategoryBorder",
                      transition: { type: "spring", stiffness: 300, damping: 30 }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: cat.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs opacity-50", children: [
                    "(",
                    cat.count,
                    ")"
                  ] })
                ]
              },
              cat.id
            );
          }) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
          transition: { duration: 0.5 },
          children: allPrizes[activeCategory]?.map((prize, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "group relative aspect-square rounded-2xl overflow-hidden cursor-pointer",
              initial: { opacity: 0, scale: 0.9 },
              animate: { opacity: 1, scale: 1 },
              transition: { delay: index * 0.05 },
              whileHover: { scale: 1.02 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "absolute inset-0",
                    style: {
                      background: `linear-gradient(135deg, ${activeCategoryData?.color}10 0%, transparent 50%)`
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-2xl border border-white/5 group-hover:border-white/20 transition-all duration-300" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-4 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: prize.src,
                    alt: prize.name,
                    className: "max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110",
                    style: { filter: "drop-shadow(0 0 20px rgba(0,0,0,0.3))" }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white font-semibold", children: prize.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3 text-green-400" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-400 text-xs", children: "Consegna reale" })
                      ] })
                    ] })
                  }
                )
              ]
            },
            prize.name
          ))
        },
        activeCategory
      ) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative py-32 px-4 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "max-w-5xl mx-auto text-center",
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true },
        transition: { duration: 1 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.h2,
            {
              className: "text-4xl md:text-6xl font-bold mb-8",
              initial: { opacity: 0, y: 40 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/90", children: "Ogni premio esiste" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-yellow-400", children: "una sola volta" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.p,
            {
              className: "text-xl text-white/50 max-w-2xl mx-auto mb-12",
              initial: { opacity: 0 },
              whileInView: { opacity: 1 },
              viewport: { once: true },
              transition: { delay: 0.3 },
              children: "Quando viene vinto, sparisce. Nessun duplicato. Nessuna simulazione. Il premio viene consegnato fisicamente al vincitore."
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "flex flex-wrap justify-center gap-4",
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { delay: 0.5 },
              children: [
                { icon: Check, text: "Premi verificati", color: "#22C55E" },
                { icon: Trophy, text: "Consegna garantita", color: "#F59E0B" },
                { icon: Gem, text: "Pezzi unici", color: "#A855F7" }
              ].map((badge) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center gap-2 px-5 py-2.5 rounded-full",
                  style: {
                    backgroundColor: `${badge.color}10`,
                    border: `1px solid ${badge.color}30`
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(badge.icon, { className: "w-4 h-4", style: { color: badge.color } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: badge.color }, className: "text-sm font-medium", children: badge.text })
                  ]
                },
                badge.text
              ))
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative py-24 px-4 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "max-w-lg mx-auto text-center",
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-12 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.p,
            {
              className: "text-white/40 text-lg mb-6",
              initial: { opacity: 0 },
              whileInView: { opacity: 1 },
              viewport: { once: true },
              children: "Pronto a vincere?"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              whileHover: { scale: 1.05 },
              whileTap: { scale: 0.98 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: () => setLocation("/register"),
                  className: "px-12 py-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-lg font-black hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] transition-all",
                  children: [
                    "INIZIA LA CACCIA",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-5 h-5 ml-2" })
                  ]
                }
              )
            }
          )
        ] })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LandingFooter, {})
  ] });
};

export { PrizesPage as default };
