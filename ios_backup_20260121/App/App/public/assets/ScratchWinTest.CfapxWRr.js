import { j as jsxRuntimeExports } from './ui-vendor.sKtoNQj2.js';
import { r as reactExports } from './react-vendor.FGvtrp7q.js';
import { x as useUnifiedAuth, l as useM1UnitsRealtime, bd as Check, X, a1 as LoaderCircle, $ as RefreshCw, be as CreditCard, A as TriangleAlert, s as supabase } from './index.C8SyQ7Ep.js';
import { ScratchWinModal } from './ScratchWinModal.Bzc5ToZf.js';
import { m as motion } from './animation-vendor.BT4oAzOt.js';
import './supabase-vendor.DVELIqeo.js';
import './stripe-vendor.C-6aXM1t.js';
import './map-vendor.DftgD3cK.js';
import './router-vendor.Bb8w37VQ.js';

const ScratchWinTest = () => {
  const { user } = useUnifiedAuth();
  const { unitsData, refetch } = useM1UnitsRealtime(user?.id);
  const balance = unitsData?.balance ?? 0;
  const [logs, setLogs] = reactExports.useState([]);
  const [stats, setStats] = reactExports.useState(null);
  const [isLoadingStats, setIsLoadingStats] = reactExports.useState(false);
  const [isPurchasing, setIsPurchasing] = reactExports.useState(null);
  const [scratchPurchase, setScratchPurchase] = reactExports.useState(null);
  const [assetStatus, setAssetStatus] = reactExports.useState({
    tier10: "loading",
    tier30: "loading",
    tier50: "loading"
  });
  const addLog = (type, message, data) => {
    const newLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString().split("T")[1].split(".")[0],
      type,
      message,
      data
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 50));
  };
  const loadStats = async () => {
    setIsLoadingStats(true);
    addLog("info", "Loading scratch stats...");
    try {
      const { data, error } = await supabase.rpc("get_scratch_stats");
      if (error) {
        addLog("error", `RPC Error: ${error.message}`, error);
        return;
      }
      setStats(data);
      addLog("success", "Stats loaded successfully", data);
    } catch (err) {
      addLog("error", `Exception: ${err.message}`, err);
    } finally {
      setIsLoadingStats(false);
    }
  };
  reactExports.useEffect(() => {
    const testAsset = (tier, key) => {
      const img = new Image();
      img.onload = () => {
        setAssetStatus((prev) => ({ ...prev, [key]: "ok" }));
        addLog("success", `Asset ${tier}M1U loaded: ${img.width}x${img.height}px`);
      };
      img.onerror = () => {
        setAssetStatus((prev) => ({ ...prev, [key]: "error" }));
        addLog("error", `Asset ${tier}M1U FAILED to load`);
      };
      img.src = `/assets/scratch/scratch-win-${tier}m1u.png`;
    };
    testAsset(10, "tier10");
    testAsset(30, "tier30");
    testAsset(50, "tier50");
  }, []);
  reactExports.useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);
  const generateNonce = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const handlePurchase = async (tier) => {
    if (!user) {
      addLog("error", "User not authenticated");
      return;
    }
    setIsPurchasing(tier);
    const clientNonce = generateNonce();
    addLog("info", `Purchasing tier ${tier} ticket...`, { clientNonce });
    try {
      const { data, error } = await supabase.rpc("purchase_scratch_ticket", {
        p_tier: tier,
        p_client_nonce: clientNonce
      });
      if (error) {
        addLog("error", `Purchase RPC Error: ${error.message}`, error);
        return;
      }
      addLog(data.status === "success" ? "success" : "warning", `Purchase response: ${data.status}`, data);
      if (data.status === "success" || data.status === "already_purchased") {
        refetch();
        loadStats();
        setScratchPurchase({
          tier,
          purchaseId: data.purchase_id,
          clientNonce
        });
      }
    } catch (err) {
      addLog("error", `Exception: ${err.message}`, err);
    } finally {
      setIsPurchasing(null);
    }
  };
  const handleScratchClose = () => {
    addLog("info", "Scratch modal closed");
    setScratchPurchase(null);
    refetch();
    loadStats();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[#070818] text-white p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-2", children: "🎫 SCRATCH & WIN Test Page" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60", children: "Development testing for the Scratch & Win feature" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 rounded-lg p-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-2", children: "User Info" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50", children: "User ID:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: user?.id || "Not authenticated" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50", children: "M1U Balance:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-yellow-400", children: balance.toLocaleString() })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 rounded-lg p-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-3", children: "Asset Verification" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-4", children: [10, 30, 50].map((tier) => {
          const key = `tier${tier}`;
          const status = assetStatus[key];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] rounded-lg overflow-hidden bg-black/30 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: `/assets/scratch/scratch-win-${tier}m1u.png`,
                  alt: `Ticket ${tier}M1U`,
                  className: "w-full h-full object-cover",
                  onError: (e) => {
                    e.target.style.display = "none";
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${status === "ok" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-yellow-500"}`, children: status === "ok" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }) : status === "error" ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold", children: [
              tier,
              " M1U"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs ${status === "ok" ? "text-green-400" : status === "error" ? "text-red-400" : "text-yellow-400"}`, children: status === "ok" ? "✓ Loaded" : status === "error" ? "✗ Failed" : "Loading..." })
          ] }, tier);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 rounded-lg p-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Pool Statistics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: loadStats,
              disabled: isLoadingStats,
              className: "p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-4 h-4 ${isLoadingStats ? "animate-spin" : ""}` })
            }
          )
        ] }),
        stats ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [10, 30, 50].map((tier) => {
          const tierKey = `tier_${tier}`;
          const tierData = stats[tierKey];
          const purchasesToday = tierData?.user_purchases_today ?? 0;
          const dailyLimit = tierData?.daily_limit ?? 10;
          const canBuyMore = purchasesToday < dailyLimit;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-black/30 rounded-lg p-3 ${!canBuyMore ? "opacity-60" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-lg", children: [
              tier,
              " M1U"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/50", children: [
              "Disponibili: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: tierData?.available ?? "?" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/50", children: [
              "Jackpot: ",
              tierData?.jackpot_available ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-400", children: "🎰 Disponibile" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "✗ Vinto" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `mt-2 text-xs font-bold ${canBuyMore ? "text-green-400" : "text-red-400"}`, children: [
              "Oggi: ",
              purchasesToday,
              "/",
              dailyLimit,
              !canBuyMore && " ⛔ LIMITE"
            ] })
          ] }, tier);
        }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/50", children: "Loading stats..." }),
        stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50", children: "Saldo M1U:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-2xl text-yellow-400", children: (stats.user_m1u_balance ?? balance).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50", children: "Acquisti oggi (totale):" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold", children: [
              stats.user_total_purchases_today ?? 0,
              " / 30"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50", children: "M1U vinti totale:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-green-400", children: (stats.user_total_wins ?? 0).toLocaleString() })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 rounded-lg p-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-3", children: "Purchase Tickets" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-4", children: [10, 30, 50].map((tier) => {
          const tierKey = `tier_${tier}`;
          const tierData = stats?.[tierKey];
          const purchasesToday = tierData?.user_purchases_today ?? 0;
          const dailyLimit = tierData?.daily_limit ?? 10;
          const canAfford = balance >= tier;
          const underLimit = purchasesToday < dailyLimit;
          const canPurchase = canAfford && underLimit;
          const maxJackpot = tier === 10 ? 1e3 : tier === 30 ? 1e4 : 1e5;
          let disabledReason = "";
          if (!canAfford) disabledReason = `Servono ${tier} M1U`;
          else if (!underLimit) disabledReason = "Limite giornaliero raggiunto";
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.button,
            {
              onClick: () => handlePurchase(tier),
              disabled: isPurchasing !== null || !canPurchase,
              className: `p-4 rounded-lg text-center transition-all ${canPurchase ? "bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/40 hover:border-yellow-500/60" : "bg-gray-800/50 border border-gray-700/40 opacity-50 cursor-not-allowed"}`,
              whileHover: canPurchase ? { scale: 1.02 } : {},
              whileTap: canPurchase ? { scale: 0.98 } : {},
              children: isPurchasing === tier ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 mx-auto animate-spin text-yellow-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: `w-8 h-8 mx-auto mb-2 ${canPurchase ? "text-yellow-400" : "text-gray-500"}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold", children: [
                  tier,
                  " M1U"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-white/50", children: [
                  "Max: ",
                  maxJackpot.toLocaleString()
                ] }),
                !canPurchase && disabledReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-400 mt-1 flex items-center justify-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
                  disabledReason
                ] }),
                canPurchase && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-400 mt-1", children: [
                  dailyLimit - purchasesToday,
                  " rimasti oggi"
                ] })
              ] })
            },
            tier
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 rounded-lg p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Event Logs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setLogs([]),
              className: "text-xs text-white/50 hover:text-white",
              children: "Clear"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64 overflow-y-auto font-mono text-xs space-y-1", children: logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/30", children: "No logs yet..." }) : logs.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `p-2 rounded ${log.type === "error" ? "bg-red-500/20 text-red-300" : log.type === "success" ? "bg-green-500/20 text-green-300" : log.type === "warning" ? "bg-yellow-500/20 text-yellow-300" : "bg-blue-500/20 text-blue-300"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/50", children: [
                "[",
                log.timestamp,
                "]"
              ] }),
              " ",
              log.message,
              log.data && /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-1 text-[10px] text-white/50 overflow-x-auto", children: JSON.stringify(log.data, null, 2) })
            ]
          },
          log.id
        )) })
      ] })
    ] }),
    scratchPurchase && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScratchWinModal,
      {
        isOpen: true,
        onClose: handleScratchClose,
        tier: scratchPurchase.tier,
        purchaseId: scratchPurchase.purchaseId,
        clientNonce: scratchPurchase.clientNonce
      }
    )
  ] });
};

export { ScratchWinTest as default };
