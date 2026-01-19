/**
 * M1SSION™ SCRATCH & WIN Test Page
 * Development testing for the Scratch & Win feature
 * 
 * Route: /dev/scratch-win
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CreditCard, Loader2, Check, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import ScratchWinModal from '@/components/scratch/ScratchWinModal';

interface Log {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

const ScratchWinTest: React.FC = () => {
  const { user } = useUnifiedAuth();
  const { unitsData, refetch } = useM1UnitsRealtime(user?.id);
  const balance = unitsData?.balance ?? 0;
  
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);
  const [scratchPurchase, setScratchPurchase] = useState<{
    tier: 10 | 30 | 50;
    purchaseId: string;
    clientNonce: string;
  } | null>(null);
  
  // Asset test state
  const [assetStatus, setAssetStatus] = useState<{
    tier10: 'loading' | 'ok' | 'error';
    tier30: 'loading' | 'ok' | 'error';
    tier50: 'loading' | 'ok' | 'error';
  }>({
    tier10: 'loading',
    tier30: 'loading',
    tier50: 'loading',
  });

  // Add log
  const addLog = (type: Log['type'], message: string, data?: any) => {
    const newLog: Log = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString().split('T')[1].split('.')[0],
      type,
      message,
      data,
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // Load stats
  const loadStats = async () => {
    setIsLoadingStats(true);
    addLog('info', 'Loading scratch stats...');
    
    try {
      const { data, error } = await supabase.rpc('get_scratch_stats');
      
      if (error) {
        addLog('error', `RPC Error: ${error.message}`, error);
        return;
      }
      
      setStats(data);
      addLog('success', 'Stats loaded successfully', data);
    } catch (err: any) {
      addLog('error', `Exception: ${err.message}`, err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Test asset loading
  useEffect(() => {
    const testAsset = (tier: 10 | 30 | 50, key: 'tier10' | 'tier30' | 'tier50') => {
      const img = new Image();
      img.onload = () => {
        setAssetStatus(prev => ({ ...prev, [key]: 'ok' }));
        addLog('success', `Asset ${tier}M1U loaded: ${img.width}x${img.height}px`);
      };
      img.onerror = () => {
        setAssetStatus(prev => ({ ...prev, [key]: 'error' }));
        addLog('error', `Asset ${tier}M1U FAILED to load`);
      };
      img.src = `/assets/scratch/scratch-win-${tier}m1u.png`;
    };
    
    testAsset(10, 'tier10');
    testAsset(30, 'tier30');
    testAsset(50, 'tier50');
  }, []);

  // Initial load
  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  // Generate nonce
  const generateNonce = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Purchase ticket
  const handlePurchase = async (tier: 10 | 30 | 50) => {
    if (!user) {
      addLog('error', 'User not authenticated');
      return;
    }

    setIsPurchasing(tier);
    const clientNonce = generateNonce();
    addLog('info', `Purchasing tier ${tier} ticket...`, { clientNonce });

    try {
      const { data, error } = await supabase.rpc('purchase_scratch_ticket', {
        p_tier: tier,
        p_client_nonce: clientNonce,
      });

      if (error) {
        addLog('error', `Purchase RPC Error: ${error.message}`, error);
        return;
      }

      addLog(data.status === 'success' ? 'success' : 'warning', `Purchase response: ${data.status}`, data);

      if (data.status === 'success' || data.status === 'already_purchased') {
        refetch();
        loadStats();
        
        // Open scratch modal
        setScratchPurchase({
          tier,
          purchaseId: data.purchase_id,
          clientNonce,
        });
      }
    } catch (err: any) {
      addLog('error', `Exception: ${err.message}`, err);
    } finally {
      setIsPurchasing(null);
    }
  };

  // Handle scratch close
  const handleScratchClose = () => {
    addLog('info', 'Scratch modal closed');
    setScratchPurchase(null);
    refetch();
    loadStats();
  };

  return (
    <div className="min-h-screen bg-[#070818] text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🎫 SCRATCH & WIN Test Page</h1>
          <p className="text-white/60">Development testing for the Scratch & Win feature</p>
        </div>

        {/* User Info */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <h2 className="font-bold mb-2">User Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/50">User ID:</span>
              <p className="font-mono text-xs">{user?.id || 'Not authenticated'}</p>
            </div>
            <div>
              <span className="text-white/50">M1U Balance:</span>
              <p className="text-2xl font-bold text-yellow-400">{balance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Asset Test */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <h2 className="font-bold mb-3">Asset Verification</h2>
          <div className="grid grid-cols-3 gap-4">
            {[10, 30, 50].map((tier) => {
              const key = `tier${tier}` as 'tier10' | 'tier30' | 'tier50';
              const status = assetStatus[key];
              
              return (
                <div key={tier} className="text-center">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black/30 mb-2">
                    <img 
                      src={`/assets/scratch/scratch-win-${tier}m1u.png`}
                      alt={`Ticket ${tier}M1U`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                      status === 'ok' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                      {status === 'ok' ? <Check className="w-4 h-4" /> : 
                       status === 'error' ? <X className="w-4 h-4" /> : 
                       <Loader2 className="w-4 h-4 animate-spin" />}
                    </div>
                  </div>
                  <p className="text-sm font-bold">{tier} M1U</p>
                  <p className={`text-xs ${
                    status === 'ok' ? 'text-green-400' : status === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {status === 'ok' ? '✓ Loaded' : status === 'error' ? '✗ Failed' : 'Loading...'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Pool Statistics</h2>
            <button 
              onClick={loadStats}
              disabled={isLoadingStats}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {stats ? (
            <div className="grid grid-cols-3 gap-4 text-sm">
              {[10, 30, 50].map((tier) => {
                const tierKey = `tier_${tier}` as 'tier_10' | 'tier_30' | 'tier_50';
                const tierData = stats[tierKey];
                const purchasesToday = tierData?.user_purchases_today ?? 0;
                const dailyLimit = tierData?.daily_limit ?? 10;
                const canBuyMore = purchasesToday < dailyLimit;
                
                return (
                  <div key={tier} className={`bg-black/30 rounded-lg p-3 ${!canBuyMore ? 'opacity-60' : ''}`}>
                    <p className="font-bold text-lg">{tier} M1U</p>
                    <p className="text-white/50">Disponibili: <span className="text-white">{tierData?.available ?? '?'}</span></p>
                    <p className="text-white/50">
                      Jackpot: {tierData?.jackpot_available ? (
                        <span className="text-green-400">🎰 Disponibile</span>
                      ) : (
                        <span className="text-red-400">✗ Vinto</span>
                      )}
                    </p>
                    <p className={`mt-2 text-xs font-bold ${canBuyMore ? 'text-green-400' : 'text-red-400'}`}>
                      Oggi: {purchasesToday}/{dailyLimit}
                      {!canBuyMore && ' ⛔ LIMITE'}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/50">Loading stats...</p>
          )}
          
          {stats && (
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-white/50">Saldo M1U:</span>
                <p className="font-bold text-2xl text-yellow-400">{(stats.user_m1u_balance ?? balance).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-white/50">Acquisti oggi (totale):</span>
                <p className="font-bold">{stats.user_total_purchases_today ?? 0} / 30</p>
              </div>
              <div>
                <span className="text-white/50">M1U vinti totale:</span>
                <p className="font-bold text-green-400">{(stats.user_total_wins ?? 0).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Purchase Buttons */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <h2 className="font-bold mb-3">Purchase Tickets</h2>
          <div className="grid grid-cols-3 gap-4">
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
                  className={`p-4 rounded-lg text-center transition-all ${
                    canPurchase 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/40 hover:border-yellow-500/60'
                      : 'bg-gray-800/50 border border-gray-700/40 opacity-50 cursor-not-allowed'
                  }`}
                  whileHover={canPurchase ? { scale: 1.02 } : {}}
                  whileTap={canPurchase ? { scale: 0.98 } : {}}
                >
                  {isPurchasing === tier ? (
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-yellow-400" />
                  ) : (
                    <>
                      <CreditCard className={`w-8 h-8 mx-auto mb-2 ${canPurchase ? 'text-yellow-400' : 'text-gray-500'}`} />
                      <p className="font-bold">{tier} M1U</p>
                      <p className="text-xs text-white/50">Max: {maxJackpot.toLocaleString()}</p>
                      {!canPurchase && disabledReason && (
                        <p className="text-xs text-red-400 mt-1 flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {disabledReason}
                        </p>
                      )}
                      {canPurchase && (
                        <p className="text-xs text-green-400 mt-1">
                          {dailyLimit - purchasesToday} rimasti oggi
                        </p>
                      )}
                    </>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Event Logs</h2>
            <button 
              onClick={() => setLogs([])}
              className="text-xs text-white/50 hover:text-white"
            >
              Clear
            </button>
          </div>
          
          <div className="h-64 overflow-y-auto font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <p className="text-white/30">No logs yet...</p>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id}
                  className={`p-2 rounded ${
                    log.type === 'error' ? 'bg-red-500/20 text-red-300' :
                    log.type === 'success' ? 'bg-green-500/20 text-green-300' :
                    log.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}
                >
                  <span className="text-white/50">[{log.timestamp}]</span> {log.message}
                  {log.data && (
                    <pre className="mt-1 text-[10px] text-white/50 overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Scratch Modal */}
      {scratchPurchase && (
        <ScratchWinModal
          isOpen={true}
          onClose={handleScratchClose}
          tier={scratchPurchase.tier}
          purchaseId={scratchPurchase.purchaseId}
          clientNonce={scratchPurchase.clientNonce}
        />
      )}
    </div>
  );
};

export default ScratchWinTest;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

