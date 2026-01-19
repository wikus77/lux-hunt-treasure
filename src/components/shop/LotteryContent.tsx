/**
 * M1SSION™ Lottery Content Component
 * Componente per la sezione Lotteria nello ShopModal
 * 
 * Features:
 * - Visualizzazione ciclo attivo con countdown
 * - Acquisto biglietti
 * - Banner vincite pending + Modal claim
 * - Progresso soglia
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  Trophy, 
  Clock, 
  Users, 
  Loader2, 
  Plus, 
  Minus,
  Gift,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  X as XIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { toast } from 'sonner';

interface LotteryStatus {
  cycle_id: string;
  status: string;
  starts_at: string;
  ends_at: string;
  time_remaining_seconds: number;
  ticket_price_m1u: number;
  min_tickets_required: number;
  max_tickets_per_user: number;
  total_tickets: number;
  total_participants: number;
  progress_percent: number;
  threshold_reached: boolean;
  prizes_json: Array<{ rank: number; percent: number; label: string }>;
  prize_multiplier: number;
  user_tickets_count: number;
  user_can_buy_more: boolean;
  user_remaining_tickets: number;
  narrative: string;
}

interface UserWin {
  id: string;
  cycle_id: string;
  rank: number;
  prize_m1u: number;
  prize_label: string;
  claim_status: 'pending' | 'claimed' | 'expired';
  claim_deadline: string;
  time_remaining_seconds: number;
}

// Format time remaining
const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return 'Scaduto';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}g ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

interface LotteryContentProps {
  balance: number;
  onBalanceUpdate: () => void;
}

const LotteryContent: React.FC<LotteryContentProps> = ({ balance, onBalanceUpdate }) => {
  const { user } = useUnifiedAuth();
  
  // State
  const [status, setStatus] = useState<LotteryStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Wins & Claim state
  const [pendingWins, setPendingWins] = useState<UserWin[]>([]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedWin, setSelectedWin] = useState<UserWin | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  
  // Load lottery status
  const loadStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_active_lottery_cycle');
      
      if (error) throw error;
      
      if (data?.status === 'no_active_cycle') {
        setStatus(null);
      } else {
        setStatus(data as LotteryStatus);
      }
    } catch (err: any) {
      console.error('Failed to load lottery status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load user wins
  const loadWins = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('get_my_lottery_wins');
      
      if (error) throw error;
      
      if (data?.wins) {
        const pending = data.wins.filter((w: UserWin) => w.claim_status === 'pending');
        setPendingWins(pending);
        
        // Auto-show claim modal if there are pending wins
        if (pending.length > 0 && !showClaimModal) {
          setSelectedWin(pending[0]);
          setShowClaimModal(true);
        }
      }
    } catch (err: any) {
      console.error('Failed to load wins:', err);
    }
  }, [user, showClaimModal]);
  
  // Initial load
  useEffect(() => {
    loadStatus();
    loadWins();
  }, [loadStatus, loadWins]);
  
  // Auto-refresh ogni 30 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      loadStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadStatus]);
  
  // Buy tickets
  const handleBuyTickets = async () => {
    if (!status || !user) return;
    
    setIsPurchasing(true);
    const requestId = crypto.randomUUID();
    
    try {
      const { data, error } = await supabase.rpc('buy_lottery_tickets', {
        p_cycle_id: status.cycle_id,
        p_quantity: quantity,
        p_request_id: requestId,
        p_source: 'shop'
      });
      
      if (error) throw error;
      
      if (data.status === 'success') {
        toast.success(`🎫 Acquistati ${quantity} biglietti!`, {
          description: `Totale: ${data.total_cost} M1U`
        });
        
        // Refresh
        onBalanceUpdate();
        loadStatus();
        setQuantity(1);
      } else {
        toast.error('Errore', {
          description: data.message || 'Errore sconosciuto'
        });
      }
    } catch (err: any) {
      toast.error('Errore', { description: err.message });
    } finally {
      setIsPurchasing(false);
    }
  };
  
  // Claim prize
  const handleClaimPrize = async (win: UserWin) => {
    if (isClaiming) return;
    
    setIsClaiming(true);
    
    try {
      const { data, error } = await supabase.rpc('claim_lottery_prize', {
        p_winner_id: win.id
      });
      
      if (error) throw error;
      
      if (data?.status === 'success') {
        toast.success('🎉 Premio riscosso!', {
          description: `+${data.prize_m1u} M1U accreditati!`
        });
        
        // Dispatch event for M1U animation
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('m1u-credited', {
            detail: { amount: data.prize_m1u }
          }));
        }, 500);
        
        // Refresh data
        onBalanceUpdate();
        loadWins();
        setShowClaimModal(false);
        setSelectedWin(null);
      } else {
        toast.error('Errore', { description: data?.message || 'Impossibile riscuotere il premio' });
      }
    } catch (err: any) {
      toast.error('Errore', { description: err.message });
    } finally {
      setIsClaiming(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }
  
  // No active cycle
  if (!status) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
        >
          <Ticket className="w-10 h-10 text-blue-400" />
        </motion.div>
        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Nessun ciclo attivo</h3>
        <p className="text-white/60 text-sm">La prossima lotteria inizierà presto!</p>
      </div>
    );
  }
  
  const totalCost = quantity * status.ticket_price_m1u;
  const canAfford = balance >= totalCost;
  const canBuy = status.user_can_buy_more && canAfford && status.status === 'active';
  
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CLAIM PRIZE MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showClaimModal && selectedWin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowClaimModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-yellow-500/30 overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-yellow-500/20 to-amber-600/20 p-6 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-white">🎉 HAI VINTO! 🎉</h2>
                <p className="text-yellow-400/80 mt-1">{selectedWin.prize_label}</p>
                
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  <XIcon className="w-4 h-4 text-white/70" />
                </button>
              </div>
              
              {/* Prize Details */}
              <div className="p-5 space-y-5">
                <div className="text-center">
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold text-yellow-400"
                  >
                    +{selectedWin.prize_m1u.toLocaleString()}
                  </motion.p>
                  <p className="text-yellow-400/60">M1U</p>
                </div>
                
                {/* Deadline */}
                <div className="flex items-center justify-center gap-2 text-orange-400 bg-orange-500/10 rounded-lg p-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Riscuoti entro: <strong>{formatTimeRemaining(selectedWin.time_remaining_seconds)}</strong></span>
                </div>
                
                {/* Claim Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleClaimPrize(selectedWin)}
                  disabled={isClaiming}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Riscuotendo...
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      RISCUOTI VINCITA
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        {/* Pending Wins Banner */}
        {pendingWins.length > 0 && !showClaimModal && (
          <motion.button
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => {
              setSelectedWin(pendingWins[0]);
              setShowClaimModal(true);
            }}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-yellow-400 text-sm">Hai {pendingWins.length} vincita da riscuotere!</span>
            </div>
            <Gift className="w-5 h-5 text-yellow-400 animate-pulse" />
          </motion.button>
        )}
        
        {/* Status Badge */}
        <div className="flex items-center justify-center">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            status.status === 'active' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {status.status === 'active' ? '🟢 ATTIVA' : status.status.toUpperCase()}
          </span>
        </div>
        
        {/* Countdown */}
        <div className="text-center">
          <p className="text-white/60 text-xs">Tempo rimanente</p>
          <p className="text-xl font-bold text-white">{formatTimeRemaining(status.time_remaining_seconds)}</p>
        </div>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Progresso soglia</span>
            <span className="text-cyan-400 font-bold">{status.total_tickets} / {status.min_tickets_required}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, status.progress_percent)}%` }}
              className={`h-full rounded-full ${
                status.threshold_reached 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400'
              }`}
            />
          </div>
          <p className="text-center text-xs text-white/40">{status.total_participants} partecipanti</p>
        </div>
        
        {/* Prizes */}
        <div className="bg-white/5 rounded-xl p-3 space-y-2">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Premi Top 3
          </h4>
          {status.prizes_json.map((prize) => (
            <div key={prize.rank} className="flex justify-between text-xs">
              <span className="text-white/70">{prize.label}</span>
              <span className="font-bold text-yellow-400">{prize.percent}%</span>
            </div>
          ))}
          {!status.threshold_reached && (
            <p className="text-[10px] text-orange-400 text-center mt-2">
              ⚠️ Sotto soglia: premi ridotti al {(status.prize_multiplier * 100).toFixed(0)}%
            </p>
          )}
        </div>
        
        {/* Buy Section */}
        {status.status === 'active' && (
          <div className="bg-white/5 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">I tuoi biglietti</span>
              <span className="font-bold text-white">{status.user_tickets_count} / {status.max_tickets_per_user}</span>
            </div>
            
            {/* Quantity selector */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50"
              >
                <Minus className="w-4 h-4 text-white" />
              </button>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{quantity}</p>
                <p className="text-xs text-white/50">× {status.ticket_price_m1u} M1U</p>
              </div>
              
              <button
                onClick={() => setQuantity(Math.min(status.user_remaining_tickets, quantity + 1))}
                disabled={quantity >= status.user_remaining_tickets}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
            
            {/* Quick select */}
            <div className="flex justify-center gap-2">
              {[1, 5, 10, 25].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuantity(Math.min(status.user_remaining_tickets, q))}
                  disabled={q > status.user_remaining_tickets}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    quantity === q
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  } disabled:opacity-30`}
                >
                  {q}
                </button>
              ))}
            </div>
            
            {/* Buy button */}
            <motion.button
              whileHover={canBuy ? { scale: 1.02 } : {}}
              whileTap={canBuy ? { scale: 0.98 } : {}}
              onClick={handleBuyTickets}
              disabled={isPurchasing || !canBuy}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                canBuy
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Acquisto...
                </>
              ) : (
                <>
                  <Ticket className="w-5 h-5" />
                  ACQUISTA {quantity} BIGLIETT{quantity === 1 ? 'O' : 'I'}
                  <span className="ml-1 text-white/70">({totalCost} M1U)</span>
                </>
              )}
            </motion.button>
            
            {!canAfford && (
              <p className="text-center text-xs text-red-400">
                Saldo insufficiente (servono {totalCost} M1U)
              </p>
            )}
            
            {!status.user_can_buy_more && (
              <p className="text-center text-xs text-orange-400">
                Hai raggiunto il limite di {status.max_tickets_per_user} biglietti
              </p>
            )}
          </div>
        )}
        
        {/* Narrative */}
        <p className="text-center text-xs text-white/50 italic">
          "{status.narrative}"
        </p>
      </div>
    </>
  );
};

export default LotteryContent;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

