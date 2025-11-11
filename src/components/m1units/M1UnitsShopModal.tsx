/**
 * M1 UNITS™ Shop Modal — Purchase M1U Packs
 * Modal per acquisto pacchetti M1U con pagamento Stripe
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShoppingCart, Sparkles, Zap, Crown, Gem, Star, X } from 'lucide-react';
import { useStripePayment } from '@/hooks/useStripePayment';
import { toast } from 'sonner';

interface M1UnitsShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface M1UPack {
  id: string;
  name: string;
  code: 'M1U_STARTER' | 'M1U_AGENT' | 'M1U_ELITE' | 'M1U_COMMANDER' | 'M1U_DIRECTOR' | 'M1U_MASTER';
  m1u_total: number;
  euro: number;
  savePct: number;
  icon: any;
  gradient: string;
}

const M1U_PACKS: M1UPack[] = [
  { 
    id: 'starter', 
    name: 'Starter Pack', 
    code: 'M1U_STARTER',
    m1u_total: 50, 
    euro: 4.99, 
    savePct: 0,
    icon: Sparkles,
    gradient: 'from-[#00D1FF]/20 to-[#A855F7]/20'
  },
  { 
    id: 'agent', 
    name: 'Agent Pack', 
    code: 'M1U_AGENT',
    m1u_total: 110, 
    euro: 9.99, 
    savePct: 9,
    icon: Zap,
    gradient: 'from-[#00D1FF]/25 to-[#A855F7]/25'
  },
  { 
    id: 'elite', 
    name: 'Elite Pack', 
    code: 'M1U_ELITE',
    m1u_total: 250, 
    euro: 19.99, 
    savePct: 20,
    icon: Star,
    gradient: 'from-[#00D1FF]/30 to-[#A855F7]/30'
  },
  { 
    id: 'commander', 
    name: 'Commander Pack', 
    code: 'M1U_COMMANDER',
    m1u_total: 550, 
    euro: 39.99, 
    savePct: 27,
    icon: Crown,
    gradient: 'from-[#00D1FF]/30 to-[#A855F7]/30'
  },
  { 
    id: 'director', 
    name: 'Director Pack', 
    code: 'M1U_DIRECTOR',
    m1u_total: 1200, 
    euro: 79.99, 
    savePct: 33,
    icon: Gem,
    gradient: 'from-[#00D1FF]/35 to-[#A855F7]/35'
  },
  { 
    id: 'mcp', 
    name: 'Master Control', 
    code: 'M1U_MASTER',
    m1u_total: 3000, 
    euro: 199.99, 
    savePct: 33,
    icon: Crown,
    gradient: 'from-[#00D1FF]/40 to-[#A855F7]/40'
  }
];

export const M1UnitsShopModal = ({ isOpen, onClose }: M1UnitsShopModalProps) => {
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const { processBuzzPurchase, loading } = useStripePayment();

  const handlePurchase = async (pack: M1UPack) => {
    setSelectedPack(pack.id);
    try {
      console.log(`[M1U SHOP] Starting purchase for ${pack.name}`, { 
        packCode: pack.code, 
        priceEUR: pack.euro,
        m1u: pack.m1u_total 
      });

      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible('checkout_start', { props: { pack: pack.id } });
      }

      const sessionId = `m1u_${pack.id}_${Date.now()}`;
      const redirectUrl = window.location.origin + '/home?m1u_success=true';
      
      console.log('[M1U SHOP] Importing m1uCheckout module...');
      const { startM1UCheckout } = await import('@/features/m1units/m1uCheckout');
      
      console.log('[M1U SHOP] Calling startM1UCheckout with:', {
        packCode: pack.code,
        redirectUrl,
        sessionId
      });
      
      const success = await startM1UCheckout(pack.code, {
        redirectUrl,
        sessionId,
        processBuzzPurchase
      });

      console.log('[M1U SHOP] startM1UCheckout result:', success);

      if (success) {
        toast.info('Apertura checkout Stripe per M1U...');
        onClose();
      } else {
        console.error('[M1U SHOP] Checkout returned false');
        toast.error("Pagamento non completato. Verifica i log per dettagli.");
      }
    } catch (error) {
      console.error('[M1U SHOP] Purchase error:', error);
      console.error('[M1U SHOP] Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('[M1U SHOP] Error message:', error instanceof Error ? error.message : String(error));
      
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error(`Errore: ${errorMsg}`);
    } finally {
      setSelectedPack(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-label="M1 UNITS Shop"
        className="sm:max-w-5xl w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto p-0 bg-transparent border-0"
      >
        {/* Neon glass container with continuous gradient border */}
        <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-[#00D1FF] via-[#7C3AED] to-[#00D1FF] shadow-[0_0_30px_rgba(124,58,237,0.35)]">
          <div className="rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10 p-6">
            {/* Close Button "X" - top-right, accessible 44x44 tap target */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/50"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <DialogHeader>
              <DialogTitle className="text-2xl font-orbitron text-center">
                <span className="bg-gradient-to-r from-[#00D1FF] to-[#7C3AED] bg-clip-text text-transparent">M1 UNITS™ SHOP</span>
              </DialogTitle>
              <DialogDescription className="text-center text-white/70">
                Acquista pacchetti M1U per sbloccare indizi e funzionalità premium
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-6">
              {M1U_PACKS.map((pack, index) => {
                const Icon = pack.icon;
                const isProcessing = selectedPack === pack.id && loading;
                return (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    <div className={`group relative h-full rounded-xl border border-white/10 bg-gradient-to-br ${pack.gradient} p-[1px] hover:border-white/20 transition-all`}>
                      <div className="rounded-xl bg-black/80 backdrop-blur-xl p-5 h-full">
                        {pack.savePct > 0 && (
                          <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold text-white bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]">
                            -{pack.savePct}%
                          </div>
                        )}

                        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-[#00D1FF] to-[#7C3AED] shadow-[0_10px_30px_rgba(124,58,237,0.35)]">
                          <Icon className="w-7 h-7 text-white" />
                        </div>

                        <h3 className="text-lg font-orbitron font-bold text-center text-white mb-2">{pack.name}</h3>

                        <div className="text-center mb-4">
                          <div className="text-3xl font-extrabold text-white mb-1">
                            {pack.m1u_total}
                            <span className="text-sm text-white/70 ml-1">M1U</span>
                          </div>
                          <div className="text-xl font-semibold text-[#FFD700]">€{pack.euro.toFixed(2)}</div>
                          {pack.savePct > 0 && (
                            <div className="text-xs text-emerald-400 mt-1">Risparmi {pack.savePct}%</div>
                          )}
                        </div>

                        <Button
                          onClick={() => handlePurchase(pack)}
                          disabled={loading || isProcessing}
                          className="w-full rounded-lg bg-gradient-to-r from-[#00D1FF] to-[#7C3AED] text-white font-semibold hover:opacity-90 transition-opacity"
                        >
                          {isProcessing ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Caricamento...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <ShoppingCart className="w-4 h-4" />
                              Acquista
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center text-xs text-white/50 mt-4 pb-2">Pagamento sicuro tramite Stripe • M1U non scadono mai</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
