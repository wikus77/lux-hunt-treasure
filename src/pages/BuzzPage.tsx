
// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Page Component - RESET COMPLETO 17/07/2025

import React from 'react';
import { motion } from 'framer-motion';
import { BuzzActionButton } from '@/components/buzz/BuzzActionButton';
import { BuzzInstructions } from '@/components/buzz/BuzzInstructions';
import { useBuzzStats } from '@/hooks/useBuzzStats';
import { useBuzzPricing } from '@/hooks/useBuzzPricing';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';

export const BuzzPage: React.FC = () => {
  const { stats, loading, loadBuzzStats } = useBuzzStats();
  const { getCurrentBuzzPrice } = useBuzzPricing();

  const currentPrice = getCurrentBuzzPrice(stats?.today_count || 0);
  const isBlocked = false; // MAI BLOCCATO - ORDINE DIREZIONE

  const handleBuzzSuccess = async () => {
    // Force immediate stats reload - © 2025 Joseph MULÉ – M1SSION™
    setTimeout(async () => {
      await loadBuzzStats();
      console.log('🔄 Stats aggiornate post-BUZZ - RESET COMPLETO 17/07/2025');
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full fixed inset-0 flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#F059FF] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-[#070818] w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
        paddingTop: 'env(safe-area-inset-top, 47px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
    >
      {/* © 2025 Joseph MULÉ – M1SSION™ - HEADER UNIFICATA */}
      <div 
        className="fixed left-0 right-0 z-50 backdrop-blur-xl"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          background: 'rgba(19, 21, 33, 0.55)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <UnifiedHeader />
      </div>
      
      {/* Main scrollable content */}
      <main
        style={{
          paddingTop: 'calc(119px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="container mx-auto px-4">
          {/* © 2025 Joseph MULÉ – M1SSION™ */}
          
          {/* Titolo BUZZ - Spostato 10% più in basso */}
          <div className="text-center mt-[10%] mb-8">
            <h1 className="text-4xl font-orbitron font-bold">
              <span className="text-[#00ffff]">BU</span>
              <span className="text-white">ZZ</span>
            </h1>
          </div>

          {/* Container principale - Pulsante BUZZ prima del container */}
          <div className="max-w-3xl mx-auto">
            {/* Pulsante BUZZ - Prima del container */}
            <div className="text-center mb-6">
              <BuzzActionButton
                currentPrice={currentPrice}
                isBlocked={isBlocked}
                todayCount={stats?.today_count || 0}
                onSuccess={handleBuzzSuccess}
              />
            </div>

            {/* Container con descrizione - Sistema 200 indizi - RESET COMPLETO 17/07/2025 */}
            <div className="m1ssion-glass-card p-4 sm:p-6 mb-6">
              <div className="text-center space-y-4">
                {/* Descrizione BUZZ - SISTEMA 200 INDIZI - RESET COMPLETO 17/07/2025 */}
                <div className="text-white/80 space-y-2">
                  <p>Premi il pulsante per inviare un segnale e scoprire nuovi indizi. Ogni Buzz ti aiuta a trovare indizi nascosti per raggiungere l'obiettivo di 200 indizi totali.</p>
                  <p className="font-semibold">BUZZ oggi: {stats?.today_count || 0} (illimitati)</p>
                  <p className="font-semibold">BUZZ totali: {stats?.total_count || 0} (target infinito)</p>
                  <p className="text-[#00ffff]">Prossimo: €{currentPrice.toFixed(2)}</p>
                  <p className="text-xs text-green-400">✅ Sistema attivo 24/7 - Nessun limite giornaliero - ORDINE DIREZIONE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </motion.div>
  );
};

export default BuzzPage;
