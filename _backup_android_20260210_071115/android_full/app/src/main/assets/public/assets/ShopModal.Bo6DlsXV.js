const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index.CUdqZWfi.js","assets/animation-vendor.BiI6PE8T.js","assets/supabase-vendor.CPRn8nK0.js","assets/map-vendor.uCr1tAyj.js","assets/ui-vendor.C69ET9UU.js","assets/stripe-vendor.baQ46ET6.js","assets/router-vendor.DUjmXt3z.js","assets/index.CnkXYqkZ.css","assets/ScratchWinModal.Du1a_LFV.js","assets/LotteryContent.CXu44GVC.js","assets/ticket.W-zAhzj1.js"])))=>i.map(i=>d[i]);
import { w as useUnifiedAuth, l as useM1UnitsRealtime, S as Sparkles, X, a1 as LoaderCircle, G as Gift, z as TriangleAlert, b5 as RotateCcw, s as supabase, m as ue, _ as __vitePreload } from './index.CUdqZWfi.js';
import { r as reactExports, j as jsxRuntimeExports, A as AnimatePresence, m as motion } from './animation-vendor.BiI6PE8T.js';
import { r as reactDomExports } from './map-vendor.uCr1tAyj.js';
import './supabase-vendor.CPRn8nK0.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

const FortuneWheel = reactExports.lazy(() => __vitePreload(() => import('./index.CUdqZWfi.js').then(n => n.cH),true?__vite__mapDeps([0,1,2,3,4,5,6,7]):void 0));
const ScratchWinModal = reactExports.lazy(() => __vitePreload(() => import('./ScratchWinModal.Du1a_LFV.js'),true?__vite__mapDeps([8,1,3,0,2,4,5,6,7]):void 0));
const LotteryContent = reactExports.lazy(() => __vitePreload(() => import('./LotteryContent.CXu44GVC.js'),true?__vite__mapDeps([9,1,0,2,3,4,5,6,7,10]):void 0));
const WHEEL_STORAGE_KEY = "m1_fortune_wheel_last_spin";
const ShopModal = ({ isOpen, onClose }) => {
  const { user } = useUnifiedAuth();
  const { unitsData, refetch } = useM1UnitsRealtime(user?.id);
  const balance = unitsData?.balance ?? 0;
  const [activeTab, setActiveTab] = reactExports.useState("scratch");
  const [stats, setStats] = reactExports.useState(null);
  const [isLoadingStats, setIsLoadingStats] = reactExports.useState(false);
  const [isPurchasing, setIsPurchasing] = reactExports.useState(null);
  const [showWheel, setShowWheel] = reactExports.useState(false);
  const [canSpinWheel, setCanSpinWheel] = reactExports.useState(false);
  const [scratchPurchase, setScratchPurchase] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const checkWheel = () => {
      const lastSpin = localStorage.getItem(WHEEL_STORAGE_KEY);
      const canSpin = !lastSpin || new Date(lastSpin).toDateString() !== (/* @__PURE__ */ new Date()).toDateString();
      setCanSpinWheel(canSpin);
    };
    checkWheel();
    window.addEventListener("storage", checkWheel);
    return () => window.removeEventListener("storage", checkWheel);
  }, []);
  const loadStats = async () => {
    if (!user) return;
    setIsLoadingStats(true);
    try {
      const { data, error } = await supabase.rpc("get_scratch_stats");
      if (error) throw error;
      setStats(data);
    } catch (err) {
    } finally {
      setIsLoadingStats(false);
    }
  };
  reactExports.useEffect(() => {
    if (isOpen && user) {
      loadStats();
    }
  }, [isOpen, user]);
  const generateNonce = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const handlePurchase = async (tier) => {
    if (!user) {
      ue.error("Devi essere autenticato");
      return;
    }
    setIsPurchasing(tier);
    const clientNonce = generateNonce();
    try {
      const { data, error } = await supabase.rpc("purchase_scratch_ticket", {
        p_tier: tier,
        p_client_nonce: clientNonce
      });
      if (error) throw error;
      if (data.status === "success" || data.status === "already_purchased") {
        refetch();
        loadStats();
        setScratchPurchase({
          tier,
          purchaseId: data.purchase_id,
          clientNonce
        });
      } else if (data.status === "insufficient_balance") {
        ue.error("Saldo insufficiente", { description: data.message });
      } else if (data.status === "error") {
        ue.error("Errore", { description: data.message });
      }
    } catch (err) {
      ue.error("Errore", { description: err.message });
    } finally {
      setIsPurchasing(null);
    }
  };
  const handleScratchClose = () => {
    setScratchPurchase(null);
    refetch();
    loadStats();
  };
  const handleWheelClose = () => {
    setShowWheel(false);
    const lastSpin = localStorage.getItem(WHEEL_STORAGE_KEY);
    const canSpin = !lastSpin || new Date(lastSpin).toDateString() !== (/* @__PURE__ */ new Date()).toDateString();
    setCanSpinWheel(canSpin);
    window.dispatchEvent(new CustomEvent("wheel-spun"));
  };
  if (!isOpen) return null;
  const modalContent = /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm",
      onClick: (e) => e.target === e.currentTarget && onClose(),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.95, opacity: 0 },
          className: "relative w-full max-w-md overflow-hidden rounded-2xl flex flex-col",
          style: {
            background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%)",
            border: "1px solid rgba(147, 51, 234, 0.3)",
            boxShadow: "0 0 60px rgba(147, 51, 234, 0.3), inset 0 0 30px rgba(147, 51, 234, 0.1)",
            height: "calc(100vh - 140px)",
            // Tra header e bottom nav
            marginTop: "60px",
            // Spazio per header
            marginBottom: "80px"
            // Spazio per bottom nav
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-white/10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-6 h-6 text-purple-400" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-white", children: "M1SSION SHOP" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-white/60", children: [
                    "Saldo: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-yellow-400 font-bold", children: [
                      balance.toLocaleString(),
                      " M1U"
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-white" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex border-b border-white/10", children: [
              { id: "scratch", label: "RIVELA", color: "from-yellow-500 to-amber-600" },
              { id: "wheel", label: "PROGRESSIONE", color: "from-green-500 to-emerald-600", badge: canSpinWheel },
              { id: "lottery", label: "PERCORSO", color: "from-blue-500 to-cyan-600" }
            ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setActiveTab(tab.id),
                className: `flex-1 flex items-center justify-center py-3 px-2 text-xs font-bold transition-all relative ${activeTab === tab.id ? "text-white" : "text-white/50 hover:text-white/80"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tab.label }),
                  activeTab === tab.id && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      layoutId: "activeTab",
                      className: `absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tab.color}`
                    }
                  ),
                  tab.badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" })
                ]
              },
              tab.id
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 overflow-y-auto flex-1", children: [
              activeTab === "scratch" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-white/70 text-center mb-4", children: [
                  "Acquista un biglietto e gratta per vincere ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 font-bold", children: "INDIZI" }),
                  " o fino a ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-yellow-400 font-bold", children: "100.000 M1U" }),
                  "!"
                ] }),
                isLoadingStats ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 text-purple-400 animate-spin" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: [10, 30, 50].map((tier) => {
                  const tierKey = `tier_${tier}`;
                  const tierData = stats?.[tierKey];
                  const purchasesToday = tierData?.user_purchases_today ?? 0;
                  const dailyLimit = tierData?.daily_limit ?? 10;
                  const canAfford = balance >= tier;
                  const underLimit = purchasesToday < dailyLimit;
                  const canPurchase = canAfford && underLimit;
                  const maxMilestone = tier === 10 ? 100 : tier === 30 ? 200 : 500;
                  let disabledReason = "";
                  if (!canAfford) disabledReason = `Servono ${tier} M1U`;
                  else if (!underLimit) disabledReason = "Limite giornaliero raggiunto";
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    motion.button,
                    {
                      onClick: () => handlePurchase(tier),
                      disabled: isPurchasing !== null || !canPurchase,
                      className: `relative p-4 rounded-xl text-left transition-all ${canPurchase ? "bg-gradient-to-r from-yellow-500/10 to-amber-600/10 border border-yellow-500/30 hover:border-yellow-500/60" : "bg-white/5 border border-white/10 opacity-60"}`,
                      whileHover: canPurchase ? { scale: 1.02 } : {},
                      whileTap: canPurchase ? { scale: 0.98 } : {},
                      children: [
                        tierData?.milestone_bonus && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full animate-pulse", children: "🎯 BONUS" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pr-20", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                            isPurchasing === tier ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-10 h-10 text-yellow-400 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center ${canPurchase ? "bg-gradient-to-br from-yellow-500 to-amber-600" : "bg-white/20"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-5 h-5 text-white" }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-white", children: [
                                tier,
                                " M1U"
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-white/60", children: [
                                "Milestone: +",
                                maxMilestone,
                                " M1U"
                              ] })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                            !canPurchase && disabledReason ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-400 flex items-center gap-1", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
                              disabledReason
                            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-400", children: [
                              dailyLimit - purchasesToday,
                              " rimasti oggi"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-white/40 mt-1", children: [
                              tierData?.available ?? "?",
                              " biglietti"
                            ] })
                          ] })
                        ] })
                      ]
                    },
                    tier
                  );
                }) })
              ] }),
              activeTab === "wheel" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    animate: { rotate: canSpinWheel ? [0, 360] : 0 },
                    transition: { duration: 4, repeat: canSpinWheel ? Infinity : 0, ease: "linear" },
                    className: "w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center",
                    style: {
                      background: canSpinWheel ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #374151, #1f2937)",
                      boxShadow: canSpinWheel ? "0 0 30px rgba(16, 185, 129, 0.5)" : "none"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: `w-12 h-12 ${canSpinWheel ? "text-white" : "text-white/50"}` })
                  }
                ),
                canSpinWheel ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-white mb-2", children: "Progressione GRATUITA disponibile!" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 mb-6", children: "Avanza nella tua progressione giornaliera" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.button,
                    {
                      onClick: () => setShowWheel(true),
                      className: "px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 transition-all",
                      whileHover: { scale: 1.05 },
                      whileTap: { scale: 0.95 },
                      children: "🎡 GIRA ORA!"
                    }
                  )
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-white/60 mb-2", children: "Hai già girato oggi" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/40", children: "Torna domani per un nuovo giro gratuito!" })
                ] })
              ] }) }),
              activeTab === "lottery" && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 text-blue-400 animate-spin" }) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                LotteryContent,
                {
                  balance,
                  onBalanceUpdate: refetch
                }
              ) })
            ] })
          ]
        }
      )
    }
  ) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    reactDomExports.createPortal(modalContent, document.body),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FortuneWheel, { isOpen: showWheel, onClose: handleWheelClose }) }),
    scratchPurchase && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScratchWinModal,
      {
        isOpen: true,
        onClose: handleScratchClose,
        tier: scratchPurchase.tier,
        purchaseId: scratchPurchase.purchaseId,
        clientNonce: scratchPurchase.clientNonce
      }
    ) })
  ] });
};

export { ShopModal as default };
