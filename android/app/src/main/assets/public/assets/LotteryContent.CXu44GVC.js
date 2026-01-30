import { j as jsxRuntimeExports, m as motion, r as reactExports, A as AnimatePresence } from './animation-vendor.BiI6PE8T.js';
import { aC as Trophy, S as Sparkles, af as Clock, w as useUnifiedAuth, s as supabase, a1 as LoaderCircle, z as TriangleAlert, X, G as Gift, a3 as Plus, m as ue } from './index.CUdqZWfi.js';
import { T as Ticket, M as Minus } from './ticket.W-zAhzj1.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

const getMissionDeadline = () => {
  return /* @__PURE__ */ new Date("2026-01-30T23:59:59.000Z");
};

const LotteryTicketCard = ({
  ticketCode,
  status,
  createdAt,
  drawRank,
  prizeAmount,
  isNew = false,
  onClick
}) => {
  const formattedCode = ticketCode ? `${ticketCode.slice(0, 3)}-${ticketCode.slice(3, 6)}-${ticketCode.slice(6, 9)}-${ticketCode.slice(9)}` : "---";
  const formattedDate = new Date(createdAt).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const isWinner = status === "winner";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: isNew ? { scale: 0.8, opacity: 0, rotateY: -180 } : { opacity: 1 },
      animate: { scale: 1, opacity: 1, rotateY: 0 },
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: isNew ? 0.8 : 0.3
      },
      whileHover: { scale: 1.02, y: -4 },
      whileTap: { scale: 0.98 },
      onClick,
      className: `relative cursor-pointer select-none ${isNew ? "z-10" : ""}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "relative overflow-hidden rounded-2xl",
          style: {
            background: isWinner ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" : "linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #0a1628 100%)",
            boxShadow: isWinner ? "0 8px 32px rgba(251, 191, 36, 0.4), inset 0 0 60px rgba(255, 255, 255, 0.1)" : "0 8px 32px rgba(30, 58, 95, 0.5), inset 0 0 60px rgba(0, 200, 255, 0.05)",
            border: isWinner ? "2px solid #fcd34d" : "1px solid rgba(0, 200, 255, 0.3)"
          },
          children: [
            isNew && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "absolute inset-0 z-10",
                initial: { x: "-100%" },
                animate: { x: "200%" },
                transition: { duration: 1.5, delay: 0.5 },
                style: {
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-4 pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute inset-0 opacity-10",
                  style: {
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300c8ff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400", children: "M1" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: isWinner ? "text-black" : "text-white", children: "SSION" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium ${isWinner ? "text-black/60" : "text-white/40"}`, children: "™" })
                ] }),
                isWinner ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 px-2 py-1 rounded-full bg-black/20", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-4 h-4 text-black" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-black", children: "VINCENTE" })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "w-4 h-4 text-cyan-400" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-cyan-400", children: "PERCORSO" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center px-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full bg-black -ml-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "flex-1 border-t-2 border-dashed mx-2",
                  style: { borderColor: isWinner ? "rgba(0,0,0,0.2)" : "rgba(0, 200, 255, 0.2)" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full bg-black -mr-4" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-4 pt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs uppercase tracking-wider mb-1 ${isWinner ? "text-black/60" : "text-white/40"}`, children: "Numero Biglietto" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: `text-2xl font-mono font-bold tracking-[0.2em] ${isWinner ? "text-black" : "text-white"}`,
                      style: {
                        textShadow: isWinner ? "none" : "0 0 20px rgba(0, 200, 255, 0.5)",
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
                      },
                      children: formattedCode
                    }
                  ),
                  isNew && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      className: "absolute -right-2 -top-2",
                      animate: { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] },
                      transition: { duration: 0.5, repeat: 3 },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5 text-yellow-400" })
                    }
                  )
                ] })
              ] }),
              isWinner && prizeAmount && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-black/60", children: "Premio" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-black", children: [
                  "+",
                  prizeAmount.toLocaleString(),
                  " M1U"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-4 pt-3 border-t", style: { borderColor: isWinner ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: `w-3 h-3 ${isWinner ? "text-black/40" : "text-white/40"}` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs ${isWinner ? "text-black/60" : "text-white/50"}`, children: formattedDate })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xs ${isWinner ? "text-black/40" : "text-cyan-400/60"}`, children: "M1SSION™ LOTTERY" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute right-0 top-0 bottom-0 w-8",
                style: {
                  background: isWinner ? "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,215,0,0.2) 50%, rgba(255,255,255,0.3) 100%)" : "linear-gradient(180deg, rgba(0,200,255,0.1) 0%, rgba(120,0,255,0.1) 50%, rgba(0,200,255,0.1) 100%)"
                }
              }
            )
          ]
        }
      )
    }
  );
};

const calculateMissionTimeRemaining = () => {
  const deadline = getMissionDeadline();
  const now = /* @__PURE__ */ new Date();
  const diff = deadline.getTime() - now.getTime();
  if (diff <= 0) return { seconds: 0, formatted: "Scaduto" };
  const totalSeconds = Math.floor(diff / 1e3);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor(totalSeconds % 86400 / 3600);
  const mins = Math.floor(totalSeconds % 3600 / 60);
  const formatted = days > 0 ? `${days}g ${hours}h ${mins}m` : hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  return { seconds: totalSeconds, formatted };
};
const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return "Scaduto";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const mins = Math.floor(seconds % 3600 / 60);
  if (days > 0) return `${days}g ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};
const LotteryContent = ({ balance, onBalanceUpdate }) => {
  const { user } = useUnifiedAuth();
  const [status, setStatus] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isPurchasing, setIsPurchasing] = reactExports.useState(false);
  const [quantity, setQuantity] = reactExports.useState(1);
  const [missionCountdown, setMissionCountdown] = reactExports.useState(calculateMissionTimeRemaining());
  const [pendingWins, setPendingWins] = reactExports.useState([]);
  const [showClaimModal, setShowClaimModal] = reactExports.useState(false);
  const [selectedWin, setSelectedWin] = reactExports.useState(null);
  const [isClaiming, setIsClaiming] = reactExports.useState(false);
  const [myTickets, setMyTickets] = reactExports.useState([]);
  const [showMyTickets, setShowMyTickets] = reactExports.useState(false);
  const [newTicketCodes, setNewTicketCodes] = reactExports.useState([]);
  const [showNewTicketModal, setShowNewTicketModal] = reactExports.useState(false);
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
    } finally {
      setIsLoading(false);
    }
  }, []);
  const loadWins = reactExports.useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc("get_my_lottery_wins");
      if (error) throw error;
      if (data?.wins) {
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
  const loadMyTickets = reactExports.useCallback(async () => {
    if (!user || !status?.cycle_id) return;
    try {
      const { data, error } = await supabase.rpc("get_user_lottery_tickets", {
        p_cycle_id: status.cycle_id
      });
      if (error) throw error;
      if (data?.tickets) {
        setMyTickets(data.tickets);
      }
    } catch (err) {
    }
  }, [user, status?.cycle_id]);
  reactExports.useEffect(() => {
    loadStatus();
    loadWins();
  }, [loadStatus, loadWins]);
  reactExports.useEffect(() => {
    if (status?.cycle_id) {
      loadMyTickets();
    }
  }, [status?.cycle_id, loadMyTickets]);
  reactExports.useEffect(() => {
    const interval = setInterval(() => {
      loadStatus();
    }, 3e4);
    return () => clearInterval(interval);
  }, [loadStatus]);
  reactExports.useEffect(() => {
    const timer = setInterval(() => {
      setMissionCountdown(calculateMissionTimeRemaining());
    }, 1e3);
    return () => clearInterval(timer);
  }, []);
  const handleBuyTickets = async () => {
    if (!status || !user) return;
    setIsPurchasing(true);
    const requestId = crypto.randomUUID();
    try {
      const { data, error } = await supabase.rpc("buy_lottery_tickets", {
        p_cycle_id: status.cycle_id,
        p_quantity: quantity,
        p_request_id: requestId,
        p_source: "app_web"
      });
      if (error) throw error;
      if (data.status === "success") {
        if (data.ticket_codes && data.ticket_codes.length > 0) {
          setNewTicketCodes(data.ticket_codes);
          setShowNewTicketModal(true);
        }
        ue.success(`🎫 Acquistati ${quantity} biglietti!`, {
          description: `Totale: ${data.total_cost} M1U`
        });
        onBalanceUpdate();
        loadStatus();
        loadMyTickets();
        setQuantity(1);
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
        onBalanceUpdate();
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
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 text-blue-400 animate-spin" }) });
  }
  if (!status) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          animate: { y: [0, -10, 0] },
          transition: { duration: 2, repeat: Infinity },
          className: "w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "w-10 h-10 text-blue-400" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-12 h-12 text-yellow-400 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-white mb-2", children: "Nessun ciclo attivo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-sm", children: "Il prossimo percorso progressione inizierà presto!" })
    ] });
  }
  const totalCost = quantity * status.ticket_price_m1u;
  const canAfford = balance >= totalCost;
  const canBuy = status.user_can_buy_more && canAfford && status.status === "active";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showClaimModal && selectedWin && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm",
        onClick: () => setShowClaimModal(false),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { scale: 0.8, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.8, opacity: 0 },
            className: "w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-yellow-500/30 overflow-hidden shadow-2xl",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-gradient-to-r from-yellow-500/20 to-amber-600/20 p-6 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    animate: { scale: [1, 1.1, 1] },
                    transition: { duration: 2, repeat: Infinity },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-16 h-16 text-yellow-400 mx-auto mb-3" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-white", children: "🎉 MILESTONE RAGGIUNTO! 🎉" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-yellow-400/80 mt-1", children: selectedWin.prize_label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setShowClaimModal(false),
                    className: "absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-white/70" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    motion.p,
                    {
                      initial: { scale: 0 },
                      animate: { scale: 1 },
                      className: "text-4xl font-bold text-yellow-400",
                      children: [
                        "+",
                        selectedWin.prize_m1u.toLocaleString()
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-yellow-400/60", children: "M1U" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-orange-400 bg-orange-500/10 rounded-lg p-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Sblocca entro: ",
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
                    className: "w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 disabled:opacity-50",
                    children: isClaiming ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin" }),
                      "Elaborazione..."
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-5 h-5" }),
                      "SBLOCCA MILESTONE",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5" })
                    ] })
                  }
                )
              ] })
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showNewTicketModal && newTicketCodes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm",
        onClick: () => setShowNewTicketModal(false),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { scale: 0.8, opacity: 0, y: 50 },
            animate: { scale: 1, opacity: 1, y: 0 },
            exit: { scale: 0.8, opacity: 0, y: 50 },
            className: "w-full max-w-sm max-h-[80vh] overflow-y-auto",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    animate: { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] },
                    transition: { duration: 0.5 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-12 h-12 text-yellow-400 mx-auto mb-2" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-white", children: [
                  "🎫 ",
                  newTicketCodes.length === 1 ? "NUOVO BIGLIETTO!" : `${newTicketCodes.length} NUOVI BIGLIETTI!`
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-sm mt-1", children: "Progressione attivata!" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: newTicketCodes.map((code, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                LotteryTicketCard,
                {
                  ticketCode: code,
                  status: "active",
                  createdAt: (/* @__PURE__ */ new Date()).toISOString(),
                  isNew: true
                },
                code
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.button,
                {
                  whileHover: { scale: 1.02 },
                  whileTap: { scale: 0.98 },
                  onClick: () => setShowNewTicketModal(false),
                  className: "w-full mt-4 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors",
                  children: "CHIUDI"
                }
              )
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      pendingWins.length > 0 && !showClaimModal && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.button,
        {
          initial: { y: -10, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          onClick: () => {
            setSelectedWin(pendingWins[0]);
            setShowClaimModal(true);
          },
          className: "w-full p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/50 flex items-center justify-between",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-5 h-5 text-yellow-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-yellow-400 text-sm", children: [
                "Hai ",
                pendingWins.length,
                " milestone da sbloccare!"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-5 h-5 text-yellow-400 animate-pulse" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 rounded-full text-xs font-bold ${status.status === "active" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gray-500/20 text-gray-400 border border-gray-500/30"}`, children: status.status === "active" ? "🟢 ATTIVA" : status.status.toUpperCase() }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-xs", children: "Tempo rimanente alla missione" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-white", children: missionCountdown.formatted })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/60", children: "Progresso soglia" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-cyan-400 font-bold", children: [
            status.total_tickets,
            " / ",
            status.min_tickets_required
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 bg-white/10 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { width: 0 },
            animate: { width: `${Math.min(100, status.progress_percent)}%` },
            className: `h-full rounded-full ${status.threshold_reached ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-blue-500 to-cyan-400"}`
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-white/40", children: [
          status.total_participants,
          " partecipanti"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 rounded-xl p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-bold text-white text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-4 h-4 text-yellow-400" }),
          "Premi Top 3"
        ] }),
        status.prizes_json.map((prize) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/70", children: prize.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-yellow-400", children: [
            prize.percent,
            "%"
          ] })
        ] }, prize.rank)),
        !status.threshold_reached && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-orange-400 text-center mt-2", children: [
          "⚠️ Sotto soglia: premi ridotti al ",
          (status.prize_multiplier * 100).toFixed(0),
          "%"
        ] })
      ] }),
      status.status === "active" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 rounded-xl p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/70 text-sm", children: "I tuoi biglietti" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-white", children: [
            status.user_tickets_count,
            " / ",
            status.max_tickets_per_user
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setQuantity(Math.max(1, quantity - 1)),
              disabled: quantity <= 1,
              className: "p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-4 h-4 text-white" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-white", children: quantity }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-white/50", children: [
              "× ",
              status.ticket_price_m1u,
              " M1U"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setQuantity(Math.min(status.user_remaining_tickets, quantity + 1)),
              disabled: quantity >= status.user_remaining_tickets,
              className: "p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 text-white" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-2", children: [1, 5, 10, 25].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setQuantity(Math.min(status.user_remaining_tickets, q)),
            disabled: q > status.user_remaining_tickets,
            className: `px-3 py-1 rounded-lg text-xs font-bold transition-all ${quantity === q ? "bg-blue-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"} disabled:opacity-30`,
            children: q
          },
          q
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.button,
          {
            whileHover: canBuy ? { scale: 1.02 } : {},
            whileTap: canBuy ? { scale: 0.98 } : {},
            onClick: handleBuyTickets,
            disabled: isPurchasing || !canBuy,
            className: `w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canBuy ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400" : "bg-white/10 text-white/40 cursor-not-allowed"}`,
            children: isPurchasing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin" }),
              "Acquisto..."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "w-5 h-5" }),
              "ACQUISTA ",
              quantity,
              " BIGLIETT",
              quantity === 1 ? "O" : "I",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-white/70", children: [
                "(",
                totalCost,
                " M1U)"
              ] })
            ] })
          }
        ),
        !canAfford && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-red-400", children: [
          "Saldo insufficiente (servono ",
          totalCost,
          " M1U)"
        ] }),
        !status.user_can_buy_more && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-orange-400", children: [
          "Hai raggiunto il limite di ",
          status.max_tickets_per_user,
          " biglietti"
        ] })
      ] }),
      myTickets.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowMyTickets(!showMyTickets),
            className: "w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "w-5 h-5 text-cyan-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white text-sm", children: "I MIEI BIGLIETTI" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold", children: myTickets.length })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  animate: { rotate: showMyTickets ? 180 : 0 },
                  transition: { duration: 0.2 },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: `w-5 h-5 text-white/50 transition-transform ${showMyTickets ? "rotate-45" : ""}` })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showMyTickets && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { height: 0, opacity: 0 },
            animate: { height: "auto", opacity: 1 },
            exit: { height: 0, opacity: 0 },
            className: "overflow-hidden",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 pt-0 space-y-2 max-h-60 overflow-y-auto", children: myTickets.map((ticket) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              LotteryTicketCard,
              {
                ticketCode: ticket.ticket_code,
                status: ticket.status,
                createdAt: ticket.created_at,
                drawRank: ticket.draw_rank,
                prizeAmount: ticket.prize_amount
              },
              ticket.id
            )) })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-white/50 italic", children: [
        '"',
        status.narrative,
        '"'
      ] })
    ] })
  ] });
};

export { LotteryContent as default };
