// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Shop Content - REVOLUT STYLE con tab RIVELA, PROGRESSIONE, PERCORSO, M1U
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X, Loader2, Gift, RotateCcw, AlertTriangle, Sparkles, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { toast } from 'sonner';
import { M1UnitsShopModal } from '@/components/m1units/M1UnitsShopModal';

// Lazy load components
const FortuneWheel = lazy(() => import('@/components/feedback/FortuneWheel'));
const ScratchWinModal = lazy(() => import('@/components/scratch/ScratchWinModal'));
const LotteryContent = lazy(() => import('@/components/shop/LotteryContent'));

interface ShopContentProps {
  onClose: () => void;
}

type ShopTab = 'scratch' | 'wheel' | 'lottery' | 'm1u';

interface ScratchStats {
  tier_10?: { available: number; milestone_bonus: boolean; user_purchases_today: number; daily_limit: number };
  tier_30?: { available: number; milestone_bonus: boolean; user_purchases_today: number; daily_limit: number };
  tier_50?: { available: number; milestone_bonus: boolean; user_purchases_today: number; daily_limit: number };
  user_m1u_balance?: number;
  user_total_purchases_today?: number;
  user_total_wins?: number;
}

const WHEEL_STORAGE_KEY = 'm1_fortune_wheel_last_spin';

export const ShopContent: React.FC<ShopContentProps> = ({ onClose }) => {
  const { t } = useTranslation();
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

  // Load stats on mount
  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  // Generate nonce
  const generateNonce = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Purchase scratch ticket
  const handlePurchase = async (tier: 10 | 30 | 50) => {
    if (!user) {
      toast.error(t('shop_toast_auth'));
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
        
        setScratchPurchase({
          tier,
          purchaseId: data.purchase_id,
          clientNonce,
        });
      } else if (data.status === 'insufficient_balance') {
        toast.error(t('shop_toast_insufficient'), { description: data.message });
      } else if (data.status === 'error') {
        toast.error(t('shop_toast_error'), { description: data.message });
      }
    } catch (err: any) {
      toast.error(t('shop_toast_error'), { description: err.message });
    } finally {
      setIsPurchasing(null);
    }
  };

  const handleScratchClose = () => {
    setScratchPurchase(null);
    refetch();
    loadStats();
  };

  const handleWheelClose = () => {
    setShowWheel(false);
    const lastSpin = localStorage.getItem(WHEEL_STORAGE_KEY);
    const canSpin = !lastSpin || new Date(lastSpin).toDateString() !== new Date().toDateString();
    setCanSpinWheel(canSpin);
    window.dispatchEvent(new CustomEvent('wheel-spun'));
  };

  // State for M1U Shop modal (same modal as M1U Pill)
  const [showM1UShopModal, setShowM1UShopModal] = useState(false);

  const tabs = [
    { id: 'scratch' as ShopTab, label: t('shop_tab_rivela'), color: '#F59E0B' },
    { id: 'wheel' as ShopTab, label: t('shop_tab_progressione'), color: '#10B981', badge: canSpinWheel },
    { id: 'lottery' as ShopTab, label: t('shop_tab_percorso'), color: '#3B82F6' },
    { id: 'm1u' as ShopTab, label: 'M1U', color: '#FACC15' },
  ];

  return (
    <>
      <div 
        style={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
        }}
      >
        {/* HEADER - Gradiente viola/rosa */}
        <div 
          style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(147, 51, 234, 0.3) 0%, rgba(236, 72, 153, 0.2) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
            paddingBottom: '12px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <button
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
            </button>

            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Sparkles style={{ width: '20px', height: '20px', color: '#A855F7' }} />
                <h1 style={{ 
                  color: '#A855F7', 
                  fontSize: '18px', 
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}>
                  M1SSION SHOP
                </h1>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '2px' }}>
                {t('shop_balance')}: <span style={{ color: '#FACC15', fontWeight: 700 }}>{balance.toLocaleString()} M1U</span>
              </p>
            </div>

            <div style={{ width: '40px' }} />
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'm1u') {
                    // Open the same M1U Shop modal as M1U Pill
                    setShowM1UShopModal(true);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
                  color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  position: 'relative',
                  borderRadius: '8px 8px 0 0',
                }}
              >
                {tab.label}
                {tab.badge && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '8px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#FACC15',
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div 
          style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* RIVELA TAB */}
          {activeTab === 'scratch' && (
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>
                {t('shop_scratch_intro')}
              </p>
              
              {isLoadingStats ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
                  <Loader2 style={{ width: '32px', height: '32px', color: '#A855F7', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[10, 30, 50].map((tier) => {
                    const tierKey = `tier_${tier}` as 'tier_10' | 'tier_30' | 'tier_50';
                    const tierData = stats?.[tierKey];
                    const purchasesToday = tierData?.user_purchases_today ?? 0;
                    const dailyLimit = tierData?.daily_limit ?? 10;
                    
                    const canAfford = balance >= tier;
                    const underLimit = purchasesToday < dailyLimit;
                    const canPurchase = canAfford && underLimit;
                    const maxMilestone = tier === 10 ? 100 : tier === 30 ? 200 : 500;
                    
                    let disabledReason = '';
                    if (!canAfford) disabledReason = t('shop_need_m1u', { tier });
                    else if (!underLimit) disabledReason = t('shop_limit_reached');

                    return (
                      <GlassCard 
                        key={tier}
                        onClick={() => canPurchase && handlePurchase(tier as 10 | 30 | 50)}
                        style={{ 
                          opacity: canPurchase ? 1 : 0.6,
                          cursor: canPurchase ? 'pointer' : 'not-allowed',
                          background: canPurchase 
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)'
                            : 'rgba(25, 25, 35, 0.7)',
                          border: canPurchase ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                          position: 'relative',
                        }}
                      >
                        {tierData?.milestone_bonus && (
                          <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                            <span style={{ 
                              padding: '2px 8px', 
                              fontSize: '9px', 
                              fontWeight: 700, 
                              background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', 
                              color: '#FFFFFF', 
                              borderRadius: '10px' 
                            }}>
                              🎯 {t('shop_bonus_badge')}
                            </span>
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isPurchasing === tier ? (
                              <Loader2 style={{ width: '40px', height: '40px', color: '#F59E0B', animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: canPurchase ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Gift style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
                              </div>
                            )}
                            <div>
                              <p style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '14px' }}>{tier} M1U</p>
                              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{t('shop_milestone_max', { max: maxMilestone })}</p>
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'right' }}>
                            {!canPurchase && disabledReason ? (
                              <p style={{ color: '#F87171', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle style={{ width: '12px', height: '12px' }} />
                                {disabledReason}
                              </p>
                            ) : (
                              <p style={{ color: '#22C55E', fontSize: '11px' }}>
                                {dailyLimit - purchasesToday} {t('shop_remaining_today')}
                              </p>
                            )}
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '2px' }}>
                              {tierData?.available ?? '?'} biglietti
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PROGRESSIONE TAB */}
          {activeTab === 'wheel' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <motion.div
                animate={{ rotate: canSpinWheel ? [0, 360] : 0 }}
                transition={{ duration: 4, repeat: canSpinWheel ? Infinity : 0, ease: 'linear' }}
                style={{
                  width: '96px',
                  height: '96px',
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: canSpinWheel 
                    ? 'linear-gradient(135deg, #10B981, #059669)'
                    : 'linear-gradient(135deg, #374151, #1F2937)',
                  boxShadow: canSpinWheel ? '0 0 30px rgba(16, 185, 129, 0.5)' : 'none',
                }}
              >
                <RotateCcw style={{ width: '48px', height: '48px', color: canSpinWheel ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }} />
              </motion.div>
              
              {canSpinWheel ? (
                <>
                  <h3 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                    {t('shop_progression_free')}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '24px' }}>
                    {t('shop_progression_advance')}
                  </p>
                  <motion.button
                    onClick={() => setShowWheel(true)}
                    style={{
                      padding: '14px 32px',
                      borderRadius: '25px',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎡 {t('shop_gira_ora')}
                  </motion.button>
                </>
              ) : (
                <>
                  <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                    {t('shop_already_spun')}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    {t('shop_tomorrow_spin')}
                  </p>
                </>
              )}
            </div>
          )}

          {/* PERCORSO TAB */}
          {activeTab === 'lottery' && (
            <Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
                <Loader2 style={{ width: '32px', height: '32px', color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
              </div>
            }>
              <LotteryContent 
                balance={balance}
                onBalanceUpdate={refetch}
              />
            </Suspense>
          )}
        </div>
      </div>

      {/* Fortune Wheel Modal */}
      <Suspense fallback={null}>
        <FortuneWheel isOpen={showWheel} onClose={handleWheelClose} />
      </Suspense>
      
      {/* Scratch Modal */}
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

      {/* M1U Shop Modal - Same modal as M1U Pill (NOT duplicated!) */}
      <M1UnitsShopModal 
        isOpen={showM1UShopModal}
        onClose={() => setShowM1UShopModal(false)}
        originRect={null}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

// GLASS CARD
const GlassCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}> = ({ children, onClick, style }) => (
  <div
    onClick={onClick}
    style={{
      background: 'rgba(25, 25, 35, 0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '14px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      ...style,
    }}
  >
    {children}
  </div>
);

export default ShopContent;
