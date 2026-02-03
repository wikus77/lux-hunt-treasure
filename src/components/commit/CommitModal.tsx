/**
 * COMMIT MODAL — Fullscreen ritual container
 * Handles ritual flow, Supabase RPC, M1U updates
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CommitFlipOverlay } from './CommitFlipOverlay';
import { CommitRitual } from './CommitRitual';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  originRect?: DOMRect | null;
}

type ModalState = 'checking' | 'ready' | 'processing' | 'result' | 'unavailable';

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
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const CommitModal: React.FC<CommitModalProps> = ({
  isOpen,
  onClose,
  originRect = null,
}) => {
  const [state, setState] = useState<ModalState>('checking');
  const [result, setResult] = useState<RitualResult | null>(null);
  const [unavailableReason, setUnavailableReason] = useState<string>('');

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK AVAILABILITY
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) {
      setState('checking');
      setResult(null);
      return;
    }

    const checkStatus = async () => {
      setState('checking');

      try {
        const { data, error } = await supabase.rpc('check_commit_ritual_status');

        if (error) {
          console.error('[Commit] Status check error:', error);
          setUnavailableReason('Errore di connessione.');
          setState('unavailable');
          return;
        }

        if (data?.available) {
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
        console.error('[Commit] Check failed:', err);
        setUnavailableReason('Errore di connessione.');
        setState('unavailable');
      }
    };

    checkStatus();
  }, [isOpen]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RITUAL HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  const handleComplete = useCallback(async (durationMs: number) => {
    setState('processing');

    try {
      const { data, error } = await supabase.rpc('apply_commit_ritual', {
        p_duration_ms: durationMs,
      });

      if (error) {
        console.error('[Commit] RPC error:', error);
        setResult({ success: false, error_code: 'rpc_error', message: 'Errore.' });
        setState('result');
        return;
      }

      const response = data as RitualResult;
      setResult(response);
      setState('result');

      // Update M1U pill
      if (response.success && response.new_balance !== undefined) {
        window.dispatchEvent(
          new CustomEvent('m1u-balance-update', {
            detail: { newBalance: response.new_balance },
          })
        );
      }

      // Close after delay
      setTimeout(() => onClose(), 3000);
    } catch (err) {
      console.error('[Commit] Exception:', err);
      setResult({ success: false, error_code: 'exception', message: 'Errore.' });
      setState('result');
    }
  }, [onClose]);

  const handleFail = useCallback(async (durationMs: number) => {
    setState('processing');

    try {
      const { data, error } = await supabase.rpc('apply_commit_ritual', {
        p_duration_ms: durationMs,
      });

      if (error) {
        console.error('[Commit] RPC error on fail:', error);
        setTimeout(() => onClose(), 2000);
        return;
      }

      const response = data as RitualResult;
      setResult(response);
      setState('result');

      // Update M1U pill
      if (response.success && response.new_balance !== undefined) {
        window.dispatchEvent(
          new CustomEvent('m1u-balance-update', {
            detail: { newBalance: response.new_balance },
          })
        );
      }

      setTimeout(() => onClose(), 2500);
    } catch (err) {
      console.error('[Commit] Exception on fail:', err);
      setTimeout(() => onClose(), 2000);
    }
  }, [onClose]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
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
                width: '50px',
                height: '50px',
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
      case 'processing':
      case 'result':
        return (
          <CommitRitual
            onComplete={handleComplete}
            onFail={handleFail}
            disabled={state === 'processing' || state === 'result'}
          />
        );

      default:
        return null;
    }
  };

  return (
    <CommitFlipOverlay open={isOpen} originRect={originRect} onClose={onClose}>
      {renderContent()}
    </CommitFlipOverlay>
  );
};

export default CommitModal;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
