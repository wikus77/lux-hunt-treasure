/**
 * M1SSION™ Shop Modal
 * Centro acquisti con 3 sezioni: Scratch & Win, Gira la Ruota, Lotteria
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Gift, RotateCcw, Ticket, AlertTriangle, CreditCard, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { toast } from 'sonner';

// Lazy load components
const FortuneWheel = lazy(() => import('@/components/feedback/FortuneWheel'));
const ScratchWinModal = lazy(() => import('@/components/scratch/ScratchWinModal'));

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ShopTab = 'scratch' | 'wheel' | 'lottery';

interface ScratchStats {
  tier_10?: { available: number; jackpot_available: boolean; user_purchases_today: number; daily_limit: number };
  tier_30?: { available: number; jackpot_available: boolean; user_purchases_today: number; daily_limit: number };
  tier_50?: { available: number; jackpot_available: boolean; user_purchases_today: number; daily_limit: number };
  user_m1u_balance?: number;
  user_total_purchases_today?: number;
  user_total_wins?: number;
}

const WHEEL_STORAGE_KEY = 'm1_fortune_wheel_last_spin';

const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUnifiedAuth();
  const { unitsData, refetch } = useM1UnitsRealtime(user?.id);
  const balance = unitsData?.balance ?? 0;

  const [activeTab, setActiveTab] = useState<ShopTab>('scratch');
  const [stats, setStats] = useState<ScratchStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);
  
  // Wheel state
  const [showWheel, setShowWheel] = useState(false);
  const [canSpinWheel, setCanSpinWheel] = useState(false);
  
  // Scratch modal state
  const [scratchPurchase, setScratchPurchase] = useState<{
    tier: 10 | 30 | 50;
    purchaseId: string;
    clientNonce: string;
  } | null>(null);

  // Check wheel availability
  useEffect(() => {
    const checkWheel = () => {
      const lastSpin = localStorage.getItem(WHEEL_STORAGE_KEY);
      const canSpin = !lastSpin || new Date(lastSpin).toDateString() !== new Date().toDateString();
      setCanSpinWheel(canSpin);
    };
    
    checkWheel();
    window.addEventListener('storage', checkWheel);
    return () => window.removeEventListener('storage', checkWheel);
  }, []);

  // Load scratch stats
  const loadStats = async () => {
    if (!user) return;
    
    setIsLoadingStats(true);
    try {
      const { data, error } = await supabase.rpc('get_scratch_stats');
      if (error) throw error;
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load scratch stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load stats on open
  useEffect(() => {
    if (isOpen && user) {
      loadStats();
    }
  }, [isOpen, user]);

  // Generate nonce
  const generateNonce = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Purchase scratch ticket
  const handlePurchase = async (tier: 10 | 30 | 50) => {
    if (!user) {
      toast.error('Devi essere autenticato');
      return;
    }

    setIsPurchasing(tier);
    const clientNonce = generateNonce();

    try {
      const { data, error } = await supabase.rpc('purchase_scratch_ticket', {
        p_tier: tier,
        p_client_nonce: clientNonce,
      });

      if (error) throw error;

      if (data.status === 'success' || data.status === 'already_purchased') {
        refetch();
        loadStats();
        
        // Open scratch modal
        setScratchPurchase({
          tier,
          purchaseId: data.purchase_id,
          clientNonce,
        });
      } else if (data.status === 'insufficient_balance') {
        toast.error('Saldo insufficiente', { description: data.message });
      } else if (data.status === 'error') {
        toast.error('Errore', { description: data.message });
      }
    } catch (err: any) {
      toast.error('Errore', { description: err.message });
    } finally {
      setIsPurchasing(null);
    }
  };

  // Handle scratch close
  const handleScratchClose = () => {
    setScratchPurchase(null);
    refetch();
    loadStats();
  };

  // Handle wheel close
  const handleWheelClose = () => {
    setShowWheel(false);
    // Recheck wheel availability
    const lastSpin = localStorage.getItem(WHEEL_STORAGE_KEY);
    const canSpin = !lastSpin || new Date(lastSpin).toDateString() !== new Date().toDateString();
    setCanSpinWheel(canSpin);
    window.dispatchEvent(new CustomEvent('wheel-spun'));
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl flex flex-col"
          style={{
            background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            boxShadow: '0 0 60px rgba(147, 51, 234, 0.3), inset 0 0 30px rgba(147, 51, 234, 0.1)',
            height: 'calc(100vh - 140px)', // Tra header e bottom nav
            marginTop: '60px', // Spazio per header
            marginBottom: '80px', // Spazio per bottom nav
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">M1SSION SHOP</h2>
                <p className="text-sm text-white/60">Saldo: <span className="text-yellow-400 font-bold">{balance.toLocaleString()} M1U</span></p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {[
              { id: 'scratch' as ShopTab, label: 'Scratch & Win', color: 'from-yellow-500 to-amber-600' },
              { id: 'wheel' as ShopTab, label: 'Gira la Ruota', color: 'from-green-500 to-emerald-600', badge: canSpinWheel },
              { id: 'lottery' as ShopTab, label: 'Lotteria', color: 'from-blue-500 to-cyan-600', coming: true },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center py-3 px-2 text-xs font-bold transition-all relative ${
                  activeTab === tab.id 
                    ? 'text-white' 
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <span>{tab.label}</span>
                
                {/* Active indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tab.color}`}
                  />
                )}
                
                {/* Badge for available actions */}
                {tab.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                )}
                
                {/* Coming soon badge */}
                {tab.coming && (
                  <span className="absolute -top-1 right-0 px-1 py-0.5 text-[8px] font-bold bg-blue-500 text-white rounded">SOON</span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1">
            {/* SCRATCH & WIN TAB */}
            {activeTab === 'scratch' && (
              <div className="space-y-4">
                <p className="text-sm text-white/70 text-center mb-4">
                  Acquista un biglietto e gratta per vincere <span className="text-cyan-400 font-bold">INDIZI</span> o fino a <span className="text-yellow-400 font-bold">100.000 M1U</span>!
                </p>
                
                {isLoadingStats ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {[10, 30, 50].map((tier) => {
                      const tierKey = `tier_${tier}` as 'tier_10' | 'tier_30' | 'tier_50';
                      const tierData = stats?.[tierKey];
                      const purchasesToday = tierData?.user_purchases_today ?? 0;
                      const dailyLimit = tierData?.daily_limit ?? 10;
                      
                      const canAfford = balance >= tier;
                      const underLimit = purchasesToday < dailyLimit;
                      const canPurchase = canAfford && underLimit;
                      const maxJackpot = tier === 10 ? 1000 : tier === 30 ? 10000 : 100000;
                      
                      let disabledReason = '';
                      if (!canAfford) disabledReason = `Servono ${tier} M1U`;
                      else if (!underLimit) disabledReason = 'Limite giornaliero raggiunto';

                      return (
                        <motion.button
                          key={tier}
                          onClick={() => handlePurchase(tier as 10 | 30 | 50)}
                          disabled={isPurchasing !== null || !canPurchase}
                          className={`relative p-4 rounded-xl text-left transition-all ${
                            canPurchase 
                              ? 'bg-gradient-to-r from-yellow-500/10 to-amber-600/10 border border-yellow-500/30 hover:border-yellow-500/60'
                              : 'bg-white/5 border border-white/10 opacity-60'
                          }`}
                          whileHover={canPurchase ? { scale: 1.02 } : {}}
                          whileTap={canPurchase ? { scale: 0.98 } : {}}
                        >
                          {/* Jackpot badge - posizione fissa in alto a destra */}
                          {tierData?.jackpot_available && (
                            <div className="absolute top-2 right-2 z-10">
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-full animate-pulse">
                                🎰 JACKPOT
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pr-20">
                            <div className="flex items-center gap-3">
                              {isPurchasing === tier ? (
                                <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
                              ) : (
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  canPurchase ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : 'bg-white/20'
                                }`}>
                                  <Gift className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-white">{tier} M1U</p>
                                <p className="text-xs text-white/60">Jackpot: {maxJackpot.toLocaleString()} M1U</p>
                              </div>
                            </div>
                            
                            {/* Info rimasti - spostato a sinistra per non sovrapporsi a JACKPOT */}
                            <div className="text-right">
                              {!canPurchase && disabledReason ? (
                                <p className="text-xs text-red-400 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  {disabledReason}
                                </p>
                              ) : (
                                <p className="text-xs text-green-400">
                                  {dailyLimit - purchasesToday} rimasti oggi
                                </p>
                              )}
                              <p className="text-[10px] text-white/40 mt-1">
                                {tierData?.available ?? '?'} biglietti
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* GIRA LA RUOTA TAB */}
            {activeTab === 'wheel' && (
              <div className="space-y-4 text-center">
                <div className="py-8">
                  <motion.div
                    animate={{ rotate: canSpinWheel ? [0, 360] : 0 }}
                    transition={{ duration: 4, repeat: canSpinWheel ? Infinity : 0, ease: 'linear' }}
                    className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{
                      background: canSpinWheel 
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'linear-gradient(135deg, #374151, #1f2937)',
                      boxShadow: canSpinWheel ? '0 0 30px rgba(16, 185, 129, 0.5)' : 'none',
                    }}
                  >
                    <RotateCcw className={`w-12 h-12 ${canSpinWheel ? 'text-white' : 'text-white/50'}`} />
                  </motion.div>
                  
                  {canSpinWheel ? (
                    <>
                      <h3 className="text-xl font-bold text-white mb-2">Giro GRATUITO disponibile!</h3>
                      <p className="text-white/60 mb-6">Gira la ruota e vinci M1U ogni giorno</p>
                      <motion.button
                        onClick={() => setShowWheel(true)}
                        className="px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        🎡 GIRA ORA!
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-white/60 mb-2">Hai già girato oggi</h3>
                      <p className="text-white/40">Torna domani per un nuovo giro gratuito!</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* LOTTERIA TAB */}
            {activeTab === 'lottery' && (
              <div className="space-y-4 text-center py-12">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
                >
                  <Ticket className="w-10 h-10 text-blue-400" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-white">Lotteria M1SSION</h3>
                <p className="text-white/60 max-w-xs mx-auto">
                  Acquista biglietti della lotteria e partecipa all'estrazione settimanale di <span className="text-cyan-400 font-bold">MEGA PREMI</span>!
                </p>
                
                <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-blue-300 font-medium">🚧 In arrivo...</p>
                  <p className="text-xs text-white/50 mt-1">Questa funzione sarà disponibile a breve!</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}
      
      {/* Fortune Wheel Modal */}
      <Suspense fallback={null}>
        <FortuneWheel isOpen={showWheel} onClose={handleWheelClose} />
      </Suspense>
      
      {/* Scratch Win Modal */}
      {scratchPurchase && (
        <Suspense fallback={null}>
          <ScratchWinModal
            isOpen={true}
            onClose={handleScratchClose}
            tier={scratchPurchase.tier}
            purchaseId={scratchPurchase.purchaseId}
            clientNonce={scratchPurchase.clientNonce}
          />
        </Suspense>
      )}
    </>
  );
};

export default ShopModal;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

