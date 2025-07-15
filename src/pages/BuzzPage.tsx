
// 🔧 FILE CREATO O MODIFICATO — BY JOSEPH MULE
import React from 'react';
import { motion } from 'framer-motion';
import { BuzzActionButton } from '@/components/buzz/BuzzActionButton';
import { BuzzInstructions } from '@/components/buzz/BuzzInstructions';
import { useBuzzStats } from '@/hooks/useBuzzStats';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';

export const BuzzPage: React.FC = () => {
  const { stats, loading, loadBuzzStats } = useBuzzStats();

  // Get current buzz price
  const getCurrentBuzzPrice = (dailyCount: number): number => {
    if (dailyCount <= 10) return 1.99;
    if (dailyCount <= 20) return 3.99;
    if (dailyCount <= 30) return 5.99;
    if (dailyCount <= 40) return 7.99;
    if (dailyCount <= 50) return 9.99;
    return 0; // Blocked
  };

  const currentPrice = getCurrentBuzzPrice(stats?.today_count || 0);
  const isBlocked = currentPrice === 0;

  const handleBuzzSuccess = async () => {
    // Force immediate stats reload - by Joseph Mulé - M1SSION™
    setTimeout(async () => {
      await loadBuzzStats();
      console.log('🔄 Stats aggiornate post-BUZZ');
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
      {/* 🔧 HEADER UNIFICATA — BY JOSEPH MULE */}
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
          {/* 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™ */}
          
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

            {/* Container con descrizione - Spostato sotto il pulsante */}
            <div className="m1ssion-glass-card p-4 sm:p-6 mb-6">
              <div className="text-center space-y-4">
                {/* Descrizione BUZZ nel container */}
                <div className="text-white/80 space-y-2">
                  <p>Premi il pulsante per inviare un segnale e scoprire nuovi indizi. Ogni Buzz ti aiuta a trovare indizi nascosti.</p>
                  <p className="font-semibold">BUZZ oggi: {stats?.today_count || 0}/50</p>
                  <p className="text-[#00ffff]">Prossimo: €{currentPrice.toFixed(2)}</p>
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
