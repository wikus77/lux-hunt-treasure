/**
 * M1SSION™ Lottery Test Page
 * Pagina di test per il sistema lotteria 30 giorni
 * 
 * ACCESSO: Solo admin/dev (verificato via ruolo o env)
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  Trophy,
  Loader2,
  Plus,
  Minus,
  Play,
  Ban,
  BarChart3,
  Shield,
  Gift,
  Sparkles,
  X as XIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { toast } from 'sonner';

// Types
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
  prize_pool_total: number;
  progress_percent: number;
  threshold_reached: boolean;
  prizes_json: Array<{ rank: number; percent: number; label: string }>;
  prizes_effective_json: Array<{ rank: number; percent: number; label: string; amount_m1u: number }> | null;
  prize_multiplier: number;
  user_tickets_count: number;
  user_can_buy_more: boolean;
  user_remaining_tickets: number;
  user_purchases: Array<{ id: string; tickets_count: number; total_m1u: number; created_at: string }>;
  draw: {
    id: string;
    completed_at: string;
    winners: Array<{ rank: number; user_id: string; ticket_id: string; prize_m1u: number }>;
    public_seed: string;
    draw_proof_hash: string;
    threshold_reached: boolean;
    prize_multiplier: number;
  } | null;
  narrative: string;
}

interface UserTicket {
  id: string;
  status: string;
  created_at: string;
  ticket_hash: string;
  draw_rank: number | null;
  prize_amount: number | null;
}

interface UserWin {
  id: string;
  cycle_id: string;
  rank: number;
  prize_m1u: number;
  prize_label: string;
  claim_status: 'pending' | 'claimed' | 'expired';
  claim_deadline: string;
  claimed_at: string | null;
  time_remaining_seconds: number;
  created_at: string;
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

const LotteryTest: React.FC = () => {
  const { user } = useUnifiedAuth();
  const { unitsData, refetch: refetchBalance } = useM1UnitsRealtime(user?.id);
  const balance = unitsData?.balance ?? 0;
  
  // State
  const [status, setStatus] = useState<LotteryStatus | null>(null);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showTickets, setShowTickets] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Wins & Claim state
  const [myWins, setMyWins] = useState<UserWin[]>([]);
  const [pendingWins, setPendingWins] = useState<UserWin[]>([]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedWin, setSelectedWin] = useState<UserWin | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  
  // Check user role
  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      setUserRole(data?.role || null);
    };
    
    checkRole();
  }, [user]);
  
  const isAdmin = userRole === 'admin' || userRole === 'owner';
  
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
      toast.error('Errore nel caricamento dello status');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load user tickets
  const loadTickets = useCallback(async () => {
    if (!status?.cycle_id || !user) return;
    
    try {
      const { data, error } = await supabase.rpc('get_user_lottery_tickets', {
        p_cycle_id: status.cycle_id
      });
      
      if (error) throw error;
      
      setTickets(data?.tickets || []);
    } catch (err: any) {
      console.error('Failed to load tickets:', err);
    }
  }, [status?.cycle_id, user]);
  
  // Load admin analytics
  const loadAdminAnalytics = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      const { data, error } = await supabase.rpc('admin_get_lottery_analytics');
      
      if (error) throw error;
      
      setAdminAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load admin analytics:', err);
    }
  }, [isAdmin]);
  
  // Load user wins
  const loadWins = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('get_my_lottery_wins');
      
      if (error) throw error;
      
      if (data?.wins) {
        setMyWins(data.wins);
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
        refetchBalance();
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
  
  // Initial load
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);
  
  // Load tickets when status changes
  useEffect(() => {
    if (showTickets) {
      loadTickets();
    }
  }, [showTickets, loadTickets]);
  
  // Load admin analytics when section opens
  useEffect(() => {
    if (showAdmin && isAdmin) {
      loadAdminAnalytics();
    }
  }, [showAdmin, isAdmin, loadAdminAnalytics]);
  
  // Auto-refresh ogni 30 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      loadStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadStatus]);
  
  // Load wins on mount and when user changes
  useEffect(() => {
    loadWins();
  }, [loadWins]);
  
  // Check URL params for claim=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('claim') === 'true') {
      loadWins();
    }
  }, [loadWins]);
  
  // Generate request ID for idempotency
  const generateRequestId = () => crypto.randomUUID();
  
  // Buy tickets
  const handleBuyTickets = async () => {
    if (!status || !user) return;
    
    setIsPurchasing(true);
    const requestId = generateRequestId();
    
    try {
      const { data, error } = await supabase.rpc('buy_lottery_tickets', {
        p_cycle_id: status.cycle_id,
        p_quantity: quantity,
        p_request_id: requestId,
        p_source: 'test'
      });
      
      if (error) throw error;
      
      if (data.status === 'success') {
        toast.success(`Acquistati ${quantity} biglietti!`, {
          description: `Totale: ${data.total_m1u} M1U`
        });
        
        // Refresh
        refetchBalance();
        loadStatus();
        if (showTickets) loadTickets();
        
        // Reset quantity
        setQuantity(1);
      } else if (data.status === 'already_purchased') {
        toast.info('Acquisto già completato', {
          description: 'Idempotenza: stesso request_id'
        });
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
  
  // Admin: Execute draw
  const handleExecuteDraw = async () => {
    if (!status || !isAdmin) return;
    
    if (!confirm('Sei sicuro di voler eseguire l\'estrazione? Questa azione è irreversibile.')) {
      return;
    }
    
    setIsDrawing(true);
    
    try {
      const { data, error } = await supabase.rpc('finalize_cycle_and_draw', {
        p_cycle_id: status.cycle_id
      });
      
      if (error) throw error;
      
      if (data.status === 'success') {
        toast.success('Estrazione completata!', {
          description: `${data.winners?.length || 0} vincitori, multiplier: ${(data.prize_multiplier * 100).toFixed(0)}%`
        });
        
        loadStatus();
        loadAdminAnalytics();
      } else {
        toast.error('Errore', { description: data.message });
      }
    } catch (err: any) {
      toast.error('Errore', { description: err.message });
    } finally {
      setIsDrawing(false);
    }
  };
  
  // Admin: Cancel cycle
  const handleCancelCycle = async () => {
    if (!status || !isAdmin) return;
    
    const reason = prompt('Motivo annullamento:');
    if (!reason) return;
    
    try {
      const { data, error } = await supabase.rpc('cancel_lottery_cycle', {
        p_cycle_id: status.cycle_id,
        p_reason: reason
      });
      
      if (error) throw error;
      
      if (data.status === 'success') {
        toast.success('Ciclo annullato', {
          description: `Rimborsati ${data.refunds_count} acquisti (${data.total_refunded} M1U)`
        });
        
        loadStatus();
        refetchBalance();
      } else {
        toast.error('Errore', { description: data.message });
      }
    } catch (err: any) {
      toast.error('Errore', { description: err.message });
    }
  };
  
  // Render
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-4 pb-24">
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CLAIM PRIZE MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showClaimModal && selectedWin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowClaimModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-yellow-500/30 overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header with sparkles animation */}
              <div className="relative bg-gradient-to-r from-yellow-500/20 to-amber-600/20 p-6 text-center overflow-hidden">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent, gold, transparent, gold, transparent)'
                  }}
                />
                
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative"
                >
                  <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                </motion.div>
                
                <h2 className="text-3xl font-bold text-white relative">
                  🎉 HAI VINTO! 🎉
                </h2>
                <p className="text-yellow-400/80 relative mt-2">
                  {selectedWin.prize_label}
                </p>
                
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <XIcon className="w-5 h-5 text-white/70" />
                </button>
              </div>
              
              {/* Prize Details */}
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-2">Premio</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-5xl font-bold text-yellow-400"
                  >
                    +{selectedWin.prize_m1u.toLocaleString()}
                  </motion.p>
                  <p className="text-yellow-400/60 text-lg">M1U</p>
                </div>
                
                {/* Deadline warning */}
                <div className="flex items-center justify-center gap-2 text-orange-400 bg-orange-500/10 rounded-lg p-3">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">
                    Riscuoti entro: <strong>{formatTimeRemaining(selectedWin.time_remaining_seconds)}</strong>
                  </span>
                </div>
                
                {/* Claim Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleClaimPrize(selectedWin)}
                  disabled={isClaiming}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-lg shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Riscuotendo...
                    </>
                  ) : (
                    <>
                      <Gift className="w-6 h-6" />
                      RISCUOTI VINCITA
                      <Sparkles className="w-6 h-6" />
                    </>
                  )}
                </motion.button>
                
                <p className="text-center text-white/40 text-xs">
                  Il premio verrà accreditato immediatamente sul tuo saldo M1U
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <div className="max-w-lg mx-auto">
        {/* Pending Wins Banner */}
        {pendingWins.length > 0 && !showClaimModal && (
          <motion.button
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => {
              setSelectedWin(pendingWins[0]);
              setShowClaimModal(true);
            }}
            className="w-full mb-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-left">
                <p className="font-bold text-yellow-400">Hai {pendingWins.length} vincita da riscuotere!</p>
                <p className="text-sm text-white/60">Clicca per riscuotere</p>
              </div>
            </div>
            <Gift className="w-6 h-6 text-yellow-400 animate-pulse" />
          </motion.button>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <Ticket className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Lotteria M1SSION</h1>
              <p className="text-sm text-white/60">Test Page • Solo Admin/Dev</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              loadStatus();
              loadWins();
              refetchBalance();
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-white/70" />
          </button>
        </div>
        
        {/* Balance Card */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-600/10 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Il tuo saldo</span>
            <span className="text-xl font-bold text-yellow-400">{balance.toLocaleString()} M1U</span>
          </div>
        </div>
        
        {/* No Active Cycle */}
        {!status && (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Nessun ciclo attivo</h2>
            <p className="text-white/60">Non ci sono lotterie attive al momento.</p>
            {isAdmin && (
              <p className="text-blue-400 mt-4 text-sm">
                Esegui la migrazione SQL per creare un ciclo di test.
              </p>
            )}
          </div>
        )}
        
        {/* Active Cycle */}
        {status && (
          <div className="space-y-4">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  status.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  status.status === 'drawing' ? 'bg-yellow-500/20 text-yellow-400' :
                  status.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {status.status.toUpperCase()}
                </span>
                
                {status.threshold_reached && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                    ✓ SOGLIA RAGGIUNTA
                  </span>
                )}
              </div>
              
              {/* Timer */}
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-white/50" />
                <div>
                  <p className="text-sm text-white/60">Tempo rimanente</p>
                  <p className="text-lg font-bold text-white">
                    {formatTimeRemaining(status.time_remaining_seconds)}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">Progresso soglia</span>
                  <span className="text-xs font-bold text-white">
                    {status.total_tickets.toLocaleString()} / {status.min_tickets_required.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, status.progress_percent)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      status.progress_percent >= 100 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                    }`}
                  />
                </div>
                <p className="text-xs text-white/40 mt-1">
                  {status.progress_percent.toFixed(1)}% • {status.total_participants} partecipanti
                </p>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-white/50">Prezzo</p>
                  <p className="text-lg font-bold text-yellow-400">{status.ticket_price_m1u}</p>
                  <p className="text-xs text-white/40">M1U</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-white/50">Montepremi</p>
                  <p className="text-lg font-bold text-cyan-400">{status.prize_pool_total.toLocaleString()}</p>
                  <p className="text-xs text-white/40">M1U</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-white/50">Multiplier</p>
                  <p className={`text-lg font-bold ${status.threshold_reached ? 'text-green-400' : 'text-orange-400'}`}>
                    {(status.prize_multiplier * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-white/40">premi</p>
                </div>
              </div>
              
              {/* Narrative */}
              <p className="text-sm text-white/70 italic text-center p-3 rounded-lg bg-white/5">
                "{status.narrative}"
              </p>
            </motion.div>
            
            {/* Prizes Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                Premi Top 3
              </h3>
              <div className="space-y-2">
                {(status.prizes_effective_json || status.prizes_json).map((prize, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-white/70">{prize.label || `${prize.rank}° Premio`}</span>
                    <span className="font-bold text-purple-400">
                      {prize.amount_m1u 
                        ? `${prize.amount_m1u.toLocaleString()} M1U` 
                        : `${prize.percent}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Buy Section */}
            {status.status === 'active' && user && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <h3 className="font-bold text-white mb-3">Acquista Biglietti</h3>
                
                {/* User Stats */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="text-white/60">I tuoi biglietti</span>
                  <span className="text-white font-bold">
                    {status.user_tickets_count} / {status.max_tickets_per_user}
                  </span>
                </div>
                
                {status.user_can_buy_more ? (
                  <>
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-5 h-5 text-white" />
                      </button>
                      
                      <div className="text-center">
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Math.min(status.user_remaining_tickets, parseInt(e.target.value) || 1)))}
                          className="w-20 text-center text-2xl font-bold text-white bg-transparent border-b-2 border-white/30 focus:border-green-400 outline-none"
                        />
                        <p className="text-xs text-white/50 mt-1">
                          = {(quantity * status.ticket_price_m1u).toLocaleString()} M1U
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setQuantity(Math.min(status.user_remaining_tickets, quantity + 1))}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        disabled={quantity >= status.user_remaining_tickets}
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    
                    {/* Quick Select */}
                    <div className="flex gap-2 mb-4">
                      {[1, 5, 10, 25].map((n) => (
                        <button
                          key={n}
                          onClick={() => setQuantity(Math.min(status.user_remaining_tickets, n))}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                            quantity === n 
                              ? 'bg-green-500 text-white' 
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                          disabled={n > status.user_remaining_tickets}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    
                    {/* Buy Button */}
                    <motion.button
                      onClick={handleBuyTickets}
                      disabled={isPurchasing || balance < quantity * status.ticket_price_m1u}
                      className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                        balance >= quantity * status.ticket_price_m1u
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500'
                          : 'bg-gray-500 cursor-not-allowed'
                      }`}
                      whileHover={{ scale: balance >= quantity * status.ticket_price_m1u ? 1.02 : 1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isPurchasing ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : balance < quantity * status.ticket_price_m1u ? (
                        'Saldo insufficiente'
                      ) : (
                        `🎫 ACQUISTA ${quantity} BIGLIETT${quantity > 1 ? 'I' : 'O'}`
                      )}
                    </motion.button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <p className="text-white font-bold">Hai raggiunto il limite!</p>
                    <p className="text-white/60 text-sm">Max {status.max_tickets_per_user} biglietti per questo ciclo</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Draw Results */}
            {status.draw && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Risultati Estrazione
                </h3>
                
                <div className="space-y-3">
                  {status.draw.winners.map((winner, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${
                      winner.user_id === user?.id 
                        ? 'bg-yellow-500/30 border border-yellow-500' 
                        : 'bg-white/5'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl mr-2">
                            {winner.rank === 1 ? '🥇' : winner.rank === 2 ? '🥈' : '🥉'}
                          </span>
                          <span className="font-bold text-white">
                            {winner.rank}° Posto
                          </span>
                          {winner.user_id === user?.id && (
                            <span className="ml-2 px-2 py-0.5 rounded text-xs bg-yellow-500 text-black font-bold">
                              TU!
                            </span>
                          )}
                        </div>
                        <span className="text-xl font-bold text-yellow-400">
                          +{winner.prize_m1u.toLocaleString()} M1U
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Proof */}
                <div className="mt-4 p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-white/40 mb-1">Draw Proof Hash</p>
                  <p className="text-xs text-white/60 font-mono break-all">
                    {status.draw.draw_proof_hash}
                  </p>
                </div>
              </div>
            )}
            
            {/* User Tickets Section */}
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setShowTickets(!showTickets)}
                className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="font-bold text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-blue-400" />
                  I tuoi biglietti ({status.user_tickets_count})
                </span>
                {showTickets ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
              </button>
              
              <AnimatePresence>
                {showTickets && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10"
                  >
                    <div className="p-4 max-h-64 overflow-y-auto space-y-2">
                      {tickets.length === 0 ? (
                        <p className="text-center text-white/50 py-4">Nessun biglietto</p>
                      ) : (
                        tickets.map((ticket) => (
                          <div 
                            key={ticket.id} 
                            className={`p-3 rounded-lg ${
                              ticket.status === 'winner' 
                                ? 'bg-yellow-500/20 border border-yellow-500/50' 
                                : 'bg-white/5'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-mono text-white/40">
                                  #{ticket.ticket_hash.slice(0, 8)}...
                                </span>
                                {ticket.draw_rank && (
                                  <span className="ml-2 text-yellow-400 font-bold">
                                    🏆 {ticket.draw_rank}° posto
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                {ticket.prize_amount ? (
                                  <span className="text-green-400 font-bold">
                                    +{ticket.prize_amount.toLocaleString()} M1U
                                  </span>
                                ) : (
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    ticket.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                    ticket.status === 'void' ? 'bg-red-500/20 text-red-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                                  }`}>
                                    {ticket.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Admin Section */}
            {isAdmin && (
              <div className="rounded-xl border border-red-500/30 overflow-hidden">
                <button
                  onClick={() => setShowAdmin(!showAdmin)}
                  className="w-full p-4 flex items-center justify-between bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <span className="font-bold text-red-400 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Admin Controls
                  </span>
                  {showAdmin ? <ChevronUp className="w-5 h-5 text-red-400/50" /> : <ChevronDown className="w-5 h-5 text-red-400/50" />}
                </button>
                
                <AnimatePresence>
                  {showAdmin && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-red-500/30"
                    >
                      <div className="p-4 space-y-4">
                        {/* Admin Actions */}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={handleExecuteDraw}
                            disabled={isDrawing || status.status !== 'active'}
                            className={`p-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                              status.status === 'active'
                                ? 'bg-green-500 text-white hover:bg-green-400'
                                : 'bg-gray-500 text-white/50 cursor-not-allowed'
                            }`}
                          >
                            {isDrawing ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <Play className="w-5 h-5" />
                                Estrai
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={handleCancelCycle}
                            disabled={status.status === 'completed' || status.status === 'cancelled'}
                            className={`p-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                              status.status !== 'completed' && status.status !== 'cancelled'
                                ? 'bg-red-500 text-white hover:bg-red-400'
                                : 'bg-gray-500 text-white/50 cursor-not-allowed'
                            }`}
                          >
                            <Ban className="w-5 h-5" />
                            Annulla
                          </button>
                        </div>
                        
                        {/* Analytics */}
                        {adminAnalytics && (
                          <div className="space-y-3">
                            <h4 className="font-bold text-white flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-blue-400" />
                              Analytics
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="p-2 rounded bg-white/5">
                                <p className="text-white/50">Cicli totali</p>
                                <p className="font-bold text-white">{adminAnalytics.cycles?.total || 0}</p>
                              </div>
                              <div className="p-2 rounded bg-white/5">
                                <p className="text-white/50">Biglietti venduti</p>
                                <p className="font-bold text-white">{adminAnalytics.sales?.total_tickets?.toLocaleString() || 0}</p>
                              </div>
                              <div className="p-2 rounded bg-white/5">
                                <p className="text-white/50">M1U incassati</p>
                                <p className="font-bold text-yellow-400">{adminAnalytics.sales?.total_m1u?.toLocaleString() || 0}</p>
                              </div>
                              <div className="p-2 rounded bg-white/5">
                                <p className="text-white/50">M1U distribuiti</p>
                                <p className="font-bold text-green-400">{adminAnalytics.prizes?.total_m1u_awarded?.toLocaleString() || 0}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LotteryTest;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

