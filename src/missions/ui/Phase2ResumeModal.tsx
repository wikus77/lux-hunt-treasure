/**
 * PHASE 2 RESUME MODAL
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Prompts user to confirm and complete Phase 2.
 * Supports: confirm, input with validation, counter, optional hints.
 * Does NOT auto-complete - requires user action.
 * 
 * UI: Responsive, centered, mobile-first, Safari iOS compatible.
 * Text: Instructions in ITALIAN.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Gift, X, Lightbulb, Plus, AlertCircle } from 'lucide-react';
import { 
  type MissionDefinition, 
  calculatePhaseRewards,
  validateInput,
} from '../missionsRegistry';

// ═══════════════════════════════════════════════════════════════
// 📦 COUNTER STORAGE (localStorage)
// ═══════════════════════════════════════════════════════════════

const COUNTER_PREFIX = 'm1_mission_counter_';

function getCounter(key: string): number {
  try {
    const stored = localStorage.getItem(`${COUNTER_PREFIX}${key}`);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

function incrementCounter(key: string): number {
  const current = getCounter(key);
  const newValue = current + 1;
  try {
    localStorage.setItem(`${COUNTER_PREFIX}${key}`, String(newValue));
  } catch {
    console.warn('[Phase2Modal] Failed to save counter');
  }
  return newValue;
}

// ═══════════════════════════════════════════════════════════════
// 🎨 COMPONENT
// ═══════════════════════════════════════════════════════════════

interface Phase2ResumeModalProps {
  mission: MissionDefinition;
  isOpen: boolean;
  onConfirmComplete: (data?: Record<string, string | number>) => void;
  onDismiss: () => void;
}

export default function Phase2ResumeModal({
  mission,
  isOpen,
  onConfirmComplete,
  onDismiss,
}: Phase2ResumeModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [counterValue, setCounterValue] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  const { phase2: reward } = calculatePhaseRewards(mission.totalRewardM1U);

  // Load counter value on mount
  useEffect(() => {
    if (mission.phase2.actionType === 'counter' && mission.phase2.counter) {
      setCounterValue(getCounter(mission.phase2.counter.key));
    }
  }, [mission.phase2]);

  // Clear state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
      setValidationError(null);
      setShowHint(false);
    }
  }, [isOpen]);

  // Handle counter increment
  const handleIncrementCounter = useCallback(() => {
    if (mission.phase2.counter) {
      const newValue = incrementCounter(mission.phase2.counter.key);
      setCounterValue(newValue);
    }
  }, [mission.phase2.counter]);

  // Handle phase 2 completion
  const handleComplete = useCallback(() => {
    // INPUT type: validate input
    if (mission.phase2.actionType === 'input') {
      const validation = validateInput(inputValue, mission.phase2.inputValidation);
      if (!validation.valid) {
        setValidationError(validation.error || 'Risposta non valida.');
        return;
      }
      onConfirmComplete({ userInput: inputValue });
      return;
    }

    // COUNTER type: check target reached
    if (mission.phase2.actionType === 'counter' && mission.phase2.counter) {
      if (counterValue < mission.phase2.counter.target) {
        setValidationError(`Devi raggiungere ${mission.phase2.counter.target} ${mission.phase2.counter.label || 'punti'}.`);
        return;
      }
      onConfirmComplete({ counterValue });
      return;
    }

    // CONFIRM type: no validation needed
    onConfirmComplete();
  }, [mission.phase2, inputValue, counterValue, onConfirmComplete]);

  // Clear error when input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setValidationError(null);
  }, []);

  if (!isOpen) return null;

  // Check if can complete based on action type
  const canComplete = (): boolean => {
    if (mission.phase2.actionType === 'input') {
      return inputValue.trim().length > 0;
    }
    if (mission.phase2.actionType === 'counter' && mission.phase2.counter) {
      return counterValue >= mission.phase2.counter.target;
    }
    return true; // confirm type always allowed
  };

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
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '360px',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'linear-gradient(145deg, rgba(30, 20, 10, 0.98), rgba(40, 30, 20, 0.95))',
              borderRadius: '24px',
              border: '2px solid rgba(255, 200, 0, 0.5)',
              boxShadow: '0 0 60px rgba(255, 200, 0, 0.2)',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            {/* Close button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button 
                onClick={onDismiss}
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  border: 'none', 
                  color: '#fff', 
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RefreshCw size={35} color="#fff" />
            </motion.div>

            {/* Header */}
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 800, 
              color: '#FFD700', 
              marginBottom: '6px' 
            }}>
              FASE 2 DISPONIBILE!
            </h2>

            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>
              {mission.title}
            </p>

            {/* Mission icon */}
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{mission.icon}</div>

            {/* Instruction */}
            <div style={{
              background: 'rgba(255, 200, 0, 0.1)',
              border: '1px solid rgba(255, 200, 0, 0.3)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px',
              textAlign: 'left',
            }}>
              <p style={{ fontSize: '13px', color: '#fff', lineHeight: 1.5, margin: 0 }}>
                {mission.phase2.instruction}
              </p>
            </div>

            {/* INPUT ACTION */}
            {mission.phase2.actionType === 'input' && (
              <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={mission.phase2.inputPlaceholder || 'Inserisci la risposta...'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: validationError 
                      ? '2px solid rgba(255, 80, 80, 0.8)' 
                      : '1px solid rgba(255, 200, 0, 0.3)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* COUNTER ACTION */}
            {mission.phase2.actionType === 'counter' && mission.phase2.counter && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                      {mission.phase2.counter.label || 'Progresso'}
                    </p>
                    <p style={{ 
                      fontSize: '24px', 
                      fontWeight: 800, 
                      color: counterValue >= mission.phase2.counter.target ? '#00FF96' : '#fff',
                      margin: '4px 0 0 0',
                    }}>
                      {counterValue} / {mission.phase2.counter.target}
                    </p>
                  </div>
                  <motion.button
                    onClick={handleIncrementCounter}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                      border: 'none',
                      color: '#000',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={24} />
                  </motion.button>
                </div>
              </div>
            )}

            {/* HINT (optional) */}
            {mission.phase2.hint && (
              <div style={{ marginBottom: '16px' }}>
                {!showHint ? (
                  <button
                    onClick={() => setShowHint(true)}
                    style={{
                      background: 'rgba(255, 200, 0, 0.15)',
                      border: '1px solid rgba(255, 200, 0, 0.3)',
                      borderRadius: '10px',
                      padding: '10px 16px',
                      color: '#FFD700',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      width: '100%',
                    }}
                  >
                    <Lightbulb size={16} />
                    Mostra suggerimento
                  </button>
                ) : (
                  <div style={{
                    background: 'rgba(255, 200, 0, 0.15)',
                    border: '1px solid rgba(255, 200, 0, 0.3)',
                    borderRadius: '10px',
                    padding: '12px',
                    textAlign: 'left',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Lightbulb size={14} color="#FFD700" />
                      <span style={{ fontSize: '11px', color: '#FFD700', fontWeight: 600 }}>
                        SUGGERIMENTO
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
                      {mission.phase2.hint}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Validation Error */}
            {validationError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 80, 80, 0.15)',
                border: '1px solid rgba(255, 80, 80, 0.4)',
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '16px',
                textAlign: 'left',
              }}>
                <AlertCircle size={16} color="#FF5050" />
                <p style={{ fontSize: '12px', color: '#FF5050', margin: 0 }}>
                  {validationError}
                </p>
              </div>
            )}

            {/* Reward preview */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}>
              <Gift size={18} color="#00FF96" />
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#00FF96' }}>
                +{reward} M1U ti aspettano!
              </span>
            </div>

            {/* CTA */}
            <motion.button
              onClick={handleComplete}
              whileTap={{ scale: 0.97 }}
              disabled={!canComplete()}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: canComplete()
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                  : 'rgba(100,100,100,0.3)',
                border: 'none',
                color: canComplete() ? '#000' : '#fff',
                fontSize: '16px',
                fontWeight: 700,
                cursor: canComplete() ? 'pointer' : 'not-allowed',
              }}
            >
              COMPLETA FASE 2
            </motion.button>

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
              Ricordamelo dopo
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

