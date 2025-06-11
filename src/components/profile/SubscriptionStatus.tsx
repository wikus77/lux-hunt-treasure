
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const planMap: Record<string, { label: string; badge: string }> = {
  Base: { label: "Base", badge: "Gratuito" },
  Silver: { label: "Silver", badge: "Silver" },
  Gold: { label: "Gold", badge: "Gold" },
  Black: { label: "Black", badge: "Black" },
};

const SubscriptionStatus = () => {
  const navigate = useNavigate();

  // Stato del piano attivo
  const [plan, setPlan] = useState<string>("Base");

  useEffect(() => {
    const saved = localStorage.getItem("subscription_plan");
    if (saved && planMap[saved]) {
      setPlan(saved);
    } else {
      setPlan("Base");
    }
  }, []);

  // Aggiorna lo stato dopo ogni pagamento completato
  useEffect(() => {
    const onStorage = () => {
      const saved = localStorage.getItem("subscription_plan");
      if (saved && planMap[saved]) {
        setPlan(saved);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Aggiungiamo anche un controllo periodico per catturare eventuali modifiche
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const saved = localStorage.getItem("subscription_plan");
      if (saved && planMap[saved] && saved !== plan) {
        setPlan(saved);
      }
    }, 2000); // Controlla ogni 2 secondi
    
    return () => clearInterval(checkInterval);
  }, [plan]);

  const handleUpgradeSubscription = () => {
    navigate('/subscriptions');
  };

  return (
    <div className="glass-card mb-4">
      <h3 className="text-lg font-bold mb-2">Stato Abbonamento</h3>
      <div className="mb-4 p-3 rounded-md bg-gradient-to-r from-projectx-blue to-projectx-neon-blue">
        <div className="flex justify-between items-center">
          <span className="font-bold">{planMap[plan]?.label || "Base"}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-black bg-opacity-30">
            {planMap[plan]?.badge || "Gratuito"}
          </span>
        </div>
      </div>

      <Button
        className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
        onClick={handleUpgradeSubscription}
      >
        Aggiorna Abbonamento
      </Button>
    </div>
  );
};

export default SubscriptionStatus;
