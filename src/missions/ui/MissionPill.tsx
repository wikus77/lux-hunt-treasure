/**
 * MISSION PILL - Standalone version for MapTiler3D
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Self-contained pill that manages its own state.
 * Mounted directly in MapTiler3D.tsx like BattlePill.
 * 
 * ROLLBACK: Set MISSIONS_ENABLED = false in missionsRegistry.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Clock, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { 
  MISSIONS_ENABLED, 
  getMissionOfTheDay,
  calculatePhaseRewards,
} from '../missionsRegistry';
import { 
  getMissionState, 
  startMission, 
  markBriefingShown,
  completePhase1,
  completePhase2,
  markPhase1Credited,
  markPhase2Credited,
  isPhase2Available,
  isBriefingShownToday,
} from '../missionState';
import { creditM1USafe } from '../rewards/creditM1U';
import '@/features/m1u/m1u-ui.css';

export function MissionPill() {
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
    
    // Wait a bit for auth to settle, then show
    const timer = setTimeout(() => {
      refreshState();
      setIsReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [refreshState]);

  // Refresh periodically when user is available
  useEffect(() => {
    if (!MISSIONS_ENABLED || !user || !isReady) return;
    
    const interval = setInterval(refreshState, 5000);
    return () => clearInterval(interval);
  }, [user, isReady, refreshState]);

  // Don't render if disabled or not ready or mission completed
  if (!MISSIONS_ENABLED) return null;
  if (!isReady) return null;
  if (phase === 3) return null;

  const isPhase2Ready = isPhase2Available();
  const isNotStarted = phase === 0;
  const isPhase1Active = phase === 1 && !isPhase2Ready;
  const isPhase2Pending = phase === 2 && !isPhase2Ready;

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
      {/* PILL */}
      <motion.button
        className="pill-orb fixed"
        style={{
          left: '16px',
          bottom: 'calc(env(safe-area-inset-bottom, 34px) + 170px)',
          zIndex: 9998,
        }}
        onClick={() => setShowModal(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        aria-label="Daily Mission"
      >
        {/* M1 Official Logo */}
        <img 
          src="/icons/icon-m1-192x192.png" 
          alt="M1" 
          style={{ 
            width: '24px', 
            height: '24px', 
            borderRadius: '4px',
            position: 'relative', 
            zIndex: 2 
          }} 
        />
        
        <span 
          className="dot" 
          style={{ 
            background: isPhase2Ready ? '#FFD700' : isNotStarted ? '#00FF96' : '#0ff', 
            boxShadow: `0 0 8px ${isPhase2Ready ? '#FFD700' : isNotStarted ? '#00FF96' : '#0ff'}` 
          }} 
        />
        
        <Badge
          className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[8px] font-bold border-2 border-background"
          style={{
            background: isNotStarted
              ? 'linear-gradient(135deg, #00FF96, #00CC77)'
              : isPhase2Ready 
                ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                : 'linear-gradient(135deg, #00D1FF, #0099CC)',
            color: isNotStarted || isPhase2Ready ? '#000' : '#fff',
          }}
        >
          {isNotStarted ? '!' : isPhase2Ready ? 'P2' : 'P1'}
        </Badge>
      </motion.button>

      {/* MODAL */}
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
                maxWidth: '340px',
                maxHeight: '80vh',
                overflowY: 'auto',
                background: 'linear-gradient(145deg, rgba(10,20,40,0.98), rgba(20,30,50,0.95))',
                borderRadius: '20px',
                border: '2px solid rgba(0,209,255,0.4)',
                padding: '20px',
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '40px' }}>{mission.icon}</span>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '8px 0 4px' }}>
                  {mission.title}
                </h2>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                  {mission.description}
                </p>
              </div>

              {/* NOT STARTED */}
              {isNotStarted && (
                <>
                  <div style={{ background: 'rgba(0,255,150,0.1)', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#00FF96', fontWeight: 600, margin: 0 }}>
                      📍 PHASE 1 TODAY: +{phase1Reward} M1U
                    </p>
                    <p style={{ fontSize: '11px', color: '#FFD700', fontWeight: 600, margin: '4px 0 0' }}>
                      🔄 PHASE 2 TOMORROW: +{phase2Reward} M1U
                    </p>
                  </div>
                  <button
                    onClick={handleStartMission}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #00FF96, #00CC77)',
                      border: 'none',
                      color: '#000',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Play size={18} /> START MISSION
                  </button>
                </>
              )}

              {/* PHASE 1 ACTIVE */}
              {isPhase1Active && (
                <>
                  <div style={{ background: 'rgba(0,209,255,0.1)', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#00D1FF', fontWeight: 600, margin: 0 }}>
                      📍 PHASE 1 IN PROGRESS
                    </p>
                    <p style={{ fontSize: '12px', color: '#fff', margin: '4px 0' }}>{mission.phase1.instruction}</p>
                  </div>
                  <button
                    onClick={handleCompletePhase1}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #00D1FF, #0099CC)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✓ COMPLETE PHASE 1 (+{phase1Reward} M1U)
                  </button>
                </>
              )}

              {/* PHASE 2 PENDING (wait for tomorrow) */}
              {isPhase2Pending && (
                <div style={{ background: 'rgba(255,200,0,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <Clock size={30} color="#FFD700" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px', color: '#FFD700', fontWeight: 600, margin: 0 }}>
                    PHASE 2 UNLOCKS TOMORROW
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
                    Return to claim +{phase2Reward} M1U
                  </p>
                </div>
              )}

              {/* PHASE 2 READY */}
              {isPhase2Ready && (
                <>
                  <div style={{ background: 'rgba(255,200,0,0.1)', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#FFD700', fontWeight: 600, margin: 0 }}>
                      🔄 PHASE 2 READY!
                    </p>
                    <p style={{ fontSize: '12px', color: '#fff', margin: '4px 0' }}>{mission.phase2.instruction}</p>
                  </div>
                  <button
                    onClick={handleCompletePhase2}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                      border: 'none',
                      color: '#000',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🎉 COMPLETE PHASE 2 (+{phase2Reward} M1U)
                  </button>
                </>
              )}

              {/* Close button */}
              <p 
                onClick={() => setShowModal(false)}
                style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '12px', cursor: 'pointer' }}
              >
                Close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPLETION TOAST */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setShowCompletion(false)}
            style={{
              position: 'fixed',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10004,
              background: 'linear-gradient(135deg, rgba(0,40,20,0.95), rgba(0,60,30,0.9))',
              border: '2px solid rgba(0,255,150,0.5)',
              borderRadius: '16px',
              padding: '16px 24px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#00FF96', margin: 0 }}>
              {completedPhase === 1 ? '✅ PHASE 1 COMPLETE!' : '🎉 MISSION ACCOMPLISHED!'}
            </p>
            <p style={{ fontSize: '20px', fontWeight: 800, color: '#00FF96', margin: '4px 0' }}>
              +{completedReward} M1U
            </p>
            {completedPhase === 1 && (
              <p style={{ fontSize: '11px', color: '#FFD700', margin: 0 }}>
                Return tomorrow for Phase 2!
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

