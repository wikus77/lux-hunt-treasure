/**
 * THE COMMIT MODAL — Fullscreen ritual container
 * Handles ritual flow, Supabase RPC calls, M1U updates
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TheCommitFlipOverlay } from './TheCommitFlipOverlay';
import { CommitRitual } from './CommitRitual';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface TheCommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  originRect?: DOMRect | null;
}

type RitualState = 'checking' | 'ready' | 'in_progress' | 'processing' | 'result' | 'unavailable';

interface RitualResult {
  success: boolean;
  outcome?: 'success' | 'fail';
  delta?: number;
  new_balance?: number;
  already_done_today?: boolean;
  error_code?: string;
  message?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIRST TIME FLAG (localStorage)
// ═══════════════════════════════════════════════════════════════════════════════

const FIRST_TIME_KEY = 'm1ssion_commit_first_time_shown';

const getIsFirstTime = (): boolean => {
  try {
    return !localStorage.getItem(FIRST_TIME_KEY);
  } catch {
    return true;
  }
};

const markFirstTimeShown = (): void => {
  try {
    localStorage.setItem(FIRST_TIME_KEY, 'true');
  } catch {
    // Ignore
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const TheCommitModal: React.FC<TheCommitModalProps> = ({
  isOpen,
  onClose,
  originRect = null,
}) => {
  const [state, setState] = useState<RitualState>('checking');
  const [result, setResult] = useState<RitualResult | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState<string>('');

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK AVAILABILITY ON OPEN
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setState('checking');
      setResult(null);
      return;
    }

    const checkStatus = async () => {
      setState('checking');

      try {
        const { data, error } = await supabase.rpc('check_commit_ritual_status');

        if (error) {
          console.error('[TheCommit] Status check error:', error);
          setUnavailableReason('Errore di connessione.');
          setState('unavailable');
          return;
        }

        if (data?.available) {
          setIsFirstTime(getIsFirstTime());
          setState('ready');
        } else if (data?.already_done_today) {
          setUnavailableReason('Già eseguito oggi.');
          setState('unavailable');
        } else if (data?.insufficient_funds) {
          setUnavailableReason(`Saldo insufficiente (minimo 5 M1U). Hai ${data.balance} M1U.`);
          setState('unavailable');
        } else {
          setUnavailableReason('Non disponibile.');
          setState('unavailable');
        }
      } catch (err) {
        console.error('[TheCommit] Check failed:', err);
        setUnavailableReason('Errore di connessione.');
        setState('unavailable');
      }
    };

    checkStatus();
  }, [isOpen]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RITUAL COMPLETION HANDLER
  // ─────────────────────────────────────────────────────────────────────────────

  const handleComplete = useCallback(async (durationMs: number) => {
    setState('processing');

    // Mark first time shown
    if (isFirstTime) {
      markFirstTimeShown();
      setIsFirstTime(false);
    }

    try {
      // Call server RPC (server validates duration, applies delta)
      const { data, error } = await supabase.rpc('apply_commit_ritual', {
        p_duration_ms: durationMs,
      });

      if (error) {
        console.error('[TheCommit] RPC error:', error);
        setResult({
          success: false,
          error_code: 'rpc_error',
          message: 'Errore di sincronizzazione.',
        });
        setState('result');
        return;
      }

      const response = data as RitualResult;
      setResult(response);
      setState('result');

      // Emit event to update M1U pill
      if (response.success && response.new_balance !== undefined) {
        window.dispatchEvent(
          new CustomEvent('m1u-balance-update', {
            detail: { newBalance: response.new_balance },
          })
        );
      }

      // Close modal after showing result briefly (success case already shows "Noted.")
      setTimeout(() => {
        onClose();
      }, response.outcome === 'success' ? 3500 : 2000);
    } catch (err) {
      console.error('[TheCommit] Exception:', err);
      setResult({
        success: false,
        error_code: 'exception',
        message: 'Errore imprevisto.',
      });
      setState('result');
    }
  }, [isFirstTime, onClose]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RITUAL FAIL HANDLER
  // ─────────────────────────────────────────────────────────────────────────────

  const handleFail = useCallback(async (durationMs: number) => {
    setState('processing');

    // Mark first time shown
    if (isFirstTime) {
      markFirstTimeShown();
      setIsFirstTime(false);
    }

    try {
      // Call server RPC (server will return fail outcome with -5 delta)
      const { data, error } = await supabase.rpc('apply_commit_ritual', {
        p_duration_ms: durationMs,
      });

      if (error) {
        console.error('[TheCommit] RPC error on fail:', error);
        // Still close gracefully
        setTimeout(() => onClose(), 1500);
        return;
      }

      const response = data as RitualResult;
      setResult(response);
      setState('result');

      // Emit event to update M1U pill
      if (response.success && response.new_balance !== undefined) {
        window.dispatchEvent(
          new CustomEvent('m1u-balance-update', {
            detail: { newBalance: response.new_balance },
          })
        );
      }

      // Close modal after brief pause (no theatrical fail message)
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('[TheCommit] Exception on fail:', err);
      setTimeout(() => onClose(), 1500);
    }
  }, [isFirstTime, onClose]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER CONTENT
  // ─────────────────────────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (state) {
      case 'checking':
        return (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000000',
            }}
          >
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid rgba(0, 255, 255, 0.3)',
              }}
            />
          </div>
        );

      case 'unavailable':
        return (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000000',
              padding: '20px',
            }}
          >
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '14px',
                textAlign: 'center',
                letterSpacing: '1px',
              }}
            >
              {unavailableReason}
            </div>
          </div>
        );

      case 'ready':
      case 'in_progress':
        return (
          <CommitRitual
            onComplete={handleComplete}
            onFail={handleFail}
            disabled={state !== 'ready' && state !== 'in_progress'}
            isFirstTime={isFirstTime}
          />
        );

      case 'processing':
        return (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000000',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,255,255,0.2) 0%, transparent 70%)',
              }}
            />
          </div>
        );

      case 'result':
        // Silent result - the CommitRitual already shows "Noted." for success
        // For fail, we just show the updated balance subtly
        return (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000000',
            }}
          >
            {result?.outcome === 'fail' && result?.delta && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                style={{
                  color: 'rgba(255, 100, 100, 0.6)',
                  fontSize: '13px',
                  letterSpacing: '1px',
                }}
              >
                {result.delta} M1U
              </motion.div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <TheCommitFlipOverlay open={isOpen} originRect={originRect} onClose={onClose}>
      {renderContent()}
    </TheCommitFlipOverlay>
  );
};

export default TheCommitModal;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
