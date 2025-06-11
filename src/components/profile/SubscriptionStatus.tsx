
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

const SubscriptionStatus = () => {
  const navigate = useNavigate();
  const { currentTier, weeklyAllowance, getRemainingBuzz, getCurrentTierInfo, loading } = useSubscription();

  const tierInfo = getCurrentTierInfo();
  const remainingBuzz = getRemainingBuzz();

  const handleUpgradeSubscription = () => {
    navigate('/subscriptions');
  };

  if (loading) {
    return (
      <div className="glass-card mb-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card mb-4">
      <h3 className="text-lg font-bold mb-2">Stato Abbonamento</h3>
      <div className="mb-4 p-3 rounded-md bg-gradient-to-r from-projectx-blue to-projectx-neon-blue">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold">{currentTier}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-black bg-opacity-30">
            {tierInfo?.price_monthly === 0 ? "Gratuito" : `€${tierInfo?.price_monthly}/mese`}
          </span>
        </div>
        
        {weeklyAllowance && (
          <div className="text-sm">
            <div className="flex justify-between">
              <span>BUZZ rimanenti questa settimana:</span>
              <span className="font-bold">{remainingBuzz}/{weeklyAllowance.max_buzz_count}</span>
            </div>
            <div className="w-full bg-black bg-opacity-30 rounded-full h-2 mt-1">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${(remainingBuzz / weeklyAllowance.max_buzz_count) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <Button
        className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
        onClick={handleUpgradeSubscription}
      >
        {currentTier === 'Free' ? 'Upgrade Abbonamento' : 'Gestisci Abbonamento'}
      </Button>
    </div>
  );
};

export default SubscriptionStatus;
