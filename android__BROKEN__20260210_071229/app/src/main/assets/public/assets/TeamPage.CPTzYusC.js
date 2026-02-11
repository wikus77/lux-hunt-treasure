import { r as reactExports, j as jsxRuntimeExports, m as motion, A as AnimatePresence } from './animation-vendor.BiI6PE8T.js';
import { u as useLocation, bi as LandingHeader, U as Users, aa as ChevronLeft, bj as ChevronRight, y as Shield, aD as Globe, S as Sparkles, B as Button, bk as LandingFooter } from './index.CUdqZWfi.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

const crewMembers = [
  { src: "/assets/crew-team/CEO M1SSION.png", role: "CEO", name: "Chief Executive Officer", description: "Fondatore e visionario di M1SSION. Guida la strategia e la crescita globale." },
  { src: "/assets/crew-team/CFO M1SSION.png", role: "CFO", name: "Chief Financial Officer", description: "Gestisce le finanze e garantisce la sostenibilità dei premi reali." },
  { src: "/assets/crew-team/CTO M1SSION.png", role: "CTO", name: "Chief Technology Officer", description: "Architetto della piattaforma tecnologica e innovazione." },
  { src: "/assets/crew-team/CMO M1SSION.png", role: "CMO", name: "Chief Marketing Officer", description: "Responsabile brand, comunicazione e community." },
  { src: "/assets/crew-team/CHRO M1SSION.png", role: "CHRO", name: "Chief Human Resources Officer", description: "Sviluppa il team e la cultura aziendale M1SSION." }
];
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};
const TeamPage = () => {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % crewMembers.length);
    }, 5e3);
    return () => clearInterval(interval);
  }, []);
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % crewMembers.length);
  };
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + crewMembers.length) % crewMembers.length);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-black text-white overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LandingHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 pointer-events-none z-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-black via-[#0a0a12] to-black" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(0,229,255,0.08),transparent_60%)]",
          animate: { opacity: [0.5, 0.8, 0.5] },
          transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(168,85,247,0.06),transparent_60%)]",
          animate: { opacity: [0.4, 0.7, 0.4] },
          transition: { duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative pt-24 pb-16 px-4 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "max-w-4xl mx-auto text-center",
        initial: "hidden",
        animate: "visible",
        variants: containerVariants,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30",
              variants: itemVariants,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4 text-cyan-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 text-sm font-medium tracking-wider", children: "IL TEAM M1SSION" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.h1,
            {
              className: "text-4xl md:text-6xl font-mission font-black mb-4",
              variants: itemVariants,
              children: [
                "Chi ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400", children: "Siamo" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.p,
            {
              className: "text-xl text-gray-400 max-w-2xl mx-auto",
              variants: itemVariants,
              children: "Il team dietro M1SSION™"
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative py-12 px-4 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "relative rounded-2xl overflow-hidden border border-cyan-500/30",
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "relative aspect-[3/4] md:aspect-[4/3]",
              initial: { opacity: 0, scale: 1.1 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.95 },
              transition: { duration: 0.7 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: crewMembers[currentIndex].src,
                    alt: crewMembers[currentIndex].role,
                    className: "w-full h-full object-cover object-top"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" })
              ]
            },
            currentIndex
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "absolute bottom-0 left-0 right-0 p-6",
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.3 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 font-bold text-sm", children: crewMembers[currentIndex].role }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-white mb-2", children: crewMembers[currentIndex].name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-300", children: crewMembers[currentIndex].description })
              ]
            },
            `info-${currentIndex}`
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: prevSlide,
              className: "absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-6 h-6" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: nextSlide,
              className: "absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-6 h-6" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2", children: crewMembers.map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setCurrentIndex(index),
              className: `w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === index ? "bg-cyan-400 w-8" : "bg-white/40 hover:bg-white/60"}`
            },
            index
          )) })
        ]
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative py-12 px-4 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-8 text-center",
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 },
        whileHover: { borderColor: "rgba(0,229,255,0.4)", boxShadow: "0 0 40px rgba(0,229,255,0.1)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.h2,
            {
              className: "text-2xl font-bold text-white mb-4",
              initial: { opacity: 0 },
              whileInView: { opacity: 1 },
              transition: { delay: 0.2 },
              children: "La nostra missione"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.p,
            {
              className: "text-gray-400 text-lg leading-relaxed",
              initial: { opacity: 0 },
              whileInView: { opacity: 1 },
              transition: { delay: 0.3 },
              children: [
                "Creare esperienze che sfidano l'intelletto, premiano la deduzione e trasformano il mondo reale in un campo di gioco dove",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 font-semibold", children: " chi capisce, vince" }),
                "."
              ]
            }
          )
        ]
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative py-12 px-4 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6",
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true },
        variants: containerVariants,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "bg-white/5 border border-white/10 rounded-xl p-6 text-center group",
              variants: itemVariants,
              whileHover: { scale: 1.05, borderColor: "rgba(0,229,255,0.3)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4",
                    whileHover: { scale: 1.1, boxShadow: "0 0 30px rgba(0,229,255,0.4)" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-7 h-7 text-cyan-400" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-white font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors", children: "Trasparenza" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-sm", children: "Regole chiare, premi reali, nessuna simulazione. Quello che vedi è quello che ottieni." })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "bg-white/5 border border-white/10 rounded-xl p-6 text-center group",
              variants: itemVariants,
              whileHover: { scale: 1.05, borderColor: "rgba(168,85,247,0.3)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4",
                    whileHover: { scale: 1.1, boxShadow: "0 0 30px rgba(168,85,247,0.4)" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-7 h-7 text-purple-400" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-white font-bold text-lg mb-2 group-hover:text-purple-400 transition-colors", children: "Innovazione" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-sm", children: "Tecnologia all'avanguardia per creare esperienze che non esistevano prima." })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "bg-white/5 border border-white/10 rounded-xl p-6 text-center group",
              variants: itemVariants,
              whileHover: { scale: 1.05, borderColor: "rgba(234,179,8,0.3)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-4",
                    whileHover: { scale: 1.1, boxShadow: "0 0 30px rgba(234,179,8,0.4)" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-7 h-7 text-yellow-400" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-white font-bold text-lg mb-2 group-hover:text-yellow-400 transition-colors", children: "Eccellenza" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-sm", children: "Solo il meglio per i nostri agenti. Design, UX, premi: tutto al massimo livello." })
              ]
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative py-12 px-4 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-3xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "bg-black/40 border border-white/10 rounded-2xl p-8",
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-white mb-4", children: "Informazioni Legali" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-gray-400 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-white", children: "Ragione Sociale:" }),
              " NIYVORA KFT™"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-white", children: "Sede:" }),
              " Budapest, Ungheria"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-white", children: "Brand:" }),
              " M1SSION™"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/50 text-xs mt-4", children: "© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED" })
          ] })
        ]
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative py-16 px-4 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "max-w-xl mx-auto text-center",
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/50 mb-4", children: "Unisciti alla missione." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              whileHover: { scale: 1.05 },
              whileTap: { scale: 0.95 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: () => setLocation("/register"),
                  className: "px-10 py-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-black text-lg font-black hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] transition-all",
                  children: [
                    "ENTRA NELLA MISSIONE",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-5 h-5 ml-1" })
                  ]
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LandingFooter, {})
  ] });
};

export { TeamPage as default };
