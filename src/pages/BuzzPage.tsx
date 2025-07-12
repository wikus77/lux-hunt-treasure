
// by Joseph Mulé – M1SSION™ – BUZZ_FIX_CRITICO: Refactored in componenti modulari
import React from 'react';
import { motion } from 'framer-motion';
import { BuzzActionButton } from '@/components/buzz/BuzzActionButton';
import { BuzzInstructions } from '@/components/buzz/BuzzInstructions';
import { useBuzzStats } from '@/hooks/useBuzzStats';

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
    <div 
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
      style={{
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
    >
      {/* ✅ fix by Lovable AI per Joseph Mulé – M1SSION™ */}
      {/* ✅ Compatibilità Capacitor iOS – testata */}
      
      {/* Main scrollable content */}
      <main
        style={{
          paddingTop: 'calc(40px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="container mx-auto px-4">
          {/* // fix by Lovable AI per Joseph Mulé – M1SSION™ */}
          {/* // Compatibile Capacitor iOS ✅ */}
          
          {/* Titolo BUZZ - Spostato fuori dal container */}
          <div className="text-center mt-6 mb-8">
            <h1 className="text-4xl font-orbitron font-bold">
              <span className="text-[#00ffff]">BU</span>
              <span className="text-white">ZZ</span>
            </h1>
          </div>

          {/* Container principale con descrizione */}
          <div className="max-w-3xl mx-auto">
            <div className="glass-card p-4 sm:p-6 mb-6">
              <div className="text-center space-y-4">
                {/* Descrizione BUZZ nel container */}
                <div className="text-white/80 space-y-2">
                  <p>Premi il pulsante per inviare un segnale e scoprire nuovi indizi. Ogni Buzz ti aiuta a trovare indizi nascosti.</p>
                  <p className="font-semibold">BUZZ oggi: {stats?.today_count || 0}/50</p>
                  <p className="text-[#00ffff]">Prossimo: €{currentPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Pulsante BUZZ - Fuori dal container */}
            <div className="text-center mb-6">
              <BuzzActionButton
                currentPrice={currentPrice}
                isBlocked={isBlocked}
                todayCount={stats?.today_count || 0}
                onSuccess={handleBuzzSuccess}
              />
            </div>
            
            {/* Istruzioni */}
            <BuzzInstructions
              stats={stats}
              isBlocked={isBlocked}
              getCurrentBuzzPrice={getCurrentBuzzPrice}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuzzPage;
