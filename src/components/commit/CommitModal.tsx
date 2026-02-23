/**
 * COMMIT MODAL — Fullscreen ritual container
 * Handles ritual flow, Supabase RPC, M1U updates
 * 🔧 FIX 06/02/2026: Added glitch on fail + reward modal on success
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommitFlipOverlay } from './CommitFlipOverlay';
import { CommitRitual } from './CommitRitual';
import { supabase } from '@/integrations/supabase/client';
import { triggerTVShutdownEffect } from '@/hooks/useGlobalGlitch';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  originRect?: DOMRect | null;
}

type ModalState = 'checking' | 'ready' | 'processing' | 'result' | 'unavailable' | 'reward';

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

      // Update M1U pill
      if (response.success && response.new_balance !== undefined) {
        window.dispatchEvent(
          new CustomEvent('m1u-balance-update', {
            detail: { newBalance: response.new_balance },
          })
        );
      }

      // MPE Real Data v1: record daily commit (one line, silent)
      if (response.success) void supabase.rpc('mpe_record_daily_commit').catch(() => {});

      // 🔧 FIX 06/02/2026: Show reward modal on SUCCESS (+5 M1U)
      if (response.success && response.outcome === 'success') {
        console.log('[Commit] ✅ SUCCESS! Showing reward modal +5 M1U');
        setState('reward');
        // Auto-close after 4s to let user enjoy the celebration
        setTimeout(() => onClose(), 4000);
      } else {
        setState('result');
        setTimeout(() => onClose(), 3000);
      }
    } catch (err) {
      console.error('[Commit] Exception:', err);
      setResult({ success: false, error_code: 'exception', message: 'Errore.' });
      setState('result');
    }
  }, [onClose]);

  const handleFail = useCallback(async (durationMs: number) => {
    setState('processing');

    // 🔧 FIX 06/02/2026: Trigger GLITCH immediately on fail (same as GLITCH GLOBALE)
    console.log('[Commit] ❌ FAIL! Triggering glitch effect...');
    triggerTVShutdownEffect();

    try {
      const { data, error } = await supabase.rpc('apply_commit_ritual', {
        p_duration_ms: durationMs,
      });

      if (error) {
        console.error('[Commit] RPC error on fail:', error);
        // Close after glitch animation (3.7s) + buffer
        setTimeout(() => onClose(), 4500);
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

      // Close after glitch animation completes
      setTimeout(() => onClose(), 4500);
    } catch (err) {
      console.error('[Commit] Exception on fail:', err);
      setTimeout(() => onClose(), 4500);
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

      // 🔧 FIX 06/02/2026: Reward modal for successful commit (+5 M1U)
      case 'reward':
        return (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at 50% 30%, #0a2520 0%, #000000 70%)',
              padding: '24px',
              overflow: 'hidden',
            }}
          >
            {/* Glow ring behind */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [0.3, 0.5, 0.3] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
              style={{
                position: 'absolute',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 255, 180, 0.15) 0%, transparent 70%)',
                filter: 'blur(30px)',
              }}
            />

            {/* Main reward icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 200, 
                damping: 15,
                delay: 0.1 
              }}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00FFB4 0%, #00D4FF 50%, #00FFB4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 60px rgba(0, 255, 180, 0.5), 0 0 100px rgba(0, 212, 255, 0.3)',
                marginBottom: '32px',
              }}
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  color: '#000',
                  fontFamily: 'Orbitron, sans-serif',
                }}
              >
                +5
              </motion.span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                color: '#00FFB4',
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '4px',
                textTransform: 'uppercase',
                marginBottom: '12px',
                textShadow: '0 0 20px rgba(0, 255, 180, 0.5)',
              }}
            >
              COMMIT RIUSCITO
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '16px',
                textAlign: 'center',
                maxWidth: '280px',
                lineHeight: 1.5,
              }}
            >
              Hai guadagnato <span style={{ color: '#FFD700', fontWeight: 600 }}>5 M1U</span>.
              <br />
              La tua determinazione è stata ricompensata.
            </motion.p>

            {/* New balance display */}
            {result?.new_balance !== undefined && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                style={{
                  marginTop: '32px',
                  padding: '12px 24px',
                  borderRadius: '20px',
                  background: 'rgba(255, 215, 0, 0.1)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                }}
              >
                <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', letterSpacing: '2px' }}>
                  NUOVO SALDO
                </span>
                <div style={{ 
                  color: '#FFD700', 
                  fontSize: '24px', 
                  fontWeight: 700,
                  fontFamily: 'Orbitron, sans-serif',
                  marginTop: '4px',
                }}>
                  {result.new_balance.toLocaleString('it-IT')} M1U
                </div>
              </motion.div>
            )}

            {/* Sparkle particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos(i * 60 * Math.PI / 180) * 100,
                  y: Math.sin(i * 60 * Math.PI / 180) * 100,
                }}
                transition={{ 
                  delay: 0.2 + i * 0.1,
                  duration: 1.5,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#00FFB4',
                  boxShadow: '0 0 10px #00FFB4',
                }}
              />
            ))}
          </div>
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
