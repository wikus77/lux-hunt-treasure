/**
 * Reward Counter Pill - Shows available vs claimed marker rewards
 * Glassmorphism style like BattleShopPill
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
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
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <>
      {/* Glassmorphism Reward Pill */}
      <motion.button
        className={`pill-orb ${className}`}
        onClick={() => setIsOpen(true)}
        aria-label="Marker Rewards disponibili"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Gift className="w-5 h-5 text-yellow-300" />
        <span className="dot" style={{ background: '#ffd700', boxShadow: '0 0 8px #ffd700' }} />
        
        {/* Available count badge - shows X/99 format */}
        {!isLoading && (
          <Badge
            className="absolute -top-1 -right-1 h-5 min-w-[28px] px-1.5 flex items-center justify-center text-[9px] bg-gradient-to-br from-yellow-500 to-orange-600 border-2 border-background font-bold"
          >
            {stats.available}/{stats.total}
          </Badge>
        )}
      </motion.button>

      {/* Stats Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[5000] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              className="relative w-full max-w-sm overflow-hidden rounded-2xl"
              style={{
                background: 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                boxShadow: '0 0 40px rgba(255, 215, 0, 0.15), 0 25px 50px rgba(0, 0, 0, 0.5)',
              }}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              {/* Header */}
              <div className="relative px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2.5 rounded-xl"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(255,215,0,0.2), rgba(255,165,0,0.3) 80%)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                    }}
                  >
                    <Gift className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-orbitron">Rewards</h2>
                    <p className="text-xs text-gray-400">Premi sulla Mappa</p>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Progress Circle */}
                    <div className="flex justify-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="url(#rewardGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${availablePercent * 3.52} 352`}
                          />
                          <defs>
                            <linearGradient id="rewardGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#ffd700" />
                              <stop offset="100%" stopColor="#ff8c00" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-yellow-400">{stats.available}</span>
                          <span className="text-xs text-gray-400">disponibili</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                        <MapPin className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{stats.total}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Totali</div>
                      </div>
                      
                      <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
                        <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-green-400">{stats.claimed}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Riscattati</div>
                      </div>
                      
                      <div className="bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/20">
                        <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-yellow-400">{stats.available}</div>
                        <div className="text-[10px] text-gray-400 uppercase">Disponibili</div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                      <p className="text-sm text-emerald-200/80 text-center">
                        🎁 Trova i marker <span className="text-emerald-400 font-semibold">verdi</span> sulla mappa per riscattare premi istantanei!
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default RewardCounterPill;

