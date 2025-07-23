// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, CreditCard, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StripeInAppCheckoutProps {
  config: {
    plan: string;
    amount: number;
    description: string;
  };
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

const StripeInAppCheckout: React.FC<StripeInAppCheckoutProps> = ({
  config,
  onSuccess,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: config.plan }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        // Simulate success after a delay (in real app, this would be handled by webhook)
        setTimeout(() => {
          onSuccess('simulated_payment_intent_' + Date.now());
        }, 3000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Errore durante il pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="bg-gradient-to-b from-gray-900 to-black border border-gray-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Checkout Sicuro</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Plan Details */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold">Piano {config.plan}</h4>
                  <p className="text-cyan-400 text-sm">{config.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    €{(config.amount / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">/mese</div>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
              <Lock className="w-4 h-4" />
              <span>Pagamento sicuro gestito da Stripe</span>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-bold py-3"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Elaborazione...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Procedi al Pagamento
                </div>
              )}
            </Button>

            {/* Cancel Button */}
            <Button
              variant="ghost"
              onClick={onCancel}
              className="w-full mt-3 text-gray-400 hover:text-white"
            >
              Annulla
            </Button>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StripeInAppCheckout;