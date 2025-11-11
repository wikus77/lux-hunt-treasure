/**
 * M1 UNITS™ Shop Modal — Purchase M1U Packs
 * Modal per acquisto pacchetti M1U con pagamento Stripe
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShoppingCart, Sparkles, Zap, Crown, Gem, Star } from 'lucide-react';
import { useStripePayment } from '@/hooks/useStripePayment';
import { toast } from 'sonner';

interface M1UnitsShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface M1UPack {
  id: string;
  name: string;
  priceId: string;
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
    priceId: 'price_stripe_starter', 
    m1u_total: 50, 
    euro: 4.99, 
    savePct: 0,
    icon: Sparkles,
    gradient: 'from-gray-500 to-gray-600'
  },
  { 
    id: 'agent', 
    name: 'Agent Pack', 
    priceId: 'price_stripe_agent', 
    m1u_total: 110, 
    euro: 9.99, 
    savePct: 9,
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'elite', 
    name: 'Elite Pack', 
    priceId: 'price_stripe_elite', 
    m1u_total: 250, 
    euro: 19.99, 
    savePct: 20,
    icon: Star,
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    id: 'commander', 
    name: 'Commander Pack', 
    priceId: 'price_stripe_commander', 
    m1u_total: 550, 
    euro: 39.99, 
    savePct: 27,
    icon: Crown,
    gradient: 'from-amber-500 to-orange-500'
  },
  { 
    id: 'director', 
    name: 'Director Pack', 
    priceId: 'price_stripe_director', 
    m1u_total: 1200, 
    euro: 79.99, 
    savePct: 33,
    icon: Gem,
    gradient: 'from-emerald-500 to-teal-500'
  },
  { 
    id: 'mcp', 
    name: 'Master Control', 
    priceId: 'price_stripe_mcp', 
    m1u_total: 3000, 
    euro: 199.99, 
    savePct: 33,
    icon: Crown,
    gradient: 'from-violet-600 to-purple-700'
  }
];

export const M1UnitsShopModal = ({ isOpen, onClose }: M1UnitsShopModalProps) => {
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const { processBuzzPurchase, loading } = useStripePayment();

  const handlePurchase = async (pack: M1UPack) => {
    setSelectedPack(pack.id);
    
    try {
      // Track checkout start
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('checkout_start', { props: { pack: pack.id } });
      }

      // Use existing Stripe payment flow (same as BUZZ/BUZZ MAP)
      const priceInEuro = pack.euro;
      const success = await processBuzzPurchase(
        false, // not buzz map
        priceInEuro,
        window.location.origin + '/home?m1u_success=true',
        `m1u_${pack.id}_${Date.now()}`
      );

      if (success) {
        toast.info('Apertura checkout Stripe per M1U...');
        onClose();
      }
    } catch (error) {
      console.error('M1U Purchase error:', error);
      toast.error('Errore durante l\'acquisto M1U');
    } finally {
      setSelectedPack(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto bg-black/95 backdrop-blur-xl border border-[#FFD700]/30 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron text-center">
            <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
              M1 UNITS™ SHOP
            </span>
          </DialogTitle>
          <DialogDescription className="text-center text-white/70">
            Acquista pacchetti M1U per sbloccare indizi e funzionalità premium
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
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
                <div className={`
                  relative h-full p-5 rounded-xl
                  bg-gradient-to-br ${pack.gradient} bg-opacity-10
                  border border-white/10
                  hover:border-white/30 hover:shadow-xl
                  transition-all duration-300
                  ${isProcessing ? 'opacity-50' : ''}
                `}>
                  {/* Save Badge */}
                  {pack.savePct > 0 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{pack.savePct}%
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${pack.gradient} flex items-center justify-center mb-4 mx-auto`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Pack Info */}
                  <h3 className="text-lg font-orbitron font-bold text-center text-white mb-2">
                    {pack.name}
                  </h3>
                  
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-white mb-1">
                      {pack.m1u_total}
                      <span className="text-sm text-white/70 ml-1">M1U</span>
                    </div>
                    <div className="text-xl font-semibold text-[#FFD700]">
                      €{pack.euro.toFixed(2)}
                    </div>
                    {pack.savePct > 0 && (
                      <div className="text-xs text-green-400 mt-1">
                        Risparmi {pack.savePct}%
                      </div>
                    )}
                  </div>

                  {/* Purchase Button */}
                  <Button
                    onClick={() => handlePurchase(pack)}
                    disabled={loading || isProcessing}
                    className={`
                      w-full bg-gradient-to-r ${pack.gradient}
                      hover:opacity-90 transition-opacity
                      text-white font-semibold
                    `}
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
              </motion.div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="text-center text-xs text-white/50 mt-4 pb-2">
          Pagamento sicuro tramite Stripe • M1U non scadono mai
        </div>
      </DialogContent>
    </Dialog>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
