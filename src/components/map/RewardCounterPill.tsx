/**
 * Reward Counter Pill - Shows available vs claimed marker rewards
 * Revolut-style fullscreen modal (Jan 2026 update)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Gift, X, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MapPillFlipOverlay } from './MapPillFlipOverlay';
import '@/features/m1u/m1u-ui.css';

interface RewardStats {
  total: number;
  claimed: number;
  available: number;
}

interface RewardCounterPillProps {
  className?: string;
}

export function RewardCounterPill({ className = '' }: RewardCounterPillProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [stats, setStats] = useState<RewardStats>({ total: 0, claimed: 0, available: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Load reward stats
  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Get all active markers (simplified query)
      const { data: markersData, error: markersError } = await supabase
        .from('markers')
        .select('id')
        .eq('active', true);
      
      if (markersError) {
        console.error('[RewardCounterPill] Markers error:', markersError);
        // Fallback to 99 total if query fails
        setStats({ total: 99, claimed: 0, available: 99 });
        return;
      }
      
      // Use 99 as default if no markers found (they will be added by admin)
      const totalMarkers = markersData?.length || 99;
      
      // Get claimed markers
      const { data: claimsData, error: claimsError } = await supabase
        .from('marker_claims')
        .select('marker_id');
      
      if (claimsError) {
        console.error('[RewardCounterPill] Claims error:', claimsError);
        setStats({ total: totalMarkers, claimed: 0, available: totalMarkers });
        return;
      }
      
      // Count unique claimed markers
      const claimedMarkerIds = new Set((claimsData || []).map(c => c.marker_id));
      const claimedCount = claimedMarkerIds.size;
      
      setStats({
        total: Math.max(totalMarkers, 99), // At least 99
        claimed: claimedCount,
        available: Math.max(totalMarkers, 99) - claimedCount
      });
      
      console.log('[RewardCounterPill] Stats loaded:', { total: totalMarkers, claimed: claimedCount });
    } catch (error) {
      console.error('[RewardCounterPill] Error loading stats:', error);
      // Fallback
      setStats({ total: 99, claimed: 0, available: 99 });
    } finally {
      setIsLoading(false);
    }
  };

  // Load stats on mount and set up realtime subscription
  useEffect(() => {
    loadStats();
    
    // Subscribe to marker_claims changes for realtime updates
    const channel = supabase
      .channel('reward-counter-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'marker_claims' }, 
        () => {
          console.log('[RewardCounterPill] Claims updated, refreshing...');
          loadStats();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'markers' },
        () => {
          console.log('[RewardCounterPill] Markers updated, refreshing...');
          loadStats();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const availablePercent = stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0;

  const handlePillClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOriginRect(rect);
    setIsOpen(true);
  };

  return (
    <>
      {/* Reward Pill */}
      <motion.button
        className={`pill-orb ${className}`}
        onClick={handlePillClick}
        aria-label={t('mapPills.rewards.ariaLabel')}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Gift className="w-5 h-5 text-yellow-300" />
        <span className="dot" style={{ background: '#ffd700', boxShadow: '0 0 8px #ffd700' }} />
        
        {!isLoading && (
          <Badge
            className="absolute -top-1 -right-1 h-5 min-w-[28px] px-1.5 flex items-center justify-center text-[9px] bg-gradient-to-br from-yellow-500 to-orange-600 border-2 border-background font-bold"
          >
            {stats.available}/{stats.total}
          </Badge>
        )}
      </motion.button>

      {/* Revolut-style Fullscreen Modal */}
      <MapPillFlipOverlay
        open={isOpen}
        originRect={originRect}
        onClose={() => setIsOpen(false)}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
          {/* HEADER */}
          <div style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.8) 0%, rgba(200, 150, 0, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
            paddingBottom: '20px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button onClick={() => setIsOpen(false)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
              </button>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h1 style={{ color: '#000000', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>{t('mapPills.rewards.title')}</h1>
              </div>
              <div style={{ width: '40px' }} />
            </div>
            <p style={{ color: 'rgba(0,0,0,0.7)', fontSize: '13px', textAlign: 'center' }}>{t('mapPills.rewards.subtitle')}</p>
          </div>

          {/* CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid rgba(255, 215, 0, 0.3)', borderTopColor: '#FFD700', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <>
                {/* Progress Circle Card */}
                <GlassCard style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
                  <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                    <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                      <circle cx="70" cy="70" r="60" fill="none" stroke="url(#rewardGradient2)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${availablePercent * 3.77} 377`} />
                      <defs>
                        <linearGradient id="rewardGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ffd700" />
                          <stop offset="100%" stopColor="#ff8c00" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '36px', fontWeight: 700, color: '#FFD700' }}>{stats.available}</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t('mapPills.rewards.availableLabel')}</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <GlassCard style={{ textAlign: 'center', padding: '14px 8px' }}>
                    <MapPin style={{ width: '24px', height: '24px', color: '#FFD700', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF' }}>{stats.total}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{t('mapPills.rewards.total')}</div>
                  </GlassCard>
                  
                  <GlassCard style={{ textAlign: 'center', padding: '14px 8px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    <CheckCircle style={{ width: '24px', height: '24px', color: '#22C55E', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#22C55E' }}>{stats.claimed}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{t('mapPills.rewards.claimed')}</div>
                  </GlassCard>
                  
                  <GlassCard style={{ textAlign: 'center', padding: '14px 8px', background: 'rgba(255, 215, 0, 0.15)', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                    <Clock style={{ width: '24px', height: '24px', color: '#FFD700', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#FFD700' }}>{stats.available}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{t('mapPills.rewards.available')}</div>
                  </GlassCard>
                </div>

                {/* Info Card */}
                <GlassCard style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <p style={{ color: 'rgba(167, 243, 208, 0.9)', fontSize: '14px', textAlign: 'center', lineHeight: '1.6' }}>
                    🎁 {t('mapPills.rewards.hint')}
                  </p>
                </GlassCard>
              </>
            )}
          </div>
        </div>
      </MapPillFlipOverlay>
    </>
  );
}

// Glass Card component
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ 
    background: 'rgba(25, 25, 35, 0.7)', 
    backdropFilter: 'blur(24px)', 
    WebkitBackdropFilter: 'blur(24px)', 
    borderRadius: '14px', 
    padding: '16px', 
    border: '1px solid rgba(255, 255, 255, 0.08)', 
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)', 
    ...style 
  }}>
    {children}
  </div>
);

export default RewardCounterPill;

