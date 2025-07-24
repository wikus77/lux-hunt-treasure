
import { Button } from "@/components/ui/button";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import { useProfileSubscription } from "@/hooks/profile/useProfileSubscription";

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Unified Subscription Status - REAL-TIME SYNC

const planMap: Record<string, { label: string; badge: string }> = {
  Base: { label: "Base", badge: "Gratuito" },
  Silver: { label: "Silver", badge: "Silver" },
  Gold: { label: "Gold", badge: "Gold" },
  Black: { label: "Black", badge: "Black" },
  Titanium: { label: "Titanium", badge: "Titanium" }
};

const SubscriptionStatus = () => {
  const { navigate } = useWouterNavigation();
  
  // 🚨 CRITICAL FIX: Use SAME source as useProfileSubscription 
  const { subscription, refreshSubscription } = useProfileSubscription();
  
  console.log('📊 SubscriptionStatus RENDER:', {
    subscriptionPlan: subscription.plan,
    timestamp: new Date().toISOString()
  });

  const handleUpgradeSubscription = () => {
    navigate('/subscriptions');
  };

  const currentPlan = subscription.plan || "Base";

  return (
    <div className="glass-card mb-4">
      <h3 className="text-lg font-bold mb-2">Stato Abbonamento</h3>
      <div className="mb-4 p-3 rounded-md bg-gradient-to-r from-m1ssion-blue to-blue-600">
        <div className="flex justify-between items-center">
          <span className="font-bold">{planMap[currentPlan]?.label || "Base"}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-black bg-opacity-30">
            {planMap[currentPlan]?.badge || "Gratuito"}
          </span>
        </div>
      </div>

      <Button
        className="w-full bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink"
        onClick={handleUpgradeSubscription}
      >
        Aggiorna Abbonamento
      </Button>
    </div>
  );
};

export default SubscriptionStatus;
