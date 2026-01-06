/**
 * M1SSION™ Daily Mission Card
 * Shows daily mission status on Home - CYAN NEON style
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Target, Clock, Play, X, Check } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
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
import { GLASS_PRESETS, M1SSION_COLORS } from './glassPresets';

interface DailyMissionCardProps {
  className?: string;
}

// Cyan neon preset
const CYAN_PRESET = {
  background: 'linear-gradient(145deg, rgba(0, 30, 50, 0.95), rgba(0, 50, 80, 0.9))',
  border: '2px solid rgba(0, 209, 255, 0.5)',
  boxShadow: '0 0 40px rgba(0, 209, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
  textColor: '#00D1FF',
  glowColor: 'rgba(0, 209, 255, 0.3)',
};

export const DailyMissionCard: React.FC<DailyMissionCardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [phase, setPhase] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedReward, setCompletedReward] = useState(0);
  const [completedPhase, setCompletedPhase] = useState<1 | 2>(1);
  const [isReady, setIsReady] = useState(false);

  const mission = getMissionOfTheDay();
  const { phase1: phase1Reward, phase2: phase2Reward } = calculatePhaseRewards(mission.totalRewardM1U);

  // Refresh state
  const refreshState = useCallback(() => {
    const state = getMissionState();
    setPhase(state.phase);
  }, []);

  // Initialize after mount
  useEffect(() => {
    if (!MISSIONS_ENABLED) return;
    
    const timer = setTimeout(() => {
      refreshState();
      setIsReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [refreshState]);

  // Refresh periodically
  useEffect(() => {
    if (!MISSIONS_ENABLED || !user || !isReady) return;
    
    const interval = setInterval(refreshState, 5000);
    return () => clearInterval(interval);
  }, [user, isReady, refreshState]);

  // Don't render if disabled
  if (!MISSIONS_ENABLED) return null;
  if (!isReady) return null;
  if (phase === 3) return null; // Mission completed

  const isPhase2Ready = isPhase2Available();
  const isNotStarted = phase === 0;
  const isPhase1Active = phase === 1 && !isPhase2Ready;
  const isPhase2Pending = phase === 2 && !isPhase2Ready;

  // Get status text
  const getStatusText = () => {
    if (isNotStarted) return 'Nuova missione disponibile!';
    if (isPhase1Active) return 'Phase 1 in corso...';
    if (isPhase2Pending) return 'Phase 2 domani';
    if (isPhase2Ready) return 'Phase 2 pronta!';
    return 'Missione attiva';
  };

  const handleStartMission = async () => {
    startMission(mission.id);
    markBriefingShown();
    refreshState();
    setShowModal(false);
  };

  const handleCompletePhase1 = async () => {
    completePhase1();
    await creditM1USafe(phase1Reward, `Mission Phase 1: ${mission.id}`);
    markPhase1Credited();
    setCompletedReward(phase1Reward);
    setCompletedPhase(1);
    setShowCompletion(true);
    refreshState();
    setShowModal(false);
  };

  const handleCompletePhase2 = async () => {
    completePhase2();
    await creditM1USafe(phase2Reward, `Mission Phase 2: ${mission.id}`);
    markPhase2Credited();
    setCompletedReward(phase2Reward);
    setCompletedPhase(2);
    setShowCompletion(true);
    refreshState();
    setShowModal(false);
  };

  return (
    <>
      {/* CARD - Cyan Neon Style */}
      <motion.div
        className={`flex-1 min-w-0 ${className}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <motion.button
          onClick={() => setShowModal(true)}
          className="w-full rounded-2xl overflow-hidden relative backdrop-blur-xl"
          style={{
            background: CYAN_PRESET.background,
            border: CYAN_PRESET.border,
            boxShadow: CYAN_PRESET.boxShadow,
          }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 0 60px rgba(0, 209, 255, 0.5), 0 8px 40px rgba(0, 0, 0, 0.6)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Ambient glow */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${CYAN_PRESET.glowColor} 0%, transparent 60%)`,
            }}
          />
          
          <div className="relative flex items-center p-4 gap-3">
            {/* Icon */}
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #00D1FF 0%, #0099FF 100%)',
                boxShadow: '0 4px 20px rgba(0, 209, 255, 0.4)',
              }}
            >
              <span className="text-lg">{mission.icon}</span>
            </div>
            
            {/* Content */}
            <div className="flex-1 text-left min-w-0">
              <p 
                className="text-xs font-bold mb-0.5 uppercase tracking-wider"
                style={{ 
                  color: CYAN_PRESET.textColor,
                  textShadow: '0 0 15px rgba(0, 209, 255, 0.5)',
                }}
              >
                🎯 DAILY MISSION
              </p>
              <p className="text-white font-bold text-sm truncate">
                {mission.title}
              </p>
              <p className="text-white/60 text-xs truncate">
                {getStatusText()}
              </p>
            </div>
            
            {/* Badge + Arrow */}
            <div className="flex-shrink-0 flex items-center gap-2">
              {/* Status badge */}
              <div 
                className="px-2 py-1 rounded-lg text-xs font-bold"
                style={{
                  background: isNotStarted ? 'rgba(0, 255, 150, 0.2)' : isPhase2Ready ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 209, 255, 0.2)',
                  color: isNotStarted ? '#00FF96' : isPhase2Ready ? '#FFD700' : '#00D1FF',
                }}
              >
                {isNotStarted ? 'NEW' : isPhase2Ready ? 'P2!' : 'P1'}
              </div>
              
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(0, 209, 255, 0.15)',
                  border: '1px solid rgba(0, 209, 255, 0.3)',
                }}
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronRight className="w-4 h-4" style={{ color: CYAN_PRESET.textColor }} />
              </motion.div>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* MODAL - GREEN GLASS STYLE (Feature Flag Style) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
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
                  onClick={() => setShowModal(false)}
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
                  {isNotStarted && (
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

      {/* COMPLETION TOAST */}
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

export default DailyMissionCard;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

