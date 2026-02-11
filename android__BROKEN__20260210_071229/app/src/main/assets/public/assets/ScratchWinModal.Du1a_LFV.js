import { r as reactExports, j as jsxRuntimeExports, A as AnimatePresence, m as motion } from './animation-vendor.BiI6PE8T.js';
import { r as reactDomExports } from './map-vendor.uCr1tAyj.js';
import { bZ as useNotifications, G as Gift, X, a1 as LoaderCircle, S as Sparkles, e as CircleAlert, s as supabase, F as confetti, m as ue } from './index.CUdqZWfi.js';
import './supabase-vendor.CPRn8nK0.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

const TIER_CONFIG = {
  10: {
    image: "/assets/scratch/scratch-win-10m1u.png",
    milestoneThreshold: 100,
    // Progress points for milestone
    color: "#FFD700",
    gradient: "from-yellow-500 to-amber-600",
    // Progress symbols for cells (no win/lose)
    progressSymbols: ["+5 PT", "+10 PT", "+15 PT", "+20 PT", "INDIZIO"]
  },
  30: {
    image: "/assets/scratch/scratch-win-30m1u.png",
    milestoneThreshold: 100,
    color: "#00BFFF",
    gradient: "from-cyan-500 to-blue-600",
    progressSymbols: ["+10 PT", "+15 PT", "+25 PT", "+30 PT", "+40 PT", "INDIZIO"]
  },
  50: {
    image: "/assets/scratch/scratch-win-50m1u.png",
    milestoneThreshold: 100,
    color: "#FF1493",
    gradient: "from-pink-500 to-purple-600",
    progressSymbols: ["+20 PT", "+30 PT", "+40 PT", "+50 PT", "+75 PT", "INDIZIO"]
  }
};
const SCRATCH_THRESHOLD = 60;
const GRID_COLS = 4;
const GRID_ROWS = 3;
const GRID_TOP_PERCENT = 52.5;
const GRID_BOTTOM_PERCENT = 76;
const GRID_LEFT_PERCENT = 10.5;
const GRID_RIGHT_PERCENT = 89.5;
const ScratchWinModal = ({
  isOpen,
  onClose,
  tier,
  purchaseId,
  clientNonce
}) => {
  const canvasRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const ticketRef = reactExports.useRef(null);
  const [isRevealing, setIsRevealing] = reactExports.useState(false);
  const [isRevealed, setIsRevealed] = reactExports.useState(false);
  const [scratchProgress, setScratchProgress] = reactExports.useState(0);
  const [canReveal, setCanReveal] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const [isScratching, setIsScratching] = reactExports.useState(false);
  const [gridSymbols, setGridSymbols] = reactExports.useState([]);
  const [imageLoaded, setImageLoaded] = reactExports.useState(false);
  const { addNotification } = useNotifications();
  const config = TIER_CONFIG[tier];
  reactExports.useEffect(() => {
    if (isOpen) {
      setGridSymbols([]);
      setImageLoaded(false);
      setScratchProgress(0);
      setCanReveal(false);
      setIsRevealed(false);
      setResult(null);
      setError(null);
    }
  }, [isOpen, tier]);
  const generateRevealedGrid = reactExports.useCallback((rewardType, rewardValue) => {
    const grid = [];
    const PROGRESS_SYMBOLS = ["+5 PT", "+10 PT", "→", "STEP", "OK"];
    if (rewardType === "progress" && rewardValue === 0) {
      const progressSymbols = [...PROGRESS_SYMBOLS, ...PROGRESS_SYMBOLS, ...PROGRESS_SYMBOLS];
      return progressSymbols.slice(0, 12).sort(() => Math.random() - 0.5);
    }
    let highlightSymbol;
    if (rewardType === "clue") {
      highlightSymbol = "INDIZIO";
    } else if (rewardType === "m1u") {
      highlightSymbol = `+${rewardValue} M1U`;
    } else {
      highlightSymbol = `+${rewardValue} PT`;
    }
    const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const shuffled = positions.sort(() => Math.random() - 0.5);
    const highlightPositions = new Set(shuffled.slice(0, 3));
    const fillerOptions = [...PROGRESS_SYMBOLS];
    config.progressSymbols.forEach((p) => {
      if (p !== highlightSymbol) {
        fillerOptions.push(p);
      }
    });
    for (let i = 0; i < 12; i++) {
      if (highlightPositions.has(i)) {
        grid.push(highlightSymbol);
      } else {
        const randomSymbol = fillerOptions[Math.floor(Math.random() * fillerOptions.length)];
        grid.push(randomSymbol);
      }
    }
    return grid;
  }, [config.progressSymbols]);
  reactExports.useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current || !imageLoaded) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#8B7500");
    gradient.addColorStop(0.2, "#B8860B");
    gradient.addColorStop(0.4, "#DAA520");
    gradient.addColorStop(0.5, "#FFD700");
    gradient.addColorStop(0.6, "#DAA520");
    gradient.addColorStop(0.8, "#B8860B");
    gradient.addColorStop(1, "#8B7500");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    for (let i = 0; i < 2e3; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const alpha = Math.random() * 0.15;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha * 0.5})`;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const size = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(139, 69, 19, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, rect.width - 4, rect.height - 4);
    ctx.fillStyle = "rgba(101, 67, 33, 0.9)";
    ctx.font = `bold ${Math.min(rect.width / 12, 16)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GRATTA", rect.width / 2, rect.height / 2 - 8);
    ctx.font = `${Math.min(rect.width / 16, 12)}px Arial`;
    ctx.fillText("con il dito", rect.width / 2, rect.height / 2 + 10);
    ctx.globalCompositeOperation = "destination-out";
  }, [isOpen, imageLoaded]);
  const calculateProgress = reactExports.useCallback(() => {
    if (!canvasRef.current) return 0;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    const total = pixels.length / 4;
    return Math.round(transparent / total * 100);
  }, []);
  const scratch = reactExports.useCallback((clientX, clientY) => {
    if (!canvasRef.current || !containerRef.current || isRevealed) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const canvasRect = canvas.getBoundingClientRect();
    const x = clientX - canvasRect.left;
    const y = clientY - canvasRect.top;
    const baseRadius = 8;
    const radius = baseRadius + (Math.random() - 0.5) * 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    if (Math.random() < 0.08) {
      const progress = calculateProgress();
      setScratchProgress(progress);
      if (progress >= SCRATCH_THRESHOLD && !canReveal) {
        setCanReveal(true);
      }
    }
  }, [isRevealed, calculateProgress, canReveal]);
  const handleTouchStart = reactExports.useCallback((e) => {
    e.preventDefault();
    setIsScratching(true);
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  }, [scratch]);
  const handleTouchMove = reactExports.useCallback((e) => {
    if (!isScratching) return;
    e.preventDefault();
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  }, [isScratching, scratch]);
  const handleTouchEnd = reactExports.useCallback(() => {
    setIsScratching(false);
    const progress = calculateProgress();
    setScratchProgress(progress);
    if (progress >= SCRATCH_THRESHOLD && !canReveal) {
      setCanReveal(true);
    }
  }, [calculateProgress, canReveal]);
  const handleMouseDown = reactExports.useCallback((e) => {
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  }, [scratch]);
  const handleMouseMove = reactExports.useCallback((e) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  }, [isScratching, scratch]);
  const handleMouseUp = reactExports.useCallback(() => {
    setIsScratching(false);
    const progress = calculateProgress();
    setScratchProgress(progress);
    if (progress >= SCRATCH_THRESHOLD && !canReveal) {
      setCanReveal(true);
    }
  }, [calculateProgress, canReveal]);
  const handleReveal = async () => {
    if (isRevealing || isRevealed) return;
    setIsRevealing(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("reveal_scratch_progress", {
        p_purchase_id: purchaseId,
        p_client_nonce: clientNonce
      });
      if (rpcError) throw rpcError;
      if (data.status === "error") {
        throw new Error(data.message);
      }
      const rewardType = data.reward_type || "progress";
      const rewardValue = data.reward_value || 0;
      const milestoneReached = data.milestone_reached || false;
      const milestoneLevel = data.milestone_level || 0;
      const clueText = data.clue_text || null;
      const revealedGrid = generateRevealedGrid(rewardType, rewardValue);
      setGridSymbols(revealedGrid);
      setResult({
        rewardType,
        rewardValue,
        milestoneReached,
        milestoneLevel,
        clueText
      });
      setIsRevealed(true);
      setScratchProgress(100);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      if (milestoneReached && rewardType === "m1u" && rewardValue > 0) {
        const duration = 3e3;
        const end = Date.now() + duration;
        const milestoneConfetti = () => {
          confetti({
            particleCount: 80,
            spread: 120,
            startVelocity: 45,
            origin: { y: 0.6 },
            colors: ["#FFD700", "#FFA500", "#FF6347", "#FF1493", "#00FF00"]
          });
          if (Date.now() < end) {
            requestAnimationFrame(milestoneConfetti);
          }
        };
        milestoneConfetti();
        ue.success("🎯 MILESTONE RAGGIUNTA!", {
          description: `Livello ${milestoneLevel} sbloccato! +${rewardValue.toLocaleString()} M1U`,
          duration: 8e3
        });
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("m1u-credited", {
            detail: { amount: rewardValue }
          }));
        }, 1500);
      } else if (rewardType === "progress") {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#4169E1", "#00BFFF", "#1E90FF"]
        });
        ue.success("📈 Progressione completata!", {
          description: `+${rewardValue} punti avanzamento`
        });
      } else if (rewardType === "clue") {
        confetti({
          particleCount: 30,
          spread: 50,
          colors: ["#00BFFF", "#1E90FF", "#4169E1"]
        });
        const clueMessage = clueText || "Nuovo indizio rivelato! Controlla le notifiche.";
        ue.success("🔍 Indizio rivelato!", {
          description: clueMessage,
          duration: 8e3
        });
        if (addNotification && clueText) {
          addNotification({
            title: "🔍 Nuovo indizio sbloccato!",
            description: clueText
          });
        }
      } else {
        ue.info("✨ Rivelazione completata!", {
          description: "Continua a fare progressi!"
        });
      }
    } catch (err) {
      setError(err.message || "Errore durante la rivelazione");
      ue.error("Errore", { description: err.message });
    } finally {
      setIsRevealing(false);
    }
  };
  reactExports.useEffect(() => {
    if (canReveal && !isRevealed && !isRevealing) {
      const timer = setTimeout(() => {
        handleReveal();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [canReveal, isRevealed, isRevealing]);
  if (!isOpen) return null;
  const modalContent = /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-[999999] flex flex-col bg-black",
      style: {
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between px-4 py-3",
            style: {
              background: `linear-gradient(135deg, ${config.color}40, transparent)`,
              borderBottom: `1px solid ${config.color}30`
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-6 h-6", style: { color: config.color } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-bold text-lg", children: "RIVELA PROGRESSI" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/70 text-sm", children: [
                  "• ",
                  tier,
                  " M1U"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.button,
                {
                  className: "p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors",
                  onClick: onClose,
                  whileHover: { scale: 1.1 },
                  whileTap: { scale: 0.9 },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-white" })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center p-4 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              ref: ticketRef,
              className: "relative",
              style: {
                maxWidth: "380px",
                maxHeight: "calc(100vh - 200px)"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: config.image,
                    alt: `Scratch ticket ${tier} M1U`,
                    className: "w-auto h-auto max-w-full rounded-lg shadow-2xl",
                    style: {
                      maxHeight: "calc(100vh - 200px)",
                      boxShadow: `0 0 60px ${config.color}50`
                    },
                    onLoad: () => setImageLoaded(true),
                    onError: (e) => {
                      setImageLoaded(true);
                    }
                  }
                ),
                imageLoaded && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    ref: containerRef,
                    className: "absolute overflow-hidden rounded-sm",
                    style: {
                      top: `${GRID_TOP_PERCENT}%`,
                      left: `${GRID_LEFT_PERCENT}%`,
                      width: `${GRID_RIGHT_PERCENT - GRID_LEFT_PERCENT}%`,
                      height: `${GRID_BOTTOM_PERCENT - GRID_TOP_PERCENT}%`
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          className: "absolute inset-0 grid gap-0.5 p-0.5",
                          style: {
                            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                            gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`
                          },
                          children: [
                            gridSymbols.length === 0 && Array.from({ length: 12 }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              {
                                className: "flex items-center justify-center rounded",
                                style: {
                                  background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
                                  border: "1px solid rgba(255,255,255,0.05)",
                                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)"
                                }
                              },
                              `empty-${index}`
                            )),
                            gridSymbols.length > 0 && gridSymbols.map((symbol, index) => {
                              const isProgressStep = symbol === "STEP" || symbol === "→" || symbol === "OK" || symbol.includes("PT");
                              const isIndizio = symbol === "INDIZIO";
                              const isM1U = symbol.includes("M1U");
                              let bgColor = "bg-gray-800/90";
                              let textColor = "text-white";
                              let fontSize = "0.55rem";
                              let glow = "none";
                              if (isProgressStep) {
                                bgColor = "bg-blue-900/80";
                                textColor = "text-blue-300";
                                fontSize = "0.5rem";
                              } else if (isIndizio) {
                                bgColor = "bg-cyan-700/90";
                                textColor = "text-cyan-200";
                                fontSize = "0.45rem";
                                glow = "0 0 12px rgba(0,255,255,0.6)";
                              } else if (isM1U) {
                                bgColor = "bg-yellow-700/90";
                                textColor = "text-yellow-200";
                                fontSize = "0.45rem";
                                glow = "0 0 12px rgba(255,215,0,0.8)";
                              }
                              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                                motion.div,
                                {
                                  initial: { scale: 0, opacity: 0 },
                                  animate: { scale: 1, opacity: 1 },
                                  transition: {
                                    delay: index * 0.03,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20
                                  },
                                  className: `flex items-center justify-center ${bgColor} rounded border border-white/20 ${textColor}`,
                                  style: {
                                    fontSize,
                                    fontWeight: "bold",
                                    textShadow: glow,
                                    lineHeight: 1.1,
                                    textAlign: "center",
                                    padding: "2px"
                                  },
                                  children: symbol
                                },
                                index
                              );
                            })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "canvas",
                        {
                          ref: canvasRef,
                          className: "absolute inset-0 w-full h-full touch-none cursor-crosshair rounded",
                          style: { touchAction: "none" },
                          onTouchStart: handleTouchStart,
                          onTouchMove: handleTouchMove,
                          onTouchEnd: handleTouchEnd,
                          onMouseDown: handleMouseDown,
                          onMouseMove: handleMouseMove,
                          onMouseUp: handleMouseUp,
                          onMouseLeave: handleMouseUp
                        }
                      ),
                      isRevealing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/60 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-10 h-10 text-white animate-spin" }) })
                    ]
                  }
                ),
                isRevealed && result && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg z-10", children: result.rewardType === "m1u" && result.rewardValue > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { y: 50, opacity: 0 },
                    animate: { y: 0, opacity: 1 },
                    transition: { delay: 0.2 },
                    className: "text-center px-4",
                    children: [
                      result.milestoneReached && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          animate: { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] },
                          transition: { duration: 0.5, repeat: Infinity },
                          className: "text-3xl mb-2",
                          children: "🎯 MILESTONE! 🎯"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-2 mb-3", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        motion.div,
                        {
                          initial: { scale: 0, rotate: -180 },
                          animate: { scale: 1, rotate: 0 },
                          transition: { delay: 0.1 * i, type: "spring" },
                          className: "w-16 h-12 flex items-center justify-center bg-yellow-700/90 rounded border-2 border-yellow-400 text-yellow-200 font-bold text-xs",
                          style: { textShadow: "0 0 10px rgba(255,215,0,0.8)" },
                          children: [
                            result.rewardValue,
                            " M1U"
                          ]
                        },
                        i
                      )) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        motion.div,
                        {
                          className: `text-5xl font-black bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`,
                          animate: { scale: [1, 1.05, 1] },
                          transition: { duration: 1, repeat: Infinity },
                          children: [
                            "+",
                            result.rewardValue.toLocaleString()
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl text-white font-bold mt-1", children: "M1U" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-6 h-6 mx-auto mt-2", style: { color: config.color } })
                    ]
                  }
                ) : result.rewardType === "clue" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { y: 50, opacity: 0 },
                    animate: { y: 0, opacity: 1 },
                    className: "text-center px-4",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-2 mb-3", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          initial: { scale: 0, rotate: -180 },
                          animate: { scale: 1, rotate: 0 },
                          transition: { delay: 0.1 * i, type: "spring" },
                          className: "w-16 h-12 flex items-center justify-center bg-cyan-700/90 rounded border-2 border-cyan-400 text-cyan-200 font-bold text-xs",
                          style: { textShadow: "0 0 8px rgba(0,255,255,0.6)" },
                          children: "INDIZIO"
                        },
                        i
                      )) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl mb-2", children: "🔍" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-white mb-2", children: "INDIZIO SBLOCCATO!" }),
                      result.clueText && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/80 text-sm italic max-w-xs mx-auto", children: [
                        '"',
                        result.clueText,
                        '"'
                      ] })
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { y: 50, opacity: 0 },
                    animate: { y: 0, opacity: 1 },
                    className: "text-center px-6",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl mb-4", children: "✨" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-white/80", children: "Rivelazione completata" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 mt-2 text-sm", children: "Continua a fare progressi!" })
                    ]
                  }
                ) })
              ]
            }
          ),
          " "
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "px-4 py-4",
            style: {
              background: `linear-gradient(to top, ${config.color}20, transparent)`,
              borderTop: `1px solid ${config.color}20`
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-white/70 mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Grattato: ",
                    scratchProgress,
                    "%"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isRevealed ? "✅ Completato!" : scratchProgress >= SCRATCH_THRESHOLD ? "✅ Pronto per rivelare!" : `Gratta ancora ${SCRATCH_THRESHOLD - scratchProgress}%` })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 bg-white/20 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: `h-full bg-gradient-to-r ${config.gradient}`,
                    initial: { width: 0 },
                    animate: { width: `${scratchProgress}%` },
                    transition: { duration: 0.3 }
                  }
                ) })
              ] }),
              error && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  className: "max-w-md mx-auto mb-3 p-3 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center gap-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-red-500 flex-shrink-0" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-300 text-sm", children: error })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-md mx-auto", children: isRevealed ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.button,
                {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  onClick: onClose,
                  className: `w-full py-4 rounded-full font-bold text-white text-lg bg-gradient-to-r ${config.gradient} shadow-lg hover:shadow-xl transition-all active:scale-95`,
                  children: "CHIUDI"
                }
              ) : canReveal ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.button,
                {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  onClick: handleReveal,
                  disabled: isRevealing,
                  className: `w-full py-4 rounded-full font-bold text-white text-lg bg-gradient-to-r ${config.gradient} shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50`,
                  children: isRevealing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin" }),
                    "RIVELANDO..."
                  ] }) : "🎁 RIVELA IL PREMIO!"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-white/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-pulse", children: "👆 Gratta l'area dorata per rivelare i simboli" }) }) })
            ]
          }
        )
      ]
    }
  ) });
  return reactDomExports.createPortal(modalContent, document.body);
};

export { ScratchWinModal, ScratchWinModal as default };
