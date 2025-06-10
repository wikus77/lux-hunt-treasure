
import React, { useEffect, useState } from 'react';
import { Lock, Crown, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { usePaymentVerification } from '@/hooks/usePaymentVerification';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PremiumPrizeAccessProps {
  prizeType: 'weekly' | 'special' | 'early_access';
  children: React.ReactNode;
  requiredTier?: 'Silver' | 'Gold' | 'Black';
}

const PremiumPrizeAccess: React.FC<PremiumPrizeAccessProps> = ({
  prizeType,
  children,
  requiredTier = 'Silver'
}) => {
  const navigate = useNavigate();
  const {
    hasValidPayment,
    canAccessPremium,
    subscriptionTier,
    loading,
    logUnauthorizedAccess
  } = usePaymentVerification();

  const [accessDenied, setAccessDenied] = useState(false);

  const tierLevels = { Free: 0, Silver: 1, Gold: 2, Black: 3 };
  const userTierLevel = tierLevels[subscriptionTier as keyof typeof tierLevels] || 0;
  const requiredTierLevel = tierLevels[requiredTier];

  const hasRequiredTier = userTierLevel >= requiredTierLevel;
  const canAccess = hasValidPayment && canAccessPremium && hasRequiredTier;

  useEffect(() => {
    if (!loading && !canAccess) {
      setAccessDenied(true);
      logUnauthorizedAccess(`blocked_${prizeType}_prize`, {
        subscriptionTier,
        requiredTier,
        hasValidPayment,
        canAccessPremium
      });
    }
  }, [loading, canAccess, prizeType, subscriptionTier, requiredTier, hasValidPayment, canAccessPremium, logUnauthorizedAccess]);

  const handleUpgradeClick = () => {
    toast.info('Upgrade Richiesto', {
      description: `Questa funzione richiede il piano ${requiredTier} o superiore.`,
      duration: 4000
    });
    navigate('/subscriptions');
  };

  if (loading) {
    return (
      <div className="m1ssion-box text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p>Verificando accesso ai premi...</p>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <motion.div 
        className="m1ssion-alert-error"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Lock className="w-16 h-16 text-red-400" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">!</span>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-bold text-red-300 mb-2">
              🚫 Accesso ai Premi Bloccato
            </h3>
            <p className="text-red-200 mb-4">
              {!hasValidPayment 
                ? 'Pagamento richiesto per accedere ai premi settimanali'
                : !hasRequiredTier 
                ? `Piano ${requiredTier} o superiore richiesto`
                : 'Abbonamento attivo necessario'
              }
            </p>
            
            <div className="m1ssion-box-small bg-red-800/30">
              <div className="flex items-center justify-between text-sm">
                <span>Piano Attuale:</span>
                <span className="font-bold">{subscriptionTier}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Piano Richiesto:</span>
                <span className="font-bold text-red-300">{requiredTier}+</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Pagamento Valido:</span>
                <span className={`font-bold ${hasValidPayment ? 'text-green-400' : 'text-red-400'}`}>
                  {hasValidPayment ? '✅' : '❌'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              onClick={handleUpgradeClick}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Piano
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Access granted - show content with premium indicator
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Premium access indicator */}
      <div className="absolute top-2 right-2 z-10 m1ssion-box-small bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-400/30 px-3 py-1 flex items-center gap-1">
        <Gift className="w-3 h-3 text-green-400" />
        <span className="text-xs font-bold text-green-300">Accesso Verificato</span>
      </div>
      
      {children}
    </motion.div>
  );
};

export default PremiumPrizeAccess;
