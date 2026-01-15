// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Referral Card Component - Invita Amici

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Gift, CheckCircle, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

interface ReferralStats {
  referral_code: string;
  total_referrals: number;
  total_m1u_earned: number;
  reward_per_invite: number;
}

interface ReferralCardProps {
  compact?: boolean;
  showApplyCode?: boolean;
}

export function ReferralCard({ compact = false, showApplyCode = false }: ReferralCardProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [applyCodeMode, setApplyCodeMode] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('get_user_referral_stats', {
        p_user_id: user.id
      });

      if (error) {
        console.warn('[Referral] RPC not available yet:', error.message);
        // Fallback
        setStats({
          referral_code: 'LOADING...',
          total_referrals: 0,
          total_m1u_earned: 0,
          reward_per_invite: 50
        });
      } else {
        setStats(data as ReferralStats);
      }
    } catch (err) {
      console.error('[Referral] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!stats?.referral_code) return;
    
    hapticLight();
    
    try {
      await navigator.clipboard.writeText(stats.referral_code);
      setCopied(true);
      toast.success('Codice copiato! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Impossibile copiare');
    }
  };

  const handleShare = async () => {
    if (!stats?.referral_code) return;
    
    hapticLight();
    
    const shareText = `🎮 Unisciti a M1SSION! Usa il mio codice ${stats.referral_code} e ricevi 50 M1U gratis! Scarica l'app: https://m1ssion.eu`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invito M1SSION',
          text: shareText,
        });
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      toast.success('Link copiato! 📋');
    }
  };

  const handleApplyCode = async () => {
    if (!user || !inputCode.trim()) return;
    
    hapticLight();
    setApplying(true);

    try {
      const { data, error } = await supabase.rpc('apply_referral_code', {
        p_referred_user_id: user.id,
        p_referral_code: inputCode.trim().toUpperCase()
      });

      if (error) {
        toast.error('Errore: ' + error.message);
        return;
      }

      const result = data as { success: boolean; message?: string; error?: string; referred_reward?: number };

      if (result.success) {
        hapticSuccess();
        toast.success(result.message || 'Bonus applicato!');
        
        // Trigger M1U animation
        window.dispatchEvent(new CustomEvent('m1u-credited', { 
          detail: { amount: result.referred_reward || 50 } 
        }));
        
        setApplyCodeMode(false);
        setInputCode('');
      } else {
        toast.error(result.message || result.error || 'Codice non valido');
      }
    } catch (err: any) {
      toast.error('Errore: ' + err.message);
    } finally {
      setApplying(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="animate-pulse bg-gray-800/50 rounded-xl h-24" />
    );
  }

  // Compact version
  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={handleCopyCode}
        className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Users className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400">Il tuo codice</p>
          <p className="text-sm font-bold text-white font-mono">
            {stats?.referral_code || '...'}
          </p>
        </div>
        {copied ? (
          <CheckCircle className="w-5 h-5 text-green-400" />
        ) : (
          <Copy className="w-5 h-5 text-purple-400" />
        )}
      </motion.div>
    );
  }

  // Full version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Main Container */}
      <div className="relative bg-gradient-to-br from-[#1a1525] via-[#1a1a2e] to-[#0f172a] rounded-2xl border border-purple-500/20 p-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center"
            >
              <Users className="w-5 h-5 text-purple-400" />
            </motion.div>
            <div>
              <p className="text-sm text-gray-400">Invita Amici</p>
              <p className="text-lg font-bold text-white">
                +50 M1U per entrambi!
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-bold">{stats?.total_referrals || 0} inviti</span>
          </div>
        </div>

        {/* Referral Code Box */}
        <div className="relative mb-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
            <p className="text-xs text-gray-400 mb-2 text-center">Il tuo codice invito</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-2xl font-bold font-mono text-white tracking-wider">
                {stats?.referral_code || '--------'}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyCode}
                className="h-8 w-8 p-0 hover:bg-purple-500/20"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-purple-400" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleShare}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Condividi
          </Button>
          <Button
            onClick={handleCopyCode}
            variant="outline"
            className="border-purple-500/30 hover:bg-purple-500/20"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copia
          </Button>
        </div>

        {/* Apply Code Section (for new users) */}
        {showApplyCode && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <AnimatePresence mode="wait">
              {applyCodeMode ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex gap-2">
                    <Input
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="CODICE AMICO"
                      maxLength={8}
                      className="bg-gray-800/50 border-gray-600 font-mono text-center uppercase"
                    />
                    <Button
                      onClick={handleApplyCode}
                      disabled={applying || !inputCode.trim()}
                      className="bg-green-500 hover:bg-green-400"
                    >
                      {applying ? '...' : '✓'}
                    </Button>
                  </div>
                  <button
                    onClick={() => setApplyCodeMode(false)}
                    className="text-xs text-gray-500 hover:text-gray-400"
                  >
                    Annulla
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setApplyCodeMode(true)}
                  className="w-full text-center text-sm text-purple-400 hover:text-purple-300"
                >
                  Hai un codice amico? Applicalo qui →
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Stats */}
        {(stats?.total_referrals || 0) > 0 && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Totale guadagnato</span>
              <span className="font-bold text-green-400">+{stats?.total_m1u_earned || 0} M1U</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ReferralCard;

