/**
 * MISSION COMPLETION MODAL
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Shows phase completion with reward and next steps.
 * Fully responsive, centered, safe-area aware.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Trophy } from 'lucide-react';

interface MissionCompletionModalProps {
  isOpen: boolean;
  phase: 1 | 2;
  rewardAmount: number;
  missionTitle: string;
  onClose: () => void;
}

export default function MissionCompletionModal({
  isOpen,
  phase,
  rewardAmount,
  missionTitle,
  onClose,
}: MissionCompletionModalProps) {
  const isPhase1 = phase === 1;

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
            zIndex: 10004,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            paddingTop: 'calc(env(safe-area-inset-top, 16px) + 16px)',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(12px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '340px',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'linear-gradient(145deg, rgba(10, 30, 20, 0.98), rgba(20, 40, 30, 0.95))',
              borderRadius: '24px',
              border: '2px solid rgba(0, 255, 150, 0.5)',
              boxShadow: '0 0 80px rgba(0, 255, 150, 0.3)',
              padding: '30px 24px',
              textAlign: 'center',
            }}
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: isPhase1 
                  ? 'linear-gradient(135deg, #00D1FF, #0099CC)'
                  : 'linear-gradient(135deg, #00FF96, #00CC77)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isPhase1 ? <Check size={40} color="#fff" /> : <Trophy size={40} color="#fff" />}
            </motion.div>

            {/* Title */}
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 800, 
              color: isPhase1 ? '#00D1FF' : '#00FF96', 
              marginBottom: '8px' 
            }}>
              {isPhase1 ? 'PHASE 1 COMPLETE!' : 'MISSION ACCOMPLISHED!'}
            </h2>

            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
              {missionTitle}
            </p>

            {/* Reward */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                background: 'rgba(0, 255, 150, 0.15)',
                border: '2px solid rgba(0, 255, 150, 0.4)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px',
              }}
            >
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                REWARD CREDITED
              </p>
              <p style={{ fontSize: '32px', fontWeight: 900, color: '#00FF96' }}>
                +{rewardAmount} M1U
              </p>
            </motion.div>

            {/* Next steps */}
            {isPhase1 && (
              <div style={{
                background: 'rgba(255, 200, 0, 0.1)',
                border: '1px solid rgba(255, 200, 0, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Clock size={20} color="#FFD700" />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '11px', color: '#FFD700', fontWeight: 600 }}>PHASE 2 UNLOCKS TOMORROW</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    Return to claim your remaining reward
                  </p>
                </div>
              </div>
            )}

            {/* CTA */}
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: isPhase1 
                  ? 'linear-gradient(135deg, #00D1FF, #0099CC)'
                  : 'linear-gradient(135deg, #00FF96, #00CC77)',
                border: 'none',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isPhase1 ? 'GOT IT!' : 'CLAIM REWARD'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

