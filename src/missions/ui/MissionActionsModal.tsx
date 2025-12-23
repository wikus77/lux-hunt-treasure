/**
 * MISSION ACTIONS MODAL
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Modal opened when clicking Progress Pill.
 * Supports: input validation, counters, confirm actions.
 * 
 * UI: Responsive, centered, mobile-first, Safari iOS compatible.
 * Text: Instructions in ITALIAN.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock, Info, Plus, AlertCircle } from 'lucide-react';
import { 
  type MissionDefinition, 
  calculatePhaseRewards,
  validateInput,
} from '../missionsRegistry';
import { type MissionState, isPhase2Available } from '../missionState';

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
    console.warn('[MissionActions] Failed to save counter');
  }
  return newValue;
}

// ═══════════════════════════════════════════════════════════════
// 🎨 COMPONENT
// ═══════════════════════════════════════════════════════════════

interface MissionActionsModalProps {
  mission: MissionDefinition;
  missionState: MissionState;
  isOpen: boolean;
  onCompletePhase1: (data?: Record<string, string | number>) => void;
  onClose: () => void;
}

export default function MissionActionsModal({
  mission,
  missionState,
  isOpen,
  onCompletePhase1,
  onClose,
}: MissionActionsModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [counterValue, setCounterValue] = useState(0);
  
  const { phase } = missionState;
  const phase2Available = isPhase2Available();
  const { phase1: phase1Reward, phase2: phase2Reward } = calculatePhaseRewards(mission.totalRewardM1U);

  // Load counter value on mount
  useEffect(() => {
    if (mission.phase1.actionType === 'counter' && mission.phase1.counter) {
      setCounterValue(getCounter(mission.phase1.counter.key));
    }
  }, [mission.phase1]);

  // Clear state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
      setValidationError(null);
    }
  }, [isOpen]);

  // Handle counter increment
  const handleIncrementCounter = useCallback(() => {
    if (mission.phase1.counter) {
      const newValue = incrementCounter(mission.phase1.counter.key);
      setCounterValue(newValue);
    }
  }, [mission.phase1.counter]);

  // Handle phase 1 completion
  const handlePhase1Complete = useCallback(() => {
    // INPUT type: validate input
    if (mission.phase1.actionType === 'input') {
      const validation = validateInput(inputValue, mission.phase1.inputValidation);
      if (!validation.valid) {
        setValidationError(validation.error || 'Risposta non valida.');
        return;
      }
      onCompletePhase1({ userInput: inputValue });
      return;
    }

    // COUNTER type: check target reached
    if (mission.phase1.actionType === 'counter' && mission.phase1.counter) {
      if (counterValue < mission.phase1.counter.target) {
        setValidationError(`Devi raggiungere ${mission.phase1.counter.target} ${mission.phase1.counter.label || 'punti'}.`);
        return;
      }
      onCompletePhase1({ counterValue });
      return;
    }

    // CONFIRM type: no validation needed
    onCompletePhase1();
  }, [mission.phase1, inputValue, counterValue, onCompletePhase1]);

  // Clear error when input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setValidationError(null);
  }, []);

  if (!isOpen) return null;

  // Check if can complete based on action type
  const canComplete = (): boolean => {
    if (mission.phase1.actionType === 'input') {
      return inputValue.trim().length > 0;
    }
    if (mission.phase1.actionType === 'counter' && mission.phase1.counter) {
      return counterValue >= mission.phase1.counter.target;
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
          onClick={onClose}
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
              background: 'linear-gradient(145deg, rgba(10, 20, 40, 0.98), rgba(20, 30, 50, 0.95))',
              borderRadius: '24px',
              border: '2px solid rgba(0, 209, 255, 0.4)',
              boxShadow: '0 0 40px rgba(0, 209, 255, 0.15)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              background: 'linear-gradient(145deg, rgba(10, 20, 40, 0.98), rgba(20, 30, 50, 0.95))',
              zIndex: 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '28px' }}>{mission.icon}</span>
                <div>
                  <p style={{ fontSize: '10px', color: '#00D1FF', fontWeight: 600, margin: 0 }}>
                    MISSIONE IN CORSO
                  </p>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {mission.title}
                  </h3>
                </div>
              </div>
              <button 
                onClick={onClose}
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
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px' }}>
              {/* Phase 1 Section */}
              {phase === 1 && !phase2Available && (
                <div style={{
                  background: 'rgba(0, 209, 255, 0.1)',
                  border: '1px solid rgba(0, 209, 255, 0.3)',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                    <Info size={16} color="#00D1FF" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', color: '#fff', fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
                      {mission.phase1.instruction}
                    </p>
                  </div>

                  {/* INPUT ACTION */}
                  {mission.phase1.actionType === 'input' && (
                    <div style={{ marginBottom: '12px' }}>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={mission.phase1.inputPlaceholder || 'Inserisci la risposta...'}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: validationError 
                            ? '2px solid rgba(255, 80, 80, 0.8)' 
                            : '1px solid rgba(0, 209, 255, 0.3)',
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: '#fff',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  )}

                  {/* COUNTER ACTION */}
                  {mission.phase1.actionType === 'counter' && mission.phase1.counter && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                      }}>
                        <div>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                            {mission.phase1.counter.label || 'Progresso'}
                          </p>
                          <p style={{ 
                            fontSize: '24px', 
                            fontWeight: 800, 
                            color: counterValue >= mission.phase1.counter.target ? '#00FF96' : '#fff',
                            margin: '4px 0 0 0',
                          }}>
                            {counterValue} / {mission.phase1.counter.target}
                          </p>
                        </div>
                        <motion.button
                          onClick={handleIncrementCounter}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #00D1FF, #0099CC)',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Plus size={24} />
                        </motion.button>
                      </div>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '8px', textAlign: 'center' }}>
                        Premi + dopo ogni vittoria in Pulse Breaker
                      </p>
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
                      marginBottom: '12px',
                    }}>
                      <AlertCircle size={16} color="#FF5050" />
                      <p style={{ fontSize: '12px', color: '#FF5050', margin: 0 }}>
                        {validationError}
                      </p>
                    </div>
                  )}

                  {/* Reward preview */}
                  <p style={{ fontSize: '13px', color: '#00FF96', marginBottom: '12px' }}>
                    ✅ Completa per +{phase1Reward} M1U
                  </p>

                  {/* Complete button */}
                  <motion.button
                    onClick={handlePhase1Complete}
                    whileTap={{ scale: 0.97 }}
                    disabled={!canComplete()}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      background: canComplete()
                        ? 'linear-gradient(135deg, #00D1FF, #0099CC)'
                        : 'rgba(100,100,100,0.3)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: canComplete() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Check size={18} />
                    COMPLETA FASE 1
                  </motion.button>
                </div>
              )}

              {/* Phase 2 Pending Section */}
              {phase === 2 && !phase2Available && (
                <div style={{
                  background: 'rgba(255, 200, 0, 0.1)',
                  border: '1px solid rgba(255, 200, 0, 0.3)',
                  borderRadius: '16px',
                  padding: '16px',
                  textAlign: 'center',
                }}>
                  <Clock size={30} color="#FFD700" style={{ marginBottom: '10px' }} />
                  <p style={{ fontSize: '14px', color: '#FFD700', fontWeight: 600, marginBottom: '6px' }}>
                    FASE 2 SI SBLOCCA DOMANI
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    Torna domani per completare la missione e ottenere +{phase2Reward} M1U
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

