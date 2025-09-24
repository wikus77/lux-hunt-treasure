// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { getActiveSubscription } from '@/lib/subscriptions';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface AccessBlockedViewProps {
  subscriptionPlan: string;
  accessStartDate: Date | null;
  timeUntilAccess: number | null;
}

const AccessBlockedView: React.FC<AccessBlockedViewProps> = ({
  subscriptionPlan,
  accessStartDate,
  timeUntilAccess
}) => {
  const { navigate } = useWouterNavigation();
  const { getCurrentUser } = useUnifiedAuth();
  const [realPlanName, setRealPlanName] = useState<string>('Free');

  // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
  useEffect(() => {
    async function fetchRealPlan() {
      const user = getCurrentUser();
      if (user?.id) {
        // © 2025 Joseph MULÉ – M1SSION™ – Check for FREE override to bypass access block for wikus77@hotmail.it
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user?.email === 'wikus77@hotmail.it') {
          console.info('[FREE-OVERRIDE] Access block bypassed for wikus77@hotmail.it');
          return null; // Allow access
        }
        
        const result = await getActiveSubscription(supabase, user.id);
        const plan = result.plan || 'free';
        setRealPlanName(plan);
        
        // SBLOCCO FREE: reindirizza subito se piano = 'free'
        if (plan === 'free' && window.location.pathname !== '/choose-plan') {
          navigate('/home', { replace: true });
          return;
        }
      }
    }
    fetchRealPlan();
  }, [getCurrentUser, navigate]);

  const formatTimeRemaining = (milliseconds: number): string => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} giorni, ${hours} ore`;
    if (hours > 0) return `${hours} ore, ${minutes} minuti`;
    return `${minutes} minuti`;
  };

  const getPlanDisplayName = (plan: string): string => {
    switch (plan.toUpperCase()) {
      case 'SILVER': return 'Silver';
      case 'GOLD': return 'Gold';
      case 'BLACK': return 'Black';
      case 'TITANIUM': return 'Titanium';
      case 'FREE': return 'Free';
      default: return 'Free'; // NESSUN fallback a "Titanium" 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <motion.div 
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icona di blocco */}
        <motion.div
          className="mx-auto mb-6 w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Shield className="w-10 h-10 text-yellow-400" />
        </motion.div>

        {/* Titolo */}
        <h1 className="text-2xl font-bold text-white mb-4">
          ⛔ Accesso non ancora disponibile
        </h1>

        {/* Messaggio principale */}
        <p className="text-gray-300 mb-6">
          L'accesso alla missione non è ancora disponibile per il tuo piano <span className="font-semibold text-cyan-400">{getPlanDisplayName(realPlanName)}</span>.
        </p>

        {/* Countdown */}
        {timeUntilAccess && timeUntilAccess > 0 && accessStartDate && (
          <motion.div 
            className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-semibold">Accesso disponibile tra:</span>
            </div>
            <p className="text-xl font-mono text-white">
              {formatTimeRemaining(timeUntilAccess)}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Data di sblocco: {accessStartDate.toLocaleDateString('it-IT', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </motion.div>
        )}

        {/* Messaggio di notifica */}
        <motion.div 
          className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">Ti avviseremo!</span>
          </div>
          <p className="text-sm text-blue-300">
            Riceverai una notifica push e una email quando potrai iniziare la tua missione.
          </p>
        </motion.div>

        {/* Pulsanti azione */}
        <div className="space-y-3">
          {(realPlanName.toLowerCase() === 'base' || realPlanName.toLowerCase() === 'free') && (
            <Button
              onClick={() => {
                navigate('/choose-plan?from=access-blocked&current_plan=' + encodeURIComponent(realPlanName));
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              🚀 Aggiorna il tuo piano per accesso anticipato
            </Button>
          )}
          
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/home', { replace: true })}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 pointer-events-auto z-10"
              style={{ pointerEvents: 'auto' }}
            >
              ← Torna alla homepage
            </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessBlockedView;