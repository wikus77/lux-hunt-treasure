import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { c as createLucideIcon, aH as useAuth, s as supabase, a6 as useToast, v as Card, A as CardHeader, H as CardTitle, m as Shield, N as CardDescription, O as CardContent, Z as Zap, B as Button, S as Sparkles, ay as RotateCcw, Q as Activity, aM as isAdminEmail } from './index.BEQCqgv7.js';
import { A as AnimatePresence, m as motion } from './animation-vendor.BBMfCuXy.js';
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


const CirclePlay = createLucideIcon("CirclePlay", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polygon", { points: "10 8 16 12 10 16 10 8", key: "1cimsy" }]
]);

function OpenButton({ ritualId, onClaimed, mode = "prod" }) {
  const { user } = useAuth();
  const [isPressed, setIsPressed] = reactExports.useState(false);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const triggerHaptics = (style) => {
    try {
      if ("vibrate" in navigator) {
        const pattern = style === "heavy" ? [12] : [6];
        navigator.vibrate(pattern);
      }
      if (typeof window !== "undefined" && window.Capacitor?.Plugins?.Haptics) {
        window.Capacitor.Plugins.Haptics.impact({ style: style === "heavy" ? "Heavy" : "Light" });
      }
    } catch (err) {
    }
  };
  const handlePress = () => {
    setIsPressed(true);
    triggerHaptics("heavy");
  };
  const handleRelease = () => {
    setIsPressed(false);
    triggerHaptics("light");
  };
  const handleOpen = async () => {
    if (!ritualId || isLoading) return;
    setIsLoading(true);
    try {
      if (mode === "test") {
        await new Promise((resolve) => setTimeout(resolve, 500));
        onClaimed({
          type: "test_essence",
          message: "🧪 Test Ritual Essence (Sandbox)",
          ritual_id: ritualId
        });
      } else {
        if (!user?.id) {
          return;
        }
        const { data, error } = await supabase.rpc("rpc_pulse_ritual_claim", {
          p_user: user.id
        });
        if (error) throw error;
        const response = data;
        if (response?.success) {
          onClaimed(response.reward_package);
        } else {
        }
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "relative select-none outline-none group",
        onPointerDown: handlePress,
        onPointerUp: handleRelease,
        onPointerCancel: handleRelease,
        onClick: handleOpen,
        disabled: isLoading,
        "aria-label": "Open ritual reward",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `w-[200px] h-[200px] rounded-full 
                      bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.18),rgba(0,0,0,.3)_60%)]
                      shadow-[inset_0_12px_24px_rgba(0,0,0,.45)]
                      ring-1 ring-white/10
                      transition-transform duration-150 ease-out will-change-transform
                      ${isPressed ? "scale-95" : "scale-100"}
                      ${isLoading ? "opacity-70 pointer-events-none" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-[-16%] rounded-full pointer-events-none aura-spin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `absolute inset-0 rounded-full pointer-events-none
                        bg-[radial-gradient(circle_at_40%_30%,rgba(255,255,255,.15),transparent_50%)]
                        transition-opacity duration-150
                        ${isPressed ? "opacity-50" : "opacity-100"}`
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "absolute inset-0 grid place-items-center \n                       text-white font-technovier tracking-wide text-xl\n                       drop-shadow-[0_0_12px_rgba(0,231,255,.85)]\n                       antialiased [text-rendering:optimizeLegibility]",
                  children: isLoading ? "OPENING..." : "OPEN"
                }
              )
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-sm font-technovier tracking-wide antialiased", children: "The world is listening." })
  ] });
}

function RitualOrchestrator({ phase, ritualId, mode = "prod" }) {
  const [rewardData, setRewardData] = reactExports.useState(null);
  const [showReward, setShowReward] = reactExports.useState(false);
  const prefersReducedMotion = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
  reactExports.useEffect(() => {
    const root = document.documentElement;
    switch (phase) {
      case "precharge":
        root.style.setProperty("--glow-mult", "1.5");
        root.style.setProperty("--flow-mult", "0.7");
        break;
      case "blackout":
      case "interference":
        root.style.setProperty("--glow-mult", "2.0");
        root.style.setProperty("--flow-mult", "0.5");
        break;
      case "reveal":
        root.style.setProperty("--glow-mult", "1.8");
        root.style.setProperty("--flow-mult", "0.6");
        break;
      default:
        root.style.setProperty("--glow-mult", "1");
        root.style.setProperty("--flow-mult", "1");
    }
  }, [phase]);
  const handleClaimed = (reward) => {
    if (mode === "test") {
      setRewardData({
        type: "test_essence",
        copy: "🧪 Test Ritual Essence Captured (Sandbox)",
        items: [
          { title: "Test Echo Fragment", type: "Narrative", rarity: "TEST" }
        ],
        ritual_id: ritualId,
        claimed_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      setRewardData(reward);
    }
    setShowReward(true);
  };
  if (phase === "idle" || phase === "closed") {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: prefersReducedMotion ? 0.15 : 0.4 },
      className: "fixed inset-0 z-[9999] pointer-events-auto",
      style: { isolation: "isolate" },
      children: [
        phase === "precharge" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/30 backdrop-blur-sm animate-pulse-ritual-precharge", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full border-2 border-primary/50 animate-spin" }) }) }),
        phase === "blackout" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            className: "absolute inset-0 bg-black flex items-center justify-center",
            children: !prefersReducedMotion && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                animate: {
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6]
                },
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                className: "w-[300px] h-[300px] rounded-full \n                           bg-[radial-gradient(circle,rgba(255,77,240,0.3),rgba(0,231,255,0.3),transparent_70%)]\n                           blur-xl"
              }
            )
          }
        ),
        phase === "interference" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-black ritual-interference", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 ritual-scanlines opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 ritual-chromatic" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 ritual-noise animate-pulse" })
        ] }),
        phase === "reveal" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: prefersReducedMotion ? 0.15 : 0.5, ease: "easeOut" },
            className: "absolute inset-0 bg-gradient-to-b from-black/95 via-black/90 to-black/95 \n                       flex items-center justify-center backdrop-blur-md",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(OpenButton, { ritualId, onClaimed: handleClaimed, mode })
          }
        ),
        showReward && rewardData && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { y: "100%" },
            animate: { y: 0 },
            exit: { y: "100%" },
            transition: { type: "spring", damping: 25, stiffness: 300 },
            className: "absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto\n                       bg-gradient-to-b from-background/95 to-background\n                       border-t border-border/50 backdrop-blur-lg\n                       rounded-t-3xl p-6 shadow-2xl",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-technovier text-primary tracking-wide", children: "Echo Revealed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-technovier", children: rewardData.copy || "The world listened. The echo answered." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: rewardData.items?.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "p-4 rounded-xl bg-card/50 border border-border/30\n                               backdrop-blur-sm space-y-1",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-technovier text-foreground", children: item.title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-technovier", children: item.rarity })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: item.type })
                  ]
                },
                idx
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setShowReward(false),
                  className: "w-full py-3 rounded-xl bg-primary/10 hover:bg-primary/20\n                           border border-primary/30 text-primary font-technovier\n                           tracking-wide transition-colors",
                  children: "CONTINUE"
                }
              )
            ] })
          }
        )
      ]
    }
  ) });
}

function useRitualChannel({ mode = "prod" } = {}) {
  const [phase, setPhase] = reactExports.useState("idle");
  const [ritualId, setRitualId] = reactExports.useState(null);
  const [isConnected, setIsConnected] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const channelName = mode === "test" ? "pulse:ritual:test" : "pulse:ritual";
    const channel = supabase.channel(channelName).on("broadcast", { event: "ritual-phase" }, (payload) => {
      const data = payload.payload;
      setPhase(data.phase);
      setRitualId(data.ritual_id);
    }).subscribe((status) => {
      setIsConnected(status === "SUBSCRIBED");
    });
    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [mode]);
  return { phase, ritualId, isConnected, mode };
}

async function invokeEdge(functionName, options = {}) {
  const {
    body = {},
    timeout = 1e4,
    retries = 1
  } = options;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return {
      error: {
        message: "No active session - please log in",
        code: "NO_SESSION",
        hint: "Session expired or not authenticated"
      }
    };
  }
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      clearTimeout(timeoutId);
      if (error) {
        lastError = error;
        const errorData = typeof error === "object" ? error : { message: String(error) };
        const status = errorData?.status || 0;
        if (status === 401 || status === 403) {
          return {
            error: {
              message: errorData?.hint || (status === 401 ? "Unauthorized - session expired" : "Forbidden - not in admin whitelist"),
              code: errorData?.code || (status === 401 ? "UNAUTHORIZED" : "FORBIDDEN"),
              hint: errorData?.hint || "Check authentication and admin whitelist"
            }
          };
        }
        if (attempt < retries && (status === 0 || status >= 500)) {
          const backoff = 400 * (attempt + 1);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        return {
          error: {
            message: errorData?.hint || errorData?.message || "Edge function error",
            code: errorData?.code || "EDGE_ERROR",
            hint: errorData?.hint
          }
        };
      }
      if (data && typeof data === "object" && data.ok === false) {
        return {
          error: {
            message: data.hint || "Edge function returned error",
            code: data.code || "EDGE_ERROR",
            hint: data.hint
          }
        };
      }
      return { data };
    } catch (error) {
      lastError = error;
      if (error.name === "AbortError") {
        if (attempt < retries) {
          const backoff = 400 * (attempt + 1);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        return {
          error: {
            message: `Request timeout after ${timeout}ms`,
            code: "TIMEOUT",
            hint: "Edge function might be cold-starting or overloaded"
          }
        };
      }
      if (attempt < retries) {
        const backoff = 400 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }
    }
  }
  return {
    error: {
      message: lastError?.message || "Unknown error",
      code: lastError?.code || "RETRY_EXHAUSTED",
      hint: `Failed after ${retries + 1} attempts`
    }
  };
}

class EmpAudioEngine {
  graph = null;
  isUnlocked = false;
  currentPhase = "closed";
  phaseStartTime = 0;
  reducedMotion = false;
  constructor() {
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  /**
   * Initialize audio context and unlock on iOS
   */
  async initialize() {
    if (this.graph) return true;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return false;
      }
      const ctx = new AudioContextClass();
      if (ctx.state === "suspended") {
        await ctx.resume();
        if (ctx.state === "suspended") {
          return new Promise((resolve) => {
            const unlock = async () => {
              await ctx.resume();
              if (ctx.state === "running") {
                document.removeEventListener("touchstart", unlock);
                document.removeEventListener("click", unlock);
                this.isUnlocked = true;
                await this.buildGraph(ctx);
                resolve(true);
              }
            };
            document.addEventListener("touchstart", unlock, { once: true });
            document.addEventListener("click", unlock, { once: true });
          });
        }
      }
      await this.buildGraph(ctx);
      this.isUnlocked = true;
      return true;
    } catch (err) {
      return false;
    }
  }
  /**
   * Build the audio node graph
   */
  async buildGraph(ctx) {
    const masterGain = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    masterGain.gain.value = this.reducedMotion ? 0.3 : 0.6;
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 3e-3;
    compressor.release.value = 0.25;
    masterGain.connect(compressor);
    compressor.connect(ctx.destination);
    const osc1 = ctx.createOscillator();
    const osc1Gain = ctx.createGain();
    const osc1Filter = ctx.createBiquadFilter();
    osc1.type = "sine";
    osc1.frequency.value = 37;
    osc1Gain.gain.value = 0;
    osc1Filter.type = "lowpass";
    osc1Filter.frequency.value = 120;
    osc1Filter.Q.value = 1.5;
    osc1.connect(osc1Gain);
    osc1Gain.connect(osc1Filter);
    osc1Filter.connect(masterGain);
    osc1.start();
    const noiseBuffer = this.createNoiseBuffer(ctx, 2);
    const noiseGain = ctx.createGain();
    const noiseBP = ctx.createBiquadFilter();
    noiseGain.gain.value = 0;
    noiseBP.type = "bandpass";
    noiseBP.frequency.value = 4e3;
    noiseBP.Q.value = 2;
    noiseGain.connect(noiseBP);
    noiseBP.connect(masterGain);
    this.graph = {
      context: ctx,
      masterGain,
      osc1,
      osc1Gain,
      osc1Filter,
      noiseBuffer,
      noiseSource: null,
      noiseGain,
      noiseBP,
      compressor
    };
  }
  /**
   * Create white noise buffer
   */
  createNoiseBuffer(ctx, duration) {
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
  /**
   * Apply audio for specific phase
   */
  applyPhase(phase, syncTime) {
    if (!this.graph || !this.isUnlocked) {
      return;
    }
    this.currentPhase = phase;
    this.phaseStartTime = syncTime || performance.now();
    const { context: ctx, osc1Gain, osc1Filter, noiseGain, noiseBP, noiseBuffer } = this.graph;
    const now = ctx.currentTime;
    switch (phase) {
      case "precharge":
        osc1Gain.gain.cancelScheduledValues(now);
        osc1Gain.gain.setValueAtTime(0.0158, now);
        osc1Gain.gain.exponentialRampToValueAtTime(0.251, now + 1.2);
        osc1Filter.Q.cancelScheduledValues(now);
        osc1Filter.Q.setValueAtTime(1.5, now);
        osc1Filter.Q.linearRampToValueAtTime(3, now + 1.2);
        break;
      case "blackout":
        osc1Gain.gain.cancelScheduledValues(now);
        osc1Gain.gain.setValueAtTime(0, now);
        noiseGain.gain.cancelScheduledValues(now);
        noiseGain.gain.setValueAtTime(0, now);
        if (this.graph.noiseSource) {
          this.graph.noiseSource.stop();
          this.graph.noiseSource = null;
        }
        break;
      case "interference":
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        noiseSource.connect(noiseGain);
        noiseSource.start();
        this.graph.noiseSource = noiseSource;
        noiseGain.gain.cancelScheduledValues(now);
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.4, now + 0.3);
        for (let i = 0; i < 8; i++) {
          const dropTime = now + 0.3 + Math.random() * 2.5;
          const dropDuration = 0.01 + Math.random() * 0.03;
          noiseGain.gain.setValueAtTime(0.4, dropTime);
          noiseGain.gain.linearRampToValueAtTime(0, dropTime + 1e-3);
          noiseGain.gain.setValueAtTime(0, dropTime + dropDuration);
          noiseGain.gain.linearRampToValueAtTime(0.4, dropTime + dropDuration + 1e-3);
        }
        noiseBP.frequency.cancelScheduledValues(now);
        noiseBP.frequency.setValueAtTime(2e3, now);
        noiseBP.frequency.linearRampToValueAtTime(6e3, now + 1.5);
        noiseBP.frequency.linearRampToValueAtTime(3e3, now + 3);
        break;
      case "reveal":
        if (this.graph.noiseSource) {
          this.graph.noiseSource.stop();
          this.graph.noiseSource = null;
        }
        noiseGain.gain.cancelScheduledValues(now);
        noiseGain.gain.setValueAtTime(0, now);
        osc1Filter.frequency.cancelScheduledValues(now);
        osc1Filter.frequency.setValueAtTime(300, now);
        osc1Filter.frequency.exponentialRampToValueAtTime(6e3, now + 0.8);
        osc1Gain.gain.cancelScheduledValues(now);
        osc1Gain.gain.setValueAtTime(0.251, now);
        osc1Gain.gain.exponentialRampToValueAtTime(0.063, now + 0.8);
        break;
      case "closed":
        osc1Gain.gain.cancelScheduledValues(now);
        osc1Gain.gain.setValueAtTime(osc1Gain.gain.value, now);
        osc1Gain.gain.linearRampToValueAtTime(0, now + 0.25);
        noiseGain.gain.cancelScheduledValues(now);
        noiseGain.gain.setValueAtTime(noiseGain.gain.value, now);
        noiseGain.gain.linearRampToValueAtTime(0, now + 0.25);
        setTimeout(() => {
          if (this.graph?.noiseSource) {
            this.graph.noiseSource.stop();
            this.graph.noiseSource = null;
          }
        }, 300);
        break;
    }
  }
  /**
   * Stop and cleanup
   */
  stop() {
    if (!this.graph) return;
    const { context: ctx, osc1, noiseSource } = this.graph;
    try {
      osc1.stop();
      if (noiseSource) noiseSource.stop();
      ctx.close();
    } catch (err) {
    }
    this.graph = null;
    this.isUnlocked = false;
    this.currentPhase = "closed";
  }
  /**
   * Check if audio is ready
   */
  isReady() {
    return this.graph !== null && this.isUnlocked;
  }
}

class EmpVisualEngine {
  container = null;
  flashOverlay = null;
  rafId = null;
  activeBursts = [];
  lastBurstTime = 0;
  currentPhase = "closed";
  reducedMotion = false;
  lambda = 0;
  // Poisson process rate parameter
  constructor() {
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  /**
   * Start visual effects
   */
  start() {
    if (this.container) return;
    this.container = document.createElement("div");
    this.container.className = "ritual-crt-overlay";
    const scanlines = document.createElement("div");
    scanlines.className = "ritual-scanlines";
    this.container.appendChild(scanlines);
    const vignette = document.createElement("div");
    vignette.className = "ritual-vignette";
    this.container.appendChild(vignette);
    if (!this.reducedMotion) {
      const shearContainer = document.createElement("div");
      shearContainer.className = "ritual-shear-bars";
      for (let i = 0; i < 5; i++) {
        const bar = document.createElement("div");
        bar.className = "ritual-shear-bar";
        bar.style.top = `${Math.random() * 100}%`;
        bar.style.animationDelay = `${Math.random() * 0.3}s`;
        shearContainer.appendChild(bar);
      }
      this.container.appendChild(shearContainer);
    }
    this.flashOverlay = document.createElement("div");
    this.flashOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.6), rgba(255, 255, 255, 0.1) 70%);
      mix-blend-mode: screen;
      pointer-events: none;
      opacity: 0;
    `;
    this.container.appendChild(this.flashOverlay);
    document.body.appendChild(this.container);
    document.body.classList.add("ritual-distortion-active");
    this.startAnimationLoop();
  }
  /**
   * Apply phase-specific visuals
   */
  applyPhase(phase) {
    this.currentPhase = phase;
    switch (phase) {
      case "precharge":
        this.lambda = this.reducedMotion ? 0.5 : 1.2;
        break;
      case "interference":
        this.lambda = this.reducedMotion ? 0.8 : 2.5;
        document.body.classList.add("ritual-distortion-interference");
        break;
      case "blackout":
      case "reveal":
      case "closed":
        this.lambda = 0;
        document.body.classList.remove("ritual-distortion-interference");
        break;
    }
  }
  /**
   * Start RAF animation loop for flash bursts
   */
  startAnimationLoop() {
    if (this.rafId !== null) return;
    const animate = (timestamp) => {
      this.updateFlashBursts(timestamp);
      this.rafId = requestAnimationFrame(animate);
    };
    this.rafId = requestAnimationFrame(animate);
  }
  /**
   * Update flash bursts using Poisson process
   */
  updateFlashBursts(timestamp) {
    if (!this.flashOverlay) return;
    if (this.lambda > 0) {
      timestamp - this.lastBurstTime;
      const dt = 16.67;
      const probability = this.lambda * (dt / 1e3);
      if (Math.random() < probability) {
        this.createBurst(timestamp);
        this.lastBurstTime = timestamp;
      }
    }
    let totalIntensity = 0;
    this.activeBursts = this.activeBursts.filter((burst) => {
      const elapsed = timestamp - burst.startTime;
      if (elapsed >= burst.duration) return false;
      const t = elapsed / burst.duration;
      const currentIntensity = burst.intensity * burst.curve(t);
      totalIntensity += currentIntensity;
      return true;
    });
    this.flashOverlay.style.opacity = Math.min(totalIntensity, 1).toString();
  }
  /**
   * Create a new flash burst
   */
  createBurst(timestamp) {
    const duration = 60 + Math.random() * 80;
    const baseIntensity = 0.2 + Math.random() * 0.65;
    const intensity = this.reducedMotion ? baseIntensity * 0.5 : baseIntensity;
    const curve = (t) => {
      return Math.pow(1 - t, 2.5);
    };
    this.activeBursts.push({
      startTime: timestamp,
      duration,
      intensity,
      curve
    });
  }
  /**
   * Stop and cleanup
   */
  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.flashOverlay = null;
    this.activeBursts = [];
    this.currentPhase = "closed";
    this.lambda = 0;
    document.body.classList.remove("ritual-distortion-active", "ritual-distortion-interference");
  }
  /**
   * Check if running
   */
  isRunning() {
    return this.container !== null;
  }
}

class EmpEffectController {
  audioEngine;
  visualEngine;
  isRunning = false;
  lastPhaseTime = 0;
  debounceMs = 250;
  reducedMotion = false;
  options = {
    enableAudio: true,
    enableVisual: true,
    enableHaptic: true
  };
  constructor(options) {
    this.audioEngine = new EmpAudioEngine();
    this.visualEngine = new EmpVisualEngine();
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (options) {
      this.options = { ...this.options, ...options };
    }
    if (this.reducedMotion) {
      this.options.enableHaptic = false;
    }
  }
  /**
   * Initialize and start the controller
   */
  async start() {
    if (this.isRunning) {
      return;
    }
    if (this.options.enableAudio) {
      const audioReady = await this.audioEngine.initialize();
      if (!audioReady) {
        this.showAudioUnlockHint();
      }
    }
    if (this.options.enableVisual) {
      this.visualEngine.start();
    }
    this.isRunning = true;
  }
  /**
   * Apply a specific ritual phase
   */
  applyPhase(phase, syncTime) {
    if (!this.isRunning) {
      return;
    }
    const now = performance.now();
    if (now - this.lastPhaseTime < this.debounceMs) {
      return;
    }
    this.lastPhaseTime = now;
    const t0 = syncTime || now + 60;
    if (this.options.enableVisual) {
      this.visualEngine.applyPhase(phase);
    }
    if (this.options.enableAudio && this.audioEngine.isReady()) {
      this.audioEngine.applyPhase(phase, t0);
    }
    if (this.options.enableHaptic && phase === "interference") {
      this.triggerHaptic();
    }
    if (phase === "closed") {
      setTimeout(() => this.stop(), 500);
    }
  }
  /**
   * Trigger haptic vibration (random pattern during interference)
   */
  triggerHaptic() {
    if (!("vibrate" in navigator)) return;
    const pattern = [
      10 + Math.random() * 20,
      // vibrate
      30 + Math.random() * 40,
      // pause
      8 + Math.random() * 15,
      // vibrate
      20 + Math.random() * 30,
      // pause
      12 + Math.random() * 18
      // vibrate
    ];
    try {
      navigator.vibrate(pattern);
    } catch (err) {
    }
    if (this.isRunning) {
      const nextDelay = 300 + Math.random() * 200;
      setTimeout(() => {
        if (this.isRunning) {
          this.triggerHaptic();
        }
      }, nextDelay);
    }
  }
  /**
   * Stop and cleanup all effects
   */
  stop() {
    if (!this.isRunning) return;
    this.audioEngine.stop();
    this.visualEngine.stop();
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
    this.isRunning = false;
    this.lastPhaseTime = 0;
  }
  /**
   * Check if controller is running
   */
  isActive() {
    return this.isRunning;
  }
  /**
   * Show audio unlock hint for iOS (if needed)
   */
  showAudioUnlockHint() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;
    const hint = document.createElement("div");
    hint.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px 30px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      z-index: 999999;
      pointer-events: auto;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;
    hint.textContent = "🔊 Tap to enable audio";
    const unlock = async () => {
      await this.audioEngine.initialize();
      hint.remove();
    };
    hint.addEventListener("click", unlock);
    hint.addEventListener("touchstart", unlock);
    document.body.appendChild(hint);
    setTimeout(() => hint.remove(), 5e3);
  }
}

function PulseLab() {
  const { toast } = useToast();
  const [authStatus, setAuthStatus] = reactExports.useState("loading");
  const [userEmail, setUserEmail] = reactExports.useState("");
  const [mockValue, setMockValue] = reactExports.useState(45);
  const [logs, setLogs] = reactExports.useState([]);
  const [isFiring, setIsFiring] = reactExports.useState(false);
  const { phase, ritualId, isConnected } = useRitualChannel({ mode: "test" });
  const empControllerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setAuthStatus("denied");
          return;
        }
        const isAdmin = isAdminEmail(user.email);
        if (!isAdmin) {
          setAuthStatus("denied");
          setUserEmail(user.email || "unknown");
          return;
        }
        setAuthStatus("authorized");
        setUserEmail(user.email || "");
        addLog(`✅ Authorized: ${user.email}`);
      } catch (error) {
        setAuthStatus("denied");
      }
    };
    checkAuth();
  }, []);
  reactExports.useEffect(() => {
    const initController = async () => {
      if (!empControllerRef.current) {
        empControllerRef.current = new EmpEffectController({
          enableAudio: true,
          enableVisual: true,
          enableHaptic: true
        });
      }
    };
    initController();
    return () => {
      if (empControllerRef.current?.isActive()) {
        empControllerRef.current.stop();
      }
    };
  }, []);
  reactExports.useEffect(() => {
    if (phase === "idle") return;
    addLog(`🌟 Phase: ${phase} (ritual_id: ${ritualId})`);
    const controller = empControllerRef.current;
    if (!controller) return;
    if (!controller.isActive()) {
      addLog("⚡ EMP CONTROLLER: Starting full cinematic effect...");
      controller.start().then(() => {
        controller.applyPhase(phase);
      });
    } else {
      controller.applyPhase(phase);
    }
    switch (phase) {
      case "precharge":
        addLog("⚡ PRECHARGE: Sub-bass ramp + flash bursts starting");
        break;
      case "blackout":
        addLog("⚫ BLACKOUT: Hard audio mute + visual freeze");
        break;
      case "interference":
        addLog("⚡⚡ INTERFERENCE: Noise + glitch + haptic bursts");
        break;
      case "reveal":
        addLog("✨ REVEAL: Whoosh + filter sweep");
        break;
      case "closed":
        addLog("🔒 CLOSED: Fade-out + cleanup");
        break;
    }
  }, [phase, ritualId]);
  const addLog = (message) => {
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };
  const handleSimulate100 = () => {
    setMockValue(100);
    addLog("🎯 Pulse simulated at 100%");
  };
  const handlePingEdge = async () => {
    addLog("🏓 Pinging edge function...");
    const { data, error } = await invokeEdge("ritual-test-fire", {
      body: { action: "ping" },
      retries: 2
    });
    if (error) {
      addLog(`❌ Ping failed [${error.code}]: ${error.message}`);
      if (error.code === "FORBIDDEN" || error.code === "ADMIN_REQUIRED") {
        toast({
          title: "Access Denied",
          description: "Not in admin whitelist. Check ADMIN_WHITELIST secret.",
          variant: "destructive"
        });
      } else if (error.code === "UNAUTHORIZED" || error.code === "AUTH_MISSING" || error.code === "NO_SESSION") {
        toast({
          title: "Session Expired",
          description: "Please log out and log in again",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Edge Function Error",
          description: error.hint || error.message,
          variant: "destructive"
        });
      }
      return;
    }
    addLog(`✅ Ping successful: ${data.whoami || userEmail}`);
    toast({
      title: "Edge Function Online",
      description: `Connected as ${data.whoami || userEmail}`
    });
  };
  const handleFireRitual = async () => {
    setIsFiring(true);
    addLog("🚀 Firing test ritual...");
    addLog(`🔑 Authenticated as: ${userEmail}`);
    const { data, error } = await invokeEdge("ritual-test-fire", {
      body: {
        mode: "test",
        timestamp: Date.now()
      },
      retries: 2
    });
    if (error) {
      addLog(`❌ Ritual fire failed [${error.code}]: ${error.message}`);
      if (error.code === "FORBIDDEN" || error.code === "ADMIN_REQUIRED") {
        toast({
          title: "Access Denied",
          description: "Not in admin whitelist. Email must match ADMIN_WHITELIST secret.",
          variant: "destructive"
        });
      } else if (error.code === "UNAUTHORIZED" || error.code === "AUTH_MISSING" || error.code === "NO_SESSION") {
        toast({
          title: "Session Expired",
          description: "Please log out and log in again to refresh your session",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Ritual Failed",
          description: error.hint || error.message,
          variant: "destructive"
        });
      }
      setIsFiring(false);
      return;
    }
    addLog(`✅ Test ritual sequence started`);
    addLog(`📊 Ritual ID: ${data.test_ritual_id || "N/A"}`);
    addLog(`📡 Channel: ${data.channel || "pulse:ritual:test"}`);
    addLog(`🌟 Phases queued: ${data.phases?.join(" → ") || "precharge → blackout → interference → reveal → closed"}`);
    toast({
      title: "Ritual Fired!",
      description: "Watch for phase broadcasts in the event log below"
    });
    setIsFiring(false);
  };
  const handleReset = () => {
    setMockValue(45);
    setLogs([]);
    addLog("🔄 Lab reset");
  };
  if (authStatus === "loading") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse text-muted-foreground", children: "Authorizing..." }) });
  }
  if (authStatus === "denied") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-5 h-5" }),
          "Access Denied"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Admin Pulse Lab — Restricted Area" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "You do not have permission to access this page." }),
        userEmail && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-mono", children: [
          "Current user: ",
          userEmail
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This area is restricted to authorized M1SSION™ administrators only." })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background p-4 pb-safe", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        className: "max-w-4xl mx-auto mb-6",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-6 h-6 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-technovier font-bold text-foreground", children: "Admin Pulse Lab" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Isolated sandbox for testing The Pulse™ ritual orchestration" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto grid gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-5 h-5 text-primary" }),
            "Mock Pulse State"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Simulated pulse value (sandbox only)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full h-[14px] rounded-full overflow-hidden bg-card border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute inset-0 bg-gradient-to-r from-primary via-primary-glow to-primary",
              style: { width: `${mockValue}%` },
              animate: {
                opacity: [0.7, 1, 0.7]
              },
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-3xl font-technovier font-bold text-foreground", children: [
            mockValue,
            "%"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: handleSimulate100,
                className: "flex-1",
                variant: "default",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 mr-2" }),
                  "Simula 100%"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: handleReset,
                variant: "outline",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-4 h-4" })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlay, { className: "w-5 h-5 text-primary" }),
            "Ritual Controls"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
            "Test channel: pulse:ritual:test • Status: ",
            isConnected ? "🟢 Connected" : "🔴 Disconnected"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-card border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Current Phase" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-technovier font-bold text-foreground", children: phase.toUpperCase() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: handlePingEdge,
                variant: "outline",
                className: "w-full",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-4 h-4 mr-2" }),
                  "Ping Edge"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: handleFireRitual,
                disabled: isFiring,
                className: "w-full",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4 mr-2" }),
                  isFiring ? "Firing..." : "Avvia Ritual"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Triggers complete ritual sequence on test channel. Safe, no DB writes to production." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Event Log" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Real-time ritual events from test channel" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-lg p-4 h-[300px] overflow-y-auto font-mono text-xs", children: logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "No events yet..." }) : logs.map((log, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground mb-1", children: log }, i)) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RitualOrchestrator,
      {
        phase,
        ritualId,
        mode: "test"
      }
    )
  ] });
}

export { PulseLab as default };
