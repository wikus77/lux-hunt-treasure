import { r as reactExports, j as jsxRuntimeExports, A as AnimatePresence, m as motion } from './animation-vendor.BiI6PE8T.js';
import { r as reactDomExports } from './map-vendor.uCr1tAyj.js';
import { f as useAuthContext, s as supabase, m as ue, X, aA as VolumeX, aB as Volume2, ab as Crosshair, H as Target, Z as Zap, e as CircleAlert, L as Lock, aC as Trophy, F as confetti, bQ as CircleX, aE as Crown, S as Sparkles, z as TriangleAlert } from './index.CUdqZWfi.js';

const FinalShootContext = reactExports.createContext(null);
const isTestMode = () => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("test-final-shoot") === "true";
};
const TEST_COORDINATES = { lat: 45.4642, lng: 9.19 };
const WINNING_DISTANCE_METERS = 50;
const getHintFromDistance = (distanceMeters) => {
  if (distanceMeters <= WINNING_DISTANCE_METERS) return "🎯 PERFETTO! HAI VINTO!";
  if (distanceMeters <= 150) return "🔥 Ci sei quasi! Pochissimi passi!";
  if (distanceMeters <= 500) return "🌡️ Molto vicino! Sei in zona calda!";
  if (distanceMeters <= 1e3) return "☀️ Vicino! Continua così!";
  if (distanceMeters <= 3e3) return "😊 Sei in zona. Esplora meglio!";
  if (distanceMeters <= 5e3) return "😐 Zona giusta ma non vicinissimo.";
  if (distanceMeters <= 1e4) return "❄️ Lontano. Cambia direzione!";
  if (distanceMeters <= 25e3) return "🥶 Molto lontano. Riconsidera la zona!";
  return "🌍 Lontanissimo! Sei fuori area.";
};
function FinalShootProvider({ children }) {
  const { user: authUser, isLoading: authLoading } = useAuthContext();
  const hasInitializedRef = reactExports.useRef(false);
  const [state, setState] = reactExports.useState({
    isAvailable: false,
    isActive: false,
    remainingAttempts: 23,
    // 🎯 Updated: 3 free + 10 plus + 10 elite = 23 max
    daysRemaining: 0,
    hasWon: false,
    isLoading: true,
    lastAttempt: null,
    pricing: null
    // 🎯 PLUS/ELITE pricing
  });
  const [missionData, setMissionData] = reactExports.useState({
    missionId: null,
    prizeLocation: null,
    endsAt: null
  });
  const [isLocked, setIsLocked] = reactExports.useState(true);
  const [totalMissionDays, setTotalMissionDays] = reactExports.useState(30);
  reactExports.useEffect(() => {
    if (authLoading) {
      return;
    }
    const checkAvailability = async () => {
      try {
        const testMode = isTestMode();
        const { data: mission, error: missionError } = await supabase.from("current_mission_data").select("id, prize_lat, prize_lng, mission_ends_at, mission_started_at, mission_status, linked_mission_id").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (testMode) {
          const prizeLocation = mission?.prize_lat && mission?.prize_lng ? { lat: mission.prize_lat, lng: mission.prize_lng } : TEST_COORDINATES;
          setMissionData({
            missionId: mission?.linked_mission_id || mission?.id || "test-mission-id",
            prizeLocation,
            endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3)
          });
          setIsLocked(false);
          setState({
            isAvailable: true,
            isActive: false,
            remainingAttempts: 99,
            // Unlimited attempts in test mode
            daysRemaining: 3,
            hasWon: false,
            isLoading: false,
            lastAttempt: null,
            pricing: null
            // 🎯 Test mode doesn't use pricing
          });
          setTotalMissionDays(30);
          return;
        }
        if (missionError || !mission) {
          setState((prev) => ({ ...prev, isLoading: false, isAvailable: false }));
          setIsLocked(true);
          return;
        }
        const startedAt = mission.mission_started_at ? new Date(mission.mission_started_at) : null;
        let endsAt = mission.mission_ends_at ? new Date(mission.mission_ends_at) : null;
        if (!endsAt && startedAt) {
          endsAt = new Date(startedAt.getTime() + 30 * 24 * 60 * 60 * 1e3);
        }
        const missionDuration = startedAt && endsAt ? Math.ceil((endsAt.getTime() - startedAt.getTime()) / (1e3 * 60 * 60 * 24)) : 30;
        setTotalMissionDays(Math.max(1, missionDuration));
        const now = /* @__PURE__ */ new Date();
        const daysRemaining = endsAt ? Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24))) : 30;
        const isAvailable = daysRemaining > 0 && daysRemaining <= 7;
        setIsLocked(!isAvailable);
        setMissionData({
          missionId: mission.linked_mission_id || mission.id,
          prizeLocation: mission.prize_lat && mission.prize_lng ? { lat: mission.prize_lat, lng: mission.prize_lng } : null,
          endsAt
        });
        if (!authUser) {
          setState((prev) => ({ ...prev, isLoading: false, isAvailable: false }));
          return;
        }
        const user = authUser;
        const { data: attempts, error: attemptsError } = await supabase.from("final_shoot_attempts").select("*").eq("user_id", user.id).eq("mission_id", mission.linked_mission_id || mission.id).order("created_at", { ascending: false });
        if (attemptsError) {
        }
        const attemptsCount = attempts?.length || 0;
        const hasWon = attempts?.some((a) => a.is_winner) || false;
        const remainingAttempts = Math.max(0, 3 - attemptsCount);
        const lastAttempt = attempts?.[0] ? { distance: attempts[0].distance_meters, hint: getHintFromDistance(attempts[0].distance_meters) } : null;
        setState({
          isAvailable,
          isActive: false,
          remainingAttempts,
          daysRemaining,
          hasWon,
          isLoading: false,
          lastAttempt,
          pricing: null
          // 🎯 Will be fetched by refreshPricing effect
        });
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };
    checkAvailability();
    hasInitializedRef.current = true;
  }, [authUser?.id, authLoading]);
  const refreshPricing = reactExports.useCallback(async () => {
    if (!authUser?.id || !missionData.missionId) {
      return;
    }
    try {
      const { data, error } = await supabase.rpc("get_final_shoot_pricing", {
        p_user_id: authUser.id,
        p_mission_id: missionData.missionId
      });
      if (error) {
        return;
      }
      const pricing = data;
      setState((prev) => ({
        ...prev,
        pricing,
        remainingAttempts: pricing.total_remaining
      }));
    } catch (err) {
    }
  }, [authUser?.id, missionData.missionId]);
  reactExports.useEffect(() => {
    if (missionData.missionId && authUser?.id) {
      refreshPricing();
    }
  }, [missionData.missionId, authUser?.id, refreshPricing]);
  const activateFinalShoot = reactExports.useCallback(() => {
    if (!state.isAvailable || state.remainingAttempts <= 0 || state.hasWon) {
      return;
    }
    setState((prev) => ({ ...prev, isActive: true }));
    ue.info("🎯 FINAL SHOOT ATTIVATO!", {
      description: `Clicca sulla mappa dove pensi sia il premio. Hai ${state.remainingAttempts} tentativi.`,
      duration: 5e3
    });
  }, [state.isAvailable, state.remainingAttempts, state.hasWon]);
  const deactivateFinalShoot = reactExports.useCallback(() => {
    setState((prev) => ({ ...prev, isActive: false }));
  }, []);
  const executeShoot = reactExports.useCallback(async (lat, lng) => {
    if (!missionData.missionId) {
      ue.error("Errore: Missione non trovata");
      return false;
    }
    if (state.remainingAttempts <= 0) {
      ue.error("Hai esaurito tutti i tentativi!");
      return false;
    }
    if (state.hasWon) {
      ue.success("Hai già vinto il Final Shoot!");
      return false;
    }
    if (!authUser) {
      ue.error("Devi essere loggato");
      return false;
    }
    try {
      if (isTestMode() && missionData.prizeLocation) {
        const R = 6371e3;
        const dLat = (missionData.prizeLocation.lat - lat) * Math.PI / 180;
        const dLng = (missionData.prizeLocation.lng - lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat * Math.PI / 180) * Math.cos(missionData.prizeLocation.lat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance2 = R * c;
        const isWinner2 = distance2 <= WINNING_DISTANCE_METERS;
        const hint2 = getHintFromDistance(distance2);
        setState((prev) => ({
          ...prev,
          remainingAttempts: prev.remainingAttempts - 1,
          hasWon: isWinner2,
          isActive: isWinner2 ? false : prev.isActive,
          lastAttempt: { distance: distance2, hint: hint2 }
        }));
        if (isWinner2) {
          ue.success("🎉 HAI VINTO IL FINAL SHOOT! (TEST)", { duration: 1e4 });
        } else {
          ue.info(hint2, { description: `Tentativi rimasti: ${state.remainingAttempts - 1}`, duration: 5e3 });
        }
        return isWinner2;
      }
      const { data: rpcResult, error: rpcError } = await supabase.rpc("execute_final_shoot", {
        p_user_id: authUser.id,
        p_mission_id: missionData.missionId,
        p_lat: lat,
        p_lng: lng
      });
      if (rpcError) {
        ue.error(`Errore: ${rpcError.message || "Salvataggio fallito"}`, {
          description: rpcError.code ? `Code: ${rpcError.code}` : void 0
        });
        return false;
      }
      const result = rpcResult;
      if (!result.success) {
        if (result.status === "insufficient_funds") {
          ue.error("💰 Saldo M1U insufficiente", {
            description: `Richiesti: ${result.required_m1u} M1U | Disponibili: ${result.balance_before || result.current_balance} M1U`,
            duration: 5e3
          });
          refreshPricing();
          throw new Error("insufficient_funds");
        } else if (result.status === "cap_reached") {
          ue.error("🚫 Limite raggiunto", {
            description: "Hai utilizzato tutti i 23 tentativi per questa missione.",
            duration: 5e3
          });
          refreshPricing();
          throw new Error("cap_reached");
        } else if (result.status === "not_available") {
          ue.error("⏳ Final Shot non disponibile", {
            description: "Attendi gli ultimi 7 giorni di missione.",
            duration: 5e3
          });
          throw new Error("not_available");
        } else {
          const errorMessage = result.error || result.message || "Tentativo fallito";
          ue.error(errorMessage);
          refreshPricing();
          throw new Error(result.status || "unknown_error");
        }
      }
      const isWinner = result.winner === true;
      const distance = result.distance_meters || 0;
      const hint = result.hint || getHintFromDistance(distance);
      const attemptsRemaining = result.attempts_remaining ?? state.remainingAttempts - 1;
      const costCharged = result.cost_charged || 0;
      const tier = result.tier || "free";
      const balanceAfter = result.balance_after;
      if (costCharged > 0 && balanceAfter !== void 0) {
        window.dispatchEvent(new CustomEvent("m1u-spent", {
          detail: {
            amount: costCharged,
            newBalance: balanceAfter,
            reason: `final_shoot_${tier}`
          }
        }));
      } else if (costCharged > 0) {
        window.dispatchEvent(new CustomEvent("m1u-balance-changed"));
      }
      setState((prev) => ({
        ...prev,
        remainingAttempts: Math.max(0, attemptsRemaining),
        hasWon: isWinner,
        isActive: isWinner ? false : prev.isActive,
        lastAttempt: { distance, hint },
        pricing: result.pricing || prev.pricing
      }));
      refreshPricing();
      if (isWinner) {
        ue.success("🎉 HAI VINTO IL FINAL SHOOT!", {
          description: result.message || "Complimenti! Hai trovato la posizione esatta del premio!",
          duration: 1e4
        });
        if ("vibrate" in navigator) {
          navigator.vibrate([500, 200, 500, 200, 500]);
        }
      } else {
        ue.info(hint, {
          description: `Tentativi rimasti: ${attemptsRemaining}`,
          duration: 5e3
        });
      }
      return isWinner;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Errore sconosciuto";
      ue.error(`Errore: ${errMsg}`);
      return false;
    }
  }, [missionData.missionId, missionData.prizeLocation, state.remainingAttempts, state.hasWon, authUser]);
  const value = {
    ...state,
    missionData,
    isLocked,
    totalMissionDays,
    isTestMode: isTestMode(),
    activateFinalShoot,
    deactivateFinalShoot,
    executeShoot,
    refreshPricing
    // 🎯 PLUS/ELITE pricing
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FinalShootContext.Provider, { value, children });
}
function useFinalShootContext() {
  const context = reactExports.useContext(FinalShootContext);
  if (!context) {
    throw new Error("useFinalShootContext must be used within a FinalShootProvider");
  }
  return context;
}

const FINALSHOT_VIDEO = "/assets/video/FINALSHOT-BRIF-VIDEO.mp4";
const HEARTBEAT_AUDIO = "/assets/audio/HMNHart-heart_beats-Elevenlabs.mp3";
const VIDEO_STORAGE_KEY = "m1_finalshot_video_dismissed";
const ADMIN_EMAILS = ["wikus77@hotmail.it"];
const FinalShootPill = () => {
  const {
    isAvailable,
    isActive,
    isLocked,
    remainingAttempts,
    daysRemaining,
    totalMissionDays,
    hasWon,
    isLoading,
    isTestMode,
    activateFinalShoot,
    deactivateFinalShoot,
    pricing
    // 🎯 PLUS/ELITE pricing
  } = useFinalShootContext();
  const [showInfoModal, setShowInfoModal] = reactExports.useState(false);
  const [showVideoModal, setShowVideoModal] = reactExports.useState(false);
  const [videoAudioEnabled, setVideoAudioEnabled] = reactExports.useState(false);
  const videoRef = reactExports.useRef(null);
  const heartbeatAudioRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (isActive) {
      if (!heartbeatAudioRef.current) {
        heartbeatAudioRef.current = new Audio(HEARTBEAT_AUDIO);
        heartbeatAudioRef.current.loop = true;
        heartbeatAudioRef.current.volume = 0.5;
      }
      heartbeatAudioRef.current.play().catch((err) => {
      });
    } else {
      if (heartbeatAudioRef.current) {
        heartbeatAudioRef.current.pause();
        heartbeatAudioRef.current.currentTime = 0;
      }
    }
    return () => {
      if (heartbeatAudioRef.current) {
        heartbeatAudioRef.current.pause();
        heartbeatAudioRef.current.currentTime = 0;
      }
    };
  }, [isActive]);
  const shouldShowVideo = reactExports.useCallback((userEmail) => {
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
    if (isAdmin) {
      localStorage.removeItem(VIDEO_STORAGE_KEY);
      return true;
    }
    return localStorage.getItem(VIDEO_STORAGE_KEY) !== "true";
  }, []);
  const handleVideoTapForAudio = reactExports.useCallback(() => {
    if (videoRef.current && !videoAudioEnabled) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {
      });
      setVideoAudioEnabled(true);
    }
  }, [videoAudioEnabled]);
  const handleVideoEnd = reactExports.useCallback(() => {
    setShowVideoModal(false);
    setVideoAudioEnabled(false);
    activateFinalShoot();
  }, [activateFinalShoot]);
  const handleSkipVideo = reactExports.useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowVideoModal(false);
    setVideoAudioEnabled(false);
    activateFinalShoot();
  }, [activateFinalShoot]);
  const handleDismissVideo = reactExports.useCallback(() => {
    localStorage.setItem(VIDEO_STORAGE_KEY, "true");
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowVideoModal(false);
    setVideoAudioEnabled(false);
    activateFinalShoot();
  }, [activateFinalShoot]);
  const handleCloseVideo = reactExports.useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowVideoModal(false);
    setVideoAudioEnabled(false);
  }, []);
  reactExports.useEffect(() => {
    if (showVideoModal && videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().then(() => {
        setVideoAudioEnabled(true);
      }).catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {
          });
        }
      });
    }
  }, [showVideoModal]);
  if (isLoading) {
    return null;
  }
  const daysUntilAvailable = Math.max(0, daysRemaining - 7);
  const getState = () => {
    if (hasWon) return "won";
    if (isAvailable && remainingAttempts <= 0) return "exhausted";
    if (isActive) return "active";
    if (isLocked) return "locked";
    return "available";
  };
  const state = getState();
  const getIcon = () => {
    switch (state) {
      case "won":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-5 h-5 text-yellow-400" });
      case "exhausted":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-gray-400" });
      case "active":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-5 h-5 text-red-400" });
      case "locked":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-5 h-5 text-gray-400" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Crosshair, { className: "w-5 h-5 text-cyan-400" });
    }
  };
  const handleClick = () => {
    if (state === "won" || state === "exhausted") return;
    if (state === "active") {
      deactivateFinalShoot();
    } else if (state === "locked") {
      setShowInfoModal(true);
    } else {
      if (shouldShowVideo()) {
        setShowVideoModal(true);
      } else {
        activateFinalShoot();
      }
    }
  };
  const videoModalContent = /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showVideoModal && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 bg-black/60 backdrop-blur-sm",
        style: { zIndex: 999998 },
        onClick: handleCloseVideo
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { type: "spring", damping: 30, stiffness: 300 },
        className: "fixed inset-x-0 bottom-0 overflow-hidden",
        style: {
          zIndex: 999999,
          top: "calc(50px + env(safe-area-inset-top, 0px))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "h-full rounded-t-3xl bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-x overflow-hidden flex flex-col",
            style: {
              borderColor: "rgba(239, 68, 68, 0.3)",
              boxShadow: "0 -10px 40px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(239, 68, 68, 0.1)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center pt-3 pb-2 cursor-grab flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-1.5 rounded-full bg-white/30" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 pb-3 border-b border-white/10 flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-2 h-2 rounded-full animate-pulse",
                      style: { background: "#EF4444", boxShadow: "0 0 10px #EF4444" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-orbitron font-bold text-white text-[15px]", children: "FINAL SHOT" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleCloseVideo,
                    className: "w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-white/70" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/50 px-4 pt-2 flex-shrink-0", children: "Briefing: La tua ultima possibilità di vincere" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "flex-1 px-3 py-2 overflow-hidden",
                  onClick: handleVideoTapForAudio,
                  onTouchStart: handleVideoTapForAudio,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl overflow-hidden bg-black h-full", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "video",
                      {
                        ref: videoRef,
                        src: FINALSHOT_VIDEO,
                        className: "w-full h-full object-contain",
                        playsInline: true,
                        muted: !videoAudioEnabled,
                        onEnded: handleVideoEnd,
                        onError: handleSkipVideo,
                        disablePictureInPicture: true,
                        disableRemotePlayback: true,
                        controlsList: "nodownload noremoteplayback"
                      }
                    ),
                    !videoAudioEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.div,
                      {
                        className: "absolute inset-0 flex items-center justify-center bg-black/30",
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          motion.div,
                          {
                            className: "flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-black/60 backdrop-blur-sm",
                            animate: { scale: [1, 1.05, 1] },
                            transition: { duration: 1.5, repeat: Infinity },
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "w-8 h-8 text-white/80" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/80 text-xs font-medium", children: "Tocca per l'audio" })
                            ]
                          }
                        )
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-3 left-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center", children: videoAudioEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "w-5 h-5 text-red-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "w-5 h-5 text-white/60" }) }) })
                  ] })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.button,
                  {
                    className: "w-full py-4 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider",
                    style: {
                      background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                      color: "white",
                      boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)"
                    },
                    onClick: (e) => {
                      e.stopPropagation();
                      handleSkipVideo();
                    },
                    whileHover: { scale: 1.02 },
                    whileTap: { scale: 0.98 },
                    children: "ATTIVA FINAL SHOT →"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: "w-full mt-2 text-xs text-white/40 hover:text-white/60 transition-colors py-2",
                    onClick: (e) => {
                      e.stopPropagation();
                      handleDismissVideo();
                    },
                    children: "Non mostrare più questo video"
                  }
                )
              ] })
            ]
          }
        )
      }
    )
  ] }) });
  const infoModalContent = /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showInfoModal && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 bg-black/80 backdrop-blur-md",
        style: { zIndex: 999998 },
        onClick: () => setShowInfoModal(false)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
        transition: { type: "spring", damping: 25, stiffness: 300 },
        className: "fixed left-4 right-4 overflow-hidden",
        style: {
          zIndex: 999999,
          top: "calc(60px + env(safe-area-inset-top, 0px))",
          bottom: "calc(90px + env(safe-area-inset-bottom, 0px))"
        },
        onClick: (e) => e.stopPropagation(),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "h-full w-full max-w-lg mx-auto rounded-2xl bg-gradient-to-b from-gray-900 via-gray-900 to-black border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col",
            style: { boxShadow: "0 0 60px rgba(0, 209, 255, 0.3), 0 25px 50px rgba(0, 0, 0, 0.5)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 p-4 border-b border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crosshair, { className: "w-6 h-6 text-cyan-400" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-white font-orbitron", children: "FINAL SHOT" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-cyan-400", children: "La Mossa Finale" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setShowInfoModal(false),
                    className: "p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-white/60" })
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-xl bg-white/5 border border-white/10", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-white mb-2 flex items-center gap-2 text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-4 h-4 text-pink-400" }),
                    "Cos'è Final Shot?"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-white/70 leading-relaxed", children: [
                    "È la tua ultima possibilità di vincere! Negli ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 font-bold", children: "ultimi 7 giorni" }),
                    " della missione, puoi indicare sulla mappa dove pensi si trovi il premio."
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-xl bg-white/5 border border-white/10", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-white mb-2 flex items-center gap-2 text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4 text-yellow-400" }),
                    "Come Funziona"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs text-white/70 space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 font-bold", children: "1." }),
                      "Attiva Final Shot toccando questo pulsante"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 font-bold", children: "2." }),
                      "Tocca sulla mappa dove pensi sia il premio"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 font-bold", children: "3." }),
                      "Ricevi feedback sulla distanza dal premio"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-400/20", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-red-300 mb-2 flex items-center gap-2 text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4" }),
                    "Tentativi Disponibili"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 text-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-white/80", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🆓 Gratuiti" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-green-400", children: "3 tentativi" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-white/80", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "⭐ Plus" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-amber-400", children: "10 tentativi (100-1000 M1U)" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-white/80", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "💎 Elite" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-purple-400", children: "10 tentativi (1500 M1U cad.)" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1 border-t border-white/10 flex justify-between text-white/60", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Totale massimo" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-cyan-400", children: "23 tentativi" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-white/60", children: "Si attiva tra" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xl font-bold text-cyan-400 font-orbitron", children: [
                      daysUntilAvailable,
                      " GIORNI"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-white/60", children: "Giorni missione" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base font-bold text-white", children: [
                      totalMissionDays - daysRemaining,
                      "/",
                      totalMissionDays
                    ] })
                  ] })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 p-4 border-t border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setShowInfoModal(false),
                  className: "w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-white font-bold hover:border-cyan-400/50 transition-colors text-sm",
                  children: "Ho Capito"
                }
              ) })
            ]
          }
        )
      }
    )
  ] }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.button,
      {
        className: `pill-orb final-shoot-pill final-shoot-pill--${state}`,
        onClick: handleClick,
        initial: { scale: 0 },
        animate: { scale: 1 },
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.97 },
        transition: { type: "spring", stiffness: 300, damping: 20 },
        "aria-label": "Final Shoot",
        children: [
          getIcon(),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dot" }),
          isTestMode && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] bg-yellow-500 rounded-full text-black font-bold", children: "TEST" }),
          state === "won" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-3 text-sm", children: "👑" })
        ]
      }
    ),
    reactDomExports.createPortal(videoModalContent, document.body),
    reactDomExports.createPortal(infoModalContent, document.body)
  ] });
};

const FinalShootOverlay = ({ map }) => {
  const ctx = useFinalShootContext();
  const [showConfirm, setShowConfirm] = reactExports.useState(false);
  const [targetCoords, setTargetCoords] = reactExports.useState(null);
  const [phase, setPhase] = reactExports.useState("idle");
  const [progress, setProgress] = reactExports.useState(0);
  const [result, setResult] = reactExports.useState(null);
  const formatDistance = (meters) => {
    if (meters >= 1e3) return `${(meters / 1e3).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  };
  const timerRef = reactExports.useRef(null);
  const beatTimerRef = reactExports.useRef(null);
  const audioCtxRef = reactExports.useRef(null);
  const cleanup = reactExports.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (beatTimerRef.current) {
      clearTimeout(beatTimerRef.current);
      beatTimerRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
      }
      audioCtxRef.current = null;
    }
  }, []);
  const progressRef = reactExports.useRef(0);
  const playBeat = reactExports.useCallback(() => {
    const p = progressRef.current;
    if (p >= 1) return;
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      const freq = 35 + p * 80;
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ac.currentTime + 0.15);
      const vol = 0.15 + p * 0.4;
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + 0.25);
      setTimeout(() => ac.close(), 400);
      if ("vibrate" in navigator) navigator.vibrate(20 + Math.floor(p * 50));
    } catch {
    }
    const interval = Math.max(80, 600 - p * 520);
    if (p < 1) {
      beatTimerRef.current = window.setTimeout(playBeat, interval);
    }
  }, []);
  const startHeartbeat = reactExports.useCallback(() => {
    progressRef.current = 0;
    playBeat();
  }, [playBeat]);
  const playWinSound = reactExports.useCallback(() => {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const masterGain = ac.createGain();
      masterGain.gain.setValueAtTime(0.5, ac.currentTime);
      masterGain.connect(ac.destination);
      const convolver = ac.createConvolver();
      const reverbLength = 2;
      const reverbBuffer = ac.createBuffer(2, ac.sampleRate * reverbLength, ac.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const data = reverbBuffer.getChannelData(channel);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
        }
      }
      convolver.buffer = reverbBuffer;
      const reverbGain = ac.createGain();
      reverbGain.gain.setValueAtTime(0.3, ac.currentTime);
      convolver.connect(reverbGain);
      reverbGain.connect(masterGain);
      const playNote = (freq, startTime, duration, type = "sine", vol = 0.15) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ac.currentTime + startTime);
        gain.gain.setValueAtTime(0, ac.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(vol, ac.currentTime + startTime + 0.05);
        gain.gain.setValueAtTime(vol * 0.8, ac.currentTime + startTime + duration * 0.3);
        gain.gain.exponentialRampToValueAtTime(1e-3, ac.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        gain.connect(convolver);
        osc.start(ac.currentTime + startTime);
        osc.stop(ac.currentTime + startTime + duration + 0.1);
      };
      const playChord = (freqs, startTime, duration, type = "sine", vol = 0.12) => {
        freqs.forEach((f, i) => playNote(f, startTime, duration, type, vol / (i === 0 ? 1 : 1.5)));
      };
      playChord([130.81, 261.63, 329.63, 392, 523.25], 0, 0.6, "sawtooth", 0.15);
      playNote(65.41, 0, 1.2, "sine", 0.25);
      [261.63, 329.63, 392, 523.25, 659.25, 783.99].forEach((f, i) => {
        playNote(f, 0.1 + i * 0.08, 0.8 - i * 0.1, "triangle", 0.08);
      });
      [0.5, 0.7].forEach((t) => playNote(98, t, 0.3, "sine", 0.2));
      playChord([392, 493.88, 587.33], 0.8, 0.4, "sawtooth", 0.12);
      playChord([440, 554.37, 659.25], 1.2, 0.4, "sawtooth", 0.12);
      playChord([493.88, 622.25, 739.99], 1.6, 0.5, "sawtooth", 0.14);
      playChord([523.25, 659.25, 783.99, 1046.5], 2.1, 1.5, "sawtooth", 0.18);
      playChord([261.63, 329.63, 392], 2.1, 1.5, "triangle", 0.1);
      playNote(130.81, 2.1, 1.5, "sine", 0.2);
      [1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093].forEach((f, i) => {
        playNote(f, 2.3 + i * 0.12, 1.5, "sine", 0.05);
      });
      setTimeout(() => {
        playChord([261.63, 329.63, 392, 523.25, 659.25, 783.99], 0, 3, "sine", 0.08);
        playChord([130.81, 196, 261.63], 0, 3, "triangle", 0.06);
        playNote(65.41, 0, 3, "sine", 0.15);
      }, 3e3);
      const choir = [523.25, 659.25, 783.99, 1046.5];
      choir.forEach((f, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, ac.currentTime + 2.5);
        gain.gain.setValueAtTime(0, ac.currentTime + 2.5);
        gain.gain.linearRampToValueAtTime(0.04, ac.currentTime + 3.5);
        gain.gain.linearRampToValueAtTime(0.06, ac.currentTime + 5);
        gain.gain.exponentialRampToValueAtTime(1e-3, ac.currentTime + 7);
        osc.connect(gain);
        gain.connect(masterGain);
        gain.connect(convolver);
        osc.start(ac.currentTime + 2.5);
        osc.stop(ac.currentTime + 7);
      });
      setTimeout(() => ac.close(), 8e3);
    } catch (e) {
    }
  }, []);
  const playFailSound = reactExports.useCallback(() => {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const masterGain = ac.createGain();
      masterGain.gain.setValueAtTime(0.4, ac.currentTime);
      masterGain.connect(ac.destination);
      [392, 349.23, 293.66, 261.63].forEach((f, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(f, ac.currentTime + i * 0.3);
        gain.gain.setValueAtTime(0.15, ac.currentTime + i * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + i * 0.3 + 0.4);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ac.currentTime + i * 0.3);
        osc.stop(ac.currentTime + i * 0.3 + 0.5);
      });
      const bass = ac.createOscillator();
      const bassGain = ac.createGain();
      bass.type = "sine";
      bass.frequency.setValueAtTime(45, ac.currentTime + 0.8);
      bassGain.gain.setValueAtTime(0.3, ac.currentTime + 0.8);
      bassGain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 2);
      bass.connect(bassGain);
      bassGain.connect(masterGain);
      bass.start(ac.currentTime + 0.8);
      bass.stop(ac.currentTime + 2.2);
      setTimeout(() => ac.close(), 2500);
    } catch {
    }
  }, []);
  const triggerGoldenCelebration = reactExports.useCallback(() => {
    if (typeof confetti !== "function") return;
    confetti({
      particleCount: 200,
      spread: 180,
      origin: { y: 0.5, x: 0.5 },
      colors: ["#FFD700", "#FFA500", "#FFDF00", "#F0E68C", "#DAA520"],
      ticks: 300,
      gravity: 0.8,
      scalar: 1.2
    });
    setTimeout(() => {
      confetti({ particleCount: 100, angle: 60, spread: 80, origin: { x: 0, y: 0.6 }, colors: ["#FFD700", "#FFA500", "#FFFFFF"] });
      confetti({ particleCount: 100, angle: 120, spread: 80, origin: { x: 1, y: 0.6 }, colors: ["#FFD700", "#FFA500", "#FFFFFF"] });
    }, 300);
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 120,
        origin: { y: 0, x: 0.5 },
        colors: ["#FFD700", "#FFFFFF"],
        shapes: ["star"],
        scalar: 2,
        gravity: 1.5
      });
    }, 600);
    [1e3, 1500, 2e3, 2500].forEach((delay, i) => {
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100 + i * 20,
          origin: { y: 0.3, x: 0.3 + Math.random() * 0.4 },
          colors: ["#FFD700", "#FFA500", "#FFDF00", "#F5DEB3"],
          ticks: 200
        });
      }, delay);
    });
  }, []);
  reactExports.useEffect(() => {
    if (!map || !ctx.isActive || showConfirm || phase !== "idle") return;
    const onClick = (e) => {
      setTargetCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      setShowConfirm(true);
    };
    map.on("click", onClick);
    map.getCanvas().style.cursor = "crosshair";
    return () => {
      map.off("click", onClick);
      map.getCanvas().style.cursor = "";
    };
  }, [map, ctx.isActive, showConfirm, phase]);
  const resetToIdle = reactExports.useCallback(() => {
    cleanup();
    setPhase("idle");
    setProgress(0);
    setResult(null);
    setTargetCoords(null);
    setShowConfirm(false);
  }, [cleanup]);
  const showResult = reactExports.useCallback((isWinner, hint, distance) => {
    cleanup();
    setResult({ isWinner, hint, distance });
    setPhase("result");
    if (isWinner) {
      playWinSound();
      triggerGoldenCelebration();
      if ("vibrate" in navigator) navigator.vibrate([300, 100, 300, 100, 600]);
    } else {
      playFailSound();
      if ("vibrate" in navigator) navigator.vibrate([500, 150, 500]);
    }
    setTimeout(() => {
      resetToIdle();
      if (isWinner || ctx.remainingAttempts <= 1) {
        ctx.deactivateFinalShoot();
      }
    }, isWinner ? 1e4 : 5e3);
  }, [cleanup, playWinSound, playFailSound, triggerGoldenCelebration, resetToIdle, ctx]);
  const confirmShoot = reactExports.useCallback(async () => {
    if (!targetCoords) return;
    const lat = targetCoords.lat;
    const lng = targetCoords.lng;
    setShowConfirm(false);
    cleanup();
    setPhase("suspense");
    setProgress(0.1);
    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
    try {
      const isWinner = await ctx.executeShoot(lat, lng);
      startHeartbeat();
      const duration = 5e3;
      const startTime = Date.now();
      let isRunning = true;
      const tick = () => {
        if (!isRunning) return;
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / duration, 1);
        setProgress(p);
        progressRef.current = p;
        if (p < 1) {
          timerRef.current = window.setTimeout(tick, 50);
        } else {
          isRunning = false;
          cleanup();
          const hint = isWinner ? "🎯 PERFETTO!" : ctx.lastAttempt?.hint || "Riprova!";
          const distance = ctx.lastAttempt?.distance;
          showResult(isWinner, hint, distance);
        }
      };
      timerRef.current = window.setTimeout(tick, 50);
    } catch (error) {
      cleanup();
      setPhase("idle");
      setProgress(0);
      setTargetCoords(null);
    }
  }, [targetCoords, startHeartbeat, cleanup, ctx, showResult]);
  const cancelConfirm = reactExports.useCallback(() => {
    setShowConfirm(false);
    setTargetCoords(null);
  }, []);
  reactExports.useEffect(() => () => cleanup(), [cleanup]);
  if (!ctx.isActive && phase === "idle") return null;
  const borderOpacity = phase === "suspense" ? 0.3 + progress * 0.7 : 0.3;
  const borderSize = phase === "suspense" ? 60 + progress * 240 : 60;
  const pulseSpeed = phase === "suspense" ? Math.max(0.3, 2 - progress * 1.7) : 2;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    (ctx.isActive || phase === "suspense") && phase !== "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[1500] pointer-events-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "absolute inset-0", animate: { boxShadow: [`inset 0 0 ${borderSize}px rgba(239, 68, 68, ${borderOpacity * 0.8})`, `inset 0 0 ${borderSize * 1.3}px rgba(239, 68, 68, ${borderOpacity})`, `inset 0 0 ${borderSize}px rgba(239, 68, 68, ${borderOpacity * 0.8})`] }, transition: { duration: pulseSpeed, repeat: Infinity, ease: "easeInOut" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "absolute inset-0", animate: { boxShadow: [`inset 0 0 ${borderSize * 2.5}px rgba(150, 0, 0, ${borderOpacity * 0.3})`, `inset 0 0 ${borderSize * 3}px rgba(150, 0, 0, ${borderOpacity * 0.5})`, `inset 0 0 ${borderSize * 2.5}px rgba(150, 0, 0, ${borderOpacity * 0.3})`] }, transition: { duration: pulseSpeed * 0.6, repeat: Infinity, ease: "easeInOut" } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: ctx.isActive && phase === "idle" && !showConfirm && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "fixed z-[1600] left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/90 border border-red-500/50 backdrop-blur-xl", style: { top: "calc(env(safe-area-inset-top, 0px) + 100px)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { animate: { scale: [1, 1.2, 1] }, transition: { duration: 1, repeat: Infinity }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-5 h-5 text-red-400" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-200 font-orbitron font-bold text-sm", children: "FINAL SHOOT" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/30", children: "|" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-cyan-300 font-bold text-sm", children: [
        ctx.remainingAttempts,
        " tentativi"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: ctx.deactivateFinalShoot, className: "ml-2 p-1 rounded-full hover:bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-5 h-5 text-white/60 hover:text-white" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: phase === "suspense" && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "fixed inset-0 z-[1600] flex items-center justify-center pointer-events-none px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-black/90 backdrop-blur-xl rounded-2xl p-6 border border-red-500/50 shadow-2xl shadow-red-500/30 w-full max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { className: "text-6xl sm:text-8xl font-orbitron font-black text-center mb-4", style: { color: `rgb(255, ${Math.floor(255 - progress * 200)}, ${Math.floor(255 - progress * 200)})`, textShadow: `0 0 ${30 + progress * 50}px rgba(255, 0, 0, ${0.5 + progress * 0.5})` }, animate: { scale: [1, 1.08, 1] }, transition: { duration: pulseSpeed * 0.4, repeat: Infinity }, children: [
        Math.floor(progress * 100),
        "%"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-4 bg-white/10 rounded-full overflow-hidden mb-4 border border-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all duration-100", style: { width: `${progress * 100}%`, background: `linear-gradient(90deg, #00ffff 0%, #ff00ff 50%, #ff0000 100%)`, boxShadow: `0 0 30px rgba(255, 0, 0, ${progress})` } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { className: "text-lg font-orbitron text-white text-center tracking-widest", animate: { opacity: [0.6, 1, 0.6] }, transition: { duration: 0.4, repeat: Infinity }, children: [
        progress < 0.25 && "◉ ANALISI...",
        progress >= 0.25 && progress < 0.5 && "◉◉ SCANSIONE...",
        progress >= 0.5 && progress < 0.75 && "◉◉◉ CALCOLO...",
        progress >= 0.75 && progress < 0.95 && "◉◉◉◉ QUASI...",
        progress >= 0.95 && "★★★ VERDETTO! ★★★"
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: phase === "result" && result && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-[2000] flex flex-col items-center justify-center pointer-events-none overflow-hidden", children: result.isWinner ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-full flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute inset-0",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.8 },
          style: {
            background: "radial-gradient(ellipse at center, rgba(255,215,0,0.4) 0%, rgba(218,165,32,0.3) 25%, rgba(139,69,19,0.2) 50%, rgba(0,0,0,0.95) 80%)"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 overflow-hidden", children: [...Array(24)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute w-1 bg-gradient-to-t from-transparent via-yellow-300/40 to-transparent",
          style: {
            height: "250%",
            left: "50%",
            top: "-75%",
            transformOrigin: "50% 100%",
            transform: `rotate(${i * 15}deg)`
          },
          initial: { opacity: 0, scaleY: 0 },
          animate: {
            opacity: [0, 0.6, 0.3, 0.6, 0],
            scaleY: [0, 1.2, 1, 1.2, 0]
          },
          transition: {
            duration: 4,
            delay: i * 0.05,
            repeat: Infinity,
            ease: "easeInOut"
          }
        },
        i
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", children: [...Array(40)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "absolute w-2 h-2 rounded-full",
          style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${["#FFD700", "#FFA500", "#FFDF00", "#F5DEB3"][i % 4]} 0%, transparent 70%)`,
            boxShadow: `0 0 ${10 + Math.random() * 10}px ${["#FFD700", "#FFA500"][i % 2]}`
          },
          animate: {
            y: [0, -100 - Math.random() * 200],
            x: [0, (Math.random() - 0.5) * 100],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.5, 1, 0]
          },
          transition: {
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: "easeOut"
          }
        },
        `particle-${i}`
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0, rotate: -180, y: 100 },
          animate: { scale: 1, rotate: 0, y: 0 },
          transition: { type: "spring", stiffness: 80, damping: 12, delay: 0.2 },
          className: "relative z-10 mb-8",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "absolute inset-0 -m-16 rounded-full",
                animate: {
                  boxShadow: [
                    "0 0 80px 40px rgba(255, 215, 0, 0.3)",
                    "0 0 120px 60px rgba(255, 215, 0, 0.5)",
                    "0 0 80px 40px rgba(255, 215, 0, 0.3)"
                  ]
                },
                transition: { duration: 2, repeat: Infinity }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "absolute -top-12 left-1/2 -translate-x-1/2",
                animate: { y: [0, -8, 0], rotate: [0, 5, -5, 0] },
                transition: { duration: 2, repeat: Infinity },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-20 h-20 text-yellow-400", style: { filter: "drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))" } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                animate: { scale: [1, 1.08, 1] },
                transition: { duration: 1.5, repeat: Infinity },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Trophy,
                  {
                    className: "w-44 h-44 sm:w-56 sm:h-56 text-yellow-400",
                    strokeWidth: 1,
                    style: {
                      filter: "drop-shadow(0 0 60px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 100px rgba(255, 165, 0, 0.7))"
                    }
                  }
                )
              }
            ),
            [...Array(8)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "absolute top-1/2 left-1/2",
                animate: {
                  rotate: [i * 45, i * 45 + 360]
                },
                transition: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                },
                style: { transformOrigin: "0 0" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    style: { transform: "translateX(120px) translateY(-50%)" },
                    animate: { scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] },
                    transition: { duration: 1.5, repeat: Infinity, delay: i * 0.15 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-6 h-6 text-yellow-300", style: { filter: "drop-shadow(0 0 10px #FFD700)" } })
                  }
                )
              },
              i
            ))
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 60 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.6, duration: 0.8 },
          className: "text-center z-10 px-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.h1,
              {
                className: "text-5xl sm:text-7xl md:text-8xl font-orbitron font-black mb-6 relative",
                style: {
                  background: "linear-gradient(90deg, #B8860B 0%, #FFD700 25%, #FFFFFF 50%, #FFD700 75%, #B8860B 100%)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 0 80px rgba(255, 215, 0, 0.5)"
                },
                animate: {
                  backgroundPosition: ["200% 0", "-200% 0"]
                },
                transition: { duration: 3, repeat: Infinity, ease: "linear" },
                children: "HAI VINTO!"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.8 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 1.2 },
                className: "space-y-4",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl sm:text-3xl text-white font-light", children: [
                    "🎖️ ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "COMPLIMENTI AGENTE!" }),
                    " 🎖️"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.p,
                    {
                      className: "text-xl sm:text-2xl font-orbitron",
                      style: {
                        background: "linear-gradient(90deg, #00FFFF, #00FF88)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      },
                      animate: { opacity: [0.7, 1, 0.7] },
                      transition: { duration: 2, repeat: Infinity },
                      children: "Hai trovato la posizione esatta del premio!"
                    }
                  )
                ]
              }
            )
          ]
        }
      )
    ] }) : (
      /* FAIL STATE - 🔧 FIX 26/01/2026: Mostra distanza formattata */
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-full flex flex-col items-center justify-center px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "absolute inset-0", style: { background: "radial-gradient(circle, rgba(80,0,0,0.4) 0%, rgba(0,0,0,0.95) 70%)" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: "spring", stiffness: 200 }, className: "mb-8 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { animate: { scale: [1, 0.95, 1] }, transition: { duration: 1, repeat: Infinity }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-36 h-36 sm:w-48 sm:h-48 text-red-500/40", strokeWidth: 1 }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "text-center z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl sm:text-6xl font-orbitron font-bold text-red-500 mb-6", style: { textShadow: "0 0 40px rgba(255, 0, 0, 0.5)" }, children: "MANCATO!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl sm:text-2xl text-white/80 mb-4", children: result.hint }),
          result.distance !== void 0 && result.distance > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg text-white/60 mb-3", children: [
            "Distanza dal target: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-amber-400", children: formatDistance(result.distance) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg sm:text-xl text-cyan-400 font-bold", children: [
            "Tentativi rimasti: ",
            ctx.remainingAttempts
          ] }),
          ctx.isTestMode && result.distance !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-2 rounded bg-black/50 border border-yellow-500/30 text-xs text-yellow-400 font-mono", children: [
            "[DEBUG] Raw distance: ",
            result.distance.toFixed(2),
            "m"
          ] })
        ] })
      ] })
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showConfirm && targetCoords && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-[2500] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4", onClick: cancelConfirm, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { scale: 0.8, y: 20 }, animate: { scale: 1, y: 0 }, exit: { scale: 0.8, y: 20 }, className: "p-6 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-cyan-500/30 shadow-xl max-w-sm w-full", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-full bg-red-500/20 border border-red-400/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-6 h-6 text-red-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-white font-orbitron", children: "CONFERMA SPARO" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/60", children: "Questa azione è irreversibile" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 rounded-lg bg-white/5 border border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-white/70", children: "Coordinate selezionate:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-white font-mono text-sm", children: [
          targetCoords.lat.toFixed(6),
          "°N, ",
          targetCoords.lng.toFixed(6),
          "°E"
        ] })
      ] }),
      ctx.pricing && ctx.pricing.cost_m1u > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mb-4 p-3 rounded-lg border ${ctx.pricing.tier === "elite" ? "bg-purple-500/10 border-purple-400/30" : "bg-amber-500/10 border-amber-400/30"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 rounded text-xs font-bold ${ctx.pricing.tier === "elite" ? "bg-purple-500 text-white" : "bg-amber-500 text-black"}`, children: ctx.pricing.tier === "elite" ? "💎 ELITE" : "⭐ PLUS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-white/70", children: [
            "Tentativo #",
            ctx.pricing.next_attempt_number
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `font-bold font-orbitron ${ctx.pricing.tier === "elite" ? "text-purple-400" : "text-amber-400"}`, children: [
          ctx.pricing.cost_m1u,
          " M1U"
        ] })
      ] }) }),
      ctx.pricing && ctx.pricing.cost_m1u === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-3 rounded-lg bg-green-500/10 border border-green-400/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded text-xs font-bold bg-green-500 text-white", children: "🆓 GRATUITO" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-green-400", children: [
          "Tentativo #",
          ctx.pricing.next_attempt_number,
          " di 3"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: cancelConfirm, className: "flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white font-medium hover:bg-white/10 active:scale-95 transition-all", children: "Annulla" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: confirmShoot, className: "flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 border border-red-400/50 text-white font-bold font-orbitron hover:from-red-500 hover:to-orange-500 active:scale-95 transition-all shadow-lg shadow-red-500/30", children: [
          "🎯 ",
          ctx.pricing && ctx.pricing.cost_m1u > 0 ? `SPARA (${ctx.pricing.cost_m1u} M1U)` : "SPARA!"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 text-center text-xs text-white/40", children: [
        "Tentativi rimasti: ",
        ctx.remainingAttempts
      ] })
    ] }) }) })
  ] });
};

export { FinalShootProvider as F, FinalShootOverlay as a, FinalShootPill as b, useFinalShootContext as u };
