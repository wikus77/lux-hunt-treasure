import { r as reactExports, j as jsxRuntimeExports, m as motion, R as React, A as AnimatePresence } from './animation-vendor.BiI6PE8T.js';
import { a1 as LoaderCircle, b5 as RotateCcw, bd as Check, E as Eye, X, aJ as useAuth, l as useM1UnitsRealtime, ay as Coins, ax as User, Z as Zap, aE as Crown, L as Lock, az as ShoppingCart, e as CircleAlert, m as ue, s as supabase, a4 as Save, S as Sparkles, at as ShoppingBag } from './index.CUdqZWfi.js';
import { a as getAgentById, g as getDefaultAgent, b as CATEGORY_STYLES, R as RARITY_STYLES, C as Canvas, O as OrbitControls, u as useGLTF, c as getAgentsByCategory, d as CATEGORY_LABELS } from './agentCatalog.BC25VUCd.js';
import { P as Palette } from './palette.CvOvfpKG.js';
import { l as ACESFilmicToneMapping, w as Box3, V as Vector3, f as Color } from './three-vendor.C6aK7nO_.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

const SKIN_TONES = [
  { id: "skin_light", label: "Light", color: "#FFE0BD", isSpecial: false },
  { id: "skin_medium", label: "Medium", color: "#D4A574", isSpecial: false },
  { id: "skin_bronze", label: "Bronze", color: "#B87333", isSpecial: false },
  { id: "skin_dark", label: "Dark", color: "#6B4423", isSpecial: false },
  { id: "skin_cyan_matte", label: "Cyan Matte", color: "#00CED1", isSpecial: true },
  { id: "skin_pink_matte", label: "Pink Matte", color: "#FF69B4", isSpecial: true },
  { id: "skin_black_matte", label: "Black Matte", color: "#1a1a1a", isSpecial: true },
  { id: "skin_green_matte", label: "Green Matte", color: "#32CD32", isSpecial: true },
  { id: "skin_red_matte", label: "Red Matte", color: "#DC143C", isSpecial: true }
];
const MODEL_HEIGHT_OVERRIDES = {
  "base_wolfman": 1.15,
  // Wolfman slightly taller
  "base_special": 1.1
  // Special ops slightly taller
};
function AgentModel$1({
  glbPath,
  skinToneColor,
  agentId
}) {
  const { scene } = useGLTF(glbPath);
  const modelRef = reactExports.useRef(null);
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    const box = new Box3().setFromObject(clone);
    box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const baseTargetHeight = 2.2;
    const heightMultiplier = MODEL_HEIGHT_OVERRIDES[agentId] || 1;
    const targetHeight = baseTargetHeight * heightMultiplier;
    const scaleFactor = targetHeight / size.y;
    clone.scale.setScalar(scaleFactor);
    const scaledBox = new Box3().setFromObject(clone);
    const scaledCenter = scaledBox.getCenter(new Vector3());
    clone.position.x = -scaledCenter.x;
    clone.position.z = -scaledCenter.z;
    clone.position.y = -scaledBox.min.y;
    const skinColor = new Color(skinToneColor);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        const mesh = child;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          if (material && "color" in material) {
            const mat = material;
            const name = (mat.name || "").toLowerCase();
            if (name.includes("skin") || name.includes("body") || name.includes("face") || name.includes("hand") || name.includes("flesh") || name.includes("arm")) {
              mat.color.set(skinColor);
            }
          }
        });
      }
    });
    return clone;
  }, [scene, skinToneColor, agentId]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("primitive", { ref: modelRef, object: clonedScene });
}
function GroundPlate() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("mesh", { rotation: [-Math.PI / 2, 0, 0], position: [0, -0.01, 0], receiveShadow: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circleGeometry", { args: [1.2, 64] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "meshStandardMaterial",
      {
        color: "#0a1525",
        transparent: true,
        opacity: 0.8,
        metalness: 0.3,
        roughness: 0.7
      }
    )
  ] });
}
function AgentPreview({
  selectedAgentId,
  skinToneId,
  agentCode,
  onSkinToneChange,
  loading
}) {
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const selectedAgent = reactExports.useMemo(() => {
    return getAgentById(selectedAgentId) || getDefaultAgent();
  }, [selectedAgentId]);
  const currentSkinTone = reactExports.useMemo(() => {
    return SKIN_TONES.find((t) => t.id === skinToneId) || SKIN_TONES[1];
  }, [skinToneId]);
  const categoryStyle = CATEGORY_STYLES[selectedAgent.category];
  const rarityStyle = RARITY_STYLES[selectedAgent.rarity];
  const naturalTones = SKIN_TONES.filter((t) => !t.isSpecial);
  const specialTones = SKIN_TONES.filter((t) => t.isSpecial);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 text-cyan-400 animate-spin" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative h-[340px] rounded-2xl overflow-hidden border border-cyan-500/30",
        style: {
          background: "linear-gradient(180deg, #0a1628 0%, #061020 40%, #040812 100%)"
        },
        children: [
          isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 text-cyan-400 animate-spin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-cyan-400/60", children: "Loading agent..." })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Canvas,
            {
              camera: { position: [0, 1, 4], fov: 40 },
              gl: {
                antialias: true,
                alpha: true,
                toneMappingExposure: 1.4,
                // Brighter overall exposure
                toneMapping: ACESFilmicToneMapping
              },
              onCreated: () => setIsLoading(false),
              style: { opacity: isLoading ? 0.3 : 1, transition: "opacity 0.4s" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("ambientLight", { intensity: 1.2, color: "#ffffff" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "directionalLight",
                  {
                    position: [3, 4, 3],
                    intensity: 1.5,
                    color: "#ffffff",
                    castShadow: false
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "directionalLight",
                  {
                    position: [-3, 2, 2],
                    intensity: 0.8,
                    color: "#e0f0ff"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "directionalLight",
                  {
                    position: [0, 3, -4],
                    intensity: 0.6,
                    color: "#00d4ff"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "pointLight",
                  {
                    position: [0, 5, 0],
                    intensity: 0.5,
                    color: "#ffffff",
                    distance: 10
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "pointLight",
                  {
                    position: [-2, 0, -2],
                    intensity: 0.4,
                    color: "#00d4ff",
                    distance: 8
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Suspense, { fallback: null, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AgentModel$1,
                    {
                      glbPath: selectedAgent.glbPath,
                      skinToneColor: currentSkinTone.color,
                      agentId: selectedAgentId
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(GroundPlate, {})
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  OrbitControls,
                  {
                    enablePan: false,
                    enableZoom: true,
                    autoRotate: true,
                    autoRotateSpeed: 0.8,
                    minDistance: 2.5,
                    maxDistance: 7,
                    minPolarAngle: Math.PI / 4,
                    maxPolarAngle: Math.PI / 2,
                    target: [0, 0.8, 0]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 left-3 right-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border ${categoryStyle.border}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs font-orbitron font-medium ${categoryStyle.text}`, children: selectedAgent.name }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm border ${rarityStyle.border}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-[10px] font-medium ${rarityStyle.text}`, children: selectedAgent.rarity }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm border border-cyan-500/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-orbitron font-bold text-cyan-400", children: agentCode }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3 h-3 text-white/50" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-white/50", children: "Drag to rotate" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 rounded-2xl border ${categoryStyle.border} bg-gradient-to-r ${categoryStyle.bg}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-14 h-14 rounded-xl bg-gradient-to-r ${categoryStyle.gradient} flex items-center justify-center text-2xl shadow-lg`, children: categoryStyle.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-orbitron font-bold text-white", children: selectedAgent.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded-full ${categoryStyle.text} ${categoryStyle.bg}`, children: selectedAgent.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded-full ${rarityStyle.text} ${rarityStyle.bg}`, children: selectedAgent.rarity }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white/40", children: selectedAgent.gender })
          ] })
        ] })
      ] }),
      selectedAgent.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/60 mt-3", children: selectedAgent.description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-orbitron text-white/80 mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "w-4 h-4 text-pink-400" }),
        "Skin Tone"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/40 mb-2", children: "Natural" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: naturalTones.map((tone) => {
          const isSelected = tone.id === skinToneId;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.button,
            {
              onClick: () => onSkinToneChange(tone.id),
              className: `relative w-10 h-10 rounded-full border-2 transition-all ${isSelected ? "border-cyan-400 ring-2 ring-cyan-400/30 scale-110" : "border-white/20 hover:border-white/40"}`,
              style: { backgroundColor: tone.color },
              whileTap: { scale: 0.95 },
              title: tone.label,
              children: isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { scale: 0 },
                  animate: { scale: 1 },
                  className: "absolute inset-0 flex items-center justify-center",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 text-white drop-shadow-lg" })
                }
              )
            },
            tone.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/40 mb-2", children: "Special" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: specialTones.map((tone) => {
          const isSelected = tone.id === skinToneId;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.button,
            {
              onClick: () => onSkinToneChange(tone.id),
              className: `relative w-10 h-10 rounded-full border-2 transition-all ${isSelected ? "border-purple-400 ring-2 ring-purple-400/30 scale-110" : "border-white/20 hover:border-white/40"}`,
              style: { backgroundColor: tone.color },
              whileTap: { scale: 0.95 },
              title: tone.label,
              children: isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { scale: 0 },
                  animate: { scale: 1 },
                  className: "absolute inset-0 flex items-center justify-center",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: `w-4 h-4 ${tone.id === "skin_black_matte" ? "text-white" : "text-black"} drop-shadow-lg` })
                }
              )
            },
            tone.id
          );
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-cyan-500/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4 text-cyan-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-orbitron text-white/80", children: "Your Active Agent" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-white/60", children: [
        "Go to the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-400 font-medium", children: "Agents Shop" }),
        " to unlock Special and Premium agents with M1U!"
      ] })
    ] })
  ] });
}

function UnlockAgentModel({ glbPath }) {
  const { scene } = useGLTF(glbPath);
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    const box = new Box3().setFromObject(clone);
    box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const targetHeight = 2.8;
    const scaleFactor = targetHeight / size.y;
    clone.scale.setScalar(scaleFactor);
    const scaledBox = new Box3().setFromObject(clone);
    const scaledCenter = scaledBox.getCenter(new Vector3());
    clone.position.x = -scaledCenter.x;
    clone.position.z = -scaledCenter.z;
    clone.position.y = -scaledBox.min.y - 0.2;
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    return clone;
  }, [scene]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("primitive", { object: clonedScene });
}
function AgentUnlockModal({
  isOpen,
  agent,
  agentCode,
  onClose,
  onConfirmSetActive
}) {
  const [isLoading, setIsLoading] = reactExports.useState(true);
  if (!agent) return null;
  const rarityStyle = RARITY_STYLES[agent.rarity];
  const handleClose = () => {
    onConfirmSetActive();
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      className: "fixed inset-0 z-[10000]",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[#0a0c14]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.button,
          {
            onClick: handleClose,
            className: "fixed z-[10010] p-3 rounded-full bg-black/60 border border-white/20 hover:bg-white/10 active:scale-95 transition-all",
            style: {
              top: "max(16px, env(safe-area-inset-top))",
              right: "16px",
              minWidth: "48px",
              minHeight: "48px",
              touchAction: "manipulation"
            },
            initial: { opacity: 0, scale: 0.8 },
            animate: { opacity: 1, scale: 1 },
            transition: { delay: 0.3 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6 text-white" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "relative w-full h-full flex flex-col",
            style: {
              paddingTop: "max(16px, env(safe-area-inset-top))",
              paddingBottom: "max(16px, env(safe-area-inset-bottom))"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "w-full px-4 pt-2 pb-3",
                  initial: { y: -30, opacity: 0 },
                  animate: { y: 0, opacity: 1 },
                  transition: { delay: 0.1, duration: 0.4 },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "w-full rounded-2xl py-3 px-4 text-center",
                      style: {
                        background: "linear-gradient(180deg, rgba(30, 40, 60, 0.9) 0%, rgba(20, 30, 50, 0.95) 100%)",
                        border: "1px solid rgba(100, 120, 150, 0.3)"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mb-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white/60 font-medium tracking-widest uppercase", children: "CODE" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-orbitron font-bold text-cyan-400", style: { textShadow: "0 0 20px rgba(0, 200, 255, 0.5)" }, children: agentCode })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "flex-1 px-4 flex items-center justify-center",
                  initial: { scale: 0.8, opacity: 0 },
                  animate: { scale: 1, opacity: 1 },
                  transition: { delay: 0.2, duration: 0.5, type: "spring", damping: 20 },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "w-full h-full max-h-[60vh] rounded-3xl overflow-hidden relative",
                      style: {
                        background: "linear-gradient(180deg, #0d1525 0%, #080d18 50%, #050810 100%)",
                        border: "3px solid",
                        borderImage: "linear-gradient(180deg, rgba(234, 179, 8, 0.8) 0%, rgba(234, 179, 8, 0.4) 50%, rgba(234, 179, 8, 0.6) 100%) 1",
                        boxShadow: "0 0 40px rgba(234, 179, 8, 0.2), inset 0 0 60px rgba(0, 0, 0, 0.5)"
                      },
                      children: [
                        isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-10 h-10 text-yellow-400 animate-spin" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Canvas,
                          {
                            camera: { position: [0, 1, 5], fov: 32 },
                            gl: {
                              antialias: true,
                              alpha: true,
                              toneMappingExposure: 1.6,
                              toneMapping: ACESFilmicToneMapping
                            },
                            onCreated: () => setIsLoading(false),
                            style: {
                              width: "100%",
                              height: "100%",
                              opacity: isLoading ? 0.2 : 1,
                              transition: "opacity 0.5s"
                            },
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("ambientLight", { intensity: 1.5, color: "#ffffff" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("directionalLight", { position: [4, 5, 4], intensity: 2, color: "#ffffff" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("directionalLight", { position: [-4, 3, 3], intensity: 1.2, color: "#e8e8ff" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("directionalLight", { position: [0, 4, -5], intensity: 1, color: "#eab308" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("pointLight", { position: [0, 6, 0], intensity: 0.8, color: "#ffffff", distance: 12 }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("pointLight", { position: [0, -2, 3], intensity: 0.4, color: "#eab308", distance: 8 }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(UnlockAgentModel, { glbPath: agent.glbPath }) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                OrbitControls,
                                {
                                  enablePan: false,
                                  enableZoom: false,
                                  autoRotate: true,
                                  autoRotateSpeed: 1.8,
                                  minPolarAngle: Math.PI / 4,
                                  maxPolarAngle: Math.PI / 2.2,
                                  target: [0, 1, 0]
                                }
                              )
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-yellow-500/60" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-yellow-500/60" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-yellow-500/60" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-yellow-500/60" })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  className: "w-full px-4 pt-4 pb-2 text-center",
                  initial: { y: 30, opacity: 0 },
                  animate: { y: 0, opacity: 1 },
                  transition: { delay: 0.4, duration: 0.4 },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "h1",
                      {
                        className: "text-2xl md:text-3xl font-orbitron font-bold text-yellow-400 mb-3",
                        style: { textShadow: "0 0 30px rgba(234, 179, 8, 0.6)" },
                        children: agent.name
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 mb-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: `text-sm px-4 py-1.5 rounded-full font-medium ${rarityStyle.text}`,
                          style: {
                            background: "rgba(234, 179, 8, 0.15)",
                            border: "1px solid rgba(234, 179, 8, 0.4)"
                          },
                          children: agent.rarity
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "text-sm px-4 py-1.5 rounded-full font-medium text-white/60",
                          style: {
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.15)"
                          },
                          children: agent.gender
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-white/10", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/40 mb-1 tracking-wider", children: "Operator Code" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        {
                          className: "text-xl font-orbitron font-bold text-yellow-400",
                          style: { textShadow: "0 0 15px rgba(234, 179, 8, 0.5)" },
                          children: agentCode
                        }
                      )
                    ] })
                  ]
                }
              )
            ]
          }
        )
      ]
    }
  ) });
}

function AgentModel({ glbPath }) {
  const { scene } = useGLTF(glbPath);
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    const box = new Box3().setFromObject(clone);
    box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const targetHeight = 2.2;
    const scaleFactor = targetHeight / size.y;
    clone.scale.setScalar(scaleFactor);
    const scaledBox = new Box3().setFromObject(clone);
    const scaledCenter = scaledBox.getCenter(new Vector3());
    clone.position.x = -scaledCenter.x;
    clone.position.z = -scaledCenter.z;
    clone.position.y = -scaledBox.min.y;
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    return clone;
  }, [scene]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("primitive", { object: clonedScene });
}
function AgentPreviewPanel({
  agent,
  onClose,
  onPurchase,
  onSelect,
  isPurchasing,
  isOwned,
  isSelected,
  canAfford,
  balance
}) {
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const rarityStyle = RARITY_STYLES[agent.rarity];
  const categoryStyle = CATEGORY_STYLES[agent.category];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      className: "mb-4 rounded-2xl overflow-hidden border border-cyan-500/30",
      style: { background: "linear-gradient(180deg, #0a1628 0%, #061020 100%)" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4 text-cyan-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-orbitron text-white", children: "Preview" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full ${categoryStyle.text} ${categoryStyle.bg}`, children: CATEGORY_LABELS[agent.category] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-white/60" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-[280px]", style: { background: "linear-gradient(180deg, #0a1628 0%, #040812 100%)" }, children: [
          isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 text-cyan-400 animate-spin" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Canvas,
            {
              camera: { position: [0, 1, 4], fov: 40 },
              gl: { antialias: true, alpha: true, toneMappingExposure: 1.4, toneMapping: ACESFilmicToneMapping },
              onCreated: () => setIsLoading(false),
              style: { opacity: isLoading ? 0.3 : 1, transition: "opacity 0.3s" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("ambientLight", { intensity: 1.2, color: "#ffffff" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("directionalLight", { position: [3, 4, 3], intensity: 1.5, color: "#ffffff" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("directionalLight", { position: [-3, 2, 2], intensity: 0.8, color: "#e0f0ff" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("directionalLight", { position: [0, 3, -4], intensity: 0.6, color: "#00d4ff" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("pointLight", { position: [0, 5, 0], intensity: 0.5, color: "#ffffff", distance: 10 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AgentModel, { glbPath: agent.glbPath }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  OrbitControls,
                  {
                    enablePan: false,
                    enableZoom: true,
                    autoRotate: true,
                    autoRotateSpeed: 1.5,
                    minDistance: 2,
                    maxDistance: 6,
                    target: [0, 0.8, 0]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3 h-3 text-white/50" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-white/50", children: "Auto-rotating" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-orbitron font-medium text-white text-sm", children: agent.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] px-1.5 py-0.5 rounded-full ${rarityStyle.text} ${rarityStyle.bg}`, children: agent.rarity }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-white/40", children: agent.gender === "ANY" ? "All genders" : agent.gender })
              ] })
            ] }),
            agent.priceM1U > 0 && !isOwned && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-4 h-4 text-yellow-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-lg font-bold font-orbitron ${canAfford ? "text-yellow-400" : "text-red-400"}`, children: agent.priceM1U })
            ] }),
            agent.priceM1U === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 text-green-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-green-400", children: "FREE" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: isOwned ? onSelect : onPurchase,
              disabled: isPurchasing || isOwned && isSelected || !isOwned && agent.priceM1U > 0 && !canAfford,
              className: `w-full py-3 rounded-xl font-orbitron text-sm font-medium transition-all flex items-center justify-center gap-2 ${isSelected ? "bg-green-500/20 border border-green-500/40 text-green-400 cursor-default" : isOwned ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600" : agent.priceM1U === 0 ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600" : canAfford ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600" : "bg-white/10 text-white/30 cursor-not-allowed"}`,
              children: isPurchasing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
                "Processing..."
              ] }) : isSelected ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }),
                "Currently Active"
              ] }) : isOwned ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4" }),
                "Deploy Agent"
              ] }) : agent.priceM1U === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4" }),
                "Select Agent (FREE)"
              ] }) : canAfford ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-4 h-4" }),
                "Unlock for ",
                agent.priceM1U,
                " M1U"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-4 h-4" }),
                "Need ",
                agent.priceM1U - balance,
                " more M1U"
              ] })
            }
          )
        ] })
      ]
    }
  );
}
const CATEGORY_ICONS = {
  BASE: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4" }),
  SPECIAL: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4" }),
  PREMIUM: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-4 h-4" })
};
const CATEGORY_ORDER = ["BASE", "SPECIAL", "PREMIUM"];
function AgentShop({ ownedAgents, selectedAgentId, agentCode, onAgentPurchased, onAgentSelected }) {
  const { user } = useAuth();
  const { unitsData, isLoading: m1uLoading, refetch: refetchM1U } = useM1UnitsRealtime(user?.id);
  const [purchasing, setPurchasing] = reactExports.useState(null);
  const [activeCategory, setActiveCategory] = reactExports.useState("BASE");
  const [previewAgentId, setPreviewAgentId] = reactExports.useState(null);
  const [unlockModalOpen, setUnlockModalOpen] = reactExports.useState(false);
  const [unlockedAgent, setUnlockedAgent] = reactExports.useState(null);
  const balance = unitsData?.balance || 0;
  const currentAgents = reactExports.useMemo(() => getAgentsByCategory(activeCategory), [activeCategory]);
  const handlePurchase = async (agent) => {
    if (!user?.id) return;
    if (ownedAgents.includes(agent.id) || agent.priceM1U === 0) {
      onAgentSelected(agent.id);
      setUnlockedAgent(agent);
      setUnlockModalOpen(true);
      setPreviewAgentId(null);
      return;
    }
    if (balance < agent.priceM1U) {
      ue.error(`Not enough M1U. Need ${agent.priceM1U} M1U but have ${balance}.`);
      return;
    }
    setPurchasing(agent.id);
    try {
      const newBalance = balance - agent.priceM1U;
      const { error } = await supabase.from("profiles").update({ m1_units: newBalance, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", user.id);
      if (error) throw error;
      window.dispatchEvent(new CustomEvent("m1u-spent", { detail: { amount: agent.priceM1U, newBalance, reason: "agent_purchase" } }));
      onAgentPurchased(agent.id);
      await refetchM1U();
      setUnlockedAgent(agent);
      setUnlockModalOpen(true);
      setPreviewAgentId(null);
    } catch (error) {
      ue.error("Purchase failed");
    } finally {
      setPurchasing(null);
    }
  };
  const handleUnlockModalConfirm = () => {
    if (unlockedAgent) {
      onAgentSelected(unlockedAgent.id);
      window.dispatchEvent(new CustomEvent("agent-customization-updated"));
    }
    setUnlockModalOpen(false);
    setUnlockedAgent(null);
    ue.success("Agent deployed!", { duration: 1500 });
  };
  const handleUnlockModalClose = () => {
    setUnlockModalOpen(false);
    setUnlockedAgent(null);
  };
  const handlePreview = (agent) => setPreviewAgentId((prevId) => prevId === agent.id ? null : agent.id);
  const previewAgent = previewAgentId ? getAgentById(previewAgentId) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AgentUnlockModal,
      {
        isOpen: unlockModalOpen,
        agent: unlockedAgent,
        agentCode,
        onClose: handleUnlockModalClose,
        onConfirmSetActive: handleUnlockModalConfirm
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-4 border border-cyan-500/20",
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                style: { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)", color: "#1a1a1a", boxShadow: "0 0 12px rgba(255, 215, 0, 0.5)" },
                children: "M1"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-white/60", children: "Your Balance" })
          ] }),
          m1uLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 text-cyan-400 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-5 h-5 text-yellow-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold font-orbitron text-white", children: balance.toLocaleString("it-IT") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-white/50", children: "M1U" })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: previewAgent && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AgentPreviewPanel,
      {
        agent: previewAgent,
        onClose: () => setPreviewAgentId(null),
        onPurchase: () => handlePurchase(previewAgent),
        onSelect: () => {
          handlePurchase(previewAgent);
        },
        isPurchasing: purchasing === previewAgent.id,
        isOwned: ownedAgents.includes(previewAgent.id) || previewAgent.priceM1U === 0,
        isSelected: selectedAgentId === previewAgent.id,
        canAfford: balance >= previewAgent.priceM1U,
        balance
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 -mx-1 px-1", children: CATEGORY_ORDER.map((category) => {
      const agents = getAgentsByCategory(category);
      const categoryStyle = CATEGORY_STYLES[category];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveCategory(category),
          className: `flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeCategory === category ? `bg-gradient-to-r ${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border}` : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10"}`,
          children: [
            CATEGORY_ICONS[category],
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: CATEGORY_LABELS[category] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] opacity-60", children: [
              "(",
              agents.length,
              ")"
            ] })
          ]
        },
        category
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-4 text-[11px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3 h-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Agents: FREE" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-3 bg-white/20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-cyan-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-3 h-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Special: 50 M1U" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-3 bg-white/20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-yellow-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-3 h-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Premium: 100 M1U" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: currentAgents.map((agent, index) => {
      const isOwned = ownedAgents.includes(agent.id) || agent.priceM1U === 0;
      const isSelected = selectedAgentId === agent.id;
      const canAfford = balance >= agent.priceM1U;
      const rarityStyle = RARITY_STYLES[agent.rarity];
      const categoryStyle = CATEGORY_STYLES[agent.category];
      const isPreviewing = previewAgentId === agent.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 15 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: index * 0.03 },
          className: `relative p-3 rounded-xl border bg-gradient-to-r ${rarityStyle.bg} ${rarityStyle.border} ${isPreviewing ? "ring-2 ring-cyan-400/50" : ""} ${isSelected ? "ring-2 ring-green-400/50" : ""}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => handlePreview(agent),
                className: `relative w-14 h-14 rounded-lg bg-gradient-to-br ${categoryStyle.bg} border ${isPreviewing ? "border-cyan-400 ring-2 ring-cyan-400/30" : categoryStyle.border} flex items-center justify-center flex-shrink-0 transition-all hover:scale-105`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: categoryStyle.icon }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center transition-opacity ${isPreviewing ? "opacity-100" : "opacity-0 hover:opacity-100"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-5 h-5 text-cyan-400" }) }),
                  isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3 text-white" }) })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-white text-sm truncate", children: agent.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] px-1.5 py-0.5 rounded-full ${rarityStyle.text} bg-white/5`, children: agent.rarity })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/40", children: agent.gender === "ANY" ? "Any gender" : agent.gender }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mt-1", children: isSelected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-green-400 font-medium flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3" }),
                "Active Agent"
              ] }) : isOwned ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-cyan-400 font-medium", children: "Ready to deploy" }) : agent.priceM1U === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-green-400 font-bold", children: "FREE" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-3 h-3 text-yellow-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs font-bold ${canAfford ? "text-yellow-400" : "text-red-400"}`, children: [
                  agent.priceM1U,
                  " M1U"
                ] }),
                !canAfford && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3 h-3 text-red-400/60" })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: isSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs text-green-400 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3" }),
              "Active"
            ] }) }) : isOwned ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handlePurchase(agent),
                className: "px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs font-medium", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-3 h-3" }),
                  "Deploy"
                ] })
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => handlePurchase(agent),
                disabled: purchasing === agent.id || agent.priceM1U > 0 && !canAfford,
                className: `px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${agent.priceM1U === 0 ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600" : canAfford ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600" : "bg-white/10 text-white/30 cursor-not-allowed"}`,
                children: [
                  purchasing === agent.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : agent.priceM1U === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-3 h-3" }),
                  purchasing === agent.id ? "..." : agent.priceM1U === 0 ? "Select" : "Buy"
                ]
              }
            ) })
          ] })
        },
        agent.id
      );
    }) }),
    ownedAgents.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-xl p-3 border border-green-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white/60", children: "Your Collection" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-green-400", children: [
        ownedAgents.length + 8,
        " agents"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white/5 rounded-xl p-3 border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-cyan-400 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/60", children: "All BASE agents are free. Special and Premium agents unlock permanently once purchased!" })
    ] }) })
  ] });
}

const STORAGE_KEY = "agent_customization_v2";
const SAVE_DEBOUNCE_MS = 1500;
const DEFAULT_STATE = {
  selectedAgentId: getDefaultAgent().id,
  ownedAgents: [],
  skinToneId: "skin_medium"
};
function useAgentCustomization() {
  const { user } = useAuth();
  const [state, setState] = reactExports.useState(DEFAULT_STATE);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const saveTimeoutRef = reactExports.useRef(null);
  const pendingSaveRef = reactExports.useRef(false);
  const loadCustomization = reactExports.useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const localData = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setState({
            ...DEFAULT_STATE,
            ...parsed
          });
        } catch (e) {
        }
      }
      try {
        const { data: profile, error } = await supabase.from("profiles").select("agent_customization").eq("id", user.id).maybeSingle();
        if (error && error.code !== "42703") {
        } else if (profile?.agent_customization) {
          const dbData = profile.agent_customization;
          if (dbData) {
            setState({
              ...DEFAULT_STATE,
              ...dbData
            });
            localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(dbData));
          }
        }
      } catch (dbError) {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);
  reactExports.useEffect(() => {
    loadCustomization();
  }, [loadCustomization]);
  const saveToStorage = reactExports.useCallback((newState) => {
    if (!user?.id) return;
    localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(newState));
  }, [user?.id]);
  const saveToSupabase = reactExports.useCallback(async (dataToSave) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase.from("profiles").update({
        agent_customization: dataToSave,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", user.id);
      if (error && error.code !== "42703") {
      } else {
      }
    } catch (error) {
    }
  }, [user?.id]);
  const debouncedSave = reactExports.useCallback((newState) => {
    pendingSaveRef.current = true;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingSaveRef.current) {
        saveToSupabase(newState);
        pendingSaveRef.current = false;
      }
    }, SAVE_DEBOUNCE_MS);
  }, [saveToSupabase]);
  const saveCustomization = reactExports.useCallback(async () => {
    if (!user?.id) return;
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      pendingSaveRef.current = false;
    }
    saveToStorage(state);
    await saveToSupabase(state);
    setIsSaving(false);
  }, [user?.id, state, saveToStorage, saveToSupabase]);
  const selectAgent = reactExports.useCallback((agentId) => {
    setState((prev) => {
      const updated = { ...prev, selectedAgentId: agentId };
      saveToStorage(updated);
      debouncedSave(updated);
      return updated;
    });
  }, [saveToStorage, debouncedSave]);
  const addOwnedAgent = reactExports.useCallback((agentId) => {
    setState((prev) => {
      if (prev.ownedAgents.includes(agentId)) return prev;
      const updated = { ...prev, ownedAgents: [...prev.ownedAgents, agentId] };
      saveToStorage(updated);
      debouncedSave(updated);
      return updated;
    });
  }, [saveToStorage, debouncedSave]);
  const setSkinTone = reactExports.useCallback((skinToneId) => {
    setState((prev) => {
      const updated = { ...prev, skinToneId };
      saveToStorage(updated);
      debouncedSave(updated);
      return updated;
    });
  }, [saveToStorage, debouncedSave]);
  const isAgentOwned = reactExports.useCallback((agentId) => {
    const agent = getAgentById(agentId);
    if (!agent) return false;
    if (agent.priceM1U === 0) return true;
    return state.ownedAgents.includes(agentId);
  }, [state.ownedAgents]);
  const getSelectedAgent = reactExports.useCallback(() => {
    return getAgentById(state.selectedAgentId) || getDefaultAgent();
  }, [state.selectedAgentId]);
  reactExports.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  return {
    state,
    isLoading,
    isSaving,
    selectAgent,
    addOwnedAgent,
    setSkinTone,
    saveCustomization,
    isAgentOwned,
    getSelectedAgent
  };
}

function AgentLabModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = reactExports.useState("shop");
  const [agentCode, setAgentCode] = reactExports.useState("AG-XXXX");
  const {
    state,
    isLoading,
    isSaving,
    selectAgent,
    addOwnedAgent,
    setSkinTone,
    saveCustomization,
    getSelectedAgent
  } = useAgentCustomization();
  reactExports.useEffect(() => {
    const fetchAgentCode = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase.from("profiles").select("agent_code").eq("id", user.id).maybeSingle();
        if (!error && data?.agent_code) {
          setAgentCode(data.agent_code);
        } else {
          const cached = localStorage.getItem("m1ssion_agent_code");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setAgentCode(parsed.code || "AG-XXXX");
            } catch {
              setAgentCode("AG-XXXX");
            }
          }
        }
      } catch (err) {
      }
    };
    fetchAgentCode();
  }, [user?.id]);
  const handleClose = async () => {
    try {
      await saveCustomization();
    } catch {
    }
    onClose();
  };
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  const handleAgentPurchased = (agentId) => {
    addOwnedAgent(agentId);
  };
  const handleAgentSelected = (agentId) => {
    selectAgent(agentId);
  };
  getSelectedAgent();
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      className: "fixed inset-0 z-[9999] flex items-end justify-center",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      onClick: handleBackdropClick,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/80 backdrop-blur-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            className: "relative w-full h-[92vh] bg-gradient-to-b from-[#0a0a1a] via-[#0d0d20] to-[#0a0a1a] rounded-t-[32px] overflow-hidden",
            initial: { y: "100%" },
            animate: { y: 0 },
            exit: { y: "100%" },
            transition: { type: "spring", damping: 30, stiffness: 300 },
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 right-0 h-[2px] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent",
                  style: {
                    animation: "slideGlow 3s ease-in-out infinite",
                    width: "200%",
                    left: "-50%"
                  }
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
              @keyframes slideGlow {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(25%); }
              }
            ` }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-6 pt-6 pb-4 border-b border-white/10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleClose,
                    className: "absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-white/80" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: saveCustomization,
                    disabled: isSaving,
                    className: "absolute right-14 top-4 p-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 transition-colors",
                    children: isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 text-cyan-400 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-5 h-5 text-cyan-400" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center pr-20", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mb-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5 text-cyan-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400", children: "AGENT LAB™" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5 text-pink-400" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/50 font-medium", children: "Select your field agent" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex px-6 py-3 gap-3 border-b border-white/5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => setActiveTab("shop"),
                    className: `flex-1 py-3 px-4 rounded-xl font-orbitron text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "shop" ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "w-4 h-4" }),
                      "Agents Shop"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => setActiveTab("customize"),
                    className: `flex-1 py-3 px-4 rounded-xl font-orbitron text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "customize" ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30" : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4" }),
                      "Preview"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto h-[calc(92vh-160px)] custom-scrollbar", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 text-cyan-400 animate-spin" }) }) : activeTab === "shop" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                AgentShop,
                {
                  ownedAgents: state.ownedAgents,
                  selectedAgentId: state.selectedAgentId,
                  agentCode,
                  onAgentPurchased: handleAgentPurchased,
                  onAgentSelected: handleAgentSelected
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                AgentPreview,
                {
                  selectedAgentId: state.selectedAgentId,
                  skinToneId: state.skinToneId,
                  agentCode,
                  onSkinToneChange: setSkinTone,
                  loading: isLoading
                }
              ) })
            ]
          }
        )
      ]
    }
  ) });
}

export { AgentLabModal };
