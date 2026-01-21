import { j as jsxRuntimeExports } from './ui-vendor.sKtoNQj2.js';
import { r as reactExports } from './react-vendor.FGvtrp7q.js';
import { cp as ARCHETYPE_CONFIGS, bH as Dialog, bI as DialogContent, s as supabase, x as useUnifiedAuth, X, au as Badge, cq as Info, ba as Switch, B as Button, ak as ScrollArea, ce as format, cf as it, u as useLocation, cr as useDNA, m as ue, a1 as LoaderCircle, bD as ArrowLeft } from './index.C8SyQ7Ep.js';
import { m as motion, A as AnimatePresence } from './animation-vendor.BT4oAzOt.js';
import { C as Controls, V as Vector3, M as MOUSE, T as TOUCH, Q as Quaternion, S as Spherical, a as Vector2, R as Ray, P as Plane, b as MathUtils, c as SphereGeometry, d as MeshBasicMaterial, I as InstancedMesh, e as Matrix4, f as Color, g as Raycaster, L as LineCurve3, h as TubeGeometry, i as ShaderMaterial, A as AdditiveBlending, j as Mesh, W as WebGLRenderer, k as SRGBColorSpace, l as ACESFilmicToneMapping, m as Scene, F as Fog, n as PerspectiveCamera, G as Group, B as BufferGeometry, o as BufferAttribute, E as EdgesGeometry, p as LineBasicMaterial, q as LineSegments, r as Clock } from './three-vendor.C6aK7nO_.js';
import './supabase-vendor.DVELIqeo.js';
import './stripe-vendor.C-6aXM1t.js';
import './map-vendor.DftgD3cK.js';
import './router-vendor.Bb8w37VQ.js';

class NeuralAudioEngine {
  audioContext = null;
  masterVolume = 0.6;
  isMuted = false;
  constructor() {
    this.loadMuteState();
  }
  getContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }
  loadMuteState() {
    try {
      const saved = localStorage.getItem("neural_mute");
      this.isMuted = saved === "true";
    } catch (e) {
      this.isMuted = false;
    }
  }
  setMuted(muted) {
    this.isMuted = muted;
    try {
      localStorage.setItem("neural_mute", String(muted));
    } catch (e) {
    }
  }
  isMutedState() {
    return this.isMuted;
  }
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
  playTone(frequency, duration, type = "sine", volume = 0.3) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume * this.masterVolume;
    gainNode.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + duration);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }
  playChord(frequencies, duration, volume = 0.2) {
    frequencies.forEach((freq) => this.playTone(freq, duration, "sine", volume / frequencies.length));
  }
  // Select node sound with reverb
  playSelect() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const convolver = ctx.createConvolver();
    const impulseLength = ctx.sampleRate * 0.6;
    const impulse = ctx.createBuffer(2, impulseLength, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / impulseLength * 3);
      }
    }
    convolver.buffer = impulse;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const reverbGain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gainNode.gain.value = 0.2 * this.masterVolume;
    gainNode.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.08);
    reverbGain.gain.value = 0.3;
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    gainNode.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(ctx.destination);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  }
  // Dragging sound (FM sweep with sub rumble)
  playDrag() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modulatorGain = ctx.createGain();
    const carrierGain = ctx.createGain();
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    carrier.type = "sine";
    carrier.frequency.setValueAtTime(500, ctx.currentTime);
    carrier.frequency.exponentialRampToValueAtTime(4e3, ctx.currentTime + 0.2);
    modulator.type = "sine";
    modulator.frequency.value = 80;
    modulatorGain.gain.value = 200;
    sub.type = "sine";
    sub.frequency.value = 55;
    subGain.gain.value = 0.08 * this.masterVolume;
    carrierGain.gain.value = 0.12 * this.masterVolume;
    carrierGain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.2);
    modulator.connect(modulatorGain);
    modulatorGain.connect(carrier.frequency);
    carrier.connect(carrierGain);
    carrierGain.connect(ctx.destination);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    carrier.start(ctx.currentTime);
    modulator.start(ctx.currentTime);
    sub.start(ctx.currentTime);
    carrier.stop(ctx.currentTime + 0.2);
    modulator.stop(ctx.currentTime + 0.2);
    sub.stop(ctx.currentTime + 0.2);
  }
  // Valid connection sound with delay tail
  playConnect() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const frequencies = [261.63, 329.63, 392, 493.88, 587.33];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = ctx.createDelay();
      const delayGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.25 / frequencies.length * this.masterVolume;
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.5);
      delay.delayTime.value = 0.15;
      delayGain.gain.value = 0.4;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.02);
      osc.stop(ctx.currentTime + 0.5);
    });
    setTimeout(() => {
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 4);
      }
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();
      source.buffer = buffer;
      filter.type = "highpass";
      filter.frequency.value = 3e3;
      gainNode.gain.value = 0.1 * this.masterVolume;
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(ctx.currentTime);
    }, 50);
  }
  // Error sound (band-stop noise + reverse hit)
  playError() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const envelope = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = 500;
    filter.Q.value = 8;
    gainNode.gain.value = 0.25 * this.masterVolume;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(ctx.currentTime);
  }
  // Cinematic victory sequence (2s rise + pulse drop + reverb tail)
  playVictory() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const notes = [261.63, 329.63, 392, 493.88, 587.33, 783.99];
    const convolver = ctx.createConvolver();
    const impulseLength = ctx.sampleRate * 2;
    const impulse = ctx.createBuffer(2, impulseLength, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / impulseLength * 2);
      }
    }
    convolver.buffer = impulse;
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const reverbGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.value = 0.2 / notes.length * this.masterVolume;
        gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.8);
        reverbGain.gain.value = 0.5;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.connect(convolver);
        convolver.connect(reverbGain);
        reverbGain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
      }, i * 150);
    });
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = "sawtooth";
      osc.frequency.value = 130.81;
      filter.type = "lowpass";
      filter.frequency.value = 200;
      gain.gain.value = 0.3 * this.masterVolume;
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 1.2);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
    }, 1e3);
  }
}
new NeuralAudioEngine();

class DNAErrorBoundary extends reactExports.Component {
  state = { err: void 0 };
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(error, errorInfo) {
  }
  render() {
    if (this.state.err) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-md p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-destructive text-lg font-semibold mb-2", children: "DNA Module Error" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "An error occurred while loading the DNA experience. Please refresh the page." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => window.location.reload(),
            className: "mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90",
            children: "Reload Page"
          }
        )
      ] }) });
    }
    return this.props.children;
  }
}

const ArchetypeIcon = ({
  archetype,
  size = 24,
  animated = true
}) => {
  const shouldAnimate = animated && window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  const color = ARCHETYPE_CONFIGS[archetype].color;
  const iconVariants = {
    Seeker: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.path,
        {
          d: "M12 5C7 5 2.73 8.11 1 12.5c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5z",
          stroke: color,
          strokeWidth: "1.5",
          fill: "none",
          animate: shouldAnimate ? {
            opacity: [1, 0.7, 1],
            scale: [1, 1.02, 1]
          } : {},
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.circle,
        {
          cx: "12",
          cy: "12.5",
          r: "3.5",
          fill: color,
          opacity: "0.8",
          animate: shouldAnimate ? {
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          } : {},
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12.5", r: "1.5", fill: "#000" })
    ] }),
    Breaker: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.path,
        {
          d: "M13 2L3 14h8l-1 8 10-12h-8l1-8z",
          fill: color,
          opacity: "0.9",
          animate: shouldAnimate ? {
            x: [0, -1, 1, 0],
            opacity: [0.9, 1, 0.9, 1, 0.9]
          } : {},
          transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.2, 0.4, 0.6, 1]
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.path,
        {
          d: "M13 2L3 14h8l-1 8 10-12h-8l1-8z",
          stroke: color,
          strokeWidth: "1",
          fill: "none",
          animate: shouldAnimate ? {
            opacity: [0, 0.5, 0],
            scale: [1, 1.05, 1]
          } : {},
          transition: {
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      )
    ] }),
    Oracle: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          d: "M12 2L6 7l6 5 6-5-6-5z",
          fill: color,
          opacity: "0.7"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          d: "M12 12l-6 5 6 5 6-5-6-5z",
          fill: color,
          opacity: "0.9"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.path,
        {
          d: "M6 7v10l6 5V12L6 7z",
          fill: color,
          opacity: "0.5",
          animate: shouldAnimate ? {
            opacity: [0.5, 0.7, 0.5]
          } : {},
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          d: "M18 7v10l-6 5V12l6-5z",
          fill: color,
          opacity: "0.6"
        }
      )
    ] }) }),
    Warden: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          d: "M12 2L4 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-8-4z",
          stroke: color,
          strokeWidth: "1.5",
          fill: "none"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.circle,
        {
          cx: "12",
          cy: "12",
          r: "4",
          stroke: color,
          strokeWidth: "1.5",
          fill: "none",
          animate: shouldAnimate ? {
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6]
          } : {},
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.path,
        {
          d: "M12 8v8M8 12h8",
          stroke: color,
          strokeWidth: "2",
          strokeLinecap: "round",
          animate: shouldAnimate ? {
            opacity: [0.8, 1, 0.8]
          } : {},
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      )
    ] }),
    Nomad: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "circle",
        {
          cx: "12",
          cy: "12",
          r: "8",
          stroke: color,
          strokeWidth: "1.5",
          fill: "none",
          opacity: "0.3"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.circle,
        {
          cx: "12",
          cy: "12",
          r: "5",
          stroke: color,
          strokeWidth: "1",
          fill: "none",
          opacity: "0.5",
          animate: shouldAnimate ? {
            scale: [1, 1.05, 1]
          } : {},
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "20", cy: "12", r: "2", fill: color, opacity: "0.8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.circle,
          {
            cx: "18",
            cy: "12",
            r: "1.5",
            fill: color,
            opacity: "0.4",
            animate: shouldAnimate ? {
              opacity: [0.4, 0, 0.4]
            } : {},
            transition: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        )
      ] })
    ] })
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center", style: { filter: `drop-shadow(0 0 8px ${color}40)` }, children: iconVariants[archetype] });
};

const DNAEvolutionScene = ({
  isOpen,
  archetype,
  onComplete
}) => {
  const [phase, setPhase] = reactExports.useState("intro");
  const archetypeConfig = ARCHETYPE_CONFIGS[archetype];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  reactExports.useEffect(() => {
    if (!isOpen) {
      setPhase("intro");
      return;
    }
    const introTimer = setTimeout(() => setPhase("reveal"), 1e3);
    const revealTimer = setTimeout(() => setPhase("outro"), 4e3);
    const closeTimer = setTimeout(() => {
      onComplete();
    }, 5e3);
    return () => {
      clearTimeout(introTimer);
      clearTimeout(revealTimer);
      clearTimeout(closeTimer);
    };
  }, [isOpen, onComplete]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isOpen, onOpenChange: () => {
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogContent,
    {
      className: "max-w-full w-full h-full bg-black border-none p-0 flex items-center justify-center",
      style: { maxWidth: "100vw", maxHeight: "100vh" },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
        phase === "intro" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "absolute inset-0 bg-black"
          },
          "intro"
        ),
        phase === "reveal" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, scale: 0.5 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 1.5 },
            transition: { duration: 1, ease: "easeOut" },
            className: "relative z-10 flex flex-col items-center justify-center gap-8",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "absolute inset-0 pointer-events-none",
                  animate: prefersReducedMotion ? {} : {
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  },
                  transition: prefersReducedMotion ? {} : {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-[600px] h-[600px] rounded-full blur-[120px]",
                      style: {
                        background: `radial-gradient(circle, ${archetypeConfig.color}, transparent 70%)`
                      }
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "relative z-10",
                  animate: prefersReducedMotion ? {} : {
                    scale: [0.9, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  },
                  transition: prefersReducedMotion ? {} : {
                    duration: 2,
                    ease: "easeInOut"
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ArchetypeIcon,
                    {
                      archetype,
                      size: 160
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.5, duration: 0.8 },
                  className: "text-center space-y-4 max-w-2xl px-6",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.div,
                      {
                        className: "text-4xl md:text-6xl font-black",
                        style: {
                          color: archetypeConfig.color,
                          textShadow: `0 0 30px ${archetypeConfig.color}80`
                        },
                        children: archetypeConfig.nameIt
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      motion.div,
                      {
                        className: "text-base md:text-xl text-white/80 font-medium",
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        transition: { delay: 0.8 },
                        children: [
                          "Sequenza M1-HEX riscritta.",
                          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                          "Il tuo codice vibra con una nuova frequenza."
                        ]
                      }
                    )
                  ]
                }
              ),
              !prefersReducedMotion && [...Array(18)].map((_, i) => {
                const isOuter = i >= 12;
                const angle = i % 12 / 12 * Math.PI * 2;
                const distance = isOuter ? 350 : 300;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "absolute rounded-full",
                    style: {
                      width: isOuter ? "3px" : "2px",
                      height: isOuter ? "3px" : "2px",
                      backgroundColor: archetypeConfig.color,
                      left: "50%",
                      top: "50%"
                    },
                    animate: {
                      x: [0, Math.cos(angle) * distance],
                      y: [0, Math.sin(angle) * distance],
                      opacity: [1, 0],
                      scale: [1, 0]
                    },
                    transition: {
                      duration: isOuter ? 2.3 : 2,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatDelay: isOuter ? 0.3 : 0.5,
                      delay: isOuter ? 0.2 : 0
                    }
                  },
                  i
                );
              })
            ]
          },
          "reveal"
        ),
        phase === "outro" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 1 },
            animate: { opacity: 0 },
            className: "absolute inset-0 bg-black"
          },
          "outro"
        )
      ] })
    }
  ) });
};

/**
 * Fires when the camera has been transformed by the controls.
 *
 * @event OrbitControls#change
 * @type {Object}
 */
const _changeEvent = { type: 'change' };

/**
 * Fires when an interaction was initiated.
 *
 * @event OrbitControls#start
 * @type {Object}
 */
const _startEvent = { type: 'start' };

/**
 * Fires when an interaction has finished.
 *
 * @event OrbitControls#end
 * @type {Object}
 */
const _endEvent = { type: 'end' };

const _ray = new Ray();
const _plane = new Plane();
const _TILT_LIMIT = Math.cos( 70 * MathUtils.DEG2RAD );

const _v = new Vector3();
const _twoPI = 2 * Math.PI;

const _STATE = {
	NONE: -1,
	ROTATE: 0,
	DOLLY: 1,
	PAN: 2,
	TOUCH_ROTATE: 3,
	TOUCH_PAN: 4,
	TOUCH_DOLLY_PAN: 5,
	TOUCH_DOLLY_ROTATE: 6
};
const _EPS = 0.000001;


/**
 * Orbit controls allow the camera to orbit around a target.
 *
 * OrbitControls performs orbiting, dollying (zooming), and panning. Unlike {@link TrackballControls},
 * it maintains the "up" direction `object.up` (+Y by default).
 *
 * - Orbit: Left mouse / touch: one-finger move.
 * - Zoom: Middle mouse, or mousewheel / touch: two-finger spread or squish.
 * - Pan: Right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move.
 *
 * ```js
 * const controls = new OrbitControls( camera, renderer.domElement );
 *
 * // controls.update() must be called after any manual changes to the camera's transform
 * camera.position.set( 0, 20, 100 );
 * controls.update();
 *
 * function animate() {
 *
 * 	// required if controls.enableDamping or controls.autoRotate are set to true
 * 	controls.update();
 *
 * 	renderer.render( scene, camera );
 *
 * }
 * ```
 *
 * @augments Controls
 * @three_import import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
 */
class OrbitControls extends Controls {

	/**
	 * Constructs a new controls instance.
	 *
	 * @param {Object3D} object - The object that is managed by the controls.
	 * @param {?HTMLDOMElement} domElement - The HTML element used for event listeners.
	 */
	constructor( object, domElement = null ) {

		super( object, domElement );

		this.state = _STATE.NONE;

		/**
		 * The focus point of the controls, the `object` orbits around this.
		 * It can be updated manually at any point to change the focus of the controls.
		 *
		 * @type {Vector3}
		 */
		this.target = new Vector3();

		/**
		 * The focus point of the `minTargetRadius` and `maxTargetRadius` limits.
		 * It can be updated manually at any point to change the center of interest
		 * for the `target`.
		 *
		 * @type {Vector3}
		 */
		this.cursor = new Vector3();

		/**
		 * How far you can dolly in (perspective camera only).
		 *
		 * @type {number}
		 * @default 0
		 */
		this.minDistance = 0;

		/**
		 * How far you can dolly out (perspective camera only).
		 *
		 * @type {number}
		 * @default Infinity
		 */
		this.maxDistance = Infinity;

		/**
		 * How far you can zoom in (orthographic camera only).
		 *
		 * @type {number}
		 * @default 0
		 */
		this.minZoom = 0;

		/**
		 * How far you can zoom out (orthographic camera only).
		 *
		 * @type {number}
		 * @default Infinity
		 */
		this.maxZoom = Infinity;

		/**
		 * How close you can get the target to the 3D `cursor`.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.minTargetRadius = 0;

		/**
		 * How far you can move the target from the 3D `cursor`.
		 *
		 * @type {number}
		 * @default Infinity
		 */
		this.maxTargetRadius = Infinity;

		/**
		 * How far you can orbit vertically, lower limit. Range is `[0, Math.PI]` radians.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.minPolarAngle = 0;

		/**
		 * How far you can orbit vertically, upper limit. Range is `[0, Math.PI]` radians.
		 *
		 * @type {number}
		 * @default Math.PI
		 */
		this.maxPolarAngle = Math.PI;

		/**
		 * How far you can orbit horizontally, lower limit. If set, the interval `[ min, max ]`
		 * must be a sub-interval of `[ - 2 PI, 2 PI ]`, with `( max - min < 2 PI )`.
		 *
		 * @type {number}
		 * @default -Infinity
		 */
		this.minAzimuthAngle = - Infinity;

		/**
		 * How far you can orbit horizontally, upper limit. If set, the interval `[ min, max ]`
		 * must be a sub-interval of `[ - 2 PI, 2 PI ]`, with `( max - min < 2 PI )`.
		 *
		 * @type {number}
		 * @default -Infinity
		 */
		this.maxAzimuthAngle = Infinity;

		/**
		 * Set to `true` to enable damping (inertia), which can be used to give a sense of weight
		 * to the controls. Note that if this is enabled, you must call `update()` in your animation
		 * loop.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.enableDamping = false;

		/**
		 * The damping inertia used if `enableDamping` is set to `true`.
		 *
		 * Note that for this to work, you must call `update()` in your animation loop.
		 *
		 * @type {number}
		 * @default 0.05
		 */
		this.dampingFactor = 0.05;

		/**
		 * Enable or disable zooming (dollying) of the camera.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enableZoom = true;

		/**
		 * Speed of zooming / dollying.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.zoomSpeed = 1.0;

		/**
		 * Enable or disable horizontal and vertical rotation of the camera.
		 *
		 * Note that it is possible to disable a single axis by setting the min and max of the
		 * `minPolarAngle` or `minAzimuthAngle` to the same value, which will cause the vertical
		 * or horizontal rotation to be fixed at that value.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enableRotate = true;

		/**
		 * Speed of rotation.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.rotateSpeed = 1.0;

		/**
		 * How fast to rotate the camera when the keyboard is used.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.keyRotateSpeed = 1.0;

		/**
		 * Enable or disable camera panning.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enablePan = true;

		/**
		 * Speed of panning.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.panSpeed = 1.0;

		/**
		 * Defines how the camera's position is translated when panning. If `true`, the camera pans
		 * in screen space. Otherwise, the camera pans in the plane orthogonal to the camera's up
		 * direction.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.screenSpacePanning = true;

		/**
		 * How fast to pan the camera when the keyboard is used in
		 * pixels per keypress.
		 *
		 * @type {number}
		 * @default 7
		 */
		this.keyPanSpeed = 7.0;

		/**
		 * Setting this property to `true` allows to zoom to the cursor's position.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.zoomToCursor = false;

		/**
		 * Set to true to automatically rotate around the target
		 *
		 * Note that if this is enabled, you must call `update()` in your animation loop.
		 * If you want the auto-rotate speed to be independent of the frame rate (the refresh
		 * rate of the display), you must pass the time `deltaTime`, in seconds, to `update()`.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.autoRotate = false;

		/**
		 * How fast to rotate around the target if `autoRotate` is `true`. The default  equates to 30 seconds
		 * per orbit at 60fps.
		 *
		 * Note that if `autoRotate` is enabled, you must call `update()` in your animation loop.
		 *
		 * @type {number}
		 * @default 2
		 */
		this.autoRotateSpeed = 2.0;

		/**
		 * This object contains references to the keycodes for controlling camera panning.
		 *
		 * ```js
		 * controls.keys = {
		 * 	LEFT: 'ArrowLeft', //left arrow
		 * 	UP: 'ArrowUp', // up arrow
		 * 	RIGHT: 'ArrowRight', // right arrow
		 * 	BOTTOM: 'ArrowDown' // down arrow
		 * }
		 * ```
		 * @type {Object}
		 */
		this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };

		/**
		 * This object contains references to the mouse actions used by the controls.
		 *
		 * ```js
		 * controls.mouseButtons = {
		 * 	LEFT: THREE.MOUSE.ROTATE,
		 * 	MIDDLE: THREE.MOUSE.DOLLY,
		 * 	RIGHT: THREE.MOUSE.PAN
		 * }
		 * ```
		 * @type {Object}
		 */
		this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

		/**
		 * This object contains references to the touch actions used by the controls.
		 *
		 * ```js
		 * controls.mouseButtons = {
		 * 	ONE: THREE.TOUCH.ROTATE,
		 * 	TWO: THREE.TOUCH.DOLLY_PAN
		 * }
		 * ```
		 * @type {Object}
		 */
		this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

		/**
		 * Used internally by `saveState()` and `reset()`.
		 *
		 * @type {Vector3}
		 */
		this.target0 = this.target.clone();

		/**
		 * Used internally by `saveState()` and `reset()`.
		 *
		 * @type {Vector3}
		 */
		this.position0 = this.object.position.clone();

		/**
		 * Used internally by `saveState()` and `reset()`.
		 *
		 * @type {number}
		 */
		this.zoom0 = this.object.zoom;

		// the target DOM element for key events
		this._domElementKeyEvents = null;

		// internals

		this._lastPosition = new Vector3();
		this._lastQuaternion = new Quaternion();
		this._lastTargetPosition = new Vector3();

		// so camera.up is the orbit axis
		this._quat = new Quaternion().setFromUnitVectors( object.up, new Vector3( 0, 1, 0 ) );
		this._quatInverse = this._quat.clone().invert();

		// current position in spherical coordinates
		this._spherical = new Spherical();
		this._sphericalDelta = new Spherical();

		this._scale = 1;
		this._panOffset = new Vector3();

		this._rotateStart = new Vector2();
		this._rotateEnd = new Vector2();
		this._rotateDelta = new Vector2();

		this._panStart = new Vector2();
		this._panEnd = new Vector2();
		this._panDelta = new Vector2();

		this._dollyStart = new Vector2();
		this._dollyEnd = new Vector2();
		this._dollyDelta = new Vector2();

		this._dollyDirection = new Vector3();
		this._mouse = new Vector2();
		this._performCursorZoom = false;

		this._pointers = [];
		this._pointerPositions = {};

		this._controlActive = false;

		// event listeners

		this._onPointerMove = onPointerMove.bind( this );
		this._onPointerDown = onPointerDown.bind( this );
		this._onPointerUp = onPointerUp.bind( this );
		this._onContextMenu = onContextMenu.bind( this );
		this._onMouseWheel = onMouseWheel.bind( this );
		this._onKeyDown = onKeyDown.bind( this );

		this._onTouchStart = onTouchStart.bind( this );
		this._onTouchMove = onTouchMove.bind( this );

		this._onMouseDown = onMouseDown.bind( this );
		this._onMouseMove = onMouseMove.bind( this );

		this._interceptControlDown = interceptControlDown.bind( this );
		this._interceptControlUp = interceptControlUp.bind( this );

		//

		if ( this.domElement !== null ) {

			this.connect( this.domElement );

		}

		this.update();

	}

	connect( element ) {

		super.connect( element );

		this.domElement.addEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.addEventListener( 'pointercancel', this._onPointerUp );

		this.domElement.addEventListener( 'contextmenu', this._onContextMenu );
		this.domElement.addEventListener( 'wheel', this._onMouseWheel, { passive: false } );

		const document = this.domElement.getRootNode(); // offscreen canvas compatibility
		document.addEventListener( 'keydown', this._interceptControlDown, { passive: true, capture: true } );

		this.domElement.style.touchAction = 'none'; // disable touch scroll

	}

	disconnect() {

		this.domElement.removeEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.removeEventListener( 'pointermove', this._onPointerMove );
		this.domElement.removeEventListener( 'pointerup', this._onPointerUp );
		this.domElement.removeEventListener( 'pointercancel', this._onPointerUp );

		this.domElement.removeEventListener( 'wheel', this._onMouseWheel );
		this.domElement.removeEventListener( 'contextmenu', this._onContextMenu );

		this.stopListenToKeyEvents();

		const document = this.domElement.getRootNode(); // offscreen canvas compatibility
		document.removeEventListener( 'keydown', this._interceptControlDown, { capture: true } );

		this.domElement.style.touchAction = 'auto';

	}

	dispose() {

		this.disconnect();

	}

	/**
	 * Get the current vertical rotation, in radians.
	 *
	 * @return {number} The current vertical rotation, in radians.
	 */
	getPolarAngle() {

		return this._spherical.phi;

	}

	/**
	 * Get the current horizontal rotation, in radians.
	 *
	 * @return {number} The current horizontal rotation, in radians.
	 */
	getAzimuthalAngle() {

		return this._spherical.theta;

	}

	/**
	 * Returns the distance from the camera to the target.
	 *
	 * @return {number} The distance from the camera to the target.
	 */
	getDistance() {

		return this.object.position.distanceTo( this.target );

	}

	/**
	 * Adds key event listeners to the given DOM element.
	 * `window` is a recommended argument for using this method.
	 *
	 * @param {HTMLDOMElement} domElement - The DOM element
	 */
	listenToKeyEvents( domElement ) {

		domElement.addEventListener( 'keydown', this._onKeyDown );
		this._domElementKeyEvents = domElement;

	}

	/**
	 * Removes the key event listener previously defined with `listenToKeyEvents()`.
	 */
	stopListenToKeyEvents() {

		if ( this._domElementKeyEvents !== null ) {

			this._domElementKeyEvents.removeEventListener( 'keydown', this._onKeyDown );
			this._domElementKeyEvents = null;

		}

	}

	/**
	 * Save the current state of the controls. This can later be recovered with `reset()`.
	 */
	saveState() {

		this.target0.copy( this.target );
		this.position0.copy( this.object.position );
		this.zoom0 = this.object.zoom;

	}

	/**
	 * Reset the controls to their state from either the last time the `saveState()`
	 * was called, or the initial state.
	 */
	reset() {

		this.target.copy( this.target0 );
		this.object.position.copy( this.position0 );
		this.object.zoom = this.zoom0;

		this.object.updateProjectionMatrix();
		this.dispatchEvent( _changeEvent );

		this.update();

		this.state = _STATE.NONE;

	}

	update( deltaTime = null ) {

		const position = this.object.position;

		_v.copy( position ).sub( this.target );

		// rotate offset to "y-axis-is-up" space
		_v.applyQuaternion( this._quat );

		// angle from z-axis around y-axis
		this._spherical.setFromVector3( _v );

		if ( this.autoRotate && this.state === _STATE.NONE ) {

			this._rotateLeft( this._getAutoRotationAngle( deltaTime ) );

		}

		if ( this.enableDamping ) {

			this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor;
			this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor;

		} else {

			this._spherical.theta += this._sphericalDelta.theta;
			this._spherical.phi += this._sphericalDelta.phi;

		}

		// restrict theta to be between desired limits

		let min = this.minAzimuthAngle;
		let max = this.maxAzimuthAngle;

		if ( isFinite( min ) && isFinite( max ) ) {

			if ( min < - Math.PI ) min += _twoPI; else if ( min > Math.PI ) min -= _twoPI;

			if ( max < - Math.PI ) max += _twoPI; else if ( max > Math.PI ) max -= _twoPI;

			if ( min <= max ) {

				this._spherical.theta = Math.max( min, Math.min( max, this._spherical.theta ) );

			} else {

				this._spherical.theta = ( this._spherical.theta > ( min + max ) / 2 ) ?
					Math.max( min, this._spherical.theta ) :
					Math.min( max, this._spherical.theta );

			}

		}

		// restrict phi to be between desired limits
		this._spherical.phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, this._spherical.phi ) );

		this._spherical.makeSafe();


		// move target to panned location

		if ( this.enableDamping === true ) {

			this.target.addScaledVector( this._panOffset, this.dampingFactor );

		} else {

			this.target.add( this._panOffset );

		}

		// Limit the target distance from the cursor to create a sphere around the center of interest
		this.target.sub( this.cursor );
		this.target.clampLength( this.minTargetRadius, this.maxTargetRadius );
		this.target.add( this.cursor );

		let zoomChanged = false;
		// adjust the camera position based on zoom only if we're not zooming to the cursor or if it's an ortho camera
		// we adjust zoom later in these cases
		if ( this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera ) {

			this._spherical.radius = this._clampDistance( this._spherical.radius );

		} else {

			const prevRadius = this._spherical.radius;
			this._spherical.radius = this._clampDistance( this._spherical.radius * this._scale );
			zoomChanged = prevRadius != this._spherical.radius;

		}

		_v.setFromSpherical( this._spherical );

		// rotate offset back to "camera-up-vector-is-up" space
		_v.applyQuaternion( this._quatInverse );

		position.copy( this.target ).add( _v );

		this.object.lookAt( this.target );

		if ( this.enableDamping === true ) {

			this._sphericalDelta.theta *= ( 1 - this.dampingFactor );
			this._sphericalDelta.phi *= ( 1 - this.dampingFactor );

			this._panOffset.multiplyScalar( 1 - this.dampingFactor );

		} else {

			this._sphericalDelta.set( 0, 0, 0 );

			this._panOffset.set( 0, 0, 0 );

		}

		// adjust camera position
		if ( this.zoomToCursor && this._performCursorZoom ) {

			let newRadius = null;
			if ( this.object.isPerspectiveCamera ) {

				// move the camera down the pointer ray
				// this method avoids floating point error
				const prevRadius = _v.length();
				newRadius = this._clampDistance( prevRadius * this._scale );

				const radiusDelta = prevRadius - newRadius;
				this.object.position.addScaledVector( this._dollyDirection, radiusDelta );
				this.object.updateMatrixWorld();

				zoomChanged = !! radiusDelta;

			} else if ( this.object.isOrthographicCamera ) {

				// adjust the ortho camera position based on zoom changes
				const mouseBefore = new Vector3( this._mouse.x, this._mouse.y, 0 );
				mouseBefore.unproject( this.object );

				const prevZoom = this.object.zoom;
				this.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom / this._scale ) );
				this.object.updateProjectionMatrix();

				zoomChanged = prevZoom !== this.object.zoom;

				const mouseAfter = new Vector3( this._mouse.x, this._mouse.y, 0 );
				mouseAfter.unproject( this.object );

				this.object.position.sub( mouseAfter ).add( mouseBefore );
				this.object.updateMatrixWorld();

				newRadius = _v.length();

			} else {

				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.' );
				this.zoomToCursor = false;

			}

			// handle the placement of the target
			if ( newRadius !== null ) {

				if ( this.screenSpacePanning ) {

					// position the orbit target in front of the new camera position
					this.target.set( 0, 0, -1 )
						.transformDirection( this.object.matrix )
						.multiplyScalar( newRadius )
						.add( this.object.position );

				} else {

					// get the ray and translation plane to compute target
					_ray.origin.copy( this.object.position );
					_ray.direction.set( 0, 0, -1 ).transformDirection( this.object.matrix );

					// if the camera is 20 degrees above the horizon then don't adjust the focus target to avoid
					// extremely large values
					if ( Math.abs( this.object.up.dot( _ray.direction ) ) < _TILT_LIMIT ) {

						this.object.lookAt( this.target );

					} else {

						_plane.setFromNormalAndCoplanarPoint( this.object.up, this.target );
						_ray.intersectPlane( _plane, this.target );

					}

				}

			}

		} else if ( this.object.isOrthographicCamera ) {

			const prevZoom = this.object.zoom;
			this.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom / this._scale ) );

			if ( prevZoom !== this.object.zoom ) {

				this.object.updateProjectionMatrix();
				zoomChanged = true;

			}

		}

		this._scale = 1;
		this._performCursorZoom = false;

		// update condition is:
		// min(camera displacement, camera rotation in radians)^2 > EPS
		// using small-angle approximation cos(x/2) = 1 - x^2 / 8

		if ( zoomChanged ||
			this._lastPosition.distanceToSquared( this.object.position ) > _EPS ||
			8 * ( 1 - this._lastQuaternion.dot( this.object.quaternion ) ) > _EPS ||
			this._lastTargetPosition.distanceToSquared( this.target ) > _EPS ) {

			this.dispatchEvent( _changeEvent );

			this._lastPosition.copy( this.object.position );
			this._lastQuaternion.copy( this.object.quaternion );
			this._lastTargetPosition.copy( this.target );

			return true;

		}

		return false;

	}

	_getAutoRotationAngle( deltaTime ) {

		if ( deltaTime !== null ) {

			return ( _twoPI / 60 * this.autoRotateSpeed ) * deltaTime;

		} else {

			return _twoPI / 60 / 60 * this.autoRotateSpeed;

		}

	}

	_getZoomScale( delta ) {

		const normalizedDelta = Math.abs( delta * 0.01 );
		return Math.pow( 0.95, this.zoomSpeed * normalizedDelta );

	}

	_rotateLeft( angle ) {

		this._sphericalDelta.theta -= angle;

	}

	_rotateUp( angle ) {

		this._sphericalDelta.phi -= angle;

	}

	_panLeft( distance, objectMatrix ) {

		_v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
		_v.multiplyScalar( - distance );

		this._panOffset.add( _v );

	}

	_panUp( distance, objectMatrix ) {

		if ( this.screenSpacePanning === true ) {

			_v.setFromMatrixColumn( objectMatrix, 1 );

		} else {

			_v.setFromMatrixColumn( objectMatrix, 0 );
			_v.crossVectors( this.object.up, _v );

		}

		_v.multiplyScalar( distance );

		this._panOffset.add( _v );

	}

	// deltaX and deltaY are in pixels; right and down are positive
	_pan( deltaX, deltaY ) {

		const element = this.domElement;

		if ( this.object.isPerspectiveCamera ) {

			// perspective
			const position = this.object.position;
			_v.copy( position ).sub( this.target );
			let targetDistance = _v.length();

			// half of the fov is center to top of screen
			targetDistance *= Math.tan( ( this.object.fov / 2 ) * Math.PI / 180.0 );

			// we use only clientHeight here so aspect ratio does not distort speed
			this._panLeft( 2 * deltaX * targetDistance / element.clientHeight, this.object.matrix );
			this._panUp( 2 * deltaY * targetDistance / element.clientHeight, this.object.matrix );

		} else if ( this.object.isOrthographicCamera ) {

			// orthographic
			this._panLeft( deltaX * ( this.object.right - this.object.left ) / this.object.zoom / element.clientWidth, this.object.matrix );
			this._panUp( deltaY * ( this.object.top - this.object.bottom ) / this.object.zoom / element.clientHeight, this.object.matrix );

		} else {

			// camera neither orthographic nor perspective
			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
			this.enablePan = false;

		}

	}

	_dollyOut( dollyScale ) {

		if ( this.object.isPerspectiveCamera || this.object.isOrthographicCamera ) {

			this._scale /= dollyScale;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			this.enableZoom = false;

		}

	}

	_dollyIn( dollyScale ) {

		if ( this.object.isPerspectiveCamera || this.object.isOrthographicCamera ) {

			this._scale *= dollyScale;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			this.enableZoom = false;

		}

	}

	_updateZoomParameters( x, y ) {

		if ( ! this.zoomToCursor ) {

			return;

		}

		this._performCursorZoom = true;

		const rect = this.domElement.getBoundingClientRect();
		const dx = x - rect.left;
		const dy = y - rect.top;
		const w = rect.width;
		const h = rect.height;

		this._mouse.x = ( dx / w ) * 2 - 1;
		this._mouse.y = - ( dy / h ) * 2 + 1;

		this._dollyDirection.set( this._mouse.x, this._mouse.y, 1 ).unproject( this.object ).sub( this.object.position ).normalize();

	}

	_clampDistance( dist ) {

		return Math.max( this.minDistance, Math.min( this.maxDistance, dist ) );

	}

	//
	// event callbacks - update the object state
	//

	_handleMouseDownRotate( event ) {

		this._rotateStart.set( event.clientX, event.clientY );

	}

	_handleMouseDownDolly( event ) {

		this._updateZoomParameters( event.clientX, event.clientX );
		this._dollyStart.set( event.clientX, event.clientY );

	}

	_handleMouseDownPan( event ) {

		this._panStart.set( event.clientX, event.clientY );

	}

	_handleMouseMoveRotate( event ) {

		this._rotateEnd.set( event.clientX, event.clientY );

		this._rotateDelta.subVectors( this._rotateEnd, this._rotateStart ).multiplyScalar( this.rotateSpeed );

		const element = this.domElement;

		this._rotateLeft( _twoPI * this._rotateDelta.x / element.clientHeight ); // yes, height

		this._rotateUp( _twoPI * this._rotateDelta.y / element.clientHeight );

		this._rotateStart.copy( this._rotateEnd );

		this.update();

	}

	_handleMouseMoveDolly( event ) {

		this._dollyEnd.set( event.clientX, event.clientY );

		this._dollyDelta.subVectors( this._dollyEnd, this._dollyStart );

		if ( this._dollyDelta.y > 0 ) {

			this._dollyOut( this._getZoomScale( this._dollyDelta.y ) );

		} else if ( this._dollyDelta.y < 0 ) {

			this._dollyIn( this._getZoomScale( this._dollyDelta.y ) );

		}

		this._dollyStart.copy( this._dollyEnd );

		this.update();

	}

	_handleMouseMovePan( event ) {

		this._panEnd.set( event.clientX, event.clientY );

		this._panDelta.subVectors( this._panEnd, this._panStart ).multiplyScalar( this.panSpeed );

		this._pan( this._panDelta.x, this._panDelta.y );

		this._panStart.copy( this._panEnd );

		this.update();

	}

	_handleMouseWheel( event ) {

		this._updateZoomParameters( event.clientX, event.clientY );

		if ( event.deltaY < 0 ) {

			this._dollyIn( this._getZoomScale( event.deltaY ) );

		} else if ( event.deltaY > 0 ) {

			this._dollyOut( this._getZoomScale( event.deltaY ) );

		}

		this.update();

	}

	_handleKeyDown( event ) {

		let needsUpdate = false;

		switch ( event.code ) {

			case this.keys.UP:

				if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

					if ( this.enableRotate ) {

						this._rotateUp( _twoPI * this.keyRotateSpeed / this.domElement.clientHeight );

					}

				} else {

					if ( this.enablePan ) {

						this._pan( 0, this.keyPanSpeed );

					}

				}

				needsUpdate = true;
				break;

			case this.keys.BOTTOM:

				if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

					if ( this.enableRotate ) {

						this._rotateUp( - _twoPI * this.keyRotateSpeed / this.domElement.clientHeight );

					}

				} else {

					if ( this.enablePan ) {

						this._pan( 0, - this.keyPanSpeed );

					}

				}

				needsUpdate = true;
				break;

			case this.keys.LEFT:

				if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

					if ( this.enableRotate ) {

						this._rotateLeft( _twoPI * this.keyRotateSpeed / this.domElement.clientHeight );

					}

				} else {

					if ( this.enablePan ) {

						this._pan( this.keyPanSpeed, 0 );

					}

				}

				needsUpdate = true;
				break;

			case this.keys.RIGHT:

				if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

					if ( this.enableRotate ) {

						this._rotateLeft( - _twoPI * this.keyRotateSpeed / this.domElement.clientHeight );

					}

				} else {

					if ( this.enablePan ) {

						this._pan( - this.keyPanSpeed, 0 );

					}

				}

				needsUpdate = true;
				break;

		}

		if ( needsUpdate ) {

			// prevent the browser from scrolling on cursor keys
			event.preventDefault();

			this.update();

		}


	}

	_handleTouchStartRotate( event ) {

		if ( this._pointers.length === 1 ) {

			this._rotateStart.set( event.pageX, event.pageY );

		} else {

			const position = this._getSecondPointerPosition( event );

			const x = 0.5 * ( event.pageX + position.x );
			const y = 0.5 * ( event.pageY + position.y );

			this._rotateStart.set( x, y );

		}

	}

	_handleTouchStartPan( event ) {

		if ( this._pointers.length === 1 ) {

			this._panStart.set( event.pageX, event.pageY );

		} else {

			const position = this._getSecondPointerPosition( event );

			const x = 0.5 * ( event.pageX + position.x );
			const y = 0.5 * ( event.pageY + position.y );

			this._panStart.set( x, y );

		}

	}

	_handleTouchStartDolly( event ) {

		const position = this._getSecondPointerPosition( event );

		const dx = event.pageX - position.x;
		const dy = event.pageY - position.y;

		const distance = Math.sqrt( dx * dx + dy * dy );

		this._dollyStart.set( 0, distance );

	}

	_handleTouchStartDollyPan( event ) {

		if ( this.enableZoom ) this._handleTouchStartDolly( event );

		if ( this.enablePan ) this._handleTouchStartPan( event );

	}

	_handleTouchStartDollyRotate( event ) {

		if ( this.enableZoom ) this._handleTouchStartDolly( event );

		if ( this.enableRotate ) this._handleTouchStartRotate( event );

	}

	_handleTouchMoveRotate( event ) {

		if ( this._pointers.length == 1 ) {

			this._rotateEnd.set( event.pageX, event.pageY );

		} else {

			const position = this._getSecondPointerPosition( event );

			const x = 0.5 * ( event.pageX + position.x );
			const y = 0.5 * ( event.pageY + position.y );

			this._rotateEnd.set( x, y );

		}

		this._rotateDelta.subVectors( this._rotateEnd, this._rotateStart ).multiplyScalar( this.rotateSpeed );

		const element = this.domElement;

		this._rotateLeft( _twoPI * this._rotateDelta.x / element.clientHeight ); // yes, height

		this._rotateUp( _twoPI * this._rotateDelta.y / element.clientHeight );

		this._rotateStart.copy( this._rotateEnd );

	}

	_handleTouchMovePan( event ) {

		if ( this._pointers.length === 1 ) {

			this._panEnd.set( event.pageX, event.pageY );

		} else {

			const position = this._getSecondPointerPosition( event );

			const x = 0.5 * ( event.pageX + position.x );
			const y = 0.5 * ( event.pageY + position.y );

			this._panEnd.set( x, y );

		}

		this._panDelta.subVectors( this._panEnd, this._panStart ).multiplyScalar( this.panSpeed );

		this._pan( this._panDelta.x, this._panDelta.y );

		this._panStart.copy( this._panEnd );

	}

	_handleTouchMoveDolly( event ) {

		const position = this._getSecondPointerPosition( event );

		const dx = event.pageX - position.x;
		const dy = event.pageY - position.y;

		const distance = Math.sqrt( dx * dx + dy * dy );

		this._dollyEnd.set( 0, distance );

		this._dollyDelta.set( 0, Math.pow( this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed ) );

		this._dollyOut( this._dollyDelta.y );

		this._dollyStart.copy( this._dollyEnd );

		const centerX = ( event.pageX + position.x ) * 0.5;
		const centerY = ( event.pageY + position.y ) * 0.5;

		this._updateZoomParameters( centerX, centerY );

	}

	_handleTouchMoveDollyPan( event ) {

		if ( this.enableZoom ) this._handleTouchMoveDolly( event );

		if ( this.enablePan ) this._handleTouchMovePan( event );

	}

	_handleTouchMoveDollyRotate( event ) {

		if ( this.enableZoom ) this._handleTouchMoveDolly( event );

		if ( this.enableRotate ) this._handleTouchMoveRotate( event );

	}

	// pointers

	_addPointer( event ) {

		this._pointers.push( event.pointerId );

	}

	_removePointer( event ) {

		delete this._pointerPositions[ event.pointerId ];

		for ( let i = 0; i < this._pointers.length; i ++ ) {

			if ( this._pointers[ i ] == event.pointerId ) {

				this._pointers.splice( i, 1 );
				return;

			}

		}

	}

	_isTrackingPointer( event ) {

		for ( let i = 0; i < this._pointers.length; i ++ ) {

			if ( this._pointers[ i ] == event.pointerId ) return true;

		}

		return false;

	}

	_trackPointer( event ) {

		let position = this._pointerPositions[ event.pointerId ];

		if ( position === undefined ) {

			position = new Vector2();
			this._pointerPositions[ event.pointerId ] = position;

		}

		position.set( event.pageX, event.pageY );

	}

	_getSecondPointerPosition( event ) {

		const pointerId = ( event.pointerId === this._pointers[ 0 ] ) ? this._pointers[ 1 ] : this._pointers[ 0 ];

		return this._pointerPositions[ pointerId ];

	}

	//

	_customWheelEvent( event ) {

		const mode = event.deltaMode;

		// minimal wheel event altered to meet delta-zoom demand
		const newEvent = {
			clientX: event.clientX,
			clientY: event.clientY,
			deltaY: event.deltaY,
		};

		switch ( mode ) {

			case 1: // LINE_MODE
				newEvent.deltaY *= 16;
				break;

			case 2: // PAGE_MODE
				newEvent.deltaY *= 100;
				break;

		}

		// detect if event was triggered by pinching
		if ( event.ctrlKey && ! this._controlActive ) {

			newEvent.deltaY *= 10;

		}

		return newEvent;

	}

}

function onPointerDown( event ) {

	if ( this.enabled === false ) return;

	if ( this._pointers.length === 0 ) {

		this.domElement.setPointerCapture( event.pointerId );

		this.domElement.addEventListener( 'pointermove', this._onPointerMove );
		this.domElement.addEventListener( 'pointerup', this._onPointerUp );

	}

	//

	if ( this._isTrackingPointer( event ) ) return;

	//

	this._addPointer( event );

	if ( event.pointerType === 'touch' ) {

		this._onTouchStart( event );

	} else {

		this._onMouseDown( event );

	}

}

function onPointerMove( event ) {

	if ( this.enabled === false ) return;

	if ( event.pointerType === 'touch' ) {

		this._onTouchMove( event );

	} else {

		this._onMouseMove( event );

	}

}

function onPointerUp( event ) {

	this._removePointer( event );

	switch ( this._pointers.length ) {

		case 0:

			this.domElement.releasePointerCapture( event.pointerId );

			this.domElement.removeEventListener( 'pointermove', this._onPointerMove );
			this.domElement.removeEventListener( 'pointerup', this._onPointerUp );

			this.dispatchEvent( _endEvent );

			this.state = _STATE.NONE;

			break;

		case 1:

			const pointerId = this._pointers[ 0 ];
			const position = this._pointerPositions[ pointerId ];

			// minimal placeholder event - allows state correction on pointer-up
			this._onTouchStart( { pointerId: pointerId, pageX: position.x, pageY: position.y } );

			break;

	}

}

function onMouseDown( event ) {

	let mouseAction;

	switch ( event.button ) {

		case 0:

			mouseAction = this.mouseButtons.LEFT;
			break;

		case 1:

			mouseAction = this.mouseButtons.MIDDLE;
			break;

		case 2:

			mouseAction = this.mouseButtons.RIGHT;
			break;

		default:

			mouseAction = -1;

	}

	switch ( mouseAction ) {

		case MOUSE.DOLLY:

			if ( this.enableZoom === false ) return;

			this._handleMouseDownDolly( event );

			this.state = _STATE.DOLLY;

			break;

		case MOUSE.ROTATE:

			if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

				if ( this.enablePan === false ) return;

				this._handleMouseDownPan( event );

				this.state = _STATE.PAN;

			} else {

				if ( this.enableRotate === false ) return;

				this._handleMouseDownRotate( event );

				this.state = _STATE.ROTATE;

			}

			break;

		case MOUSE.PAN:

			if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

				if ( this.enableRotate === false ) return;

				this._handleMouseDownRotate( event );

				this.state = _STATE.ROTATE;

			} else {

				if ( this.enablePan === false ) return;

				this._handleMouseDownPan( event );

				this.state = _STATE.PAN;

			}

			break;

		default:

			this.state = _STATE.NONE;

	}

	if ( this.state !== _STATE.NONE ) {

		this.dispatchEvent( _startEvent );

	}

}

function onMouseMove( event ) {

	switch ( this.state ) {

		case _STATE.ROTATE:

			if ( this.enableRotate === false ) return;

			this._handleMouseMoveRotate( event );

			break;

		case _STATE.DOLLY:

			if ( this.enableZoom === false ) return;

			this._handleMouseMoveDolly( event );

			break;

		case _STATE.PAN:

			if ( this.enablePan === false ) return;

			this._handleMouseMovePan( event );

			break;

	}

}

function onMouseWheel( event ) {

	if ( this.enabled === false || this.enableZoom === false || this.state !== _STATE.NONE ) return;

	event.preventDefault();

	this.dispatchEvent( _startEvent );

	this._handleMouseWheel( this._customWheelEvent( event ) );

	this.dispatchEvent( _endEvent );

}

function onKeyDown( event ) {

	if ( this.enabled === false ) return;

	this._handleKeyDown( event );

}

function onTouchStart( event ) {

	this._trackPointer( event );

	switch ( this._pointers.length ) {

		case 1:

			switch ( this.touches.ONE ) {

				case TOUCH.ROTATE:

					if ( this.enableRotate === false ) return;

					this._handleTouchStartRotate( event );

					this.state = _STATE.TOUCH_ROTATE;

					break;

				case TOUCH.PAN:

					if ( this.enablePan === false ) return;

					this._handleTouchStartPan( event );

					this.state = _STATE.TOUCH_PAN;

					break;

				default:

					this.state = _STATE.NONE;

			}

			break;

		case 2:

			switch ( this.touches.TWO ) {

				case TOUCH.DOLLY_PAN:

					if ( this.enableZoom === false && this.enablePan === false ) return;

					this._handleTouchStartDollyPan( event );

					this.state = _STATE.TOUCH_DOLLY_PAN;

					break;

				case TOUCH.DOLLY_ROTATE:

					if ( this.enableZoom === false && this.enableRotate === false ) return;

					this._handleTouchStartDollyRotate( event );

					this.state = _STATE.TOUCH_DOLLY_ROTATE;

					break;

				default:

					this.state = _STATE.NONE;

			}

			break;

		default:

			this.state = _STATE.NONE;

	}

	if ( this.state !== _STATE.NONE ) {

		this.dispatchEvent( _startEvent );

	}

}

function onTouchMove( event ) {

	this._trackPointer( event );

	switch ( this.state ) {

		case _STATE.TOUCH_ROTATE:

			if ( this.enableRotate === false ) return;

			this._handleTouchMoveRotate( event );

			this.update();

			break;

		case _STATE.TOUCH_PAN:

			if ( this.enablePan === false ) return;

			this._handleTouchMovePan( event );

			this.update();

			break;

		case _STATE.TOUCH_DOLLY_PAN:

			if ( this.enableZoom === false && this.enablePan === false ) return;

			this._handleTouchMoveDollyPan( event );

			this.update();

			break;

		case _STATE.TOUCH_DOLLY_ROTATE:

			if ( this.enableZoom === false && this.enableRotate === false ) return;

			this._handleTouchMoveDollyRotate( event );

			this.update();

			break;

		default:

			this.state = _STATE.NONE;

	}

}

function onContextMenu( event ) {

	if ( this.enabled === false ) return;

	event.preventDefault();

}

function interceptControlDown( event ) {

	if ( event.key === 'Control' ) {

		this._controlActive = true;

		const document = this.domElement.getRootNode(); // offscreen canvas compatibility

		document.addEventListener( 'keyup', this._interceptControlUp, { passive: true, capture: true } );

	}

}

function interceptControlUp( event ) {

	if ( event.key === 'Control' ) {

		this._controlActive = false;

		const document = this.domElement.getRootNode(); // offscreen canvas compatibility

		document.removeEventListener( 'keyup', this._interceptControlUp, { passive: true, capture: true } );

	}

}

class SeededRandom {
  seed;
  constructor(seed) {
    this.seed = seed;
  }
  next() {
    const x = Math.sin(this.seed++) * 1e4;
    return x - Math.floor(x);
  }
}
function noise1D(x) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = Math.sin(i * 12.9898 + 78.233) * 43758.5453123;
  const b = Math.sin((i + 1) * 12.9898 + 78.233) * 43758.5453123;
  return (a - Math.floor(a)) * (1 - u) + (b - Math.floor(b)) * u;
}
function buildFractalTunnel(config) {
  const { rings, segments, radius, depth, twist = 0 } = config;
  const rng = new SeededRandom(42);
  const positions = [];
  const indices = [];
  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    const z = t * depth;
    const twistAngle = t * twist;
    const currentRadius = radius * Math.pow(1 - t, 1.2) + 0.5;
    for (let s = 0; s <= segments; s++) {
      const baseTheta = s / segments * Math.PI * 2;
      const theta = baseTheta + twistAngle;
      const noiseVal = noise1D(r * 0.3 + s * 0.15) * 0.15;
      const jitterR = (rng.next() - 0.5) * currentRadius * 0.08;
      const jitterZ = (rng.next() - 0.5) * 0.3;
      const x = Math.cos(theta) * (currentRadius + noiseVal + jitterR);
      const y = Math.sin(theta) * (currentRadius + noiseVal + jitterR);
      positions.push(x, y, z + jitterZ);
    }
  }
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const current = r * (segments + 1) + s;
      const next = current + segments + 1;
      indices.push(current, next, current + 1);
      indices.push(current + 1, next, next + 1);
    }
  }
  return {
    positions: new Float32Array(positions),
    indices: new Uint32Array(indices)
  };
}

var NodeState = /* @__PURE__ */ ((NodeState2) => {
  NodeState2[NodeState2["LOCKED"] = 0] = "LOCKED";
  NodeState2[NodeState2["DISCOVERED"] = 1] = "DISCOVERED";
  NodeState2[NodeState2["LINKED"] = 2] = "LINKED";
  return NodeState2;
})(NodeState || {});
const NODE_COLORS = {
  [0 /* LOCKED */]: 5592422,
  // Brighter gray for visibility
  [1 /* DISCOVERED */]: 65535,
  // Pure bright cyan
  [2 /* LINKED */]: 13395711
  // Brighter violet
};
const THEME_NAMES = {
  "Etica": ["Compasso", "Bilancia", "Scudo", "Luce"],
  "Strategia": ["Torre", "Sentinella", "Occhio", "Mappa"],
  "Adattività": ["Camaleonte", "Riflesso", "Onda", "Foglia"],
  "Visione": ["Stella", "Prisma", "Faro", "Oracolo"]
};
class NodeLayer {
  scene;
  // Can be Scene or Group
  nodes = [];
  instancedMesh = null;
  geometry;
  constructor(parent, tunnelGeometry) {
    this.scene = parent;
    this.geometry = tunnelGeometry;
  }
  /**
   * Initialize 48 nodes with deterministic themes and symbolic names
   */
  initialize(nodeCount, seed = 42) {
    const positions = this.geometry.attributes.position;
    const totalVertices = positions.count;
    const step = Math.floor(totalVertices / nodeCount);
    this.nodes = [];
    const themes = ["Etica", "Strategia", "Adattività", "Visione"];
    for (let i = 0; i < nodeCount; i++) {
      const idx = i * step;
      if (idx >= totalVertices) break;
      const position = new Vector3(
        positions.getX(idx),
        positions.getY(idx),
        positions.getZ(idx)
      );
      const themeIndex = (seed + i * 7) % themes.length;
      const theme = themes[themeIndex];
      const nameIndex = Math.floor(i / themes.length) % THEME_NAMES[theme].length;
      const name = `${theme} ${THEME_NAMES[theme][nameIndex]}`;
      this.nodes.push({
        id: i,
        position,
        state: 0 /* LOCKED */,
        theme,
        name
      });
    }
    this.createInstancedMesh();
  }
  createInstancedMesh() {
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      this.instancedMesh.material.dispose();
    }
    const sphereGeometry = new SphereGeometry(0.24, 12, 12);
    const material = new MeshBasicMaterial({
      transparent: false,
      depthTest: false,
      // Render on top
      depthWrite: true
    });
    this.instancedMesh = new InstancedMesh(
      sphereGeometry,
      material,
      this.nodes.length
    );
    this.instancedMesh.renderOrder = 1e4;
    this.instancedMesh.frustumCulled = false;
    const matrix = new Matrix4();
    const color = new Color();
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      matrix.setPosition(node.position);
      this.instancedMesh.setMatrixAt(i, matrix);
      color.setHex(NODE_COLORS[node.state]);
      this.instancedMesh.setColorAt(i, color);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
    this.scene.add(this.instancedMesh);
  }
  raycast(raycaster) {
    if (!this.instancedMesh) return null;
    const intersects = raycaster.intersectObject(this.instancedMesh);
    if (intersects.length > 0 && intersects[0].instanceId !== void 0) {
      return intersects[0].instanceId;
    }
    return null;
  }
  getNode(nodeId) {
    return this.nodes.find((n) => n.id === nodeId) || null;
  }
  getNodeState(nodeId) {
    const node = this.getNode(nodeId);
    return node ? node.state : null;
  }
  setNodeState(nodeId, state) {
    const node = this.getNode(nodeId);
    if (!node || !this.instancedMesh) return;
    node.state = state;
    const color = new Color(NODE_COLORS[state]);
    this.instancedMesh.setColorAt(nodeId, color);
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
    const matrix = new Matrix4();
    const scale = new Vector3(2, 2, 2);
    matrix.compose(node.position, new Quaternion(), scale);
    this.instancedMesh.setMatrixAt(nodeId, matrix);
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    setTimeout(() => {
      if (!this.instancedMesh) return;
      const resetMatrix = new Matrix4();
      const resetScale = new Vector3(1, 1, 1);
      resetMatrix.compose(node.position, new Quaternion(), resetScale);
      this.instancedMesh.setMatrixAt(nodeId, resetMatrix);
      this.instancedMesh.instanceMatrix.needsUpdate = true;
    }, 300);
  }
  getStats() {
    const discovered = this.nodes.filter((n) => n.state === 1 /* DISCOVERED */ || n.state === 2 /* LINKED */).length;
    const linked = this.nodes.filter((n) => n.state === 2 /* LINKED */).length;
    return { discovered, linked };
  }
  /**
   * Update with hover highlight and pulse animations
   */
  update(elapsedTime, hoveredNodeId = null) {
    if (!this.instancedMesh) return;
    const matrix = new Matrix4();
    const scale = new Vector3();
    const color = new Color();
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      let pulseScale = 1;
      if (node.state === 1 /* DISCOVERED */) {
        pulseScale = 1 + Math.sin(elapsedTime * 3 + i * 0.5) * 0.25;
      } else if (node.state === 2 /* LINKED */) {
        pulseScale = 1 + Math.sin(elapsedTime * 2 + i * 0.3) * 0.2;
      }
      if (hoveredNodeId === node.id) {
        pulseScale *= 2;
        color.setHex(NODE_COLORS[node.state]).multiplyScalar(2);
        this.instancedMesh.setColorAt(i, color);
      } else {
        color.setHex(NODE_COLORS[node.state]).multiplyScalar(1.3);
        this.instancedMesh.setColorAt(i, color);
      }
      scale.set(pulseScale, pulseScale, pulseScale);
      matrix.compose(node.position, new Quaternion(), scale);
      this.instancedMesh.setMatrixAt(i, matrix);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }
  regenerate(tunnelGeometry, nodeCount, seed = 42) {
    this.geometry = tunnelGeometry;
    this.initialize(nodeCount, seed);
  }
  dispose() {
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      this.instancedMesh.material.dispose();
    }
  }
}

function usePickNode(nodeLayer, camera, canvas) {
  const raycaster = reactExports.useRef(new Raycaster());
  const throttleRef = reactExports.useRef(0);
  const pickNode = reactExports.useCallback((event) => {
    if (!nodeLayer || !camera || !canvas) return null;
    const now = performance.now();
    if (now - throttleRef.current < 50) return null;
    throttleRef.current = now;
    const rect = canvas.getBoundingClientRect();
    const mouse = new Vector2(
      (event.clientX - rect.left) / rect.width * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.current.setFromCamera(mouse, camera);
    const nodeId = nodeLayer.raycast(raycaster.current);
    if (nodeId !== null) {
      const node = nodeLayer.getNode(nodeId);
      if (node) {
        const pickEvent = {
          nodeId,
          theme: node.theme,
          worldPos: node.position.clone()
        };
        window.dispatchEvent(new CustomEvent("mindfractal:node-selected", {
          detail: pickEvent
        }));
      }
    }
    return nodeId;
  }, [nodeLayer, camera, canvas]);
  return { pickNode };
}

class LinkEngine {
  lastLinkTime = 0;
  COOLDOWN_MS = 500;
  MAX_DISTANCE_RATIO = 0.12;
  tunnelLength;
  constructor(tunnelLength) {
    this.tunnelLength = tunnelLength;
  }
  /**
   * Check if two nodes can be linked
   */
  canLink(nodeA, nodeB) {
    const now = performance.now();
    if (now - this.lastLinkTime < this.COOLDOWN_MS) {
      return { valid: false, reason: "cooldown" };
    }
    const distance = nodeA.position.distanceTo(nodeB.position);
    const maxDist = this.tunnelLength * this.MAX_DISTANCE_RATIO;
    if (distance > maxDist) {
      return { valid: false, reason: "too_far" };
    }
    return { valid: true };
  }
  /**
   * Create link between two nodes
   */
  createLink(nodeA, nodeB) {
    const check = this.canLink(nodeA, nodeB);
    if (!check.valid) {
      return null;
    }
    this.lastLinkTime = performance.now();
    const result = {
      from: nodeA.id,
      to: nodeB.id,
      length: nodeA.position.distanceTo(nodeB.position),
      ts: Date.now()
    };
    window.dispatchEvent(new CustomEvent("mindfractal:link-created", {
      detail: result
    }));
    return result;
  }
}

const arcVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const arcFragmentShader = `
uniform float uTime;
uniform float uLifetimeRatio;
uniform vec3 uColor;
uniform float uIsLink;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  float t = vUv.x - uTime * 2.0;
  float wave = noise(vec2(t * 8.0, uTime * 3.0)) * 0.5 + 0.5;
  float taper = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
  
  vec3 color = uColor;
  
  // White spike at wave peak (last 15%) - BOOSTED
  if (wave > 0.85) {
    color = mix(color, vec3(3.0), (wave - 0.85) / 0.15); // Extreme white spike
  }
  
  // Link arcs are ULTRA bright for maximum visibility
  float brightnessMod = mix(3.0, 5.0, uIsLink); // 5x for link arcs (pure white)
  float alpha = wave * taper * (1.0 - uLifetimeRatio) * brightnessMod;
  
  // Boost base visibility
  alpha = clamp(alpha * 1.5, 0.0, 1.0);
  
  gl_FragColor = vec4(color, alpha);
}
`;
class GridArcPool {
  scene;
  parent = null;
  // [MF3D] Parent for arcs (align with tunnelGroup)
  arcs = [];
  edges = [];
  maxArcs = 200;
  // Dynamic, will be adjusted by budgeter
  lastIdleSpawn = 0;
  lastSurge = 0;
  surgeInterval = 3e3 + Math.random() * 3e3;
  // 3-6s randomized
  ringsPerSegment = 0;
  // Will be calculated from geometry
  // [MF3D] Dynamic FPS budgeter
  fpsTarget = 60;
  currentFPS = 60;
  targetRate = 7;
  // Hz, dynamically adjusted
  lastBudgetAdjust = 0;
  BUDGET_ADJUST_INTERVAL = 500;
  // Adjust every 500ms
  constructor(scene) {
    this.scene = scene;
  }
  // [MF3D] Attach arcs to a parent (e.g., tunnelGroup) so they inherit breath/twist
  setParent(parent) {
    this.parent = parent;
  }
  // [MF3D] Set FPS target for dynamic budgeting
  setFPSTarget(target) {
    this.fpsTarget = target;
  }
  // [MF3D] Update current FPS for budgeting
  setCurrentFPS(fps) {
    this.currentFPS = fps;
    this.adjustBudget();
  }
  // [MF3D] Dynamic budget adjustment based on FPS
  adjustBudget() {
    const now = performance.now();
    if (now - this.lastBudgetAdjust < this.BUDGET_ADJUST_INTERVAL) return;
    this.lastBudgetAdjust = now;
    const oldRate = this.targetRate;
    const oldMax = this.maxArcs;
    if (this.currentFPS < this.fpsTarget) {
      this.targetRate = Math.max(2, this.targetRate * 0.9);
      this.maxArcs = Math.max(80, Math.floor(this.maxArcs * 0.9));
    } else if (this.currentFPS >= this.fpsTarget + 5) {
      this.targetRate = Math.min(7, this.targetRate * 1.1);
      this.maxArcs = Math.min(200, Math.floor(this.maxArcs * 1.1));
    }
    if (oldRate !== this.targetRate || oldMax !== this.maxArcs) ;
  }
  // [MF3D] Get pool stats
  getStats() {
    return {
      active: this.arcs.length,
      max: this.maxArcs,
      rate: this.targetRate
    };
  }
  /**
   * Build edge list from tunnel geometry and calculate ring structure
   */
  bindGeometry(geometry) {
    this.edges = [];
    const pos = geometry.getAttribute("position");
    const index = geometry.getIndex();
    if (!index || !pos) return;
    const getVec = (i) => new Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i);
      const b = index.getX(i + 1);
      const c = index.getX(i + 2);
      this.edges.push([getVec(a), getVec(b)]);
      this.edges.push([getVec(b), getVec(c)]);
      this.edges.push([getVec(c), getVec(a)]);
    }
    const uniqueZ = /* @__PURE__ */ new Set();
    for (let i = 0; i < pos.count; i++) {
      uniqueZ.add(Math.round(pos.getZ(i) * 10) / 10);
    }
    const estimatedRings = uniqueZ.size;
    this.ringsPerSegment = estimatedRings > 0 ? Math.floor(this.edges.length / estimatedRings) : 64;
  }
  /**
   * Spawn ULTRA BRIGHT white link arc (pure white, maximum visibility)
   */
  spawnLinkArc(start, end) {
    this.createArc(start, end, 0.6, new Color(16777215), true);
  }
  /**
   * Update and spawn idle arcs + periodic surge (uses dynamic budgeter)
   */
  update(deltaTime, opts) {
    const now = performance.now();
    const effectiveRate = opts.reduced ? this.targetRate * 0.5 : this.targetRate;
    const interval = 1e3 / effectiveRate;
    if (now - this.lastIdleSpawn > interval && this.edges.length > 0) {
      this.spawnIdleArcChain();
      this.lastIdleSpawn = now;
    }
    if (now - this.lastSurge > this.surgeInterval && this.edges.length > 0) {
      this.spawnSurge();
      this.lastSurge = now;
      this.surgeInterval = 3e3 + Math.random() * 3e3;
    }
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const arc = this.arcs[i];
      const age = now - arc.birthTime;
      const ratio = age / arc.lifetime;
      if (ratio >= 1) {
        (this.parent ?? this.scene).remove(arc.mesh);
        arc.mesh.geometry.dispose();
        arc.material.dispose();
        this.arcs.splice(i, 1);
      } else {
        arc.material.uniforms.uTime.value += deltaTime;
        arc.material.uniforms.uLifetimeRatio.value = ratio;
      }
    }
  }
  /**
   * Spawn short chain of arcs along edges
   */
  spawnIdleArcChain() {
    const chainLength = 5 + Math.floor(Math.random() * 8);
    let startIdx = Math.floor(Math.random() * this.edges.length);
    const hue = 0.55 + Math.random() * 0.1;
    const color = new Color().setHSL(hue, 1, 0.6);
    const ttl = 0.5 + Math.random() * 0.3;
    for (let i = 0; i < chainLength && startIdx < this.edges.length; i++) {
      const [p0, p1] = this.edges[startIdx];
      if (p0 && p1) {
        this.createArc(p0, p1, ttl, color, false);
      }
      startIdx = (startIdx + 1 + Math.floor(Math.random() * 3)) % this.edges.length;
    }
  }
  /**
   * Create tube arc between two points
   */
  createArc(start, end, ttl, color, isLink) {
    if (this.arcs.length >= this.maxArcs) {
      const oldest = this.arcs.shift();
      if (oldest) {
        (this.parent ?? this.scene).remove(oldest.mesh);
        oldest.mesh.geometry.dispose();
        oldest.material.dispose();
      }
    }
    const curve = new LineCurve3(start, end);
    const radius = isLink ? 0.2 : 0.12;
    const geometry = new TubeGeometry(curve, 16, radius, 8, false);
    const material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLifetimeRatio: { value: 0 },
        uColor: { value: color },
        uIsLink: { value: isLink ? 1 : 0 }
      },
      vertexShader: arcVertexShader,
      fragmentShader: arcFragmentShader,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      depthTest: false
      // CRITICAL: Render on top of tunnel mesh
    });
    const mesh = new Mesh(geometry, material);
    mesh.renderOrder = 2e4;
    mesh.frustumCulled = false;
    (this.parent ?? this.scene).add(mesh);
    this.arcs.push({
      mesh,
      material,
      birthTime: performance.now(),
      lifetime: ttl * 1e3,
      isLink
    });
  }
  /**
   * Spawn SURGE effect - ENHANCED propagating discharge across 8-14 rings
   */
  spawnSurge() {
    const ringCount = 8 + Math.floor(Math.random() * 7);
    const surgeDuration = 250 + Math.random() * 200;
    const delayPerRing = surgeDuration / ringCount;
    const startRing = Math.floor(Math.random() * (this.edges.length / this.ringsPerSegment - ringCount));
    for (let r = 0; r < ringCount; r++) {
      setTimeout(() => {
        const ringStartIdx = (startRing + r) * this.ringsPerSegment;
        const ringEndIdx = Math.min(ringStartIdx + this.ringsPerSegment, this.edges.length);
        const progress = r / ringCount;
        const hue = 0.52 + progress * 0.08;
        const color = new Color().setHSL(hue, 1, 0.65);
        for (let i = ringStartIdx; i < ringEndIdx; i += 2) {
          const [p0, p1] = this.edges[i];
          if (p0 && p1) {
            this.createArc(p0, p1, 0.3, color, false);
          }
        }
      }, r * delayPerRing);
    }
    window.dispatchEvent(new CustomEvent("mindfractal:surge", {
      detail: { rings: ringCount, duration: surgeDuration }
    }));
  }
  dispose() {
    for (const arc of this.arcs) {
      (this.parent ?? this.scene).remove(arc.mesh);
      arc.mesh.geometry.dispose();
      arc.material.dispose();
    }
    this.arcs = [];
  }
}

class FieldBreath {
  periodMs;
  amplitude;
  boostUntil = 0;
  boostAmplitude = 0;
  constructor(opts) {
    this.periodMs = opts?.periodMs ?? 12e3;
    this.amplitude = 0;
  }
  /**
   * Get current intensity (0.85-1.15 baseline)
   */
  tick(nowMs) {
    const t = nowMs % this.periodMs / this.periodMs;
    const sine = Math.sin(Math.PI * 2 * t);
    const normalized = (sine + 1) / 2;
    const baseIntensity = 1 - this.amplitude / 2 + normalized * this.amplitude;
    const boost = nowMs < this.boostUntil ? this.boostAmplitude : 0;
    return baseIntensity + boost;
  }
  /**
   * Boost breathing intensity after link
   */
  boost(seconds = 2, ampAdd = 0.1) {
    this.boostUntil = performance.now() + seconds * 1e3;
    this.boostAmplitude = ampAdd;
  }
  /**
   * Get twist delta for spiral effect (oscillates -0.05 to +0.05)
   */
  getTwistDelta(nowMs) {
    const t = nowMs % (this.periodMs * 2) / (this.periodMs * 2);
    return Math.sin(Math.PI * 2 * t) * 0.05;
  }
}

class FPSMonitor {
  samples = [];
  lastTime = performance.now();
  sampleSize = 60;
  tick() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    const fps = 1e3 / delta;
    this.samples.push(fps);
    if (this.samples.length > this.sampleSize) {
      this.samples.shift();
    }
    return fps;
  }
  getAverage() {
    if (this.samples.length === 0) return 60;
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
  }
  reset() {
    this.samples = [];
    this.lastTime = performance.now();
  }
}

class CameraStore {
  key;
  constructor(key) {
    this.key = key;
  }
  save(state) {
    try {
      const data = {
        position: { x: state.position.x, y: state.position.y, z: state.position.z },
        target: { x: state.target.x, y: state.target.y, z: state.target.z },
        zoom: state.zoom
      };
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (e) {
    }
  }
  load() {
    try {
      const json = localStorage.getItem(this.key);
      if (!json) return null;
      const data = JSON.parse(json);
      return {
        position: new Vector3(data.position.x, data.position.y, data.position.z),
        target: new Vector3(data.target.x, data.target.y, data.target.z),
        zoom: data.zoom
      };
    } catch (e) {
      return null;
    }
  }
  clear() {
    try {
      localStorage.removeItem(this.key);
    } catch (e) {
    }
  }
}

function useMindFractalPersistence() {
  reactExports.useRef();
  const trackNodeSeen = reactExports.useCallback(async (nodeId, seed) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.rpc("mf_upsert_seen", {
        p_node_ids: [nodeId],
        p_seed: BigInt(seed)
      });
    } catch (error) {
    }
  }, []);
  const trackLinkCreated = reactExports.useCallback(async (fromNode, toNode, length, seed) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.rpc("mf_add_link", {
        p_from: fromNode,
        p_to: toNode,
        p_length: length,
        p_seed: BigInt(seed)
      });
    } catch (error) {
    }
  }, []);
  const loadProgress = reactExports.useCallback(async (seed) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: seenNodes } = await supabase.from("dna_mf_nodes_seen").select("node_id").eq("user_id", user.id).eq("seed", seed);
      const { data: links } = await supabase.from("dna_mf_links").select("node_from, node_to, length").eq("user_id", user.id).eq("seed", seed);
      return {
        seenNodes: seenNodes?.map((n) => n.node_id) || [],
        links: links || []
      };
    } catch (error) {
      return null;
    }
  }, []);
  return {
    trackNodeSeen,
    trackLinkCreated,
    loadProgress
  };
}

function useMindLinkPersistence() {
  const trackLink = reactExports.useCallback(async (nodeA, nodeB, theme, seed, intensity = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.rpc("upsert_dna_mind_link", {
        p_user_id: user.id,
        p_seed: BigInt(seed),
        p_node_a: nodeA,
        p_node_b: nodeB,
        p_theme: theme,
        p_intensity: intensity
      });
      if (error) {
        return null;
      }
      return data[0];
    } catch (error) {
      return null;
    }
  }, []);
  const loadLinks = reactExports.useCallback(async (seed) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data: links } = await supabase.from("dna_mind_links").select("node_a, node_b, theme, intensity").eq("user_id", user.id).eq("seed", seed);
      return links || [];
    } catch (error) {
      return [];
    }
  }, []);
  return {
    trackLink,
    loadLinks
  };
}

function EvolutionOverlay({ theme, level, message }) {
  const [visible, setVisible] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [theme, level]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: visible && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
      transition: { duration: 0.5 },
      className: "absolute inset-0 flex items-center justify-center pointer-events-none z-50",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background/90 backdrop-blur-sm border border-primary/30 rounded-2xl p-8 shadow-2xl max-w-md text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { rotate: 0 },
            animate: { rotate: 360 },
            transition: { duration: 1, ease: "easeInOut" },
            className: "w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold text-white", children: level })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-violet-600 bg-clip-text text-transparent", children: "DNA Evolutivo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg text-muted-foreground mb-1", children: [
          theme,
          " • Livello ",
          level
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/80", children: message })
      ] })
    }
  ) });
}

function ProgressHUD({ totalLinks, linksByTheme, milestones, maxMilestones, activeTheme }) {
  const maxLinks = 48;
  const percentage = Math.min(100, Math.round(totalLinks / maxLinks * 100));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 left-4 z-40 pointer-events-none select-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      className: "backdrop-blur-md bg-black/70 rounded-lg border border-cyan-400/30 p-3 space-y-2",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 font-medium", children: "Links" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white font-mono", children: [
              totalLinks,
              " / ",
              maxLinks
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-48 h-1.5 bg-black/50 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "h-full bg-gradient-to-r from-cyan-400 to-violet-400",
              initial: { width: 0 },
              animate: { width: `${percentage}%` },
              transition: { duration: 0.4, ease: "easeOut" }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-cyan-300/70 text-xs font-mono", children: [
            percentage,
            "%"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs pt-2 border-t border-cyan-400/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-violet-400 font-medium", children: "Milestones" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white font-mono", children: [
            milestones,
            " / ",
            maxMilestones
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: activeTheme && linksByTheme[activeTheme] !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, height: 0 },
            animate: { opacity: 1, height: "auto" },
            exit: { opacity: 0, height: 0 },
            className: "pt-2 border-t border-cyan-400/20",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-300/90", children: activeTheme }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/90 font-mono", children: [
                  linksByTheme[activeTheme],
                  " / 12"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-1 bg-black/50 rounded-full overflow-hidden mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "h-full bg-gradient-to-r from-cyan-500 to-violet-500",
                  initial: { width: 0 },
                  animate: { width: `${Math.min(100, linksByTheme[activeTheme] / 12 * 100)}%` },
                  transition: { duration: 0.3 }
                }
              ) })
            ]
          }
        ) })
      ]
    }
  ) });
}

const MindFractal3D = ({
  className = "",
  onReady,
  onProgress,
  reduced = false,
  seed = 42
}) => {
  const canvasRef = reactExports.useRef(null);
  const mountedRef = reactExports.useRef(false);
  const [isReady, setIsReady] = reactExports.useState(false);
  const [selectedNodeA, setSelectedNodeA] = reactExports.useState(null);
  const [hoveredNode, setHoveredNode] = reactExports.useState(null);
  const [evolution, setEvolution] = reactExports.useState({
    visible: false,
    theme: "",
    level: 0,
    message: ""
  });
  const [linkOverlay, setLinkOverlay] = reactExports.useState({ visible: false, theme: "", message: "" });
  const [totalLinks, setTotalLinks] = reactExports.useState(0);
  const [linksByTheme, setLinksByTheme] = reactExports.useState({});
  const [milestones, setMilestones] = reactExports.useState(0);
  const [activeTheme, setActiveTheme] = reactExports.useState(null);
  const { trackNodeSeen } = useMindFractalPersistence();
  const { trackLink, loadLinks } = useMindLinkPersistence();
  const cameraRef = reactExports.useRef(null);
  const nodeLayerRef = reactExports.useRef(null);
  usePickNode(
    nodeLayerRef.current,
    cameraRef.current,
    canvasRef.current
  );
  reactExports.useEffect(() => {
    if (!canvasRef.current || mountedRef.current) return;
    mountedRef.current = true;
    const canvas = canvasRef.current;
    let animationId;
    const isMobile = /iPad|iPhone|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      // Disabled for performance
      alpha: true,
      powerPreference: "high-performance",
      precision: isMobile ? "mediump" : "highp",
      preserveDrawingBuffer: false
    });
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    const scene = new Scene();
    scene.background = new Color(0);
    scene.fog = new Fog(0, 20, 200);
    const tunnelDepth = 60;
    const camera = new PerspectiveCamera(
      55,
      rect.width / rect.height,
      0.1,
      2e3
    );
    cameraRef.current = camera;
    const camStore = new CameraStore("mf_cam_v2");
    const savedCam = camStore.load();
    if (savedCam) {
      camera.position.copy(savedCam.position);
      camera.zoom = savedCam.zoom;
      camera.updateProjectionMatrix();
    } else {
      camera.position.set(0, 0, 12);
    }
    const controls = new OrbitControls(camera, canvas);
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableDamping = false;
    controls.dampingFactor = 0;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0;
    controls.minDistance = 1e-3 * tunnelDepth;
    controls.maxDistance = 1.6 * tunnelDepth;
    controls.maxPolarAngle = Math.PI * 0.95;
    if (savedCam?.target) {
      controls.target.copy(savedCam.target);
    }
    controls.update();
    controls.addEventListener("change", () => {
      const distance = camera.position.distanceTo(controls.target);
      camera.near = Math.max(5e-3, distance * 15e-4);
      camera.updateProjectionMatrix();
      camStore.save({
        position: camera.position,
        target: controls.target,
        zoom: camera.zoom
      });
    });
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    let qualityLevel = reduced ? "low" : "mobile";
    const qualityPresets = {
      high: { rings: isIOS ? 60 : 96, segments: 64 },
      mobile: { rings: isIOS ? 60 : 80, segments: 60 },
      low: { rings: 56, segments: 40 }
    };
    const tunnelGroup = new Group();
    scene.add(tunnelGroup);
    let tunnelMesh = null;
    let tunnelTwist = 0.1;
    let tunnelRings = qualityPresets[qualityLevel].rings;
    const buildTunnel = () => {
      if (tunnelMesh) {
        tunnelGroup.remove(tunnelMesh);
        tunnelMesh.geometry.dispose();
      }
      const { positions, indices } = buildFractalTunnel({
        rings: tunnelRings,
        segments: qualityPresets[qualityLevel].segments,
        radius: 10,
        depth: -tunnelDepth,
        twist: tunnelTwist
      });
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(positions, 3));
      geometry.setIndex(new BufferAttribute(indices, 1));
      geometry.computeVertexNormals();
      const edges = new EdgesGeometry(geometry, 5);
      const material = new LineBasicMaterial({
        color: 14540253,
        transparent: true,
        opacity: 0.85
      });
      tunnelMesh = new LineSegments(edges, material);
      tunnelGroup.add(tunnelMesh);
      return geometry;
    };
    let tunnelGeometry = buildTunnel();
    const nodeLayer = new NodeLayer(tunnelGroup, tunnelGeometry);
    nodeLayer.initialize(48, seed);
    nodeLayerRef.current = nodeLayer;
    const linkEngine = new LinkEngine(tunnelDepth);
    const gridArcPool = new GridArcPool(scene);
    gridArcPool.setParent(tunnelGroup);
    gridArcPool.bindGeometry(tunnelGeometry);
    gridArcPool.setFPSTarget(isMobile ? 45 : 60);
    const fieldBreath = new FieldBreath({ periodMs: 12e3, amp: 0.3 });
    window.addEventListener("mindfractal:surge", (e) => {
      e.detail;
    });
    const fpsMonitor = new FPSMonitor();
    let frameCount = 0;
    let lastQualityCheck = Date.now();
    let isPaused = false;
    const handleVisibilityChange = () => {
      isPaused = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const resumeLinks = async () => {
      try {
        const links = await loadLinks(seed);
        if (links && Array.isArray(links) && links.length > 0) {
          for (const link of links.slice(-50)) {
            if (link && typeof link.node_a === "number" && typeof link.node_b === "number") {
              nodeLayer.setNodeState(link.node_a, NodeState.LINKED);
              nodeLayer.setNodeState(link.node_b, NodeState.LINKED);
            }
          }
          const stats = nodeLayer.getStats();
          onProgress?.({
            discovered: stats.discovered,
            linked: stats.linked,
            ratio: stats.linked / 48
          });
        }
      } catch (err) {
      }
    };
    resumeLinks();
    const handlePointerMove = (event) => {
      const rect2 = canvas.getBoundingClientRect();
      const mouse = new Vector2(
        (event.clientX - rect2.left) / rect2.width * 2 - 1,
        -((event.clientY - rect2.top) / rect2.height) * 2 + 1
      );
      const raycaster = new Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const nodeId = nodeLayer.raycast(raycaster);
      setHoveredNode(nodeId);
      canvas.style.cursor = nodeId !== null ? "pointer" : "default";
    };
    let lastClickTime = 0;
    const onCanvasClick = async (event) => {
      const now = Date.now();
      if (now - lastClickTime < 250) return;
      lastClickTime = now;
      const rect2 = canvas.getBoundingClientRect();
      const mouse = new Vector2(
        (event.clientX - rect2.left) / rect2.width * 2 - 1,
        -((event.clientY - rect2.top) / rect2.height) * 2 + 1
      );
      const raycaster = new Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const nodeId = nodeLayer.raycast(raycaster);
      if (nodeId === null) return;
      const node = nodeLayer.getNode(nodeId);
      if (!node) return;
      if (selectedNodeA === null) {
        if (node.state === NodeState.LOCKED) {
          nodeLayer.setNodeState(nodeId, NodeState.DISCOVERED);
          trackNodeSeen(`node_${nodeId}`, seed);
        }
        setSelectedNodeA(nodeId);
        window.dispatchEvent(new CustomEvent("mindfractal:node-selected", {
          detail: { nodeId, theme: node.theme, worldPos: node.position.clone() }
        }));
        return;
      }
      if (nodeId !== selectedNodeA) {
        const nodeA = nodeLayer.getNode(selectedNodeA);
        if (!nodeA) {
          setSelectedNodeA(null);
          return;
        }
        const linkResult = linkEngine.createLink(nodeA, node);
        if (!linkResult) {
          setSelectedNodeA(null);
          return;
        }
        if (node.state === NodeState.LOCKED) {
          nodeLayer.setNodeState(nodeId, NodeState.DISCOVERED);
          trackNodeSeen(`node_${nodeId}`, seed);
        }
        gridArcPool.spawnLinkArc(nodeA.position, node.position);
        fieldBreath.boost(2, 0.1);
        try {
          const audio = new Audio("/sounds/chime.mp3");
          audio.volume = 0.3;
          audio.play().catch(() => {
          });
        } catch {
        }
        nodeLayer.setNodeState(selectedNodeA, NodeState.LINKED);
        nodeLayer.setNodeState(nodeId, NodeState.LINKED);
        const dbResult = await trackLink(selectedNodeA, nodeId, nodeA.theme, seed, 1);
        setTotalLinks((prev) => prev + 1);
        setLinksByTheme((prev) => ({ ...prev, [nodeA.theme]: (prev[nodeA.theme] || 0) + 1 }));
        setActiveTheme(nodeA.theme);
        const themeCount = (linksByTheme[nodeA.theme] || 0) + 1;
        setLinkOverlay({
          visible: true,
          theme: nodeA.theme,
          message: `Connessione riuscita: ${nodeA.theme} +1 • ${themeCount}/12`
        });
        setTimeout(() => setLinkOverlay((prev) => ({ ...prev, visible: false })), 1200);
        const linkAudio = new Audio("/sounds/link-success.mp3");
        linkAudio.volume = 0.3;
        linkAudio.play().catch(() => {
        });
        if (dbResult?.milestone_added) {
          const level = dbResult.milestone_level || 1;
          setMilestones((prev) => prev + 1);
          tunnelTwist = Math.min(tunnelTwist + 0.12, 0.8);
          tunnelRings = Math.min(tunnelRings + 4, qualityPresets.high.rings);
          setEvolution({
            visible: true,
            theme: nodeA.theme,
            level,
            message: `Milestone raggiunta: ${nodeA.theme} L${level}`
          });
          setTimeout(() => setEvolution((prev) => ({ ...prev, visible: false })), 2500);
          const milestoneAudio = new Audio("/sounds/milestone.mp3");
          milestoneAudio.volume = 0.4;
          milestoneAudio.play().catch(() => {
          });
          setTimeout(() => {
            tunnelGeometry = buildTunnel();
            nodeLayer.regenerate(tunnelGeometry, 48, seed);
            gridArcPool.bindGeometry(tunnelGeometry);
            tunnelGroup.rotation.z = tunnelTwist * 1.4;
          }, 2e3);
          window.dispatchEvent(new CustomEvent("mindfractal:evolve", {
            detail: { theme: nodeA.theme, level }
          }));
        }
        const stats = nodeLayer.getStats();
        onProgress?.({
          discovered: stats.discovered,
          linked: stats.linked,
          ratio: stats.linked / 48
        });
        setSelectedNodeA(null);
      }
    };
    let pointerDownPos = null;
    const handlePointerDown = (event) => {
      pointerDownPos = {
        x: event.clientX,
        y: event.clientY,
        ts: performance.now()
      };
    };
    const handlePointerUp = (event) => {
      if (!pointerDownPos) return;
      const dx = Math.abs(event.clientX - pointerDownPos.x);
      const dy = Math.abs(event.clientY - pointerDownPos.y);
      const dt = performance.now() - pointerDownPos.ts;
      pointerDownPos = null;
      if (dx < 6 && dy < 6 && dt < 180) {
        onCanvasClick(event);
      }
    };
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    const clock = new Clock();
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (isPaused) return;
      const deltaTime = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      fpsMonitor.tick();
      const avgFPS = fpsMonitor.getAverage();
      frameCount++;
      gridArcPool.setCurrentFPS(avgFPS);
      if (frameCount % 120 === 0 && !reduced) {
        const now = Date.now();
        if (avgFPS < 45 && qualityLevel !== "low" && now - lastQualityCheck > 2e3) {
          qualityLevel = qualityLevel === "high" ? "mobile" : "low";
          tunnelGeometry = buildTunnel();
          nodeLayer.regenerate(tunnelGeometry, 48, seed);
          gridArcPool.bindGeometry(tunnelGeometry);
          lastQualityCheck = now;
        }
      }
      const nowMs = performance.now();
      const intensity = reduced ? 1 : fieldBreath.tick(nowMs);
      const breathScale = 1;
      tunnelGroup.scale.set(breathScale, breathScale, breathScale);
      if (tunnelMesh?.material) {
        tunnelMesh.material.opacity = 0.85 * intensity;
      }
      gridArcPool.update(deltaTime, { reduced });
      nodeLayer.update(elapsedTime, hoveredNode);
      const minZ = -tunnelDepth + 1e-3 * tunnelDepth;
      if (camera.position.z < minZ) {
        camera.position.z = minZ;
      }
      if (frameCount % 60 === 0) {
        nodeLayer.getStats();
        gridArcPool.getStats();
      }
      renderer.render(scene, camera);
      if (frameCount === 1 && !isReady) {
        setIsReady(true);
        onReady?.();
      }
    };
    animate();
    const handleResize = () => {
      const rect2 = canvas.getBoundingClientRect();
      renderer.setSize(rect2.width, rect2.height, false);
      camera.aspect = rect2.width / rect2.height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(animationId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      controls.dispose();
      renderer.dispose();
      if (tunnelMesh) {
        tunnelMesh.geometry.dispose();
        tunnelMesh.material.dispose();
      }
      nodeLayer.dispose();
      gridArcPool.dispose();
      scene.clear();
    };
  }, [onReady, onProgress, reduced, seed, trackNodeSeen, trackLink, loadLinks, selectedNodeA, hoveredNode]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "canvas",
      {
        ref: canvasRef,
        className: "w-full h-full bg-black",
        style: { display: "block" }
      }
    ),
    !isReady && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-white/60", children: "Inizializzazione Mind Fractal..." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProgressHUD,
      {
        totalLinks,
        linksByTheme,
        milestones,
        maxMilestones: 12,
        activeTheme
      }
    ),
    evolution.visible && /* @__PURE__ */ jsxRuntimeExports.jsx(
      EvolutionOverlay,
      {
        theme: evolution.theme,
        level: evolution.level,
        message: evolution.message
      }
    ),
    linkOverlay.visible && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/80 border border-cyan-400/30 backdrop-blur-sm z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-cyan-400 font-medium", children: linkOverlay.message }) }),
    hoveredNode !== null && nodeLayerRef.current && (() => {
      const node = nodeLayerRef.current.getNode(hoveredNode);
      if (!node) return null;
      const parts = node.name.split(" ");
      const theme = parts[0];
      const name = parts.slice(1).join(" ");
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/80 border border-cyan-400/30 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-cyan-400 font-medium", children: [
        theme,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-300", children: "•" }),
        " ",
        name
      ] }) });
    })()
  ] });
};

const DNAHub = ({
  dnaProfile,
  events = [],
  onEvolve
}) => {
  const [showEvolution, setShowEvolution] = reactExports.useState(false);
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [showSkippedPill, setShowSkippedPill] = reactExports.useState(false);
  const [showHint, setShowHint] = reactExports.useState(false);
  const [reduceAnimations, setReduceAnimations] = reactExports.useState(false);
  const [enableTesseract] = reactExports.useState(true);
  const [enableRubikDNA] = reactExports.useState(true);
  const { getCurrentUser } = useUnifiedAuth();
  const archetypeConfig = ARCHETYPE_CONFIGS[dnaProfile.archetype];
  const user = getCurrentUser();
  reactExports.useEffect(() => {
    if (!user?.id) return;
    const getTodayKey = () => {
      const today2 = /* @__PURE__ */ new Date();
      return `${today2.getFullYear()}-${String(today2.getMonth() + 1).padStart(2, "0")}-${String(today2.getDate()).padStart(2, "0")}`;
    };
    const lastShown = localStorage.getItem(`dna:lastShown:${user.id}`);
    const completed = localStorage.getItem(`dna:completed:${user.id}`) === "1";
    const today = getTodayKey();
    setShowSkippedPill(lastShown === today && !completed);
    const hintKey = `dna:hintShown:${user.id}:${today}`;
    const hintShown = localStorage.getItem(hintKey) === "1";
    if (!hintShown && activeTab === "overview") {
      setShowHint(true);
      localStorage.setItem(hintKey, "1");
      setTimeout(() => setShowHint(false), 2500);
    }
  }, [user?.id, activeTab]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "min-h-screen bg-black text-white overflow-y-auto",
        style: {
          background: `radial-gradient(circle at 50% 0%, ${archetypeConfig.color}15, transparent 70%), black`
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.header,
            {
              initial: { opacity: 0, y: -20 },
              animate: { opacity: 1, y: 0 },
              className: "p-6 border-b border-white/10 backdrop-blur-xl bg-black/40 relative",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.h1,
                    {
                      className: "text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2",
                      children: "M1SSION DNA™"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm md:text-base text-white/60 font-medium", children: "Identità Evolutiva dell'Agente — Codice Vivo" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showSkippedPill && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, x: 20 },
                    animate: { opacity: 1, x: 0 },
                    exit: { opacity: 0, x: 20 },
                    className: "absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-sm",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-yellow-400 font-medium", children: "Primo sequenziamento disponibile domani" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => setShowSkippedPill(false),
                          className: "text-yellow-400/60 hover:text-yellow-400 transition-colors",
                          "aria-label": "Chiudi",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
                        }
                      )
                    ]
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto p-6 space-y-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                className: "flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border backdrop-blur-xl",
                style: {
                  backgroundColor: `${archetypeConfig.color}10`,
                  borderColor: `${archetypeConfig.color}30`,
                  boxShadow: `0 0 40px ${archetypeConfig.color}20`
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ArchetypeIcon,
                    {
                      archetype: dnaProfile.archetype,
                      size: 120
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-center md:text-left", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Badge,
                      {
                        className: "mb-2",
                        style: {
                          backgroundColor: `${archetypeConfig.color}20`,
                          color: archetypeConfig.color,
                          borderColor: `${archetypeConfig.color}40`
                        },
                        children: archetypeConfig.name
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "h2",
                      {
                        className: "text-2xl md:text-3xl font-bold mb-2",
                        style: { color: archetypeConfig.color },
                        children: archetypeConfig.nameIt
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/70 text-sm md:text-base", children: archetypeConfig.description })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 border-b border-white/10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setActiveTab("overview"),
                  className: `px-6 py-3 font-semibold transition-all border-b-2 ${activeTab === "overview" ? "border-cyan-400 text-cyan-400" : "border-transparent text-white/50 hover:text-white/80"}`,
                  children: "DNA Overview"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setActiveTab("history"),
                  className: `px-6 py-3 font-semibold transition-all border-b-2 ${activeTab === "history" ? "border-cyan-400 text-cyan-400" : "border-transparent text-white/50 hover:text-white/80"}`,
                  children: "Storia Genetica"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: activeTab === "overview" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, x: -20 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: 20 },
                className: "space-y-8",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showHint && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    motion.div,
                    {
                      initial: { opacity: 0, y: -10 },
                      animate: { opacity: 1, y: 0 },
                      exit: { opacity: 0, y: -10 },
                      className: "flex items-center justify-center gap-2 px-4 py-2 mx-auto w-fit rounded-full bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-sm",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 text-cyan-400" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-cyan-400 font-medium", children: "Muovi il mouse / Trascina per ruotare — doppio clic per reset" })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 px-4 py-2 mx-auto w-fit rounded-lg bg-white/5 border border-white/10", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-white/70", children: "Riduci animazioni" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        checked: reduceAnimations,
                        onCheckedChange: setReduceAnimations,
                        "aria-label": "Riduci animazioni DNA"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-screen max-w-none left-1/2 -translate-x-1/2 h-[75svh] md:h-[calc(100svh-140px)] md:max-h-[calc(100svh-140px)] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DNAErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MindFractal3D,
                    {
                      className: "w-full h-full rounded-none md:rounded-xl",
                      seed: dnaProfile.intuito * 1e3 + dnaProfile.audacia * 100 + dnaProfile.etica * 10 + dnaProfile.rischio,
                      onReady: () => void 0,
                      onProgress: (p) => {
                        window.dispatchEvent(new CustomEvent("mf:progress", { detail: p }));
                      },
                      reduced: reduceAnimations
                    }
                  ) })  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      onClick: () => setActiveTab("history"),
                      size: "lg",
                      variant: "outline",
                      className: "border-white/20 hover:bg-white/10 font-bold px-8",
                      children: "📜 STORIA GENETICA"
                    }
                  ) })
                ]
              },
              "overview"
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, x: 20 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: -20 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[500px] rounded-lg border border-white/10 bg-black/40 backdrop-blur-xl p-6", children: events.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-white/50 py-12", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg mb-2", children: "Nessuna mutazione registrata" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Le tue azioni future scriveranno la storia del tuo DNA" })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: events.map((event, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: idx * 0.05 },
                    className: "p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: event.source }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white/50", children: format(new Date(event.created_at), "dd MMM yyyy, HH:mm", { locale: it }) })
                      ] }),
                      event.note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/70 mb-2", children: event.note }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: Object.entries(event.delta || {}).map(([key, val]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "span",
                        {
                          className: `text-xs font-mono px-2 py-1 rounded ${val > 0 ? "bg-green-500/20 text-green-400" : val < 0 ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/60"}`,
                          children: [
                            key.toUpperCase(),
                            ": ",
                            val > 0 ? "+" : "",
                            val
                          ]
                        },
                        key
                      )) })
                    ] }) })
                  },
                  event.id
                )) }) })
              },
              "history"
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-[100px]",
                style: {
                  background: `radial-gradient(circle, ${archetypeConfig.color}, transparent 70%)`
                },
                animate: {
                  scale: [1, 1.1, 1],
                  opacity: [0.15, 0.25, 0.15]
                },
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }
            ) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DNAEvolutionScene,
      {
        isOpen: showEvolution,
        archetype: dnaProfile.archetype,
        onComplete: () => setShowEvolution(false)
      }
    )
  ] });
};

const DNAPage = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, getCurrentUser } = useUnifiedAuth();
  const { dnaProfile, isLoading: dnaLoading } = useDNA();
  const [events, setEvents] = reactExports.useState([]);
  const [eventsLoading, setEventsLoading] = reactExports.useState(true);
  const user = getCurrentUser();
  reactExports.useEffect(() => {
    if (!dnaLoading && !isAuthenticated) {
      ue.error("Accesso negato", {
        description: "Devi essere autenticato per visualizzare il DNA"
      });
      setLocation("/");
    }
  }, [isAuthenticated, dnaLoading, setLocation]);
  reactExports.useEffect(() => {
    const loadEvents = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase.from("agent_dna_events").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        ue.error("Errore nel caricamento della storia DNA");
      } finally {
        setEventsLoading(false);
      }
    };
    if (user?.id) {
      loadEvents();
    }
  }, [user?.id]);
  reactExports.useEffect(() => {
    if (!user?.id) return;
    const channel = supabase.channel(`dna-updates:${user.id}`).on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "agent_dna",
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        ue.success("DNA aggiornato!", {
          description: "Il tuo profilo genetico è stato modificato"
        });
      }
    ).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "agent_dna_events",
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        setEvents((prev) => [payload.new, ...prev]);
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
  const handleEvolve = async () => {
    if (!user?.id) return;
    try {
      const delta = {
        intuito: Math.floor(Math.random() * 10) - 5,
        audacia: Math.floor(Math.random() * 10) - 5,
        etica: Math.floor(Math.random() * 10) - 5,
        rischio: Math.floor(Math.random() * 10) - 5,
        vibrazione: Math.floor(Math.random() * 10) - 5
      };
      const { error } = await supabase.rpc("fn_dna_apply_delta", {
        p_user: user.id,
        p_delta: delta,
        p_source: "manual_evolution",
        p_note: "Evoluzione manuale attivata dall'hub DNA"
      });
      if (error) throw error;
      ue.success("Evoluzione completata!", {
        description: "Il tuo DNA è stato modificato"
      });
    } catch (error) {
      ue.error("Errore durante l'evoluzione");
    }
  };
  if (dnaLoading || eventsLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-black flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-12 h-12 animate-spin text-cyan-400 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60", children: "Caricamento DNA..." })
    ] }) });
  }
  if (!dnaProfile) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-black flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4 max-w-md px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4", children: "🧬" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-white", children: "DNA Non Calibrato" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60", children: "Completa il primo sequenziamento genetico per visualizzare il tuo DNA" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setLocation("/"),
          className: "px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors",
          children: "Torna alla Home"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.button,
      {
        onClick: () => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            setLocation("/home");
          }
        },
        className: "fixed top-4 left-4 z-50 w-11 h-11 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-lg flex items-center justify-center hover:bg-background/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50",
        style: {
          top: "max(1rem, env(safe-area-inset-top))",
          left: "max(1rem, env(safe-area-inset-left))"
        },
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.3 },
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        "aria-label": "Torna indietro",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-5 h-5 text-foreground" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DNAHub,
      {
        dnaProfile,
        events,
        onEvolve: handleEvolve
      }
    )
  ] });
};

export { DNAPage as default };
