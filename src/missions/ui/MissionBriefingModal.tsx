/**
 * MISSION BRIEFING MODAL
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Shows daily mission details and allows user to start.
 * Fully responsive, centered, safe-area aware.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { type MissionDefinition, calculatePhaseRewards } from '../missionsRegistry';

interface MissionBriefingModalProps {
  mission: MissionDefinition;
  isOpen: boolean;
  onStart: () => void;
  onDismiss: () => void;
}

export default function MissionBriefingModal({
  mission,
  isOpen,
  onStart,
  onDismiss,
}: MissionBriefingModalProps) {
  const { phase1, phase2 } = calculatePhaseRewards(mission.totalRewardM1U);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10003,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            paddingTop: 'calc(env(safe-area-inset-top, 16px) + 16px)',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onDismiss}
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
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.3), 0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
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
            
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              background: 'linear-gradient(145deg, rgba(0, 40, 40, 0.98), rgba(0, 60, 60, 0.95))',
              zIndex: 1,
              borderRadius: '28px 28px 0 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '40px', filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))' }}>{mission.icon}</span>
                <div>
                  <p style={{ fontSize: '11px', color: '#00FF88', fontWeight: 600, margin: 0, textShadow: '0 0 10px rgba(0, 255, 136, 0.5)' }}>
                    DAILY MISSION
                  </p>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {mission.title}
                  </h2>
                </div>
              </div>
              <button 
                onClick={onDismiss} 
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  border: 'none', 
                  color: '#fff', 
                  cursor: 'pointer',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '20px' }}>
                {mission.description}
              </p>

              {/* Phases */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  background: 'rgba(0, 209, 255, 0.1)',
                  border: '1px solid rgba(0, 209, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '12px',
                }}>
                  <p style={{ fontSize: '11px', color: '#00D1FF', fontWeight: 600, marginBottom: '4px', margin: 0 }}>
                    📍 PHASE 1 (TODAY)
                  </p>
                  <p style={{ fontSize: '13px', color: '#fff', margin: '4px 0' }}>{mission.phase1.instruction}</p>
                  <p style={{ fontSize: '12px', color: '#00FF96', marginTop: '6px', margin: '6px 0 0 0' }}>
                    +{phase1} M1U
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255, 200, 0, 0.1)',
                  border: '1px solid rgba(255, 200, 0, 0.3)',
                  borderRadius: '12px',
                  padding: '12px',
                }}>
                  <p style={{ fontSize: '11px', color: '#FFD700', fontWeight: 600, marginBottom: '4px', margin: 0 }}>
                    🔄 PHASE 2 (TOMORROW)
                  </p>
                  <p style={{ fontSize: '13px', color: '#fff', margin: '4px 0' }}>{mission.phase2.instruction}</p>
                  <p style={{ fontSize: '12px', color: '#00FF96', marginTop: '6px', margin: '6px 0 0 0' }}>
                    +{phase2} M1U
                  </p>
                </div>
              </div>

              {/* Total Reward */}
              <div style={{
                background: 'rgba(0, 255, 150, 0.1)',
                border: '1px solid rgba(0, 255, 150, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '20px',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>TOTAL REWARD</p>
                <p style={{ fontSize: '24px', fontWeight: 800, color: '#00FF96', margin: '4px 0 0 0' }}>
                  {mission.totalRewardM1U} M1U
                </p>
              </div>

              {/* CTA */}
              <motion.button
                onClick={onStart}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 30px rgba(0, 255, 136, 0.5)' }}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #00FF88 0%, #00D1FF 100%)',
                  border: 'none',
                  color: '#000',
                  fontSize: '18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 25px rgba(0, 255, 136, 0.4)',
                }}
              >
                <Play size={22} />
                START MISSION
              </motion.button>

              {/* Dismiss text */}
              <p 
                onClick={onDismiss}
                style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255,255,255,0.5)', 
                  textAlign: 'center', 
                  marginTop: '12px',
                  cursor: 'pointer',
                }}
              >
                Maybe later
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

