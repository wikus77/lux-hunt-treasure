// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Daily Mission Content - REVOLUT STYLE
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Play, Check } from 'lucide-react';
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
import { calculatePhaseRewards } from '@/missions/missionsRegistry';

interface DailyMissionContentProps {
  mission: any;
  onClose: () => void;
  onComplete: () => void;
}

export const DailyMissionContent: React.FC<DailyMissionContentProps> = ({ 
  mission,
  onClose,
  onComplete
}) => {
  const [phase, setPhase] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedReward, setCompletedReward] = useState(0);
  const [completedPhase, setCompletedPhase] = useState<1 | 2>(1);

  const { phase1: phase1Reward, phase2: phase2Reward } = calculatePhaseRewards(mission.totalRewardM1U);

  const refreshState = useCallback(() => {
    const state = getMissionState();
    setPhase(state.phase);
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const isPhase2Ready = isPhase2Available();
  const isNotStarted = phase === 0;
  const isPhase1Active = phase === 1 && !isPhase2Ready;
  const isPhase2Pending = phase === 2 && !isPhase2Ready;

  const handleStartMission = async () => {
    startMission(mission.id);
    markBriefingShown();
    refreshState();
  };

  const handleCompletePhase1 = async () => {
    completePhase1();
    await creditM1USafe(phase1Reward, `Mission Phase 1: ${mission.id}`);
    markPhase1Credited();
    setCompletedReward(phase1Reward);
    setCompletedPhase(1);
    setShowCompletion(true);
    setTimeout(() => {
      setShowCompletion(false);
      onComplete();
    }, 2500);
  };

  const handleCompletePhase2 = async () => {
    completePhase2();
    await creditM1USafe(phase2Reward, `Mission Phase 2: ${mission.id}`);
    markPhase2Credited();
    setCompletedReward(phase2Reward);
    setCompletedPhase(2);
    setShowCompletion(true);
    setTimeout(() => {
      setShowCompletion(false);
      onComplete();
    }, 2500);
  };

  return (
    <div 
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
      }}
    >
      {/* HEADER - Gradiente verde/cyan */}
      <div 
        style={{
          flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 209, 255, 0.15) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
          paddingBottom: '16px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
          </button>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ 
              color: '#00FF88', 
              fontSize: '12px', 
              fontWeight: 600,
              letterSpacing: '1px',
              marginBottom: '4px',
            }}>
              DAILY MISSION
            </p>
            <h1 style={{ 
              color: '#FFFFFF', 
              fontSize: '18px', 
              fontWeight: 700,
            }}>
              {mission.title}
            </h1>
          </div>

          <div style={{ width: '40px' }} />
        </div>
      </div>

      {/* CONTENT */}
      <div 
        style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Mission Icon & Description */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>
            {mission.icon}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
            {mission.description}
          </p>
        </div>

        {/* NOT STARTED */}
        {isNotStarted && (
          <>
            <GlassCard style={{ marginBottom: '16px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
              <p style={{ color: '#00FF88', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                📍 PHASE 1 (OGGI): +{phase1Reward} M1U
              </p>
              <p style={{ color: '#FFD700', fontSize: '13px', fontWeight: 600, margin: 0 }}>
                🔄 PHASE 2 (DOMANI): +{phase2Reward} M1U
              </p>
            </GlassCard>
            <motion.button
              onClick={handleStartMission}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #00FF88, #00D1FF)',
                border: 'none',
                color: '#000',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <Play style={{ width: '20px', height: '20px' }} /> START MISSION
            </motion.button>
          </>
        )}

        {/* PHASE 1 ACTIVE */}
        {isPhase1Active && (
          <>
            <GlassCard style={{ marginBottom: '16px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
              <p style={{ color: '#00FF88', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                📍 PHASE 1 IN CORSO
              </p>
              <p style={{ color: '#FFFFFF', fontSize: '14px', margin: 0 }}>{mission.phase1.instruction}</p>
            </GlassCard>
            <motion.button
              onClick={handleCompletePhase1}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #00FF88, #00D1FF)',
                border: 'none',
                color: '#000',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Check style={{ width: '20px', height: '20px' }} /> COMPLETA PHASE 1 (+{phase1Reward} M1U)
            </motion.button>
          </>
        )}

        {/* PHASE 2 PENDING */}
        {isPhase2Pending && (
          <GlassCard style={{ textAlign: 'center', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
            <Clock style={{ width: '40px', height: '40px', color: '#FFD700', margin: '0 auto 12px' }} />
            <p style={{ color: '#FFD700', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              PHASE 2 SI SBLOCCA DOMANI
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>
              Torna domani per +{phase2Reward} M1U
            </p>
          </GlassCard>
        )}

        {/* PHASE 2 READY */}
        {isPhase2Ready && (
          <>
            <GlassCard style={{ marginBottom: '16px', background: 'rgba(255, 215, 0, 0.15)', border: '1px solid rgba(255, 215, 0, 0.4)' }}>
              <p style={{ color: '#FFD700', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                🔄 PHASE 2 PRONTA!
              </p>
              <p style={{ color: '#FFFFFF', fontSize: '14px', margin: 0 }}>{mission.phase2.instruction}</p>
            </GlassCard>
            <motion.button
              onClick={handleCompletePhase2}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                border: 'none',
                color: '#000',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
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
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0 }}>
            TOTAL REWARD: <span style={{ color: '#00FF88', fontWeight: 700 }}>{mission.totalRewardM1U} M1U</span>
          </p>
        </div>
      </div>

      {/* Completion Toast */}
      {showCompletion && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: 'rgba(25, 25, 35, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(0, 255, 136, 0.5)',
            borderRadius: '20px',
            padding: '20px 32px',
            textAlign: 'center',
            boxShadow: '0 0 50px rgba(0, 255, 136, 0.3)',
          }}
        >
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#00FF88', marginBottom: '8px' }}>
            {completedPhase === 1 ? '✅ PHASE 1 COMPLETE!' : '🎉 MISSION ACCOMPLISHED!'}
          </p>
          <p style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            background: 'linear-gradient(135deg, #00FF88, #00D1FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
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
    </div>
  );
};

// GLASS CARD
const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: 'rgba(25, 25, 35, 0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '14px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      ...style,
    }}
  >
    {children}
  </div>
);

export default DailyMissionContent;
