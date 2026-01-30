/**
 * M1SSION™ Next Action Container
 * Unified expandable container for primary actions on Home
 * GREEN GLASS STYLE - Single collapsible container with priority hierarchy
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Map, 
  Zap, 
  Brain, 
  Target,
  ChevronRight,
  Clock,
  Play,
  X,
  Check,
  Gift,
  AlertTriangle
} from 'lucide-react';
import { useLocation } from 'wouter';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/use-auth';
import { GLASS_PRESETS, M1SSION_COLORS } from './glassPresets';
import { useMissionStatus } from '@/hooks/useMissionStatus';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { track } from '@/lib/analytics';
import { 
  MISSIONS_ENABLED, 
  getMissionOfTheDay,
  calculatePhaseRewards,
} from '@/missions/missionsRegistry';
import { 
  getMissionState, 
  startMission, 
  markBriefingShown,
  completePhase1,
  completePhase2,
  markPhase1Credited,
  markPhase2Credited,
  isPhase2Available,
} from '@/missions/missionState';
import { creditM1USafe } from '@/missions/rewards/creditM1U';

interface NextActionContainerProps {
  className?: string;
}

export const NextActionContainer: React.FC<NextActionContainerProps> = ({ className = '' }) => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 🔧 FIX 28/01/2026: Dynamic priority data sources
  const { missionStatus } = useMissionStatus();
  const { dailyBuzzCounter } = useBuzzCounter(user?.id);
  
  // Daily Mission state
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [missionPhase, setMissionPhase] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedReward, setCompletedReward] = useState(0);
  const [completedPhase, setCompletedPhase] = useState<1 | 2>(1);
  const [isMissionReady, setIsMissionReady] = useState(false);

  const mission = MISSIONS_ENABLED ? getMissionOfTheDay() : null;
  const { phase1: phase1Reward, phase2: phase2Reward } = mission 
    ? calculatePhaseRewards(mission.totalRewardM1U) 
    : { phase1: 0, phase2: 0 };

  // Use SUCCESS (green) preset
  const preset = GLASS_PRESETS.success;
  
  // 🎯 STEP 1: Dynamic priority calculation
  const daysRemaining = missionStatus?.daysRemaining ?? null;
  const isUrgent = daysRemaining !== null && daysRemaining <= 3;
  const buzzUsedToday = dailyBuzzCounter > 0;

  // Mission state refresh
  const refreshMissionState = useCallback(() => {
    if (!MISSIONS_ENABLED) return;
    const state = getMissionState();
    setMissionPhase(state.phase);
  }, []);

  useEffect(() => {
    if (!MISSIONS_ENABLED) return;
    const timer = setTimeout(() => {
      refreshMissionState();
      setIsMissionReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [refreshMissionState]);

  useEffect(() => {
    if (!MISSIONS_ENABLED || !user || !isMissionReady) return;
    const interval = setInterval(refreshMissionState, 5000);
    return () => clearInterval(interval);
  }, [user, isMissionReady, refreshMissionState]);

  // Mission handlers
  const handleStartMission = async () => {
    if (!mission) return;
    startMission(mission.id);
    markBriefingShown();
    refreshMissionState();
    setShowMissionModal(false);
  };

  const handleCompletePhase1 = async () => {
    completePhase1();
    await creditM1USafe(phase1Reward, `Mission Phase 1: ${mission?.id}`);
    markPhase1Credited();
    setCompletedReward(phase1Reward);
    setCompletedPhase(1);
    setShowCompletion(true);
    refreshMissionState();
    setShowMissionModal(false);
  };

  const handleCompletePhase2 = async () => {
    completePhase2();
    await creditM1USafe(phase2Reward, `Mission Phase 2: ${mission?.id}`);
    markPhase2Credited();
    setCompletedReward(phase2Reward);
    setCompletedPhase(2);
    setShowCompletion(true);
    refreshMissionState();
    setShowMissionModal(false);
  };

  const isPhase2Ready = isPhase2Available();
  const isMissionNotStarted = missionPhase === 0;
  const isPhase1Active = missionPhase === 1 && !isPhase2Ready;
  const isPhase2Pending = missionPhase === 2 && !isPhase2Ready;
  const isMissionCompleted = missionPhase === 3;

  // 🎯 STEP 1: Dynamic priority calculation with useMemo
  // Rules:
  // - If mission urgent (<=3 days): Explore gets "urgent" emphasis
  // - If buzzUsedToday: Buzz is demoted below Oracle
  // - Default ordering: Explore > Buzz > Oracle > Daily
  const orderedActions = useMemo(() => {
    const baseActions = [
      {
        id: 'map',
        priority: isUrgent ? 100 : 90, // Highest priority, boosted if urgent
        label: 'Esplora / Riduci area',
        description: isUrgent ? '⚠️ Tempo quasi scaduto!' : 'Avvicinati al premio',
        icon: <Map className="w-5 h-5" />,
        path: '/map-3d-tiler',
        color: isUrgent ? '#FF4444' : '#FF4444',
        bgColor: isUrgent ? 'rgba(255, 68, 68, 0.25)' : 'rgba(255, 68, 68, 0.15)',
        borderColor: isUrgent ? 'rgba(255, 68, 68, 0.6)' : 'rgba(255, 68, 68, 0.4)',
        isUrgent,
      },
      {
        id: 'buzz',
        priority: buzzUsedToday ? 60 : 80, // Demote if already used today
        label: 'Usa Buzz',
        description: buzzUsedToday ? `Già usato oggi (${dailyBuzzCounter}x)` : 'Ottieni nuovi indizi',
        icon: <Zap className="w-5 h-5" />,
        path: '/buzz',
        color: '#FFD700',
        bgColor: buzzUsedToday ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255, 215, 0, 0.12)',
        borderColor: buzzUsedToday ? 'rgba(255, 215, 0, 0.25)' : 'rgba(255, 215, 0, 0.35)',
        isUrgent: false,
      },
      {
        id: 'aion',
        priority: 70, // Middle priority, promoted if Buzz demoted
        label: 'Chiedi all\'Oracolo',
        description: 'Analizza la situazione',
        icon: <Brain className="w-5 h-5" />,
        path: '/intelligence',
        color: '#00D1FF',
        bgColor: 'rgba(0, 209, 255, 0.1)',
        borderColor: 'rgba(0, 209, 255, 0.3)',
        isUrgent: false,
      },
    ];
    
    // Sort by priority (highest first)
    return baseActions.sort((a, b) => b.priority - a.priority);
  }, [isUrgent, buzzUsedToday, dailyBuzzCounter]);
  
  // Compute primary action for analytics
  const primaryAction = orderedActions[0]?.id || 'explore';
  
  // 🎯 STEP 3: Analytics - track expand/collapse
  const handleToggleExpand = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    // Track event
    track(newExpanded ? 'next_action_expand' : 'next_action_collapse', {
      screen: 'home',
      expanded: newExpanded,
      primary_action: primaryAction,
      days_left: daysRemaining,
      is_urgent: isUrgent,
    });
  }, [isExpanded, primaryAction, daysRemaining, isUrgent]);
  
  // 🎯 STEP 3: Analytics - track action clicks
  const handleActionClick = useCallback((actionId: string, path: string) => {
    // Map action ID to event name
    const eventMap: Record<string, 'next_action_explore_click' | 'next_action_buzz_click' | 'next_action_oracle_click'> = {
      'map': 'next_action_explore_click',
      'buzz': 'next_action_buzz_click',
      'aion': 'next_action_oracle_click',
    };
    
    const eventName = eventMap[actionId];
    if (eventName) {
      track(eventName, {
        screen: 'home',
        primary_action: primaryAction,
        days_left: daysRemaining,
        is_urgent: isUrgent,
        clicked_action: actionId,
      });
    }
    
    navigate(path);
  }, [navigate, primaryAction, daysRemaining, isUrgent]);
  
  // 🎯 STEP 3: Analytics - track daily mission click
  const handleDailyMissionClick = useCallback(() => {
    track('daily_mission_click_from_next_action', {
      screen: 'home',
      primary_action: primaryAction,
      days_left: daysRemaining,
      is_urgent: isUrgent,
      mission_phase: missionPhase,
    });
    
    setShowMissionModal(true);
  }, [primaryAction, daysRemaining, isUrgent, missionPhase]);

  // Get mission status text
  const getMissionStatusText = () => {
    if (!MISSIONS_ENABLED || !isMissionReady || isMissionCompleted) return null;
    if (isMissionNotStarted) return 'Nuova missione!';
    if (isPhase1Active) return 'P1 attiva';
    if (isPhase2Pending) return 'P2 domani';
    if (isPhase2Ready) return 'P2 pronta!';
    return null;
  };

  const missionStatusText = getMissionStatusText();

  return (
    <>
      <motion.div
        className={`w-full ${className}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-full rounded-2xl overflow-hidden relative backdrop-blur-xl"
          style={{
            background: preset.background,
            border: preset.border,
            boxShadow: preset.boxShadow,
          }}
        >
          {/* Ambient glow effect */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${preset.glowColor} 0%, transparent 60%)`,
            }}
          />

          {/* Header - Always visible, clickable to expand */}
          <motion.button
            onClick={handleToggleExpand}
            className="w-full relative flex items-center justify-between p-4"
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-3">
              {/* Icon with glow */}
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${M1SSION_COLORS.green} 0%, ${M1SSION_COLORS.cyan} 100%)`,
                  boxShadow: `0 4px 20px ${preset.glowColor}`,
                }}
              >
                <Target className="w-5 h-5 text-black" />
              </div>
              
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p 
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ 
                      color: isUrgent ? '#FF4444' : preset.textColor,
                      textShadow: `0 0 15px ${isUrgent ? 'rgba(255, 68, 68, 0.5)' : preset.glowColor}`,
                    }}
                  >
                    🎯 PROSSIMA AZIONE
                  </p>
                  {isUrgent && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 animate-pulse">
                      URGENTE
                    </span>
                  )}
                </div>
                <p className="text-white/70 text-xs">
                  {isExpanded ? 'Scegli cosa fare' : isUrgent ? `Solo ${daysRemaining} giorni rimasti!` : 'Tocca per espandere'}
                </p>
              </div>
            </div>

            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: `${preset.textColor}15`,
                border: `1px solid ${preset.textColor}30`,
              }}
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown 
                className="w-4 h-4" 
                style={{ color: preset.textColor }}
              />
            </motion.div>
          </motion.button>

          {/* Expandable content with smooth spring animation */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ 
                  height: {
                    type: 'spring',
                    stiffness: 200,
                    damping: 30,
                    mass: 1
                  },
                  opacity: { 
                    duration: 0.25,
                    ease: 'easeInOut'
                  }
                }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {/* Divider */}
                  <div 
                    className="w-full h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${preset.textColor}40, transparent)` }}
                  />

                  {/* Primary Actions - Dynamically ordered */}
                  {orderedActions.map((action, index) => (
                    <motion.button
                      key={action.id}
                      onClick={() => handleActionClick(action.id, action.path)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        action.isUrgent ? 'ring-1 ring-red-500/50' : ''
                      }`}
                      style={{
                        background: action.bgColor,
                        border: `1px solid ${action.borderColor}`,
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: `0 0 20px ${action.borderColor}`,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Priority indicator */}
                      <div 
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          action.isUrgent ? 'animate-pulse' : ''
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${action.color}30, ${action.color}10)`,
                          border: `1px solid ${action.color}50`,
                        }}
                      >
                        <span style={{ color: action.color }}>{action.icon}</span>
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-sm">
                            {action.label}
                          </p>
                          {action.isUrgent && index === 0 && (
                            <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
                          )}
                        </div>
                        <p className={`text-xs ${action.isUrgent ? 'text-red-400/80' : 'text-white/50'}`}>
                          {action.description}
                        </p>
                      </div>

                      <ChevronRight 
                        className="w-4 h-4 flex-shrink-0" 
                        style={{ color: action.color }}
                      />
                    </motion.button>
                  ))}

                  {/* Daily Mission Section - Visually separated */}
                  {MISSIONS_ENABLED && isMissionReady && !isMissionCompleted && mission && (
                    <>
                      {/* Section divider with label */}
                      <div className="flex items-center gap-2 pt-2">
                        <div 
                          className="flex-1 h-px"
                          style={{ background: 'rgba(255,255,255,0.1)' }}
                        />
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium px-2">
                          Azioni opzionali di oggi
                        </span>
                        <div 
                          className="flex-1 h-px"
                          style={{ background: 'rgba(255,255,255,0.1)' }}
                        />
                      </div>

                      {/* Daily Mission Card */}
                      <motion.button
                        onClick={handleDailyMissionClick}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                        style={{
                          background: 'rgba(0, 30, 50, 0.6)',
                          border: '1px solid rgba(0, 209, 255, 0.25)',
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: '0 0 20px rgba(0, 209, 255, 0.2)',
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Mission Icon */}
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #00D1FF30, #00D1FF10)',
                            border: '1px solid rgba(0, 209, 255, 0.4)',
                          }}
                        >
                          <span className="text-sm">{mission.icon}</span>
                        </div>
                        
                        <div className="flex-1 text-left">
                          <p className="text-white font-semibold text-sm">
                            Daily Mission
                          </p>
                          <p className="text-white/50 text-xs truncate">
                            {mission.title}
                          </p>
                        </div>

                        {/* Status badge */}
                        {missionStatusText && (
                          <div 
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0"
                            style={{
                              background: isMissionNotStarted 
                                ? 'rgba(0, 255, 150, 0.2)' 
                                : isPhase2Ready 
                                  ? 'rgba(255, 215, 0, 0.2)' 
                                  : 'rgba(0, 209, 255, 0.2)',
                              color: isMissionNotStarted 
                                ? '#00FF96' 
                                : isPhase2Ready 
                                  ? '#FFD700' 
                                  : '#00D1FF',
                            }}
                          >
                            {missionStatusText}
                          </div>
                        )}

                        <ChevronRight 
                          className="w-4 h-4 flex-shrink-0 text-cyan-400/60" 
                        />
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Daily Mission Modal - Same as DailyMissionCard */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showMissionModal && mission && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMissionModal(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10003,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '480px',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  background: 'linear-gradient(145deg, rgba(0, 40, 40, 0.98), rgba(0, 60, 60, 0.95))',
                  borderRadius: '28px',
                  border: '2px solid rgba(0, 255, 136, 0.5)',
                  boxShadow: '0 0 60px rgba(0, 255, 136, 0.3), 0 12px 40px rgba(0, 0, 0, 0.6)',
                  position: 'relative',
                }}
              >
                {/* Ambient glow */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 255, 136, 0.15) 0%, transparent 60%)',
                  pointerEvents: 'none',
                  borderRadius: '28px',
                }} />

                {/* Close button */}
                <button
                  onClick={() => setShowMissionModal(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                >
                  <X size={20} />
                </button>

                {/* Content */}
                <div style={{ padding: '32px', position: 'relative' }}>
                  {/* Header */}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div 
                      style={{ 
                        fontSize: '56px', 
                        marginBottom: '12px',
                        filter: 'drop-shadow(0 0 20px rgba(0, 255, 136, 0.5))',
                      }}
                    >
                      {mission.icon}
                    </div>
                    <p 
                      style={{ 
                        fontSize: '12px', 
                        color: '#00FF88', 
                        fontWeight: 600, 
                        textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                        marginBottom: '8px',
                      }}
                    >
                      DAILY MISSION
                    </p>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                      {mission.title}
                    </h2>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                      {mission.description}
                    </p>
                  </div>

                  {/* NOT STARTED */}
                  {isMissionNotStarted && (
                    <>
                      <div style={{ 
                        background: 'rgba(0, 255, 136, 0.1)', 
                        borderRadius: '16px', 
                        padding: '16px', 
                        marginBottom: '16px',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                      }}>
                        <p style={{ fontSize: '13px', color: '#00FF88', fontWeight: 600, margin: '0 0 8px' }}>
                          📍 PHASE 1 (OGGI): +{phase1Reward} M1U
                        </p>
                        <p style={{ fontSize: '13px', color: '#FFD700', fontWeight: 600, margin: 0 }}>
                          🔄 PHASE 2 (DOMANI): +{phase2Reward} M1U
                        </p>
                      </div>
                      <motion.button
                        onClick={handleStartMission}
                        whileHover={{ scale: 1.02, boxShadow: '0 6px 35px rgba(0, 255, 136, 0.6)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          width: '100%',
                          padding: '16px',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #00FF88 0%, #00D1FF 100%)',
                          border: 'none',
                          color: '#000',
                          fontSize: '16px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: '0 4px 25px rgba(0, 255, 136, 0.4)',
                        }}
                      >
                        <Play size={20} /> START MISSION
                      </motion.button>
                    </>
                  )}

                  {/* PHASE 1 ACTIVE */}
                  {isPhase1Active && (
                    <>
                      <div style={{ 
                        background: 'rgba(0, 255, 136, 0.1)', 
                        borderRadius: '16px', 
                        padding: '16px', 
                        marginBottom: '16px',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                      }}>
                        <p style={{ fontSize: '12px', color: '#00FF88', fontWeight: 600, margin: '0 0 8px' }}>
                          📍 PHASE 1 IN CORSO
                        </p>
                        <p style={{ fontSize: '14px', color: '#fff', margin: 0 }}>{mission.phase1.instruction}</p>
                      </div>
                      <motion.button
                        onClick={handleCompletePhase1}
                        whileHover={{ scale: 1.02, boxShadow: '0 6px 35px rgba(0, 255, 136, 0.6)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          width: '100%',
                          padding: '16px',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #00FF88 0%, #00D1FF 100%)',
                          border: 'none',
                          color: '#000',
                          fontSize: '16px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 25px rgba(0, 255, 136, 0.4)',
                        }}
                      >
                        <Check size={20} /> COMPLETA PHASE 1 (+{phase1Reward} M1U)
                      </motion.button>
                    </>
                  )}

                  {/* PHASE 2 PENDING */}
                  {isPhase2Pending && (
                    <div style={{ 
                      background: 'rgba(255, 215, 0, 0.1)', 
                      borderRadius: '16px', 
                      padding: '24px', 
                      textAlign: 'center',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                    }}>
                      <Clock size={40} color="#FFD700" style={{ marginBottom: '12px' }} />
                      <p style={{ fontSize: '16px', color: '#FFD700', fontWeight: 600, margin: '0 0 8px' }}>
                        PHASE 2 SI SBLOCCA DOMANI
                      </p>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                        Torna domani per +{phase2Reward} M1U
                      </p>
                    </div>
                  )}

                  {/* PHASE 2 READY */}
                  {isPhase2Ready && (
                    <>
                      <div style={{ 
                        background: 'rgba(255, 215, 0, 0.15)', 
                        borderRadius: '16px', 
                        padding: '16px', 
                        marginBottom: '16px',
                        border: '1px solid rgba(255, 215, 0, 0.4)',
                      }}>
                        <p style={{ fontSize: '12px', color: '#FFD700', fontWeight: 600, margin: '0 0 8px' }}>
                          🔄 PHASE 2 PRONTA!
                        </p>
                        <p style={{ fontSize: '14px', color: '#fff', margin: 0 }}>{mission.phase2.instruction}</p>
                      </div>
                      <motion.button
                        onClick={handleCompletePhase2}
                        whileHover={{ scale: 1.02, boxShadow: '0 6px 35px rgba(255, 215, 0, 0.6)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          width: '100%',
                          padding: '16px',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          border: 'none',
                          color: '#000',
                          fontSize: '16px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 25px rgba(255, 215, 0, 0.4)',
                        }}
                      >
                        🎉 COMPLETA PHASE 2 (+{phase2Reward} M1U)
                      </motion.button>
                    </>
                  )}

                  {/* Total reward reminder */}
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '12px', 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.05)',
                    textAlign: 'center',
                  }}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                      TOTAL REWARD: <span style={{ color: '#00FF88', fontWeight: 700 }}>{mission.totalRewardM1U} M1U</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Completion Toast */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showCompletion && (
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              onClick={() => setShowCompletion(false)}
              style={{
                position: 'fixed',
                bottom: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10004,
                background: 'linear-gradient(145deg, rgba(0, 40, 40, 0.98), rgba(0, 60, 60, 0.95))',
                border: '2px solid rgba(0, 255, 136, 0.5)',
                borderRadius: '20px',
                padding: '20px 32px',
                textAlign: 'center',
                boxShadow: '0 0 50px rgba(0, 255, 136, 0.3)',
              }}
            >
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#00FF88', margin: '0 0 8px' }}>
                {completedPhase === 1 ? '✅ PHASE 1 COMPLETE!' : '🎉 MISSION ACCOMPLISHED!'}
              </p>
              <p style={{ 
                fontSize: '28px', 
                fontWeight: 800, 
                background: 'linear-gradient(135deg, #00FF88, #00D1FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: '0 0 8px',
              }}>
                +{completedReward} M1U
              </p>
              {completedPhase === 1 && (
                <p style={{ fontSize: '12px', color: '#FFD700', margin: 0 }}>
                  Torna domani per Phase 2!
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default NextActionContainer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
