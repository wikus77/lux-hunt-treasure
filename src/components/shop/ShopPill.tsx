/**
 * M1SSION™ Shop Pill
 * Combined access to Fortune Wheel + Scratch & Win
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, ShoppingBag, X, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { toast } from 'sonner';
import { SectionErrorBoundary } from '@/components/error/SectionErrorBoundary';
import ScratchWinModal from '@/components/scratch/ScratchWinModal';

// Lazy load FortuneWheel per ridurre memory footprint iniziale
const FortuneWheel = lazy(() => import('@/components/feedback/FortuneWheel'));

const STORAGE_KEY = 'm1_fortune_wheel_last_spin';

// Tier configurations for Scratch & Win
const SCRATCH_TIERS = [
  { 
    tier: 10 as const, 
    image: '/assets/scratch/scratch-win-10m1u.png',
    maxJackpot: 1000,
    color: '#FFD700',
    gradient: 'from-yellow-500 to-amber-600',
    label: 'BRONZE',
  },
  { 
    tier: 30 as const, 
    image: '/assets/scratch/scratch-win-30m1u.png',
    maxJackpot: 10000,
    color: '#00BFFF',
    gradient: 'from-cyan-500 to-blue-600',
    label: 'SILVER',
  },
  { 
    tier: 50 as const, 
    image: '/assets/scratch/scratch-win-50m1u.png',
    maxJackpot: 100000,
    color: '#FF1493',
    gradient: 'from-pink-500 to-purple-600',
    label: 'GOLD',
  },
];

export const ShopPill: React.FC = () => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [canSpinWheel, setCanSpinWheel] = useState(false);
  const [scratchPurchase, setScratchPurchase] = useState<{
    tier: 10 | 30 | 50;
    purchaseId: string;
    clientNonce: string;
  } | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);
  const [scratchStats, setScratchStats] = useState<any>(null);
  
  const { user } = useUnifiedAuth();
  const { unitsData, refetch } = useM1UnitsRealtime(user?.id);
  const balance = unitsData?.balance ?? 0;

  // Check if user can spin wheel today
  useEffect(() => {
    const lastSpin = localStorage.getItem(STORAGE_KEY);
    if (lastSpin) {
      const lastSpinDate = new Date(lastSpin).toDateString();
      const today = new Date().toDateString();
      setCanSpinWheel(lastSpinDate !== today);
    } else {
      setCanSpinWheel(true);
    }
  }, []);

  // Load scratch stats
  useEffect(() => {
    if (isShopOpen && user) {
      loadScratchStats();
    }
  }, [isShopOpen, user]);

  const loadScratchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_scratch_stats');
      if (error) throw error;
      setScratchStats(data);
    } catch (err) {
      console.error('Failed to load scratch stats:', err);
    }
  };

  // Generate unique nonce for idempotency
  const generateNonce = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Purchase scratch ticket
  const handlePurchase = async (tier: 10 | 30 | 50) => {
    if (!user) {
      toast.error('Devi essere loggato per acquistare');
      return;
    }

    if (balance < tier) {
      toast.error(`Saldo insufficiente. Hai ${balance} M1U, servono ${tier} M1U`);
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
        // Update balance
        refetch();
        
        // Open scratch modal
        setScratchPurchase({
          tier,
          purchaseId: data.purchase_id,
          clientNonce,
        });
        
        setIsShopOpen(false);
        
      } else if (data.status === 'insufficient_balance') {
        toast.error(`Saldo insufficiente. Hai ${data.current_balance} M1U`);
      } else {
        toast.error(data.message || 'Errore durante l\'acquisto');
      }

    } catch (err: any) {
      console.error('Purchase error:', err);
      toast.error(err.message || 'Errore durante l\'acquisto');
    } finally {
      setIsPurchasing(null);
    }
  };

  // Handle wheel close
  const handleWheelClose = () => {
    setShowWheel(false);
    // Recheck wheel availability
    const lastSpin = localStorage.getItem(STORAGE_KEY);
    if (lastSpin) {
      const lastSpinDate = new Date(lastSpin).toDateString();
      const today = new Date().toDateString();
      setCanSpinWheel(lastSpinDate !== today);
    }
  };

  // Handle scratch close
  const handleScratchClose = () => {
    setScratchPurchase(null);
    refetch();
    loadScratchStats();
  };

  // Shop Modal
  const shopModal = isShopOpen && createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/80 backdrop-blur-md"
        onClick={(e) => e.target === e.currentTarget && setIsShopOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] rounded-2xl border border-white/10 shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={() => setIsShopOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-b from-[#0a1628] to-transparent p-6 pb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">M1 SHOP</h2>
            </div>
            <p className="text-white/60 text-sm">Saldo: <span className="text-yellow-400 font-bold">{balance.toLocaleString()} M1U</span></p>
          </div>

          <div className="p-6 pt-2 space-y-6">
            {/* Fortune Wheel Section */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-400" />
                Ruota della Fortuna
                {canSpinWheel && (
                  <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    GRATUITO
                  </span>
                )}
              </h3>
              
              <button
                onClick={() => {
                  setIsShopOpen(false);
                  setShowWheel(true);
                }}
                disabled={!canSpinWheel}
                className={`w-full p-4 rounded-xl border transition-all ${
                  canSpinWheel
                    ? 'bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border-yellow-500/40 hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/20'
                    : 'bg-gray-800/50 border-gray-700/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={canSpinWheel ? { rotate: [0, 360] } : {}}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                      <Gift className={`w-10 h-10 ${canSpinWheel ? 'text-yellow-400' : 'text-gray-500'}`} />
                    </motion.div>
                    <div className="text-left">
                      <p className={`font-bold ${canSpinWheel ? 'text-white' : 'text-gray-500'}`}>
                        {canSpinWheel ? 'GIRA GRATIS!' : 'Già girato oggi'}
                      </p>
                      <p className="text-xs text-white/50">1 giro gratuito al giorno</p>
                    </div>
                  </div>
                  {canSpinWheel && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-green-500"
                    />
                  )}
                </div>
              </button>
            </section>

            {/* Scratch & Win Section */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">🎫</span>
                Scratch & Win
              </h3>
              
              <div className="grid gap-3">
                {SCRATCH_TIERS.map((tierConfig) => {
                  const tierKey = `tier_${tierConfig.tier}` as 'tier_10' | 'tier_30' | 'tier_50';
                  const available = scratchStats?.[tierKey]?.available ?? 0;
                  const jackpotAvailable = scratchStats?.[tierKey]?.jackpot_available ?? true;
                  const canAfford = balance >= tierConfig.tier;
                  
                  return (
                    <motion.button
                      key={tierConfig.tier}
                      onClick={() => handlePurchase(tierConfig.tier)}
                      disabled={isPurchasing !== null || !canAfford || available === 0}
                      className={`relative w-full p-4 rounded-xl border transition-all overflow-hidden ${
                        canAfford && available > 0
                          ? `bg-gradient-to-r ${tierConfig.gradient}/10 border-white/20 hover:border-white/40 hover:shadow-lg`
                          : 'bg-gray-800/30 border-gray-700/30 opacity-60 cursor-not-allowed'
                      }`}
                      whileHover={canAfford && available > 0 ? { scale: 1.02 } : {}}
                      whileTap={canAfford && available > 0 ? { scale: 0.98 } : {}}
                    >
                      {/* Background glow */}
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{ 
                          background: `radial-gradient(circle at 50% 50%, ${tierConfig.color}, transparent 70%)` 
                        }}
                      />
                      
                      <div className="relative flex items-center gap-4">
                        {/* Ticket preview */}
                        <div className="w-16 h-12 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                          <img 
                            src={tierConfig.image} 
                            alt={`Ticket ${tierConfig.tier} M1U`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span 
                              className={`text-xs font-bold px-2 py-0.5 rounded bg-gradient-to-r ${tierConfig.gradient} text-white`}
                            >
                              {tierConfig.label}
                            </span>
                            {jackpotAvailable && (
                              <span className="text-xs text-yellow-400">🎰 JACKPOT!</span>
                            )}
                          </div>
                          <p className="text-white font-bold text-lg">
                            {tierConfig.tier} M1U
                          </p>
                          <p className="text-xs text-white/50">
                            Max {tierConfig.maxJackpot.toLocaleString()} M1U • {available} disponibili
                          </p>
                        </div>
                        
                        {/* Price / Action */}
                        <div className="flex-shrink-0">
                          {isPurchasing === tierConfig.tier ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          ) : (
                            <motion.div
                              className={`px-4 py-2 rounded-full font-bold text-sm ${
                                canAfford && available > 0
                                  ? `bg-gradient-to-r ${tierConfig.gradient} text-white`
                                  : 'bg-gray-700 text-gray-400'
                              }`}
                              whileHover={{ scale: 1.05 }}
                            >
                              {!canAfford ? 'INSUFFICIENTE' : available === 0 ? 'ESAURITO' : 'COMPRA'}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Daily limit info */}
              {scratchStats && (
                <p className="mt-3 text-center text-xs text-white/40">
                  Acquisti oggi: {scratchStats.user_purchases_today}/10 • 
                  Vinti totali: {scratchStats.user_total_wins?.toLocaleString() ?? 0} M1U
                </p>
              )}
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );

  return (
    <>
      {/* Shop Pill Button */}
      <motion.button
        onClick={() => setIsShopOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.15))',
          border: '1px solid rgba(255, 215, 0, 0.4)',
          boxShadow: '0 2px 12px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.1)',
          backdropFilter: 'blur(12px)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Animated icon */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ShoppingBag className="w-5 h-5 text-yellow-400" />
        </motion.div>
        
        <span className="text-sm font-bold text-yellow-400">SHOP</span>
        
        {/* Notification dot if wheel available */}
        {canSpinWheel && (
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Shop Modal */}
      {shopModal}

      {/* Fortune Wheel */}
      <SectionErrorBoundary section="Ruota della Fortuna" fallbackHeight="0px" showRetry={false}>
        <Suspense fallback={null}>
          <FortuneWheel 
            isOpen={showWheel} 
            onClose={handleWheelClose}
          />
        </Suspense>
      </SectionErrorBoundary>

      {/* Scratch Win Modal */}
      {scratchPurchase && (
        <ScratchWinModal
          isOpen={true}
          onClose={handleScratchClose}
          tier={scratchPurchase.tier}
          purchaseId={scratchPurchase.purchaseId}
          clientNonce={scratchPurchase.clientNonce}
        />
      )}
    </>
  );
};

export default ShopPill;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

