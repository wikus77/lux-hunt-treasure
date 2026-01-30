import { r as reactExports, j as jsxRuntimeExports, A as AnimatePresence, m as motion } from './animation-vendor.BiI6PE8T.js';
import { w as useUnifiedAuth, l as useM1UnitsRealtime, s as supabase, m as ue, a1 as LoaderCircle, aC as Trophy, X, af as Clock, G as Gift, S as Sparkles, $ as RefreshCw, z as TriangleAlert, a3 as Plus, aH as CircleCheckBig, Q as ChevronUp, ag as ChevronDown, y as Shield, aO as Play, bf as Ban, bg as ChartColumn } from './index.CUdqZWfi.js';
import { T as Ticket, M as Minus } from './ticket.W-zAhzj1.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return "Scaduto";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const mins = Math.floor(seconds % 3600 / 60);
  if (days > 0) return `${days}g ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};
const LotteryTest = () => {
  const { user } = useUnifiedAuth();
  const { unitsData, refetch: refetchBalance } = useM1UnitsRealtime(user?.id);
  const balance = unitsData?.balance ?? 0;
  const [status, setStatus] = reactExports.useState(null);
  const [tickets, setTickets] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isPurchasing, setIsPurchasing] = reactExports.useState(false);
  const [isDrawing, setIsDrawing] = reactExports.useState(false);
  const [quantity, setQuantity] = reactExports.useState(1);
  const [showTickets, setShowTickets] = reactExports.useState(false);
  const [showAdmin, setShowAdmin] = reactExports.useState(false);
  const [adminAnalytics, setAdminAnalytics] = reactExports.useState(null);
  const [userRole, setUserRole] = reactExports.useState(null);
  const [myWins, setMyWins] = reactExports.useState([]);
  const [pendingWins, setPendingWins] = reactExports.useState([]);
  const [showClaimModal, setShowClaimModal] = reactExports.useState(false);
  const [selectedWin, setSelectedWin] = reactExports.useState(null);
  const [isClaiming, setIsClaiming] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      setUserRole(data?.role || null);
    };
    checkRole();
  }, [user]);
  const isAdmin = userRole === "admin" || userRole === "owner";
  const loadStatus = reactExports.useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_active_lottery_cycle");
      if (error) throw error;
      if (data?.status === "no_active_cycle") {
        setStatus(null);
      } else {
        setStatus(data);
      }
    } catch (err) {
      ue.error("Errore nel caricamento dello status");
    } finally {
      setIsLoading(false);
    }
  }, []);
  const loadTickets = reactExports.useCallback(async () => {
    if (!status?.cycle_id || !user) return;
    try {
      const { data, error } = await supabase.rpc("get_user_lottery_tickets", {
        p_cycle_id: status.cycle_id
      });
      if (error) throw error;
      setTickets(data?.tickets || []);
    } catch (err) {
    }
  }, [status?.cycle_id, user]);
  const loadAdminAnalytics = reactExports.useCallback(async () => {
    if (!isAdmin) return;
    try {
      const { data, error } = await supabase.rpc("admin_get_lottery_analytics");
      if (error) throw error;
      setAdminAnalytics(data);
    } catch (err) {
    }
  }, [isAdmin]);
  const loadWins = reactExports.useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc("get_my_lottery_wins");
      if (error) throw error;
      if (data?.wins) {
        setMyWins(data.wins);
        const pending = data.wins.filter((w) => w.claim_status === "pending");
        setPendingWins(pending);
        if (pending.length > 0 && !showClaimModal) {
          setSelectedWin(pending[0]);
          setShowClaimModal(true);
        }
      }
    } catch (err) {
    }
  }, [user, showClaimModal]);
  const handleClaimPrize = async (win) => {
    if (isClaiming) return;
    setIsClaiming(true);
    try {
      const { data, error } = await supabase.rpc("claim_lottery_prize", {
        p_winner_id: win.id
      });
      if (error) throw error;
      if (data?.status === "success") {
        ue.success("🎉 Premio riscosso!", {
          description: `+${data.prize_m1u} M1U accreditati!`
        });
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("m1u-credited", {
            detail: { amount: data.prize_m1u }
          }));
        }, 500);
        refetchBalance();
        loadWins();
        setShowClaimModal(false);
        setSelectedWin(null);
      } else {
        ue.error("Errore", { description: data?.message || "Impossibile riscuotere il premio" });
      }
    } catch (err) {
      ue.error("Errore", { description: err.message });
    } finally {
      setIsClaiming(false);
    }
  };
  reactExports.useEffect(() => {
    loadStatus();
  }, [loadStatus]);
  reactExports.useEffect(() => {
    if (showTickets) {
      loadTickets();
    }
  }, [showTickets, loadTickets]);
  reactExports.useEffect(() => {
    if (showAdmin && isAdmin) {
      loadAdminAnalytics();
    }
  }, [showAdmin, isAdmin, loadAdminAnalytics]);
  reactExports.useEffect(() => {
    const interval = setInterval(() => {
      loadStatus();
    }, 3e4);
    return () => clearInterval(interval);
  }, [loadStatus]);
  reactExports.useEffect(() => {
    loadWins();
  }, [loadWins]);
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("claim") === "true") {
      loadWins();
    }
  }, [loadWins]);
  const generateRequestId = () => crypto.randomUUID();
  const handleBuyTickets = async () => {
    if (!status || !user) return;
    setIsPurchasing(true);
    const requestId = generateRequestId();
    try {
      const { data, error } = await supabase.rpc("buy_lottery_tickets", {
        p_cycle_id: status.cycle_id,
        p_quantity: quantity,
        p_request_id: requestId,
        p_source: "test"
      });
      if (error) throw error;
      if (data.status === "success") {
        ue.success(`Acquistati ${quantity} biglietti!`, {
          description: `Totale: ${data.total_m1u} M1U`
        });
        refetchBalance();
        loadStatus();
        if (showTickets) loadTickets();
        setQuantity(1);
      } else if (data.status === "already_purchased") {
        ue.info("Acquisto già completato", {
          description: "Idempotenza: stesso request_id"
        });
      } else {
        ue.error("Errore", {
          description: data.message || "Errore sconosciuto"
        });
      }
    } catch (err) {
      ue.error("Errore", { description: err.message });
    } finally {
      setIsPurchasing(false);
    }
  };
  const handleExecuteDraw = async () => {
    if (!status || !isAdmin) return;
    if (!confirm("Sei sicuro di voler eseguire l'estrazione? Questa azione è irreversibile.")) {
      return;
    }
    setIsDrawing(true);
    try {
      const { data, error } = await supabase.rpc("finalize_cycle_and_draw", {
        p_cycle_id: status.cycle_id
      });
      if (error) throw error;
      if (data.status === "success") {
        ue.success("Estrazione completata!", {
          description: `${data.winners?.length || 0} vincitori, multiplier: ${(data.prize_multiplier * 100).toFixed(0)}%`
        });
        loadStatus();
        loadAdminAnalytics();
      } else {
        ue.error("Errore", { description: data.message });
      }
    } catch (err) {
      ue.error("Errore", { description: err.message });
    } finally {
      setIsDrawing(false);
    }
  };
  const handleCancelCycle = async () => {
    if (!status || !isAdmin) return;
    const reason = prompt("Motivo annullamento:");
    if (!reason) return;
    try {
      const { data, error } = await supabase.rpc("cancel_lottery_cycle", {
        p_cycle_id: status.cycle_id,
        p_reason: reason
      });
      if (error) throw error;
      if (data.status === "success") {
        ue.success("Ciclo annullato", {
          description: `Rimborsati ${data.refunds_count} acquisti (${data.total_refunded} M1U)`
        });
        loadStatus();
        refetchBalance();
      } else {
        ue.error("Errore", { description: data.message });
      }
    } catch (err) {
      ue.error("Errore", { description: err.message });
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-12 h-12 text-blue-400 animate-spin" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-4 pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showClaimModal && selectedWin && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm",
        onClick: () => setShowClaimModal(false),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { scale: 0.8, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.8, opacity: 0 },
            className: "w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-yellow-500/30 overflow-hidden shadow-2xl",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-gradient-to-r from-yellow-500/20 to-amber-600/20 p-6 text-center overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    animate: { rotate: 360 },
                    transition: { duration: 20, repeat: Infinity, ease: "linear" },
                    className: "absolute inset-0 opacity-20",
                    style: {
                      background: "conic-gradient(from 0deg, transparent, gold, transparent, gold, transparent)"
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    animate: { scale: [1, 1.1, 1] },
                    transition: { duration: 2, repeat: Infinity },
                    className: "relative",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-20 h-20 text-yellow-400 mx-auto mb-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold text-white relative", children: "🎉 HAI VINTO! 🎉" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-yellow-400/80 relative mt-2", children: selectedWin.prize_label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setShowClaimModal(false),
                    className: "absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-white/70" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-sm mb-2", children: "Premio" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    motion.p,
                    {
                      initial: { scale: 0 },
                      animate: { scale: 1 },
                      className: "text-5xl font-bold text-yellow-400",
                      children: [
                        "+",
                        selectedWin.prize_m1u.toLocaleString()
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-yellow-400/60 text-lg", children: "M1U" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-orange-400 bg-orange-500/10 rounded-lg p-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
                    "Riscuoti entro: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatTimeRemaining(selectedWin.time_remaining_seconds) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.button,
                  {
                    whileHover: { scale: 1.02 },
                    whileTap: { scale: 0.98 },
                    onClick: () => handleClaimPrize(selectedWin),
                    disabled: isClaiming,
                    className: "w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-lg shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all flex items-center justify-center gap-3 disabled:opacity-50",
                    children: isClaiming ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin" }),
                      "Riscuotendo..."
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-6 h-6" }),
                      "RISCUOTI VINCITA",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-6 h-6" })
                    ] })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-white/40 text-xs", children: "Il premio verrà accreditato immediatamente sul tuo saldo M1U" })
              ] })
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg mx-auto", children: [
      pendingWins.length > 0 && !showClaimModal && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.button,
        {
          initial: { y: -20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          onClick: () => {
            setSelectedWin(pendingWins[0]);
            setShowClaimModal(true);
          },
          className: "w-full mb-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/50 flex items-center justify-between",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-yellow-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-6 h-6 text-yellow-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-yellow-400", children: [
                  "Hai ",
                  pendingWins.length,
                  " vincita da riscuotere!"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/60", children: "Clicca per riscuotere" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-6 h-6 text-yellow-400 animate-pulse" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "w-8 h-8 text-blue-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-white", children: "Lotteria M1SSION" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/60", children: "Test Page • Solo Admin/Dev" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              loadStatus();
              loadWins();
              refetchBalance();
            },
            className: "p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-5 h-5 text-white/70" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-600/10 border border-yellow-500/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/70", children: "Il tuo saldo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold text-yellow-400", children: [
          balance.toLocaleString(),
          " M1U"
        ] })
      ] }) }),
      !status && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-16 h-16 text-yellow-400 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-white mb-2", children: "Nessun ciclo attivo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60", children: "Non ci sono lotterie attive al momento." }),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-400 mt-4 text-sm", children: "Esegui la migrazione SQL per creare un ciclo di test." })
      ] }),
      status && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            className: "p-5 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 rounded-full text-xs font-bold ${status.status === "active" ? "bg-green-500/20 text-green-400" : status.status === "drawing" ? "bg-yellow-500/20 text-yellow-400" : status.status === "completed" ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`, children: status.status.toUpperCase() }),
                status.threshold_reached && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400", children: "✓ SOGLIA RAGGIUNTA" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5 text-white/50" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/60", children: "Tempo rimanente" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-white", children: formatTimeRemaining(status.time_remaining_seconds) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white/60", children: "Progresso soglia" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-white", children: [
                    status.total_tickets.toLocaleString(),
                    " / ",
                    status.min_tickets_required.toLocaleString()
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 bg-white/10 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { width: 0 },
                    animate: { width: `${Math.min(100, status.progress_percent)}%` },
                    transition: { duration: 1, ease: "easeOut" },
                    className: `h-full rounded-full ${status.progress_percent >= 100 ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-blue-500 to-cyan-400"}`
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-white/40 mt-1", children: [
                  status.progress_percent.toFixed(1),
                  "% • ",
                  status.total_participants,
                  " partecipanti"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-3 rounded-lg bg-white/5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/50", children: "Prezzo" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-yellow-400", children: status.ticket_price_m1u }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/40", children: "M1U" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-3 rounded-lg bg-white/5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/50", children: "Montepremi" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-cyan-400", children: status.prize_pool_total.toLocaleString() }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/40", children: "M1U" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-3 rounded-lg bg-white/5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/50", children: "Multiplier" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-lg font-bold ${status.threshold_reached ? "text-green-400" : "text-orange-400"}`, children: [
                    (status.prize_multiplier * 100).toFixed(0),
                    "%"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/40", children: "premi" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-white/70 italic text-center p-3 rounded-lg bg-white/5", children: [
                '"',
                status.narrative,
                '"'
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-white mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-5 h-5 text-purple-400" }),
            "Premi Top 3"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: (status.prizes_effective_json || status.prizes_json).map((prize, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2 rounded-lg bg-white/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/70", children: prize.label || `${prize.rank}° Premio` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-purple-400", children: prize.amount_m1u ? `${prize.amount_m1u.toLocaleString()} M1U` : `${prize.percent}%` })
          ] }, idx)) })
        ] }),
        status.status === "active" && user && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-white mb-3", children: "Acquista Biglietti" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/60", children: "I tuoi biglietti" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white font-bold", children: [
              status.user_tickets_count,
              " / ",
              status.max_tickets_per_user
            ] })
          ] }),
          status.user_can_buy_more ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-4 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setQuantity(Math.max(1, quantity - 1)),
                  className: "p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors",
                  disabled: quantity <= 1,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-5 h-5 text-white" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    value: quantity,
                    onChange: (e) => setQuantity(Math.max(1, Math.min(status.user_remaining_tickets, parseInt(e.target.value) || 1))),
                    className: "w-20 text-center text-2xl font-bold text-white bg-transparent border-b-2 border-white/30 focus:border-green-400 outline-none"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-white/50 mt-1", children: [
                  "= ",
                  (quantity * status.ticket_price_m1u).toLocaleString(),
                  " M1U"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setQuantity(Math.min(status.user_remaining_tickets, quantity + 1)),
                  className: "p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors",
                  disabled: quantity >= status.user_remaining_tickets,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5 text-white" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-4", children: [1, 5, 10, 25].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setQuantity(Math.min(status.user_remaining_tickets, n)),
                className: `flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${quantity === n ? "bg-green-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"}`,
                disabled: n > status.user_remaining_tickets,
                children: n
              },
              n
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.button,
              {
                onClick: handleBuyTickets,
                disabled: isPurchasing || balance < quantity * status.ticket_price_m1u,
                className: `w-full py-3 rounded-xl font-bold text-white transition-all ${balance >= quantity * status.ticket_price_m1u ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500" : "bg-gray-500 cursor-not-allowed"}`,
                whileHover: { scale: balance >= quantity * status.ticket_price_m1u ? 1.02 : 1 },
                whileTap: { scale: 0.98 },
                children: isPurchasing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin mx-auto" }) : balance < quantity * status.ticket_price_m1u ? "Saldo insufficiente" : `🎫 ACQUISTA ${quantity} BIGLIETT${quantity > 1 ? "I" : "O"}`
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-12 h-12 text-green-400 mx-auto mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white font-bold", children: "Hai raggiunto il limite!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/60 text-sm", children: [
              "Max ",
              status.max_tickets_per_user,
              " biglietti per questo ciclo"
            ] })
          ] })
        ] }),
        status.draw && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-white mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-5 h-5 text-yellow-400" }),
            "Risultati Estrazione"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: status.draw.winners.map((winner, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-3 rounded-lg ${winner.user_id === user?.id ? "bg-yellow-500/30 border border-yellow-500" : "bg-white/5"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl mr-2", children: winner.rank === 1 ? "🥇" : winner.rank === 2 ? "🥈" : "🥉" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-white", children: [
                winner.rank,
                "° Posto"
              ] }),
              winner.user_id === user?.id && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 px-2 py-0.5 rounded text-xs bg-yellow-500 text-black font-bold", children: "TU!" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold text-yellow-400", children: [
              "+",
              winner.prize_m1u.toLocaleString(),
              " M1U"
            ] })
          ] }) }, idx)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-3 rounded-lg bg-white/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/40 mb-1", children: "Draw Proof Hash" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/60 font-mono break-all", children: status.draw.draw_proof_hash })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowTickets(!showTickets),
              className: "w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-white flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "w-5 h-5 text-blue-400" }),
                  "I tuoi biglietti (",
                  status.user_tickets_count,
                  ")"
                ] }),
                showTickets ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-5 h-5 text-white/50" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-5 h-5 text-white/50" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showTickets && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { height: 0, opacity: 0 },
              animate: { height: "auto", opacity: 1 },
              exit: { height: 0, opacity: 0 },
              className: "border-t border-white/10",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 max-h-64 overflow-y-auto space-y-2", children: tickets.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-white/50 py-4", children: "Nessun biglietto" }) : tickets.map((ticket) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `p-3 rounded-lg ${ticket.status === "winner" ? "bg-yellow-500/20 border border-yellow-500/50" : "bg-white/5"}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono text-white/40", children: [
                        "#",
                        ticket.ticket_hash.slice(0, 8),
                        "..."
                      ] }),
                      ticket.draw_rank && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-yellow-400 font-bold", children: [
                        "🏆 ",
                        ticket.draw_rank,
                        "° posto"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: ticket.prize_amount ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-400 font-bold", children: [
                      "+",
                      ticket.prize_amount.toLocaleString(),
                      " M1U"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded ${ticket.status === "active" ? "bg-green-500/20 text-green-400" : ticket.status === "void" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`, children: ticket.status }) })
                  ] })
                },
                ticket.id
              )) })
            }
          ) })
        ] }),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-red-500/30 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowAdmin(!showAdmin),
              className: "w-full p-4 flex items-center justify-between bg-red-500/10 hover:bg-red-500/20 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-red-400 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-5 h-5" }),
                  "Admin Controls"
                ] }),
                showAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-5 h-5 text-red-400/50" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-5 h-5 text-red-400/50" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { height: 0, opacity: 0 },
              animate: { height: "auto", opacity: 1 },
              exit: { height: 0, opacity: 0 },
              className: "border-t border-red-500/30",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: handleExecuteDraw,
                      disabled: isDrawing || status.status !== "active",
                      className: `p-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${status.status === "active" ? "bg-green-500 text-white hover:bg-green-400" : "bg-gray-500 text-white/50 cursor-not-allowed"}`,
                      children: isDrawing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-5 h-5" }),
                        "Estrai"
                      ] })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: handleCancelCycle,
                      disabled: status.status === "completed" || status.status === "cancelled",
                      className: `p-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${status.status !== "completed" && status.status !== "cancelled" ? "bg-red-500 text-white hover:bg-red-400" : "bg-gray-500 text-white/50 cursor-not-allowed"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "w-5 h-5" }),
                        "Annulla"
                      ]
                    }
                  )
                ] }),
                adminAnalytics && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-bold text-white flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-5 h-5 text-blue-400" }),
                    "Analytics"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded bg-white/5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/50", children: "Cicli totali" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-white", children: adminAnalytics.cycles?.total || 0 })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded bg-white/5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/50", children: "Biglietti venduti" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-white", children: adminAnalytics.sales?.total_tickets?.toLocaleString() || 0 })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded bg-white/5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/50", children: "M1U incassati" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-yellow-400", children: adminAnalytics.sales?.total_m1u?.toLocaleString() || 0 })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded bg-white/5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/50", children: "M1U distribuiti" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-green-400", children: adminAnalytics.prizes?.total_m1u_awarded?.toLocaleString() || 0 })
                    ] })
                  ] })
                ] })
              ] })
            }
          ) })
        ] })
      ] })
    ] })
  ] });
};

export { LotteryTest as default };
